import { GetGlobal, AddMagicHandler, CreateMagicHandlerCallback, CreateReadonlyProxy } from "@benbraide/inlinejs";
function CreateResourceProxy() {
    const getCollectionConcept = () => GetGlobal().GetConcept('resource');
    let methods = {
        get: (params) => { var _a; return (_a = getCollectionConcept()) === null || _a === void 0 ? void 0 : _a.Get(params); },
        getStyle: (path, concurrent, attributes) => {
            var _a;
            return (_a = getCollectionConcept()) === null || _a === void 0 ? void 0 : _a.GetStyle(path, concurrent, attributes);
        },
        getScript: (path, concurrent, attributes) => {
            var _a;
            return (_a = getCollectionConcept()) === null || _a === void 0 ? void 0 : _a.GetScript(path, concurrent, attributes);
        },
        getData: (path, concurrent, json) => {
            var _a;
            return (_a = getCollectionConcept()) === null || _a === void 0 ? void 0 : _a.GetData(path, concurrent, json);
        },
    };
    return CreateReadonlyProxy(methods);
}
const ResourceProxy = CreateResourceProxy();
export const ResourceMagicHandler = CreateMagicHandlerCallback('resource', () => ResourceProxy);
export function ResourceMagicHandlerCompact() {
    AddMagicHandler(ResourceMagicHandler);
}
