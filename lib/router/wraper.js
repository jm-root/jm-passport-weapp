const error = require('jm-err')
const log = require('jm-log4js')
let Err = error.Err
let logger = log.getLogger('passport')

module.exports = service => {
  let t = function (doc, lng) {
    if (doc && lng && doc.err && doc.msg) {
      return {
        err: doc.err,
        msg: Err.t(doc.msg, lng) || doc.msg
      }
    }
    return doc
  }

  let cbErr = (e, opts, cb) => {
    let doc = {
      err: e.code || Err.FAIL,
      msg: e.message
    }
    logger.error(e.stack)
    cb(e, t(doc, opts.lng))
  }

  return (fn, bNext) => {
    return function (opts, cb, next) {
      fn(opts)
        .then(doc => {
          if (bNext) return next()
          cb(null, doc)
        })
        .catch(e => {
          cbErr(e, opts, cb)
        })
    }
  }
}
