import {
    FindComponentById,
    AddDirectiveHandler,
    CreateDirectiveHandlerCallback,
    EvaluateLater,
    JournalError,
    AddChanges,
    BuildGetterProxyOptions,
    CreateInplaceProxy,
    BindEvent,
    ResolveOptions,
    IntersectionObserver,
    IIntersectionOptions
} from "@benbraide/inlinejs";

type IntersectionStageType = 'partial' | 'full' | 'none';
type IntersectionStateType = boolean | number | IntersectionStageType;

interface IIntersectionState{
    visible: boolean | null;
    ratio: number | null;
    stage: IntersectionStageType | null;
}

const IntersectionDirectiveName = 'intersection';

const IntersectionRatioMultiplier = 10000;
const IntersectionRatioThreshold = (99 * (IntersectionRatioMultiplier / 100));

export const IntersectionDirectiveHandler = CreateDirectiveHandlerCallback(IntersectionDirectiveName, ({ componentId, component, contextElement, expression, argKey, argOptions }) => {
    if (BindEvent({ contextElement, expression,
        component: (component || componentId),
        key: IntersectionDirectiveName,
        event: argKey,
        defaultEvent: 'visible',
        eventWhitelist: ['ratio', 'stage'],
        options: argOptions,
        optionBlacklist: ['window', 'document', 'outside', 'once'],
    })){
        return;
    }
    
    let resolvedComponent = (component || FindComponentById(componentId));
    if (!resolvedComponent){
        return JournalError('Failed to resolve component.', 'InlineJS.IntersectionDirectiveHandler', contextElement);
    }

    let options = ResolveOptions({
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
    
    let intersectionOptions: IIntersectionOptions = {
        root: ((options.ancestor < 0) ? null : resolvedComponent.FindAncestor(contextElement, options.ancestor)),
        threshold: ((options.threshold < 0) ? 0 : options.threshold),
        spread: true,
    };

    let observer = new IntersectionObserver(resolvedComponent.GenerateUniqueId('int_obs_'), intersectionOptions);
    if (!observer){
        return JournalError('Failed to create observer.', 'InlineJS.IntersectionDirectiveHandler', contextElement);
    }

    expression = expression.trim();
    let evaluate = (expression ? EvaluateLater({ componentId, contextElement, expression }) : null);

    let state: IIntersectionState = {
        visible: null,
        ratio: null,
        stage: null,
    };

    const getEventName = (name: string) => `${IntersectionDirectiveName}.${name}`;
    const id = resolvedComponent.GenerateUniqueId('intsn_proxy_'), updateState = (key: keyof IIntersectionState, value: IntersectionStateType) => {
        if (state[key] !== value){
            (state[key] as IntersectionStateType) = value;
            AddChanges('set', `${id}.${key}`, key, FindComponentById(componentId)?.GetBackend().changes);
            contextElement.dispatchEvent(new CustomEvent(getEventName(key), {
                detail: { value: value },
            }));
        }
    };

    observer.Observe(contextElement, ({ id, entry } = {}) => {
        if (!entry){//Invalid
            return;
        }

        let ratio = Math.round(entry.intersectionRatio * IntersectionRatioMultiplier);
        if (entry.isIntersecting){//In
            if ((options.out && !options.in) || (options.in && options.fully && ratio <= IntersectionRatioThreshold)){
                return;//Only 'out' option sepcified OR 'in' and 'fully' options specified but is not fully visible
            }

            updateState('visible', true);
            updateState('ratio', entry.intersectionRatio);
            updateState('stage', ((ratio <= IntersectionRatioThreshold) ? 'partial' : 'full'));
        }
        else if (state.visible === null || options.out || !options.in){//Out
            updateState('visible', false);
            updateState('ratio', 0);
            updateState('stage', 'none');
        }
        else{//Only 'in' option sepcified
            return;
        }

        const clonedState = { ...state };
        evaluate && evaluate(undefined, [clonedState], {
            state: clonedState,
        });
        
        options.once && FindComponentById(componentId)?.RemoveIntersectionObserver(id!);
    });

    let local = CreateInplaceProxy(BuildGetterProxyOptions({ getter: (prop) => {
        if (prop && state.hasOwnProperty(prop)){
            return state[prop];
        }
    }, lookup: [...Object.keys(state)], alert: { componentId, id } }));

    resolvedComponent.FindElementScope(contextElement)?.SetLocal(`\$${IntersectionDirectiveName}`, local);
});

export function IntersectionDirectiveHandlerCompact(){
    AddDirectiveHandler(IntersectionDirectiveHandler);
}
