const $ = require('./service')

let router = null
beforeAll(async () => {
  await $.onReady()
  router = $.router()
})

test('login', async () => {
  let doc = await router.post('/login', {code: '123'})
  console.log(doc)
  expect(doc.err).toBeTruthy()
})
