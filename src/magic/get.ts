import { FindComponentById, GetGlobal, AddMagicHandler, CreateMagicHandlerCallback, IComponent } from "@benbraide/inlinejs";

interface IFetchCheckpointDetails{
    contextElement: HTMLElement,
    checkpoint: number;
}

let FectCheckpoints = new Array<IFetchCheckpointDetails>();

function GetFetchCheckpoint(contextElement: HTMLElement){
    let found = FectCheckpoints.find(details => (details.contextElement === contextElement));
    return (found ? found.checkpoint : -1);
}

function ComputeNextFetchCheckpoint(component: IComponent | null, contextElement: HTMLElement){
    let found = FectCheckpoints.find(details => (details.contextElement === contextElement));
    if (found){
        return ++found.checkpoint;
    }

    let checkpoint = 0;
    FectCheckpoints.push({ contextElement, checkpoint });
    component?.FindElementScope(contextElement)?.AddUninitCallback(() => {//Remove entry
        FectCheckpoints.splice(FectCheckpoints.findIndex(details => (details.contextElement === contextElement)), 1);
    });

    return checkpoint;
}

export const GetMagicHandler = CreateMagicHandlerCallback('get', ({ componentId, component, contextElement }) => {
    let checkpoint = ComputeNextFetchCheckpoint((component || FindComponentById(componentId)), contextElement);
    return (path: string | null, json?: boolean) => {
        if (checkpoint != GetFetchCheckpoint(contextElement)){
            return Promise.reject();
        }

        if (path === null){//No request
            return null;
        }

        return new Promise((resolve, reject) => {
            GetGlobal().GetFetchConcept().Get(path, {
                method: 'GET',
                credentials: 'same-origin',
            }).then(response => response.text()).then((response) => {
                if (checkpoint != GetFetchCheckpoint(contextElement)){
                    return;
                }
                
                if (json){
                    try{
                        resolve(JSON.parse(response));
                    }
                    catch{
                        resolve({});
                    }
                }
                else{
                    resolve(response);
                }
            }).catch(reject);
        });
    };
});

export function GetMagicHandlerCompact(){
    AddMagicHandler(GetMagicHandler);
}
