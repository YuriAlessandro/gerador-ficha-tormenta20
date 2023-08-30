import diceSound from '@/assets/sounds/dice-rolling.mp3';
import {
  selectCharacter,
  selectPreviewAttributes,
  selectPreviewResistances,
  selectPreviewSkills,
} from '@/store/slices/sheetBuilder/sheetBuilderSliceSheetPreview';
import styled from '@emotion/styled';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useSnackbar } from 'notistack';
import React from 'react';
import { useSelector } from 'react-redux';
import {
  Character,
  PreviewContext,
  SerializedSheetSkill,
  SkillName,
  Translator,
} from 't20-sheet-builder';
import BookTitle from '../common/BookTitle';
import SheetPreviewResistances, {
  ResistedSkill,
} from './SheetPreviewResistances';

const resistanceSkills: SkillName[] = [
  SkillName.fortitude,
  SkillName.reflexes,
  SkillName.will,
];

const SheetPreviewSkills = () => {
  const theme = useTheme();

  const [openResistances, setOpenResistances] = React.useState(false);
  const [rolledResistance, setRolledResistance] = React.useState<
    ResistedSkill | undefined
  >();

  const isScreen = useMediaQuery('(min-width: 720px)');
  const { enqueueSnackbar } = useSnackbar();
  const skills = useSelector(selectPreviewSkills);
  const resistances = useSelector(selectPreviewResistances);
  const attributes = useSelector(selectPreviewAttributes);
  const characterPreview = useSelector(selectCharacter);

  const DefaultTbCell = styled(TableCell)`
    border: none;
  `;

  const TableCellSkillTotal = styled(TableCell)`
    border: 1px solid ${theme.palette.primary.dark};
    cursor: pointer;
  `;

  const CellFgText = styled.span`
    z-index: 1;
  `;
  const CellBgText = styled.span`
    margin: 8px 0 0 5px;
    color: #c4c4c4;
    position: absolute;
    font-size: 10px;
    font-align: center;
  `;

  const fmtSkillName = (skillName: string) =>
    // Return first 3 letters in capital case inside parentheses
    `(${skillName.substring(0, 3).toUpperCase()})`;

  const onClickSkill = (skill: SerializedSheetSkill, skillName: SkillName) => {
    const character = Character.makeFromSerialized(characterPreview);
    const context = new PreviewContext(character);
    const characterSkill = character.getSkills(context)[skillName];
    const roll = characterSkill.roll();
    const translatedSkillName = Translator.getSkillTranslation(skillName);
    if (resistances && resistanceSkills.includes(skillName)) {
      setRolledResistance({
        name: skillName,
        skill,
      });
      setOpenResistances(true);
      return;
    }

    const audio = new Audio(diceSound);
    audio.play();
    enqueueSnackbar(`${translatedSkillName}`, {
      variant: 'diceRoll',
      persist: true,
      roll,
    });
  };

  const StyledTableRow = styled(TableRow)(() => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
  }));

  return (
    <Box>
      <BookTitle>Perícias</BookTitle>
      {rolledResistance && (
        <SheetPreviewResistances
          open={openResistances}
          onClose={() => setOpenResistances(false)}
          resistance={rolledResistance}
        />
      )}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label='Perícias' size='small'>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Perícias</strong>
              </TableCell>
              <TableCell align='center'>
                <strong>Total</strong>
              </TableCell>
              <TableCell align='center'>
                <strong>1/2 do Nível</strong>
              </TableCell>
              <TableCell align='center'>
                <strong>Atributo</strong>
              </TableCell>
              <TableCell align='center'>
                <strong>Treino</strong>
              </TableCell>
              <TableCell align='center'>
                <strong>Outros</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody sx={{ border: 'none' }}>
            {Object.entries(skills)
              .sort(([skill], [skill2]) => {
                const skillNameTranslation = Translator.getSkillTranslation(
                  skill as SkillName
                );
                const skillNameTranslation2 = Translator.getSkillTranslation(
                  skill2 as SkillName
                );
                return skillNameTranslation.localeCompare(
                  skillNameTranslation2
                );
              })
              .map(([key, skill]) => {
                const skillName = key as SkillName;
                const skillNameTranslation =
                  Translator.getSkillTranslation(skillName);
                const attributeTranslation = Translator.getAttributeTranslation(
                  skill.attribute
                );
                return (
                  <StyledTableRow key={skillName}>
                    <DefaultTbCell component='th' scope='row'>
                      {skillNameTranslation}
                    </DefaultTbCell>
                    <TableCellSkillTotal
                      align='center'
                      onClick={() => onClickSkill(skill, key as SkillName)}
                    >
                      {skill.total}
                    </TableCellSkillTotal>
                    <DefaultTbCell align='center'>0</DefaultTbCell>
                    <DefaultTbCell align='center'>
                      <CellFgText>{attributes[skill.attribute]}</CellFgText>
                      {isScreen && (
                        <CellBgText>
                          {fmtSkillName(attributeTranslation)}
                        </CellBgText>
                      )}
                    </DefaultTbCell>
                    <DefaultTbCell align='center'>
                      {skill.trainingPoints}
                    </DefaultTbCell>
                    <DefaultTbCell align='center'>
                      {skill.fixedModifiers.total}
                    </DefaultTbCell>
                  </StyledTableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SheetPreviewSkills;
