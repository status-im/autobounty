'use strict'

const https = require('https');
const config = require('../config');

// Returns the url for getting the labels of a request (Github API v3)
// req has req.issue.labels_url
const getLabelsURL = function(req) {
    let url = req.issue.labels_url;
    // Make the URL generic removing the name of the label
    return url.replace('{/name}', '');
}

// Returns all labelNames of a given issue (Github API v3)
const getLabels = function(req) {
    let url = getLabelsURL(req);
    return new Promise((resolve, reject) => {
        const request = https.get(url, (response) => {
            // handle http errors
            if (response.statusCode < 200 || response.statusCode > 299) {
                reject(new Error('Failed to load page, status code: ' + response.statusCode));
            }
            // temporary data holder
            const body = [];
            // on every content chunk, push it to the data array
            response.on('data', (chunk) => body.push(chunk));
            // we are done, resolve promise with those joined chunks
            response.on('end', () => {
                let labels = JSON.parse(body.join('')).map(lableObj => lableObj.name);
                let bountyLabels = labels.filter(name => config.BOUNTY_LABELS.hasOwnProperty(name));

                resolve(bountyLabels);
            });
        });
        // handle connection errors of the request
        request.on('error', (err) => reject(err))
    });
}
