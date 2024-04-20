import { GetGlobal, AddMagicHandler, CreateMagicHandlerCallback, CreateReadonlyProxy } from "@benbraide/inlinejs";
import { FetchConceptName } from "../names";
function CreateFetchProxy() {
    const getConcept = () => GetGlobal().GetConcept(FetchConceptName), methods = {
        install: () => GetGlobal().SetFetchConcept(getConcept()),
        uninstall: () => ((GetGlobal().GetFetchConcept() === getConcept()) && GetGlobal().SetFetchConcept(null)),
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
    return CreateReadonlyProxy(methods);
}
const FetchProxy = CreateFetchProxy();
export const FetchMagicHandler = CreateMagicHandlerCallback('fetch', () => FetchProxy);
export function FetchMagicHandlerCompact() {
    AddMagicHandler(FetchMagicHandler);
}
