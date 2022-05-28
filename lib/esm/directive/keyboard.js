import { FindComponentById, AddDirectiveHandler, CreateDirectiveHandlerCallback, EvaluateLater, ResolveOptions } from "@benbraide/inlinejs";
function BindKeyboardInside(contextElement, callback) {
    let lastValue = false, callCallback = (value) => {
        if (value != lastValue) {
            callback((lastValue = value), unbind);
        }
    };
    let onEnter = () => callCallback(true), onLeave = () => callCallback(false), unbind = () => {
        contextElement.removeEventListener('focusout', onLeave);
        contextElement.removeEventListener('focusin', onEnter);
    };
    contextElement.addEventListener('focusin', onEnter);
    contextElement.addEventListener('focusout', onLeave);
}
function BindKeyboardKey(contextElement, key, callback) {
    let lastValue = '', callCallback = (value) => {
        if (value !== lastValue) {
            callback(lastValue = value);
        }
    };
    contextElement.addEventListener(`key${key}`, (e) => callCallback(e.key));
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
    let afterDelay = (myCheckpoint) => {
        if (myCheckpoint == checkpoint) {
            callCallback(false);
        }
    };
    contextElement.addEventListener('keydown', () => {
        let myCheckpoint = ++checkpoint;
        callCallback(true);
        setTimeout(() => afterDelay(myCheckpoint), ((delay < 0) ? DefaultKeyboardTypeDelay : delay));
    });
}
export const KeyboardDirectiveHandler = CreateDirectiveHandlerCallback('keyboard', ({ component, componentId, contextElement, expression, argKey, argOptions }) => {
    if (!(expression = expression.trim())) {
        return;
    }
    let options = ResolveOptions({
        options: {
            delay: -1,
            once: false,
        },
        list: argOptions,
        defaultNumber: -1,
    });
    let evaluate = EvaluateLater({ componentId, contextElement, expression });
    if (argKey === 'inside') {
        BindKeyboardInside(contextElement, (inside, unbind) => {
            evaluate(undefined, [inside], { inside });
            if (options.once) {
                unbind();
            }
        });
    }
    else if (argKey === 'down' || argKey === 'up') {
        BindKeyboardKey(contextElement, argKey, key => evaluate(undefined, [key], { key }));
    }
    else if (argKey === 'type') {
        BindKeyboardType((component || FindComponentById(componentId)), contextElement, options.delay, typing => evaluate(undefined, [typing], { typing }));
    }
});
export function KeyboardDirectiveHandlerCompact() {
    AddDirectiveHandler(KeyboardDirectiveHandler);
}
