import { Loop } from "@benbraide/inlinejs";
export type IServerProgressHandler = (e: ProgressEvent<XMLHttpRequestEventTarget>) => void;
export interface IServerProgressHandlers {
    download?: IServerProgressHandler;
    upload?: IServerProgressHandler;
}
export interface IServerProgressInfo {
    isUpload: boolean;
    value: number;
}
export type ServerRequestInitType = XMLHttpRequestBodyInit | RequestInit | Record<string, any>;
export interface IServerConcept {
    Upload(url: string, init?: ServerRequestInitType, method?: string): Loop<number | string>;
    Download(url: string, init?: ServerRequestInitType, method?: string): Loop<number | string>;
    Duplex(url: string, init?: ServerRequestInitType, method?: string): Loop<IServerProgressInfo | string>;
}
