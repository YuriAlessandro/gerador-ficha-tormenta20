import React from 'react';
import SheetPreviewAbilities from './SheetPreviewAbilities';
import SheetPreviewBuildSteps from './SheetPreviewBuildSteps';
import SheetPreviewSkills from './SheetPreviewSkills';
import SheetPreviewStats from './SheetPreviewStats';
import SheetPreviewSpells from './SheetPreviewSpells';
import SheetPreviewTab from './SheetPreviewTab';
import SheetPreviewPowers from './SheetPreviewPowers';
import SheetPreviewInventory from './SheetPreviewInventory';

const SheetPreview = () => (
  <div className='flex flex-col md:flex-row justify-center py-2'>
    <SheetPreviewTab>
      <SheetPreviewStats />
    </SheetPreviewTab>
    <SheetPreviewTab>
      <SheetPreviewSkills />
    </SheetPreviewTab>
    <SheetPreviewTab>
      <SheetPreviewAbilities />
    </SheetPreviewTab>
    <SheetPreviewTab>
      <SheetPreviewPowers />
    </SheetPreviewTab>
    <SheetPreviewTab>
      <SheetPreviewSpells />
    </SheetPreviewTab>
    <SheetPreviewTab>
      <SheetPreviewInventory />
    </SheetPreviewTab>
    <SheetPreviewTab>
      <SheetPreviewBuildSteps />
    </SheetPreviewTab>
  </div>
);

export default SheetPreview;
