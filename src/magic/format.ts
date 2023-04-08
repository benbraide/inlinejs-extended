import {
    FindComponentById,
    StreamData,
    GetGlobal,
    AddMagicHandler,
    CreateMagicHandlerCallback,
    CreateReadonlyProxy,
    InitJITProxy,
    IsObject,
    ToString
} from "@benbraide/inlinejs";

export const FormatMagicHandler = CreateMagicHandlerCallback('format', ({ componentId, component, contextElement }) => {
    let [elementKey, proxy, scope] = InitJITProxy('format', (component || FindComponentById(componentId)), contextElement);
    if (!elementKey || proxy){//Invalid context element OR proxy already exists
        return proxy;
    }

    let affix = (data: any, value: any, callback: (data: string, value: string) => string) => {
        return StreamData(data, (data) => {
            return StreamData(value, value => callback(data, value));
        });
    };

    let queueCheckpoint = 0, formatters = {
        nextTick: (data: any) => {
            let checkpoint = ++queueCheckpoint;
            return new Promise((resolve) => FindComponentById(componentId)?.GetBackend().changes.AddNextTickHandler(() => {
                if (data instanceof Promise){
                    data.then((value) => resolve((checkpoint === queueCheckpoint) ? value : GetGlobal().CreateNothing()));
                }
                else{//Resolve
                    resolve((checkpoint === queueCheckpoint) ? data : GetGlobal().CreateNothing());
                }
            }));
        },
        comma: (data: any) => StreamData(data, (data) => {
            let [beforePoint, afterPoint = ''] = ToString(data).split('.');
            beforePoint = beforePoint.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return (afterPoint ? `${beforePoint}.${afterPoint}` : beforePoint);
        }),
        prefix: (data: any, value: any) => affix(data, value, (data, value) => (value + data)),
        suffix: (data: any, value: any) => affix(data, value, (data, value) => (data + value)),
        affix: (data: any, prefix: any, suffix: any) => affix(data, prefix, (data, value) => affix((value + data), suffix, (data, value) => (data + value))),
        round: (data: any, dp?: number, truncateZeroes = false) => StreamData(data, (data) => {
            let parsed = parseFloat(ToString(data));
            if (!parsed && parsed !== 0){
                return parsed;
            }
            
            let fixed = (Math.round(parsed * 100) / 100).toFixed(dp || 0);

            return (truncateZeroes ? fixed.replace(/(\.\d*?[1-9])0+$/g, "$1") : fixed);
        }),
        map: (data: any, keys: string | number | Array<string | number>) => StreamData(data, (data) => {
            if (Array.isArray(data)){
                return (Array.isArray(keys) ? data.filter((v, index) => keys.includes(index)) : data.at((typeof keys === 'string') ? parseInt(keys) : keys));
            }

            if (IsObject(data)){
                if (!Array.isArray(keys)){
                    return data[keys.toString()];
                }

                let mapped = {};
                Object.entries(data).forEach(([key, value]) => {
                    if (keys.includes(key)){
                        mapped[key] = value;
                    }
                });

                return mapped;
            }

            return data;
        }),
    };
    
    return (scope![elementKey] = CreateReadonlyProxy(formatters));
});

export function FormatMagicHandlerCompact(){
    AddMagicHandler(FormatMagicHandler);
}
