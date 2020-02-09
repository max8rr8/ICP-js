import { TcpICPServer, TcpICPConnection } from '../src/tcp';
import { LocalTopic, RemoteTopic } from '../src/topic';

let server: TcpICPServer;
let connection: TcpICPConnection;

let local: LocalTopic<number>;
let remote: RemoteTopic<number>;

test('Should create local topic', () => {
  server = new TcpICPServer(3234);
  local = new LocalTopic(server, '/test/*');
});

test('Should create client', () => {
  connection = new TcpICPConnection('localhost', 3234);
  remote = new RemoteTopic(connection, '/test/remote');
});

test('Should work with local topic', done => {
  local.onChange(val => {
    expect(val).toBe(1);
    done();
  });

  local.publish(1);
});

test('Should work with remote topic', async done => {
  remote.subscribe(async val => {
    expect(val).toBe(2);
    done();
  });

  setInterval(() => local.publish('/test/remote', 2), 100); //.unref();
});

test('Should exit server', () => {
  server.close();
  connection.close();
});
