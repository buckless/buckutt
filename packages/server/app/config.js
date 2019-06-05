if (process.env.GITLAB_CI) {
    module.exports = require(`../config/profiles/test.ci.json`);
} else if (process.env.NODE_ENV === 'test') {
    module.exports = require(`../config/profiles/test.json`);
} else {
    module.exports = require('config/server');
}
