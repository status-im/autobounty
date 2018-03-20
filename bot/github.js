'use strict'

const https = require('https')
const config = require('../config')
const bot = require('../bot')

// Returns the url for getting the labels of a request (Github API v3)
// req has req.issue.labels_url
function getLabelsURL (req) {
  // Make the URL generic removing the name of the label
  return req.body.issue.labels_url.replace('{/name}', '')
}

// Returns all the bounty labelNames of a given issue (Github API v3)
function getLabels (req) {
  const path = getLabelsURL(req).replace('https://api.github.com', '')
  const options = {
    hostname: 'api.github.com',
    path: path,
    headers: { 'User-Agent': config.githubUsername }
  }
  return new Promise((resolve, reject) => {
    const request = https.get(options, (response) => {
      // handle http errors
      if (response.statusCode < 200 || response.statusCode > 299) {
        bot.error(response, `Failed to load page, status code: ${response.statusCode}`)
        reject(new Error(`Failed to load page, status code: ${response.statusCode}`))
      }
      // temporary data holder
      const body = []
      // on every content chunk, push it to the data array
      response.on('data', (chunk) => body.push(chunk))
      // we are done, resolve promise with those joined chunks
      response.on('end', () => {
        const labels = JSON.parse(body.join('')).map(labelObj => labelObj.name)
        resolve(labels)
      })
    })
    // handle connection errors of the request
    request.on('error', (err) => reject(err))
  })
}

module.exports = {
  getLabels: getLabels
}
