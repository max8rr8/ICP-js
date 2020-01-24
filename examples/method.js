const { TcpICPServer, TcpICPConnection } = require("../lib/tcp");
const { LocalMethod, RemoteMethod } = require("../lib/method")

console.log("Server starting")

const server = new TcpICPServer(3232)
const method = new LocalMethod(server, "/method", (e, done)=>done(console.log(e)))

method.call("RaNdOm CaSe", e=>{
  console.log("Upper cased:", e)
})

console.log("Server started")

async function get() {
  let connection = new TcpICPConnection('localhost', 3232)
  
  let test = new RemoteMethod(connection, '/method');

  console.log("Upper cased 2 is:", await test.call("Hey", e=>console.log(e)))
}

setTimeout(get, 500)