/*
 * Bot that receives a POST request (from a GitHub issue comment webhook)
 * and in case it's a comment that has "@autobounty <decimal> <currency>"
 * awards that bounty to the address posted earlier in the thread (by the
 * commiteth bot).
 * TODO tests
 * REVIEW parsing, non-persisting storage of addresses, hardcoded string length.
 * Depends on commiteth version as of 2017-06-10.
 */

const config = require('./config');
const bot = require('./bot');

var express = require('express'),
    cors = require('cors'),
    helmet = require('helmet'),
    app = express(),
    bodyParser = require('body-parser'),
    jsonParser = bodyParser.json();

app.use(cors());
app.use(helmet());

// Receive a POST request at the address specified by an env. var.
app.post(`${config.urlEndpoint}`, jsonParser, function(req, res, next) {
    // TODO decide how long the delay to start everything should be
  if (!req.body || !req.body.action)
    return res.sendStatus(400);

  if (!config.needsFunding(req))
    return res.sendStatus(204);

  const eth = bot.eth;
  const from = config.sourceAddress;
  const to = bot.getAddress(req);
  const amount = config.getAmount(req);
  const gasPrice = bot.getGasPrice();

  eth.getTransactionCount(address, (err, nonce) => {
    eth.sendTransaction({
      from: from,
      to: to,
      gas: gas,
      gasPrice: gasPrice,
      value: amount,
      nonce,
    }, (err, txID) => {
      if (err) {
        config.log('Request failed', err)
        return res.status(500).json(err)
      }
      else {
        config.log('Successful request:', txID)
        res.json({ txID })
      }
  });
});

const port = process.env.PORT || 8181
app.listen(port, function(){
  console.log('Autobounty listening on port', port);
});
