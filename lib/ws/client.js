"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var heartbeat_1 = require("./heartbeat");
var client_1 = require("../client");
var ClientError_1 = require("../ClientError");
var utils_1 = require("../utils");
var MessageSubscriber_1 = require("./MessageSubscriber");
var WSClient = (function (_super) {
    __extends(WSClient, _super);
    function WSClient() {
        var _this = this;
        var _a;
        _this = _super.apply(this, arguments) || this;
        _this.protocol = 'WS';
        _this._messageSubscriber = new MessageSubscriber_1.default();
        _this._heartbeat = new heartbeat_1.default(_this.postMessage.bind(_this), (_a = _this.option) === null || _a === void 0 ? void 0 : _a.heartbeat);
        return _this;
    }
    Object.defineProperty(WSClient.prototype, "connected", {
        get: function () {
            var _a;
            return ((_a = this._ws) === null || _a === void 0 ? void 0 : _a.readyState) === WebSocket.OPEN;
        },
        enumerable: false,
        configurable: true
    });
    WSClient.prototype.connect = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._ws = new WebSocket(_this.url);
            _this._ws.addEventListener('open', function () {
                _this.init().then(function () {
                    var _a, _b;
                    resolve();
                    (_b = (_a = _this.option) === null || _a === void 0 ? void 0 : _a.success) === null || _b === void 0 ? void 0 : _b.call(_a);
                    _this.emit('connected', _this);
                }, reject);
            });
            _this._ws.addEventListener('error', function (err) {
                var _a, _b;
                var error = new ClientError_1.default('Connect error', {
                    detail: err,
                });
                reject(error);
                (_b = (_a = _this.option) === null || _a === void 0 ? void 0 : _a.error) === null || _b === void 0 ? void 0 : _b.call(_a, error);
                _this.emit('error', error, _this);
            });
            _this._ws.addEventListener('close', function (evt) {
                _this.server = undefined;
                _this._heartbeat.stop();
                _this.emit('disconnected', _this, evt);
            });
            _this._ws.addEventListener('message', function (event) {
                var body = (0, utils_1.parseJSONSafety)(event.data);
                var message = {
                    body: body,
                    event: event,
                    client: _this,
                };
                var id = body.msg_id;
                _this._messageSubscriber.resolve(id, message);
                _this.emit('message', message);
            });
        });
    };
    WSClient.prototype.doPostMessage = function (message, config) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var send = function () {
                var _a;
                var timeout = config === null || config === void 0 ? void 0 : config.timeout;
                if (timeout == null)
                    timeout = (_a = _this.option) === null || _a === void 0 ? void 0 : _a.timeout;
                _this._ws.send(JSON.stringify(message));
                _this._messageSubscriber.subscribe(message.msg_id, {
                    resolve: resolve,
                    reject: reject,
                }, {
                    timeout: timeout,
                    onTimeout: function () {
                        _this.emit('timeout', message, _this);
                    }
                });
            };
            if (_this.connected) {
                send();
            }
            else {
                _this.connect().then(function () {
                    send();
                }, function (err) {
                    reject(new ClientError_1.default(err.message, {
                        code: err.code,
                        detail: _this._ws,
                    }));
                });
            }
        });
    };
    WSClient.prototype.init = function () {
        var _this = this;
        return _super.prototype.init.call(this).then(function (res) {
            _this._heartbeat.start();
            return res;
        });
    };
    WSClient.prototype.disconnect = function () {
        var _a;
        this._messageSubscriber.clear();
        (_a = this._ws) === null || _a === void 0 ? void 0 : _a.close();
    };
    return WSClient;
}(client_1.Client));
exports.default = WSClient;
