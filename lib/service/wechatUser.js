let jm = require('jm-dao')
let event = require('jm-event')
let _schema = require('../schema/wechatUser')

module.exports = function (service, opts = {}) {
  let schema = opts.schema || _schema()
  let model = jm.dao({
    db: service.db,
    modelName: opts.modelName || 'wechat_user',
    tableName: opts.tableName,
    prefix: opts.tableNamePrefix,
    schema: schema,
    schemaExt: opts.schemaExt
  })
  event.enableEvent(model)

  return model
}
