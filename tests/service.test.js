const $ = require('./service')

let id = null
const unionid = 'test'
const bindId = '5bff9174c74626482d3c3d7f'

let service = null
beforeAll(async () => {
  await $.onReady()
  service = $
  const doc = await service.signon({ unionid, headimgurl: 'http://www.baidu.com' })
  console.log(doc)
  id = doc.originalId || doc.id
})

test('login', async () => {
  let doc = await service.login({ code: '123' })
  console.log(doc)
  expect(doc.err).toBeTruthy()
})

test('bind', async () => {
  let doc = await service.bind(id, bindId)
  console.log(doc)
  let doc2 = await service.signon({ unionid, headimgurl: 'http://www.baidu.com' })
  console.log(doc2)
  expect(bindId === doc2.id && id === doc2.originalId).toBeTruthy()
})

test('unbind', async () => {
  let doc = await service.unbind(id)
  console.log(doc)
  expect(doc).toBeTruthy()
})
