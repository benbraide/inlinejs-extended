"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceMagicHandlerCompact = exports.ResourceMagicHandler = void 0;
const inlinejs_1 = require("@benbraide/inlinejs");
function CreateResourceProxy() {
    const getCollectionConcept = () => (0, inlinejs_1.GetGlobal)().GetConcept('resource');
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
    return (0, inlinejs_1.CreateReadonlyProxy)(methods);
}
const ResourceProxy = CreateResourceProxy();
exports.ResourceMagicHandler = (0, inlinejs_1.CreateMagicHandlerCallback)('resource', () => ResourceProxy);
function ResourceMagicHandlerCompact() {
    (0, inlinejs_1.AddMagicHandler)(exports.ResourceMagicHandler);
}
exports.ResourceMagicHandlerCompact = ResourceMagicHandlerCompact;
