"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttrDirectiveHandler = void 0;
exports.AttrDirectiveHandlerCompact = AttrDirectiveHandlerCompact;
const inlinejs_1 = require("@benbraide/inlinejs");
exports.AttrDirectiveHandler = (0, inlinejs_1.CreateDirectiveHandlerCallback)('attr', ({ componentId, component, contextElement, expression, argKey }) => {
    var _a, _b;
    let evaluate = (0, inlinejs_1.EvaluateLater)({ componentId, contextElement, expression }), lastValues = {};
    if (argKey) {
        lastValues[argKey] = contextElement.getAttribute(argKey);
    }
    (_b = (_a = (component || (0, inlinejs_1.FindComponentById)(componentId))) === null || _a === void 0 ? void 0 : _a.FindElementScope(contextElement)) === null || _b === void 0 ? void 0 : _b.AddAttributeChangeCallback((name) => {
        let value = contextElement.getAttribute(name);
        if (!lastValues.hasOwnProperty(name) || value !== lastValues[name]) {
            lastValues[name] = value;
            evaluate(undefined, [{ name, value }], { changed: { name, value } });
        }
    }, (argKey || undefined));
});
function AttrDirectiveHandlerCompact() {
    (0, inlinejs_1.AddDirectiveHandler)(exports.AttrDirectiveHandler);
}
