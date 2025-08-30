import { FindComponentById, AddDirectiveHandler, CreateDirectiveHandlerCallback, EvaluateLater, IComponent, ResolveOptions } from "@benbraide/inlinejs";

function BindKeyboardInside(contextElement: HTMLElement | Document | (Window & typeof globalThis), callback: (isInside: boolean) => void){
    let lastValue = false, callCallback = (value: boolean) => {
        if (value != lastValue){
            callback(lastValue = value);
        }
    };
    
    const onEnter = () => callCallback(true), onLeave = () => callCallback(false), unbind = () => {
        contextElement.removeEventListener('focusout', onLeave);
        contextElement.removeEventListener('focusin', onEnter);
    };
    
    contextElement.addEventListener('focusin', onEnter);
    contextElement.addEventListener('focusout', onLeave);

    return unbind;
}

function BindKeyboardKey(contextElement: HTMLElement | Document | (Window & typeof globalThis), key: 'down' | 'up', callback: (key: string) => void){
    const handler = (e: Event) => callback((e as any).key || '');
    contextElement.addEventListener(`key${key}`, handler);
    return () => contextElement.removeEventListener(`key${key}`, handler);
}

function BindKeyboardState(contextElement: HTMLElement | Document | (Window & typeof globalThis), callback: (keys: Array<string>) => void): () => void{
    const held = new Set<string>();

    const onDown = (e: Event) => {
        const key = (e as any).key || '';
        if (key && !held.has(key)) {
            held.add(key);
            callback(Array.from(held));
        }
    };

    const onUp = (e: Event) => {
        const key = (e as any).key || '';
        if (key && held.has(key)) {
            held.delete(key);
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

function BindKeyboardType(component: IComponent | null, contextElement: HTMLElement | Document | (Window & typeof globalThis), delay: number, callback: (typing: boolean) => void){
    let checkpoint = 0, reset = () => {
        ++checkpoint;
    };

    component?.FindElementScope(contextElement)?.AddUninitCallback(reset);
    let lastValue = false, callCallback = (value: boolean) => {
        if (value != lastValue){
            callback(lastValue = value);
        }
    };
    
    const afterDelay = (myCheckpoint: number) => {
        if (myCheckpoint == checkpoint){
            callCallback(false);
        }
    };

    const handler = () => {
        let myCheckpoint = ++checkpoint;
        callCallback(true);
        setTimeout(() => afterDelay(myCheckpoint), ((delay < 0) ? DefaultKeyboardTypeDelay : delay));
    };

    contextElement.addEventListener('keydown', handler);
    return () => contextElement.removeEventListener('keydown', handler);
}

export const KeyboardDirectiveHandler = CreateDirectiveHandlerCallback('keyboard', ({ component, componentId, contextElement, expression, argKey, argOptions }) => {
    if (!(expression = expression.trim())){
        return;
    }
    
    let options = ResolveOptions({
        options: {
            delay: -1,
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
        unbind = BindKeyboardInside(target, (inside) => {
            evaluate(undefined, [inside], { inside });
            if (options.once){
                unbind?.();
                unbind = null;
            }
        });
    }
    else if (argKey === 'down' || argKey === 'up'){
        unbind = BindKeyboardKey(target, argKey, key => evaluate(undefined, [key], { key }));
    }
    else if (argKey === 'held'){
        unbind = BindKeyboardState(target, (keys) => {
            evaluate(undefined, [keys], { keys });
        });
    }
    else if (argKey === 'type'){
        unbind = BindKeyboardType((component || FindComponentById(componentId)), target, options.delay, typing => evaluate(undefined, [typing], { typing }));
    }

    unbind && (component || FindComponentById(componentId))?.FindElementScope(contextElement)?.AddUninitCallback(() => unbind?.());
});

export function KeyboardDirectiveHandlerCompact(){
    AddDirectiveHandler(KeyboardDirectiveHandler);
}
