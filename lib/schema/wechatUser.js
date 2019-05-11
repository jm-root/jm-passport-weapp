let mongoose = require('mongoose')
let Schema = mongoose.Schema

let schemaDefine = {
  unionid: { type: String, unique: true, sparse: true, index: true }, // unionid
  weapp: {
    openid: { type: String, unique: true, sparse: true, index: true } // openid
  },
  bindId: { type: String, unique: true, sparse: true, index: true } // 绑定id
}

module.exports = function (schema, opts) {
  schema = schema || new Schema()
  schema.add(schemaDefine)
  return schema
}
