import { useSelector } from 'react-redux';
import React from 'react';
import { selectPreviewAttributes } from '@/store/slices/sheetBuilder/sheetBuilderSliceSheetPreview';
import { Stack } from '@mui/material';
import SheetPreviewAttributes from './SheetPreviewAttributes';

const SheetPreviewStats = () => {
  const attributes = useSelector(selectPreviewAttributes);

  if (!attributes) {
    return null;
  }

  return (
    <Stack
      direction='row'
      sx={{
        justifyContent: 'space-around',
        flexWrap: 'wrap',
      }}
    >
      <SheetPreviewAttributes attributes={attributes} />
    </Stack>
  );
};

export default SheetPreviewStats;
