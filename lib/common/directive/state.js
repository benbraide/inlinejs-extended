"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateDirectiveHandlerCompact = exports.StateDirectiveHandler = void 0;
const inlinejs_1 = require("@benbraide/inlinejs");
const names_1 = require("../names");
function BindState(componentId, component, contextElement) {
    if (contextElement instanceof HTMLTemplateElement) {
        return;
    }
    let elementScope = component === null || component === void 0 ? void 0 : component.FindElementScope(contextElement), localKey = `\$${names_1.StateDirectiveName}`, parentKey = `#${names_1.StateDirectiveName}`;
    if (elementScope === null || elementScope === void 0 ? void 0 : elementScope.HasLocal(localKey)) {
        return;
    }
    let resetCallbacks = new Array();
    let id = ((component === null || component === void 0 ? void 0 : component.GenerateUniqueId('state_proxy_')) || ''), errorCallbacks = new Array(), state = {
        invalid: 0,
        dirty: 0,
        changed: 0,
    };
    let message = null, parent = component === null || component === void 0 ? void 0 : component.FindElementLocalValue(contextElement, parentKey, true), alertUpdate = (key, trend) => {
        var _a;
        if ((trend == -1 && state[key] == 0) || (trend == 1 && state[key] == 1)) {
            (0, inlinejs_1.AddChanges)('set', `${id}.${key}`, key, (_a = (0, inlinejs_1.FindComponentById)(componentId)) === null || _a === void 0 ? void 0 : _a.GetBackend().changes);
            if (parent) { //Update parent
                parent.offsetState(key, ((state[key] == 0) ? -1 : 1));
            }
        }
    };
    if ((0, inlinejs_1.GetGlobal)().IsNothing(parent)) {
        parent = null;
    }
    let offsetState = (key, offset, max = 0) => {
        let previousValue = state[key];
        state[key] += offset;
        state[key] = ((state[key] < 0) ? 0 : ((max <= 0 || state[key] < max) ? state[key] : max));
        if (previousValue != state[key]) {
            alertUpdate(key, offset);
        }
    };
    let updateMessage = (value) => {
        var _a;
        if (value !== message) {
            message = value;
            (0, inlinejs_1.AddChanges)('set', `${id}.message`, 'message', (_a = (0, inlinejs_1.FindComponentById)(componentId)) === null || _a === void 0 ? void 0 : _a.GetBackend().changes);
        }
    };
    let getLocal = (target) => {
        var _a, _b;
        let local = (_b = (_a = (0, inlinejs_1.FindComponentById)(componentId)) === null || _a === void 0 ? void 0 : _a.FindElementScope(target)) === null || _b === void 0 ? void 0 : _b.GetLocal(localKey);
        return ((0, inlinejs_1.GetGlobal)().IsNothing(local) ? null : local);
    };
    let getRoot = () => {
        return (parent ? parent.getRoot() : getLocal(contextElement));
    };
    let getMessage = () => {
        var _a;
        if (!isFormElement || message === null) {
            return errorCallbacks
                .map(callback => callback())
                .map(info => (Array.isArray(info) ? info : [info]))
                .reduce((prev, info) => [...prev, ...info], [])
                .filter(info => (info.message.length != 0));
        }
        (_a = (0, inlinejs_1.GetGlobal)().GetCurrentProxyAccessStorage()) === null || _a === void 0 ? void 0 : _a.Put({ componentId, path: `${id}.message` });
        return {
            name: contextElement.getAttribute('name') || 'Unnamed',
            message: (message ? message.split('\n') : []),
        };
    };
    let isInput = (contextElement instanceof HTMLInputElement || contextElement instanceof HTMLTextAreaElement), local = (0, inlinejs_1.CreateInplaceProxy)((0, inlinejs_1.BuildGetterProxyOptions)({
        getter: (prop) => {
            var _a;
            if (prop && state.hasOwnProperty(prop)) {
                (_a = (0, inlinejs_1.GetGlobal)().GetCurrentProxyAccessStorage()) === null || _a === void 0 ? void 0 : _a.Put({ componentId, path: `${id}.${prop}` });
                return (state[prop] > 0);
            }
            if (prop === 'message') {
                let msg = getMessage();
                return (isFormElement ? (Array.isArray(msg) ? msg : [msg]).map(item => item.message).reduce((prev, item) => [...prev, ...item], []) : msg);
            }
            if (prop === 'realMessage') {
                return getMessage();
            }
            if (prop === 'parent') {
                return (parent ? getLocal(contextElement.parentElement) : null);
            }
            if (prop === 'root') {
                return getRoot();
            }
            if (prop === 'reset') {
                return reset;
            }
            if (isFormElement && prop === 'setMessage') {
                return (msg) => {
                    contextElement.setCustomValidity(msg);
                    updateMessage(contextElement.validationMessage);
                    let isInvalid = !contextElement.validity.valid;
                    if ((state.invalid > 0) !== isInvalid) {
                        offsetState('invalid', isInvalid ? 1 : -1, 1);
                    }
                };
            }
        },
        lookup: [...Object.keys(state), 'message', 'parent', 'root', 'reset'],
    }));
    let isFormElement = (isInput || contextElement instanceof HTMLSelectElement);
    if (isFormElement) {
        let initialValue = contextElement.value, onEvent = () => {
            offsetState('dirty', 1, 1);
            offsetState('changed', (contextElement.value === initialValue) ? -1 : 1, 1);
            offsetState('invalid', (contextElement.validity.valid ? -1 : 1), 1);
            if (contextElement.validity.customError) {
                contextElement.setCustomValidity('');
            }
            updateMessage(contextElement.validationMessage);
        };
        contextElement.addEventListener('change', onEvent);
        if (isInput) {
            contextElement.addEventListener('input', onEvent);
        }
        message = contextElement.validationMessage;
        if (!contextElement.validity.valid) {
            offsetState('invalid', 1, 1);
        }
    }
    else if (contextElement.firstElementChild) {
        elementScope === null || elementScope === void 0 ? void 0 : elementScope.SetLocal(parentKey, { getRoot, offsetState,
            addErrorCallback: (callback) => errorCallbacks.push(callback),
            removeErrorCallback: (callback) => (errorCallbacks = errorCallbacks.filter(c => (c !== callback))),
            addResetCallback: (callback) => resetCallbacks.push(callback),
            removeResetCallback: (callback) => (resetCallbacks = resetCallbacks.filter(c => (c !== callback))),
        });
        elementScope === null || elementScope === void 0 ? void 0 : elementScope.AddTreeChangeCallback(({ added }) => added.filter(child => !(child instanceof HTMLTemplateElement)).forEach((child) => {
            var _a;
            (_a = (0, inlinejs_1.FindComponentById)(componentId)) === null || _a === void 0 ? void 0 : _a.CreateElementScope(child);
            BindState(componentId, (0, inlinejs_1.FindComponentById)(componentId), child);
        }));
        [...contextElement.children].filter(child => !(child instanceof HTMLTemplateElement)).forEach((child) => {
            component === null || component === void 0 ? void 0 : component.CreateElementScope(child);
            BindState(componentId, component, child);
        });
    }
    let checkpoint = 0, reset = () => {
        Object.keys(state).filter(key => (state[key] != 0)).forEach((key) => {
            state[key] = 0;
            alertUpdate(key, -1);
        });
        if (isFormElement) {
            let myCheckpoint = ++checkpoint;
            setTimeout(() => {
                if (myCheckpoint != checkpoint) {
                    return;
                }
                updateMessage(contextElement.validationMessage);
                if (!contextElement.validity.valid) {
                    offsetState('invalid', 1, 1);
                }
            }, 0);
        }
        else {
            resetCallbacks.forEach(callback => callback());
        }
    };
    if (!isInput && !(contextElement instanceof HTMLSelectElement) && errorCallbacks.length == 0) {
        elementScope === null || elementScope === void 0 ? void 0 : elementScope.DeleteLocal(parentKey);
        return; //No bindings
    }
    if (parent) {
        parent.addErrorCallback(getMessage);
        parent.addResetCallback(reset);
        elementScope === null || elementScope === void 0 ? void 0 : elementScope.AddUninitCallback(() => {
            parent.removeResetCallback(reset);
            parent.removeErrorCallback(getMessage);
        });
    }
    else { //Listen for form reset, if possible
        let form = ((contextElement instanceof HTMLFormElement) ? contextElement : component === null || component === void 0 ? void 0 : component.FindElement(contextElement, el => (el instanceof HTMLFormElement)));
        if (form) {
            form.addEventListener('reset', reset);
            elementScope === null || elementScope === void 0 ? void 0 : elementScope.AddUninitCallback(() => form.removeEventListener('reset', reset));
        }
    }
    elementScope === null || elementScope === void 0 ? void 0 : elementScope.SetLocal(localKey, local);
}
exports.StateDirectiveHandler = (0, inlinejs_1.CreateDirectiveHandlerCallback)(names_1.StateDirectiveName, ({ componentId, component, contextElement }) => {
    BindState(componentId, (component || (0, inlinejs_1.FindComponentById)(componentId)), contextElement);
});
function StateDirectiveHandlerCompact() {
    (0, inlinejs_1.AddDirectiveHandler)(exports.StateDirectiveHandler);
}
exports.StateDirectiveHandlerCompact = StateDirectiveHandlerCompact;
