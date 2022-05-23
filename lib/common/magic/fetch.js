"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FetchMagicHandlerCompact = exports.FetchMagicHandler = void 0;
const inlinejs_1 = require("@benbraide/inlinejs");
const fetch_1 = require("../concepts/fetch");
const ExtendedFetch = new fetch_1.FetchConcept();
function CreateFetchProxy() {
    let methods = {
        install: () => (0, inlinejs_1.GetGlobal)().SetFetchConcept(ExtendedFetch),
        uninstall: () => (0, inlinejs_1.GetGlobal)().SetFetchConcept(null),
        get: (input, init) => ExtendedFetch.Get(input, init),
        addPathHandler: (path, handler) => ExtendedFetch.AddPathHandler(path, handler),
        removePathHandler: (handler) => ExtendedFetch.RemovePathHandler(handler),
        mockResponse: (params) => ExtendedFetch.MockResponse(params),
    };
    return (0, inlinejs_1.CreateReadonlyProxy)(methods);
}
const FetchProxy = CreateFetchProxy();
exports.FetchMagicHandler = (0, inlinejs_1.CreateMagicHandlerCallback)('fetch', () => FetchProxy);
function FetchMagicHandlerCompact() {
    (0, inlinejs_1.AddMagicHandler)(exports.FetchMagicHandler);
}
exports.FetchMagicHandlerCompact = FetchMagicHandlerCompact;
