"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LivelyWatcher = (function () {
    function LivelyWatcher(client) {
        var _this = this;
        var _a;
        this.onMessage = function (message) {
            if (message.body.topic !== 'ecrhub.heartbeat') {
                _this.refresh();
            }
        };
        this.start = function () {
            if (!_this.timeout)
                return false;
            _this.client.addListener('message', _this.onMessage);
            _this.refresh();
            return true;
        };
        this.stop = function () {
            clearTimeout(_this.timer);
            _this.client.removeListener('message', _this.onMessage);
        };
        this.refresh = function () {
            if (!_this.timeout)
                return;
            clearTimeout(_this.timer);
            _this.timer = setTimeout(function () {
                _this.client.disconnect();
            }, _this.timeout);
        };
        this.client = client;
        var lazy = (_a = this.client.option) === null || _a === void 0 ? void 0 : _a.lazy;
        if (!lazy) {
            this.timeout = 0;
        }
        else {
            this.timeout = lazy === true ? 1000 * 60 * 3 : lazy;
        }
    }
    return LivelyWatcher;
}());
exports.default = LivelyWatcher;
