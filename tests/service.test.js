const $ = require('./service')

let service = null
beforeAll(async () => {
  await $.onReady()
  service = $
})

test('login', async () => {
  let doc = await service.login({code: '123'})
  console.log(doc)
  expect(doc.err).toBeTruthy()
})

test('signon', async () => {
  let doc = await service.signon({unionid: '123', headimgurl: 'http://www.baidu.com'})
  console.log(doc)
  expect(doc).toBeTruthy()
})
