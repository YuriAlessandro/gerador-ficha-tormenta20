import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Box, useTheme } from '@mui/material';
import styled from '@emotion/styled';
import CharacterSheet from '@/interfaces/CharacterSheet';
import { CompleteSkill, SkillsAttrs } from '../../interfaces/Skills';
import BookTitle from './common/BookTitle';
import { rollD20 } from '../../functions/diceRoller';
import { useDiceRoll } from '../../premium/hooks/useDiceRoll';

interface IProps {
  sheet: CharacterSheet;
  skills?: CompleteSkill[];
}

const SkillTable: React.FC<IProps> = ({ sheet, skills }) => {
  const theme = useTheme();
  const { showDiceResult } = useDiceRoll();

  const DefaultTbCell = styled(TableCell)`
    border: none;
    font-size: 12px;
  `;

  const ClickableSkillName = styled.span`
    cursor: pointer;
    user-select: none;
    text-decoration: underline dotted;
    transition: all 0.2s ease;

    &:hover {
      color: ${theme.palette.primary.main};
      text-decoration: underline solid;
    }

    &:active {
      transform: scale(0.98);
    }
  `;

  const TableCellSkillTotal = styled(TableCell)`
    border: 1px solid ${theme.palette.primary.dark};
    cursor: pointer;
    user-select: none;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: ${theme.palette.action.hover};
    }

    &:active {
      transform: scale(0.98);
    }
  `;

  const CellFgText = styled.span`
    z-index: 1;
  `;
  const CellBgText = styled.span`
    margin: 8px 0 0 5px;
    color: #c4c4c4;
    font-size: 10px;
    font-align: center;
  `;

  const StyledTableRow = styled(TableRow)(() => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
  }));

  const fmtSkillName = (skillName: string) =>
    // Return first 3 letters in capital case inside parentheses
    `(${skillName.substring(0, 3).toUpperCase()})`;

  const handleSkillClick = (skill: CompleteSkill, skillTotal: number) => {
    const d20Roll = rollD20();
    const total = Math.max(1, d20Roll + skillTotal);
    const isCritical = d20Roll === 20;
    const isFumble = d20Roll === 1;

    // Format dice notation with sign
    const modifierStr = skillTotal >= 0 ? `+${skillTotal}` : `${skillTotal}`;
    const diceNotation = `1d20${modifierStr}`;

    showDiceResult(
      `Teste de ${skill.name}`,
      [
        {
          label: skill.name,
          diceNotation,
          rolls: [d20Roll],
          modifier: skillTotal,
          total,
          isCritical,
          isFumble,
        },
      ],
      sheet.nome
    );
  };

  return (
    <Box>
      <BookTitle>Perícias</BookTitle>
      <TableContainer component={Paper}>
        <Table aria-label='Perícias' size='small'>
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
            {skills?.map((skill) => {
              const attrValue = skill.modAttr
                ? sheet.atributos[skill.modAttr].mod
                : 0;

              const skillTotal =
                (skill.halfLevel ?? 0) +
                (attrValue ?? 0) +
                (skill.others ?? 0) +
                (skill.training ?? 0);

              return (
                <StyledTableRow key={skill.name}>
                  <DefaultTbCell component='th' scope='row'>
                    {(skill.training ?? 0) > 0 ? (
                      <ClickableSkillName
                        onClick={() => handleSkillClick(skill, skillTotal)}
                        title={`Rolar ${skill.name}`}
                      >
                        <strong>• {skill.name}</strong>
                      </ClickableSkillName>
                    ) : (
                      <ClickableSkillName
                        onClick={() => handleSkillClick(skill, skillTotal)}
                        title={`Rolar ${skill.name}`}
                      >
                        {skill.name}
                      </ClickableSkillName>
                    )}
                  </DefaultTbCell>
                  <TableCellSkillTotal
                    align='center'
                    onClick={() => handleSkillClick(skill, skillTotal)}
                    title={`Rolar ${skill.name}`}
                  >
                    {skillTotal}
                  </TableCellSkillTotal>
                  <DefaultTbCell align='center'>
                    {skill.halfLevel ?? 0}
                  </DefaultTbCell>
                  <DefaultTbCell align='center'>
                    <CellFgText>{attrValue ?? 0}</CellFgText>
                    <CellBgText>
                      {fmtSkillName(SkillsAttrs[skill.name])}
                    </CellBgText>
                  </DefaultTbCell>
                  <DefaultTbCell align='center'>
                    {skill.training ?? 0}
                  </DefaultTbCell>
                  <DefaultTbCell align='center'>
                    {skill.others ?? 0}
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
export default SkillTable;
