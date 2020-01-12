import { ReplyCallback, RequestMessage, ReplyMessage } from './types';

export class ICPConnection {
  protected handlers: Map<number, any> = new Map();
  public send(msg: RequestMessage, callback: ReplyCallback) {
    const id = Math.random() * 0xffffff;
    msg.id = id;
    this.handlers.set(id, callback);
    this.__write(JSON.stringify(msg));
  }

  protected __write(msg: string) {
    console.warn(
      'Called default ICPConnection handler, maybe you trying to create pure IPCConnection instead use something real such as TcpICPConnection'
    );
  }

  protected handle(msg: ReplyMessage) {
    if (this.handlers.has(msg.id)) {
      this.handlers.get(msg.id)(msg);
      this.handlers.delete(msg.id);
    }
  }
}
