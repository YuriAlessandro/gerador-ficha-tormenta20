import {
  resetFormAlert,
  selectFormAlert,
} from '@/store/slices/sheetBuilder/sheetBuilderSliceForm';
import { Alert, Box, Snackbar, useTheme } from '@mui/material';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import AddBoxIcon from '@mui/icons-material/AddBox';
import HistoryToggleOffIcon from '@mui/icons-material/HistoryToggleOff';
import ConstructionIcon from '@mui/icons-material/Construction';
import CasinoIcon from '@mui/icons-material/Casino';
import FaceIcon from '@mui/icons-material/Face';
import ChurchIcon from '@mui/icons-material/Church';
import AccessibilityNewRoundedIcon from '@mui/icons-material/AccessibilityNewRounded';
import { Timeline } from '@mui/lab';
import styled from '@emotion/styled';
import SheetBuilderFormStepAttributesDefinition from './SheetBuilderFormStep/SheetBuilderFormStepAttributesDefinition/SheetBuilderFormStepAttributesDefinition';
import SheetBuilderFormStepEquipmentDefinition from './SheetBuilderFormStep/SheetBuilderFormStepEquipmentDefinition/SheetBuilderFormStepEquipmentDefinition';
import SheetBuilderFormStepIntelligenceSkillsTraining from './SheetBuilderFormStep/SheetBuilderFormStepIntelligenceSkillsTraining/SheetBuilderFormStepIntelligenceSkillsTraining';
import SheetBuilderFormStepOriginDefinition from './SheetBuilderFormStep/SheetBuilderFormStepOriginDefinition/SheetBuilderFormStepOriginDefinition';
import SheetBuilderFormStepRaceDefinition from './SheetBuilderFormStep/SheetBuilderFormStepRaceDefinition/SheetBuilderFormStepRaceDefinition';
import SheetBuilderFormStepRoleDefinition from './SheetBuilderFormStep/SheetBuilderFormStepRoleDefinition/SheetBuilderFormStepRoleDefinition';

import TimelineStep from './TimelineStep';
import SheetBuilderFormStepDevotionDefinition from './SheetBuilderFormStep/SheetBuilderFormStepDevotionDefinition/SheetBuilderFormStepDevotionDefinition';
import SheetBuilderFinalTouches from './SheetBuilderFormStep/SheetBuilderFinalTouches/SheetBuilderFinalTouches';

const steps = [
  {
    id: 1,
    label: 'Atributos Iniciais',
    Component: SheetBuilderFormStepAttributesDefinition,
    Icon: <CasinoIcon />,
    stepConfirmedKey: 'isAttrReady',
  },
  {
    id: 2,
    label: 'Raça',
    Component: SheetBuilderFormStepRaceDefinition,
    Icon: <FaceIcon />,
    stepConfirmedKey: 'isRaceReady',
  },
  {
    id: 3,
    label: 'Classe',
    Component: SheetBuilderFormStepRoleDefinition,
    Icon: <ConstructionIcon />,
    stepConfirmedKey: 'isRoleReady',
  },
  {
    id: 4,
    label: 'Origem',
    Component: SheetBuilderFormStepOriginDefinition,
    Icon: <HistoryToggleOffIcon />,
    stepConfirmedKey: 'isOriginReady',
  },
  {
    id: 5,
    label: 'Divindade',
    Component: SheetBuilderFormStepDevotionDefinition,
    Icon: <ChurchIcon />,
    stepConfirmedKey: 'isDevotionReady',
  },
  {
    id: 6,
    label: 'Perícias de Int',
    Component: SheetBuilderFormStepIntelligenceSkillsTraining,
    Icon: <AddBoxIcon />,
    stepConfirmedKey: 'isIntelligenceSkillsReady',
  },
  {
    id: 7,
    label: 'Equipamento',
    Component: SheetBuilderFormStepEquipmentDefinition,
    Icon: <ShoppingBagIcon />,
    stepConfirmedKey: 'isEquipmentReady',
  },
  {
    id: 8,
    label: 'Toques finais',
    Component: SheetBuilderFinalTouches,
    Icon: <AccessibilityNewRoundedIcon />,
    stepConfirmedKey: 'isFinalTouchesReady',
  },
] as const;

const SheetBuilderForm: React.FC<{ onFinishBuild: () => void }> = ({
  onFinishBuild,
}) => {
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
    <Box>
      <Snackbar
        open={Boolean(alert)}
        autoHideDuration={6000}
        anchorOrigin={{ vertical, horizontal }}
      >
        <Alert severity={alert?.type}>{alert?.message}</Alert>
      </Snackbar>
      <Timeline position='right'>
        <div>
          {steps.map(({ Component, id, label, Icon, stepConfirmedKey }) => (
            <TimelineStep
              key={id}
              label={id !== showingTab ? '' : label}
              icon={Icon}
              id={id}
              onChangeStep={onChangeStep}
              showingTab={showingTab}
              stepConfirmedKey={stepConfirmedKey}
            >
              <Box sx={{ display: id === showingTab ? 'block' : 'none' }}>
                <Component onFinishBuild={onFinishBuild} />
              </Box>
              <Box sx={{ display: id !== showingTab ? 'block' : 'none' }}>
                <Label>{label}</Label>
              </Box>
            </TimelineStep>
          ))}
        </div>
      </Timeline>
    </Box>
  );
};

export default SheetBuilderForm;
