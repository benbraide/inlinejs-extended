import { IsObject, Loop } from "@benbraide/inlinejs";
export class ServerConcept {
    Upload(url, init, method = 'POST') {
        return new Loop((doWhile, doFinal, doAbort) => {
            this.Get_(url, method, response => doFinal(response), doAbort, init, {
                upload: progress => doWhile(progress.lengthComputable ? (progress.loaded / progress.total) : 0),
            });
        });
    }
    Download(url, init, method = 'POST') {
        return new Loop((doWhile, doFinal, doAbort) => {
            this.Get_(url, method, response => doFinal(response), doAbort, init, {
                download: progress => doWhile(progress.lengthComputable ? (progress.loaded / progress.total) : 0),
            });
        });
    }
    Duplex(url, init, method = 'POST') {
        return new Loop((doWhile, doFinal, doAbort) => {
            this.Get_(url, method, response => doFinal(response), doAbort, init, {
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
    Get_(url, method, handler, errorHandler, init, progressHandlers) {
        let request = new XMLHttpRequest(), clean = () => {
            request.removeEventListener('load', onLoad);
            request.removeEventListener('error', onError);
            ((progressHandlers === null || progressHandlers === void 0 ? void 0 : progressHandlers.download) && request.removeEventListener('progress', progressHandlers.download));
            (request.upload && (progressHandlers === null || progressHandlers === void 0 ? void 0 : progressHandlers.upload) && request.upload.removeEventListener('progress', progressHandlers.upload));
            (request.upload && (progressHandlers === null || progressHandlers === void 0 ? void 0 : progressHandlers.upload) && request.upload.removeEventListener('load', progressHandlers.upload));
        };
        let onLoad = (e) => {
            ((progressHandlers === null || progressHandlers === void 0 ? void 0 : progressHandlers.download) && progressHandlers.download(e));
            handler(request.responseText);
            clean();
        };
        let onError = (e) => {
            errorHandler(request.statusText, request.status);
            clean();
        };
        request.addEventListener('load', onLoad);
        request.addEventListener('error', onError);
        ((progressHandlers === null || progressHandlers === void 0 ? void 0 : progressHandlers.download) && request.addEventListener('progress', progressHandlers.download));
        (request.upload && (progressHandlers === null || progressHandlers === void 0 ? void 0 : progressHandlers.upload) && request.upload.addEventListener('progress', progressHandlers.upload));
        (request.upload && (progressHandlers === null || progressHandlers === void 0 ? void 0 : progressHandlers.upload) && request.upload.addEventListener('load', progressHandlers.upload));
        request.open(method, url, true);
        request.send(init && ServerConcept.TransformRequestInit(init));
    }
    static TransformRequestInit(init) {
        if (!IsObject(init)) {
            return init;
        }
        let formData = new FormData();
        Object.entries(init).forEach(([key, value]) => formData.append(key, value));
        return formData;
    }
}
