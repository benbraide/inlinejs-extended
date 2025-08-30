import { FindComponentById, AddDirectiveHandler, CreateDirectiveHandlerCallback, EvaluateLater, IComponent, ResolveOptions } from "@benbraide/inlinejs";

function BindMouseInside(contextElement: HTMLElement | Document | (Window & typeof globalThis), callback: (isInside: boolean) => void){
    let lastValue = false, callCallback = (value: boolean) => {
        if (value != lastValue){
            callback(lastValue = value);
        }
    };
    
    const onEnter = () => callCallback(true), onLeave = () => callCallback(false), unbind = () => {
        contextElement.removeEventListener('mouseleave', onLeave);
        contextElement.removeEventListener('mouseenter', onEnter);
    };
    
    contextElement.addEventListener('mouseenter', onEnter);
    contextElement.addEventListener('mouseleave', onLeave);

    return unbind;
}

const DefaultMouseDelay = 100;
const DefaultMouseDebounce = 250;

function BindMouseRepeat(contextElement: HTMLElement | Document | (Window & typeof globalThis), delay: number, debounce: number, callback: (streak: number) => void){
    let checkpoint = 0, streak = 0, reset = () => {
        ++checkpoint;
        streak = 0;
    };

    let afterDelay = (myCheckpoint: number) => {
        if (myCheckpoint == checkpoint){
            callback(++streak);
            setTimeout(() => afterDelay(myCheckpoint), ((delay < 0) ? DefaultMouseDelay : delay));
        }
    };

    const handler = () => {
        streak = 0;
        let myCheckpoint = ++checkpoint;
        callback(++streak);
        setTimeout(() => afterDelay(myCheckpoint), ((debounce < 0) ? DefaultMouseDebounce : debounce));
    };
    
    contextElement.addEventListener('mousedown', handler);
    contextElement.addEventListener('mouseup', reset);
    contextElement.addEventListener('mouseleave', reset);

    return () => {
        contextElement.removeEventListener('mousedown', handler);
        contextElement.removeEventListener('mouseup', reset);
        contextElement.removeEventListener('mouseleave', reset);
    };
}

interface IMouseCoordinate{
    client: { x: number, y: number };
    offset: { x: number, y: number };
    screen: { x: number, y: number };
}

function BindMouseMove(contextElement: HTMLElement | Document | (Window & typeof globalThis), callback: (count: IMouseCoordinate | null) => void){
    const moveHandler = (e: Event) => {
        if (e instanceof MouseEvent){
            callback({
                client: { x: e.clientX, y: e.clientY },
                offset: { x: e.offsetX, y: e.offsetY },
                screen: { x: e.screenX, y: e.screenY },
            });
        }
        else{
            callback(null);
        }
    };

    const leaveHandler = () => callback(null);
    
    contextElement.addEventListener('mousemove', moveHandler);
    contextElement.addEventListener('mouseleave', leaveHandler);

    return () => {
        contextElement.removeEventListener('mousemove', moveHandler);
        contextElement.removeEventListener('mouseleave', leaveHandler);
    };
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
            document: false,
            window: false,
        },
        list: argOptions,
        defaultNumber: -1,
    }), unbind: (() => void) | null = null;

    const evaluate = EvaluateLater({ componentId, contextElement, expression });
    const target = options.window ? window : (options.document ? globalThis.document : contextElement);
    
    if (argKey === 'inside'){
        unbind = BindMouseInside(target, (inside) => {
            evaluate(undefined, [inside], { inside });
            if (options.once){
                unbind?.();
                unbind = null;
            }
        });
    }
    else if (argKey === 'move'){
        unbind = BindMouseMove(target, position => evaluate(undefined, [position], { position }));
    }
    else if (argKey === 'repeat'){
        unbind = BindMouseRepeat(target, options.delay, options.debounce, streak => evaluate(undefined, [streak], { streak }));
    }

    unbind && (component || FindComponentById(componentId))?.FindElementScope(contextElement)?.AddUninitCallback(() => unbind?.());
});

export function MouseDirectiveHandlerCompact(){
    AddDirectiveHandler(MouseDirectiveHandler);
}
