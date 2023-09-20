"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var ClientError_1 = require("../ClientError");
var MessageSubscriber = (function () {
    function MessageSubscriber() {
        this._subscribeMap = new Map();
    }
    MessageSubscriber.prototype.subscribe = function (id, subscribe, options) {
        var _this = this;
        var subs = __assign({}, subscribe);
        var timeout = options === null || options === void 0 ? void 0 : options.timeout;
        if (timeout != null && timeout > 0) {
            subs.timer = setTimeout(function () {
                var _a;
                _this.reject(id, new ClientError_1.default('timeout', { code: 'timeout' }));
                (_a = options === null || options === void 0 ? void 0 : options.onTimeout) === null || _a === void 0 ? void 0 : _a.call(options);
            }, timeout);
        }
        this._subscribeMap.set(id, subs);
    };
    MessageSubscriber.prototype.resolve = function (id, message) {
        var subscribe = this._subscribeMap.get(id);
        if (!subscribe)
            return false;
        this._subscribeMap.delete(id);
        if (subscribe.timer) {
            clearTimeout(subscribe.timer);
        }
        subscribe.resolve(message);
    };
    MessageSubscriber.prototype.reject = function (id, event) {
        var subscribe = this._subscribeMap.get(id);
        if (!subscribe)
            return undefined;
        this._subscribeMap.delete(id);
        if (subscribe.timer) {
            clearTimeout(subscribe.timer);
        }
        subscribe.reject(event);
        return subscribe;
    };
    MessageSubscriber.prototype.clear = function () {
        this._subscribeMap.clear();
    };
    return MessageSubscriber;
}());
exports.default = MessageSubscriber;
