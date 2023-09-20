declare class ClientError<T = any> extends Error {
	code?: string | number;
	client?: Client;
	detail?: T;
	constructor(message: string, params?: {
		code?: string | number;
		detail?: T;
		client?: Client;
	});
}
export type Listener = (...args: any[]) => any;
declare class EventBus {
	private _listeners;
	addListener(name: string, listener: Listener): void;
	removeListener(name: string, listener?: Listener): boolean;
	emit(name: string, ...args: any): void;
	hasListener(name: string): boolean;
	clearListeners(): void;
}
export type ClientOption = {
	timeout?: number;
	retry?: number;
	success?: () => void;
	error?: (error: ClientError) => void;
	name?: string;
	lazy?: boolean | number;
	heartbeat?: boolean | number;
};
export type ProtocolType = "HTTP" | "WS" | "SP";
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
export type RequiredCommonMessage = CommonMessage & Required<Pick<CommonMessage, "msg_id" | "timestamp">>;
export interface ReceivedMessage extends RequiredCommonMessage {
	success: boolean;
	msg?: string;
}
export interface RespMessage<BT = any> {
	body?: BT;
	client: Client;
}
export interface MessagePostConfig {
	timeout?: number;
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
export declare abstract class Client extends EventBus {
	readonly url: string;
	readonly name?: string;
	readonly option?: ClientOption;
	server?: ServerInfo;
	abstract protocol: ProtocolType;
	private _livelyWatcher;
	abstract get connected(): boolean;
	constructor(url: string, option?: ClientOption);
	abstract connect(): Promise<void>;
	abstract disconnect(): void;
	protected abstract doPostMessage(message: RequiredCommonMessage, config?: MessagePostConfig): Promise<RespMessage>;
	protected postMessage(message: CommonMessage, config?: MessagePostConfig): Promise<ReceivedMessage>;
	protected messagePostIntercept(message: CommonMessage): RequiredCommonMessage;
	protected messageReceiveIntercept(message: ReceivedMessage & {
		success: string | boolean;
	}): ReceivedMessage;
	init(): Promise<ServerInfo>;
	pay: PayService;
}
export declare const ECRClientManager: {
	create(url: string, option?: ClientOption): Client;
	destroy(client: string | Client): boolean;
	getAll(): Client[];
	get(name: string): Client;
	has(name: any): boolean;
};
export declare const ECRClient: (url: string, option?: ClientOption) => Client;

export {};
