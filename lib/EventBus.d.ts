type Listener = (...args: any[]) => any;
declare class EventBus {
    private _listeners;
    addListener(name: string, listener: Listener): void;
    removeListener(name: string, listener?: Listener): boolean;
    emit(name: string, ...args: any): void;
    hasListener(name: string): boolean;
    clearListeners(): void;
}
export default EventBus;
