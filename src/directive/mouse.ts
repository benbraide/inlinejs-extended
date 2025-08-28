import { FindComponentById, AddDirectiveHandler, CreateDirectiveHandlerCallback, EvaluateLater, IComponent, ResolveOptions } from "@benbraide/inlinejs";

function BindMouseInside(contextElement: HTMLElement, callback: (isInside: boolean, unbind: () => void) => void){
    let lastValue = false, callCallback = (value: boolean) => {
        if (value != lastValue){
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

function BindMouseRepeat(component: IComponent | null, contextElement: HTMLElement, delay: number, debounce: number, callback: (streak: number) => void){
    let checkpoint = 0, streak = 0, reset = () => {
        ++checkpoint;
        streak = 0;
    };

    component?.FindElementScope(contextElement)?.AddUninitCallback(reset);

    let afterDelay = (myCheckpoint: number) => {
        if (myCheckpoint == checkpoint){
            callback(++streak);
            setTimeout(() => afterDelay(myCheckpoint), ((delay < 0) ? DefaultMouseDelay : delay));
        }
    };

    contextElement.addEventListener('mousedown', () => {
        streak = 0;
        let myCheckpoint = ++checkpoint;
        callback(++streak);
        setTimeout(() => afterDelay(myCheckpoint), ((debounce < 0) ? DefaultMouseDebounce : debounce));
    });

    contextElement.addEventListener('mouseup', reset);
    contextElement.addEventListener('mouseleave', reset);
}

interface IMouseCoordinate{
    client: { x: number, y: number };
    offset: { x: number, y: number };
    screen: { x: number, y: number };
}

function BindMouseMove(contextElement: HTMLElement, callback: (count: IMouseCoordinate | null) => void){
    contextElement.addEventListener('mousemove', e => callback({
        client: { x: e.clientX, y: e.clientY },
        offset: { x: e.offsetX, y: e.offsetY },
        screen: { x: e.screenX, y: e.screenY },
    }));

    contextElement.addEventListener('mouseleave', () => callback(null));
}

export const MouseDirectiveHandler = CreateDirectiveHandlerCallback('mouse', ({ componentId, component, contextElement, expression, argKey, argOptions }) => {
    if (!(expression = expression.trim())){
        return;
    }
    
    let options = ResolveOptions({
        options: {
            delay: -1,
            debounce: -1,
            once: false,
        },
        list: argOptions,
        defaultNumber: -1,
    });

    const evaluate = EvaluateLater({ componentId, contextElement, expression });
    if (argKey === 'inside'){
        BindMouseInside(contextElement, (inside, unbind) => {
            evaluate(undefined, [inside], { inside });
            if (options.once){
                unbind();
            }
        });
    }
    else if (argKey === 'move'){
        BindMouseMove(contextElement, position => evaluate(undefined, [position], { position }));
    }
    else if (argKey === 'repeat'){
        BindMouseRepeat((component || FindComponentById(componentId)), contextElement, options.delay, options.debounce, streak => evaluate(undefined, [streak], { streak }));
    }
});

export function MouseDirectiveHandlerCompact(){
    AddDirectiveHandler(MouseDirectiveHandler);
}
