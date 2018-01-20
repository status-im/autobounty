const SignerProvider = require('ethjs-provider-signer');
const sign = require('ethjs-signer').sign;
const Eth = require('ethjs-query');
const Prices = require('./prices');
const Config = require('../config');


const provider = new SignerProvider(Config.signerPath, {
  signTransaction: (rawTx, cb) => cb(null, sign(rawTx, process.env.KEY)),
  accounts: (cb) => cb(null, [address]),
});
const eth = new Eth(provider);


const labels = {
    
}

const needsFunding = function(req) {
    if (req.action !== 'created' || !req.hasOwnProperty('comment'))
        return false
    else if (req.comment.user.login !== 'status-open-bounty')
        return false

    return true
}

const getAddress = function(req) {
    commentBody = req.body.comment.body;
    return  commentBody.substring(commentBody.search("Contract address:") + 18, commentBody.search("Contract address:") + 60)
}

const getLabel = function(req){
    
}

const getAmount = function(req) {
    let tokenPricePromise = Prices.getTokenPrice(Config.token);

    let label = getLabel(req);
    let amountToPayDollar = config.priceHour * config.workHours[label];

    tokenPricePromise
    .then((tokenPrice) => {return tokenPrice * config.amountToPayInDollars} )
    .catch((err) => {console.log("TODO-ERROR: Failed token price request throw log error")});
    // Check how to handle errors when promises does not arrive

}

const getGasPrice = function(req) {
    let gasPricePromise = Prices.getGasPrice();

    gasPricePromise
    .then((gasPrice) => {return gasPrice})
    .catch((err) => {console.log("TODO-ERROR: Failed gas price request throw log error")});
    // Check how to handle errors when promises does not arrive
}

const log = function() {
    console.log(arguments);
}

module.exports = {
    eth: new Eth(provider),
    needsFunding: needsFunding,
    getAddress: getAddress,
    getAmount: getAmount,
    getGasPrice: getGasPrice,
    log: log
}
