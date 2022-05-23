import {
    GetGlobal,
    AddMagicHandler,
    CreateMagicHandlerCallback,
    CreateReadonlyProxy,
    IResourceConcept,
    IResourceGetParams
} from "@benbraide/inlinejs";

function CreateResourceProxy(){
    const getCollectionConcept = () => GetGlobal().GetConcept<IResourceConcept>('resource');
    let methods = {
        get: (params: IResourceGetParams) => getCollectionConcept()?.Get(params),
        getStyle: (path: string | Array<string>, concurrent?: boolean, attributes?: Record<string, string>) => {
            return getCollectionConcept()?.GetStyle(path, concurrent, attributes);
        },
        getScript: (path: string | Array<string>, concurrent?: boolean, attributes?: Record<string, string>) => {
            return getCollectionConcept()?.GetScript(path, concurrent, attributes);
        },
        getData: (path: string | Array<string>, concurrent?: boolean, json?: boolean) => {
            return getCollectionConcept()?.GetData(path, concurrent, json);
        },
    };

    return CreateReadonlyProxy(methods);
}

const ResourceProxy = CreateResourceProxy();

export const ResourceMagicHandler = CreateMagicHandlerCallback('resource', () => ResourceProxy);

export function ResourceMagicHandlerCompact(){
    AddMagicHandler(ResourceMagicHandler);
}
