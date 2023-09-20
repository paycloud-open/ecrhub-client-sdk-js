import {ECRClientManager, Client} from "./index";
export * from './index';

declare global {
    interface ECRHub {
        ClientManager: typeof ECRClientManager;
        Client: Client;
    }

    interface Window {
        ECRHub
    }

    const ECRHub: ECRHub;
}
