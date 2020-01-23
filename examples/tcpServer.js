const { TcpICPServer } = require("../lib/tcp");

const server = new TcpICPServer(3232)
server.subscribe('/test', (msg, reply)=>reply({
  type: 'ok',
  test: 'ok'
}))