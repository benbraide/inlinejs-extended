"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyboardDirectiveHandler = void 0;
exports.KeyboardDirectiveHandlerCompact = KeyboardDirectiveHandlerCompact;
const inlinejs_1 = require("@benbraide/inlinejs");
function BindKeyboardInside(contextElement, callback) {
    let lastValue = false, callCallback = (value) => {
        if (value != lastValue) {
            callback(lastValue = value);
        }
    };
    const onEnter = () => callCallback(true), onLeave = () => callCallback(false), unbind = () => {
        contextElement.removeEventListener('focusout', onLeave);
        contextElement.removeEventListener('focusin', onEnter);
    };
    contextElement.addEventListener('focusin', onEnter);
    contextElement.addEventListener('focusout', onLeave);
    return unbind;
}
function BindKeyboardKey(contextElement, key, callback) {
    const handler = (e) => callback(e.key || '');
    contextElement.addEventListener(`key${key}`, handler);
    return () => contextElement.removeEventListener(`key${key}`, handler);
}
function BindKeyboardState(contextElement, callback) {
    const held = new Set();
    const onDown = (e) => {
        const key = e.key || '';
        if (key && !held.has(key)) {
            held.add(key);
            callback(Array.from(held));
        }
    };
    const onUp = (e) => {
        const key = e.key || '';
        if (key && held.has(key)) {
            held.delete(key);
            callback(Array.from(held));
        }
    };
    contextElement.addEventListener('keydown', onDown);
    contextElement.addEventListener('keyup', onUp);
    return () => {
        contextElement.removeEventListener('keydown', onDown);
        contextElement.removeEventListener('keyup', onUp);
    };
}
const DefaultKeyboardTypeDelay = 500;
function BindKeyboardType(component, contextElement, delay, callback) {
    var _a;
    let checkpoint = 0, reset = () => {
        ++checkpoint;
    };
    (_a = component === null || component === void 0 ? void 0 : component.FindElementScope(contextElement)) === null || _a === void 0 ? void 0 : _a.AddUninitCallback(reset);
    let lastValue = false, callCallback = (value) => {
        if (value != lastValue) {
            callback(lastValue = value);
        }
    };
    const afterDelay = (myCheckpoint) => {
        if (myCheckpoint == checkpoint) {
            callCallback(false);
        }
    };
    const handler = () => {
        let myCheckpoint = ++checkpoint;
        callCallback(true);
        setTimeout(() => afterDelay(myCheckpoint), ((delay < 0) ? DefaultKeyboardTypeDelay : delay));
    };
    contextElement.addEventListener('keydown', handler);
    return () => contextElement.removeEventListener('keydown', handler);
}
exports.KeyboardDirectiveHandler = (0, inlinejs_1.CreateDirectiveHandlerCallback)('keyboard', ({ component, componentId, contextElement, expression, argKey, argOptions }) => {
    var _a, _b;
    if (!(expression = expression.trim())) {
        return;
    }
    let options = (0, inlinejs_1.ResolveOptions)({
        options: {
            delay: -1,
            once: false,
            document: false,
            window: false,
        },
        list: argOptions,
        defaultNumber: -1,
    }), unbind = null;
    const evaluate = (0, inlinejs_1.EvaluateLater)({ componentId, contextElement, expression });
    const target = options.window ? window : (options.document ? globalThis.document : contextElement);
    if (argKey === 'inside') {
        unbind = BindKeyboardInside(target, (inside) => {
            evaluate(undefined, [inside], { inside });
            if (options.once) {
                unbind === null || unbind === void 0 ? void 0 : unbind();
                unbind = null;
            }
        });
    }
    else if (argKey === 'down' || argKey === 'up') {
        unbind = BindKeyboardKey(target, argKey, key => evaluate(undefined, [key], { key }));
    }
    else if (argKey === 'held') {
        unbind = BindKeyboardState(target, (keys) => {
            evaluate(undefined, [keys], { keys });
        });
    }
    else if (argKey === 'type') {
        unbind = BindKeyboardType((component || (0, inlinejs_1.FindComponentById)(componentId)), target, options.delay, typing => evaluate(undefined, [typing], { typing }));
    }
    unbind && ((_b = (_a = (component || (0, inlinejs_1.FindComponentById)(componentId))) === null || _a === void 0 ? void 0 : _a.FindElementScope(contextElement)) === null || _b === void 0 ? void 0 : _b.AddUninitCallback(() => unbind === null || unbind === void 0 ? void 0 : unbind()));
});
function KeyboardDirectiveHandlerCompact() {
    (0, inlinejs_1.AddDirectiveHandler)(exports.KeyboardDirectiveHandler);
}
