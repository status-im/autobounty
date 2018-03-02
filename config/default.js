// Work hours per label
const BOUNTY_LABELS = {
    'bounty-xs': 1,
    'bounty-s': 10,
    'bounty-m': 100,
    'bounty-l': 1000,
    'bounty-xl': 10000
}

module.exports = {
    // Debug mode for testing the bot
    debug: true,

    // URL where the bot is listening (e.g. '/funding')
    urlEndpoint: '/',

    // URL for the signer
    signerPath: 'https://ropsten.infura.io',

    // Address with the funding for the bounties
    sourceAddress: '0x26a4D114B98C4b0B0118426F10fCc1112AA2864d',

    // Private key for ether.js wallet
    privateKey: '',

    // Token of the currency for fetching real time prices (e.g. 'SNT')
    token: 'SNT',

    // Limit for the gas used in a transaction (e.g. 92000)
    gasLimit: 92000,

    // Price per hour you will pay in dolars (e.g. 35)
    priceHour: 1,

    // Delay before funding a bounty (e.g. 3600000)
    delayInMiliSeconds: 10000,

    // Bounty Labels for the issues and the correspondent hours (e.g. {'bounty-xs': 3})
    bountyLabels: BOUNTY_LABELS,

    // username for the bot which has to comment for starting the process (e.g. status-bounty-)
    githubUsername: 'status-open-bounty',

    // Activate real transactions
    realTransaction: false
}
