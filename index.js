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

const blacklistedAddresses = [
  '0xB48EBFecCb8b3b46917EaC14070a94CAD8AC4d14',
].map(x => x.toLowerCase())

let blacklistedIPs = []

let nextRequest = {}

app.get('/address/:address', function(req, res, next){
  const to = req.params.address
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress

  if (blacklistedIPs.indexOf(ip) > -1 || blacklistedAddresses.indexOf(to.toLowerCase()) > -1) {
    blacklistedIPs.push(ip)
    console.log('blacklisted ip', ip)
    return res.status(500).json({ error: "Abuser IP detected.", message: "DDOSing and abusing non documented APIs is a considered a crime. We are just making a public service here.", moreInfo: "https://www.fbi.gov/investigate/cyber"})
  }

  if (nextRequest[to] > +new Date()) {
    return res.status(500).json({ error: "This resource is rate limited. Try again later" })
  }

  eth.getTransactionCount(address, (err, nonce) => {
    eth.sendTransaction({
      from: address,
      gas: 100000,
      value: (parseFloat(process.env.AMOUNT) || 1.5) * 1e18,
      data: '0xde5f72fd', // sha3('faucet()')
      nonce,
      to,
    }, (err, txID) => {
      if (err) {
        console.log('Request failed', err)
        return res.status(500).json(err)
      }
      else {
        nextRequest[to] = +new Date() + 1000 * 60 * 20 // in 20 mins
        console.log('Successful request:', txID)
        res.json({ txID })
      }
    });
  })
});

const port = process.env.PORT || 8181
app.listen(port, function(){
  console.log('Faucet listening on port', port);
});
