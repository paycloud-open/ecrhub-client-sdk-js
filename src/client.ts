import ClientError from './ClientError';
import EventBus from './EventBus';
import {guid, toBoolean} from './utils';
import LivelyWatcher from "./LivelyWatcher";

export type ClientOption = {
    timeout?: number;
    retry?: number;
    success?: () => void;
    error?: (error: ClientError) => void;
    name?: string;
    lazy?: boolean | number;
    heartbeat?: boolean | number;
};
export type ProtocolType = 'HTTP' | 'WS' | 'SP';

export interface ServerInfo {
    app_name: string;
    cashier_version: string;
    device_model: string;
    device_sn: string;
    description?: string;
}

export interface CommonMessage {
    timestamp?: string;
    app_id?: string;
    msg_id?: string;
    version?: string;
    topic?: string;

    [key: string]: any;
}

export type RequiredCommonMessage = CommonMessage &
    Required<Pick<CommonMessage, 'msg_id' | 'timestamp'>>;

export interface ReceivedMessage extends RequiredCommonMessage {
    success: boolean;
    msg?: string;
}

export interface RespMessage<BT = any> {
    body?: BT;
    client: Client;
}

export interface MessagePostConfig {
    timeout?: number
}

export interface PaymentOption {
    app_id: string;
    merchant_order_no: string;
    order_amount: string | number;
    price_currency: string;

    [key: string]: any;
}

export interface PayService {
    purchase: (options: PaymentOption, config?: MessagePostConfig) => Promise<object>;
    preAuth: (options: PaymentOption, config?: MessagePostConfig) => Promise<object>;
    query: (options: {
        app_id: string;
        merchant_order_no: string;
    }, config?: MessagePostConfig) => Promise<object>;
    close: (options: {
        app_id: string;
        merchant_order_no: string;
    }, config?: MessagePostConfig) => Promise<void>;
    refund: (options: {
        app_id: string;
        merchant_order_no: string;
    }, config?: MessagePostConfig) => Promise<void>;
}

export abstract class Client extends EventBus {
    readonly url: string;
    readonly name?: string;
    readonly option?: ClientOption;
    server?: ServerInfo;
    abstract protocol: ProtocolType;
    private _livelyWatcher:LivelyWatcher;

    abstract get connected(): boolean;

    constructor(url: string, option?: ClientOption) {
        super();
        this.url = url;
        option = {
            timeout: 30000,
            name: url,
            ...option,
        }
        this.name = option.name;
        this.option = option;
        this._livelyWatcher = new LivelyWatcher(this);
    }

    public abstract connect(): Promise<void>;

    public abstract disconnect(): void;

    protected abstract doPostMessage(message: RequiredCommonMessage, config?: MessagePostConfig): Promise<RespMessage>;

    protected postMessage(message: CommonMessage, config?: MessagePostConfig) {
        return this.doPostMessage(this.messagePostIntercept(message), config).then(res => {
            const body = this.messageReceiveIntercept(res.body);
            if (!body.success) {
                return Promise.reject(
                    new ClientError(body.msg!, {detail: body}),
                );
            }
            return body;
        });
    };

    protected messagePostIntercept(
        message: CommonMessage,
    ): RequiredCommonMessage {
        if (!message.msg_id) message.msg_id = guid();
        if (!message.timestamp) message.timestamp = `${Date.now()}`;
        return message as RequiredCommonMessage;
    }

    protected messageReceiveIntercept(
        message: ReceivedMessage & { success: string | boolean },
    ): ReceivedMessage {
        if (message.success == null) message.success = true;
        else message.success = toBoolean(message.success);
        return message;
    }

    public init(): Promise<ServerInfo> {
        return this.postMessage({
            topic: 'ecrhub.init',
        }).then((body) => {
            this.server = {
                app_name: body.app_name,
                cashier_version: body.cashier_version,
                device_sn: body.device_sn,
                device_model: body.device_model,
                description: body.description,
            };
            this._livelyWatcher.start();
            return this.server;
        });
    }

    public pay: PayService = {
        purchase: async (option, config) => {
            return this.postMessage({
                topic: 'ecrhub.pay.order',
                trans_type: 1,
                ...option,
            }, config);
        },
        preAuth: async (option, config) => {
            return this.postMessage({
                topic: 'ecrhub.pay.order',
                trans_type: 4,
                ...option,
            }, config);
        },
        query: async (option, config) => {
            return this.postMessage({
                topic: 'ecrhub.pay.query',
                ...option,
            }, config);
        },
        close: async (option, config) => {
            return this.postMessage({
                topic: 'ecrhub.pay.close',
                ...option,
            }, config).then(() => undefined);
        },
        refund: async (option, config) => {
            return this.postMessage({
                topic: 'ecrhub.pay.order',
                trans_type: 3,
                ...option,
            }, config).then(() => undefined);
        },
    };
}
