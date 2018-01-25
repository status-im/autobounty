# Status OpenBounty Autobounty <img align="right" src="https://github.com/status-im/autobounty/blob/master/status.png" height="80px" />

### Massive Thanks to the Amazing Aragon Team for starting this project! Original repo **[here](https://github.com/aragon/autobounty)**

#### Status Autobounty bot for OpenBounty
A Github bot that will automatically fund issues that are labelled with **[bounty](https://github.com/status-im/status-react/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aopen+label%3Abountyy)**.
These bounties will use [Status OpenBounty](https://openbounty.status.im/) to incentivize community members to participate and contribute to  the development of Open Source Software projects like Status, Riot and Aragon.

Open source is awesome, but it is also hard work that needs to be rewarded to ensure top quality work. It's also important that everyone in the world gets a fair chance to do it.

#### 🦋 We at Status, Aragon and Riot are using [OpenBounty](https://openbounty.status.im/) to reward open source contributions outside our Core teams.
All issues tagged with **[bounty](https://github.com/status-im/status-react/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aopen+label%3Abounty)** are eligible for a bounty on a succesfully merged Pull Request that solves the issue. Currently bounties have to be funded one after the other and manually by a real human being. This bot's purpose in life is therefore to create and automate the process of funding issues so that contributors can be rewarded accordingly.

#### The process

- An **[issue](https://github.com/status-im/status-react/issues)** is created at the repo
- Issue is labeled with **[bounty](https://github.com/status-im/status-react/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aopen+label%3Abounty)** and **bounty-{xs,s,m,l,xl}**
- [Status OpenBounty](https://openbounty.status.im/) bot adds a bounty to the issue and it is displayed in the issue's comments
- This autobounty bot automatically funds that issue with a set amount of tokens based on another label decribing the size of the bounty based roughly on how many hours the team feels it will take to complete * the rate per hour they are willing to pay. When a successful Pull Request is merged, the contributor is paid that amount for their work autonomously, transparently and programmatically by the smart contract itself - no middle men involved at all.


#### Configuration

This bot can be build using docker.

* Remember to create the folder for the logPath before running the build.

The [config]() folder contains the files for configuring the bot. The description for the variables can be found in *default.js*:

```javascript
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
    bountyLabels: {},

    // username for the bot which has to comment for starting the process (e.g. status-bounty-)
    githubUsername: '',

    // Activate real transactions
    realTransaction: false
```

The idea is to deploy the bot running

```bash
docker build -t autobounty .
docker run -p 8080:8080 autobounty
```

- Configure the PORT and NODE_ENV variables in the Dockerfile 
- Create a production.js file using the {default,development}.js as example