import { WaitForGlobal, GetGlobal } from '@benbraide/inlinejs';

import { FetchConceptName, ServerConceptName } from './names';

import { FetchConcept } from './concepts/fetch';
import { ServerConcept } from './concepts/server';

import { AttrDirectiveHandlerCompact } from './directive/attr';
import { IntersectionDirectiveHandlerCompact } from './directive/intersection';
import { ResizeDirectiveHandlerCompact } from './directive/resize';
import { TickDirectiveHandlerCompact } from './directive/tick';
import { FormDirectiveHandlerCompact } from './directive/form';
import { StateDirectiveHandlerCompact } from './directive/state';
import { OverlayDirectiveHandlerCompact } from './directive/overlay';
import { MouseDirectiveHandlerCompact } from './directive/mouse';
import { KeyboardDirectiveHandlerCompact } from './directive/keyboard';

import { FormatMagicHandlerCompact } from './magic/format';
import { FetchMagicHandlerCompact } from './magic/fetch';
import { GetMagicHandlerCompact } from './magic/get-post';
import { ServerMagicHandlerCompact } from './magic/server';
import { WaitMagicHandlerCompact } from './magic/wait';
import { OverlayMagicHandlerCompact } from './magic/overlay';

export function InlineJSExtended(){
    WaitForGlobal().then(() => {
        GetGlobal().SetConcept(FetchConceptName, new FetchConcept());
        GetGlobal().SetConcept(ServerConceptName, new ServerConcept());
        
        AttrDirectiveHandlerCompact();
        IntersectionDirectiveHandlerCompact();
        ResizeDirectiveHandlerCompact();
        TickDirectiveHandlerCompact();
        FormDirectiveHandlerCompact();
        StateDirectiveHandlerCompact();
        OverlayDirectiveHandlerCompact();
        MouseDirectiveHandlerCompact();
        KeyboardDirectiveHandlerCompact();
    
        FormatMagicHandlerCompact();
        FetchMagicHandlerCompact();
        GetMagicHandlerCompact();
        ServerMagicHandlerCompact();
        WaitMagicHandlerCompact();
        OverlayMagicHandlerCompact();
    });    
}
