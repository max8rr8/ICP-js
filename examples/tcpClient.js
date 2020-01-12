const { TcpICPConnection } = require("../lib/tcp");

const connection = new TcpICPConnection('localhost', 3232)

connection.send({
  endpoint: '/test',
  type: 'test'
}, msg=>{
  console.log('Test is', msg.test)
})