import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material';
import { CompleteSkill } from '../interfaces/Skills';
import CharacterSheet from '../interfaces/CharacterSheet';

interface IProps {
  sheet: CharacterSheet;
  skills?: CompleteSkill[];
  isDarkTheme: boolean;
}

const SkillTable: React.FC<IProps> = ({ sheet, skills, isDarkTheme }) => {
  const StyledTableCell = styled(TableCell)(() => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: 'rgb(209, 50, 53)',
      color: '#FFF',
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 12,
      backgroundColor: isDarkTheme ? '#212121' : '#FFF',
      color: isDarkTheme ? '#FFF' : '#000',
    },
  }));

  return (
    <TableContainer component={Paper}>
      <Table size='medium' aria-label='Histórico de Fichas'>
        <TableHead>
          <TableRow>
            <StyledTableCell>
              <strong>Perícia</strong>
            </StyledTableCell>
            <StyledTableCell id='onlyShowPrint'>
              <strong>TOTAL</strong>
            </StyledTableCell>
            <StyledTableCell id='notShowPrint'>
              <strong>1/2 Nível</strong>
            </StyledTableCell>
            <StyledTableCell id='notShowPrint'>
              <strong>Mod. Atributo</strong>
            </StyledTableCell>
            <StyledTableCell id='notShowPrint'>
              <strong>Treino</strong>
            </StyledTableCell>
            <StyledTableCell id='notShowPrint'>
              <strong>Outros</strong>
            </StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {skills?.map((skill) => {
            const attributeValue = skill.modAttr
              ? sheet.atributos[skill.modAttr].mod
              : 0;

            const skillTotal =
              (skill.halfLevel ?? 0) +
              attributeValue +
              (skill.others ?? 0) +
              (skill.training ?? 0);
            return (
              <TableRow key={skill.name}>
                <StyledTableCell component='th' scope='row'>
                  {(skill.training ?? 0) > 0 ? (
                    <strong>
                      • {skill.name}{' '}
                      <span id='notShowPrint'>+{skillTotal}</span>
                    </strong>
                  ) : (
                    <span>
                      {skill.name} <span id='notShowPrint'>+{skillTotal}</span>
                    </span>
                  )}
                </StyledTableCell>
                <StyledTableCell id='onlyShowPrint'>
                  {skillTotal}
                </StyledTableCell>
                <StyledTableCell id='notShowPrint'>
                  {skill.halfLevel ?? 0}
                </StyledTableCell>
                <StyledTableCell id='notShowPrint'>
                  {skill.modAttr ?? 0}
                </StyledTableCell>
                <StyledTableCell id='notShowPrint'>
                  {skill.training ?? 0}
                </StyledTableCell>
                <StyledTableCell id='notShowPrint'>
                  {skill.others ?? 0}
                </StyledTableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
export default SkillTable;
