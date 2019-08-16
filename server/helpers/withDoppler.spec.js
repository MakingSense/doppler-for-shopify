const sinon = require('sinon');
const chai = require('chai');
const httpMocks = require('node-mocks-http');
const expect = chai.expect;
const withDoppler = require('./withDoppler');

// https://jwt.io/#debugger-io?token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc1N1IjpmYWxzZSwic3ViIjoicGlydWxvQGFhYS5jb20iLCJjdXN0b21lcklkIjoiNTU1IiwiZGF0YWh1YkN1c3RvbWVySWQiOiI1NTUiLCJpYXQiOjE1NTczMjY5NTYsImV4cCI6MTU1NzMyODc1Nn0.LO_7WY2YJpSGP0kIdvtLaDzTHhHLj66cL34zBCE_D-AaVTBLXRCqK-swaYtgGDQIzb-bDt-FKl4ipDJTXKaG47Yno6n-IhPQivlpaEGrnRPNsfbR4j6uTtVUwJ9d1r6YPjOWLensrEX0J0MH0pCt-_NayCpWhn_PUhJCWfIYJXzr4veoFruwVBAqtKflICp7zjcMb7suYDNZ9lOlzSz2FYBqfQNUKK3hhUl9voL819dqdQNCApIgDlv7Y5-hJEyLWdQPCzIOmCbPacQUQkmGKYGlbUVC2nkruuMoZYr5Bdi7KdZ1oIzjXXHp6CnuF_MaOvqMNaC014-tVRv7cOTM-Q
const validJwtToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc1N1IjpmYWxzZSwic3ViIjoicGlydWxvQGFhYS5jb20iLCJjdXN0b21lcklkIjoiNTU1IiwiZGF0YWh1YkN1c3RvbWVySWQiOiI1NTUiLCJpYXQiOjE1NTczMjY5NTYsImV4cCI6MTU1NzMyODc1Nn0.LO_7WY2YJpSGP0kIdvtLaDzTHhHLj66cL34zBCE_D-AaVTBLXRCqK-swaYtgGDQIzb-bDt-FKl4ipDJTXKaG47Yno6n-IhPQivlpaEGrnRPNsfbR4j6uTtVUwJ9d1r6YPjOWLensrEX0J0MH0pCt-_NayCpWhn_PUhJCWfIYJXzr4veoFruwVBAqtKflICp7zjcMb7suYDNZ9lOlzSz2FYBqfQNUKK3hhUl9voL819dqdQNCApIgDlv7Y5-hJEyLWdQPCzIOmCbPacQUQkmGKYGlbUVC2nkruuMoZYr5Bdi7KdZ1oIzjXXHp6CnuF_MaOvqMNaC014-tVRv7cOTM-Q';

// https://jwt.io/#debugger-io?token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc1N1IjpmYWxzZSwic3ViIjoiYW1vc2NoaW5pQG1ha2luZ3NlbnNlLmNvbSIsImN1c3RvbWVySWQiOiIxMzY3IiwiZGF0YWh1YkN1c3RvbWVySWQiOiIxMzY3IiwiaWF0IjoxNTYyOTQ0Mjc0LCJleHAiOjE1NjI5NDYwNzR9.UCPZT4AS3DvPl91XhU8adc5Zb7oUdN0mxQyIy4N78LZYcNSSGmoIGfbmXXgRZ0M6KGRUnCgnSOAqW6uaBFn9kQ
const validOldJwtToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc1N1IjpmYWxzZSwic3ViIjoiYW1vc2NoaW5pQG1ha2luZ3NlbnNlLmNvbSIsImN1c3RvbWVySWQiOiIxMzY3IiwiZGF0YWh1YkN1c3RvbWVySWQiOiIxMzY3IiwiaWF0IjoxNTYyOTQ0Mjc0LCJleHAiOjE1NjI5NDYwNzR9.UCPZT4AS3DvPl91XhU8adc5Zb7oUdN0mxQyIy4N78LZYcNSSGmoIGfbmXXgRZ0M6KGRUnCgnSOAqW6uaBFn9kQ';


