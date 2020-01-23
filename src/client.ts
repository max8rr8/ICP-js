import { ReplyCallback, RequestMessage, ReplyMessage } from './types';

export class ICPConnection {
  protected handlers: Map<number, (msg: ReplyMessage) => void> = new Map();

  public send(msg: RequestMessage): Promise<ReplyMessage>;
  public send(msg: RequestMessage, callback: ReplyCallback): void;
  public send(msg: RequestMessage, callback?: ReplyCallback): Promise<ReplyMessage> | void {
    const promise: Promise<ReplyMessage> = new Promise(resolve => {
      const id = Math.random() * 0xffffff;
      msg.id = id;
      this.handlers.set(id, out => resolve(out));
      this.__write(JSON.stringify(msg));
    });
    if (!callback) return promise;
    else promise.then(callback);
  }

  protected __write(msg: string) {
    console.warn(
      'Called default ICPConnection handler, maybe you trying to create pure IPCConnection instead use something real such as TcpICPConnection'
    );
  }

  protected handle(msg: ReplyMessage) {
    if (this.handlers.has(msg.id)) {
      (this.handlers.get(msg.id) ?? (() => 0))(msg);
      this.handlers.delete(msg.id);
    }
  }
}
