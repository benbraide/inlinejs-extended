import { GetGlobal, AddMagicHandler, CreateMagicHandlerCallback, CreateReadonlyProxy, FetchPathHandlerType, IFetchMockResponseParams } from "@benbraide/inlinejs";

import { FetchConcept } from "../concepts/fetch";
import { FetchConceptName } from "../names";

function CreateFetchProxy(){
    const getConcept = () => GetGlobal().GetConcept<FetchConcept>(FetchConceptName), methods = {
        install: () => GetGlobal().SetFetchConcept(getConcept()),
        uninstall: () => ((GetGlobal().GetFetchConcept() === getConcept()) && GetGlobal().SetFetchConcept(null)),
        get: (input: RequestInfo, init?: RequestInit) => getConcept()?.Get(input, init),
        addPathHandler: (path: string | RegExp, handler: FetchPathHandlerType) => getConcept()?.AddPathHandler(path, handler),
        removePathHandler: (handler: FetchPathHandlerType) => getConcept()?.RemovePathHandler(handler),
        mockResponse: (params: IFetchMockResponseParams) => getConcept()?.MockResponse(params),
        formData: (data: Record<string, string | Blob>) => {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => formData.append(key, value));
            return formData;
        },
    };

    return CreateReadonlyProxy(methods);
}

const FetchProxy = CreateFetchProxy();

export const FetchMagicHandler = CreateMagicHandlerCallback('fetch', () => FetchProxy);

export function FetchMagicHandlerCompact(){
    AddMagicHandler(FetchMagicHandler);
}
