import { FindComponentById, AddDirectiveHandler, CreateDirectiveHandlerCallback, EvaluateLater, IComponent, ResolveOptions } from "@benbraide/inlinejs";

function BindKeyboardInside(contextElement: HTMLElement, callback: (isInside: boolean, unbind: () => void) => void){
    let lastValue = false, callCallback = (value: boolean) => {
        if (value != lastValue){
            callback((lastValue = value), unbind);
        }
    };
    
    let onEnter = () => callCallback(true), onLeave = () => callCallback(false), unbind = () => {
        contextElement.removeEventListener('focusout', onLeave);
        contextElement.removeEventListener('focusin', onEnter);
    };
    
    contextElement.addEventListener('focusin', onEnter);
    contextElement.addEventListener('focusout', onLeave);
}

function BindKeyboardKey(contextElement: HTMLElement, key: 'down' | 'up', callback: (key: string) => void){
    contextElement.addEventListener(`key${key}`, (e) => callback(e.key));
}

function BindKeyboardState(contextElement: HTMLElement, callback: (keys: Array<string>) => void): () => void{
    const held = new Set<string>();

    const onDown = (e: KeyboardEvent) => {
        if (!held.has(e.key)) {
            held.add(e.key);
            callback(Array.from(held));
        }
    };

    const onUp = (e: KeyboardEvent) => {
        if (held.has(e.key)) {
            held.delete(e.key);
            callback(Array.from(held));
        }
    };

    contextElement.addEventListener('keydown', onDown);
    contextElement.addEventListener('keyup', onUp);
    
    return () => {
        contextElement.removeEventListener('keydown', onDown);
        contextElement.removeEventListener('keyup', onUp);
    };
}

const DefaultKeyboardTypeDelay = 500;

function BindKeyboardType(component: IComponent | null, contextElement: HTMLElement, delay: number, callback: (typing: boolean) => void){
    let checkpoint = 0, reset = () => {
        ++checkpoint;
    };

    component?.FindElementScope(contextElement)?.AddUninitCallback(reset);
    let lastValue = false, callCallback = (value: boolean) => {
        if (value != lastValue){
            callback(lastValue = value);
        }
    };
    
    let afterDelay = (myCheckpoint: number) => {
        if (myCheckpoint == checkpoint){
            callCallback(false);
        }
    };

    contextElement.addEventListener('keydown', () => {
        let myCheckpoint = ++checkpoint;
        callCallback(true);
        setTimeout(() => afterDelay(myCheckpoint), ((delay < 0) ? DefaultKeyboardTypeDelay : delay));
    });
}

export const KeyboardDirectiveHandler = CreateDirectiveHandlerCallback('keyboard', ({ component, componentId, contextElement, expression, argKey, argOptions }) => {
    if (!(expression = expression.trim())){
        return;
    }
    
    let options = ResolveOptions({
        options: {
            delay: -1,
            once: false,
        },
        list: argOptions,
        defaultNumber: -1,
    });
    
    let evaluate = EvaluateLater({ componentId, contextElement, expression });
    if (argKey === 'inside'){
        BindKeyboardInside(contextElement, (inside, unbind) => {
            evaluate(undefined, [inside], { inside });
            if (options.once){
                unbind();
            }
        });
    }
    else if (argKey === 'down' || argKey === 'up'){
        BindKeyboardKey(contextElement, argKey, key => evaluate(undefined, [key], { key }));
    }
    else if (argKey === 'held'){
        const unbind = BindKeyboardState(contextElement, (keys) => {
            evaluate(undefined, [keys], { keys });
        });
        
        (component || FindComponentById(componentId))?.FindElementScope(contextElement)?.AddUninitCallback(unbind);
    }
    else if (argKey === 'type'){
        BindKeyboardType((component || FindComponentById(componentId)), contextElement, options.delay, typing => evaluate(undefined, [typing], { typing }));
    }
});

export function KeyboardDirectiveHandlerCompact(){
    AddDirectiveHandler(KeyboardDirectiveHandler);
}
