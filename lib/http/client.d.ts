import { Client, ProtocolType, RespMessage } from "../client";
export type HTTPRespMessage = RespMessage;
declare class HTTPClient extends Client {
    protocol: ProtocolType;
    connected: boolean;
    connect(): Promise<void>;
    disconnect(): void;
    doPostMessage(message: any, options: any): Promise<HTTPRespMessage>;
}
export default HTTPClient;
