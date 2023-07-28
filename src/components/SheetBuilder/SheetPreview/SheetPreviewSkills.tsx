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

const SheetPreviewSkills = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
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

  const onClickSkill = (skill: string, bonus: number) => {
    const rollResult = rollDice(1, 20);

    const audio = new Audio(diceSound);
    audio.play();
    enqueueSnackbar(`${skill}`, {
      variant: 'diceRoll',
      persist: true,
      bonus,
      rollResult,
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
