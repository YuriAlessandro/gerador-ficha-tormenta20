import React from 'react';
import {
  selectStoredSheets,
  setActiveSheet,
  setSheet,
} from '@/store/slices/sheetStorage/sheetStorage';
import { v4 as uuid } from 'uuid';
import { Box, Button, Card } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import {
  BuildingSheet,
  OutOfGameContext,
  SheetSerializer,
} from 't20-sheet-builder';
import { useHistory } from 'react-router';

const SheetList = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const sheets = useSelector(selectStoredSheets);

  const onClickNewSheet = () => {
    const id = uuid();

    const sheet = new BuildingSheet();
    const serializer = new SheetSerializer(new OutOfGameContext());

    dispatch(
      setSheet({
        id,
        sheet: serializer.serialize(sheet),
        name: '',
        date: new Date().getTime(),
        image: '',
      })
    );

    dispatch(setActiveSheet(id));

    history.push(`/sheet-builder`);
  };

  return (
    <Box m={3}>
      <Card>
        <Button onClick={onClickNewSheet} variant='contained'>
          Criar nova ficha
        </Button>
        <ul>{!sheets && <p>Não possui fichas salvas!</p>}</ul>
        {Object.values(sheets).map((sheet) => (
          <p>
            {sheet.id} - {sheet.date} - {sheet.name}
          </p>
        ))}
      </Card>
    </Box>
  );
};

export default SheetList;
