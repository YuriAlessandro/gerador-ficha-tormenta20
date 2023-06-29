import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TabContext, TabList, TabPanel } from '@material-ui/lab';
import { Tabs, Tab } from '@mui/material';
import SheetBuilderFormAlertError from './SheetBuilderFormAlertError';
import SheetBuilderFormAlertSuccess from './SheetBuilderFormAlertSuccess';
import SheetBuilderFormStepAttributesDefinition from './SheetBuilderFormStep/SheetBuilderFormStepAttributesDefinition/SheetBuilderFormStepAttributesDefinition';
import SheetBuilderFormStepEquipmentDefinition from './SheetBuilderFormStep/SheetBuilderFormStepEquipmentDefinition/SheetBuilderFormStepEquipmentDefinition';
import SheetBuilderFormStepIntelligenceSkillsTraining from './SheetBuilderFormStep/SheetBuilderFormStepIntelligenceSkillsTraining/SheetBuilderFormStepIntelligenceSkillsTraining';
import SheetBuilderFormStepOriginDefinition from './SheetBuilderFormStep/SheetBuilderFormStepOriginDefinition/SheetBuilderFormStepOriginDefinition';
import SheetBuilderFormStepRaceDefinition from './SheetBuilderFormStep/SheetBuilderFormStepRaceDefinition/SheetBuilderFormStepRaceDefinition';
import SheetBuilderFormStepRoleDefinition from './SheetBuilderFormStep/SheetBuilderFormStepRoleDefinition/SheetBuilderFormStepRoleDefinition';
import {
  selectFormAlert,
  resetFormAlert,
} from '../../../store/slices/sheetBuilder/sheetBuilderSliceForm';

const SheetBuilderForm = () => {
  const [tab, setTab] = React.useState('1');
  const alert = useSelector(selectFormAlert);
  const dispatch = useDispatch();
  const onChangeTab = (index: string) => {
    setTab(index);
    dispatch(resetFormAlert());
  };
  return (
    <div className='py-2'>
      <TabContext value={tab}>
        <Tabs>
          <Tab
            onClick={() => onChangeTab('1')}
            label='1 - Atributos Iniciais'
          />
          <Tab onClick={() => onChangeTab('2')} label='2 - Raça' />
          <Tab onClick={() => onChangeTab('3')} label='3 - Classe' />
          <Tab onClick={() => onChangeTab('4')} label='4 - Origem' />
          <Tab
            onClick={() => onChangeTab('5')}
            label='5 - Perícias de inteligência'
          />
          <Tab onClick={() => onChangeTab('6')} label='6 - Equipamento' />
        </Tabs>

        <section className='container mx-auto pt-5'>
          <TabPanel value='1'>
            <SheetBuilderFormStepAttributesDefinition />
          </TabPanel>
          <TabPanel value='2'>
            <SheetBuilderFormStepRaceDefinition />
          </TabPanel>
          <TabPanel value='3'>
            <SheetBuilderFormStepRoleDefinition />
          </TabPanel>
          <TabPanel value='4'>
            <SheetBuilderFormStepOriginDefinition />
          </TabPanel>
          <TabPanel value='5'>
            <SheetBuilderFormStepIntelligenceSkillsTraining />
          </TabPanel>
          <TabPanel value='6'>
            <SheetBuilderFormStepEquipmentDefinition />
          </TabPanel>
        </section>
        <div className='container mx-auto'>
          {alert?.type === 'error' && (
            <SheetBuilderFormAlertError message={alert.message} />
          )}
          {alert?.type === 'success' && (
            <SheetBuilderFormAlertSuccess message={alert.message} />
          )}
        </div>
      </TabContext>
    </div>
  );
};

export default SheetBuilderForm;
