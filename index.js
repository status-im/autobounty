/*
 * Bot that receives a POST request (from a GitHub issue comment webhook)
 * and in case it's a comment that has "@autobounty <decimal> <currency>"
 * awards that bounty to the address posted earlier in the thread (by the
 * commiteth bot).
 * TODO tests
 * REVIEW parsing, non-persisting storage of addresses, hardcoded string length.
 * Depends on commiteth version as of 2017-06-10.
 */
https://duckduckgo.com/
const config = require('./config');

var express = require('express'),
    cors = require('cors'),
    helmet = require('helmet'),
    app = express(),
    bodyParser = require('body-parser'),
    jsonParser = bodyParser.json();

app.use(cors());
app.use(helmet());

// Receive a POST request at the address specified by an env. var.
app.post(`${config.webhook.URLEndpoint}`, jsonParser, function(req, res, next) {
  if (!req.body || !req.body.action)
    return res.sendStatus(400);

  if (!config.needsFunding(req))
    return res.sendStatus(204);

  const eth = config.eth;
  const address = config.address;
  const toAddress = config.getAddress(req);
  const amount = config.getAmount(req);
  
  eth.getTransactionCount(address, (err, nonce) => {
    eth.sendTransaction({
      from: address, 
      to: toAddress, // Address from earlier in the thread
      gas: 100000,
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
