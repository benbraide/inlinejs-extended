"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FetchConcept = void 0;
const inlinejs_1 = require("@benbraide/inlinejs");
class FetchConcept extends inlinejs_1.NativeFetchConcept {
    constructor(origin_ = '') {
        super();
        this.origin_ = origin_;
        this.handlers_ = new Array();
        this.origin_ = (0, inlinejs_1.TidyPath)(this.origin_ || window.location.origin);
    }
    Get(input, init) {
        let handler = this.FindPathHandler_((typeof input === 'string') ? input : input.url);
        return ((handler && handler({ input, init })) || super.Get(input, init));
    }
    AddPathHandler(path, handler) {
        this.handlers_.push({ path: ((typeof path === 'string') ? (0, inlinejs_1.PathToRelative)(path, this.origin_) : path), handler });
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
                else if ((0, inlinejs_1.IsObject)(response)) {
                    resolve(new Response(JSON.stringify(response), {
                        headers: { 'Content-Type': 'application/json' }
                    }));
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
        path = (0, inlinejs_1.PathToRelative)(path, this.origin_);
        let info = this.handlers_.find(info => ((typeof info.path === 'string') ? (info.path === path) : info.path.test(path)));
        return (info ? info.handler : null);
    }
}
exports.FetchConcept = FetchConcept;
