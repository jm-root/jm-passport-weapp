const error = require('jm-err')
const help = require('./help')
const wraper = require('./wraper')

let MS = require('jm-ms-core')
let ms = new MS()
let Err = error.Err

module.exports = function (opts = {}) {
  let service = this
  let router = ms.router()

  service.wrapRoute = wraper(service)
  let wrap = service.wrapRoute

  let filterReady = async opts => {
    if (!service.ready) {
      throw error.err(Err.FA_NOTREADY)
    }
  }

  let login = async opts => {
    let ips = opts.ips || []
    ips.length || (ips = [opts.ip])
    let doc = await service.login(opts.data, ips)
    return doc
  }

  let loginByOpenid = async opts => {
    let ips = opts.ips || []
    ips.length || (ips = [opts.ip])
    let doc = await service.loginByOpenid(opts.params, ips)
    return doc
  }

  router
    .use(help(service))
    .use(wrap(filterReady, true))
    .use('/login/:openid', wrap(loginByOpenid))
    .use('/login', wrap(login))
  return router
}
