const buildProdLogger = require('./prod-logger');
const buildDevLogger = require ('./dev-logger');

let logger= null;
if (process.env.NODE_ENV === 'production') {
    logger = buildProdLogger();
} else {
    logger = buildDevLogger();
}

module.exports = logger;