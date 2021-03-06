import { GetGlobal, JournalTry, IResourceConcept, IResourceGetParams, IResourceOptions, PathToRelative, TidyPath } from "@benbraide/inlinejs";

interface IResourceInfo{
    callbacks: Array<() => void> | null;
    data: any;
}

export class ResourceConcept implements IResourceConcept{
    private loadMap_: Record<string, IResourceInfo> = {};

    public constructor(private origin_ = ''){
        this.origin_ = TidyPath(this.origin_ || window.location.origin);
    }
    
    public Get({ items, concurrent, attributes }: IResourceGetParams){
        return this.Get_((Array.isArray(items) ? items : [items]).map((item) => {
            if (typeof item === 'string'){
                if (item.endsWith('.css')){
                    return ResourceConcept.BuildOptions('link', item, attributes);
                }

                if (item.endsWith('.js')){
                    return ResourceConcept.BuildOptions('script', item, attributes);
                }

                return ResourceConcept.BuildOptions('data', item, attributes);
            }

            return ResourceConcept.BuildOptions(item.type, item.path, attributes);
        }), !!concurrent);
    }

    public GetStyle(path: string | Array<string>, concurrent?: boolean, attributes?: Record<string, string>){
        return this.Get_((Array.isArray(path) ? path : [path]).map(item => ResourceConcept.BuildOptions('link', item, attributes)), !!concurrent);
    }

    public GetScript(path: string | Array<string>, concurrent?: boolean, attributes?: Record<string, string>){
        return this.Get_((Array.isArray(path) ? path : [path]).map(item => ResourceConcept.BuildOptions('script', item, attributes)), !!concurrent);
    }

    public GetData(path: string | Array<string>, concurrent?: boolean, json?: boolean){
        return this.Get_((Array.isArray(path) ? path : [path]).map(item => ResourceConcept.BuildOptions('data', item, undefined, json)), !!concurrent);
    }

    private Get_(info: IResourceOptions | Array<IResourceOptions>, concurrent: boolean){
        return new Promise<any>((resolve, reject) => {
            let getOne = (info: IResourceOptions) => {
                if (info.type === 'link'){
                    info.additionalAttributes = (info.additionalAttributes || {});
                    info.additionalAttributes['rel'] = 'stylesheet';
                }
                
                let path = PathToRelative(info.path, this.origin_);
                if (!path){
                    return null;
                }
    
                if (this.loadMap_.hasOwnProperty(path)){
                    return new Promise<any>((resolve) => {
                        if (this.loadMap_[path]?.callbacks){//Still loading
                            this.loadMap_[path].callbacks?.push(() => resolve(this.loadMap_[path].data));
                        }
                        else{//Loaded
                            resolve(this.loadMap_[path].data);
                        }
                    });
                }
    
                this.loadMap_[path] = {
                    callbacks: new Array<() => void>(),
                    data: null,
                };
                
                let setData = (data: any) => {
                    this.loadMap_[path].data = data;
                    this.loadMap_[path].callbacks?.forEach (callback => JournalTry(callback, 'InlineJS.ResourceConcept.SetData'));
                    this.loadMap_[path].callbacks = null;
                };
                
                return new Promise<any>((resolve, reject) => {
                    if (info.type === 'data'){
                        GetGlobal().GetFetchConcept().Get(path, {
                            method: 'GET',
                            credentials: 'same-origin',
                        }).then(response => ((info.attribute === 'json') ? response.json() : response.text())).then((response) => {
                            resolve(response);
                            setData(response);
                        }).catch(reject);
                    }
                    else{//DOM resource
                        let resource = document.createElement(info.type);
                        resource.addEventListener('load', () => {
                            resolve(true);
                            setData(false);
                        });
    
                        Object.entries(info.additionalAttributes || {}).forEach(([key, value]) => resource.setAttribute(key, value));
                        resource.setAttribute(info.attribute, path);
                        
                        ((info.target && document.querySelector(info.target)) || document.body).append(resource);
                    }
                });
            };
    
            let getAll = async (info: Array<IResourceOptions>) => {
                try{
                    let values = new Array<any>();
                    for (let entry of info){
                        let p = getOne(entry);
                        if (p){//Valid
                            values.push(await p);
                        }
                    }

                    resolve(values);
                }
                catch (err){
                    reject(err);
                }
            };
            
            if (!Array.isArray(info)){
                getOne(info)?.then(resolve).catch(reject);
            }
            else if (concurrent){//Load resources side by side
                Promise.all(info.map(entry => getOne(entry)).filter(p => !!p)).then(resolve).catch(reject);
            }
            else{//Load resources one by one
                getAll(info);
            }
        });
    }

    public static BuildOptions(type: 'link' | 'script' | 'data', path: string, attributes?: Record<string, string>, json?: boolean): IResourceOptions{
        return {
            type: type,
            attribute: ((type === 'data') ? (json ? 'json' : 'text') : ((type === 'link') ? 'href' : 'src')),
            target: ((type === 'data') ? null : ((type === 'link') ? 'head' : 'body')),
            path: path,
            additionalAttributes: attributes,
        };
    }
}
