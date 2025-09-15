"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FetchMagicHandler = void 0;
exports.FetchMagicHandlerCompact = FetchMagicHandlerCompact;
const inlinejs_1 = require("@benbraide/inlinejs");
const names_1 = require("../names");
function CreateFetchProxy() {
    const getConcept = () => (0, inlinejs_1.GetGlobal)().GetConcept(names_1.FetchConceptName), methods = {
        install: () => (0, inlinejs_1.GetGlobal)().SetFetchConcept(getConcept()),
        uninstall: () => (((0, inlinejs_1.GetGlobal)().GetFetchConcept() === getConcept()) && (0, inlinejs_1.GetGlobal)().SetFetchConcept(null)),
        get: (input, init) => { var _a; return (_a = getConcept()) === null || _a === void 0 ? void 0 : _a.Get(input, init); },
        addPathHandler: (path, handler) => { var _a; return (_a = getConcept()) === null || _a === void 0 ? void 0 : _a.AddPathHandler(path, handler); },
        removePathHandler: (handler) => { var _a; return (_a = getConcept()) === null || _a === void 0 ? void 0 : _a.RemovePathHandler(handler); },
        mockResponse: (params) => { var _a; return (_a = getConcept()) === null || _a === void 0 ? void 0 : _a.MockResponse(params); },
        formData: (data) => {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => formData.append(key, value));
            return formData;
        },
    };
    return (0, inlinejs_1.CreateReadonlyProxy)(methods);
}
const FetchProxy = CreateFetchProxy();
exports.FetchMagicHandler = (0, inlinejs_1.CreateMagicHandlerCallback)('fetch', () => FetchProxy);
function FetchMagicHandlerCompact() {
    (0, inlinejs_1.AddMagicHandler)(exports.FetchMagicHandler);
}
