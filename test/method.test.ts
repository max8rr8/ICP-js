import { TcpICPServer, TcpICPConnection } from '../src/tcp';
import { LocalMethod, RemoteMethod } from '../src/method';

let server: TcpICPServer;
let connection: TcpICPConnection;

let local: LocalMethod;
let remote: RemoteMethod;

test('Should create local variable', () => {
  server = new TcpICPServer(3234);
  local = new LocalMethod(server, '/test', (num: number, done: (repl: number) => void) => {
    done(num ** 2);
  });
});

test('Should create client', () => {
  connection = new TcpICPConnection('localhost', 3234);
  remote = new RemoteMethod(connection, '/test');
});

// test('Should work with local method', () => {
//   expect(local.call(2)).resolves.toBe(4)
// });

// test('Should work with remote variable', async done => {
//   expect(remote.call(4)).resolves.toBe(16)
// });

test('Should exit server', () => {
  server.close();
  connection.close();
});
