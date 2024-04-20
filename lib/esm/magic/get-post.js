import { GetGlobal, AddMagicHandler, CreateMagicHandlerCallback, MergeObjects, ToString } from "@benbraide/inlinejs";
export function GetPost(resource, handler, options, responseHandler) {
    responseHandler = (responseHandler || ((response) => response.text()));
    return new Promise((resolve, reject) => {
        GetGlobal().GetFetchConcept().Get(resource, MergeObjects(MergeObjects({}, (options || {})), {
            method: 'GET',
            credentials: 'same-origin',
        })).then(responseHandler).then((response) => {
            try {
                resolve(handler(response));
            }
            catch (error) {
                reject(error);
            }
        }).catch(reject);
    });
}
export function ResolveGetPostReturn(type, response) {
    if (type === 'any') {
        if (typeof response !== 'string') {
            return response;
        }
        try {
            return JSON.parse(response);
        }
        catch (_a) { }
        return response;
    }
    if (type === 'json') {
        return ((typeof response === 'object') ? response : JSON.parse(ToString(response)));
    }
    return response;
}
export const GetMagicHandler = CreateMagicHandlerCallback('get', () => {
    return (path, returnType = 'any') => {
        return path && GetPost(path, response => ResolveGetPostReturn(returnType, response), {
            method: 'GET',
            credentials: 'same-origin',
        });
    };
});
export const PostMagicHandler = CreateMagicHandlerCallback('post', () => {
    return (path, options, returnType = 'any') => {
        return path && GetPost(path, response => ResolveGetPostReturn(returnType, response), MergeObjects(MergeObjects({}, (options || {})), {
            method: 'POST',
            credentials: 'same-origin',
        }));
    };
});
export function GetMagicHandlerCompact() {
    AddMagicHandler(GetMagicHandler);
    AddMagicHandler(PostMagicHandler);
}
