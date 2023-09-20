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
