"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Heartbeat = (function () {
    function Heartbeat(postMessage, interval) {
        if (interval === void 0) { interval = 5000; }
        this.activate = false;
        this.postMessage = postMessage;
        if (typeof interval === 'number') {
            this.interval = interval;
        }
        else {
            this.interval = interval ? 5000 : 0;
        }
    }
    Heartbeat.prototype.start = function () {
        var _this = this;
        if (!this.interval)
            return;
        this.activate = true;
        var _beat = function () {
            if (!_this.activate)
                return;
            _this.timer = setTimeout(function () {
                _this.postMessage({
                    topic: 'ecrhub.heartbeat',
                }).then(_beat, function (err) {
                    if (err.code === 'closed' || err.code === 'timeout') {
                        _this.stop();
                    }
                });
            }, _this.interval);
        };
        _beat();
    };
    Heartbeat.prototype.stop = function () {
        this.activate = false;
        clearInterval(this.timer);
    };
    return Heartbeat;
}());
exports.default = Heartbeat;
