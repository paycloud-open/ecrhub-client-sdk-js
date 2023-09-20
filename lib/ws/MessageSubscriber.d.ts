/// <reference types="node" />
import ClientError from '../ClientError';
import { WSRespMessage } from './client';
export interface Subscribe {
    resolve: (message: WSRespMessage) => void;
    reject: (error?: ClientError) => void;
    timer?: NodeJS.Timeout;
}
export default class MessageSubscriber {
    private _subscribeMap;
    subscribe(id: string, subscribe: Pick<Subscribe, 'resolve' | 'reject'>, options?: {
        timeout?: number;
        onTimeout?: () => void;
    }): void;
    resolve(id: string, message: WSRespMessage): boolean;
    reject(id: string, event?: any): Subscribe;
    clear(): void;
}
