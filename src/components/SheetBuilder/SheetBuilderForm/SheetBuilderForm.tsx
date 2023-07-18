import {
  resetFormAlert,
  selectFormAlert,
} from '@/store/slices/sheetBuilder/sheetBuilderSliceForm';
import { Alert, Snackbar, useTheme } from '@mui/material';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import AddBoxIcon from '@mui/icons-material/AddBox';
import HistoryToggleOffIcon from '@mui/icons-material/HistoryToggleOff';
import ConstructionIcon from '@mui/icons-material/Construction';
import CasinoIcon from '@mui/icons-material/Casino';
import FaceIcon from '@mui/icons-material/Face';
import { Timeline } from '@mui/lab';
import styled from '@emotion/styled';
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
    label: 'Perícias de Int',
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

  const vertical = 'bottom';
  const horizontal = 'center';

  const theme = useTheme();

  const Label = styled.h4`
    font-family: 'Tfont';
    color: ${theme.palette.primary.main};
  `;
  return (
    <div>
      <Snackbar
        open={Boolean(alert)}
        autoHideDuration={6000}
        anchorOrigin={{ vertical, horizontal }}
      >
        <Alert severity={alert?.type}>{alert?.message}</Alert>
      </Snackbar>
      <Timeline position='right'>
        <div>
          {steps.map(({ Component, id, label, Icon }) => (
            <TimelineStep
              label={id !== showingTab ? '' : label}
              icon={Icon}
              id={id}
              onChangeStep={onChangeStep}
              showingTab={showingTab}
            >
              {id === showingTab && <Component />}

              {id !== showingTab && <Label>{label}</Label>}
            </TimelineStep>
          ))}
        </div>
      </Timeline>
    </div>
  );
};

export default SheetBuilderForm;
