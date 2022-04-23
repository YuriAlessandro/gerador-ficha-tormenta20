import React, { useEffect, useRef, useState } from 'react';
import { Timeline } from '@mui/lab';
import { Box, Slide, Paper } from '@mui/material';
import FaceIcon from '@mui/icons-material/Face';
import CasinoIcon from '@mui/icons-material/Casino';
import ConstructionIcon from '@mui/icons-material/Construction';
import HistoryToggleOffIcon from '@mui/icons-material/HistoryToggleOff';
import CharacterSheet from '../../interfaces/CharacterSheet';
import generateRandomSheet from '../../functions/general';
import AttributesCard from '../Timeline/Cards/AttributesCard';
import TimelineStep from '../Timeline/TimelineStep';
import SheetAttributesOnRace from '../Timeline/SheetAttributesOnRance';
import RaceCard from '../Timeline/Cards/RaceCard';
import ClassCard from '../Timeline/Cards/ClassCard';

const ManualSheet: React.FC<{
  isDarkMode: boolean;
}> = () => {
  const bottomRef = useRef<null | HTMLDivElement>(null);

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

  useEffect(() => {
    if (currentStep > 1)
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentStep]);

  console.log(currentSheet);

  return (
    <Box sx={{ m: 3 }}>
      <h1>Criar ficha manual</h1>

      <Box sx={{ overflowY: 'scroll' }}>
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
          <Slide in={currentStep >= 2}>
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
          </Slide>
          <Slide in={currentStep >= 3}>
            <div>
              <TimelineStep icon={<ConstructionIcon />}>
                {currentStep === 3 && (
                  <ClassCard sheet={currentSheet} onContinue={onContinue} />
                )}
                {currentStep >= 3 && (
                  <Paper sx={{ p: 3 }} elevation={0}>
                    Classe escolhida: {currentSheet.classe.name}
                  </Paper>
                )}
              </TimelineStep>
            </div>
          </Slide>
          {/* <Slide in={currentStep >= 4}>
            <div>
              <TimelineStep icon={<HistoryToggleOffIcon />}>
                {currentStep === 4 && (
                  <ClassCard sheet={currentSheet} onContinue={onContinue} />
                )}
                {currentStep >= 4 && (
                  <Paper sx={{ p: 3 }} elevation={0}>
                    Classe escolhida: {currentSheet.classe.name}
                  </Paper>
                )}
              </TimelineStep>
            </div>
          </Slide> */}
        </Timeline>
        <div ref={bottomRef} />
      </Box>
    </Box>
  );
};

export default ManualSheet;
