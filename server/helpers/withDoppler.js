const jwt = require('jsonwebtoken');

const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA9DH53toQClwPYw5EjN8j
PUvbmQ9hoi8PxfY5e9bJzoi8mAuNaP2SmmEhP5jmhJYjwwqRRaQex0+HCOO1WG13
d6FMPCAKvV+rTnKfj59q3LyZ1uXkbk7sTp1m7aSXGAA9MPCuXjuoQNWCyqNFZtJZ
sRS8BnZMMVfxqKz8uYk6mqrx/cFid7pCz7dfkSFZr2YRSV3xFeVeXfcoPl05xKZO
3GEp82WRlVa3nlVrqGM1G9odjHLY8mI/jL95p+e+RUPO9aNGUp6RtGfo3vjedWdh
4/9VDZluqL9weqK/aNc6Z/QnCghuY9BpRnnu9PIbQ7aWT6iMEvYNydUDso7NeKRH
pQIDAQAB
-----END PUBLIC KEY-----`;

const oldPublicKey = `-----BEGIN PUBLIC KEY-----
MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBANcuJ2Ukhm7Dhd9ESISn9K31pFvmAZ0Z
kRLTqQ3a2CPtqM8mwqoH/EU79A0GZtFh+Qn1lrTnzeBw7dINP5yiQFECAwEAAQ==
-----END PUBLIC KEY-----`;

// It is here only for backwards compatibility for some time, 
// waiting for Doppler release with the new key. After that, directly 
// replace it by jwt.verify.
const verifyJwtWithOldPublicKeyFallback = (token, secretOrPublicKey, options, callback) =>
  jwt.verify(token, secretOrPublicKey, options, (err, decoded) => 
    err && err.name == 'JsonWebTokenError' ? jwt.verify(token, oldPublicKey, options, callback)
    : callback(err, decoded));

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
      return verifyJwtWithOldPublicKeyFallback(token, configuration.publicKey, jwtOptions, (err, decoded) => {
        if (err && err.name == 'TokenExpiredError' && err.expiredAt) {
          res.status(401).send(`Expired \`Authorization\` token. Expired at: ${err.expiredAt.toISOString()}. JWT Error: ${err.message}`);
          return;
        } else if (err) {
          res.status(401).send(`Invalid \`Authorization\` token. JWT Error: ${err.message}`);
          return;
        } else {
          // TODO: validate that decoded.sub matches accountName from the URL or isSuperUser
          req.dopplerData = { 
            tokenJwt: token,
            accountName: decoded.sub,
            isSuperUser: !!decoded.isSU,
          };
          return next();
        }
      });
    }
    
    res.status(401).send('Invalid `Authorization` token format. Expected a Doppler API Key or a Doppler JWT Token.');
  };
};
