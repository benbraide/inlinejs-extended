"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MouseDirectiveHandler = void 0;
exports.MouseDirectiveHandlerCompact = MouseDirectiveHandlerCompact;
const inlinejs_1 = require("@benbraide/inlinejs");
function BindMouseInside(contextElement, callback) {
    let lastValue = false, callCallback = (value) => {
        if (value != lastValue) {
            callback(lastValue = value);
        }
    };
    const onEnter = () => callCallback(true), onLeave = () => callCallback(false), unbind = () => {
        contextElement.removeEventListener('mouseleave', onLeave);
        contextElement.removeEventListener('mouseenter', onEnter);
    };
    contextElement.addEventListener('mouseenter', onEnter);
    contextElement.addEventListener('mouseleave', onLeave);
    return unbind;
}
const DefaultMouseDelay = 100;
const DefaultMouseDebounce = 250;
function BindMouseRepeat(contextElement, delay, debounce, callback) {
    let checkpoint = 0, streak = 0, reset = () => {
        ++checkpoint;
        streak = 0;
    };
    let afterDelay = (myCheckpoint) => {
        if (myCheckpoint == checkpoint) {
            callback(++streak);
            setTimeout(() => afterDelay(myCheckpoint), ((delay < 0) ? DefaultMouseDelay : delay));
        }
    };
    const handler = () => {
        streak = 0;
        let myCheckpoint = ++checkpoint;
        callback(++streak);
        setTimeout(() => afterDelay(myCheckpoint), ((debounce < 0) ? DefaultMouseDebounce : debounce));
    };
    contextElement.addEventListener('mousedown', handler);
    contextElement.addEventListener('mouseup', reset);
    contextElement.addEventListener('mouseleave', reset);
    return () => {
        contextElement.removeEventListener('mousedown', handler);
        contextElement.removeEventListener('mouseup', reset);
        contextElement.removeEventListener('mouseleave', reset);
    };
}
function BindMouseMove(contextElement, callback) {
    const moveHandler = (e) => {
        if (e instanceof MouseEvent) {
            callback({
                client: { x: e.clientX, y: e.clientY },
                offset: { x: e.offsetX, y: e.offsetY },
                screen: { x: e.screenX, y: e.screenY },
            });
        }
        else {
            callback(null);
        }
    };
    const leaveHandler = () => callback(null);
    contextElement.addEventListener('mousemove', moveHandler);
    contextElement.addEventListener('mouseleave', leaveHandler);
    return () => {
        contextElement.removeEventListener('mousemove', moveHandler);
        contextElement.removeEventListener('mouseleave', leaveHandler);
    };
}
exports.MouseDirectiveHandler = (0, inlinejs_1.CreateDirectiveHandlerCallback)('mouse', ({ componentId, component, contextElement, expression, argKey, argOptions }) => {
    var _a, _b;
    if (!(expression = expression.trim())) {
        return;
    }
    let options = (0, inlinejs_1.ResolveOptions)({
        options: {
            delay: -1,
            debounce: -1,
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
        unbind = BindMouseInside(target, (inside) => {
            evaluate(undefined, [inside], { inside });
            if (options.once) {
                unbind === null || unbind === void 0 ? void 0 : unbind();
                unbind = null;
            }
        });
    }
    else if (argKey === 'move') {
        unbind = BindMouseMove(target, position => evaluate(undefined, [position], { position }));
    }
    else if (argKey === 'repeat') {
        unbind = BindMouseRepeat(target, options.delay, options.debounce, streak => evaluate(undefined, [streak], { streak }));
    }
    unbind && ((_b = (_a = (component || (0, inlinejs_1.FindComponentById)(componentId))) === null || _a === void 0 ? void 0 : _a.FindElementScope(contextElement)) === null || _b === void 0 ? void 0 : _b.AddUninitCallback(() => unbind === null || unbind === void 0 ? void 0 : unbind()));
});
function MouseDirectiveHandlerCompact() {
    (0, inlinejs_1.AddDirectiveHandler)(exports.MouseDirectiveHandler);
}
