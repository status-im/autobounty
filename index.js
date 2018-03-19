/*
* Bot that receives a POST request (from a GitHub issue comment webhook)
* and in case it's a comment that has "@autobounty <decimal> <currency>"
* awards that bounty to the address posted earlier in the thread (by the
* commiteth bot).
* REVIEW parsing, non-persisting storage of addresses, hardcoded string length.
* Depends on commiteth version as of 2017-06-10.
*/

const config = require('./config');
const bot = require('./bot');
const crypto = require('crypto');


var express = require('express'),
    cors = require('cors'),
    helmet = require('helmet'),
    app = express(),
    bodyParser = require('body-parser'),
    jsonParser = bodyParser.json();

app.use(cors());
app.use(helmet());

// Receive a POST request at the url specified by an env. var.
app.post(`${config.urlEndpoint}`, jsonParser, function (req, res, next) {
    
    if (!req.body || !req.body.action) {
        return res.sendStatus(400);
    } else if (!bot.needsFunding(req)) {
        return res.sendStatus(204);
    }
    validation = validateRequest(req);

    if (validation.correct) {

        setTimeout(() => {
            processRequest(req)
                .then(() => {
                    bot.info('issue well funded: ' + req.body.issue.url);
                })
                .catch((err) => {
                    bot.error('Error processing request: ' + req.body.issue.url);
                    bot.error('Error: ' + err);
                    bot.error('Dump: ', req.body);
                });
        }, config.delayInMiliSeconds);

    } else {
        bot.error('Error validating issue: ' + req.body.issue.url);
        bot.error('Error: ' + validation.error);
    }
    return res.sendStatus(200);
});

const validateRequest = function (req) {
    validation = {correct: false, error: ''};
    webhookSecret = process.env.WEBHOOK_SECRET;

    if(!webhookSecret) {
        validation.error = 'Github Webhook Secret key not found. ' +
        'Please set env variable WEBHOOK_SECRET to github\'s webhook secret value';
    } else {

        const blob = JSON.stringify(req.body);
        const hmac = crypto.createHmac('sha1', webhookSecret);
        const ourSignature = `sha1=${hmac.update(blob).digest('hex')}`;

        const theirSignature = req.get('X-Hub-Signature');

        const bufferA = Buffer.from(ourSignature, 'utf8');
        const bufferB = Buffer.from(theirSignature, 'utf8');

        const safe = crypto.timingSafeEqual(bufferA, bufferB);

        if (safe) {
            validation.correct = true;
        } else {
            validation.error = 'Invalid signature. Check that WEBHOOK_SECRET ' +
            'env variable matches github\'s webhook secret value';
        }
    }

    return validation;
}

const processRequest = function (req) {
    // const wallet = bot.wallet;

    const from = config.sourceAddress;
    const to = bot.getAddress(req);

    // Asynchronous requests for Gas Price and Amount
    const amountPromise = bot.getAmount(req);
    const gasPricePromise = bot.getGasPrice();
    return new Promise((resolve, reject) => {
        Promise.all([amountPromise, gasPricePromise])
            .then(function (results) {
                const amount = results[0];
                const gasPrice = results[1];

                bot.sendTransaction(to, amount, gasPrice)
                    .then(function (hash) {
                        bot.logTransaction(hash);
                        resolve();
                    })
                    .catch(function (err) {
                        reject(err);
                    });
            })
            .catch(function (err) {
                reject(err);
            });
    });
}

const port = process.env.PORT || 8181
app.listen(port, function () {
    bot.info('Autobounty listening on port', port);
});
