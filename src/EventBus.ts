type Listener = (...args: any[]) => any;

class EventBus {
    private _listeners: Record<string, Listener[]> = {};

    addListener(name: string, listener: Listener) {
        const { _listeners } = this;
        if (!_listeners[name]) _listeners[name] = [];
        _listeners[name].push(listener);
    }

    removeListener(name: string, listener?: Listener): boolean {
        const { _listeners } = this;
        const callbacks = _listeners[name];
        if (!callbacks) return false;
        if (!listener) {
            return delete _listeners[name];
        }
        const index = callbacks.findIndex(
            (item: Listener) => item === listener,
        );
        if (index < 0) return false;
        callbacks.splice(index, 1);
        return true;
    }

    emit(name: string, ...args: any) {
        const { _listeners } = this;
        const callbacks = _listeners[name];
        if (!callbacks) return;
        callbacks.forEach((cb: (..._args: any) => any) => {
            cb(...args);
        });
    }

    hasListener(name: string): boolean {
        return this._listeners[name]?.length > 0;
    }

    clearListeners() {
        this._listeners = {};
    }
}

export default EventBus;
