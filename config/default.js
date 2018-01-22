

const BOUNTY_LABELS = {
    'bounty-xs': 1, 
    'bounty-s': 10,
    'bounty-m': 100, 
    'bounty-l': 1000,
    'bounty-xl': 10000
}



module.exports = {
    urlEndpoint: "/autobounty/fund",
    signerPath: "https://ropsten.infura.io",
    sourceAddress: "XXXXX",
    token: "SNT",
    gasLimit: 92000,
    priceHour: 35,
    workHours: {xs: 2000, s: 2500}
}
