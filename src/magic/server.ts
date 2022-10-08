import { GetGlobal, AddMagicHandler, CreateMagicHandlerCallback, CreateReadonlyProxy } from "@benbraide/inlinejs";

import { ServerConcept } from "../concepts/server";

function CreateServerProxy(){
    let getConcept = () => GetGlobal().GetConcept<ServerConcept>('server');
    
    let methods = {
        upload: (url: string, init?: XMLHttpRequestBodyInit, method = 'POST') => getConcept()?.Upload(url, init, method),
        download: (url: string, init?: XMLHttpRequestBodyInit, method = 'POST') => getConcept()?.Download(url, init, method),
        duplex: (url: string, init?: XMLHttpRequestBodyInit, method = 'POST') => getConcept()?.Duplex(url, init, method),
    };

    return CreateReadonlyProxy(methods);
}

const ServerProxy = CreateServerProxy();

export const ServerMagicHandler = CreateMagicHandlerCallback('server', () => ServerProxy);

export function ServerMagicHandlerCompact(){
    AddMagicHandler(ServerMagicHandler);
}
