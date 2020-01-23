import { TcpICPServer, TcpICPConnection } from '../src/tcp';
import { LocalVariable, RemoteVariable } from '../src/variable';

let server: TcpICPServer;
let connection: TcpICPConnection;

let local: LocalVariable<number>;
let remote: RemoteVariable<number>;

test('Should create local variable', () => {
  server = new TcpICPServer(3233);
  local = new LocalVariable(server, '/test/*', 0);
});

test('Should create client', () => {
  connection = new TcpICPConnection('localhost', 3233);
  remote = new RemoteVariable(connection, '/test/remote');
});

test('Should work with local variable', done => {
  expect(local.get()).toBe(0);
  local.onChange(val => {
    expect(val).toBe(1);
    expect(local.get()).toBe(1);
    done();
  });

  local.set(1);
});

test('Should work with remote variable', async done => {
  expect(await remote.get()).toBe(0);
  remote.onChange(async val => {
    expect(val).toBe(2);
    expect(await remote.get()).toBe(2);
    done();
  });

  await remote.set(2);
});

test('Should handle wildcard', () => {
  expect(local.get()).toBe(1);
  expect(local.get('/test/remote')).toBe(2);
  expect(local.get('/test/nothing')).toBe(0);
});

test('Should exit server', () => {
  server.close();
  connection.close();
});
