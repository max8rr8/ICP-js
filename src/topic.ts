import { ICPServer } from './server';
import { EndpointPath, RequestMessage, WriteFunction, ReplyMessage } from './types';
import { ICPConnection } from './client';

type ContinueCallback = (msg: RequestMessage) => void;
type BeforeCallback = (msg: RequestMessage, write: WriteFunction, next: ContinueCallback) => void;
type AfterCallback = (msg: ReplyMessage, write: WriteFunction) => void;

export class LocalTopic<T> {
  protected server: ICPServer;
  protected endpoint: EndpointPath;
  protected beforeCallback: BeforeCallback;
  protected afterCallback: AfterCallback;
  protected subscribers: Map<string, Array<(value: T) => void>>;

  constructor(server: ICPServer, endpoint: EndpointPath) {
    this.server = server;
    this.endpoint = endpoint;
    this.beforeCallback = (msg, write, next) => next(msg);
    this.afterCallback = (msg, write) => write(msg);
    this.subscribers = new Map();

    server.subscribe(endpoint, (dMsg, dWrite) => {
      const write = (msg: ReplyMessage) => this.afterCallback(msg, dWrite);
      this.beforeCallback(dMsg, write, msg => {
        if (msg.type === 'subscribe') {
          this.onChange(msg.endpoint, val => {
            write({
              type: 'publish',
              value: val
            });
          });
        } else {
          write({
            type: 'error',
            code: 1,
            msg: 'Incoreect type'
          });
        }
      });
    });
  }

  public publish(value: T): void;
  public publish(endpoint: EndpointPath, value: T): void;
  public publish(endpointOrV: EndpointPath | T, nothingOrValue?: T) {
    const value = nothingOrValue ?? (endpointOrV as T);
    const endpoint = nothingOrValue === undefined ? this.endpoint : (endpointOrV as string);
    (this.subscribers.get(endpoint) ?? []).forEach(e => e(value));
    this.subscribers.set(endpoint, []);
  }

  public onChange(callback: (val: T) => void): void;
  public onChange(endpoint: EndpointPath, callback: (val: T) => void): void;
  public onChange(endpointOrV: EndpointPath | ((val: T) => void), nothingOrValue?: (val: T) => void) {
    const value = nothingOrValue ?? (endpointOrV as (val: T) => void);
    const endpoint = nothingOrValue !== undefined ? (endpointOrV as string) : this.endpoint;
    this.subscribers.set(endpoint, [...(this.subscribers.get(endpoint) ?? []), value]);
  }
}

export class RemoteTopic<T> {
  protected connection: ICPConnection;
  protected endpoint: EndpointPath;
  protected beforeCallback: BeforeCallback;
  protected afterCallback: AfterCallback;

  constructor(connection: ICPConnection, endpoint: EndpointPath) {
    this.connection = connection;
    this.endpoint = endpoint;
    this.beforeCallback = (msg, write, next) => next(msg);
    this.afterCallback = (msg, write) => write(msg);
  }

  public async subscribe(callback: (value: T) => void) {
    this.connection.send(
      {
        endpoint: this.endpoint,
        type: 'subscribe'
      },
      msg => {
        callback(msg.value);
      }
    );
  }
}
