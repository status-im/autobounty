const winston = require('winston');
const prices = require('./prices');
const config = require('../config');
const github = require('./github');


const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: config.logPath + 'error.log', level: 'error' }),
        new winston.transports.File({ filename: config.logPath + 'info.log', level: 'info' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});


const needsFunding = function (req) {
    if (req.body.action !== 'created' || !req.body.hasOwnProperty('comment')) {
        return false
    } else if (req.body.comment.user.login !== config.githubUsername) {
        return false
    } else if (!hasAddress(req)) {
        return false;
    }
    return true
}

const hasAddress = function (req) {
    let commentBody = req.body.comment.body;
    if (commentBody.search('Contract address:') === -1) {
        return false;
    } else {
        return true;
    }
}

const getAddress = function (req) {
    let commentBody = req.body.comment.body;
    return commentBody.substring(commentBody.search("Contract address:") + 18, commentBody.search("Contract address:") + 60)
}

const getLabelMock = function (req) {
    return new Promise((resolve, reject) => {
        github.getLabels(req)
            .then(labels => {
                let bountyLabels = labels.filter(name => config.bountyLabels.hasOwnProperty(name));
                if (bountyLabels.length === 1) {
                    resolve(bountyLabels[0]);
                } else {
                    reject('Error getting bounty labels: ' + bountyLabels);
                }
            })
            .catch((err) => {
                reject(err)
            });
    });
}

const getLabel = function (req) {
    if (config.debug) {
        return getLabelMock(req);
    }
    return new Promise((resolve, reject) => {
        github.getLabels(req)
            .then(labels => {
                let bountyLabels = labels.filter(name => config.bountyLabels.hasOwnProperty(name));
                if (bountyLabels.length === 1) {
                    resolve(bountyLabels[0]);
                } else {
                    reject('Error getting bounty labels');
                }
            }).catch(err => {
                reject(err);
            });
    });
}

const getAmountMock = function (req) {
    return new Promise((resolve, reject) => {
        resolve(10);
    });

}

const getAmount = function (req) {
    return new Promise((resolve, reject) => {
        let labelPromise = getLabel(req);
        let tokenPricePromise = prices.getTokenPrice(config.token);

        Promise.all([labelPromise, tokenPricePromise])
            .then(function (values) {
                let label = values[0];
                let tokenPrice = values[1];
                let amountToPayDollar = config.priceHour * config.bountyLabels[label];
                resolve(amountToPayDollar / tokenPrice);
            })
            .catch((err) => {
                reject(err);
            });
    });
}


// Logging functions

const logTransaction = function (txId, from, to, amount, gasPrice) {
    logger.info("[OK] Succesfully funded bounty with transaction " + txId);
    logger.info(" * From: " + from);
    logger.info(" * To: " + to);
    logger.info(" * Amount: " + amount);
    logger.info(" * Gas Price: " + gasPrice);
    logger.info("====================================================");
}

const log = function (msg) {
    logger.info(msg);
}

const error = function (errorMessage) {
    logger.error("[ERROR] Request processing failed: " + errorMessage);
}


module.exports = {
    needsFunding: needsFunding,
    getAddress: getAddress,
    getAmount: getAmount,
    getGasPrice: prices.getGasPrice,
    log: log,
    logTransaction: logTransaction,
    error: error
}
