const winston = require('winston');
const signerProvider = require('ethjs-provider-signer');
const sign = require('ethjs-signer').sign;
const eth = require('ethjs-query');
const prices = require('./prices');
const config = require('../config');

const provider = new signerProvider(config.signerPath, {
  signTransaction: (rawTx, cb) => cb(null, sign(rawTx, process.env.KEY)),
  accounts: (cb) => cb(null, [address]),
});
const eth = new eth(provider);

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: config.logPath + 'error.log', level: 'error' }),
    new winston.transports.File({ filename: config.logPath + 'info.log', level: 'info'}),
    new winston.transports.File({ filename: config.logPath + 'combined.log' })
  ]
});

const bountyLabels = {
    'bounty-xs': 1,
    'bounty-s': 10,
    'bounty-m': 100,
    'bounty-l': 1000,
    'bounty-xl': 10000,
    'bounty-xx': 100000
};

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
    let labelNames = req.body.issue.labels.map(labelObj => labelObj.name);

    labels = labelNames.filter(name => bountyLabels.hasOwnProperty(name));

    if (labels.length == 1)
        return labels[0];

    //log error
    return 0;
}

const getAmount = function(req) {
    let tokenPricePromise = prices.getTokenPrice(config.token);

    let label = getLabel(req);
    let amountToPayDollar = config.priceHour * config.workHours[label];

    tokenPricePromise
    .then((tokenPrice) => {return tokenPrice * config.amountToPayInDollars} )
    .catch((err) => {console.log("TODO-ERROR: Failed token price request throw log error")});
    // Check how to handle errors when promises does not arrive

}

const getGasPrice = function(req) {
    let gasPricePromise = prices.getGasPrice();
    return gasPricePromise;
}

// Logging functions

const logFunding = function(txId, from, to, amount, gasPrice){
    logger.info("\nSuccesfully funded bounty with transaction ", txId);
    logger.info(" * From: ", from);
    logger.info(" * To: ", to);
    logger.info(" * Amount: ", amount);
    logger.info(" * Gas Price: ", gasPrice);
    logger.info("====================================================");
}

const log = function(msg) {
    logger.info(msg);
}

const error = function(requestBody, errorMessage) {
    logger.error("[ERROR] Request processing failed: ", errorMessage);
    logger.error("[ERROR] Request body: ", requestBody);
}


module.exports = {
    eth: new eth(provider),
    needsFunding: needsFunding,
    getAddress: getAddress,
    getAmount: getAmount,
    getGasPrice: getGasPrice,
    log: log
}
