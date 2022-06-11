import { FindComponentById, CreateMagicHandlerCallback, AddMagicHandler } from "@benbraide/inlinejs";
let cachedWaits = new Array();
export function Wait(componentId, data, transitionData, contextElement) {
    var _a, _b, _c, _d;
    if (!(data instanceof Promise)) {
        return data;
    }
    let cacheIndex = cachedWaits.findIndex(info => (info.componentId === componentId && info.data === data && info.contextElement === contextElement));
    let cache = ((cacheIndex == -1) ? null : cachedWaits[cacheIndex]);
    if (cache) {
        if (cache.resolved) {
            cachedWaits.splice(cacheIndex, 1);
            return cache.value;
        }
        return cache.transitionData;
    }
    let id = (_a = FindComponentById(componentId)) === null || _a === void 0 ? void 0 : _a.GenerateUniqueId('global_wait_');
    if (!id) {
        return data;
    }
    cachedWaits.push({ componentId, id, data, transitionData, contextElement });
    (_b = FindComponentById(componentId)) === null || _b === void 0 ? void 0 : _b.GetBackend().changes.AddGetAccess(`${id}.resolved`);
    data.then((value) => {
        var _a;
        let cache = cachedWaits.find(info => (info.id === id));
        if (cache) { //Alert
            cache.resolved = true;
            cache.value = value;
            (_a = FindComponentById(componentId)) === null || _a === void 0 ? void 0 : _a.GetBackend().changes.AddComposed(`${id}.resolved`);
        }
    });
    contextElement && ((_d = (_c = FindComponentById(componentId)) === null || _c === void 0 ? void 0 : _c.FindElementScope(contextElement)) === null || _d === void 0 ? void 0 : _d.AddUninitCallback(() => {
        cachedWaits = cachedWaits.filter(info => (info.id !== id));
    }));
    return transitionData;
}
export const WaitMagicHandler = CreateMagicHandlerCallback('wait', ({ componentId, contextElement }) => {
    ;
    return (data, transitionData) => Wait(componentId, data, transitionData, contextElement);
});
export function WaitMagicHandlerCompact() {
    AddMagicHandler(WaitMagicHandler);
}
