import { GetGlobal, AddMagicHandler, CreateMagicHandlerCallback, CreateReadonlyProxy } from "@benbraide/inlinejs";
import { FetchConcept } from "../concepts/fetch";
const ExtendedFetch = new FetchConcept();
function CreateFetchProxy() {
    let methods = {
        install: () => GetGlobal().SetFetchConcept(ExtendedFetch),
        uninstall: () => GetGlobal().SetFetchConcept(null),
        get: (input, init) => ExtendedFetch.Get(input, init),
        addPathHandler: (path, handler) => ExtendedFetch.AddPathHandler(path, handler),
        removePathHandler: (handler) => ExtendedFetch.RemovePathHandler(handler),
        mockResponse: (params) => ExtendedFetch.MockResponse(params),
    };
    return CreateReadonlyProxy(methods);
}
const FetchProxy = CreateFetchProxy();
export const FetchMagicHandler = CreateMagicHandlerCallback('fetch', () => FetchProxy);
export function FetchMagicHandlerCompact() {
    AddMagicHandler(FetchMagicHandler);
}
