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
