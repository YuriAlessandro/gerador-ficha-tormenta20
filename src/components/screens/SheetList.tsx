import React from 'react';
import tormenta20 from '@/assets/images/tormenta20.jpg';
import {
  SavedSheet,
  createNewSheet,
  removeSheet,
  selectStoredSheets,
} from '@/store/slices/sheetStorage/sheetStorage';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Stack,
  Typography,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import {
  BuildingSheet,
  SerializedSheetInterface,
  Translator,
} from 't20-sheet-builder';
import { v4 as uuid } from 'uuid';

const SheetList = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const sheetsOnStore = useSelector(selectStoredSheets);
  const sheets = Object.values(sheetsOnStore).filter(
    (sheet) => sheet.id !== ''
  );

  const onClickNewSheet = () => {
    const id = uuid();
    const sheet = new BuildingSheet();
    dispatch(createNewSheet({ id, sheet: sheet.serialize() }));
    history.push(`/sheet-builder/${id}/new`);
  };

  const onClickEditSheet = ({ id }: SavedSheet) => {
    history.push(`/sheet-builder/${id}`);
  };

  const getDescription = (sheet: SerializedSheetInterface) => {
    let text = '';
    if (sheet.race) {
      text = text.concat(Translator.getRaceTranslation(sheet.race.name));
    }
    if (sheet.role)
      text = text.concat(` ${Translator.getRoleTranslation(sheet.role.name)}`);
    if (sheet.origin)
      text = text.concat(
        `, ${Translator.getOriginTranslation(sheet.origin.name)}`
      );
    if (sheet.devotion && sheet.devotion.devotion)
      text = text.concat(
        `, Devoto de ${Translator.getTranslation(
          sheet.devotion.devotion?.deity.name
        )}`
      );
    return text;
  };

  const onClickDelete = (id: string) => {
    // eslint-disable-next-line no-restricted-globals, no-alert
    const confirmDelete = confirm(
      'Tem certeza que deseja apagar essa ficha? Isso não poderá ser desfeito.'
    );
    if (confirmDelete) {
      dispatch(removeSheet(id));
    }
  };

  return (
    <Box m={3}>
      <Button onClick={onClickNewSheet} variant='contained'>
        Criar nova ficha
      </Button>

      {(!sheets || sheets.length <= 0) && <p>Não possui fichas salvas!</p>}
      <Stack spacing={2} mt={2} direction='row' flexWrap='wrap' useFlexGap>
        {Object.values(sheets).map((sheet) => (
          <Card sx={{ width: 545 }} key={sheet.id}>
            <CardActionArea onClick={() => onClickEditSheet(sheet)}>
              <CardMedia
                sx={{ height: 140 }}
                image={sheet.image || tormenta20}
                title='green iguana'
              />
              <CardContent>
                <Typography
                  gutterBottom
                  variant='h5'
                  component='div'
                  fontFamily='Tfont'
                >
                  {sheet.name || 'Nova Ficha'}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {getDescription(sheet.sheet)}
                  <div>
                    <small>
                      Última modificação em{' '}
                      {`${new Date(sheet.date).toLocaleDateString('pt-BR')} `}
                      às
                      {` ${new Date(sheet.date).toLocaleTimeString('pt-BR')} (${
                        sheet.id
                      })`}
                    </small>
                  </div>
                </Typography>
              </CardContent>
            </CardActionArea>
            <CardActions>
              <Button
                size='small'
                onClick={() => onClickEditSheet(sheet)}
                color='success'
                variant='contained'
              >
                Editar
              </Button>
              <Button
                size='small'
                onClick={() => onClickDelete(sheet.id)}
                color='error'
                variant='outlined'
              >
                Remover
              </Button>
            </CardActions>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};

export default SheetList;
