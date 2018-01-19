const SignerProvider = require('ethjs-provider-signer');
const sign = require('ethjs-signer').sign;
const Eth = require('ethjs-query');

const provider = new SignerProvider(process.env.NODE, {
  signTransaction: (rawTx, cb) => cb(null, sign(rawTx, process.env.KEY)),
  accounts: (cb) => cb(null, [address]),
});
const eth = new Eth(provider);


const needsFunding = function(req) {
    if (req.action !== 'created' || !req.hasOwnProperty('comment')) 
        return false
    else if (req.comment.user.login !== 'status-open-bounty')
        return false
        
    return true
}

const getAddress = function(commentBody) {
    //TODO: check possible errors
    commentBody.substring(commentBody.search("Contract address:") + 18, commentBody.search("Contract address:") + 60)
}

const getAmount = function(req) {
    return 0;
}

const log = function() {
    //TODO: Log into a file by default
    console.log(arguments);
}

module.exports = {
    webhook: {URLEndpoint: "/autobounty/fund"},
    eth: new Eth(provider),
    needsFunding: needsFunding,
    getAddress: getAddress,
    getAmount: getAmount,
    log: log
}
