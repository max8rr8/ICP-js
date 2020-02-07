import { ICPConnection } from './client';
import { ICPServer } from './server';
import { createServer, Socket, Server } from 'net';

export class TcpICPServer extends ICPServer {
  protected server: Server;

  constructor(port = 32, hostname = '0.0.0.0') {
    super();

    const server = createServer(socket => {
      let buf = '';
      socket.on('data', rawData => {
        try {
          const data = rawData.toString();
          for (const char of data) {
            if (char === '\n') {
              this.handle(JSON.parse(buf), msg => {
                try {
                  if (socket.writable && !socket.destroyed) socket.write(JSON.stringify(msg) + '\n');
                } catch (e) {}
              });
              buf = '';
            } else {
              buf += char;
            }
          }
        } catch (e) {}
      });
    });

    server.listen(port, hostname);
    this.server = server;
  }

  public close() {
    this.server.close();
    this.server.unref();
  }
}

export class TcpICPConnection extends ICPConnection {
  protected connection: Socket;

  constructor(host: string, port = 32) {
    super();

    this.connection = new Socket();
    this.connection.connect(port, host);
    let buf = '';
    this.connection.on('data', rawData => {
      try {
        const data = rawData.toString();
        for (const char of data) {
          if (char === '\n') {
            this.handle(JSON.parse(buf));
            buf = '';
          } else {
            buf += char;
          }
        }
      } catch (e) {}
    });
  }

  public close() {
    this.connection.end();
    this.connection.unref();
  }

  protected __write(msg: string) {
    this.connection.write(msg + '\n');
  }
}
