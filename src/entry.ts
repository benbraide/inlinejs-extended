import { WaitForGlobal, GetGlobal } from '@benbraide/inlinejs';

import { FetchConceptName, ResourceConceptName, ServerConceptName } from './names';

import { FetchConcept } from './concepts/fetch';
import { ResourceConcept } from './concepts/resource';
import { ServerConcept } from './concepts/server';

import { AttrDirectiveHandlerCompact } from './directive/attr';
import { IntersectionDirectiveHandlerCompact } from './directive/intersection';
import { TickDirectiveHandlerCompact } from './directive/tick';
import { FormDirectiveHandlerCompact } from './directive/form';
import { StateDirectiveHandlerCompact } from './directive/state';
import { OverlayDirectiveHandlerCompact } from './directive/overlay';
import { MouseDirectiveHandlerCompact } from './directive/mouse';
import { KeyboardDirectiveHandlerCompact } from './directive/keyboard';

import { FormatMagicHandlerCompact } from './magic/format';
import { FetchMagicHandlerCompact } from './magic/fetch';
import { GetMagicHandlerCompact } from './magic/get';
import { ResourceMagicHandlerCompact } from './magic/resource';
import { ServerMagicHandlerCompact } from './magic/server';
import { WaitMagicHandlerCompact } from './magic/wait';
import { OverlayMagicHandlerCompact } from './magic/overlay';

export function InlineJSExtended(){
    WaitForGlobal().then(() => {
        GetGlobal().SetConcept(FetchConceptName, new FetchConcept());
        GetGlobal().SetConcept(ResourceConceptName, new ResourceConcept());
        GetGlobal().SetConcept(ServerConceptName, new ServerConcept());
        
        AttrDirectiveHandlerCompact();
        IntersectionDirectiveHandlerCompact();
        TickDirectiveHandlerCompact();
        FormDirectiveHandlerCompact();
        StateDirectiveHandlerCompact();
        OverlayDirectiveHandlerCompact();
        MouseDirectiveHandlerCompact();
        KeyboardDirectiveHandlerCompact();
    
        FormatMagicHandlerCompact();
        FetchMagicHandlerCompact();
        GetMagicHandlerCompact();
        ResourceMagicHandlerCompact();
        ServerMagicHandlerCompact();
        WaitMagicHandlerCompact();
        OverlayMagicHandlerCompact();
    });    
}
