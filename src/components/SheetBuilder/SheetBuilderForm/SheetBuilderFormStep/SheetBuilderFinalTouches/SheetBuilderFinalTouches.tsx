/* eslint-disable react/jsx-props-no-spreading */
import { selectPreviewRaceName } from '@/store/slices/sheetBuilder/sheetBuilderSliceSheetPreview';
import { setOptionReady } from '@/store/slices/sheetBuilder/sheetBuilderSliceStepConfirmed';
import { setDetails } from '@/store/slices/sheetBuilder/sheetBuilderSliceStepDetails';
import { Autocomplete, Button, Stack, TextField } from '@mui/material';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { nameSuggestions } from './nameSuggestions';

const SheetBuilderFinalTouches: React.FC<{ onFinishBuild: () => void }> = ({
  onFinishBuild,
}) => {
  const [name, setName] = React.useState('');
  const [image, setImage] = React.useState('');
  const dispatch = useDispatch();

  const raceName = useSelector(selectPreviewRaceName);

  useEffect(() => {
    dispatch(
      setOptionReady({ key: 'isFinalTouchesReady', value: 'confirmed' })
    );
    dispatch(
      setDetails({
        name,
        url: image,
      })
    );
  }, [name, image]);

  const getNameSuggestion = () =>
    raceName ? nameSuggestions[raceName].sort() : [];

  return (
    <div>
      <Stack spacing={2}>
        <Stack>
          <Autocomplete
            id='free-solo-demo'
            freeSolo
            fullWidth
            options={getNameSuggestion()}
            onChange={(event: React.SyntheticEvent, newValue: string | null) =>
              newValue ? setName(newValue) : null
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label='Nome do Personagem'
                variant='outlined'
                fullWidth
                value={name}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setName(event.target.value);
                }}
              />
            )}
          />
        </Stack>
        <TextField
          value={image}
          label='URL para imagem do personagem'
          variant='outlined'
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setImage(event.target.value);
          }}
        />
        <Button variant='contained' onClick={onFinishBuild}>
          Ver ficha
        </Button>
      </Stack>
    </div>
  );
};

export default SheetBuilderFinalTouches;
