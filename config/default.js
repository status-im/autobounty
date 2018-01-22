

module.exports = {
    // Debug mode for testing the bot
    debug: true,
    
    // URL where the bot is listening (e.g. '/funding')
    urlEndpoint: '',
    
    // Path for the log files (e.g. './log/')
    logPath: '',
    
    // URL for the signer (e.g. 'https://ropsten.infura.io')
    signerPath: '',
    
    // Address with the funding for the bounties 
    sourceAddress: '',
    
    // Token of the currency for fetching real time prices (e.g. 'SNT')
    token: '',
    
    // Limit for the gas used in a transaction (e.g. 92000)
    gasLimit: 0,
    
    // Price per hour you will pay in dolars (e.g. 35)
    priceHour: 0,
    
    // Delay before funding a bounty (e.g. 3600000)
    delayInMiliSeconds: 0,
    
    // Bounty Labels for the issues and the correspondent houres (e.g. {'bounty-xs': 3})
    bountyLabels: {}
}
