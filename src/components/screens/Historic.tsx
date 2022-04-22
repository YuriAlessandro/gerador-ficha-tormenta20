import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import React from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';
import { HistoricI } from '../../interfaces/Historic';
import CharacterSheet from '../../interfaces/CharacterSheet';

const useStyles = makeStyles(() => ({
  button: {
    background: 'rgb(209, 50, 53);',
    color: '#FAFAFA',
    marginBottom: '10px',
  },
}));

const Historic: React.FC<{
  isDarkTheme: boolean;
  onClickSeeSheet: (sheet: CharacterSheet) => void;
}> = ({ isDarkTheme, onClickSeeSheet }) => {
  const StyledTableCell = withStyles(() => ({
    head: {
      backgroundColor: 'rgb(209, 50, 53)',
      color: '#FFF',
    },
    body: {
      fontSize: 14,
      backgroundColor: isDarkTheme ? '#212121' : '#FFF',
      color: isDarkTheme ? '#FFF' : '#000',
    },
  }))(TableCell);

  const classes = useStyles();

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
                    className={classes.button}
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
