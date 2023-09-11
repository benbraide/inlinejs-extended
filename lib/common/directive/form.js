"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveFormMiddleware = exports.AddFormMiddleware = exports.FormDirectiveHandlerCompact = exports.FormDirectiveHandler = void 0;
const inlinejs_1 = require("@benbraide/inlinejs");
const names_1 = require("../names");
let FormMiddlewares = {};
const FormMethodVerbs = ['put', 'patch', 'delete'];
const FormTokenName = '_FormPostToken_';
exports.FormDirectiveHandler = (0, inlinejs_1.CreateDirectiveHandlerCallback)(names_1.FormDirectiveName, ({ componentId, component, contextElement, expression, argKey, argOptions }) => {
    var _a, _b, _c;
    if ((0, inlinejs_1.BindEvent)({ contextElement, expression,
        component: (component || componentId),
        key: names_1.FormDirectiveName,
        event: argKey,
        defaultEvent: 'success',
        eventWhitelist: ['error', 'submitting', 'submit', 'save', 'load', 'reset', 'progress'],
        options: argOptions,
        optionBlacklist: ['window', 'document', 'outside'],
    })) {
        return;
    }
    let resolvedComponent = (component || (0, inlinejs_1.FindComponentById)(componentId));
    if (!resolvedComponent) {
        return (0, inlinejs_1.JournalError)('Failed to resolve component.', 'InlineJS.FormDirectiveHandler', contextElement);
    }
    let localKey = `\$${names_1.FormDirectiveName}`, secretKey = `#${names_1.FormDirectiveName}`;
    if (argKey === 'field') {
        let proxy = resolvedComponent.FindElementLocalValue(contextElement, secretKey, true);
        (_a = resolvedComponent.FindElementScope(contextElement)) === null || _a === void 0 ? void 0 : _a.AddUninitCallback(() => {
            var _a;
            let proxy = (_a = (0, inlinejs_1.FindComponentById)(componentId)) === null || _a === void 0 ? void 0 : _a.FindElementLocalValue(contextElement, secretKey, true);
            (proxy && !(0, inlinejs_1.GetGlobal)().IsNothing(proxy)) && proxy.removeFieldExpression(contextElement);
        });
        return ((proxy && !(0, inlinejs_1.GetGlobal)().IsNothing(proxy)) && proxy.setFieldExpression(expression, contextElement));
    }
    if (argKey in FormMiddlewares) { //Bind data
        let evaluate = (0, inlinejs_1.EvaluateLater)({ componentId, contextElement, expression });
        return (0, inlinejs_1.UseEffect)({ componentId, contextElement,
            callback: () => evaluate((data) => {
                var _a;
                let component = (0, inlinejs_1.FindComponentById)(componentId), proxy = component === null || component === void 0 ? void 0 : component.FindElementLocalValue(contextElement, localKey, true);
                if (proxy) { //Bind data
                    proxy.bindMiddlewareData(argKey, data, contextElement);
                    (_a = component.FindElementScope(contextElement)) === null || _a === void 0 ? void 0 : _a.AddUninitCallback(() => {
                        var _a;
                        let proxy = (_a = (0, inlinejs_1.FindComponentById)(componentId)) === null || _a === void 0 ? void 0 : _a.FindElementLocalValue(contextElement, localKey, true);
                        if (proxy) {
                            proxy.unbindMiddlewareData(contextElement);
                        }
                    });
                }
            }),
        });
    }
    let id = resolvedComponent.GenerateUniqueId('form_proxy_'), middlewares = new Array(), options = (0, inlinejs_1.ResolveOptions)({
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
        },
        list: argOptions,
        unknownCallback: ({ option }) => {
            if (FormMiddlewares.hasOwnProperty(option = option.split('-').join('.'))) {
                middlewares.push(FormMiddlewares[option]);
            }
        },
    });
    let form = null, getAction, getMethod, appendFields = (url, fields) => {
        let query = fields.reduce((prev, [key, value]) => (prev ? `${prev}&${key}=${value}` : `${key}=${value}`), '');
        return (query ? (url.includes('?') ? `${url}&${query}` : `${url}?${query}`) : url);
    };
    let computeMethod = () => {
        let method = getMethod();
        if (FormMethodVerbs.includes(method)) {
            fields['_method'] = method;
            method = 'post';
        }
        return method;
    };
    let buildUrl, eventName, eventHandler = null, fields = {};
    if (contextElement instanceof HTMLFormElement) {
        getAction = () => contextElement.action;
        getMethod = () => (contextElement.method || 'get').toLowerCase();
        form = contextElement;
        eventName = 'submit';
        let method = getMethod();
        if (method !== 'get' && method !== 'head') {
            buildUrl = (info) => {
                info.body = new FormData(contextElement);
                return getAction();
            };
        }
        else { //Get | Head
            buildUrl = () => appendFields(getAction(), Array.from((new FormData(contextElement)).entries()).map(([key, value]) => [key, value.toString()]));
        }
    }
    else if (contextElement instanceof HTMLInputElement || contextElement instanceof HTMLTextAreaElement || contextElement instanceof HTMLSelectElement) {
        getAction = () => (contextElement.getAttribute('data-action') || '');
        getMethod = () => (contextElement.getAttribute('data-method') || 'get').toLowerCase();
        if (!(contextElement instanceof HTMLSelectElement)) {
            eventName = 'keydown';
            eventHandler = e => (!e || e.key.toLowerCase() === 'enter');
        }
        else { //Select
            eventName = 'change';
        }
        buildUrl = () => (fields[contextElement.getAttribute('name') || 'value'] = contextElement.value);
    }
    else { //Unknown
        let isAnchor = (contextElement instanceof HTMLAnchorElement);
        getAction = () => (isAnchor ? contextElement.href : (contextElement.getAttribute('data-action') || ''));
        getMethod = () => (contextElement.getAttribute('data-method') || 'get').toLowerCase();
        eventName = 'click';
        buildUrl = getAction;
    }
    let middlewareData = {}, state = {
        active: false,
        submitted: false,
        errors: {},
    };
    let updateState = (key, value) => {
        var _a;
        if (state[key] !== value) {
            state[key] = value;
            (0, inlinejs_1.AddChanges)('set', `${id}.${key}`, key, (_a = (0, inlinejs_1.FindComponentById)(componentId)) === null || _a === void 0 ? void 0 : _a.GetBackend().changes);
        }
    };
    let resolveMiddlewareData = (key) => (middlewareData.hasOwnProperty(key) ? middlewareData[key].data : undefined);
    let runMiddlewares = (callback) => __awaiter(void 0, void 0, void 0, function* () {
        for (let middleware of middlewares) {
            try {
                if ((yield middleware.Handle(resolveMiddlewareData(middleware.GetKey()), componentId, contextElement)) === false) {
                    return; //Rejected
                }
            }
            catch (_d) { }
        }
        if (callback) {
            callback();
        }
    });
    let evaluate = (0, inlinejs_1.EvaluateLater)({ componentId, contextElement, expression }), doEvaluation = (ok, data) => {
        evaluate(undefined, undefined, {
            response: { ok, data },
        });
    };
    let afterHandledEvent = (ok, data) => {
        var _a;
        if (ok) {
            contextElement.dispatchEvent(new CustomEvent(`${names_1.FormDirectiveName}.success`, {
                detail: { data },
            }));
        }
        else {
            contextElement.dispatchEvent(new CustomEvent(`${names_1.FormDirectiveName}.error`, {
                detail: { data },
            }));
        }
        if ((!options.success && !options.error) || (options.success && ok) || (options.error && !ok)) {
            if (options.nexttick) {
                (_a = (0, inlinejs_1.FindComponentById)(componentId)) === null || _a === void 0 ? void 0 : _a.GetBackend().changes.AddNextTickHandler(() => doEvaluation(ok, data));
            }
            else {
                doEvaluation(ok, data);
            }
        }
    };
    let fieldExpressions = new Array(), evaluateFieldExpressions = (callback) => {
        const filtered = fieldExpressions.filter(info => (info.source === contextElement || contextElement.contains(info.source))), complete = () => {
            const promises = new Array(), promiseKeys = new Array();
            Object.entries(fields).forEach(([key, value]) => {
                if (value instanceof Promise) {
                    promises.push(value);
                    promiseKeys.push(key);
                }
            });
            if (promises.length > 0) { //Wait for promises
                Promise.all(promises).then((values) => {
                    values.forEach((value, index) => (fields[promiseKeys[index]] = value));
                    callback();
                }).catch((err) => {
                    (0, inlinejs_1.JournalError)(err, `InlineJS.${names_1.FormDirectiveName}.HandleEvent`, contextElement);
                    callback();
                });
            }
            else { //No promises
                callback();
            }
        };
        filtered.forEach((info, index) => {
            (0, inlinejs_1.EvaluateLater)({ componentId, contextElement: info.source, expression: info.value })((value) => {
                (0, inlinejs_1.IsObject)(value) && (fields = Object.assign(Object.assign({}, fields), value));
                (index >= (filtered.length - 1)) && complete();
            });
        });
    };
    let handleEvent = (e) => {
        if (state.active || (eventHandler && !eventHandler(e))) {
            return;
        }
        let event = new CustomEvent(`${names_1.FormDirectiveName}.submitting`, { cancelable: true });
        contextElement.dispatchEvent(event);
        if (event.defaultPrevented) {
            return;
        }
        updateState('active', true);
        updateState('submitted', true);
        evaluateFieldExpressions(() => {
            var _a, _b, _c;
            const info = {
                method: computeMethod(),
                credentials: 'same-origin',
            };
            const url = buildUrl(info);
            if (info.method === 'post') { //Append applicable fields
                (info.body = (info.body || new FormData));
                if (FormTokenName in globalThis) {
                    info.body.append('_token', globalThis[FormTokenName]);
                }
                Object.entries(fields).forEach(([key, value]) => info.body.append(key, value));
            }
            else { //Get | Head
                appendFields(url, Object.entries(fields));
            }
            let handleData = (data) => {
                let response;
                try {
                    response = JSON.parse(data);
                }
                catch (_a) {
                    response = null;
                }
                updateState('active', false);
                updateState('errors', {});
                contextElement.dispatchEvent(new CustomEvent(`${names_1.FormDirectiveName}.submit`, {
                    detail: { response: response },
                }));
                if (!response || !(0, inlinejs_1.IsObject)(response)) {
                    return afterHandledEvent(true, response);
                }
                (0, inlinejs_1.JournalTry)(() => {
                    var _a, _b;
                    if (response.hasOwnProperty('failed')) {
                        let failed = response['failed'];
                        Object.entries((0, inlinejs_1.IsObject)(failed) ? failed : {}).forEach(([key, value]) => {
                            var _a;
                            state.errors[key] = value;
                            if (form && !options.novalidate) { //Set validation error
                                let item = form.elements.namedItem(key);
                                let local = (item && ((_a = (0, inlinejs_1.FindComponentById)(componentId)) === null || _a === void 0 ? void 0 : _a.FindElementLocalValue(item, `\$${names_1.StateDirectiveName}`, true)));
                                if (local && !(0, inlinejs_1.GetGlobal)().IsNothing(local)) {
                                    local['setMessage'](Array.isArray(value) ? value.map(v => (0, inlinejs_1.ToString)(v)).join('\n') : (0, inlinejs_1.ToString)(value));
                                }
                            }
                        });
                    }
                    if (!options.silent && (response.hasOwnProperty('alert') || response.hasOwnProperty('report'))) {
                        (_a = (0, inlinejs_1.GetGlobal)().GetConcept('alert')) === null || _a === void 0 ? void 0 : _a.Notify(response['alert'] || response['report']);
                    }
                    afterHandledEvent((response['ok'] !== false), response['data']);
                    if (response['ok'] === false) {
                        return;
                    }
                    let router = (0, inlinejs_1.GetGlobal)().GetConcept('router'), after = null;
                    if (response.hasOwnProperty('redirect')) {
                        let redirect = response['redirect'];
                        if ((0, inlinejs_1.IsObject)(redirect)) {
                            after = () => {
                                if (!options.refresh && !redirect['refresh'] && router) {
                                    router.Goto(redirect['page'], (options.reload || redirect['reload']), (response.hasOwnProperty('data') ? redirect['data'] : undefined));
                                }
                                else {
                                    window.location.href = redirect['page'];
                                }
                            };
                        }
                        else if (typeof redirect === 'string') {
                            after = () => {
                                if (!options.refresh && router) {
                                    router.Goto(redirect, options.reload);
                                }
                                else {
                                    window.location.href = redirect;
                                }
                            };
                        }
                    }
                    else if (options.refresh) {
                        after = () => window.location.reload();
                    }
                    else if (options.reload) {
                        after = () => (router ? router.Reload() : window.location.reload());
                    }
                    else if (options.reset && form) {
                        form.reset();
                        (_b = (0, inlinejs_1.FindComponentById)(componentId)) === null || _b === void 0 ? void 0 : _b.GetBackend().changes.AddNextTickHandler(() => form === null || form === void 0 ? void 0 : form.dispatchEvent(new CustomEvent(`${names_1.FormDirectiveName}.reset`)));
                    }
                    after && after();
                }, `InlineJS.${names_1.FormDirectiveName}.HandleEvent`, contextElement);
            };
            if (options.upload || options.download || options.duplex) {
                const doWhile = (progress) => {
                    if (typeof progress === 'number') {
                        contextElement.dispatchEvent(new CustomEvent(`${names_1.FormDirectiveName}.progress`, {
                            detail: { progress },
                        }));
                    }
                    else if (typeof progress !== 'string') {
                        contextElement.dispatchEvent(new CustomEvent(`${names_1.FormDirectiveName}.progress`, {
                            detail: { progress: Object.assign({}, progress) },
                        }));
                    }
                };
                const doFinal = (res) => ((typeof res === 'string') && handleData(res));
                if (options.upload) {
                    doWhile(0);
                    (_a = (0, inlinejs_1.GetGlobal)().GetConcept(names_1.ServerConceptName)) === null || _a === void 0 ? void 0 : _a.Upload(url, info.body, info.method).While(doWhile).Final(doFinal);
                }
                else if (options.download) {
                    doWhile(0);
                    (_b = (0, inlinejs_1.GetGlobal)().GetConcept(names_1.ServerConceptName)) === null || _b === void 0 ? void 0 : _b.Download(url, info.body, info.method).While(doWhile).Final(doFinal);
                }
                else {
                    doWhile({ isUpload: true, value: 0 });
                    (_c = (0, inlinejs_1.GetGlobal)().GetConcept(names_1.ServerConceptName)) === null || _c === void 0 ? void 0 : _c.Duplex(url, info.body, info.method).While(doWhile).Final(doFinal);
                }
            }
            else {
                (0, inlinejs_1.GetGlobal)().GetFetchConcept().Get(url, info).then(res => res.text()).then(handleData).catch((err) => {
                    updateState('active', false);
                    (0, inlinejs_1.JournalError)(err, `InlineJS.${names_1.FormDirectiveName}.HandleEvent`, contextElement);
                });
            }
        });
    };
    (_b = resolvedComponent.FindElementScope(contextElement)) === null || _b === void 0 ? void 0 : _b.SetLocal(localKey, (0, inlinejs_1.CreateInplaceProxy)((0, inlinejs_1.BuildGetterProxyOptions)({
        getter: (prop) => {
            var _a;
            if (prop && state.hasOwnProperty(prop)) {
                (_a = (0, inlinejs_1.FindComponentById)(componentId)) === null || _a === void 0 ? void 0 : _a.GetBackend().changes.AddGetAccess(`${id}.${prop}`);
                return state[prop];
            }
            if (prop === 'element') {
                return contextElement;
            }
            if (prop === 'submit') {
                return (shouldRunMiddlewares = true) => {
                    if (shouldRunMiddlewares) {
                        runMiddlewares(handleEvent);
                    }
                    else { //Skip middlewares
                        handleEvent();
                    }
                };
            }
            if (prop === 'reset') {
                return () => form === null || form === void 0 ? void 0 : form.reset();
            }
            if (prop === 'bindMiddlewareData') {
                return (middleware, data, source) => {
                    middlewareData[middleware] = { data, source };
                };
            }
            if (prop === 'unbindMiddlewareData') {
                return (target) => {
                    if (typeof target !== 'string') {
                        Object.entries(middlewareData).forEach(([key, value]) => {
                            if (value.source === target) {
                                delete middlewareData[key];
                            }
                        });
                    }
                    else { //Unbind single
                        delete middlewareData[target];
                    }
                };
            }
            if (prop === 'addField') {
                return (name, value) => (fields[name] = value);
            }
            if (prop === 'removeField') {
                return (name) => (delete fields[name]);
            }
        },
        lookup: [...Object.keys(state), 'element', 'submit', 'reset', 'bindMiddlewareData', 'unbindMiddlewareData', 'addField', 'removeField'],
    })));
    (_c = resolvedComponent.FindElementScope(contextElement)) === null || _c === void 0 ? void 0 : _c.SetLocal(secretKey, (0, inlinejs_1.CreateInplaceProxy)((0, inlinejs_1.BuildGetterProxyOptions)({
        getter: (prop) => {
            if (prop === 'setFieldExpression') {
                return (expression, source) => fieldExpressions.push({ value: expression, source });
            }
            if (prop === 'removeFieldExpression') {
                return (source) => (fieldExpressions = fieldExpressions.filter(info => (info.source !== source)));
            }
        },
        lookup: ['setFieldExpression', 'removeFieldExpression'],
    })));
    let onEvent = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!state.active) {
            runMiddlewares(handleEvent);
        }
    };
    contextElement.addEventListener(eventName, onEvent);
});
function FormDirectiveHandlerCompact() {
    (0, inlinejs_1.AddDirectiveHandler)(exports.FormDirectiveHandler);
}
exports.FormDirectiveHandlerCompact = FormDirectiveHandlerCompact;
function AddFormMiddleware(middleware) {
    FormMiddlewares[middleware.GetKey()] = middleware;
}
exports.AddFormMiddleware = AddFormMiddleware;
function RemoveFormMiddleware(name) {
    if (FormMiddlewares.hasOwnProperty(name)) {
        delete FormMiddlewares[name];
    }
}
exports.RemoveFormMiddleware = RemoveFormMiddleware;
