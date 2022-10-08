import { Loop } from "@benbraide/inlinejs";
export declare type IServerProgressHandler = (e: ProgressEvent<XMLHttpRequestEventTarget>) => void;
export interface IServerProgressHandlers {
    download?: IServerProgressHandler;
    upload?: IServerProgressHandler;
}
export interface IServerProgressInfo {
    isUpload: boolean;
    value: number;
}
export declare class ServerConcept {
    Upload(url: string, init?: XMLHttpRequestBodyInit, method?: string): Loop<number | string>;
    Download(url: string, init?: XMLHttpRequestBodyInit, method?: string): Loop<number | string>;
    Duplex(url: string, init?: XMLHttpRequestBodyInit, method?: string): Loop<IServerProgressInfo | string>;
    protected Get_(url: string, method: string, handler: (response: string) => void, errorHandler: (text: string, code: number) => void, init?: XMLHttpRequestBodyInit, progressHandlers?: IServerProgressHandlers): void;
}
