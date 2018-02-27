'use strict'

const https = require('https');
const config = require('../config');

// Returns the url for getting the labels of a request (Github API v3)
// req has req.issue.labels_url
const getLabelsURL = function (req) {
    let url = req.body.issue.labels_url;
    // Make the URL generic removing the name of the label
    return url.replace('{/name}', '');
}

// Returns  the bounty labelNames of the request, only for testing motives
const getLabelsMock = function (req) {
    return new Promise((resolve, reject) => { resolve(req.body.issue.labels) });
}

// Returns all the bounty labelNames of a given issue (Github API v3)
const getLabels = function (req) {
    if (config.debug) {
        return getLabelsMock(req);
    } else {
        let path = getLabelsURL(req).replace('https://api.github.com', '');
        const options = {
            hostname: 'api.github.com',
            path: path,
            headers: { 'User-Agent': 'kafkasl' }
        };
        return new Promise((resolve, reject) => {
            const request = https.get(options, (response) => {
                // handle http errors
                if (response.statusCode < 200 || response.statusCode > 299) {
                    bot.error(response, 'Failed to load page, status code: ' + response.statusCode);
                    reject(new Error('Failed to load page, status code: ' + response.statusCode));
                }
                // temporary data holder
                const body = [];
                // on every content chunk, push it to the data array
                response.on('data', (chunk) => body.push(chunk));
                // we are done, resolve promise with those joined chunks
                response.on('end', () => {
                    let labels = JSON.parse(body.join('')).map(labelObj => labelObj.name);
                    resolve(labels);
                });
            });
            // handle connection errors of the request
            request.on('error', (err) => reject(err))
        });
    }
}

module.exports = {
    getLabels: getLabels
}
