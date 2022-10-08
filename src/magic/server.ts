import { GetGlobal, AddMagicHandler, CreateMagicHandlerCallback, CreateReadonlyProxy } from "@benbraide/inlinejs";

import { ServerConcept } from "../concepts/server";
import { ServerConceptName } from "../names";
import { ServerRequestInitType } from "../types";

function CreateServerProxy(){
    let getConcept = () => GetGlobal().GetConcept<ServerConcept>(ServerConceptName);
    
    let methods = {
        upload: (url: string, init?: ServerRequestInitType, method = 'POST') => getConcept()?.Upload(url, init, method),
        download: (url: string, init?: ServerRequestInitType, method = 'POST') => getConcept()?.Download(url, init, method),
        duplex: (url: string, init?: ServerRequestInitType, method = 'POST') => getConcept()?.Duplex(url, init, method),
    };

    return CreateReadonlyProxy(methods);
}

const ServerProxy = CreateServerProxy();

export const ServerMagicHandler = CreateMagicHandlerCallback(ServerConceptName, () => ServerProxy);

export function ServerMagicHandlerCompact(){
    AddMagicHandler(ServerMagicHandler);
}
