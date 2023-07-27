import React from 'react';
import {
  SerializedSheetSpell,
  SpellCircle,
  Translator,
} from 't20-sheet-builder';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  useTheme,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import styled from '@emotion/styled';

type Props = {
  spell: SerializedSheetSpell;
};

const circleToNumber: Record<SpellCircle, number> = {
  [SpellCircle.first]: 1,
  [SpellCircle.second]: 2,
};

const SheetPreviewSpell = ({ spell }: Props) => {
  const theme = useTheme();
  const translatedName = Translator.getSpellTranslation(spell.name);
  const circleNumber = circleToNumber[spell.circle];
  const translatedType = Translator.getSpellTypeTranslation(spell.type);
  const translatedSchool = Translator.getSpellSchoolTranslation(spell.school);

  const Name = styled.span`
    color: ${theme.palette.primary.main};
  `;

  const Details = styled.span`
    color: ${theme.palette.text.disabled};
    margin-left: 5px;
  `;

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls='panel1a-content'
        id='panel1a-header'
      >
        <Name>{translatedName}</Name>
        <Details>
          • {translatedType} {circleNumber} ({translatedSchool})
        </Details>
      </AccordionSummary>
      <AccordionDetails>
        <Box>
          {spell.effects.map((effect) => (
            <p key={effect.description}>{effect.description}</p>
          ))}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default SheetPreviewSpell;
