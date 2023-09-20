"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EventBus = (function () {
    function EventBus() {
        this._listeners = {};
    }
    EventBus.prototype.addListener = function (name, listener) {
        var _listeners = this._listeners;
        if (!_listeners[name])
            _listeners[name] = [];
        _listeners[name].push(listener);
    };
    EventBus.prototype.removeListener = function (name, listener) {
        var _listeners = this._listeners;
        var callbacks = _listeners[name];
        if (!callbacks)
            return false;
        if (!listener) {
            return delete _listeners[name];
        }
        var index = callbacks.findIndex(function (item) { return item === listener; });
        if (index < 0)
            return false;
        callbacks.splice(index, 1);
        return true;
    };
    EventBus.prototype.emit = function (name) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var _listeners = this._listeners;
        var callbacks = _listeners[name];
        if (!callbacks)
            return;
        callbacks.forEach(function (cb) {
            cb.apply(void 0, args);
        });
    };
    EventBus.prototype.hasListener = function (name) {
        var _a;
        return ((_a = this._listeners[name]) === null || _a === void 0 ? void 0 : _a.length) > 0;
    };
    EventBus.prototype.clearListeners = function () {
        this._listeners = {};
    };
    return EventBus;
}());
exports.default = EventBus;
