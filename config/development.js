const BOUNTY_LABELS = {
    'bounty-xs': 1,
    'bounty-s': 10,
    'bounty-m': 100,
    'bounty-l': 1000,
    'bounty-xl': 10000
}

module.exports = {
    debug: true,
    urlEndpoint: '/',
    signerPath: 'https://ropsten.infura.io',
    sourceAddress: 'XXXXX',
    token: 'SNT',
    gasLimit: 92000,
    priceHour: 35,
    delayInMiliSeconds: 10000,
    bountyLabels: BOUNTY_LABELS,
    githubUsername: 'jomsdev'
}
