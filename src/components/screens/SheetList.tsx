import {
  selectStoredSheets,
  setActiveSheet,
} from '@/store/slices/sheetStorage/sheetStorage';
import { v4 as uuid } from 'uuid';
import { Box, Button, Card } from '@mui/material';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

const SheetList = () => {
  const dispatch = useDispatch();

  const sheets = useSelector(selectStoredSheets);

  const onClickNewSheet = () => {
    const id = uuid();
    dispatch(setActiveSheet(id));
  };

  return (
    <Box m={3}>
      <Card>
        <Button onClick={onClickNewSheet} variant='contained'>
          Criar nova ficha
        </Button>
        <ul>
          {!sheets && <p>Não possui fichas salvas!</p>}
          {sheets &&
            sheets.map((sheet) => (
              <li key={sheet.id}>
                {sheet.id}/{sheet.name ? sheet.name : 'SEM_NOME'}
              </li>
            ))}
        </ul>
      </Card>
    </Box>
  );
};

export default SheetList;
