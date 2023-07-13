import {
  resetFormAlert,
  selectFormAlert,
} from '@/store/slices/sheetBuilder/sheetBuilderSliceForm';
import { Box, IconButton } from '@mui/material';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import AddBoxIcon from '@mui/icons-material/AddBox';
import HistoryToggleOffIcon from '@mui/icons-material/HistoryToggleOff';
import ConstructionIcon from '@mui/icons-material/Construction';
import CasinoIcon from '@mui/icons-material/Casino';
import FaceIcon from '@mui/icons-material/Face';
import { Timeline } from '@mui/lab';
import SheetBuilderFormAlertError from './SheetBuilderFormAlertError';
import SheetBuilderFormAlertSuccess from './SheetBuilderFormAlertSuccess';
import SheetBuilderFormStepAttributesDefinition from './SheetBuilderFormStep/SheetBuilderFormStepAttributesDefinition/SheetBuilderFormStepAttributesDefinition';
import SheetBuilderFormStepEquipmentDefinition from './SheetBuilderFormStep/SheetBuilderFormStepEquipmentDefinition/SheetBuilderFormStepEquipmentDefinition';
import SheetBuilderFormStepIntelligenceSkillsTraining from './SheetBuilderFormStep/SheetBuilderFormStepIntelligenceSkillsTraining/SheetBuilderFormStepIntelligenceSkillsTraining';
import SheetBuilderFormStepOriginDefinition from './SheetBuilderFormStep/SheetBuilderFormStepOriginDefinition/SheetBuilderFormStepOriginDefinition';
import SheetBuilderFormStepRaceDefinition from './SheetBuilderFormStep/SheetBuilderFormStepRaceDefinition/SheetBuilderFormStepRaceDefinition';
import SheetBuilderFormStepRoleDefinition from './SheetBuilderFormStep/SheetBuilderFormStepRoleDefinition/SheetBuilderFormStepRoleDefinition';

import TimelineStep from './TimelineStep';

const steps = [
  {
    id: 1,
    label: 'Atributos Iniciais',
    Component: SheetBuilderFormStepAttributesDefinition,
    Icon: <CasinoIcon />,
  },
  {
    id: 2,
    label: 'Raça',
    Component: SheetBuilderFormStepRaceDefinition,
    Icon: <FaceIcon />,
  },
  {
    id: 3,
    label: 'Classe',
    Component: SheetBuilderFormStepRoleDefinition,
    Icon: <ConstructionIcon />,
  },
  {
    id: 4,
    label: 'Origem',
    Component: SheetBuilderFormStepOriginDefinition,
    Icon: <HistoryToggleOffIcon />,
  },
  {
    id: 5,
    label: 'Perícias de inteligência',
    Component: SheetBuilderFormStepIntelligenceSkillsTraining,
    Icon: <AddBoxIcon />,
  },
  {
    id: 6,
    label: 'Equipamento',
    Component: SheetBuilderFormStepEquipmentDefinition,
    Icon: <ShoppingBagIcon />,
  },
];

const SheetBuilderForm = () => {
  const [showingTab, setShowingTab] = React.useState(1);
  const alert = useSelector(selectFormAlert);
  const dispatch = useDispatch();
  const onChangeStep = (index: number) => {
    setShowingTab(index + 1);
    dispatch(resetFormAlert());
  };
  return (
    <div className='py-2'>
      <div className='container mx-auto'>
        {alert?.type === 'error' && (
          <SheetBuilderFormAlertError message={alert.message} />
        )}
        {alert?.type === 'success' && (
          <SheetBuilderFormAlertSuccess message={alert.message} />
        )}
      </div>
      <Timeline position='right'>
        <div>
          {steps.map(({ Component, id, label, Icon }) => (
            <TimelineStep icon={Icon}>
              {id === showingTab && (
                <>
                  {id !== 1 && (
                    <Box sx={{ textAlign: 'center', pb: 1 }}>
                      <IconButton
                        title='Voltar'
                        onClick={() => onChangeStep(id - 2)}
                      >
                        <KeyboardArrowUpIcon />
                      </IconButton>
                    </Box>
                  )}
                  <Component />
                  <Box sx={{ textAlign: 'center', pb: 1 }}>
                    <IconButton
                      title='Continuar'
                      onClick={() => onChangeStep(id)}
                    >
                      <KeyboardArrowDownIcon />
                    </IconButton>
                  </Box>
                </>
              )}

              {id !== showingTab && <p>{label}</p>}
            </TimelineStep>
          ))}
        </div>
      </Timeline>
    </div>
  );
};

export default SheetBuilderForm;
