const _ = require('lodash')
const defaults = require('./default.js')
const configFileName = process.env.NODE_ENV || 'default'
const config = require(`./${configFileName}.js`)
module.exports = _.merge({}, defaults, config)
