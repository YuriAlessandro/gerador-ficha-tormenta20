import React, { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { styled, Stack } from '@mui/material';
import { HistoricI } from '../../interfaces/Historic';
import CharacterSheet from '../../interfaces/CharacterSheet';

const Historic: React.FC<{
  isDarkTheme: boolean;
  onClickSeeSheet: (sheet: CharacterSheet) => void;
}> = ({ isDarkTheme, onClickSeeSheet }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sheetToDelete, setSheetToDelete] = useState<HistoricI | null>(null);
  const [historicData, setHistoricData] = useState<HistoricI[]>(() => {
    const lsHistoric = localStorage.getItem('fdnHistoric');
    const data = lsHistoric ? JSON.parse(lsHistoric) : [];
    data.reverse();
    return data;
  });

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

  const handleDeleteClick = (row: HistoricI) => {
    setSheetToDelete(row);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (sheetToDelete) {
      // Remove from historic
      const newHistoric = historicData.filter(
        (item) => item.id !== sheetToDelete.id
      );

      // Save to localStorage (need to reverse back since we reversed when loading)
      const toSave = [...newHistoric].reverse();
      localStorage.setItem('fdnHistoric', JSON.stringify(toSave));

      // Update state
      setHistoricData(newHistoric);
    }
    setDeleteDialogOpen(false);
    setSheetToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSheetToDelete(null);
  };

  return (
    <>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
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
            {historicData.map((row) => (
              <TableRow key={row.id}>
                <StyledTableCell component='th' scope='row'>
                  {row.date}
                </StyledTableCell>
                <StyledTableCell>{row.sheet.nome}</StyledTableCell>
                <StyledTableCell>{row.sheet.raca.name}</StyledTableCell>
                <StyledTableCell>{row.sheet.classe.name}</StyledTableCell>
                <StyledTableCell>{row.sheet.nivel}</StyledTableCell>
                <StyledTableCell>
                  <Stack direction='row' spacing={1}>
                    <Button
                      variant='contained'
                      onClick={() => onClickSeeSheet(row.sheet)}
                    >
                      Ver Ficha
                    </Button>
                    <IconButton
                      color='error'
                      onClick={() => handleDeleteClick(row)}
                      size='small'
                      title='Remover do histórico'
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </StyledTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>Confirmar Remoção</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            Tem certeza que deseja remover a ficha de{' '}
            {sheetToDelete?.sheet.nome} do histórico? Esta ação não pode ser
            desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color='primary'>
            Cancelar
          </Button>
          <Button onClick={handleDeleteConfirm} color='error' autoFocus>
            Remover
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Historic;
