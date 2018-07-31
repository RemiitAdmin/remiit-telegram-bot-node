
global.__base_dir = process.env.PWD;
console.log(global.__base_dir);
const fs = require('fs');
const tokenJson = JSON.parse(fs.readFileSync(__base_dir + '/config/token.json', 'utf8'));
const token = tokenJson['token'];

var assert = require('assert');
describe('Token', function () {
    describe('#isExist()', function () {
        it('token value is necessary to run this application', function () {
            assert.equal(token.length > 0 , true);
        });
    });
});
