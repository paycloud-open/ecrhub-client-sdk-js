import {Client, ProtocolType, RespMessage} from "../client";
import request from "./request";

export type HTTPRespMessage = RespMessage;

class HTTPClient extends Client {
    protocol: ProtocolType = 'HTTP';
    connected = false;

    async connect() {
        await this.init();
        this.connected = true;
    }

    disconnect(): void {
        this.server = undefined;
        this.connected = false;
    }

    doPostMessage(message, options) {
        const topicPathMap = {
            'ecrhub.init': 'init',
            'ecrhub.pay.order': 'payOrder',
            'ecrhub.pay.close': 'payClose',
            'ecrhub.pay.query': 'payQuery',
        }
        const urlPath = topicPathMap[message.topic];
        return request.post([this.url, urlPath], message, {timeout: options?.timeout}).then(res => {
            const body = res.json();
            const msg: HTTPRespMessage = {
                body,
                client: this,
            }
            return msg;
        });
    }

}

export default HTTPClient;
