import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import { CompleteSkill } from '../interfaces/Skills';

interface IProps {
  skills?: CompleteSkill[];
  isDarkTheme: boolean;
}

const SkillTable: React.FC<IProps> = ({ skills, isDarkTheme }) => {
  const StyledTableCell = withStyles(() => ({
    head: {
      backgroundColor: 'rgb(209, 50, 53)',
      color: '#FFF',
      fontSize: '12px',
    },
    body: {
      fontSize: 12,
      backgroundColor: isDarkTheme ? '#212121' : '#FFF',
      color: isDarkTheme ? '#FFF' : '#000',
    },
  }))(TableCell);

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
            const skillTotal =
              (skill.halfLevel ?? 0) +
              (skill.modAttr ?? 0) +
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
                  {(skill.halfLevel ?? 0) +
                    (skill.modAttr ?? 0) +
                    (skill.others ?? 0) +
                    (skill.training ?? 0)}
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
