(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ECRHub = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
var ClientError = (function (_super) {
    __extends(ClientError, _super);
    function ClientError(message, params) {
        var _this = _super.call(this, message) || this;
        if (params) {
            _this.code = params.code;
            _this.client = params.client;
            _this.detail = params.detail;
        }
        return _this;
    }
    return ClientError;
}(Error));
exports.default = ClientError;

},{}],2:[function(require,module,exports){
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
var utils_1 = require("./utils");
var client_1 = require("./ws/client");
var client_2 = require("./http/client");
var ClientError_1 = require("./ClientError");
var ClientPool = [];
exports.default = {
    create: function (url, option) {
        var protocol = (0, utils_1.getProtocol)(url);
        var clientMap = {
            WS: client_1.default,
            HTTP: client_2.default,
        };
        var ClientClass = clientMap[protocol];
        if (!ClientClass) {
            throw new Error('Unsupported protocol: ' + protocol);
        }
        var name = option.name || url;
        if (this.has(name)) {
            throw new ClientError_1.default("The client ".concat(name, " is already exists"));
        }
        var client = new ClientClass(url, __assign(__assign({}, option), { name: name }));
        ClientPool.push(client);
        return client;
    },
    destroy: function (client) {
        var _client = typeof client === 'string' ? this.get(client) : client;
        if (!_client)
            return false;
        _client.disconnect();
        ClientPool.splice(ClientPool.indexOf(_client), 1);
        return true;
    },
    getAll: function () {
        return ClientPool;
    },
    get: function (name) {
        return ClientPool.find(function (client) { return client.name === name; });
    },
    has: function (name) {
        return !!this.get(name);
    },
};

},{"./ClientError":1,"./http/client":6,"./utils":9,"./ws/client":11}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
var ClientError_1 = require("./ClientError");
var EventBus_1 = require("./EventBus");
var utils_1 = require("./utils");
var LivelyWatcher_1 = require("./LivelyWatcher");
var Client = (function (_super) {
    __extends(Client, _super);
    function Client(url, option) {
        var _this = _super.call(this) || this;
        _this.pay = {
            purchase: function (option, config) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2, this.postMessage(__assign({ topic: 'ecrhub.pay.order', trans_type: 1 }, option), config)];
                });
            }); },
            preAuth: function (option, config) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2, this.postMessage(__assign({ topic: 'ecrhub.pay.order', trans_type: 4 }, option), config)];
                });
            }); },
            query: function (option, config) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2, this.postMessage(__assign({ topic: 'ecrhub.pay.query' }, option), config)];
                });
            }); },
            close: function (option, config) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2, this.postMessage(__assign({ topic: 'ecrhub.pay.close' }, option), config).then(function () { return undefined; })];
                });
            }); },
            refund: function (option, config) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2, this.postMessage(__assign({ topic: 'ecrhub.pay.order', trans_type: 3 }, option), config).then(function () { return undefined; })];
                });
            }); },
        };
        _this.url = url;
        option = __assign({ timeout: 30000, name: url }, option);
        _this.name = option.name;
        _this.option = option;
        _this._livelyWatcher = new LivelyWatcher_1.default(_this);
        return _this;
    }
    Client.prototype.postMessage = function (message, config) {
        var _this = this;
        return this.doPostMessage(this.messagePostIntercept(message), config).then(function (res) {
            var body = _this.messageReceiveIntercept(res.body);
            if (!body.success) {
                return Promise.reject(new ClientError_1.default(body.msg, { detail: body }));
            }
            return body;
        });
    };
    ;
    Client.prototype.messagePostIntercept = function (message) {
        if (!message.msg_id)
            message.msg_id = (0, utils_1.guid)();
        if (!message.timestamp)
            message.timestamp = "".concat(Date.now());
        return message;
    };
    Client.prototype.messageReceiveIntercept = function (message) {
        if (message.success == null)
            message.success = true;
        else
            message.success = (0, utils_1.toBoolean)(message.success);
        return message;
    };
    Client.prototype.init = function () {
        var _this = this;
        return this.postMessage({
            topic: 'ecrhub.init',
        }).then(function (body) {
            _this.server = {
                app_name: body.app_name,
                cashier_version: body.cashier_version,
                device_sn: body.device_sn,
                device_model: body.device_model,
                description: body.description,
            };
            _this._livelyWatcher.start();
            return _this.server;
        });
    };
    return Client;
}(EventBus_1.default));
exports.Client = Client;

},{"./ClientError":1,"./EventBus":3,"./LivelyWatcher":4,"./utils":9}],6:[function(require,module,exports){
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("../client");
var request_1 = require("./request");
var HTTPClient = (function (_super) {
    __extends(HTTPClient, _super);
    function HTTPClient() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.protocol = 'HTTP';
        _this.connected = false;
        return _this;
    }
    HTTPClient.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.init()];
                    case 1:
                        _a.sent();
                        this.connected = true;
                        return [2];
                }
            });
        });
    };
    HTTPClient.prototype.disconnect = function () {
        this.server = undefined;
        this.connected = false;
    };
    HTTPClient.prototype.doPostMessage = function (message, options) {
        var _this = this;
        var topicPathMap = {
            'ecrhub.init': 'init',
            'ecrhub.pay.order': 'payOrder',
            'ecrhub.pay.close': 'payClose',
            'ecrhub.pay.query': 'payQuery',
        };
        var urlPath = topicPathMap[message.topic];
        return request_1.default.post([this.url, urlPath], message, { timeout: options === null || options === void 0 ? void 0 : options.timeout }).then(function (res) {
            var body = res.json();
            var msg = {
                body: body,
                client: _this,
            };
            return msg;
        });
    };
    return HTTPClient;
}(client_1.Client));
exports.default = HTTPClient;

},{"../client":5,"./request":7}],7:[function(require,module,exports){
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
function post(url, body, options) {
    if (Array.isArray(url)) {
        url = url.map(function (str) { return str.replace(/^\//, '').replace(/\/$/, ''); }).join('/');
    }
    return fetch(url, {
        method: 'post',
        body: JSON.stringify(body),
        headers: __assign({ 'Content-Type': 'application/json' }, options === null || options === void 0 ? void 0 : options.headers),
    });
}
exports.default = {
    post: post
};

},{}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ECRClient = exports.ECRClientManager = void 0;
var ClientManager_1 = require("./ClientManager");
exports.ECRClientManager = ClientManager_1.default;
exports.ECRClient = ClientManager_1.default.create;

},{"./ClientManager":2}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toBoolean = exports.parseJSONSafety = exports.guid = exports.getProtocol = void 0;
function getProtocol(url) {
    var protocol = url.split(':')[0];
    return protocol.toUpperCase();
}
exports.getProtocol = getProtocol;
function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0, v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
exports.guid = guid;
var parseJSONSafety = function (json, defaultValue) {
    if (typeof json === 'string') {
        try {
            return JSON.parse(json);
        }
        catch (e) {
            console.warn(e);
            return defaultValue;
        }
    }
    if (json == null)
        return defaultValue;
    return json;
};
exports.parseJSONSafety = parseJSONSafety;
function toBoolean(val) {
    if (typeof val === 'boolean')
        return val;
    switch (val) {
        case 'true':
            return true;
        case 'false':
            return false;
        case 0:
        case '0':
            return false;
        case 1:
        case '1':
            return true;
        default:
            return !!val;
    }
}
exports.toBoolean = toBoolean;

},{}],10:[function(require,module,exports){
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

},{"../ClientError":1}],11:[function(require,module,exports){
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

},{"../ClientError":1,"../client":5,"../utils":9,"./MessageSubscriber":10,"./heartbeat":12}],12:[function(require,module,exports){
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

},{}]},{},[8])(8)
});
