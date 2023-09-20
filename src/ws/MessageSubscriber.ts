import ClientError from '../ClientError';
import {WSRespMessage} from './client';

export interface Subscribe {
    resolve: (message: WSRespMessage) => void;
    reject: (error?: ClientError) => void;
    timer?: NodeJS.Timeout;
}

export default class MessageSubscriber {
    private _subscribeMap = new Map<string, Subscribe>();

    public subscribe(
        id: string,
        subscribe: Pick<Subscribe, 'resolve' | 'reject'>,
        options?: {
            timeout?: number,
            onTimeout?: () => void
        },
    ) {
        const subs: Subscribe = {...subscribe};
        let timeout = options?.timeout;
        if (timeout != null && timeout > 0) {
            subs.timer = setTimeout(() => {
                this.reject(
                    id,
                    new ClientError('timeout', {code: 'timeout'}),
                );
                options?.onTimeout?.();
            }, timeout);
        }
        this._subscribeMap.set(id, subs);
    }

    public resolve(id: string, message: WSRespMessage) {
        const subscribe = this._subscribeMap.get(id);
        if (!subscribe) return false;
        this._subscribeMap.delete(id);
        if (subscribe.timer) {
            clearTimeout(subscribe.timer);
        }
        subscribe.resolve(message);
    }

    public reject(id: string, event?: any) {
        const subscribe = this._subscribeMap.get(id);
        if (!subscribe) return undefined;
        this._subscribeMap.delete(id);
        if (subscribe.timer) {
            clearTimeout(subscribe.timer);
        }
        subscribe.reject(event);
        return subscribe;
    }

    public clear() {
        this._subscribeMap.clear();
    }
}
