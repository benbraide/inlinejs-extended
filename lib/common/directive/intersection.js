"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntersectionDirectiveHandlerCompact = exports.IntersectionDirectiveHandler = void 0;
const inlinejs_1 = require("@benbraide/inlinejs");
const IntersectionDirectiveName = 'intersection';
const IntersectionRatioMultiplier = 10000;
const IntersectionRatioThreshold = (99 * (IntersectionRatioMultiplier / 100));
exports.IntersectionDirectiveHandler = (0, inlinejs_1.CreateDirectiveHandlerCallback)(IntersectionDirectiveName, ({ componentId, component, contextElement, expression, argKey, argOptions }) => {
    var _a;
    if ((0, inlinejs_1.BindEvent)({ contextElement, expression,
        component: (component || componentId),
        key: IntersectionDirectiveName,
        event: argKey,
        defaultEvent: 'visible',
        eventWhitelist: ['ratio', 'stage'],
        options: argOptions,
        optionBlacklist: ['window', 'document', 'outside', 'once'],
    })) {
        return;
    }
    let resolvedComponent = (component || (0, inlinejs_1.FindComponentById)(componentId));
    if (!resolvedComponent) {
        return (0, inlinejs_1.JournalError)('Failed to resolve component.', 'InlineJS.IntersectionDirectiveHandler', contextElement);
    }
    let options = (0, inlinejs_1.ResolveOptions)({
        options: {
            once: false,
            in: false,
            out: false,
            fully: false,
            ancestor: -1,
            threshold: -1,
        },
        list: argOptions,
        defaultNumber: -1,
    });
    let intersectionOptions = {
        root: ((options.ancestor < 0) ? null : resolvedComponent.FindAncestor(contextElement, options.ancestor)),
        threshold: ((options.threshold < 0) ? 0 : options.threshold),
        spread: true,
    };
    let observer = new inlinejs_1.IntersectionObserver(resolvedComponent.GenerateUniqueId('int_obs_'), intersectionOptions);
    if (!observer) {
        return (0, inlinejs_1.JournalError)('Failed to create observer.', 'InlineJS.IntersectionDirectiveHandler', contextElement);
    }
    expression = expression.trim();
    let evaluate = (expression ? (0, inlinejs_1.EvaluateLater)({ componentId, contextElement, expression }) : null);
    let state = {
        visible: null,
        ratio: null,
        stage: null,
    };
    const getEventName = (name) => `${IntersectionDirectiveName}.${name}`;
    const id = resolvedComponent.GenerateUniqueId('intsn_proxy_'), updateState = (key, value) => {
        var _a;
        if (state[key] !== value) {
            (0, inlinejs_1.AddChanges)('set', `${id}.${key}`, key, (_a = (0, inlinejs_1.FindComponentById)(componentId)) === null || _a === void 0 ? void 0 : _a.GetBackend().changes);
            contextElement.dispatchEvent(new CustomEvent(getEventName('ratio'), {
                detail: { value: (state[key] = value) },
            }));
        }
    };
    observer.Observe(contextElement, ({ id, entry } = {}) => {
        var _a;
        if (!entry) { //Invalid
            return;
        }
        let ratio = Math.round(entry.intersectionRatio * IntersectionRatioMultiplier);
        if (entry.isIntersecting) { //In
            if ((options.out && !options.in) || (options.in && options.fully && ratio <= IntersectionRatioThreshold)) {
                return; //Only 'out' option sepcified OR 'in' and 'fully' options specified but is not fully visible
            }
            updateState('visible', true);
            updateState('ratio', entry.intersectionRatio);
            updateState('stage', ((ratio <= IntersectionRatioThreshold) ? 'partial' : 'full'));
        }
        else if (state.visible === null || options.out || !options.in) { //Out
            updateState('visible', false);
            updateState('ratio', 0);
            updateState('stage', 'none');
        }
        else { //Only 'in' option sepcified
            return;
        }
        const clonedState = Object.assign({}, state);
        evaluate && evaluate(undefined, [clonedState], {
            state: clonedState,
        });
        options.once && ((_a = (0, inlinejs_1.FindComponentById)(componentId)) === null || _a === void 0 ? void 0 : _a.RemoveIntersectionObserver(id));
    });
    let local = (0, inlinejs_1.CreateInplaceProxy)((0, inlinejs_1.BuildGetterProxyOptions)({ getter: (prop) => {
            if (prop && state.hasOwnProperty(prop)) {
                return state[prop];
            }
        }, lookup: [...Object.keys(state)], alert: { componentId, id } }));
    (_a = resolvedComponent.FindElementScope(contextElement)) === null || _a === void 0 ? void 0 : _a.SetLocal(`\$${IntersectionDirectiveName}`, local);
});
function IntersectionDirectiveHandlerCompact() {
    (0, inlinejs_1.AddDirectiveHandler)(exports.IntersectionDirectiveHandler);
}
exports.IntersectionDirectiveHandlerCompact = IntersectionDirectiveHandlerCompact;
