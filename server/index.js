require('dotenv').config();

const fetch = require('node-fetch');
const redis = require('redis');

const express = require('express');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const path = require('path');
const logger = require('morgan');

const webpack = require('webpack');
const webpackMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const config = require('../config/webpack.config.js');

const ShopifyExpress = require('@shopify/shopify-express');
const { RedisStrategy } = require('@shopify/shopify-express/strategies');

const shopifyClientFactory = require('./modules/shopify-extras');
const dopplerClientFactory = require('./modules/doppler-client')(fetch);
const redisClientFactory = require('./modules/redis-client')(redis);

const AppController = require('./controllers/app.controller');
const HooksController = require('./controllers/hooks.controller');
const DopplerController = require('./controllers/doppler.controller');

const addAppRoutes = require('./routes/app');
const addHooksRoutes = require('./routes/hooks');
const addDopplerRoutes = require('./routes/doppler');

const appController = new AppController(
  redisClientFactory,
  dopplerClientFactory,
  shopifyClientFactory.shopifyAPIClientFactory
);
const hooksController = new HooksController(
  redisClientFactory,
  dopplerClientFactory,
  shopifyClientFactory.shopifyAPIClientFactory
);
const dopplerController = new DopplerController(
  redisClientFactory,
  appController
);

const {
  SHOPIFY_APP_KEY,
  SHOPIFY_APP_HOST,
  SHOPIFY_APP_SECRET,
  NODE_ENV,
  REDIS_HOST,
  REDIS_PASSWORD,
  REDIS_PORT,
} = process.env;

const redisConfig = {
  host: REDIS_HOST,
  port: parseInt(REDIS_PORT),
  password: REDIS_PASSWORD,
};

const shopifyConfig = {
  host: SHOPIFY_APP_HOST,
  apiKey: SHOPIFY_APP_KEY,
  secret: SHOPIFY_APP_SECRET,

  // TODO: this should work with an array of string but it doesn't. Maybe a bug in the shopify module
  scope: 'read_content,read_products,read_orders,write_customers,write_marketing_events,write_script_tags,write_price_rules',
  shopStore: new RedisStrategy(redisConfig),
  afterAuth(req, res) {
    appController.afterAuth(req, res);
  },
};

const app = express();
const isDevelopment = NODE_ENV !== 'production' && NODE_ENV !== 'test';

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(
  session({
    store: RedisStore ? new RedisStore(redisConfig) : undefined,
    secret: SHOPIFY_APP_SECRET,
    resave: true,
    saveUninitialized: false,
    secure: true, 
    sameSite: 'none',
  })
);

// Run webpack hot reloading in dev
if (isDevelopment) {
  const compiler = webpack(config);
  const middleware = webpackMiddleware(compiler, {
    hot: true,
    inline: true,
    publicPath: config.output.publicPath,
    contentBase: 'src',
    stats: {
      colors: true,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: false,
      modules: false,
    },
  });

  app.use(middleware);
  app.use(webpackHotMiddleware(compiler));
} else {
  const staticPath = path.resolve(__dirname, '../assets');
  app.use('/assets', express.static(staticPath));
}

// Install
app.get('/install', (req, res) => res.render('install'));

// Create shopify middlewares and router
const shopify = ShopifyExpress(shopifyConfig);

// Mount Shopify Routes
const { routes, middleware } = shopify;
const { withShop, withWebhook } = middleware;

app.use('/shopify', routes);

// Mount App Routes
addAppRoutes(app, withShop, appController);

// Mount Webhooks Routes
addHooksRoutes(app, withWebhook, hooksController);

// Mount Doppler Routes
addDopplerRoutes(app, dopplerController);

// Error Handlers
app.get('/*', (req, res) => {
  res.redirect('/');
});

app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(error, request, response, next) {
  response.locals.message = error.message;
  response.locals.error = request.app.get('env') === 'development' ? error : {};

  response.status(error.status || 500);
  response.send(error.message);
});

module.exports = app;
