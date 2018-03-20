// Work hours per label
const BOUNTY_LABELS = {
  'bounty-xs': 1,
  'bounty-s': 10,
  'bounty-m': 100,
  'bounty-l': 1000,
  'bounty-xl': 10000
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

const TOKEN_CONTRACTS = {
  'STT': {
    address: '0xc55cF4B03948D7EBc8b9E8BAD92643703811d162',
    abi: ERC20_ABI
  },
  'SNT': {
    address: '0x744d70fdbe2ba4cf95131626614a1763df805b9e',
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
  sourceAddress: '0x26a4D114B98C4b0B0118426F10fCc1112AA2864d',

  // Private key for ether.js wallet (hex value starting with 0x)
  privateKey: '',

  // Token of the currency for fetching real time prices (e.g. 'SNT')
  token: 'STT',

  // Limit for the gas used in a transaction (e.g. 92000)
  gasLimit: 92000,

  // Price per hour you will pay in dolars (e.g. 35)
  priceHour: 1,

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
