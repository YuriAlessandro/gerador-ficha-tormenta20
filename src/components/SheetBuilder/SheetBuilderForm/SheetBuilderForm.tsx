import {
  resetFormAlert,
  selectFormAlert,
} from '@/store/slices/sheetBuilder/sheetBuilderSliceForm';
import { TabContext, TabList } from '@material-ui/lab';
import { Tab } from '@mui/material';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SheetBuilderFormAlertError from './SheetBuilderFormAlertError';
import SheetBuilderFormAlertSuccess from './SheetBuilderFormAlertSuccess';
import SheetBuilderFormStepAttributesDefinition from './SheetBuilderFormStep/SheetBuilderFormStepAttributesDefinition/SheetBuilderFormStepAttributesDefinition';
import SheetBuilderFormStepEquipmentDefinition from './SheetBuilderFormStep/SheetBuilderFormStepEquipmentDefinition/SheetBuilderFormStepEquipmentDefinition';
import SheetBuilderFormStepIntelligenceSkillsTraining from './SheetBuilderFormStep/SheetBuilderFormStepIntelligenceSkillsTraining/SheetBuilderFormStepIntelligenceSkillsTraining';
import SheetBuilderFormStepOriginDefinition from './SheetBuilderFormStep/SheetBuilderFormStepOriginDefinition/SheetBuilderFormStepOriginDefinition';
import SheetBuilderFormStepRaceDefinition from './SheetBuilderFormStep/SheetBuilderFormStepRaceDefinition/SheetBuilderFormStepRaceDefinition';
import SheetBuilderFormStepRoleDefinition from './SheetBuilderFormStep/SheetBuilderFormStepRoleDefinition/SheetBuilderFormStepRoleDefinition';

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
        <TabList>
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
        </TabList>

        <section className='container mx-auto pt-5'>
          <div className={`${tab !== '1' ? 'hidden' : ''}`}>
            <SheetBuilderFormStepAttributesDefinition />
          </div>
          <div className={`${tab !== '2' ? 'hidden' : ''}`}>
            <SheetBuilderFormStepRaceDefinition />
          </div>
          <div className={`${tab !== '3' ? 'hidden' : ''}`}>
            <SheetBuilderFormStepRoleDefinition />
          </div>
          <div className={`${tab !== '4' ? 'hidden' : ''}`}>
            <SheetBuilderFormStepOriginDefinition />
          </div>
          <div className={`${tab !== '5' ? 'hidden' : ''}`}>
            <SheetBuilderFormStepIntelligenceSkillsTraining />
          </div>
          <div className={`${tab !== '6' ? 'hidden' : ''}`}>
            <SheetBuilderFormStepEquipmentDefinition />
          </div>
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
