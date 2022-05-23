import { NativeFetchConcept, TidyPath, PathToRelative } from "@benbraide/inlinejs";
export class FetchConcept extends NativeFetchConcept {
    constructor(origin_ = '') {
        super();
        this.origin_ = origin_;
        this.handlers_ = new Array();
        this.origin_ = TidyPath(this.origin_ || window.location.origin);
    }
    Get(input, init) {
        let handler = this.FindPathHandler_((typeof input === 'string') ? input : input.url);
        return ((handler && handler({ input, init })) || super.Get(input, init));
    }
    AddPathHandler(path, handler) {
        this.handlers_.push({ path: ((typeof path === 'string') ? PathToRelative(path, this.origin_) : path), handler });
    }
    RemovePathHandler(handler) {
        this.handlers_ = this.handlers_.filter(info => (info.handler !== handler));
    }
    MockResponse({ response, delay, errorText }) {
        return new Promise((resolve, reject) => {
            let decide = () => {
                let err = (errorText && ((typeof errorText === 'string') ? errorText : errorText()));
                if (err) {
                    reject(err);
                }
                else {
                    resolve(new Response(response));
                }
            };
            if (typeof delay === 'number' && delay > 0) {
                setTimeout(decide, delay);
            }
            else { //No delay
                decide();
            }
        });
    }
    FindPathHandler_(path) {
        path = PathToRelative(path, this.origin_);
        let info = this.handlers_.find(info => ((typeof info.path === 'string') ? (info.path === path) : info.path.test(path)));
        return (info ? info.handler : null);
    }
}
