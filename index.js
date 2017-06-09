const SignerProvider = require('ethjs-provider-signer');
const sign = require('ethjs-signer').sign;
const Eth = require('ethjs-query');

const address = process.env.ADDRESS

const provider = new SignerProvider(process.env.NODE, {
  signTransaction: (rawTx, cb) => cb(null, sign(rawTx, process.env.KEY)),
  accounts: (cb) => cb(null, [address]),
});
const eth = new Eth(provider);

var express = require('express')
  , cors = require('cors')
  , app = express();

app.use(cors());

app.get('/address/:address', function(req, res, next){
  eth.getTransactionCount(address, (err, nonce) => {
    eth.sendTransaction({
      from: address,
      to: req.params.address,
      gas: 100000,
      value: (parseFloat(process.env.AMOUNT) || 1.5) * 1e18,
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
  })
});

const port = process.env.PORT || 8181
app.listen(port, function(){
  console.log('Faucet listening on port', port);
