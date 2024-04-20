import { FindComponentById, GetGlobal, AddMagicHandler, CreateMagicHandlerCallback, IComponent, MergeObjects, ToString } from "@benbraide/inlinejs";

export function GetPost(resource: RequestInfo, handler: (response: any) => any, options?: RequestInit, responseHandler?: (response: Response) => any){
    responseHandler = (responseHandler || ((response: Response) => response.text()));
    return new Promise((resolve, reject) => {
        GetGlobal().GetFetchConcept().Get(resource, MergeObjects(MergeObjects({}, (options || {})), {
            method: 'GET',
            credentials: 'same-origin',
        })).then(responseHandler).then((response) => {
            try{
                resolve(handler(response));
            }
            catch (error){
                reject(error);
            }
        }).catch(reject);
    });
}

export type GetPostReturnType = 'text' | 'json' | 'any';

export function ResolveGetPostReturn(type: GetPostReturnType, response: any){
    if (type === 'any'){
        if (typeof response !== 'string'){
            return response;
        }
        
        try{
            return JSON.parse(response);
        }
        catch{}

        return response;
    }

    if (type === 'json'){
        return ((typeof response === 'object') ? response : JSON.parse(ToString(response)));
    }

    return response;
}

export const GetMagicHandler = CreateMagicHandlerCallback('get', () => {
    return (path: string | null, returnType: GetPostReturnType = 'any') => {
        return path && GetPost(path, response => ResolveGetPostReturn(returnType, response), {
            method: 'GET',
            credentials: 'same-origin',
        });
    };
});

export const PostMagicHandler = CreateMagicHandlerCallback('post', () => {
    return (path: string | null, options?: RequestInit, returnType: GetPostReturnType = 'any') => {
        return path && GetPost(path, response => ResolveGetPostReturn(returnType, response), MergeObjects(MergeObjects({}, (options || {})), {
            method: 'POST',
            credentials: 'same-origin',
        }));
    };
});

export function GetMagicHandlerCompact(){
    AddMagicHandler(GetMagicHandler);
    AddMagicHandler(PostMagicHandler);
}
