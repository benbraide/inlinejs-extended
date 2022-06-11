import { WaitForGlobal, GetGlobal } from '@benbraide/inlinejs';

import { ResourceConcept } from './concepts/resource';

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
import { WaitMagicHandlerCompact } from './magic/wait';
import { OverlayMagicHandlerCompact } from './magic/overlay';

WaitForGlobal().then(() => {
    GetGlobal().SetConcept('resource', new ResourceConcept());
    
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
    WaitMagicHandlerCompact();
    OverlayMagicHandlerCompact();
});
