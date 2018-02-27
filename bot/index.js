const winston = require('winston');

const ethers = require('ethers');
const Wallet = ethers.Wallet;
const providers = ethers.providers;

const prices = require('./prices');
const config = require('../config');
const github = require('./github');


const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: './log/error.log', level: 'error' }),
        new winston.transports.File({ filename: './log/info.log', level: 'info' }),
        // new winston.transports.File({ filename: './log/combined.log' })
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
    const commentBody = req.body.comment.body;
    if (commentBody.search('Contract address:') === -1) {
        return false;
    } else {
        return true;
    }
}

const getAddress = function (req) {
    const commentBody = req.body.comment.body;
    return commentBody.substring(commentBody.search("Contract address:") + 18, commentBody.search("Contract address:") + 60)
}

const getLabelMock = function (req) {
    return new Promise((resolve, reject) => {
        github.getLabels(req)
            .then(labels => {
                const bountyLabels = labels.filter(name => config.bountyLabels.hasOwnProperty(name));
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
                const bountyLabels = labels.filter(name => config.bountyLabels.hasOwnProperty(name));
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
        const labelPromise = getLabel(req);
        const tokenPricePromise = prices.getTokenPrice(config.token);

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

const logTransaction = function (tx) {
    logger.info("[OK] Succesfully funded bounty with transaction " + tx.hash);
    logger.info(" * From: " + tx.from);
    logger.info(" * To: " + to);
    logger.info(" * Amount: " + amount);
    logger.info(" * Gas Price: " + tx.gasPrice);
    logger.info("====================================================");
}

const info = function (msg) {
    logger.info(msg);
}

const error = function (errorMessage) {
    logger.error("[ERROR] Request processing failed: " + errorMessage);
}




const sendTransaction = function (to, amount, gasPrice) {

    console.log("Creating wallet with PK: ", config.privateKey);
    const wallet = new Wallet(config.privateKey);
    wallet.provider = ethers.providers.getDefaultProvider('ropsten');


    const transaction = {
        nonce: 0,
        gasLimit: config.gasLimit,
        gasPrice: gasPrice,
        to: to,
        value: amount,
        // data: "0x",
        // This ensures the transaction cannot be replayed on different networks
        chainId: 3 // ropsten
    };

    const signedTransaction = wallet.sign(transaction);

    return new Promise((resolve, reject) => {
        wallet.sendTransaction(signedTransaction)
            .then(function(hash) {
                logTransaction(hash, config.sourceAddress, to, amount, gasPrice);
                resolve(hash);
            }).catch(function(err) {
                reject(err);
            });
    });
}


module.exports = {
    needsFunding: needsFunding,
    getAddress: getAddress,
    getAmount: getAmount,
    getGasPrice: prices.getGasPrice,
    sendTransaction: sendTransaction,
    info: info,
    logTransaction: logTransaction,
    error: error
}
