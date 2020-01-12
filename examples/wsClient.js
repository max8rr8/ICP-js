const { WebSocketsICPConnection } = require("../lib/ws");

const connection = new WebSocketsICPConnection('ws://localhost:8032')

connection.send({
  endpoint: '/test',
  type: 'test'
}, msg=>{
  console.log('Test is', msg.test)
})