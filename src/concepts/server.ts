import { Loop } from "@benbraide/inlinejs";

export type IServerProgressHandler = (e: ProgressEvent<XMLHttpRequestEventTarget>) => void;

export interface IServerProgressHandlers{
    download?: IServerProgressHandler;
    upload?: IServerProgressHandler;
}

export interface IServerProgressInfo{
    isUpload: boolean;
    value: number;
}

export class ServerConcept{
    public Upload(url: string, init?: XMLHttpRequestBodyInit, method = 'POST'): Loop<number | string>{
        return new Loop((doWhile, doFinal, doAbort) => {
            this.Get_(url, method, response => doFinal(response), doAbort, <XMLHttpRequestBodyInit>init, {
                upload: progress => doWhile(progress.lengthComputable ? (progress.loaded / progress.total) : 0),
            });
        });
    }

    public Download(url: string, init?: XMLHttpRequestBodyInit, method = 'POST'): Loop<number | string>{
        return new Loop((doWhile, doFinal, doAbort) => {
            this.Get_(url, method, response => doFinal(response), doAbort, <XMLHttpRequestBodyInit>init, {
                download: progress => doWhile(progress.lengthComputable ? (progress.loaded / progress.total) : 0),
            });
        });
    }

    public Duplex(url: string, init?: XMLHttpRequestBodyInit, method = 'POST'): Loop<IServerProgressInfo | string>{
        return new Loop((doWhile, doFinal, doAbort) => {
            this.Get_(url, method, response => doFinal(response), doAbort, <XMLHttpRequestBodyInit>init, {
                download: progress => doWhile({
                    isUpload: false,
                    value: (progress.lengthComputable ? (progress.loaded / progress.total) : 0),
                }),
                upload: progress => doWhile({
                    isUpload: true,
                    value: (progress.lengthComputable ? (progress.loaded / progress.total) : 0),
                }),
            });
        });
    }

    protected Get_(url: string, method: string, handler: (response: string) => void, errorHandler: (text: string, code: number) => void, init?: XMLHttpRequestBodyInit, progressHandlers?: IServerProgressHandlers){
        let request = new XMLHttpRequest(), clean = () => {
            request.removeEventListener('load', onLoad);
            request.removeEventListener('error', onError);

            (progressHandlers?.download && request.removeEventListener('progress', progressHandlers.download));
            (request.upload && progressHandlers?.upload && request.upload.removeEventListener('progress', progressHandlers.upload));
            (request.upload && progressHandlers?.upload && request.upload.removeEventListener('load', progressHandlers.upload));
        };

        let onLoad = (e: ProgressEvent<XMLHttpRequestEventTarget>) => {
            (progressHandlers?.download && progressHandlers.download(e));
            
            handler(request.responseText);
            clean();
        };

        let onError = (e: ProgressEvent<XMLHttpRequestEventTarget>) => {
            errorHandler(request.statusText, request.status);
            clean();
        };

        request.addEventListener('load', onLoad);
        request.addEventListener('error', onError);

        (progressHandlers?.download && request.addEventListener('progress', progressHandlers.download));

        (request.upload && progressHandlers?.upload && request.upload.addEventListener('progress', progressHandlers.upload));
        (request.upload && progressHandlers?.upload && request.upload.addEventListener('load', progressHandlers.upload));
        
        request.open(method, url, true);
        request.send(init);
    }
}
