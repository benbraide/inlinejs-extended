export declare function GetPost(resource: RequestInfo, handler: (response: any) => any, options?: RequestInit, responseHandler?: (response: Response) => any): Promise<unknown>;
export declare type GetPostReturnType = 'text' | 'json' | 'any';
export declare function ResolveGetPostReturn(type: GetPostReturnType, response: any): any;
export declare const GetMagicHandler: import("@benbraide/inlinejs").IMagicHandlerCallbackDetails;
export declare const PostMagicHandler: import("@benbraide/inlinejs").IMagicHandlerCallbackDetails;
export declare function GetMagicHandlerCompact(): void;
