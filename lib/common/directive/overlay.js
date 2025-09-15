"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OverlayDirectiveHandler = void 0;
exports.OverlayDirectiveHandlerCompact = OverlayDirectiveHandlerCompact;
const inlinejs_1 = require("@benbraide/inlinejs");
exports.OverlayDirectiveHandler = (0, inlinejs_1.CreateDirectiveHandlerCallback)('overlay', ({ componentId, component, contextElement, expression, argKey, argOptions }) => {
    if ((0, inlinejs_1.BindEvent)({ contextElement, expression,
        component: (component || componentId),
        key: 'overlay',
        event: argKey,
        defaultEvent: 'visible',
        eventWhitelist: ['visibility', 'hidden', 'click'],
        options: [...argOptions, 'window'],
        optionBlacklist: ['document', 'outside'],
    })) {
        return;
    }
    let evaluate = (0, inlinejs_1.EvaluateLater)({ componentId, contextElement, expression }), state = false;
    (0, inlinejs_1.UseEffect)({ componentId, contextElement,
        callback: () => evaluate((value) => {
            if (!!value != state) {
                state = !state;
                let handler = (0, inlinejs_1.GetGlobal)().GetMagicManager().FindHandler('overlay');
                if (handler) {
                    handler({ componentId, contextElement }).offsetShowCount(state ? 1 : -1);
                }
            }
        }),
    });
});
function OverlayDirectiveHandlerCompact() {
    (0, inlinejs_1.AddDirectiveHandler)(exports.OverlayDirectiveHandler);
}
