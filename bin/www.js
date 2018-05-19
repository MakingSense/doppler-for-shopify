#!/usr/bin/env node
require('dotenv').config();
const chalk = require('chalk');
var fs = require('fs');
var http = require('http');
var https = require('https');
const app = require('../server');
const privateKey  = fs.readFileSync('./server/sslcert/server.key', 'utf8');
const certificate = fs.readFileSync('./server/sslcert/server.crt', 'utf8');
const credentials = {key: privateKey, cert: certificate};

const port = process.env.SHOPIFY_APP_PORT || '3000';
app.set('port', port);

const server =  http.createServer(app);
server.listen(port, err => {
  if (err) {
    return console.log('😫', chalk.red(err));
  }
  console.log(`🚀 Now listening on port ${chalk.green(port)}`);
});

// const httpsServer = https.createServer(credentials, app);

// httpsServer.listen(port, err => {
//   if (err) {
//     return console.log('😫', chalk.red(err));
//   }
//   console.log(`🚀 Now listening on port ${chalk.green(port)}`);
// });

