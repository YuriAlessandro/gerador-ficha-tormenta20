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

const tabs = [
  {
    id: '1',
    label: '1 - Atributos Iniciais',
    Component: SheetBuilderFormStepAttributesDefinition,
  },
  { id: '2', label: '2 - Raça', Component: SheetBuilderFormStepRaceDefinition },
  {
    id: '3',
    label: '3 - Classe',
    Component: SheetBuilderFormStepRoleDefinition,
  },
  {
    id: '4',
    label: '4 - Origem',
    Component: SheetBuilderFormStepOriginDefinition,
  },
  {
    id: '5',
    label: '5 - Perícias de inteligência',
    Component: SheetBuilderFormStepIntelligenceSkillsTraining,
  },
  {
    id: '6',
    label: '6 - Equipamento',
    Component: SheetBuilderFormStepEquipmentDefinition,
  },
];

const selectedTabStyle = {
  backgroundColor: '#d13235',
  color: '#fff',
  opacity: 1,
};

const SheetBuilderForm = () => {
  const [showingTab, setShowingTab] = React.useState('1');
  const alert = useSelector(selectFormAlert);
  const dispatch = useDispatch();
  const onChangeTab = (index: string) => {
    setShowingTab(index);
    dispatch(resetFormAlert());
  };
  return (
    <div className='py-2'>
      <TabContext value={showingTab}>
        <TabList>
          {tabs.map(({ id, label }) => (
            <Tab
              key={id}
              style={showingTab === id ? selectedTabStyle : {}}
              onClick={() => onChangeTab(id)}
              label={`${label}`}
            />
          ))}
        </TabList>
        <section className='container mx-auto pt-5'>
          {tabs.map(({ Component, id }) => (
            <div key={id} className={`${id !== showingTab ? 'hidden' : ''}`}>
              <Component />
            </div>
          ))}
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
