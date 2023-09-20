import {Client,RespMessage} from './client';

class LivelyWatcher {
    private client: Client;
    private timer: NodeJS.Timeout;
    private readonly timeout: number;

    constructor(client: Client) {
        this.client = client;
        let lazy = this.client.option?.lazy;
        if (!lazy) {
            this.timeout = 0;
        } else {
            this.timeout = lazy === true ? 1000 * 60 * 3 : lazy;
        }
    }

    private onMessage = (message: RespMessage) => {
        if (message.body.topic !== 'ecrhub.heartbeat') {
            this.refresh();
        }
    }
    start = (): boolean => {
        if (!this.timeout) return false;
        this.client.addListener('message', this.onMessage);
        this.refresh();
        return true;
    }
    stop = () => {
        clearTimeout(this.timer);
        this.client.removeListener('message', this.onMessage);
    }
    refresh = () => {
        if (!this.timeout) return;
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            this.client.disconnect();
        }, this.timeout);
    }
}

export default LivelyWatcher;
