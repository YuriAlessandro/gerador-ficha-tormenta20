import React from 'react';
import { TabContext, TabPanel } from '@material-ui/lab';
import { Tabs, Tab } from '@mui/material';
import SheetPreviewAbilities from './SheetPreviewAbilities';
import SheetPreviewBuildSteps from './SheetPreviewBuildSteps';
import SheetPreviewSkills from './SheetPreviewSkills';
import SheetPreviewStats from './SheetPreviewStats';
import SheetPreviewSpells from './SheetPreviewSpells';
import SheetPreviewTab from './SheetPreviewTab';
import SheetPreviewPowers from './SheetPreviewPowers';
import SheetPreviewInventory from './SheetPreviewInventory';

const SheetPreview = () => {
  const [tab, setTab] = React.useState('1');

  const onChangeTab = (index: string) => {
    setTab(index);
  };

  return (
    <TabContext value={tab}>
      <div className='flex flex-col justify-center items-center py-2'>
        <Tabs className='flex-1'>
          <Tab onClick={() => onChangeTab('1')} label='Básico' />
          <Tab onClick={() => onChangeTab('2')} label='Perícias' />
          <Tab onClick={() => onChangeTab('3')} label='Habilidades' />
          <Tab onClick={() => onChangeTab('4')} label='Poderes' />
          <Tab onClick={() => onChangeTab('5')} label='Magias' />
          <Tab onClick={() => onChangeTab('6')} label='Inventário' />
          <Tab onClick={() => onChangeTab('7')} label='Passo a passo' />
        </Tabs>
        <div className='container mx-auto'>
          <TabPanel value='1'>
            <SheetPreviewTab>
              <SheetPreviewStats />
            </SheetPreviewTab>
          </TabPanel>
          <TabPanel value='2'>
            <SheetPreviewTab>
              <SheetPreviewSkills />
            </SheetPreviewTab>
          </TabPanel>
          <TabPanel value='3'>
            <SheetPreviewTab>
              <SheetPreviewAbilities />
            </SheetPreviewTab>
          </TabPanel>
          <TabPanel value='4'>
            <SheetPreviewTab>
              <SheetPreviewPowers />
            </SheetPreviewTab>
          </TabPanel>
          <TabPanel value='5'>
            <SheetPreviewTab>
              <SheetPreviewSpells />
            </SheetPreviewTab>
          </TabPanel>
          <TabPanel value='6'>
            <SheetPreviewTab>
              <SheetPreviewInventory />
            </SheetPreviewTab>
          </TabPanel>
          <TabPanel value='7'>
            <SheetPreviewTab>
              <SheetPreviewBuildSteps />
            </SheetPreviewTab>
          </TabPanel>
        </div>
      </div>
    </TabContext>
  );
};

export default SheetPreview;
