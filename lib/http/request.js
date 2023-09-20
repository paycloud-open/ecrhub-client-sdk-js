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
