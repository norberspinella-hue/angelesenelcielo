const https = require('https')

const url = 'https://pub-807afcfbd2144a1ea45f8c11f2083070.r2.dev/photos/migrated_490_489_b7670279.jpg'

https.request(url, { method: 'HEAD' }, (res) => {
  console.log('Status Code:', res.statusCode)
  console.log('Content-Type:', res.headers['content-type'])
  console.log('Content-Length:', res.headers['content-length'], 'bytes', `(${(res.headers['content-length'] / 1024).toFixed(2)} KB)`)
  console.log('Server:', res.headers['server'])
  console.log('Cache-Control:', res.headers['cache-control'])
}).end()
