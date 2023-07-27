import React from 'react';
import { useSelector } from 'react-redux';
import { SkillName, Translator } from 't20-sheet-builder';
import {
  selectPreviewAttributes,
  selectPreviewSkills,
} from '@/store/slices/sheetBuilder/sheetBuilderSliceSheetPreview';
import { Box, useTheme } from '@mui/material';
import styled from '@emotion/styled';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useSnackbar } from 'notistack';
import { rollDice } from '@/functions/randomUtils';
import diceSound from '@/assets/sounds/dice-rolling.mp3';
import BookTitle from '../common/BookTitle';
import DiceRollerActions from '../common/DiceRollerActions';
import { addSignForRoll } from '../common/StringHelper';

const SheetPreviewSkills = () => {
  const theme = useTheme();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const skills = useSelector(selectPreviewSkills);
  const attributes = useSelector(selectPreviewAttributes);

  const DefaultTbCell = styled(TableCell)`
    border: none;
  `;

  const TableCellSkillTotal = styled(TableCell)`
    border: 1px solid ${theme.palette.primary.dark};
    cursor: pointer;
  `;

  const CellFgText = styled.span`
    position: absolute;
    z-index: 1;
  `;
  const CellBgText = styled.span`
    color: #c4c4c4;
    position: absolute;
    font-size: 10px;
    font-align: center;
    margin: 5px 0 0 10px;
  `;

  const fmtSkillName = (skillName: string) =>
    // Return first 3 letters in capital case inside parentheses
    `(${skillName.substring(0, 3).toUpperCase()})`;

  const onClickSkill = (skill: string, bonus: number) => {
    const rollResult = rollDice(1, 20);
    const total = rollResult + bonus;

    const action = (snackbarId: number) => (
      <DiceRollerActions
        snackbarId={snackbarId}
        closeSnackbar={closeSnackbar}
      />
    );

    let variant: 'default' | 'success' | 'error' = 'default';
    if (rollResult === 20) variant = 'success';
    if (rollResult === 1) variant = 'error';

    const audio = new Audio(diceSound);
    audio.play();
    enqueueSnackbar(
      `Rolagem de ${skill}: ${total} = ${rollResult}${addSignForRoll(bonus)}`,
      {
        action,
        variant,
      }
    );
  };

  return (
    <Box>
      <BookTitle>Perícias</BookTitle>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label='simple table'>
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
                  <TableRow key={skillName}>
                    <DefaultTbCell component='th' scope='row'>
                      {skillNameTranslation}
                    </DefaultTbCell>
                    <TableCellSkillTotal
                      align='center'
                      onClick={() =>
                        onClickSkill(skillNameTranslation, skill.total)
                      }
                    >
                      {skill.total}
                    </TableCellSkillTotal>
                    <DefaultTbCell align='center'>0</DefaultTbCell>
                    <DefaultTbCell align='center'>
                      <CellFgText>{attributes[skill.attribute]}</CellFgText>
                      <CellBgText>
                        {fmtSkillName(attributeTranslation)}
                      </CellBgText>
                    </DefaultTbCell>
                    <DefaultTbCell align='center'>
                      {skill.trainingPoints}
                    </DefaultTbCell>
                    <DefaultTbCell align='center'>
                      {skill.fixedModifiers.total}
                    </DefaultTbCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SheetPreviewSkills;
