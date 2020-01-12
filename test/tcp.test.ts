import { TcpICPServer, TcpICPConnection } from '../src/tcp';

let server: TcpICPServer;
let connection: TcpICPConnection;

test('Should create server', () => {
  server = new TcpICPServer(3232);
  server.subcribe('/test', (msg, reply) =>
    reply({
      type: 'ok',
      test: 'ok'
    })
  );
});

test('Should create client', () => {
  connection = new TcpICPConnection('localhost', 3232);
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
  connection.close();
});
