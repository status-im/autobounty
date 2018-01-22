const winston = require('winston');
const prices = require('./prices');
const config = require('../config');
const github = require('./github');


const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: config.logPath + 'error.log', level: 'error' }),
    new winston.transports.File({ filename: config.logPath + 'info.log', level: 'info'}),
    new winston.transports.File({ filename: config.logPath + 'combined.log' })
  ]
});


const needsFunding = function(req) {
    if (req.body.action !== 'created' || !req.body.hasOwnProperty('comment'))
        return false
    //else if (req.comment.user.login !== 'status-open-bounty')
    //    return false

    return true
}

const getAddress = function(req) {
    let commentBody = req.body.comment.body;
    return  commentBody.substring(commentBody.search("Contract address:") + 18, commentBody.search("Contract address:") + 60)
}

const getLabel = function(req) {
    return github.getLabels(req).then(labels => {
            if (labels.length === 1) {
                return labels[0];
            } else {
                error(req.body, 'More than 1 label found: ['+ labels.length + ']');
                // reject(new Error('More than 1 label found: ['+ labels.length + ']'));
            }
        }).catch(err => {
            error(req.body, 'Could not get label' + err);
            // reject(new Error('Could not get label' + err));
    });
}

const getAmount = function(req) {
    return new Promise((resolve, reject) => {
        let labelPromise = getLabels(req);
        let tokenPricePromise = prices.getTokenPrice(config.token);

        Promise.all([labelPromise, tokenPricePromise])
        .then(function(values) {
            let label = values[0];
            let tokenPrice = values[1];
            let amountToPayDollar = config.priceHour * config.bountyLabels[label];
            console.log('Amount: ' + amountToPayDollar +', ' + tokenPrice);
            resolve(config.amountToPayDollar/tokenPrice);
        })
        .catch(err => {
            error(req.body, 'Failed to resolve label or token price: ' + err);
            reject(new Error('Failed to resolve label or token price: ' + err));
        });
    });
}

const getGasPrice = function(req) {
    let gasPricePromise = prices.getGasPrice();
    return gasPricePromise;
}

// Logging functions

const logTransaction = function(txId, from, to, amount, gasPrice){
    logger.info("[OK] Succesfully funded bounty with transaction " + txId);
    logger.info(" * From: " + from);
    logger.info(" * To: " + to);
    logger.info(" * Amount: " + amount);
    logger.info(" * Gas Price: " +  gasPrice);
    logger.info("====================================================");
}

const log = function(msg) {
    logger.info(msg);
}

const error = function(requestInfo, errorMessage) {
    logger.error("[ERROR] Request processing failed: " + errorMessage);
    logger.error("[ERROR] Request: " + requestInfo);
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
