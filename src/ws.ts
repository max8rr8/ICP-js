import { ICPConnection } from './client';
import { ICPServer } from './server';
import { Server } from 'http';
import WebSocket = require('isomorphic-ws');

export class WebSocketsICPServer extends ICPServer {
  protected server: WebSocket.Server;

  constructor(hServer: Server) {
    super();

    const server = new WebSocket.Server({ server: hServer });
    server.on('connection', socket => {
      let buf = '';
      socket.on('message', rawData => {
        try {
          const data = rawData.toString();
          for (const char of data) {
            if (char === '\n') {
              this.handle(JSON.parse(buf), msg => socket.send(JSON.stringify(msg) + '\n'));
              buf = '';
            } else {
              buf += char;
            }
          }
        } catch (e) {}
      });
    });

    this.server = server;
  }

  public close() {
    this.server.close();
  }
}

export class WebSocketsICPConnection extends ICPConnection {
  protected connection: WebSocket;
  private sendBuf: string[] = [];

  constructor(url: string) {
    super();

    this.connection = new WebSocket(url);
    let buf = '';
    this.connection.onmessage = rawData => {
      const data = rawData.data.toString();
      for (const char of data) {
        if (char === '\n') {
          this.handle(JSON.parse(buf));
          buf = '';
        } else {
          buf += char;
        }
      }
    };

    this.connection.onopen = () => this.connection.send(this.sendBuf.join('\n') + '\n');
  }

  public close() {
    this.connection.close();
  }

  protected __write(msg: string) {
    if (this.connection.readyState === this.connection.OPEN) this.connection.send(msg + '\n');
    else this.sendBuf.push(msg);
  }
}
