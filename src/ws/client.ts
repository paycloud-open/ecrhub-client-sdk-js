import Heartbeat from './heartbeat';
import {Client, ProtocolType, RespMessage} from '../client';
import ClientError from '../ClientError';
import {parseJSONSafety} from '../utils';
import MessageSubscriber from './MessageSubscriber';

export interface WSRespMessage extends RespMessage {
    event: MessageEvent;
}

class WSClient extends Client {
    private _ws?: WebSocket;
    protocol: ProtocolType = 'WS';
    get connected() {
        return this._ws?.readyState === WebSocket.OPEN;
    }
    private _messageSubscriber = new MessageSubscriber();
    private _heartbeat = new Heartbeat(
        this.postMessage.bind(this),
        this.option?.heartbeat
    );

    connect() {
        return new Promise<void>((resolve, reject) => {
            this._ws = new WebSocket(this.url);
            this._ws.addEventListener('open', () => {
                this.init().then(() => {
                    resolve();
                    this.option?.success?.();
                    this.emit('connected', this);
                }, reject);
            });
            this._ws.addEventListener('error', (err) => {
                const error = new ClientError('Connect error', {
                    detail: err,
                });
                reject(error);
                this.option?.error?.(error);
                this.emit('error', error, this);
            });
            this._ws.addEventListener('close', (evt) => {
                this.server = undefined;
                this._heartbeat.stop();
                this.emit('disconnected', this, evt);
            });
            this._ws.addEventListener('message', (event) => {
                const body = parseJSONSafety(event.data);
                const message: WSRespMessage = {
                    body,
                    event,
                    client: this,
                };
                const id = body.msg_id;
                this._messageSubscriber.resolve(id, message);
                this.emit('message', message);
            });
        });
    }

    doPostMessage(message, config) {
        return new Promise<WSRespMessage>((resolve, reject) => {
            const send = () => {
                let timeout = config?.timeout;
                if (timeout == null) timeout = this.option?.timeout;
                this._ws!.send(JSON.stringify(message));
                this._messageSubscriber.subscribe(
                    message.msg_id,
                    {
                        resolve,
                        reject,
                    },
                    {
                        timeout,
                        onTimeout: () => {
                            this.emit('timeout', message, this);
                        }
                    },
                );
            };
            if (this.connected) {
                send();
            } else {
                this.connect().then(
                    () => {
                        send();
                    },
                    (err) => {
                        reject(
                            new ClientError(
                                err.message,
                                {
                                    code: err.code,
                                    detail: this._ws,
                                },
                            ),
                        );
                    },
                );
            }
        });
    }

    init() {
        return super.init().then((res) => {
            this._heartbeat.start();
            return res;
        })
    }

    disconnect(): void {
        this._messageSubscriber.clear();
        this._ws?.close();
    }

}

export default WSClient;
