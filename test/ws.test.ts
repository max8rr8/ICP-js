import { WebSocketsICPServer, WebSocketsICPConnection } from '../src/ws';
import { createServer, Server } from 'http';

let server: Server = createServer();
server.listen(8032);

let connection: WebSocketsICPConnection;

test('Should create server', () => {
  let wserver = new WebSocketsICPServer(server);
  wserver.subscribe('/test', (msg, reply) =>
    reply({
      type: 'ok',
      test: 'ok'
    })
  );
});

test('Should create client', () => {
  connection = new WebSocketsICPConnection('ws://localhost:8032');
});

test('Should get answer from server', done => {
  connection.send(
    {
      endpoint: '/test',
      type: 'test'
    },
    msg => {
      done(msg.test == 'ok' ? undefined : 'Not ok');
    }
  );
});

test('Should exit server', () => {
  server.close();
  server.unref();
  connection.close();
});
