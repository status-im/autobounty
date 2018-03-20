// Work hours per label
const BOUNTY_LABELS = {
  'bounty-xs': 2,
  'bounty-s': 4,
  'bounty-m': 8,
  'bounty-l': 20,
  'bounty-xl': 40,
  'bounty-xxl': 60
}

const ERC20_ABI = [
  {
    'constant': false,
    'inputs': [
      {
        'name': '_to',
        'type': 'address'
      },
      {
        'name': '_amount',
        'type': 'uint256'
      }
    ],
    'name': 'transfer',
    'outputs': [
      {
        'name': 'success',
        'type': 'bool'
      }
    ],
    'payable': false,
    'type': 'function'
  }
]

// SNT test address (ropsten): 0x744d70fdbe2ba4cf95131626614a1763df805b9e
// STT test address (ropsten): 0xc55cF4B03948D7EBc8b9E8BAD92643703811d162

const TOKEN_CONTRACTS = {
  'SNT': {
    address: '0x744d70FDBE2Ba4CF95131626614a1763DF805B9E',
    abi: ERC20_ABI
  },
  'ANT': {
    address: '0x960b236A07cf122663c4303350609A66A7B288C0',
    abi: ERC20_ABI
  }
}

module.exports = {
  // Debug mode for testing the bot
   debug: true,

  // URL where the bot is listening (e.g. '/funding')
  urlEndpoint: '/',

  // URL for the signer
  signerPath: 'https://ropsten.infura.io',

  // Address with the funding for the bounties (hex value starting with 0x)
  sourceAddress: '',

  // Private key for ether.js wallet (hex value starting with 0x)
  privateKey: '',

  // Token of the currency for fetching real time prices (e.g. 'SNT')
  token: 'SNT',

  // Limit for the gas used in a transaction (e.g. 92000)
  gasLimit: 115000,

  // Price per hour you will pay in dolars (e.g. 35)
  priceHour: 35,

  // Delay before funding a bounty (e.g. 3600000)
  delayInMiliSeconds: 10000,

  // Bounty Labels for the issues and the correspondent hours (e.g. {'bounty-xs': 3})
  bountyLabels: BOUNTY_LABELS,

  // Contract info for the different supported tokens
  tokenContracts: TOKEN_CONTRACTS,

  // username for the bot which has to comment for starting the process (e.g. status-bounty-)
  githubUsername: 'status-open-bounty',

  // Activate real transactions
   realTransaction: false
}
