export type EndpointPath = string;

export interface Message {
  [a: string]: any;
  id?: any;
  type: string;
}

export interface RequestMessage extends Message {
  endpoint: EndpointPath;
}

export interface ReplyMessage extends Message {}

export interface Documentated {
  endpoint: EndpointPath;
  type: string;
  specificationOfType: string;
  description: string;
}

export type WriteFunction = (msg: ReplyMessage) => void;
export type ReplyCallback = (msg: ReplyMessage) => void;
export type EndpointCallback = (msg: RequestMessage, reply: WriteFunction) => void;
