const error = require('jm-err')
const log = require('jm-log4js')
let Err = error.Err
let logger = log.getLogger('passport')

module.exports = service => {
  let t = function (doc, lng) {
    if (doc && lng && doc.err && doc.msg) {
      return Object.assign({}, doc, {
        msg: Err.t(doc.msg, lng) || doc.msg
      })
    }
    return doc
  }

  let cbErr = (e, opts, cb) => {
    let doc = e.data || {
      err: e.code || Err.FAIL.err,
      msg: e.message
    }
    logger.error(e)
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
