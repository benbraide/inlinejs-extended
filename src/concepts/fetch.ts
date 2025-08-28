import { FetchPathHandlerType, IExtendedFetchConcept, IFetchMockResponseParams, NativeFetchConcept, TidyPath, PathToRelative, IsObject } from "@benbraide/inlinejs";

interface IFetchPathHandlerInfo{
    path: string | RegExp;
    handler: FetchPathHandlerType;
}

export class FetchConcept extends NativeFetchConcept implements IExtendedFetchConcept{
    private handlers_ = new Array<IFetchPathHandlerInfo>();

    public constructor(private origin_ = ''){
        super();
        this.origin_ = TidyPath(this.origin_ || window.location.origin);
    }
    
    public Get(input: RequestInfo, init?: RequestInit){
        let handler = this.FindPathHandler_((typeof input === 'string') ? input : input.url);
        return ((handler && handler({ input, init })) || super.Get(input, init));
    }

    public AddPathHandler(path: string | RegExp, handler: FetchPathHandlerType){
        this.handlers_.push({ path: ((typeof path === 'string') ? PathToRelative(path, this.origin_) : path), handler });
    }

    public RemovePathHandler(handler: FetchPathHandlerType){
        this.handlers_ = this.handlers_.filter(info => (info.handler !== handler));
    }

    public MockResponse({ response, delay, errorText }: IFetchMockResponseParams): Promise<Response>{
        return new Promise<Response>((resolve, reject) => {
            let decide = () => {
                let err = (errorText && ((typeof errorText === 'string') ? errorText : errorText()));
                if (err){
                    reject(err);
                }
                else if (IsObject(response)) {
                    resolve(new Response(JSON.stringify(response), {
                        headers: { 'Content-Type': 'application/json' }
                    }));
                }
                else {
                    resolve(new Response(response));
                }
            };
            
            if (typeof delay === 'number' && delay > 0){
                setTimeout(decide, delay);
            }
            else{//No delay
                decide();
            }
        });
    }

    private FindPathHandler_(path: string){
        path = PathToRelative(path, this.origin_);
        let info = this.handlers_.find(info => ((typeof info.path === 'string') ? (info.path === path) : info.path.test(path)));
        return (info ? info.handler : null);
    }
}
