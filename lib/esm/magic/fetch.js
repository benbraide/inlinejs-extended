import { GetGlobal, AddMagicHandler, CreateMagicHandlerCallback, CreateReadonlyProxy } from "@benbraide/inlinejs";
function CreateFetchProxy() {
    let getConcept = () => GetGlobal().GetConcept('extended_fetch');
    let methods = {
        install: () => GetGlobal().SetFetchConcept(getConcept()),
        uninstall: () => ((GetGlobal().GetFetchConcept() === getConcept()) && GetGlobal().SetFetchConcept(null)),
        get: (input, init) => { var _a; return (_a = getConcept()) === null || _a === void 0 ? void 0 : _a.Get(input, init); },
        addPathHandler: (path, handler) => { var _a; return (_a = getConcept()) === null || _a === void 0 ? void 0 : _a.AddPathHandler(path, handler); },
        removePathHandler: (handler) => { var _a; return (_a = getConcept()) === null || _a === void 0 ? void 0 : _a.RemovePathHandler(handler); },
        mockResponse: (params) => { var _a; return (_a = getConcept()) === null || _a === void 0 ? void 0 : _a.MockResponse(params); },
    };
    return CreateReadonlyProxy(methods);
}
const FetchProxy = CreateFetchProxy();
export const FetchMagicHandler = CreateMagicHandlerCallback('fetch', () => FetchProxy);
export function FetchMagicHandlerCompact() {
    AddMagicHandler(FetchMagicHandler);
}
