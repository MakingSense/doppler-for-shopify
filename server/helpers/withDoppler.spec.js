const sinon = require('sinon');
const chai = require('chai');
const httpMocks = require('node-mocks-http');
const expect = chai.expect;
const withDoppler = require('./withDoppler');


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

  it('should fill dopplerData.tokenJwt when token has an JWT format', () => {
    // Arrange
    const middleware = withDoppler();
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
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
    expect(req.dopplerData).to.have.property('tokenJwt');
    expect(req.dopplerData).to.not.have.property('apiKey');
    expect(req.dopplerData.tokenJwt).to.equal(token);
  });
});