"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ECRClient = exports.ECRClientManager = void 0;
var ClientManager_1 = require("./ClientManager");
exports.ECRClientManager = ClientManager_1.default;
exports.ECRClient = ClientManager_1.default.create;
