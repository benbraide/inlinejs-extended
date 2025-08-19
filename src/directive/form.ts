import {
    FindComponentById,
    AddDirectiveHandler,
    CreateDirectiveHandlerCallback,
    EvaluateLater,
    GetGlobal,
    JournalError,
    JournalTry,
    AddChanges,
    BuildGetterProxyOptions,
    CreateInplaceProxy,
    UseEffect,
    IAlertConcept,
    IComponent,
    IsObject,
    ToString,
    BindEvent,
    ResolveOptions
} from "@benbraide/inlinejs";

import { FormDirectiveName, ServerConceptName, StateDirectiveName } from "../names";
import { IServerConcept, IServerProgressInfo } from "../types";

interface IFormFieldExpression{
    value: string;
    source: HTMLElement;
}

interface IFormMiddlewareDataInfo{
    data: any;
    source?: HTMLElement;
}

export interface IFormMiddleware{
    GetKey(): string;
    Handle(data?: any, component?: IComponent | string, contextElement?: HTMLElement): Promise<void | boolean>;
}

export interface IFormBlobResponse{
    blob: Blob;
    filename: string;
}

let FormMiddlewares: Record<string, IFormMiddleware> = {};

const FormMethodVerbs = ['put', 'patch', 'delete'];
const FormTokenName = '_FormPostToken_';

