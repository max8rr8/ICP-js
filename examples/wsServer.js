const http = require('http')
const { WebSocketsICPServer } = require('../lib/ws')

const httpServer= http.createServer()
const server = new WebSocketsICPServer(httpServer)
server.subscribe('/test', (msg, reply)=>reply({
  type: 'ok',
  test: 'ok'
}))

httpServer.listen(8032)