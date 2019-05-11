const $ = require('./service')

let id = null
const unionid = 'test'
const bindId = '5bff9174c74626482d3c3d7f'

let router = null
beforeAll(async () => {
  await $.onReady()
  router = $.router()
  const doc = await $.signon({ unionid, headimgurl: 'http://www.baidu.com' })
  console.log(doc)
  id = doc.originalId || doc.id
})

test('login', async () => {
  let doc = await router.post('/login', { code: '123' })
  console.log(doc)
  expect(doc.err).toBeTruthy()
})

test('bind', async () => {
  let doc = await router.post(`/bind/${id}`, { bindId })
  console.log(doc)
  expect(doc).toBeTruthy()
})

test('unbind', async () => {
  let doc = await router.post(`/unbind/${id}`)
  console.log(doc)
  expect(doc).toBeTruthy()
})
