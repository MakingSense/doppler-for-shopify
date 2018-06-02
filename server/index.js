require('isomorphic-fetch');
require('dotenv').config();

const fetch = require('node-fetch');
const redis = require('redis');
const fs = require('fs');

const express = require('express');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');

const webpack = require('webpack');
const webpackMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const config = require('../config/webpack.config.js');

const ShopifyExpress = require('@shopify/shopify-express');
const { RedisStrategy } = require('@shopify/shopify-express/strategies');

const shopifyClientFactory = require('./modules/shopify-extras');
const dopplerClientFactory = require('./modules/doppler-client')(fetch);
const redisClientFactory = require('./modules/redis-client')(redis);
const AppRoutes = require('./routes/app-routes');
const HooksRoutes = require('./routes/hooks-routes');

const {
  SHOPIFY_APP_KEY,
  SHOPIFY_APP_HOST,
  SHOPIFY_APP_SECRET,
  NODE_ENV,
  REDIS_HOST,
  REDIS_PASSWORD,
  REDIS_PORT  
} = process.env;

const redisConfig = {
  host: REDIS_HOST,
  port: parseInt(REDIS_PORT),
  password: REDIS_PASSWORD
};

const shopifyConfig = {
  host: SHOPIFY_APP_HOST,
  apiKey: SHOPIFY_APP_KEY,
  secret: SHOPIFY_APP_SECRET,
  scope: ['read_customers', 'write_customers'],
  shopStore: new RedisStrategy(redisConfig),
  afterAuth(request, response) { // TODO: move this to a controller
    const { session: { accessToken, shop } } = request;

    const shopifyClient = shopifyClientFactory.shopifyAPIClientFactory.createClient(shop, accessToken);

    shopifyClient.webhook.create({
      topic: 'app/uninstalled',
      address: `${SHOPIFY_APP_HOST}/hooks/app/uninstalled`,
      format: 'json'
    })
    .then(() => {})
    .catch(err => console.error(err));
    
    shopifyClient.webhook.create({
      topic: 'customers/create',
      address: `${process.env.SHOPIFY_APP_HOST}/hooks/customers/created`,
      format: 'json'
    })
    .then(() => {})
    .catch(err => console.error(err));

    response.redirect('/');
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
const {routes, middleware} = shopify;
const {withShop, withWebhook} = middleware;

app.use('/shopify', routes);

// App routes
const appRoutes = new AppRoutes(redisClientFactory, dopplerClientFactory, shopifyClientFactory.shopifyAPIClientFactory);

function wrapAsync(fn) {
  return function(req, res, next) {
    // Make sure to `.catch()` any errors and pass them along to the `next()`
    // middleware in the chain, in this case the error handler.
    fn(req, res, next).catch(next);
  };
}

app.get('/', 
  withShop({authBaseUrl: '/shopify'}),
  wrapAsync((req, res) => appRoutes.home(req, res)));

app.post('/connect-to-doppler', 
  withShop({authBaseUrl: '/shopify'}), 
  bodyParser.json(),
  wrapAsync((req, res) => appRoutes.connectToDoppler(req, res)));

app.get('/doppler-lists', 
  withShop({authBaseUrl: '/shopify'}),
  wrapAsync((req, res) => appRoutes.getDopplerLists(req, res)));

app.post('/create-doppler-list', 
  withShop({authBaseUrl: '/shopify'}), 
  bodyParser.json(),
  wrapAsync((req, res) => appRoutes.createDopplerList(req, res)));

app.post('/doppler-list', 
  withShop({authBaseUrl: '/shopify'}), 
  bodyParser.json(),
  wrapAsync((req, res) => appRoutes.setDopplerList(req, res)));

app.get('/fields', 
  withShop({authBaseUrl: '/shopify'}), 
  wrapAsync((req, res) => appRoutes.getFields(req, res)));

app.post('/fields-mapping', 
  withShop({authBaseUrl: '/shopify'}), 
  bodyParser.json(),
  wrapAsync((req, res) => appRoutes.setFieldsMapping(req, res)));

app.post('/synchronize-customers', 
  withShop({authBaseUrl: '/shopify'}), 
  wrapAsync((req, res) => appRoutes.synchronizeCustomers(req, res)));

// Hooks routes
const hooksRoutes = new HooksRoutes(redisClientFactory, dopplerClientFactory, shopifyClientFactory.shopifyAPIClientFactory);

app.post('/hooks/app/uninstalled', withWebhook(async (error, request) => {
    await hooksRoutes.appUninstalled(error, request);
}));

app.post('/hooks/customers/created', withWebhook(async (error, request) => {
  await hooksRoutes.customerCreated(error, request);
}));

app.post('/hooks/doppler-import-completed', 
  wrapAsync((req, res) => hooksRoutes.dopplerImportTaskCompleted(req, res)));

app.get('/*', (req, res) => {
  res.redirect('/');
});

// Error Handlers
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
