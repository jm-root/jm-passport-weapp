const log = require('jm-log4js')
const jm = require('jm-dao')
const event = require('jm-event')
const MS = require('jm-ms')
const error = require('jm-err')
const consts = require('../consts')
const t = require('../locale')
const wechatUser = require('./wechatUser')

const logger = log.getLogger('passport')
let ms = MS()

class Passport {
  constructor (opts = {}) {
    event.enableEvent(this)
    this.ready = false
    this.t = t
    this.forceUnionid = opts.force_unionid || 0
    let self = this
    let bind = (name, uri) => {
      uri || (uri = '/' + name)
      ms.client({
        uri: opts.gateway + uri
      }, function (err, doc) {
        !err && doc && (self[name] = doc)
      })
    }
    bind('sso')
    bind('user')
    bind('weapp', opts.weapp_uri || null)

    this.onReady()

    let cb = (db) => {
      logger.info('db connected')
      this.db = db
      this.wechatUser = wechatUser(this)
      this.emit('ready')
    }

    if (!opts.db) {
      jm.db.connect().then(cb)
    } else if (typeof opts.db === 'string') {
      jm.db.connect(opts.db).then(cb)
    }
  }

  async onReady () {
    if (this.ready) return
    return new Promise(resolve => {
      this.once('ready', () => {
        this.ready = true
        resolve()
      })
    })
  }

  /**
   * 根据微信获取的用户查找对应用户并返回token，如果查不到，先注册用户
   * @param opts
   * @param ips
   * @returns {Promise<*>}
   */
  async signon (opts = {}, ips) {
    logger.debug('signon', opts, ips)
    const { openid, unionid, session_key: sessionKey, nickName, gender, country, province, city, avatarUrl } = opts

    let wechat = {
      weapp: {
        openid,
        sessionKey
      }
    }

    // 检查是否已经存在
    let doc = null
    if (unionid) {
      wechat.unionid = unionid
      doc = await this.wechatUser.findOne({ '$or': [{ 'unionid': unionid }, { 'weapp.openid': openid }] })
    } else {
      doc = await this.wechatUser.findOne({ 'weapp.openid': openid })
    }

    let data = {
      ext: {
        wechat
      }
    }

    nickName !== undefined && (data.nick = nickName)
    gender !== undefined && (data.gender = gender)
    country !== undefined && (data.country = country)
    province !== undefined && (data.province = province)
    city !== undefined && (data.city = city)
    avatarUrl !== undefined && (data.avatarUrl = avatarUrl)

    if (doc) {
      let ext = data.ext
      await this.user.post(`/users/${doc.id}/ext`, ext)
      logger.debug('update user', doc.id, ext)
      await this.wechatUser.update({ _id: doc.id }, wechat)
      logger.debug('update wechat user', doc.id, wechat)
    } else {
      doc = await this.user.request({ uri: '/users', type: 'post', data, ips })
      if (doc.err) throw error.err(doc)
      logger.debug('create user', data)

      data = Object.assign({}, wechat, { _id: doc.id })
      doc = await this.wechatUser.create(data)
      logger.debug('create wechat user', data)
    }
    data = {
      id: doc.id,
      wechat
    }
    // 如果有绑定Id, 切换至绑定Id, 并记录原始Id到originalId
    if (doc.bindId) {
      data.id = doc.bindId
      data.originalId = doc._id
    }
    doc = await this.sso.request({ uri: '/signon', type: 'post', data, ips })
    if (doc.err) throw error.err(doc)
    return doc
  }

  /**
   * 登陆
   * @param {Object} opts
   * @example
   * opts参数:{
   *  code: 授权code
   *  iv: 加密数据，可选
   *  encryptedData: 加密数据，可选
   * }
   * @returns {Promise<*>}
   */
  async login (opts = {}, ips = []) {
    // 从微信获取用户信息
    const { code, iv, encryptedData } = opts
    let doc = await this.weapp.get(`/auth/${code}`)
    if (doc.err) throw error.err(doc)
    if (doc.errcode) {
      throw error.err({
        err: doc.errcode,
        msg: doc.errmsg
      })
    }
    if (iv && encryptedData) {
      const { openid, session_key: sessionKey } = doc
      doc = await this.weapp.post(`/decrypt`, { sessionKey, iv, encryptedData })
      doc.unionId && (doc.unionid = doc.unionId)
      doc.openid = openid
      doc.session_key = sessionKey
    }
    if (this.forceUnionid && !doc.unionid) {
      throw error.err(consts.Err.FA_INVALID_UNIONID)
    }
    doc = await this.signon(doc, ips)
    this.emit('login', { id: doc.id })
    return doc
  }

  /**
   * 登陆, 根据openid直接登陆, 有风险, 所以仅限于信任的服务器之间直接调用
   * @param {Object} opts
   * @example
   * opts参数:{
   *  code: 授权code
   * }
   * @returns {Promise<*>}
   */
  async loginByOpenid (opts = {}, ips = []) {
    let doc = await this.signon(opts, ips)
    this.emit('login', { id: doc.id })
    return doc
  }

  // 检查绑定了其他账号
  async isbind (id) {
    const doc = await this.wechatUser.findById(id)
    const { bindId } = doc || {}
    return { id, bindId }
  }

  // 检查账号是否被绑定
  async isbinded (bindId) {
    const doc = await this.wechatUser.findOne({ bindId })
    const { id } = doc || {}
    return { id, bindId }
  }

  async bind (id, bindId) {
    logger.debug(`bind ${id} to ${bindId}`)
    const ret = await this.isbinded(bindId)
    if (ret.id) {
      throw error.err(consts.Err.FA_BIND_DUPLICATE)
    }
    let doc = await this.wechatUser.findById(id)
    doc.bindId = bindId
    await doc.save()
    return { id, bindId }
  }

  async unbind (id) {
    logger.debug(`unbind ${id}`)
    const doc = await this.wechatUser.findById(id)
    let bindId = null
    if (doc.bindId) {
      bindId = doc.bindId
      doc.bindId = undefined
      await doc.save()
    }
    return { id, bindId }
  }
}

module.exports = Passport
