import { ICPServer } from '../src/server';
import { ReplyMessage, RequestMessage } from '../src/types';

class TestICPServer extends ICPServer {
  request(msg: RequestMessage): Promise<ReplyMessage> {
    return new Promise(resolve => this.handle(msg, msg => resolve(msg)));
  }
}

let server: TestICPServer;

test('Should create ICPServer', () => {
  server = new TestICPServer();
});

test('Should reply with same id', async () => {
  let iniID = Math.random() * 0xffff;
  let reply = await server.request({
    endpoint: '/test/id',
    id: iniID,
    type: 'test'
  });
  expect(reply.id).toBe(iniID);
});

test('Should reply with not found if no endpoint', async () => {
  let reply = await server.request({
    endpoint: '/test/not_found',
    id: Math.random() * 0xffff,
    type: 'test'
  });
  expect(reply.type).toBe('error');
  expect(reply.msg).toBe("Endpoint '/test/not_found' not found");
  expect(reply.code).toBe(-1);
});

test('Should register endpoint', async () => {
  server.subcribe('/test/normal', (req, reply) =>
    reply({
      type: 'ok'
    })
  );

  server.subcribe('/test/echo', (req, reply) =>
    reply({
      type: 'ok',
      echo: req.echo
    })
  );

  server.subcribe('/test/any/*', (req, reply) =>
    reply({
      type: 'ok',
      wildcard: 1,
      endpoint: req.endpoint
    })
  );

  server.subcribe('/test/:smth/replyOK', (req, reply) =>
    reply({
      type: 'ok',
      wildcard: 2,
      endpoint: req.endpoint
    })
  );
});

test('Should reply on fixed path endpoints', async () => {
  let [rep1, rep2] = await Promise.all([
    server.request({
      endpoint: '/test/normal',
      type: 'test'
    }),
    server.request({
      endpoint: '/test/echo',
      echo: 'testing echo',
      type: 'test'
    })
  ]);

  expect(rep1.type).toBe('ok');
  expect(rep2.type).toBe('ok');
  expect(rep2.echo).toBe('testing echo');
});

test('Should reply on wildcard path endpoints', async () => {
  let [rep1, rep2, rep3, rep4] = await Promise.all([
    server.request({
      endpoint: '/test/any/random',
      type: 'test'
    }),
    server.request({
      endpoint: '/test/should/replyOK',
      echo: 'testing echo',
      type: 'test'
    }),
    server.request({
      endpoint: '/test/notany/random',
      type: 'test'
    }),
    server.request({
      endpoint: '/test/should/notreplyOK',
      echo: 'testing echo',
      type: 'test'
    })
  ]);

  expect(rep1.type).toBe('ok');
  expect(rep2.type).toBe('ok');
  expect(rep3.type).toBe('error');
  expect(rep4.type).toBe('error');
});
