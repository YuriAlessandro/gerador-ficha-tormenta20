import React, { useEffect, useState } from 'react';
import { Timeline } from '@mui/lab';
import { Box, Slide, Paper } from '@mui/material';
import FaceIcon from '@mui/icons-material/Face';
import CasinoIcon from '@mui/icons-material/Casino';
import ConstructionIcon from '@mui/icons-material/Construction';
import HistoryToggleOffIcon from '@mui/icons-material/HistoryToggleOff';
import ChurchIcon from '@mui/icons-material/Church';
import AddBoxIcon from '@mui/icons-material/AddBox';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import AnimationIcon from '@mui/icons-material/Animation';
import CharacterSheet from '../../interfaces/CharacterSheet';
import generateRandomSheet from '../../functions/general';
import AttributesCard from '../Timeline/Cards/AttributesCard';
import TimelineStep from '../Timeline/TimelineStep';
import SheetAttributesOnRace from '../Timeline/SheetAttributesOnRance';
import RaceCard from '../Timeline/Cards/RaceCard';
import ClassCard from '../Timeline/Cards/ClassCard';
import OriginCard from '../Timeline/Cards/OriginCard';

const ManualSheet: React.FC<{
  isDarkMode: boolean;
}> = () => {
  const sheet = generateRandomSheet({
    classe: '',
    devocao: { value: '--', label: 'Não devoto' },
    nivel: 1,
    origin: '',
    raca: '',
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [currentSheet, setCurrentSheet] = useState(sheet);

  const onContinue = (newStep: number, newSheet: CharacterSheet) => {
    setCurrentSheet(newSheet);
    setCurrentStep(newStep);
  };

  useEffect(() => {
    setCurrentStep(1);
  }, []);

  // console.log(currentSheet);

  return (
    <Box sx={{ m: 3 }}>
      <h1>Criar ficha manual</h1>

      <Box>
        <Timeline position='right'>
          <Slide in={currentStep >= 1}>
            <div>
              <TimelineStep icon={<CasinoIcon />}>
                {currentStep === 1 && (
                  <AttributesCard
                    sheet={currentSheet}
                    onContinue={onContinue}
                  />
                )}
                {currentStep > 1 && (
                  <Paper sx={{ p: 3 }} elevation={0}>
                    Atributos escolhidos
                  </Paper>
                )}
              </TimelineStep>
            </div>
          </Slide>
          <div>
            <TimelineStep
              icon={<FaceIcon />}
              oppositeContent={
                currentStep === 2 ? (
                  <SheetAttributesOnRace currentSheet={currentSheet} />
                ) : (
                  ''
                )
              }
            >
              {currentStep < 2 && (
                <Paper sx={{ p: 3 }} elevation={0}>
                  Escolher raça
                </Paper>
              )}
              {currentStep === 2 && (
                <RaceCard sheet={currentSheet} onContinue={onContinue} />
              )}
              {currentStep > 2 && (
                <Paper sx={{ p: 3 }} elevation={0}>
                  Raça escolhida: {currentSheet.raca.name}
                </Paper>
              )}
            </TimelineStep>
          </div>
          <div>
            <TimelineStep
              icon={<ConstructionIcon />}
              oppositeContent={
                currentStep === 3 ? (
                  <SheetAttributesOnRace currentSheet={currentSheet} />
                ) : (
                  ''
                )
              }
            >
              {currentStep < 3 && (
                <Paper sx={{ p: 3 }} elevation={0}>
                  Escolher Classe
                </Paper>
              )}
              {currentStep === 3 && (
                <ClassCard sheet={currentSheet} onContinue={onContinue} />
              )}
              {currentStep > 3 && (
                <Paper sx={{ p: 3 }} elevation={0}>
                  Classe escolhida: {currentSheet.classe.name}
                </Paper>
              )}
            </TimelineStep>
          </div>
          <div>
            <TimelineStep icon={<HistoryToggleOffIcon />}>
              {currentStep < 4 && (
                <Paper sx={{ p: 3 }} elevation={0}>
                  Escolher Origem
                </Paper>
              )}
              {currentStep === 4 && (
                <OriginCard sheet={currentSheet} onContinue={onContinue} />
              )}
              {currentStep > 4 && (
                <Paper sx={{ p: 3 }} elevation={0}>
                  EM BREVE
                </Paper>
              )}
            </TimelineStep>
          </div>
          <div>
            <TimelineStep icon={<ChurchIcon />}>
              {currentStep < 5 && (
                <Paper sx={{ p: 3 }} elevation={0}>
                  Escolher Devoção
                </Paper>
              )}
              {currentStep === 5 && (
                <Paper sx={{ p: 3 }} elevation={0}>
                  EM BREVE
                </Paper>
              )}
              {currentStep > 5 && (
                <Paper sx={{ p: 3 }} elevation={0}>
                  EM BREVE
                </Paper>
              )}
            </TimelineStep>
          </div>
          <div>
            <TimelineStep icon={<AddBoxIcon />}>
              {currentStep < 6 && (
                <Paper sx={{ p: 3 }} elevation={0}>
                  Escolher mais perícias
                </Paper>
              )}
              {currentStep === 6 && (
                <Paper sx={{ p: 3 }} elevation={0}>
                  EM BREVE
                </Paper>
              )}
              {currentStep > 6 && (
                <Paper sx={{ p: 3 }} elevation={0}>
                  EM BREVE
                </Paper>
              )}
            </TimelineStep>
          </div>
          <div>
            <TimelineStep icon={<ShoppingBagIcon />}>
              {currentStep < 7 && (
                <Paper sx={{ p: 3 }} elevation={0}>
                  Escolher equipamento inicial
                </Paper>
              )}
              {currentStep === 7 && (
                <Paper sx={{ p: 3 }} elevation={0}>
                  EM BREVE
                </Paper>
              )}
              {currentStep > 7 && (
                <Paper sx={{ p: 3 }} elevation={0}>
                  EM BREVE
                </Paper>
              )}
            </TimelineStep>
          </div>
          <div>
            <TimelineStep icon={<AnimationIcon />}>
              {currentStep < 8 && (
                <Paper sx={{ p: 3 }} elevation={0}>
                  Escolher magias
                </Paper>
              )}
              {currentStep === 8 && (
                <Paper sx={{ p: 3 }} elevation={0}>
                  EM BREVE
                </Paper>
              )}
              {currentStep > 8 && (
                <Paper sx={{ p: 3 }} elevation={0}>
                  EM BREVE
                </Paper>
              )}
            </TimelineStep>
          </div>
        </Timeline>
      </Box>
    </Box>
  );
};

export default ManualSheet;
