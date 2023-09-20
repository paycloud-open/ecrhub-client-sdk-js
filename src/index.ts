import ClientManager from './ClientManager';
export type {Client} from './client';

export const ECRClientManager = ClientManager;
export const ECRClient = ClientManager.create;
