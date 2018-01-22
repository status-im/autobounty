module.exports = {
    debug: true,
    urlEndpoint: '/autobounty/fund',
    logPath: '../log/',
    signerPath: 'https://ropsten.infura.io',
    sourceAddress: 'XXXXX',
    token: 'SNT',
    gasLimit: 92000,
    priceHour: 35,
    bountyLabelsHours: {
        'bounty-xs': 1,
        'bounty-s': 10,
        'bounty-m': 100,
        'bounty-l': 1000,
        'bounty-xl': 10000,
        'bounty-xx': 100000
    };
}
