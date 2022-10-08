import { GetGlobal, AddMagicHandler, CreateMagicHandlerCallback, CreateReadonlyProxy } from "@benbraide/inlinejs";
function CreateServerProxy() {
    let getConcept = () => GetGlobal().GetConcept('server');
    let methods = {
        upload: (url, init, method = 'POST') => { var _a; return (_a = getConcept()) === null || _a === void 0 ? void 0 : _a.Upload(url, init, method); },
        download: (url, init, method = 'POST') => { var _a; return (_a = getConcept()) === null || _a === void 0 ? void 0 : _a.Download(url, init, method); },
        duplex: (url, init, method = 'POST') => { var _a; return (_a = getConcept()) === null || _a === void 0 ? void 0 : _a.Duplex(url, init, method); },
    };
    return CreateReadonlyProxy(methods);
}
const ServerProxy = CreateServerProxy();
export const ServerMagicHandler = CreateMagicHandlerCallback('server', () => ServerProxy);
export function ServerMagicHandlerCompact() {
    AddMagicHandler(ServerMagicHandler);
}
