"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerMagicHandlerCompact = exports.ServerMagicHandler = void 0;
const inlinejs_1 = require("@benbraide/inlinejs");
function CreateServerProxy() {
    let getConcept = () => (0, inlinejs_1.GetGlobal)().GetConcept('server');
    let methods = {
        upload: (url, init, method = 'POST') => { var _a; return (_a = getConcept()) === null || _a === void 0 ? void 0 : _a.Upload(url, init, method); },
        download: (url, init, method = 'POST') => { var _a; return (_a = getConcept()) === null || _a === void 0 ? void 0 : _a.Download(url, init, method); },
        duplex: (url, init, method = 'POST') => { var _a; return (_a = getConcept()) === null || _a === void 0 ? void 0 : _a.Duplex(url, init, method); },
    };
    return (0, inlinejs_1.CreateReadonlyProxy)(methods);
}
const ServerProxy = CreateServerProxy();
exports.ServerMagicHandler = (0, inlinejs_1.CreateMagicHandlerCallback)('server', () => ServerProxy);
function ServerMagicHandlerCompact() {
    (0, inlinejs_1.AddMagicHandler)(exports.ServerMagicHandler);
}
exports.ServerMagicHandlerCompact = ServerMagicHandlerCompact;
