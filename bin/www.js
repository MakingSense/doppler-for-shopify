#!/usr/bin/env node
require('dotenv').config();
const chalk = require('chalk');
const app = require('../server');

const port = process.env.SHOPIFY_APP_PORT || '3000';
app.set('port', port);

const useHTTPS = (process.env.ENABLE_HTTPS == 'true');
let server = null;

if (useHTTPS) {
  const https = require('https');
  const fs = require('fs');
  const privateKey = fs.readFileSync(process.env.SSL_PRIVATE_KEY_PATH, 'utf8');
  const certificate = fs.readFileSync(process.env.SSL_CERTIFICATE_KEY_PATH, 'utf8');
  const credentials = { key: privateKey, cert: certificate };
  server =  https.createServer(credentials, app);
}
else {
  const http = require('http');
  server = http.createServer(app);
}

server.listen(port, err => {
  if (err) {
    return console.log('😫', chalk.red(err));
  }
  console.log(`🚀 Now listening on port ${chalk.green(port)}`);
});