describe('withDoppler middleware', () => {
  it('should return 401 error when there is not an authorization header', () => {
    // Arrange
    const middleware = withDoppler();
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
    var next = sinon.spy();
    
    // Act
    middleware(req, res, next);

    // Assert
    expect(res.statusCode).to.be.equal(401);
    expect(res._getData()).to.be.equal('Missing `Authorization` header');
    expect(next.notCalled).to.be.true;
  });

  it('should return 401 error when there is an authorization header without `token`', () => {
    // Arrange
    const middleware = withDoppler();
    const req = httpMocks.createRequest({ 
      headers: {
        Authorization: 'bearer AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' 
      }
    });
    const res = httpMocks.createResponse();
    var next = sinon.spy();
    
    // Act
    middleware(req, res, next);

    // Assert
    expect(res.statusCode).to.be.equal(401);
    expect(res._getData()).to.be.equal(
      'Invalid `Authorization` token format. It should be something like: `Authorization: token {DopplerApiKey/DopplerJwtToken}`.');
    expect(next.notCalled).to.be.true;
  });

  it('should return 401 error when there is an authorization with `token` with an unexpected format', () => {
    // Arrange
    const middleware = withDoppler();
    const req = httpMocks.createRequest({ 
      headers: {
        Authorization: 'token 0123456789ABCDEF'
      }
    });
    const res = httpMocks.createResponse();
    var next = sinon.spy();
    
    // Act
    middleware(req, res, next);

    // Assert
    expect(res.statusCode).to.be.equal(401);
    expect(res._getData()).to.be.equal(
      'Invalid `Authorization` token format. Expected a Doppler API Key or a Doppler JWT Token.');
    expect(next.notCalled).to.be.true;
  });

  it('should fill dopplerData.apiKey when token has an APIKEY format', () => {
    // Arrange
    const middleware = withDoppler();
    const token = '0123456789ABCDEF0123456789ABCDEF';
    const req = httpMocks.createRequest({ 
      headers: {
        Authorization: `token ${token}`
      }
    });
    const res = httpMocks.createResponse();
    var next = sinon.spy();
    
    // Act
    middleware(req, res, next);

    // Assert
    expect(next.calledOnce).to.be.true;
    expect(req).to.have.property('dopplerData');
    expect(req.dopplerData).to.have.property('apiKey');
    expect(req.dopplerData).to.not.have.property('tokenJwt');
    expect(req.dopplerData.apiKey).to.equal(token);
  });

  it('should return 401 error when JWT token is expired', () => {
    // Arrange
    const middleware = withDoppler();
 
    const req = httpMocks.createRequest({ 
      headers: {
        Authorization: `token ${validJwtToken}`
      }
    });
    const res = httpMocks.createResponse();
    var next = sinon.spy();
    
    // Act
    middleware(req, res, next);

    // Assert
    expect(res.statusCode).to.be.equal(401);
    expect(res._getData()).to.be.equal(
      'Expired `Authorization` token. Expired at: 2019-05-08T15:19:16.000Z. JWT Error: jwt expired');
    expect(next.notCalled).to.be.true;
  });

  it('should return 401 error when Old JWT token is expired', () => {
    // Arrange
    const middleware = withDoppler();
 
    const req = httpMocks.createRequest({ 
      headers: {
        Authorization: `token ${validOldJwtToken}`
      }
    });
    const res = httpMocks.createResponse();
    var next = sinon.spy();
    
    // Act
    middleware(req, res, next);

    // Assert
    expect(res.statusCode).to.be.equal(401);
    expect(res._getData()).to.be.equal(
      'Expired `Authorization` token. Expired at: 2019-07-12T15:41:14.000Z. JWT Error: jwt expired');
    expect(next.notCalled).to.be.true;
  });

  it('should fill dopplerData.tokenJwt when token has a valid JWT format', () => {
    // Arrange
    const middleware = withDoppler({ ignoreExpiration: true });

    const req = httpMocks.createRequest({ 
      headers: {
        Authorization: `token ${validJwtToken}`
      }
    });
    const res = httpMocks.createResponse();
    var next = sinon.spy();
    
    // Act
    middleware(req, res, next);

    // Assert
    expect(next.calledOnce).to.be.true;
    expect(req).to.have.property('dopplerData');
    expect(req.dopplerData).to.have.property('tokenJwt');
    expect(req.dopplerData).to.not.have.property('apiKey');
    expect(req.dopplerData.tokenJwt).to.equal(validJwtToken);
    expect(req.dopplerData.isSuperUser).to.be.false;
    expect(req.dopplerData.accountName).to.equal('pirulo@aaa.com');
    expect(res.statusCode).to.be.equal(200);
  });

  it('should fill dopplerData.tokenJwt when Old token has a valid JWT format', () => {
    // Arrange
    const middleware = withDoppler({ ignoreExpiration: true });

    const req = httpMocks.createRequest({ 
      headers: {
        Authorization: `token ${validOldJwtToken}`
      }
    });
    const res = httpMocks.createResponse();
    var next = sinon.spy();
    
    // Act
    middleware(req, res, next);

    // Assert
    expect(next.calledOnce).to.be.true;
    expect(req).to.have.property('dopplerData');
    expect(req.dopplerData).to.have.property('tokenJwt');
    expect(req.dopplerData).to.not.have.property('apiKey');
    expect(req.dopplerData.tokenJwt).to.equal(validOldJwtToken);
    expect(req.dopplerData.isSuperUser).to.be.false;
    expect(req.dopplerData.accountName).to.equal('amoschini@makingsense.com');
    expect(res.statusCode).to.be.equal(200);
  });
});