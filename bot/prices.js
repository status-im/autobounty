"use strict"

const https = require("https");
const config = require("../config");


const getGasPrice = function () {
    const url = 'https://ethgasstation.info/json/ethgasAPI.json';
    // return new pending promise
    return new Promise((resolve, reject) => {
        // select http or https module, depending on reqested url
        const lib = url.startsWith('https') ? require('https') : require('http');
        const request = lib.get(url, (response) => {
            // handle http errors
            if (response.statusCode < 200 || response.statusCode > 299) {
                reject('Failed to load page, status code: ' + response.statusCode);
            }
            // temporary data holder
            const body = [];
            // on every content chunk, push it to the data array
            response.on('data', (chunk) => body.push(chunk));
            // we are done, resolve promise with those joined chunks
            response.on('end', () => {
                // safeLowWait returns GWei (10^10 Wei).
                let jsonBody = JSON.parse(body.join(''));
                let gasPriceWei = parseInt(jsonBody['safeLowWait']) * Math.pow(10, 10);
                resolve(gasPriceWei);
            });
        });
        // handle connection errors of the request
        request.on('error', (err) => reject(err));
    })
};

const getTokenPriceMock = function () {
    return new Promise((resolve, reject) => resolve(0.35));
}

const getTokenPrice = function (token) {
    if (config.debug) {
        return getTokenPriceMock();
    }
    const currency = 'USD'
    const url = 'https://min-api.cryptocompare.com/data/price?fsym=' + token + '&tsyms=' + currency;
    // return new pending promise
    return new Promise((resolve, reject) => {
        // select http or https module, depending on reqested url
        const lib = url.startsWith('https') ? require('https') : require('http');
        const request = lib.get(url, (response) => {
            // handle http errors
            if (response.statusCode < 200 || response.statusCode > 299) {
                reject('Failed to load page, status code: ' + response.statusCode);
            }
            // temporary data holder
            const body = [];
            // on every content chunk, push it to the data array
            response.on('data', (chunk) => body.push(chunk));
            // we are done, resolve promise with those joined chunks
            response.on('end', () => {
                let jsonBody = JSON.parse(body.join(''));
                let tokenPrice = parseFloat(jsonBody[currency]);
                resolve(tokenPrice);
            });
        });
        // handle connection errors of the request
        request.on('error', (err) => reject(err))
    })
}

module.exports = {
    getGasPrice: getGasPrice,
    getTokenPrice: getTokenPrice
}
