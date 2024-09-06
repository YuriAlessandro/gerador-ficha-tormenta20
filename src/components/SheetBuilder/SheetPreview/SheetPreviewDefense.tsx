import React, { useState } from 'react';
import { useParams } from 'react-router';
import { useSelector } from 'react-redux';
import {
  selectPreviewAttributes,
  selectPreviewDefense,
} from '@/store/slices/sheetBuilder/sheetBuilderSliceSheetPreview';
import { Translator } from 't20-sheet-builder';
import styled from '@emotion/styled';
import { Box, Dialog, DialogTitle, Stack, useTheme } from '@mui/material';
import SheetPreviewItem from './SheetPreviewValueItem';
import FancyBox from '../common/FancyBox';

const SheetPreviewDefense = () => {
  const [open, setOpen] = useState(false);
  const params = useParams<{ id: string }>();

  const onClick = () => {
    setOpen(!open);
  };

  const attributes = useSelector(selectPreviewAttributes(params.id));
  const defense = useSelector(selectPreviewDefense(params.id));

  const theme = useTheme();

  const DefenseTitle = styled.h4`
    font-family: 'Tfont';
    position: relative;
  `;

  const DefenseLabel = styled.div`
    font-family: 'Tfont';
    text-align: center;
    width: 100%;
    font-size: 50px;
    color: ${theme.palette.primary.main};
    margin-bottom: -20px;
  `;

  return (
    <Box>
      <FancyBox onClick={onClick}>
        <Box>
          <DefenseLabel>{defense.total}</DefenseLabel>
          <DefenseTitle>Defesa</DefenseTitle>
        </Box>
      </FancyBox>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle id='alert-dialog-title'>Detalhes da Defesa</DialogTitle>
        <Stack direction='row' alignItems='center' sx={{ p: 5 }}>
          <Box sx={{ fontSize: '50px', mr: 1 }}>{defense.total}</Box>
          <Box>=</Box>
          <Box
            sx={{
              width: '500px',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 5,
              fontFamily: 'Tfont',
            }}
          >
            <div>10</div>
            <SheetPreviewItem
              label={Translator.getAttributeTranslation(defense.attribute)}
              value={attributes[defense.attribute]}
            />
            {defense.fixedModifiers.modifiers.map((modifier) => (
              <Box key={`${modifier.source}-${modifier.type}`}>
                <SheetPreviewItem
                  label={Translator.getTranslation(modifier.source)}
                  value={modifier.baseValue}
                />
              </Box>
            ))}
            <Box>
              <SheetPreviewItem label='Armadura' value={0} />
            </Box>
            <Box>
              <SheetPreviewItem label='Escudo' value={0} />
            </Box>
            <Box>
              <SheetPreviewItem label='Outros' value={0} />
            </Box>
          </Box>
        </Stack>
      </Dialog>
    </Box>
  );
};

export default SheetPreviewDefense;
