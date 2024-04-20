"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMagicHandlerCompact = exports.PostMagicHandler = exports.GetMagicHandler = exports.ResolveGetPostReturn = exports.GetPost = void 0;
const inlinejs_1 = require("@benbraide/inlinejs");
function GetPost(resource, handler, options, responseHandler) {
    responseHandler = (responseHandler || ((response) => response.text()));
    return new Promise((resolve, reject) => {
        (0, inlinejs_1.GetGlobal)().GetFetchConcept().Get(resource, (0, inlinejs_1.MergeObjects)((0, inlinejs_1.MergeObjects)({}, (options || {})), {
            method: 'GET',
            credentials: 'same-origin',
        })).then(responseHandler).then((response) => {
            try {
                resolve(handler(response));
            }
            catch (error) {
                reject(error);
            }
        }).catch(reject);
    });
}
exports.GetPost = GetPost;
function ResolveGetPostReturn(type, response) {
    if (type === 'any') {
        if (typeof response !== 'string') {
            return response;
        }
        try {
            return JSON.parse(response);
        }
        catch (_a) { }
        return response;
    }
    if (type === 'json') {
        return ((typeof response === 'object') ? response : JSON.parse((0, inlinejs_1.ToString)(response)));
    }
    return response;
}
exports.ResolveGetPostReturn = ResolveGetPostReturn;
exports.GetMagicHandler = (0, inlinejs_1.CreateMagicHandlerCallback)('get', () => {
    return (path, returnType = 'any') => {
        return path && GetPost(path, response => ResolveGetPostReturn(returnType, response), {
            method: 'GET',
            credentials: 'same-origin',
        });
    };
});
exports.PostMagicHandler = (0, inlinejs_1.CreateMagicHandlerCallback)('post', () => {
    return (path, options, returnType = 'any') => {
        return path && GetPost(path, response => ResolveGetPostReturn(returnType, response), (0, inlinejs_1.MergeObjects)((0, inlinejs_1.MergeObjects)({}, (options || {})), {
            method: 'POST',
            credentials: 'same-origin',
        }));
    };
});
function GetMagicHandlerCompact() {
    (0, inlinejs_1.AddMagicHandler)(exports.GetMagicHandler);
    (0, inlinejs_1.AddMagicHandler)(exports.PostMagicHandler);
}
exports.GetMagicHandlerCompact = GetMagicHandlerCompact;
