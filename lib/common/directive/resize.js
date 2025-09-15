"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResizeDirectiveHandler = void 0;
exports.ResizeDirectiveHandlerCompact = ResizeDirectiveHandlerCompact;
const inlinejs_1 = require("@benbraide/inlinejs");
const ResizeDirectiveName = 'resize';
exports.ResizeDirectiveHandler = (0, inlinejs_1.CreateDirectiveHandlerCallback)(ResizeDirectiveName, ({ componentId, component, contextElement, expression, argOptions }) => {
    var _a, _b;
    let resolvedComponent = (component || (0, inlinejs_1.FindComponentById)(componentId));
    if (!resolvedComponent) {
        return (0, inlinejs_1.JournalError)('Failed to resolve component.', 'InlineJS.ResizeDirectiveHandler', contextElement);
    }
    let options = (0, inlinejs_1.ResolveOptions)({
        options: {
            box: false,
            content: false,
        },
        list: argOptions,
        defaultNumber: -1,
    });
    let observer = new inlinejs_1.ResizeObserver();
    if (!observer) {
        return (0, inlinejs_1.JournalError)('Failed to create observer.', 'InlineJS.ResizeDirectiveHandler', contextElement);
    }
    expression = expression.trim();
    let evaluate = (expression ? (0, inlinejs_1.EvaluateLater)({ componentId, contextElement, expression }) : null);
    let state = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        borderBoxBlock: 0,
        borderBoxInline: 0,
        contentBoxBlock: 0,
        contentBoxInline: 0,
    };
    const id = resolvedComponent.GenerateUniqueId('intsn_proxy_'), updateState = (key, value) => {
        var _a;
        if (state[key] !== value) {
            (0, inlinejs_1.AddChanges)('set', `${id}.${key}`, key, (_a = (0, inlinejs_1.FindComponentById)(componentId)) === null || _a === void 0 ? void 0 : _a.GetBackend().changes);
            state[key] = value;
            return true;
        }
        return false;
    };
    observer.Observe(contextElement, ({ entry } = {}) => {
        var _a;
        if (!entry) { //Invalid
            return;
        }
        let updated = false;
        updated = (updateState('x', entry.contentRect.x) || updated);
        updated = (updateState('y', entry.contentRect.y) || updated);
        updated = (updateState('width', entry.contentRect.width) || updated);
        updated = (updateState('height', entry.contentRect.height) || updated);
        updated && (0, inlinejs_1.AddChanges)('set', `${id}.contentRect`, 'contentRect', (_a = (0, inlinejs_1.FindComponentById)(componentId)) === null || _a === void 0 ? void 0 : _a.GetBackend().changes);
        if (entry.borderBoxSize.length > 0) {
            updateState('borderBoxBlock', entry.borderBoxSize[0].blockSize);
            updateState('borderBoxInline', entry.borderBoxSize[0].inlineSize);
        }
        if (entry.contentBoxSize.length > 0) {
            updateState('contentBoxBlock', entry.contentBoxSize[0].blockSize);
            updateState('contentBoxInline', entry.contentBoxSize[0].inlineSize);
        }
        const clonedState = Object.assign({}, state);
        evaluate && evaluate(undefined, [clonedState], {
            state: clonedState,
        });
    }, { box: ((options.box || !options.content) ? 'border-box' : 'content-box') });
    let local = (0, inlinejs_1.CreateInplaceProxy)((0, inlinejs_1.BuildGetterProxyOptions)({ getter: (prop) => {
            if (prop && state.hasOwnProperty(prop)) {
                return state[prop];
            }
            if (prop === 'contentRect') {
                return {
                    x: state.x,
                    y: state.y,
                    width: state.width,
                    height: state.height,
                };
            }
        }, lookup: [...Object.keys(state), 'contentRect'], alert: { componentId, id } }));
    (_a = resolvedComponent.FindElementScope(contextElement)) === null || _a === void 0 ? void 0 : _a.SetLocal(`\$${ResizeDirectiveName}`, local);
    (_b = resolvedComponent.FindElementScope(contextElement)) === null || _b === void 0 ? void 0 : _b.AddUninitCallback(() => observer.Unobserve(contextElement));
});
function ResizeDirectiveHandlerCompact() {
    (0, inlinejs_1.AddDirectiveHandler)(exports.ResizeDirectiveHandler);
}
