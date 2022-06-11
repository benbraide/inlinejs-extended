import { FindComponentById, CreateMagicHandlerCallback, AddMagicHandler } from "@benbraide/inlinejs";

interface CachedWaitInfo{
    componentId: string;
    id: string;
    data: any;
    transitionData?: any;
    resolved?: boolean;
    value?: any;
    contextElement?: HTMLElement;
}

let cachedWaits = new Array<CachedWaitInfo>();

export function Wait(componentId: string, data: any, transitionData?: any, contextElement?: HTMLElement){
    if (!(data instanceof Promise)){
        return data;
    }

    let cacheIndex = cachedWaits.findIndex(info => (info.componentId === componentId && info.data === data && info.contextElement === contextElement));
    let cache = ((cacheIndex == -1) ? null : cachedWaits[cacheIndex]);
    
    if (cache){
        if (cache.resolved){
            cachedWaits.splice(cacheIndex, 1);
            return cache.value;
        }

        return cache.transitionData;
    }
    
    let id = FindComponentById(componentId)?.GenerateUniqueId('global_wait_');
    if (!id){
        return data;
    }

    cachedWaits.push({ componentId, id, data, transitionData, contextElement });
    FindComponentById(componentId)?.GetBackend().changes.AddGetAccess(`${id}.resolved`);

    data.then((value) => {
        let cache = cachedWaits.find(info => (info.id === id));
        if (cache){//Alert
            cache.resolved = true;
            cache.value = value;
            FindComponentById(componentId)?.GetBackend().changes.AddComposed(`${id}.resolved`);
        }
    });

    contextElement && FindComponentById(componentId)?.FindElementScope(contextElement)?.AddUninitCallback(() => {
        cachedWaits = cachedWaits.filter(info => (info.id !== id));
    });

    return transitionData;
}

export const WaitMagicHandler = CreateMagicHandlerCallback('wait', ({ componentId, contextElement }) => {;
    return (data: any, transitionData?: any) => Wait(componentId, data, transitionData, contextElement)
});

export function WaitMagicHandlerCompact(){
    AddMagicHandler(WaitMagicHandler);
}
