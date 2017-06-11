/*
 * Bot that receives a POST request (from a GitHub issue comment webhook)
 * and in case it's a comment that has "@autobounty <decimal> <currency>"
 * awards that bounty to the address posted earlier in the thread (by the
 * commiteth bot).
 * TODO tests
 * REVIEW parsing, non-persisting storage of addresses, hardcoded string length. 
 * Depends on commiteth version as of 2017-06-10.
 */

const SignerProvider = require('ethjs-provider-signer');
const sign = require('ethjs-signer').sign;
const Eth = require('ethjs-query');

const address = process.env.ADDRESS;
const name = process.env.NAME;

const provider = new SignerProvider(process.env.NODE, {
  signTransaction: (rawTx, cb) => cb(null, sign(rawTx, process.env.KEY)),
  accounts: (cb) => cb(null, [address]),
});
const eth = new Eth(provider);

var express = require('express'),
    cors = require('cors'),
    app = express(),
    bodyParser = require('body-parser'),
    jsonParser = bodyParser.json();

app.use(cors());

// Store issue ids and their bounty addresses
var issueData = {};

// Receive a POST request at the address specified by an env. var.
app.post('/address/:address', jsonParser, function(req, res, next){
  if (!req.body)
    return res.sendStatus(400);
  var commentBody = req.body.comment.body;
  var issueId = req.body.issue.id;
  var namePosition = commentBody.search("@" + name);
  // Store toAddress from commiteth
  if (namePosition == -1) {
    issueData[issueId] = {"toAddress": commentBody.substring(commentBody.search("Contract address:") + 18, commentBody.search("Contract address:") + 60)}
    console.log(issueData);
    return res.status(204);
  }
  else {
    var postNameWords = commentBody.substring(namePosition + 1 + name.length + 1).trim().split(' ');
    var amount = 0;
    if (postNameWords.length > 0) {
      if(postNameWords[0] == "standard") {
        amount = process.env.STANDARD_BOUNTY;
      }
      else {
        amount = parseFloat(postNameWords[0]);
      }
    }
    console.log("Trying to give " + amount + " ETH to " + issueData[issueId].toAddress + " for issue " + issueId);
    issueData[issueId].amount = amount;

    // Conduct the transaction
    eth.getTransactionCount(address, (err, nonce) => {
      eth.sendTransaction({
        from: address, // Specified in webhook, secret
        to: issueData[issueId].toAddress, // Address from earlier in the thread
        gas: 100000,
        value: issueData[issueId].amount,
        data: '0xde5f72fd', // sha3('faucet()')
        nonce,
      }, (err, txID) => {
        if (err) {
          console.log('Request failed', err)
          return res.status(500).json(err)
        }
        else {
          console.log('Successful request:', txID)
          res.json({ txID })
        }
      });
    });
  }
});

const port = process.env.PORT || 8181
app.listen(port, function(){
  console.log('Autobounty listening on port', port);
});
