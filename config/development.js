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
    sourceAddress: '0x26a4D114B98C4b0B0118426F10fCc1112AA2864d',
    privateKey: '',
    token: 'SNT',
    gasLimit: 92000,
    priceHour: 1,
    delayInMiliSeconds: 10000,
    bountyLabels: BOUNTY_LABELS,
    githubUsername: 'status-open-bounty',

}
