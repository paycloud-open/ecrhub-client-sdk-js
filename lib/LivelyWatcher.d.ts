import { Client } from './client';
declare class LivelyWatcher {
    private client;
    private timer;
    private readonly timeout;
    constructor(client: Client);
    private onMessage;
    start: () => boolean;
    stop: () => void;
    refresh: () => void;
}
export default LivelyWatcher;
