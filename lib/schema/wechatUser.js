let mongoose = require('mongoose')
let Schema = mongoose.Schema

let schemaDefine = {
  unionid: {type: String, unique: true, sparse: true, index: true}, // unionid
  miniapp: {
    openid: {type: String, unique: true, sparse: true, index: true} // openid
  }
}

module.exports = function (schema, opts) {
  schema = schema || new Schema()
  schema.add(schemaDefine)
  return schema
}
