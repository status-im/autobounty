'use strict'

const octokit = require('@octokit/rest')()

// Returns all the bounty labelNames of a given issue (Github API v3)
async function getLabels (req) {
  const labelsPayload = await octokit.issues.getIssueLabels({
    owner: req.body.repository.owner.login,
    repo: req.body.repository.name,
    number: req.body.issue.number
  })

  return labelsPayload.data.map(labelObj => labelObj.name)
}

module.exports = {
  getLabels: getLabels
}
