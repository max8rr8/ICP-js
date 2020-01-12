import { ICPConnection } from '../src/client';
import { ReplyMessage, RequestMessage } from '../src/types';

class TestICPConnection extends ICPConnection {
  protected __write(msg: string): void {
    this.handle({
      type: 'ok',
      id: JSON.parse(msg).id
    });
  }
}

let connection: TestICPConnection;

test('Should create ICPClient', () => {
  connection = new TestICPConnection();
});

test('Should recieve reply', done => {
  connection.send({ endpoint: '/test', type: 'test' }, () => done());
});
