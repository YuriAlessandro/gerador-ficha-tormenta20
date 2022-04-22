import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import { styled } from '@mui/material';
import { HistoricI } from '../interfaces/Historic';
import CharacterSheet from '../interfaces/CharacterSheet';

const Historic: React.FC<{
  isDarkTheme: boolean;
  onClickSeeSheet: (sheet: CharacterSheet) => void;
}> = ({ isDarkTheme, onClickSeeSheet }) => {
  const StyledTableCell = styled(TableCell)(() => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: 'rgb(209, 50, 53)',
      color: '#FFF',
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
      backgroundColor: isDarkTheme ? '#212121' : '#FFF',
      color: isDarkTheme ? '#FFF' : '#000',
    },
  }));

  const ls = localStorage;

  const lsHistoric = ls.getItem('fdnHistoric');
  const historic: HistoricI[] = lsHistoric ? JSON.parse(lsHistoric) : [];

  historic.reverse();

  return (
    <div style={{ padding: '26px' }}>
      <TableContainer component={Paper}>
        <Table size='medium' aria-label='Histórico de Fichas'>
          <TableHead>
            <TableRow>
              <StyledTableCell>
                <strong>Data</strong>
              </StyledTableCell>
              <StyledTableCell>
                <strong>Nome</strong>
              </StyledTableCell>
              <StyledTableCell>
                <strong>Raça</strong>
              </StyledTableCell>
              <StyledTableCell>
                <strong>Classe</strong>
              </StyledTableCell>
              <StyledTableCell>
                <strong>Nível</strong>
              </StyledTableCell>
              <StyledTableCell>Ação</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {historic.map((row) => (
              <TableRow key={row.id}>
                <StyledTableCell component='th' scope='row'>
                  {row.date}
                </StyledTableCell>
                <StyledTableCell>{row.sheet.nome}</StyledTableCell>
                <StyledTableCell>{row.sheet.raca.name}</StyledTableCell>
                <StyledTableCell>{row.sheet.classe.name}</StyledTableCell>
                <StyledTableCell>{row.sheet.nivel}</StyledTableCell>
                <StyledTableCell>
                  <Button
                    variant='contained'
                    onClick={() => onClickSeeSheet(row.sheet)}
                  >
                    Ver Ficha
                  </Button>
                </StyledTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Historic;
