const sinon = require('sinon');
const chai = require('chai');
const httpMocks = require('node-mocks-http');
const expect = chai.expect;
const withDoppler = require('./withDoppler');

// https://jwt.io/#debugger-io?token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc1N1IjpmYWxzZSwic3ViIjoiYW1vc2NoaW5pQG1ha2luZ3NlbnNlLmNvbSIsImN1c3RvbWVySWQiOiIxMzY3IiwiZGF0YWh1YkN1c3RvbWVySWQiOiIxMzY3IiwiaWF0IjoxNTYyOTQ0Mjc0LCJleHAiOjE1NjI5NDYwNzR9.UCPZT4AS3DvPl91XhU8adc5Zb7oUdN0mxQyIy4N78LZYcNSSGmoIGfbmXXgRZ0M6KGRUnCgnSOAqW6uaBFn9kQ
const validJwtToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc1N1IjpmYWxzZSwic3ViIjoiYW1vc2NoaW5pQG1ha2luZ3NlbnNlLmNvbSIsImN1c3RvbWVySWQiOiIxMzY3IiwiZGF0YWh1YkN1c3RvbWVySWQiOiIxMzY3IiwiaWF0IjoxNTYyOTQ0Mjc0LCJleHAiOjE1NjI5NDYwNzR9.UCPZT4AS3DvPl91XhU8adc5Zb7oUdN0mxQyIy4N78LZYcNSSGmoIGfbmXXgRZ0M6KGRUnCgnSOAqW6uaBFn9kQ';

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
      'Invalid `Authorization` token. JWT Error: jwt expired');
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
    expect(req.dopplerData.accountName).to.equal('amoschini@makingsense.com');
  });
});