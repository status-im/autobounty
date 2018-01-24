const chai = require('chai');
const expect = require('chai').expect;
const assert = require('chai').assert;
const should = require('chai').should;
const config = require('../config')
const bot = require('../bot')


// status-open-bounty comment from https://github.com/status-im/autobounty/issues/1
let sob_comment = 'Current balance: 0.000000 ETH\nTokens: SNT: 2500.00 ANT: 25.00\nContract address: 0x3645fe42b1a744ad98cc032c22472388806f86f9\nNetwork: Mainnet\n To claim this bounty sign up at https://openbounty.status.im and make sure to update your Ethereum address in My Payment Details so that the bounty is correctly allocated.\nTo fund it, send ETH or ERC20/ERC223 tokens to the contract address.'

// Fake requests
let requests = [
    { body: { action: 'created', comment: { body: 'Creating my first comment', user: { login: 'randomUser' } } } },
    { body: { action: 'edited', comment: { body: 'Editing my comment', user: { login: 'RandomUser' } } } },
    { body: { action: 'edited', comment: { body: sob_comment, user: { login: 'status-open-bounty' } } } },
    { body: { action: 'created', issue: { labels: ['bounty', 'bounty-s'] }, comment: { body: sob_comment, user: { login: 'jomsdev' } } } }
];

describe('Bot behavior', function () {
    describe('#needsFunding()', function () {
        it('should return false because the comment is not from status-open-bounty', function () {
            assert.isFalse(bot.needsFunding(requests[0]));
        });
        it('should return false because a user is editing a comment', function () {
            assert.isFalse(bot.needsFunding(requests[1]));
        });
        it('should return false because status-open-bounty edited a comment', function () {
            assert.isFalse(bot.needsFunding(requests[2]));
        });
        it('should return true, it is all right and we should fund', function () {
            assert.isTrue(bot.needsFunding(requests[3]));
        });
    });

    describe('#getAddress', function () {
        it('should return the address from a status-open-bounty bot comment', function () {
            assert.equal(bot.getAddress(requests[3]), '0x3645fe42b1a744ad98cc032c22472388806f86f9');
        });
    });

    // TODO: test getAmount which involves calls to github and bounty tags
    describe('#getAmount', function () {
        it('should fail and log that there is no bounty label for this issue', function () {
            // Code
        });
        it('should fail and log that there are more than one bounty labels for this  issue', function () {
            // Code
        });
        it('should return the amount for the issue given the price per hour and the bounty label for this issue', (done) => {
            bot.getAmount(requests[3])
                .then(function (amount) {
                    let label = 'bounty-s';
                    let tokenPrice = 0.35;
                    let priceInDollars = config.priceHour * config.bountyLabels[label];
                    expected_amount = priceInDollars / tokenPrice;
                    assert.equal(amount, expected_amount);
                    done();
                })
                .catch(() => {console.log('error'), done()});
        });
    });
});
