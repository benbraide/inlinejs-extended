import { FetchPathHandlerType, IExtendedFetchConcept, IFetchMockResponseParams, NativeFetchConcept } from "@benbraide/inlinejs";
export declare class FetchConcept extends NativeFetchConcept implements IExtendedFetchConcept {
    private origin_;
    private handlers_;
    constructor(origin_?: string);
    Get(input: RequestInfo, init?: RequestInit): Promise<Response>;
    AddPathHandler(path: string | RegExp, handler: FetchPathHandlerType): void;
    RemovePathHandler(handler: FetchPathHandlerType): void;
    MockResponse({ response, delay, errorText }: IFetchMockResponseParams): Promise<Response>;
    private FindPathHandler_;
}
