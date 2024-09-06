import { useSelector } from 'react-redux';
import React from 'react';
import { useParams } from 'react-router';
import { selectPreviewAttributes } from '@/store/slices/sheetBuilder/sheetBuilderSliceSheetPreview';
import { Stack } from '@mui/material';
import SheetPreviewAttributes from './SheetPreviewAttributes';

const SheetPreviewStats = () => {
  const params = useParams<{ id: string }>();
  const attributes = useSelector(selectPreviewAttributes(params.id));

  return (
    <Stack justifyContent='space-around' direction='row' flexWrap='wrap'>
      <SheetPreviewAttributes attributes={attributes} />
    </Stack>
  );
};

export default SheetPreviewStats;
