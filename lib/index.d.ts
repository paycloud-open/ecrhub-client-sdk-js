export type { Client } from './client';
export declare const ECRClientManager: {
    create(url: string, option?: import("./client").ClientOption): import("./client").Client;
    destroy(client: string | import("./client").Client): boolean;
    getAll(): import("./client").Client[];
    get(name: string): import("./client").Client;
    has(name: any): boolean;
};
export declare const ECRClient: (url: string, option?: import("./client").ClientOption) => import("./client").Client;
