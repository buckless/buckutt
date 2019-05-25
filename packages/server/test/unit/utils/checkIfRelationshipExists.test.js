const test = require('ava');
const checkIfRelationshipExists = require('server/app/utils/checkIfRelationshipExists');

class Model {
    constructor() {
        this.sub = () => ({ foo: 'bar' });
    }
}

test('checkIfRelationshipExists()', t => {
    t.is('bar', checkIfRelationshipExists(Model, 'sub').foo);
    t.throws(() => checkIfRelationshipExists(Model, 'foo'));
});
