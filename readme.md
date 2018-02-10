# Status OpenBounty Autobounty <img align="right" src="https://github.com/status-im/autobounty/blob/master/status.png" height="80px" />

### Massive Thanks to the Amazing Aragon Team for starting this project! Original repo **[here](https://github.com/aragon/autobounty)**

#### Status Autobounty bot for OpenBounty
A Github bot that will automatically fund issues that are labelled with **[bounty](https://github.com/status-im/status-react/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aopen+label%3Abountyy)**.
These bounties will use [Status OpenBounty](https://openbounty.status.im/) to incentivize community members to participate and contribute to  the development of Open Source Software projects like Status, Riot and Aragon.

Open source is awesome, but it is also hard work that needs to be rewarded to ensure top quality work. It's also important that everyone in the world gets a fair chance to do it.

#### 🦋 We at Status, Aragon and Riot are using [OpenBounty](https://openbounty.status.im/) to reward open source contributions outside our Core teams.
All issues tagged with **[bounty](https://github.com/status-im/status-react/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aopen+label%3Abounty)** are eligible for a bounty on a succesfully merged Pull Request that solves the issue. Currently bounties have to be funded one after the other and manually by a real human being. This bot's purpose in life is therefore to create and automate the process of funding issues so that contributors can be rewarded accordingly.

#### The process

1. An **[issue](https://github.com/status-im/status-react/issues)** is created at the repo
2. Issue is labeled with **[bounty](https://github.com/status-im/status-react/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aopen+label%3Abounty)** and **bounty-{xs,s,m,l,xl}**
3. [Status OpenBounty](https://openbounty.status.im/) bot adds a bounty to the issue and it is displayed in the issue's comments
4. Webhook is triggered for issue comments.
5. Autobounty checks if the request needs funding (by default: if the user status-open-bounty posts a new comment). If it needs funding proceed to 6 otherwise do nothing.
6. Bot waits for X minutes (configurable parameter) to allow label corrections before proceeding.
7. Address to fund is obtained from status-open-bounty comment.
8. Amount to fund is computed as the hours of work corresponding to the given label times the configured price per hour divided by the token price obtained from etherscan.io (amount_of_work * price_per_hour / token_price).
9. The gas price for the transaction is retrieved from ethgasstation and the maximum gas used is a config param.
10. With all the information the bot funds the bounty from config param *sourceAddress*.


#### Configuration

##### Bot config

Autobounty is build using docker. Before building the image, you need to set up a configuration as follows:

The [config]() folder contains the files for configuring the bot. The description for the variables can be found in *default.js*. Create a production config file (e.g. *production.js*) uing the {default,development}.js as template to override the default ones.

**Remeber** to set the environment variable *NODE_ENV* in the dockerfile (e.g. `ENV NODE_ENV production`) and *WEBHOOK_SECRET* to the value specified in the secret field during the webhook creation (e.g. for random creation *ruby -rsecurerandom -e 'puts SecureRandom.hex(20)'*).
)


```javascript
    // Debug mode for testing the bot
    debug: true,

    // URL where the bot is listening (e.g. '/funding')
    urlEndpoint: '',

    // Path for the log files inside the docker image (e.g. './log/'),
    remember to create the folder inside the docker workspace if you change it
    (the folde will be copied to the docker image during the build)
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

##### Github Webhook

Create a github webhook with the following information:

* Payoload URL: IP_HOST/URL_ENDPOINT
* Content Type: application/json
* Secret: the value you set for environment variable WEBHOOK_SECRET.
* Configure the webhook to be triggered by comments in issues selecting the Issue Comment box in 'Let me select individual events'

Where *IP_HOST* is the ip of the machine running the docker image and *URL_ENDPOINT* is the configuration variable with the same name in your custom config file.

#### Build

To build and run the docker image issue the following commands:

```bash
docker build -t autobounty .
docker run -p 8080:8080 autobounty
```

#### Important Notes

* Bot always **aborts on error** and logs the cause of the error on the file *${LOG_PATH}/error.log*. The aborted transaction must then be manually funded.
* **Only one token** can be specified on the configuration file variable *token*.
* Autobounty bot assumes that the status-open-bounty will only post a single message. In case two messages are posted the issue would be **funded two times**.
The ongoing requests are not recorded in any persistent data storage. If the machine crashes during a request processing the request will be lost.
