module.exports = function withDoppler() {
  return function(req, res, next) {
    const authorizationHeader = req.get("Authorization");

    if (typeof(authorizationHeader) === "undefined") {
      res.status(401).send('Missing `Authorization` header');
      return;
    }

    const token = authorizationHeader.substring(6);
    if (token === "" || authorizationHeader.substring(0,5) !== "token"){
      res.status(401).send('Invalid `Authorization` token format');
      return;
    }

    req.session.dopplerApiKey = token;

    return next();
  };
};
