import React from 'react';
import { Box, Stack } from '@mui/material';
import { AttributePreview } from './AttributePreview';
import AttributePreviewItem from './AttributePreviewItem';

type Props = {
  attributesPreview: AttributePreview[];
};

const AtrributesPreviewStatic = ({ attributesPreview }: Props) => (
  <Box>
    <h3 className='mb-3'>Atributos</h3>
    <Stack direction='row' spacing={2} justifyContent='center'>
      {attributesPreview.map(({ attribute, modifier, value }) => (
        <AttributePreviewItem
          key={attribute}
          attribute={attribute}
          value={value}
          modifier={modifier}
        />
      ))}
    </Stack>
  </Box>
);

export default AtrributesPreviewStatic;
