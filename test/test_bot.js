const chai = require('chai')
const { expect, assert, should } = chai
const config = require('../config')
const bot = require('../bot')

// status-open-bounty comment from https://github.com/status-im/autobounty/issues/1
const sobComment = 'Current balance: 0.000000 ETH\nTokens: SNT: 2500.00 ANT: 25.00\nContract address: [0x3645fe42b1a744ad98cc032c22472388806f86f9](https://etherscan.io/address/0x3645fe42b1a744ad98cc032c22472388806f86f9)\nNetwork: Mainnet\n To claim this bounty sign up at https://openbounty.status.im and make sure to update your Ethereum address in My Payment Details so that the bounty is correctly allocated.\nTo fund it, send ETH or ERC20/ERC223 tokens to the contract address.'
const sobCommentWithWinner = 'Balance: 0.000000 ETH\nContract address: [0xe02fbffb3422ddb8e2227c3495f710ba4f8e0c10](https://etherscan.io/address/0xe02fbffb3422ddb8e2227c3495f710ba4f8e0c10)\nNetwork: Mainnet\nStatus: Pending maintainer confirmation\nWinner: foopang\nVisit [https://openbounty.status.im](https://openbounty.status.im) to learn more.'

// Fake requests
const requests = [
  { headers: {'x-github-event': 'issue_comment'}, body: { action: 'created', comment: { body: 'Creating my first comment', user: { login: 'randomUser' } } } },
  { headers: {'x-github-event': 'issue_comment'}, body: { action: 'edited', comment: { body: 'Editing my comment', user: { login: 'RandomUser' } } } },
  { headers: {'x-github-event': 'issue_comment'}, body: { action: 'created', comment: { body: sobComment, user: { login: 'status-open-bounty' } } } },
  { headers: {'x-github-event': 'issue_comment'}, body: { action: 'edited', repository: { owner: { login: 'status-im' }, name: 'autobounty' }, issue: { labels: ['bounty', 'bounty-xl'], number: 1 }, comment: { body: sobComment, user: { login: 'status-open-bounty' } } } },
  { headers: {'x-github-event': 'issue_comment'}, body: { action: 'edited', repository: { owner: { login: 'status-im' }, name: 'autobounty' }, issue: { labels: ['bounty', 'bounty-xl'], number: 1 }, comment: { body: sobCommentWithWinner, user: { login: 'status-open-bounty' } } } },
  { headers: {'x-github-event': 'labels'}, body: { action: 'created' } }
]

describe('Bot behavior', function () {
  describe('#needsFunding()', function () {
    it('should return false because the comment is not from status-open-bounty', function () {
      assert.isFalse(bot.needsFunding(requests[0]))
    })
    it('should return false because a user is editing a comment', function () {
      assert.isFalse(bot.needsFunding(requests[1]))
    })
    it('should return false because status-open-bounty edited a comment', function () {
      assert.isFalse(bot.needsFunding(requests[2]))
    })
    it('should return true, it is all right and we should fund', function () {
      assert.isTrue(bot.needsFunding(requests[3]))
    })
    it('should return false because issue already has a winner', function () {
      assert.isFalse(bot.needsFunding(requests[4]))
    })
    it('should return false because the action is not related to issue comments', function () {
      assert.isFalse(bot.needsFunding(requests[5]))
    })
  })

  describe('#getAddress', function () {
    it('should return the address from a status-open-bounty bot comment', function () {
      assert.equal(bot.getAddress(requests[3]), '0x3645fe42b1a744ad98cc032c22472388806f86f9')
    })
    it('should not return the address from a comment not containing an address', function () {
      assert.isUndefined(bot.getAddress(requests[1]))
    })
  })

  describe('#getAmount', function () {
    it('should return the amount for the issue given the price per hour and the bounty label for this issue', async () => {
      try {
        const amount = await bot.getAmount(requests[3])
        const label = 'bounty-xl'
        const tokenPrice = await bot.getTokenPrice(config.token)
        const priceInDollars = config.priceHour * config.bountyLabels[label]
        const expectedAmount = priceInDollars / tokenPrice
        assert.equal(amount, expectedAmount)
      } catch (err) {
        console.log(err)
      }
    })
    it('should return the amount for the issue given the price per hour and the bounty label for this issue, even when label issue has different case', async () => {
      try {
        const amount = await bot.getAmount(requests[3])
        const label = 'bounty-XL'
        const tokenPrice = await bot.getTokenPrice(config.token)
        const priceInDollars = config.priceHour * config.bountyLabels[label.toLowerCase()]
        const expectedAmount = priceInDollars / tokenPrice
        assert.equal(amount, expectedAmount)
      } catch (err) {
        console.log(err)
      }
    })
  })
})
