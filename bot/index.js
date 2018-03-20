const winston = require('winston');

const ethers = require('ethers');
const Wallet = ethers.Wallet;
const Contract = ethers.Contract;
const providers = ethers.providers;
const utils = ethers.utils;

const prices = require('./prices');
const config = require('../config');
const github = require('./github');

const contractAddressString = 'Contract address:';


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
    if (req.body.action !== 'edited' || !req.body.hasOwnProperty('comment')) {
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
    if (commentBody.search(contractAddressString) === -1) {
        return false;
    } else {
        return true;
    }
}

const getAddress = function (req) {
    const commentBody = req.body.comment.body;
    const index = commentBody.search(contractAddressString) + 19
    return commentBody.substring(index, index + 42)
}

const getLabel = function (req) {
    return new Promise((resolve, reject) => {
        github.getLabels(req)
            .then(labels => {
                const bountyLabels = labels.filter(label => config.bountyLabels.hasOwnProperty(label.name));
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
                let amountToPayDollar = config.priceHour * config.bountyLabels[label.name];
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
    logger.info(" * To: " + tx.to);
    logger.info(" * Amount: " + tx.value);
    logger.info(" * Gas Price: " + tx.gasPrice);
    logger.info("====================================================");
}

const info = function (msg) {
    logger.info(msg);
}

const error = function (errorMessage) {
    logger.error("[ERROR] Request processing failed: " + errorMessage);
}


const sendTransaction = async function (to, amount, gasPrice) {
    var chainId = providers.Provider.chainId.ropsten;
    var chainName = providers.networks.ropsten;

    if (config.realTransaction) {
        chainId = providers.Provider.chainId.homestead;
        chainName = providers.networks.homestead;
    }

    const wallet = new Wallet(config.privateKey);
    const provider = ethers.providers.getDefaultProvider(chainName);

    wallet.provider = provider;
    if (config.token === 'ETH') {
        const transaction = {
            gasLimit: config.gasLimit,
            gasPrice: gasPrice,
            to: to,
            value: amount,
            chainId: chainId
        };
    
        return await wallet.sendTransaction(transaction);
    } else {
        let hash = null;

        async function getAddress() { return wallet.address; }
        async function sign(transaction) { return wallet.sign(transaction); }

        async function resolveName(addressOrName) { return await provider.resolveName(addressOrName); }
        async function estimateGas(transaction) { return await provider.estimateGas(transaction); }
        async function getGasPrice() { return await provider.getGasPrice(); }
        async function getTransactionCount(blockTag) { return await provider.getTransactionCount(blockTag); }
        async function sendTransaction(transaction) {
            hash = await provider.sendTransaction(transaction);
            return hash;
        }
        
        const customSigner = {
            getAddress: getAddress,
            provider: {
                resolveName: resolveName,
                estimateGas: estimateGas,
                getGasPrice: getGasPrice,
                getTransactionCount: getTransactionCount,
                sendTransaction: sendTransaction
            },
            sign: sign
        }

        const tokenContract = config.tokenContracts[config.token];
        const contractAddress = tokenContract.address;
        const contract = new Contract(contractAddress, tokenContract.abi, customSigner);
        const bigNumberAmount = ethers.utils.bigNumberify(amount);
        await contract.transfer(to, bigNumberAmount);

        return hash;
    }
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
