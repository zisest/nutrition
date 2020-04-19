const { createProxyMiddleware } = require('http-proxy-middleware')

const PORT = 5000
module.exports = function expressMiddleware (router) {
  router.use('/api', createProxyMiddleware({
    target: `http://localhost:${PORT}`,
    changeOrigin: true
  }))
}