const jwt = require('jsonwebtoken');

const publicKey = `-----BEGIN PUBLIC KEY-----
MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBANcuJ2Ukhm7Dhd9ESISn9K31pFvmAZ0Z
kRLTqQ3a2CPtqM8mwqoH/EU79A0GZtFh+Qn1lrTnzeBw7dINP5yiQFECAwEAAQ==
-----END PUBLIC KEY-----`;

const defaultConfiguration = {
  publicKey,
  algorithm: ['RS256'],
};

module.exports = 
/**
 * Register Doppler middleware to read authorization information and fill dopplerData
 * @param { import('jsonwebtoken').VerifyOptions } configuration
 */
function withDoppler(configuration) {
  configuration = { ...defaultConfiguration, ...configuration};
  const { publicKey, ...jwtOptions } = configuration;

  return function(req, res, next) {
    const authorizationHeader = req.get("Authorization");

    if (typeof(authorizationHeader) === "undefined") {
      res.status(401).send('Missing `Authorization` header');
      return;
    }

    const token = authorizationHeader.substring(6);
    if (!token || authorizationHeader.substring(0,5) !== "token"){
      res.status(401).send('Invalid `Authorization` token format. It should be something like: `Authorization: token {DopplerApiKey/DopplerJwtToken}`.');
      return;
    }

    // TODO: Parse accountName from `/doppler/{accountName}/...` routes
    // and inject it in DopplerData.

    if (/^[ABCDEF\d]{32}$/i.test(token)) {
      // DOPPLER API KEY
      req.dopplerData = { apiKey: token };
      return next();
    } else if (/^ey[\w-]+\.ey[\w-]+\.[\w-]+$/.test(token)) {
      // JWT TOKEN
      return jwt.verify(token, configuration.publicKey, jwtOptions, (err, decoded) => {
        if (err) {
          res.status(401).send(`Invalid \`Authorization\` token. JWT Error: ${err.message}`);
          return;
        } else {
          // TODO: validate that decoded.sub matches accountName from the URL or isSuperUser
          req.dopplerData = { 
            tokenJwt: token,
            accountName: decoded.sub,
            isSuperUser: !!decoded.isSu,
          };
          return next();
        }
      });
    }
    
    res.status(401).send('Invalid `Authorization` token format. Expected a Doppler API Key or a Doppler JWT Token.');
  };
};
