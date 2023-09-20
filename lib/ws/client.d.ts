import { Client, ProtocolType, RespMessage } from '../client';
export interface WSRespMessage extends RespMessage {
    event: MessageEvent;
}
declare class WSClient extends Client {
    private _ws?;
    protocol: ProtocolType;
    get connected(): boolean;
    private _messageSubscriber;
    private _heartbeat;
    connect(): Promise<void>;
    doPostMessage(message: any, config: any): Promise<WSRespMessage>;
    init(): Promise<import("../client").ServerInfo>;
    disconnect(): void;
}
export default WSClient;
