var _ = require("lodash")
var defaults = require("./default.js")
var config = require("./" + (process.env.NODE_ENV || "default") + ".js")
module.exports = _.merge({}, defaults, config)
