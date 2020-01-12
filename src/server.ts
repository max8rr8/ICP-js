import { EndpointCallback, Documentated, EndpointPath, RequestMessage, ReplyMessage, WriteFunction } from './types';

interface Endpoint {
  endpoint: RegExp;
  callback: EndpointCallback;
}

function wildcardToRegex(wildcard: string): RegExp {
  return new RegExp(
    '^' +
      wildcard
        .replace(/\*/g, '.*')
        .replace(/\/:[a-zA-Z0-9]+/g, '/[^/]*')
        .replace(/\//g, '/') +
      '$'
  );
}

export class ICPServer {
  protected endpoints: Endpoint[] = [];
  protected documentation: Documentated[] = [];

  public subcribe(endpoint: EndpointPath, callback: EndpointCallback) {
    this.endpoints.push({
      endpoint: wildcardToRegex(endpoint),
      callback
    });
  }

  public documentate(doc: Documentated) {
    this.documentation.push(doc);
  }

  public getDocumentation() {
    return JSON.stringify(this.documentation);
  }

  protected handle(msg: RequestMessage, write: WriteFunction) {
    let sendedReply = false;

    for (let i = 0; i < this.endpoints.length && !sendedReply; i++) {
      if (this.endpoints[i].endpoint.test(msg.endpoint)) {
        this.endpoints[i].callback(msg, reply => {
          reply.id = msg.id;
          write(reply);
          sendedReply = true;
        });
      }
    }

    if (!sendedReply) {
      const reply: ReplyMessage = {
        type: 'error',
        msg: `Endpoint '${msg.endpoint}' not found`,
        code: -1,
        id: msg.id
      };
      write(reply);
    }
  }
}
