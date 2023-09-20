import {CommonMessage} from '../client';
import {WSRespMessage} from './client';

type PostMessage = (message: CommonMessage) => Promise<WSRespMessage>;

class Heartbeat {
    private readonly postMessage: PostMessage;
    private readonly interval: number;
    private timer?: NodeJS.Timeout;
    private activate: boolean = false;

    constructor(postMessage: PostMessage, interval: boolean | number = 5000) {
        this.postMessage = postMessage;
        if (typeof interval === 'number') {
            this.interval = interval;
        } else {
            this.interval = interval ? 5000 : 0;
        }
    }

    start() {
        if (!this.interval) return;
        this.activate = true;
        const _beat = () => {
            if (!this.activate) return;
            this.timer = setTimeout(() => {
                this.postMessage({
                    topic: 'ecrhub.heartbeat',
                }).then(_beat, (err) => {
                    if (err.code === 'closed' || err.code === 'timeout') {
                        this.stop();
                    }
                });
            }, this.interval);
        };
        _beat();
    }

    stop() {
        this.activate = false;
        clearInterval(this.timer);
    }
}

export default Heartbeat;
