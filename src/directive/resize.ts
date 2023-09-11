import {
    FindComponentById,
    AddDirectiveHandler,
    CreateDirectiveHandlerCallback,
    EvaluateLater,
    JournalError,
    AddChanges,
    BuildGetterProxyOptions,
    CreateInplaceProxy,
    ResolveOptions,
    ResizeObserver,
} from "@benbraide/inlinejs";

interface IResizeState{
    x: number;
    y: number;
    width: number;
    height: number;
    borderBoxBlock: number;
    borderBoxInline: number;
    contentBoxBlock: number;
    contentBoxInline: number;
}

const ResizeDirectiveName = 'resize';

export const ResizeDirectiveHandler = CreateDirectiveHandlerCallback(ResizeDirectiveName, ({ componentId, component, contextElement, expression, argOptions }) => {
    let resolvedComponent = (component || FindComponentById(componentId));
    if (!resolvedComponent){
        return JournalError('Failed to resolve component.', 'InlineJS.ResizeDirectiveHandler', contextElement);
    }

    let options = ResolveOptions({
        options: {
            box: false,
            content: false,
        },
        list: argOptions,
        defaultNumber: -1,
    });

    let observer = new ResizeObserver();
    if (!observer){
        return JournalError('Failed to create observer.', 'InlineJS.ResizeDirectiveHandler', contextElement);
    }

    expression = expression.trim();
    let evaluate = (expression ? EvaluateLater({ componentId, contextElement, expression }) : null);

    let state: IResizeState = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        borderBoxBlock: 0,
        borderBoxInline: 0,
        contentBoxBlock: 0,
        contentBoxInline: 0,
    };

    const id = resolvedComponent.GenerateUniqueId('intsn_proxy_'), updateState = (key: keyof IResizeState, value: number) => {
        if (state[key] !== value){
            AddChanges('set', `${id}.${key}`, key, FindComponentById(componentId)?.GetBackend().changes);
            (state[key] as number) = value;
            return true;
        }
        return false;
    };

    observer.Observe(contextElement, ({ entry } = {}) => {
        if (!entry){//Invalid
            return;
        }

        let updated = false;

        updated = (updateState('x', entry.contentRect.x) || updated);
        updated = (updateState('y', entry.contentRect.y) || updated);

        updated = (updateState('width', entry.contentRect.width) || updated);
        updated = (updateState('height', entry.contentRect.height) || updated);

        updated && AddChanges('set', `${id}.contentRect`, 'contentRect', FindComponentById(componentId)?.GetBackend().changes);
        
        if (entry.borderBoxSize.length > 0){
            updateState('borderBoxBlock', entry.borderBoxSize[0].blockSize);
            updateState('borderBoxInline', entry.borderBoxSize[0].inlineSize);
        }

        if (entry.contentBoxSize.length > 0){
            updateState('contentBoxBlock', entry.contentBoxSize[0].blockSize);
            updateState('contentBoxInline', entry.contentBoxSize[0].inlineSize);
        }

        const clonedState = { ...state };
        evaluate && evaluate(undefined, [clonedState], {
            state: clonedState,
        });
    }, { box: ((options.box || !options.content) ? 'border-box' : 'content-box') });

    let local = CreateInplaceProxy(BuildGetterProxyOptions({ getter: (prop) => {
        if (prop && state.hasOwnProperty(prop)){
            return state[prop];
        }

        if (prop === 'contentRect'){
            return {
                x: state.x,
                y: state.y,
                width: state.width,
                height: state.height,
            };
        }
    }, lookup: [...Object.keys(state), 'contentRect'], alert: { componentId, id } }));

    resolvedComponent.FindElementScope(contextElement)?.SetLocal(`\$${ResizeDirectiveName}`, local);
});

export function ResizeDirectiveHandlerCompact(){
    AddDirectiveHandler(ResizeDirectiveHandler);
}
