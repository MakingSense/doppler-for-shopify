module.exports = function withDoppler() {
  return function(req, res, next) {
    const authorizationHeader = req.get("Authorization");

    if (typeof(authorizationHeader) === "undefined") {
      res.status(401).send('Missing `Authorization` header');
      return;
    }

    const token = authorizationHeader.substring(6);
    if (token === "" || authorizationHeader.substring(0,5) !== "token"){
      res.status(401).send('Invalid `Authorization` token format. It should be something like: `Authorization: token {DopplerApiKey/DopplerJwtToken}`.');
      return;
    }

    if (/^[ABCDEF\d]{32}$/i.test(token)) {
      // DOPPLER API KEY
      req.session.dopplerApiKey = token;
      return next();
    } 
    
    res.status(401).send('Invalid `Authorization` token format. Expected a Doppler API Key or a Doppler JWT Token.');
  };
};
