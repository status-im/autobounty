'use strict'

const axios = require('axios')

async function getGasPrice () {
  const response = await axios.get('https://ethgasstation.info/json/ethgasAPI.json')
  const gasPriceWei = Math.trunc(parseFloat(response.data.safeLowWait) * Math.pow(10, 10))
  return gasPriceWei
}

async function getTokenPrice (token) {
  if (token === 'STT') {
    return 1
  }

  const currency = 'USD'
  const response = await axios.get(`https://min-api.cryptocompare.com/data/price?fsym=${token}&tsyms=${currency}`)
  const tokenPrice = parseFloat(response.data[currency])
  return tokenPrice
}

module.exports = {
  getGasPrice: getGasPrice,
  getTokenPrice: getTokenPrice
}
