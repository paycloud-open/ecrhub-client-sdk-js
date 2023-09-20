import { Client } from './client';

export default class ClientError<T = any> extends Error {
    code?: string | number;
    client?: Client;
    detail?: T;

    constructor(
        message: string,
        params?: {
            code?: string | number;
            detail?: T;
            client?: Client;
        },
    ) {
        super(message);
        if (params) {
            this.code = params.code;
            this.client = params.client;
            this.detail = params.detail;
        }
    }
}
