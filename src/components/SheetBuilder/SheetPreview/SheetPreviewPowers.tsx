import React from 'react';
import { useSelector } from 'react-redux';
import { Translator } from 't20-sheet-builder';
import {
  selectPreviewGeneralPowers,
  selectPreviewOriginPowers,
} from '@/store/slices/sheetBuilder/sheetBuilderSliceSheetPreview';
import { Box, Stack, useTheme } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import styled from '@emotion/styled';
import BookTitle from '../common/BookTitle';

const SheetPreviewPowers = () => {
  const theme = useTheme();
  const generalPowers = useSelector(selectPreviewGeneralPowers);
  const originPowers = useSelector(selectPreviewOriginPowers);

  const Title = styled.h3`
    font-family: 'Tfont';
    color: ${theme.palette.primary.main};
  `;

  const Name = styled.span`
    color: ${theme.palette.primary.main};
  `;

  return (
    <>
      <BookTitle>Poderes</BookTitle>
      {generalPowers.length === 0 && originPowers.length === 0 && (
        <p>Nenhum poder.</p>
      )}
      <Stack spacing={2}>
        {generalPowers.length !== 0 && (
          <Box>
            <Title>Poderes Gerais</Title>
            {generalPowers.map((power) => (
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls='panel1a-content'
                  id='panel1a-header'
                >
                  <Name>{Translator.getPowerTranslation(power.name)}</Name>
                </AccordionSummary>
                <AccordionDetails>
                  {power.effects.map((effect) => (
                    <p key={effect.description} className='text-sm mb-1'>
                      {effect.description}
                    </p>
                  ))}
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}
        {originPowers.length !== 0 && (
          <Box>
            <Title>Poderes de Origem</Title>
            {originPowers.map((power) => (
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls='panel1a-content'
                  id='panel1a-header'
                >
                  <Name>{Translator.getPowerTranslation(power.name)}</Name>
                </AccordionSummary>
                <AccordionDetails>
                  {power.effects.map((effect) => (
                    <p key={effect.description} className='text-sm mb-1'>
                      {effect.description}
                    </p>
                  ))}
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}
      </Stack>
    </>
  );
};

export default SheetPreviewPowers;
