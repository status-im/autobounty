/*
* Bot that receives a POST request (from a GitHub issue comment webhook)
* and in case it's a comment that has "@autobounty <decimal> <currency>"
* awards that bounty to the address posted earlier in the thread (by the
* commiteth bot).
* REVIEW parsing, non-persisting storage of addresses, hardcoded string length.
* Depends on commiteth version as of 2017-06-10.
*/

const config = require('./config')
const bot = require('./bot')
const crypto = require('crypto')

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const app = express()
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()

app.use(cors())
app.use(helmet())

// Receive a POST request at the url specified by an env. var.
app.post(`${config.urlEndpoint}`, jsonParser, function (req, res, next) {
  if (!req.body || !req.body.action) {
    return res.sendStatus(400)
  } else if (!bot.needsFunding(req)) {
    return res.sendStatus(204)
  }

  const validation = validateRequest(req)

  if (validation.correct) {
    setTimeout(async () => {
      try {
        await processRequest(req)
        bot.info(`issue well funded: ${req.body.issue.url}`)
      } catch (err) {
        bot.error(`Error processing request: ${req.body.issue.url}`)
        bot.error(`Error: ${err}`)
        bot.error(`Dump: ${req.body}`)
      }
    }, config.delayInMiliSeconds)
  } else {
    bot.error(`Error validating issue: ${req.body.issue.url}`)
    bot.error(`Error: ${validation.error}`)
  }
  return res.sendStatus(200)
})

function validateRequest (req) {
  const validation = { correct: false, error: '' }
  const webhookSecret = process.env.WEBHOOK_SECRET

  if (!webhookSecret) {
    validation.error = 'Github Webhook Secret key not found. ' +
                       'Please set env variable WEBHOOK_SECRET to github\'s webhook secret value'
  } else {
    const blob = JSON.stringify(req.body)
    const hmac = crypto.createHmac('sha1', webhookSecret)
    const ourSignature = `sha1=${hmac.update(blob).digest('hex')}`

    const theirSignature = req.get('X-Hub-Signature')

    const bufferA = Buffer.from(ourSignature, 'utf8')
    const bufferB = Buffer.from(theirSignature, 'utf8')

    const safe = crypto.timingSafeEqual(bufferA, bufferB)

    if (safe) {
      validation.correct = true
    } else {
      validation.error = 'Invalid signature. Check that WEBHOOK_SECRET ' +
                         'env variable matches github\'s webhook secret value'
    }
  }

  return validation
}

async function processRequest (req) {
  // const wallet = bot.wallet

  const to = bot.getAddress(req)

  // Asynchronous requests for Gas Price and Amount
  const amount = await bot.getAmount(req)
  const gasPrice = await bot.getGasPrice()

  const hash = await bot.sendTransaction(to, amount, gasPrice)

  bot.logTransaction(hash)
}

const port = process.env.PORT || 8181
app.listen(port, function () {
  bot.info('Autobounty listening on port', port)
})
