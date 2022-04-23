import React, { useEffect, useRef, useState } from 'react';
import { Timeline } from '@mui/lab';
import { Box, Slide, Paper } from '@mui/material';
import FaceIcon from '@mui/icons-material/Face';
import CasinoIcon from '@mui/icons-material/Casino';
import CharacterSheet from '../../interfaces/CharacterSheet';
import generateRandomSheet from '../../functions/general';
import AttributesCard from '../Timeline/Cards/AttributesCard';
import TimelineStep from '../Timeline/TimelineStep';
import SheetAttributesOnRace from '../Timeline/SheetAttributesOnRance';
import RaceCard from '../Timeline/Cards/RaceCard';

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

  return (
    <Box sx={{ m: 3 }}>
      <h1>Criar ficha manual</h1>

      <Box sx={{ overflowY: 'scroll' }}>
        <Timeline position='right'>
          <Slide in={currentStep >= 1}>
            <div>
              <TimelineStep icon={<CasinoIcon />}>
                {currentStep === 1 && (
                  <AttributesCard sheet={sheet} onContinue={onContinue} />
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
                  <SheetAttributesOnRace currentSheet={currentSheet} />
                }
              >
                <RaceCard sheet={sheet} onContinue={onContinue} />
              </TimelineStep>
            </div>
          </Slide>
        </Timeline>
        <div ref={bottomRef} />
      </Box>
    </Box>
  );
};

export default ManualSheet;
