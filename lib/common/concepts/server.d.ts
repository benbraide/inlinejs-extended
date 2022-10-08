import { Loop } from "@benbraide/inlinejs";
import { IServerConcept, IServerProgressHandlers, IServerProgressInfo, ServerRequestInitType } from "../types";
export declare class ServerConcept implements IServerConcept {
    Upload(url: string, init?: ServerRequestInitType, method?: string): Loop<number | string>;
    Download(url: string, init?: ServerRequestInitType, method?: string): Loop<number | string>;
    Duplex(url: string, init?: ServerRequestInitType, method?: string): Loop<IServerProgressInfo | string>;
    protected Get_(url: string, method: string, handler: (response: string) => void, errorHandler: (text: string, code: number) => void, init?: ServerRequestInitType, progressHandlers?: IServerProgressHandlers): void;
    static TransformRequestInit(init: ServerRequestInitType): XMLHttpRequestBodyInit;
}
