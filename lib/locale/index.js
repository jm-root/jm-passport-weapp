const zhCN = require('./zh_CN')

let lngs = {
  zh_CN: zhCN
}

/**
 * translate
 * @param {string} msg - msg to be translate
 * @param {string} lng - language
 * @return {String | null}
 */
module.exports = function (msg, lng) {
  if (!lng || !lngs[lng]) return null
  return lngs[lng][msg]
}
