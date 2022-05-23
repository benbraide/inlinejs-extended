import { GetGlobal, AddDirectiveHandler, CreateDirectiveHandlerCallback, EvaluateLater, UseEffect, BindEvent } from "@benbraide/inlinejs";
export const OverlayDirectiveHandler = CreateDirectiveHandlerCallback('overlay', ({ componentId, component, contextElement, expression, argKey, argOptions }) => {
    if (BindEvent({ contextElement, expression,
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
    let evaluate = EvaluateLater({ componentId, contextElement, expression }), state = false;
    UseEffect({ componentId, contextElement,
        callback: () => evaluate((value) => {
            if (!!value != state) {
                state = !state;
                let handler = GetGlobal().GetMagicManager().FindHandler('overlay');
                if (handler) {
                    handler({ componentId, contextElement }).offsetShowCount(state ? 1 : -1);
                }
            }
        }),
    });
});
export function OverlayDirectiveHandlerCompact() {
    AddDirectiveHandler(OverlayDirectiveHandler);
}
