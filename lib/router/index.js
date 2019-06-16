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

  let isbind = async opts => {
    const { id } = opts.params
    return service.isbind(id)
  }

  let isbinded = async opts => {
    const { bindId } = opts.params
    return service.isbinded(bindId)
  }

  let bind = async opts => {
    const { id } = opts.params
    const { bindId } = opts.data
    return service.bind(id, bindId)
  }

  let unbind = async opts => {
    const { id } = opts.params
    return service.unbind(id)
  }

  router
    .use(help(service))
    .use(wrap(filterReady, true))
    .use('/login/:openid', wrap(loginByOpenid))
    .use('/login', wrap(login))
    .use('/isbind/:id', wrap(isbind))
    .use('/isbinded/:bindId', wrap(isbinded))
    .use('/bind/:id', wrap(bind))
    .use('/unbind/:id', wrap(unbind))
  return router
}
