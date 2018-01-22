'use strict'

const https = require('https');
const config = require('../config');

// Returns the url for getting the labels of a request (Github API v3)
// req has req.issue.labels_url
const getLabelsURL = function(req) {
    let url = req.body.issue.labels_url;
    // Make the URL generic removing the name of the label
    return url.replace('{/name}', '');
}

<<<<<<< HEAD
const getLabel = function(req) {
=======
// Returns all labelNames of a given issue (Github API v3)
const getLabels = function(req) {
>>>>>>> 06d132a007e0008829bbf7e496836eec065c84bf
    let url = getLabelsURL(req);
    const options = {
      hostname: 'api.github.com',
      path: '/repos/jomsdev/my-github-bot/issues/6/labels',
      headers: { 'User-Agent': 'kafkasl' }
    };
    console.log('Url in getLabels(): [' + url + ']');
    return new Promise((resolve, reject) => {
        const request = https.get(options, (response) => {
            // handle http errors
            if (response.statusCode < 200 || response.statusCode > 299) {
                bot.error(response, 'Failed to load page, status code: ' + response.statusCode);
                reject(new Error('Failed to load page, status code: ' + response.statusCode));
            }
            console.log('Processing Promise');
            // temporary data holder
            const body = [];
            // on every content chunk, push it to the data array
            response.on('data', (chunk) => body.push(chunk));
            // we are done, resolve promise with those joined chunks
            response.on('end', () => {

                let labels = JSON.parse(body.join('')).map(labelObj => labelObj.name);
                let bountyLabel = labels.filter(name => config.bountyLabels.hasOwnProperty(name));
                console.log('Label: ' + bountyLabel);
                resolve(bountyLabel);
            });
        });
        // handle connection errors of the request
        request.on('error', (err) => reject(err))
    });
}

module.exports = {
    getLabel: getLabel
}
