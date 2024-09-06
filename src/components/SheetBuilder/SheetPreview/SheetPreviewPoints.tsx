import React from 'react';
import { useSelector } from 'react-redux';
import {
  selectPreviewMaxLifePoints,
  selectPreviewMaxManaPoints,
} from '@/store/slices/sheetBuilder/sheetBuilderSliceSheetPreview';
import { Box, useTheme } from '@mui/material';
import styled from '@emotion/styled';

import bigBox from '@/assets/images/bigBox.svg';
import bigBoxDark from '@/assets/images/bigBoxDark.svg';
import { useParams } from 'react-router';

const SheetPreviewPoints = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const params = useParams<{ id: string }>();
  const lifePoints = useSelector(selectPreviewMaxLifePoints(params.id));
  const manaPoints = useSelector(selectPreviewMaxManaPoints(params.id));

  const TextBox = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    width: 50%;
    &:first-of-type {
      border-right: 1px solid ${theme.palette.primary.main};
      padding-right: 10px;
    }
    &:last-child {
      padding-left: 10px;
    }
  `;

  return (
    <Box
      sx={{
        backgroundImage: `url(${isDark ? bigBoxDark : bigBox})`,
        backgroundPosition: 'center',
        backgroundSize: 'fill',
        backgroundRepeat: 'no-repeat',
        width: '100px',
        ml: 2,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 5,
        fontFamily: 'Tfont',
      }}
    >
      <TextBox>
        <Box
          sx={{
            fontSize: '50px',
            color: theme.palette.primary.main,
          }}
        >
          {lifePoints}
        </Box>
        <Box>PV</Box>
      </TextBox>
      <TextBox>
        <Box sx={{ fontSize: '50px', color: theme.palette.primary.main }}>
          {manaPoints}
        </Box>
        <Box>PM</Box>
      </TextBox>
    </Box>
  );
};

export default SheetPreviewPoints;
