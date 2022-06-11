"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaitMagicHandlerCompact = exports.WaitMagicHandler = exports.Wait = void 0;
const inlinejs_1 = require("@benbraide/inlinejs");
let cachedWaits = new Array();
function Wait(componentId, data, transitionData, contextElement) {
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
    let id = (_a = (0, inlinejs_1.FindComponentById)(componentId)) === null || _a === void 0 ? void 0 : _a.GenerateUniqueId('global_wait_');
    if (!id) {
        return data;
    }
    cachedWaits.push({ componentId, id, data, transitionData, contextElement });
    (_b = (0, inlinejs_1.FindComponentById)(componentId)) === null || _b === void 0 ? void 0 : _b.GetBackend().changes.AddGetAccess(`${id}.resolved`);
    data.then((value) => {
        var _a;
        let cache = cachedWaits.find(info => (info.id === id));
        if (cache) { //Alert
            cache.resolved = true;
            cache.value = value;
            (_a = (0, inlinejs_1.FindComponentById)(componentId)) === null || _a === void 0 ? void 0 : _a.GetBackend().changes.AddComposed(`${id}.resolved`);
        }
    });
    contextElement && ((_d = (_c = (0, inlinejs_1.FindComponentById)(componentId)) === null || _c === void 0 ? void 0 : _c.FindElementScope(contextElement)) === null || _d === void 0 ? void 0 : _d.AddUninitCallback(() => {
        cachedWaits = cachedWaits.filter(info => (info.id !== id));
    }));
    return transitionData;
}
exports.Wait = Wait;
exports.WaitMagicHandler = (0, inlinejs_1.CreateMagicHandlerCallback)('wait', ({ componentId, contextElement }) => {
    ;
    return (data, transitionData) => Wait(componentId, data, transitionData, contextElement);
});
function WaitMagicHandlerCompact() {
    (0, inlinejs_1.AddMagicHandler)(exports.WaitMagicHandler);
}
exports.WaitMagicHandlerCompact = WaitMagicHandlerCompact;
