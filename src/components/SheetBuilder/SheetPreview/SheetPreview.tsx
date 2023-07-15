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

const tabs = [
  { label: 'Básico', index: '1', Component: SheetPreviewStats },
  { label: 'Perícias', index: '2', Component: SheetPreviewSkills },
  { label: 'Habilidades', index: '3', Component: SheetPreviewAbilities },
  { label: 'Poderes', index: '4', Component: SheetPreviewPowers },
  { label: 'Magias', index: '5', Component: SheetPreviewSpells },
  { label: 'Inventário', index: '6', Component: SheetPreviewInventory },
  { label: 'Passo a passo', index: '7', Component: SheetPreviewBuildSteps },
];

const SheetPreview = () => {
  const [tab, setTab] = React.useState('1');

  const onChangeTab = (index: string) => {
    setTab(index);
  };

  return (
    <TabContext value={tab}>
      <div className='flex flex-col justify-center items-center py-2'>
        <Tabs className='flex-1'>
          {tabs.map(({ index, label }) => (
            <Tab key={index} onClick={() => onChangeTab(index)} label={label} />
          ))}
        </Tabs>
        <div className='container mx-auto'>
          {tabs.map(({ index, Component }) => (
            <TabPanel key={index} value={index}>
              <SheetPreviewTab>
                <Component />
              </SheetPreviewTab>
            </TabPanel>
          ))}
        </div>
      </div>
    </TabContext>
  );
};

export default SheetPreview;
