import { ICPServer } from './server';
import { EndpointPath, RequestMessage, WriteFunction, ReplyMessage } from './types';
import { ICPConnection } from './client';

type ContinueCallback = (msg: RequestMessage) => void;
type BeforeCallback = (msg: RequestMessage, write: WriteFunction, next: ContinueCallback) => void;
type AfterCallback = (msg: ReplyMessage, write: WriteFunction) => void;

type Method = (params: any, callback: (reply: any)=>void)=>Promise<any>|void

export class LocalMethod {
  protected server: ICPServer;
  protected endpoint: EndpointPath;
  protected method: Method;
  protected beforeCallback: BeforeCallback;
  protected afterCallback: AfterCallback;
  
  constructor(server: ICPServer, endpoint: EndpointPath, func: Method) {
    this.server = server;
    this.endpoint = endpoint;
    this.method = func
    this.beforeCallback = (msg, write, next) => next(msg);
    this.afterCallback = (msg, write) => write(msg);
    
    server.subscribe(endpoint, (dMsg, dWrite) => {
      const write = (msg: ReplyMessage) => this.afterCallback(msg, dWrite);
      this.beforeCallback(dMsg, write, msg => {
        if (msg.type === 'call') {
          this.call(msg.params, e=>write({
            type: 'ok',
            returns: e
          }))

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

  public call(params: any): Promise<any>;
  public call(params: any, callback: (val: any)=>void): void;
  public call(params: any, callback?: (val: any)=>void): void | Promise<any> {
    let promise = new Promise(resolve=>{
      const rep = this.method(params, resolve)
      if(rep instanceof Promise) rep.then(resolve)
    })

    if(callback) promise.then(callback)
    else return promise
  }
}

export class RemoteMethod {
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

  public call(params: any): Promise<any>;
  public call(params: any, callback: (val: any)=>void): void;
  public call(params: any, callback?: (val: any)=>void): void | Promise<any> {
    let promise = this.connection.send({
      endpoint: this.endpoint,
      type: 'call',
      params
    }).then(e=>e.returns)

    if(!callback) promise.then(callback)
    else return promise
  }
}
