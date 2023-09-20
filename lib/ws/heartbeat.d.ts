import { CommonMessage } from '../client';
import { WSRespMessage } from './client';
type PostMessage = (message: CommonMessage) => Promise<WSRespMessage>;
declare class Heartbeat {
    private readonly postMessage;
    private readonly interval;
    private timer?;
    private activate;
    constructor(postMessage: PostMessage, interval?: boolean | number);
    start(): void;
    stop(): void;
}
export default Heartbeat;
