"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MouseDirectiveHandlerCompact = exports.MouseDirectiveHandler = void 0;
const inlinejs_1 = require("@benbraide/inlinejs");
function BindMouseInside(contextElement, callback) {
    let lastValue = false, callCallback = (value) => {
        if (value != lastValue) {
            callback((lastValue = value), unbind);
        }
    };
    let onEnter = () => callCallback(true), onLeave = () => callCallback(false), unbind = () => {
        contextElement.removeEventListener('mouseleave', onLeave);
        contextElement.removeEventListener('mouseenter', onEnter);
    };
    contextElement.addEventListener('mouseenter', onEnter);
    contextElement.addEventListener('mouseleave', onLeave);
}
const DefaultMouseDelay = 100;
const DefaultMouseDebounce = 250;
function BindMouseRepeat(component, contextElement, delay, callback) {
    var _a;
    let checkpoint = 0, streak = 0, reset = () => {
        ++checkpoint;
        streak = 0;
    };
    (_a = component === null || component === void 0 ? void 0 : component.FindElementScope(contextElement)) === null || _a === void 0 ? void 0 : _a.AddUninitCallback(reset);
    let afterDelay = (myCheckpoint) => {
        if (myCheckpoint == checkpoint) {
            callback(++streak);
            setTimeout(() => afterDelay(myCheckpoint), ((delay < 0) ? DefaultMouseDelay : delay));
        }
    };
    contextElement.addEventListener('mousedown', () => {
        let myCheckpoint = ++checkpoint;
        callback(++streak);
        setTimeout(() => afterDelay(myCheckpoint), ((delay < 0) ? DefaultMouseDebounce : delay));
    });
    contextElement.addEventListener('mouseup', reset);
    contextElement.addEventListener('mouseenter', reset);
    contextElement.addEventListener('mouseleave', reset);
    contextElement.addEventListener('mouseover', reset);
    contextElement.addEventListener('mouseout', reset);
}
function BindMouseMove(contextElement, callback) {
    contextElement.addEventListener('mousemove', e => callback({
        client: { x: e.clientX, y: e.clientY },
        offset: { x: e.offsetX, y: e.offsetY },
        screen: { x: e.screenX, y: e.screenY },
    }));
    contextElement.addEventListener('mouseleave', () => callback(null));
}
exports.MouseDirectiveHandler = (0, inlinejs_1.CreateDirectiveHandlerCallback)('mouse', ({ componentId, component, contextElement, expression, argKey, argOptions }) => {
    if (!(expression = expression.trim())) {
        return;
    }
    let options = (0, inlinejs_1.ResolveOptions)({
        options: {
            delay: -1,
            debounce: -1,
            once: false,
        },
        list: argOptions,
        defaultNumber: -1,
    });
    const evaluate = (0, inlinejs_1.EvaluateLater)({ componentId, contextElement, expression });
    if (argKey === 'inside') {
        BindMouseInside(contextElement, (inside, unbind) => {
            evaluate(undefined, [inside], { inside });
            if (options.once) {
                unbind();
            }
        });
    }
    else if (argKey === 'move') {
        BindMouseMove(contextElement, position => evaluate(undefined, [position], { position }));
    }
    else if (argKey === 'repeat') {
        BindMouseRepeat((component || (0, inlinejs_1.FindComponentById)(componentId)), contextElement, options.delay, streak => evaluate(undefined, [streak], { streak }));
    }
});
function MouseDirectiveHandlerCompact() {
    (0, inlinejs_1.AddDirectiveHandler)(exports.MouseDirectiveHandler);
}
exports.MouseDirectiveHandlerCompact = MouseDirectiveHandlerCompact;
