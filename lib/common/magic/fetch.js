"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FetchMagicHandlerCompact = exports.FetchMagicHandler = void 0;
const inlinejs_1 = require("@benbraide/inlinejs");
const names_1 = require("../names");
function CreateFetchProxy() {
    let getConcept = () => (0, inlinejs_1.GetGlobal)().GetConcept(names_1.FetchConceptName);
    let methods = {
        install: () => (0, inlinejs_1.GetGlobal)().SetFetchConcept(getConcept()),
        uninstall: () => (((0, inlinejs_1.GetGlobal)().GetFetchConcept() === getConcept()) && (0, inlinejs_1.GetGlobal)().SetFetchConcept(null)),
        get: (input, init) => { var _a; return (_a = getConcept()) === null || _a === void 0 ? void 0 : _a.Get(input, init); },
        addPathHandler: (path, handler) => { var _a; return (_a = getConcept()) === null || _a === void 0 ? void 0 : _a.AddPathHandler(path, handler); },
        removePathHandler: (handler) => { var _a; return (_a = getConcept()) === null || _a === void 0 ? void 0 : _a.RemovePathHandler(handler); },
        mockResponse: (params) => { var _a; return (_a = getConcept()) === null || _a === void 0 ? void 0 : _a.MockResponse(params); },
    };
    return (0, inlinejs_1.CreateReadonlyProxy)(methods);
}
const FetchProxy = CreateFetchProxy();
exports.FetchMagicHandler = (0, inlinejs_1.CreateMagicHandlerCallback)('fetch', () => FetchProxy);
function FetchMagicHandlerCompact() {
    (0, inlinejs_1.AddMagicHandler)(exports.FetchMagicHandler);
}
exports.FetchMagicHandlerCompact = FetchMagicHandlerCompact;
