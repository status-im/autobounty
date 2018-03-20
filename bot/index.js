const winston = require('winston')

const ethers = require('ethers')
const { Wallet, Contract, providers } = ethers

const config = require('../config')
const prices = require('./prices')
const github = require('./github')

const contractAddressString = 'Contract address:'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: './log/error.log', level: 'error' }),
    new winston.transports.File({ filename: './log/info.log', level: 'info' })
    // new winston.transports.File({ filename: './log/combined.log' })
  ]
})

function needsFunding (req) {
  if (req.body.action !== 'edited' || !req.body.hasOwnProperty('comment')) {
    return false
  } else if (req.body.comment.user.login !== config.githubUsername) {
    return false
  } else if (!hasAddress(req)) {
    return false
  }
  return true
}

function hasAddress (req) {
  return req.body.comment.body.search(contractAddressString) !== -1
}

function getAddress (req) {
  const commentBody = req.body.comment.body
  const index = commentBody.search(contractAddressString) + 19
  return commentBody.substring(index, index + 42)
}

async function getLabel (req) {
  const labelNames = await github.getLabels(req)
  const bountyLabels = labelNames.filter(labelName => config.bountyLabels.hasOwnProperty(labelName))
  if (bountyLabels.length === 1) {
    return bountyLabels[0]
  }

  throw new Error('Error getting bounty labels')
}

async function getAmount (req) {
  const labelName = await getLabel(req)
  const tokenPrice = await prices.getTokenPrice(config.token)

  const bountyLabelHours = config.bountyLabels[labelName]
  if (!bountyLabelHours) {
    throw new Error(`Label '${labelName}' not found in config`)
  }
  const amountToPayDollar = config.priceHour * bountyLabelHours
  return (amountToPayDollar / tokenPrice)
}

// Logging functions

function logTransaction (tx) {
  info(`[OK] Succesfully funded bounty with transaction ${tx.hash}`)
  info(` * From: ${tx.from}`)
  info(` * To: ${tx.to}`)
  info(` * Amount: ${tx.value}`)
  info(` * Gas Price: ${tx.gasPrice}`)
  info(`====================================================`)
}

function info (msg) {
  logger.info(msg)
}

function error (errorMessage) {
  logger.error(`[ERROR] Request processing failed: ${errorMessage}`)
}

async function sendTransaction (to, amount, gasPrice) {
  let hash = null
  let chainId = providers.Provider.chainId.ropsten
  let chainName = providers.networks.ropsten

  if (config.realTransaction) {
    chainId = providers.Provider.chainId.homestead
    chainName = providers.networks.homestead
  }

  const wallet = new Wallet(config.privateKey)
  wallet.provider = ethers.providers.getDefaultProvider(chainName)

  if (config.token === 'ETH') {
    const transaction = {
      gasLimit: config.gasLimit,
      gasPrice: gasPrice,
      to: to,
      value: amount,
      chainId: chainId
    }

    hash = await wallet.sendTransaction(transaction)
  } else {
    const customSigner = getCustomSigner(wallet, sendTransaction)
    const tokenContract = config.tokenContracts[config.token]
    const contractAddress = tokenContract.address
    const contract = new Contract(contractAddress, tokenContract.abi, customSigner)
    const bigNumberAmount = ethers.utils.bigNumberify(amount)

    await contract.transfer(to, bigNumberAmount)
  }

  return hash
}

function getCustomSigner (wallet, sendTransaction) {
  const provider = wallet.provider

  async function getAddress () { return wallet.address }
  async function sign (transaction) { return wallet.sign(transaction) }

  async function resolveName (addressOrName) { return provider.resolveName(addressOrName) }
  async function estimateGas (transaction) { return provider.estimateGas(transaction) }
  async function getGasPrice () { return provider.getGasPrice() }
  async function getTransactionCount (blockTag) { return provider.getTransactionCount(blockTag) }

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

  return customSigner
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
