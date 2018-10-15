const log = require('jm-log4js')
const Service = require('./service')
const router = require('./router')

const logger = log.getLogger('passport')

module.exports = function (opts) {
  ['db', 'gateway', 'weapp_uri'].forEach(function (key) {
    process.env[key] && (opts[key] = process.env[key])
  })

  if (opts.debug) {
    logger.setLevel('debug')
  }

  let o = new Service(opts)
  o.router = router

  return o
}
