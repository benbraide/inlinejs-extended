import { FindComponentById, StreamData, GetGlobal, AddMagicHandler, CreateMagicHandlerCallback, CreateReadonlyProxy, InitJITProxy, IsObject, ToString } from "@benbraide/inlinejs";
export const FormatMagicHandler = CreateMagicHandlerCallback('format', ({ componentId, component, contextElement }) => {
    let [elementKey, proxy, scope] = InitJITProxy('format', (component || FindComponentById(componentId)), contextElement);
    if (!elementKey || proxy) { //Invalid context element OR proxy already exists
        return proxy;
    }
    let affix = (data, value, callback) => {
        return StreamData(data, (data) => {
            return StreamData(value, value => callback(data, value));
        });
    };
    let queueCheckpoint = 0, formatters = {
        nextTick: (data) => {
            let checkpoint = ++queueCheckpoint;
            return new Promise((resolve) => {
                var _a;
                return (_a = FindComponentById(componentId)) === null || _a === void 0 ? void 0 : _a.GetBackend().changes.AddNextTickHandler(() => {
                    if (data instanceof Promise) {
                        data.then((value) => resolve((checkpoint === queueCheckpoint) ? value : GetGlobal().CreateNothing()));
                    }
                    else { //Resolve
                        resolve((checkpoint === queueCheckpoint) ? data : GetGlobal().CreateNothing());
                    }
                });
            });
        },
        comma: (data) => StreamData(data, (data) => {
            let [beforePoint, afterPoint = ''] = ToString(data).split('.');
            beforePoint = beforePoint.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return (afterPoint ? `${beforePoint}.${afterPoint}` : beforePoint);
        }),
        prefix: (data, value) => affix(data, value, (data, value) => (value + data)),
        suffix: (data, value) => affix(data, value, (data, value) => (data + value)),
        affix: (data, prefix, suffix) => affix(data, prefix, (data, value) => affix((value + data), suffix, (data, value) => (data + value))),
        round: (data, dp, truncateZeroes = false) => StreamData(data, (data) => {
            let parsed = parseFloat(ToString(data));
            if (!parsed && parsed !== 0) {
                return parsed;
            }
            let fixed = (Math.round(parsed * 100) / 100).toFixed(dp || 0);
            return (truncateZeroes ? fixed.replace(/(\.\d*?[1-9])0+$/g, "$1").replace(/\.0+$/g, '') : fixed);
        }),
        map: (data, keys) => StreamData(data, (data) => {
            if (Array.isArray(data)) {
                return (Array.isArray(keys) ? data.filter((v, index) => keys.includes(index)) : data.at((typeof keys === 'string') ? parseInt(keys) : keys));
            }
            if (IsObject(data)) {
                if (!Array.isArray(keys)) {
                    return data[keys.toString()];
                }
                let mapped = {};
                Object.entries(data).forEach(([key, value]) => {
                    if (keys.includes(key)) {
                        mapped[key] = value;
                    }
                });
                return mapped;
            }
            return data;
        }),
    };
    return (scope[elementKey] = CreateReadonlyProxy(formatters));
});
export function FormatMagicHandlerCompact() {
    AddMagicHandler(FormatMagicHandler);
}
