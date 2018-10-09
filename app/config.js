if (process.env.GITLAB_CI) {
    module.exports = require(`../config/profiles/test.ci.json`);
} else {
    module.exports = require(`../config/profiles/${process.env.NODE_ENV || 'production'}.json`);
}

module.exports = Object.assign({}, module.exports, require('../config/rights'));
