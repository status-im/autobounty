const winston = require('winston');
const SignerProvider = require('ethjs-provider-signer');
const sign = require('ethjs-signer').sign;
const Eth = require('ethjs-query');
const prices = require('./prices');
const config = require('../config');

const provider = new SignerProvider(config.signerPath, {
  signTransaction: (rawTx, cb) => cb(null, sign(rawTx, process.env.KEY)),
  accounts: (cb) => cb(null, [address]),
});
const eth = new Eth(provider);

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'info.log', level: 'info'}),
    new winston.transports.File({ filename: 'combined.log' })
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
    return github.getLabels(req)
            .then(labels => {
                if (labels.length === 1) {
                    resolve(labels[0]);
                } else {
                    // TODO: Handle error
                }
            }).catch(err => {
                // TODO: Handle error
            });
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

const log = function(msg) {
    logger.info(msg);
}

module.exports = {
    eth: new Eth(provider),
    needsFunding: needsFunding,
    getAddress: getAddress,
    getAmount: getAmount,
    getGasPrice: prices.getGasPrice,
    log: log
}
