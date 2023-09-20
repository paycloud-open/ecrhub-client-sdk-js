import { Client, ClientOption } from './client';
declare const _default: {
    create(url: string, option?: ClientOption): Client;
    destroy(client: Client | string): boolean;
    getAll(): Client[];
    get(name: string): Client;
    has(name: any): boolean;
};
export default _default;
