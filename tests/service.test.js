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

afterAll(async () => {
  await service.wechatUser.remove({ unionid })
})

// test('login', async () => {
//   let doc = await service.login({ code: '123' })
//   console.log(doc)
//   expect(doc.err).toBeTruthy()
// })

test('bind', async () => {
  let doc = await service.isbinded(bindId)
  expect(!doc.id).toBeTruthy()
  doc = await service.bind(id, bindId)
  console.log(doc)
  // isbinded
  doc = await service.isbinded(bindId)
  expect(doc.id).toBeTruthy()
  // bind duplicate, should throw error
  try {
    await service.bind(id, bindId)
  } catch (e) {
    console.log(e)
  }

  let doc2 = await service.signon({ unionid, headimgurl: 'http://www.baidu.com' })
  console.log(doc2)
  expect(bindId === doc2.id && id === doc2.originalId).toBeTruthy()
})

test('unbind', async () => {
  let doc = await service.unbind(id)
  console.log(doc)
  let doc2 = await service.signon({ unionid, headimgurl: 'http://www.baidu.com' })
  console.log(doc2)
  expect(!doc2.originalId).toBeTruthy()
})