export const FormDirectiveHandler = CreateDirectiveHandlerCallback(FormDirectiveName, ({ componentId, component, contextElement, expression, argKey, argOptions }) => {
    if (BindEvent({ contextElement, expression,
        component: (component || componentId),
        key: FormDirectiveName,
        event: argKey,
        defaultEvent: 'success',
        eventWhitelist: ['error', 'submitting', 'submit', 'save', 'load', 'reset', 'progress'],
        options: argOptions,
        optionBlacklist: ['window', 'document', 'outside'],
    })){
        return;
    }

    let resolvedComponent = (component || FindComponentById(componentId));
    if (!resolvedComponent){
        return JournalError('Failed to resolve component.', 'InlineJS.FormDirectiveHandler', contextElement);
    }

    let localKey = `\$${FormDirectiveName}`, secretKey = `#${FormDirectiveName}`;
    if (argKey === 'field'){
        let proxy = resolvedComponent.FindElementLocalValue(contextElement, secretKey, true);
        resolvedComponent.FindElementScope(contextElement)?.AddUninitCallback(() => {
            let proxy = FindComponentById(componentId)?.FindElementLocalValue(contextElement, secretKey, true);
            (proxy && !GetGlobal().IsNothing(proxy)) && proxy.removeFieldExpression(contextElement);
        });
        
        return ((proxy && !GetGlobal().IsNothing(proxy)) && proxy.setFieldExpression(expression, contextElement));
    }
    
    if (argKey in FormMiddlewares){//Bind data
        let evaluate = EvaluateLater({ componentId, contextElement, expression });
        return UseEffect({ componentId, contextElement,
            callback: () => evaluate((data) => {
                let component = FindComponentById(componentId), proxy = component?.FindElementLocalValue(contextElement, localKey, true);
                if (proxy){//Bind data
                    proxy.bindMiddlewareData(argKey, data, contextElement);
                    component!.FindElementScope(contextElement)?.AddUninitCallback(() => {
                        let proxy = FindComponentById(componentId)?.FindElementLocalValue(contextElement, localKey, true);
                        if (proxy){
                            proxy.unbindMiddlewareData(contextElement);
                        }
                    });
                }
            }),
        });
    }

    let id = resolvedComponent.GenerateUniqueId('form_proxy_'), middlewares = new Array<IFormMiddleware>(), options = ResolveOptions({
        options: {
            refresh: false,
            reload: false,
            persistent: false,
            reset: false,
            success: false,
            error: false,
            nexttick: false,
            novalidate: false,
            silent: false,
            upload: false,
            download: false,
            duplex: false,
            blob: false,
            save: false,
        },
        list: argOptions,
        unknownCallback: ({ option }) => {
            if (FormMiddlewares.hasOwnProperty(option = option!.split('-').join('.'))){
                middlewares.push(FormMiddlewares[option]);
            }
        },
    });

    let form: HTMLFormElement | null = null, getAction: () => string, getMethod: () => string, appendFields = (url: string, fields: Array<[string, string]>) => {
        let query = fields.reduce((prev, [key, value]) => (prev ? `${prev}&${key}=${value}` : `${key}=${value}`), '');
        return (query ? (url.includes('?') ? `${url}&${query}` : `${url}?${query}`) : url);
    };

    let computeMethod = () => {
        let method = getMethod();
        if (FormMethodVerbs.includes(method)){
            fields['_method'] = method;
            method = 'post';
        }

        return method;
    };

    let buildUrl: (info: RequestInit) => string, eventName: string, eventHandler: ((e?: Event) => boolean) | null = null, fields: Record<string, any> = {};
    if (contextElement instanceof HTMLFormElement){
        getAction = () => contextElement.action;
        getMethod = () => (contextElement.method || 'get').toLowerCase();
        
        form = contextElement;
        eventName = 'submit';

        let method = getMethod();
        if (method !== 'get' && method !== 'head'){
            buildUrl = (info) => {
                info.body = new FormData(contextElement);
                return getAction();
            };
        }
        else{//Get | Head
            buildUrl = () => appendFields(getAction(), Array.from((new FormData(contextElement)).entries()).map(([key, value]) => [key, value.toString()]));
        }
    }
    else if (contextElement instanceof HTMLInputElement || contextElement instanceof HTMLTextAreaElement || contextElement instanceof HTMLSelectElement){
        getAction = () => (contextElement.getAttribute('data-action') || '');
        getMethod = () => (contextElement.getAttribute('data-method') || 'get').toLowerCase();

        if (!(contextElement instanceof HTMLSelectElement)){
            eventName = 'keydown';
            eventHandler = e => (!e || (e as KeyboardEvent).key.toLowerCase() === 'enter');
        }
        else{//Select
            eventName = 'change';
        }
        
        buildUrl = () => (fields[contextElement.getAttribute('name') || 'value'] = contextElement.value);
    }
    else{//Unknown
        let isAnchor = (contextElement instanceof HTMLAnchorElement);

        getAction = () => (isAnchor ? (contextElement as HTMLAnchorElement).href : (contextElement.getAttribute('data-action') || ''));
        getMethod = () => (contextElement.getAttribute('data-method') || 'get').toLowerCase();

        eventName = 'click';
        buildUrl = getAction;
    }

    let middlewareData: Record<string, IFormMiddlewareDataInfo> = {}, state = {
        active: false,
        submitted: false,
        errors: {},
    };

    let updateState = (key: string, value: any) => {
        if (state[key] !== value){
            state[key] = value;
            AddChanges('set', `${id}.${key}`, key, FindComponentById(componentId)?.GetBackend().changes);
        }
    };

    let resolveMiddlewareData = (key: string) => (middlewareData.hasOwnProperty(key) ? middlewareData[key].data : undefined);
    let runMiddlewares = async (callback: () => void) => {
        for (let middleware of middlewares){
            try{
                if (await middleware.Handle(resolveMiddlewareData(middleware.GetKey()), componentId, contextElement) === false){
                    return;//Rejected
                }
            }
            catch{}
        }

        if (callback){
            callback();
        }
    };

    let evaluate = EvaluateLater({ componentId, contextElement, expression }), doEvaluation = (ok: boolean, data: any) => {
        evaluate(undefined, undefined, {
            response: { ok, data },
        });
    };
    
    let afterHandledEvent = (ok: boolean, data: any) => {
        if (ok){
            contextElement.dispatchEvent(new CustomEvent(`${FormDirectiveName}.success`, {
                detail: { data },
            }));
        }
        else{
            contextElement.dispatchEvent(new CustomEvent(`${FormDirectiveName}.error`, {
                detail: { data },
            }));
        }

        if ((!options.success && !options.error) || (options.success && ok) || (options.error && !ok)){
            if (options.nexttick){
                FindComponentById(componentId)?.GetBackend().changes.AddNextTickHandler(() => doEvaluation(ok, data));
            }
            else{
                doEvaluation(ok, data);
            }
        }
    };

    let fieldExpressions = new Array<IFormFieldExpression>(), evaluateFieldExpressions = (callback: () => void) => {
        const filtered = fieldExpressions.filter(info => (info.source === contextElement || contextElement.contains(info.source))), complete = () => {
            const promises = new Array<Promise<any>>(), promiseKeys = new Array<string>();
            Object.entries(fields).forEach(([key, value]) => {
                if (value instanceof Promise){
                    promises.push(value);
                    promiseKeys.push(key);
                }
            });

            if (promises.length > 0){//Wait for promises
                Promise.all(promises).then((values) => {
                    values.forEach((value, index) => (fields[promiseKeys[index]] = value));
                    callback();
                }).catch((err) => {
                    JournalError(err, `InlineJS.${FormDirectiveName}.HandleEvent`, contextElement);
                    callback();
                });
            }
            else{//No promises
                callback();
            }
        };

        if (filtered.length > 0){
            filtered.forEach((info, index) => {
                EvaluateLater({ componentId, contextElement: info.source, expression: info.value })((value) => {
                    IsObject(value) && (fields = { ...fields, ...value });
                    (index >= (filtered.length - 1)) && complete();
                });
            });
        }
        else{//No field expressions
            complete();
        }
    };
    
    let handleEvent = (e?: Event) => {
        if (state.active || (eventHandler && !eventHandler(e))){
            return;
        }
        
        let event = new CustomEvent(`${FormDirectiveName}.submitting`, { cancelable: true });
        contextElement.dispatchEvent(event);
        if (event.defaultPrevented){
            return;
        }

        updateState('active', true);
        updateState('submitted', true);

        evaluateFieldExpressions(() => {
            const info: RequestInit = {
                method: computeMethod(),
                credentials: 'same-origin',
            };
    
            const url = buildUrl(info);
            if (info.method === 'post'){//Append applicable fields
                (info.body = (info.body || new FormData));
                if (FormTokenName in globalThis){
                    (info.body as FormData).append('_token', globalThis[FormTokenName]);
                }
    
                Object.entries(fields).forEach(([key, value]) => (info.body as FormData).append(key, value));
            }
            else{//Get | Head
                appendFields(url, Object.entries(fields));
            }
            
            let handleData = (data: string|IFormBlobResponse) => {
                updateState('active', false);
                updateState('errors', {});

                let response: any;
                try{
                    response = typeof data === 'string' ? JSON.parse(data) : data;
                }
                catch{
                    response = null;
                }

                const event = new CustomEvent(`${FormDirectiveName}.submit`, {
                    detail: { response: response },
                    cancelable: true
                });
    
                contextElement.dispatchEvent(event);

                let router = GetGlobal().GetConcept<any>('router'), after: (() => void) | null = null;
                if (options.refresh){
                    after = () => window.location.reload();
                }
                else if (options.reload){
                    after = () => (router ? router.Reload() : window.location.reload());
                }
                else if (options.reset && form){
                    form.reset();
                    FindComponentById(componentId)?.GetBackend().changes.AddNextTickHandler(() => form?.dispatchEvent(new CustomEvent(`${FormDirectiveName}.reset`)));
                }

                if (typeof data !== 'string'){
                    if (!event.defaultPrevented && options.save){// Download file
                        const blobUrl = URL.createObjectURL(data.blob);

                        // Create a new anchor element to trigger the download.
                        const link = document.createElement('a');
                        link.href = blobUrl;

                        // Set the download attribute to the desired filename.
                        link.download = data.filename;

                        document.body.appendChild(link);

                        // Simulate a click on the anchor element to trigger the download.
                        link.click();
                        
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(blobUrl);
                    }
                    
                    afterHandledEvent(true, data);
                    after && after();

                    return;
                }
                
                if (!response || !IsObject(response)){
                    afterHandledEvent(true, response);
                    after && after();

                    return;
                }
    
                JournalTry(() => {
                    if (response.hasOwnProperty('failed')){
                        let failed = response['failed'];
                        Object.entries(IsObject(failed) ? failed : {}).forEach(([key, value]) => {
                            state.errors[key] = value;
    
                            if (form && !options.novalidate){//Set validation error
                                let item = form.elements.namedItem(key);
                                let local = (item && FindComponentById(componentId)?.FindElementLocalValue(<HTMLElement>item, `\$${StateDirectiveName}`, true));
                                if (local && !GetGlobal().IsNothing(local)){
                                    local['setMessage'](Array.isArray(value) ? value.map(v => ToString(v)).join('\n') : ToString(value));
                                }
                            }
                        });
                    }
    
                    if (!options.silent && (response.hasOwnProperty('alert') || response.hasOwnProperty('report'))){
                        GetGlobal().GetConcept<IAlertConcept>('alert')?.Notify(response['alert'] || response['report']);
                    }
    
                    afterHandledEvent((response['ok'] !== false), response['data']);
                    if (response['ok'] === false){
                        return;
                    }
    
                    if (response.hasOwnProperty('redirect')){
                        let redirect = response['redirect'];
                        if (IsObject(redirect)){
                            after = () => {
                                if (!options.refresh && !redirect['refresh'] && router){
                                    router.Goto(redirect['page'], (options.reload || redirect['reload']), (response.hasOwnProperty('data') ? redirect['data'] : undefined));
                                }
                                else{
                                    window.location.href = redirect['page'];
                                }
                            };
                        }
                        else if (typeof redirect === 'string'){
                            after = () => {
                                if (!options.refresh && router){
                                    router.Goto(redirect, options.reload);
                                }
                                else{
                                    window.location.href = redirect;
                                }
                            };
                        }
                    }
    
                    after && after();
                }, `InlineJS.${FormDirectiveName}.HandleEvent`, contextElement);
            };
    
            if (options.upload || options.download || options.duplex){
                const doWhile = (progress: number | string | IServerProgressInfo) => {
                    if (typeof progress === 'number'){
                        contextElement.dispatchEvent(new CustomEvent(`${FormDirectiveName}.progress`, {
                            detail: { progress },
                        }));
                    }
                    else if (typeof progress !== 'string'){
                        contextElement.dispatchEvent(new CustomEvent(`${FormDirectiveName}.progress`, {
                            detail: { progress: { ...progress } },
                        }));
                    }
                };
    
                const doFinal = (res: number | string | IServerProgressInfo) => ((typeof res === 'string') && handleData(res));
                if (options.upload){
                    doWhile(0);
                    GetGlobal().GetConcept<IServerConcept>(ServerConceptName)?.Upload(url, <FormData>info.body, info.method).While(doWhile).Final(doFinal);
                }
                else if (options.download){
                    doWhile(0);
                    GetGlobal().GetConcept<IServerConcept>(ServerConceptName)?.Download(url, <FormData>info.body, info.method).While(doWhile).Final(doFinal);
                }
                else{
                    doWhile(<IServerProgressInfo>{ isUpload: true, value: 0 });
                    GetGlobal().GetConcept<IServerConcept>(ServerConceptName)?.Duplex(url, <FormData>info.body, info.method).While(doWhile).Final(doFinal);
                }
            }
            else{
                const handler = (resolver: (res: Response) => Promise<string|IFormBlobResponse>) => {
                    GetGlobal().GetFetchConcept().Get(url, info).then(res => res.ok ? resolver(res) : Promise.reject(new Error(res.statusText))).then(handleData).catch((err) => {
                        updateState('active', false);
                        JournalError(err, `InlineJS.${FormDirectiveName}.HandleEvent`, contextElement);
                    });
                };

                if (options.blob){
                    const getFileName = (res: Response) => {
                        const contentDisposition = res.headers.get('Content-Disposition');
                        if (contentDisposition) {
                            // Use a regular expression to extract the filename from the header.
                            const filenameMatch = contentDisposition.match(/filename\*?=['"]?(?:UTF-8''|[^;']*)?([^;\n"']*)['"]?/);

                            if (filenameMatch && filenameMatch[1]) {
                                return decodeURIComponent(filenameMatch[1].replace(/\+/g, ' '));// Decode the filename to handle special characters.
                            }
                        }

                        return '';
                    };
                    
                    handler((res) => res.blob().then((blob) => {
                        const response: IFormBlobResponse = {
                            blob,
                            filename: getFileName(res),
                        };

                        return Promise.resolve(response);
                    }));
                }
                else{
                    handler((res) => res.text());
                }
            }
        });
    };

    resolvedComponent.FindElementScope(contextElement)?.SetLocal(localKey, CreateInplaceProxy(BuildGetterProxyOptions({
        getter: (prop) => {
            if (prop && state.hasOwnProperty(prop)){
                FindComponentById(componentId)?.GetBackend().changes.AddGetAccess(`${id}.${prop}`);
                return state[prop];
            }

            if (prop === 'element'){
                return contextElement;
            }
    
            if (prop === 'submit'){
                return (shouldRunMiddlewares = true) => {
                    if (shouldRunMiddlewares){
                        runMiddlewares(handleEvent);
                    }
                    else{//Skip middlewares
                        handleEvent();
                    }
                };
            }

            if (prop === 'reset'){
                return () => form?.reset();
            }
    
            if (prop === 'bindMiddlewareData'){
                return (middleware: string, data: any, source?: HTMLElement) => {
                    middlewareData[middleware] = { data, source };
                };
            }
    
            if (prop === 'unbindMiddlewareData'){
                return (target: string | HTMLElement) => {
                    if (typeof target !== 'string'){
                        Object.entries(middlewareData).forEach(([key, value]) => {
                            if (value.source === target){
                                delete middlewareData[key];
                            }
                        });
                    }
                    else{//Unbind single
                        delete middlewareData[target];
                    }
                };
            }

            if (prop === 'addField'){
                return (name: string, value: string) => (fields[name] = value);
            }

            if (prop === 'removeField'){
                return (name: string) => (delete fields[name]);
            }
        },
        lookup: [...Object.keys(state), 'element', 'submit', 'reset', 'bindMiddlewareData', 'unbindMiddlewareData', 'addField', 'removeField'],
    })));

    resolvedComponent.FindElementScope(contextElement)?.SetLocal(secretKey, CreateInplaceProxy(BuildGetterProxyOptions({
        getter: (prop) => {
            if (prop === 'setFieldExpression'){
                return (expression: string, source: HTMLElement) => fieldExpressions.push({ value: expression, source });
            }

            if (prop === 'removeFieldExpression'){
                return (source: HTMLElement) => (fieldExpressions = fieldExpressions.filter(info => (info.source !== source)));
            }
        },
        lookup: ['setFieldExpression', 'removeFieldExpression'],
    })));

    let onEvent = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();

        if (!state.active){
            runMiddlewares(handleEvent);
        }
    };

    contextElement.addEventListener(eventName, onEvent);
});

export function FormDirectiveHandlerCompact(){
    AddDirectiveHandler(FormDirectiveHandler);
}

export function AddFormMiddleware(middleware: IFormMiddleware){
    FormMiddlewares[middleware.GetKey()] = middleware;
}

export function RemoveFormMiddleware(name: string){
    if (FormMiddlewares.hasOwnProperty(name)){
        delete FormMiddlewares[name];
    }
}
