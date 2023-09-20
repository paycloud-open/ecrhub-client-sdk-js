import {Client, ClientOption} from './client';
import {getProtocol} from './utils';
import WSClient from './ws/client';
import HTTPClient from './http/client';
import ClientError from "./ClientError";

const ClientPool: Client[] = [];
export default {
    create(url: string, option?: ClientOption): Client {
        const protocol = getProtocol(url);
        const clientMap: Record<string, any> = {
            WS: WSClient,
            HTTP: HTTPClient,
        };
        const ClientClass = clientMap[protocol];
        if (!ClientClass) {
            throw new Error('Unsupported protocol: ' + protocol);
        }
        const name = option.name || url;
        if (this.has(name)) {
            throw new ClientError(`The client ${name} is already exists`);
        }
        const client: Client = new ClientClass(url, {...option, name});
        ClientPool.push(client);
        return client;
    },
    destroy(client: Client | string) {
        const _client: Client = typeof client === 'string' ? this.get(client) : client;
        if (!_client) return false;
        _client.disconnect();
        ClientPool.splice(ClientPool.indexOf(_client), 1);
        return true;
    },
    getAll(): Client[] {
        return ClientPool;
    },
    get(name: string): Client {
        return ClientPool.find((client) => client.name === name);
    },
    has(name): boolean {
        return !!this.get(name);
    },
    // async scan(type?: ProtocolType): Promise<string[]> {
    //     if (type) return [];
    //     return [];
    // },
};
