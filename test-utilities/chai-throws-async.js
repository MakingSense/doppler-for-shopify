const expect = require('chai').expect;

module.exports = async function(fn, expectedErrorMessage) {
    let thrown = false;
    try {
        await fn();
    } catch (error) {
        expect(error).to.be.instanceOf(Error);
        expect(expectedErrorMessage).to.be.eql(error.message);
        thrown = true;
    }
    if (!thrown)
        throw new Error(`Was expecting en error with message ${expectedErrorMessage} to be thrown but none exception has been thrown.`);
}