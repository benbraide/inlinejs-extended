"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TickDirectiveHandlerCompact = exports.TickDirectiveHandler = void 0;
const inlinejs_1 = require("@benbraide/inlinejs");
exports.TickDirectiveHandler = (0, inlinejs_1.CreateDirectiveHandlerCallback)('tick', ({ component, componentId, contextElement, expression, argOptions }) => {
    let evaluate = (0, inlinejs_1.EvaluateLater)({ componentId, contextElement, expression }), options = (0, inlinejs_1.ResolveOptions)({
        options: {
            delay: 1000,
            duration: 0,
            steps: -1,
            stopped: false,
            vsync: false,
        },
        list: argOptions,
        defaultNumber: -1,
    });
    let getDelay = () => ((options.delay < 0) ? 1000 : options.delay), checkDuration = () => {
        if (options.duration > 0) { //Compute steps
            options.steps = Math.ceil(options.duration / getDelay());
        }
    };
    checkDuration();
    let resolvedComponent = (component || (0, inlinejs_1.FindComponentById)(componentId)), id = resolvedComponent === null || resolvedComponent === void 0 ? void 0 : resolvedComponent.GenerateUniqueId('tick_proxy_'), state = {
        steps: 0,
        running: !options.stopped,
        checkpoint: 0,
    };
    let canRun = () => (state.steps < options.steps || options.steps == -1), step = (checkpoint, { abort }) => {
        let component = (0, inlinejs_1.FindComponentById)(componentId);
        if (!component || !state.running || checkpoint != state.checkpoint) {
            if (abort) {
                abort();
            }
            return;
        }
        updateState('steps', (state.steps + 1));
        if (!canRun()) {
            updateState('running', false);
            if (abort) {
                abort();
            }
        }
        evaluate();
    };
    let run = () => {
        (0, inlinejs_1.CreateLoop)(0, getDelay(), 0, 0, options.vsync).While(step.bind(null, ++state.checkpoint));
        evaluate();
    };
    let updateState = (key, value, shouldEvaluate = false) => {
        if (state[key] !== value) {
            let component = (0, inlinejs_1.FindComponentById)(componentId);
            if (component) { //Alert change
                (0, inlinejs_1.AddChanges)('set', `${id}.${key}`, key, component.GetBackend().changes);
            }
            state[key] = value;
            if (shouldEvaluate) {
                evaluate();
            }
        }
    };
    let methods = {
        run: () => {
            if (!state.running && canRun()) {
                updateState('running', true);
                run();
            }
        },
        pause: () => {
            if (state.running) {
                ++state.checkpoint;
                updateState('running', false);
            }
        },
        stop: () => {
            if (state.running) {
                ++state.checkpoint;
                updateState('steps', 0);
                updateState('running', false, true);
            }
            else if (state.steps > 0) {
                updateState('steps', 0, true);
            }
        },
        reset: () => {
            updateState('steps', 0);
            updateState('running', true);
            run();
        },
    };
    let elementScope = resolvedComponent === null || resolvedComponent === void 0 ? void 0 : resolvedComponent.FindElementScope(contextElement);
    elementScope === null || elementScope === void 0 ? void 0 : elementScope.AddUninitCallback(() => {
        ++state.checkpoint;
        state.steps = 0;
    });
    let local = (0, inlinejs_1.CreateInplaceProxy)((0, inlinejs_1.BuildProxyOptions)({ getter: (prop) => {
            var _a;
            if (prop && methods.hasOwnProperty(prop)) {
                return methods[prop];
            }
            if (prop === 'steps' || prop === 'running') {
                (_a = (0, inlinejs_1.FindComponentById)(componentId)) === null || _a === void 0 ? void 0 : _a.GetBackend().changes.AddGetAccess(`${id}.${prop}`);
                return state[prop];
            }
            if (prop && options.hasOwnProperty(prop)) {
                return options[prop];
            }
        }, setter: (prop, value) => {
            if (prop === 'duration') {
                options.duration = ((typeof value === 'number') ? value : 0);
                checkDuration();
            }
            else if (prop === 'delay') {
                options.delay = ((typeof value === 'number') ? value : 0);
            }
            else if (prop === 'steps') {
                options.steps = ((typeof value === 'number') ? value : 0);
            }
            return true;
        }, lookup: [...Object.keys(methods), 'steps', 'running', ...Object.keys(options)] }));
    elementScope === null || elementScope === void 0 ? void 0 : elementScope.SetLocal('$tick', local);
    if (state.running) {
        run();
    }
    else {
        evaluate();
    }
});
function TickDirectiveHandlerCompact() {
    (0, inlinejs_1.AddDirectiveHandler)(exports.TickDirectiveHandler);
}
exports.TickDirectiveHandlerCompact = TickDirectiveHandlerCompact;
