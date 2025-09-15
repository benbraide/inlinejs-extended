"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormatMagicHandler = void 0;
exports.FormatMagicHandlerCompact = FormatMagicHandlerCompact;
const inlinejs_1 = require("@benbraide/inlinejs");
exports.FormatMagicHandler = (0, inlinejs_1.CreateMagicHandlerCallback)('format', ({ componentId, component, contextElement }) => {
    let [elementKey, proxy, scope] = (0, inlinejs_1.InitJITProxy)('format', (component || (0, inlinejs_1.FindComponentById)(componentId)), contextElement);
    if (!elementKey || proxy) { //Invalid context element OR proxy already exists
        return proxy;
    }
    let affix = (data, value, callback) => {
        return (0, inlinejs_1.StreamData)(data, (data) => {
            return (0, inlinejs_1.StreamData)(value, value => callback(data, value));
        });
    };
    let queueCheckpoint = 0, formatters = {
        nextTick: (data) => {
            let checkpoint = ++queueCheckpoint;
            return new Promise((resolve) => {
                var _a;
                return (_a = (0, inlinejs_1.FindComponentById)(componentId)) === null || _a === void 0 ? void 0 : _a.GetBackend().changes.AddNextTickHandler(() => {
                    if (data instanceof Promise) {
                        data.then((value) => resolve((checkpoint === queueCheckpoint) ? value : (0, inlinejs_1.GetGlobal)().CreateNothing()));
                    }
                    else { //Resolve
                        resolve((checkpoint === queueCheckpoint) ? data : (0, inlinejs_1.GetGlobal)().CreateNothing());
                    }
                });
            });
        },
        comma: (data) => (0, inlinejs_1.StreamData)(data, (data) => {
            let [beforePoint, afterPoint = ''] = (0, inlinejs_1.ToString)(data).split('.');
            beforePoint = beforePoint.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return (afterPoint ? `${beforePoint}.${afterPoint}` : beforePoint);
        }),
        prefix: (data, value) => affix(data, value, (data, value) => (value + data)),
        suffix: (data, value) => affix(data, value, (data, value) => (data + value)),
        affix: (data, prefix, suffix) => affix(data, prefix, (data, value) => affix((value + data), suffix, (data, value) => (data + value))),
        round: (data, dp, truncateZeroes = false) => (0, inlinejs_1.StreamData)(data, (data) => {
            let parsed = parseFloat((0, inlinejs_1.ToString)(data));
            if (!parsed && parsed !== 0) {
                return parsed;
            }
            const fixed = parsed.toFixed(dp || 0);
            return (truncateZeroes ? fixed.replace(/(\.\d*?[1-9])0+$/g, "$1").replace(/\.0+$/g, '') : fixed);
        }),
        map: (data, keys) => (0, inlinejs_1.StreamData)(data, (data) => {
            if (Array.isArray(data)) {
                return (Array.isArray(keys) ? data.filter((v, index) => keys.includes(index)) : data[(typeof keys === 'string') ? parseInt(keys) : keys]);
            }
            if ((0, inlinejs_1.IsObject)(data)) {
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
        currency: (data, currencyCode = 'USD', locale = undefined) => (0, inlinejs_1.StreamData)(data, (data) => {
            const parsed = parseFloat((0, inlinejs_1.ToString)(data));
            if (isNaN(parsed)) {
                return data;
            }
            try {
                return new Intl.NumberFormat(locale, { style: 'currency', currency: currencyCode }).format(parsed);
            }
            catch ( //Fallback for invalid currency code
            _a) { //Fallback for invalid currency code
                return `${currencyCode} ${parsed.toFixed(2)}`;
            }
        }),
        truncate: (data, limit, trail = '...') => (0, inlinejs_1.StreamData)(data, (data) => {
            const str = (0, inlinejs_1.ToString)(data);
            if (str.length <= limit) {
                return str;
            }
            return `${str.substring(0, limit)}${trail}`;
        }),
        plural: (data, singular, plural) => (0, inlinejs_1.StreamData)(data, (data) => {
            const num = parseInt((0, inlinejs_1.ToString)(data));
            if (num === 1) {
                return singular;
            }
            return (plural === undefined) ? `${singular}s` : plural;
        }),
    };
    return (scope[elementKey] = (0, inlinejs_1.CreateReadonlyProxy)(formatters));
});
function FormatMagicHandlerCompact() {
    (0, inlinejs_1.AddMagicHandler)(exports.FormatMagicHandler);
}
