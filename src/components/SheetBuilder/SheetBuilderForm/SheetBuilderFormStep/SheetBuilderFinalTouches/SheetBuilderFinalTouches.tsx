/* eslint-disable react/jsx-props-no-spreading */
import { useParams } from 'react-router';
import { selectPreviewRaceName } from '@/store/slices/sheetBuilder/sheetBuilderSliceSheetPreview';
import { setOptionReady } from '@/store/slices/sheetBuilder/sheetBuilderSliceStepConfirmed';
import {
  selectPreviewImage,
  selectPreviewName,
  setDetails,
} from '@/store/slices/sheetBuilder/sheetBuilderSliceStepDetails';
import { Autocomplete, Button, Stack, TextField } from '@mui/material';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { nameSuggestions } from './nameSuggestions';

const SheetBuilderFinalTouches: React.FC<{ onFinishBuild: () => void }> = ({
  onFinishBuild,
}) => {
  const { id } = useParams<{ id: string }>();
  const savedName = useSelector(selectPreviewName(id));
  const savedImage = useSelector(selectPreviewImage(id));

  const [name, setName] = React.useState(savedName);
  const [image, setImage] = React.useState(savedImage);
  const dispatch = useDispatch();

  const raceName = useSelector(selectPreviewRaceName(id));

  const onChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setOptionReady({ key: 'isFinalTouchesReady', value: 'pending' }));
    setName(event.target.value);
  };

  const onSelectName = (
    event: React.SyntheticEvent,
    newValue: string | null
  ) => {
    dispatch(setOptionReady({ key: 'isFinalTouchesReady', value: 'pending' }));
    if (newValue) setName(newValue);
  };

  const onChangeImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setOptionReady({ key: 'isFinalTouchesReady', value: 'pending' }));
    setImage(event.target.value);
  };

  const onBlur = () => {
    dispatch(
      setOptionReady({ key: 'isFinalTouchesReady', value: 'confirmed' })
    );
    dispatch(
      setDetails({
        name,
        image,
      })
    );
  };

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
            defaultValue={name}
            onChange={onSelectName}
            onBlur={onBlur}
            renderInput={(params) => (
              <TextField
                {...params}
                label='Nome do Personagem'
                variant='outlined'
                fullWidth
                value={name}
                onChange={onChangeName}
                onBlur={onBlur}
              />
            )}
          />
        </Stack>
        <TextField
          value={image}
          label='URL para imagem do personagem'
          variant='outlined'
          onChange={onChangeImage}
          onBlur={onBlur}
        />
        <Button variant='contained' onClick={onFinishBuild}>
          Ver ficha
        </Button>
      </Stack>
    </div>
  );
};

export default SheetBuilderFinalTouches;
