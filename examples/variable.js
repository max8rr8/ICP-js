const { TcpICPServer, TcpICPConnection } = require("../lib/tcp");
const { LocalVariable, RemoteVariable } = require("../lib/variable")

console.log("Server starting")

const server = new TcpICPServer(3232)
const variable = new LocalVariable(server, "/var/*", 0)


variable.onChange(val=>console.log("Main changed:", val))
variable.onChange("/var/test", val=>console.log("Main changed:", val))

variable.set(1)
variable.set("/var/test", 2)

console.log("Main is:", variable.get())
console.log("Test is:", variable.get("/var/test"))


console.log("Server started")

async function get() {
  let connection = new TcpICPConnection('localhost', 3232)
  
  let test = new RemoteVariable(connection, '/var/test');
  let dj = new RemoteVariable(connection, '/var/dj');

  console.log("DJ is:", await dj.get())
  console.log("Test is:", await test.get())

  dj.onChange(val=>console.log("DJ changed:", val))

  dj.set(123)
}

setTimeout(get, 500)