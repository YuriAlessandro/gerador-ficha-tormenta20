import { SavedSheet } from '@/store/slices/sheetBuilder/sheetBuilderMiddleware';
import { Box, Card } from '@mui/material';
import React from 'react';

const ls = window.localStorage;

const SheetList = () => {
  const lsSheets = ls.getItem('savedSheets');
  const sheets: SavedSheet[] = lsSheets ? JSON.parse(lsSheets) : null;

  return (
    <Box m={3}>
      <Card>
        <ul>
          {!sheets && <p>Não possui fichas salvas.</p>}
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
