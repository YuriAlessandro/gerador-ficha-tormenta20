import React from 'react';
import {
  SavedSheet,
  removeSheet,
  selectStoredSheets,
  setActiveSheet,
  setSheet,
} from '@/store/slices/sheetStorage/sheetStorage';
import { v4 as uuid } from 'uuid';
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
import {
  BuildingSheet,
  OutOfGameContext,
  SerializedSheetInterface,
  SheetSerializer,
  Translator,
} from 't20-sheet-builder';
import { useHistory } from 'react-router';
import {
  resetAttributes,
  setAttribute,
} from '@/store/slices/sheetBuilder/sheetBuilderSliceInitialAttributes';
import {
  resetRace,
  submitRace,
} from '@/store/slices/sheetBuilder/sheetBuilderSliceRaceDefinition';
import {
  resetRole,
  // submitRole,
} from '@/store/slices/sheetBuilder/sheetBuilderSliceRoleDefinition';
import {
  resetOrigin,
  // submitOrigin,
} from '@/store/slices/sheetBuilder/sheetBuilderSliceOriginDefinition';
import { resetEquipment } from '@/store/slices/sheetBuilder/sheetBuilderSliceInitialEquipment';
import {
  resetDevotion,
  // submitDevotion,
} from '@/store/slices/sheetBuilder/sheetBuilderSliceDevotionDefinition';
import { resetInteligenceSkills } from '@/store/slices/sheetBuilder/sheetBuilderSliceIntelligenceSkills';
import {
  resetDetails,
  setDetails,
} from '@/store/slices/sheetBuilder/sheetBuilderSliceStepDetails';
import { resetOptionsReady } from '@/store/slices/sheetBuilder/sheetBuilderSliceStepConfirmed';
import { updatePreview } from '@/store/slices/sheetBuilder/sheetBuilderSliceSheetPreview';
import tormenta20 from '@/assets/images/tormenta20.jpg';

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

    // Set current state o sheet to initial state
    dispatch(resetAttributes());
    dispatch(resetRace());
    dispatch(resetRole());
    dispatch(resetOrigin());
    dispatch(resetEquipment());
    dispatch(resetDevotion());
    dispatch(resetInteligenceSkills());
    dispatch(resetDetails());
    dispatch(resetOptionsReady());

    dispatch(setActiveSheet(id));

    // history.push(`/sheet-builder/${id}`);
  };

  const onClickEditSheet = (sheet: SavedSheet) => {
    const { id, sheet: savedSheet } = sheet;

    // const serializer = new SheetSerializer(new OutOfGameContext());

    dispatch(
      setSheet({
        id,
        sheet: savedSheet,
        name: sheet.name,
        date: new Date().getTime(),
        image: sheet.image,
      })
    );

    // Set current state o sheet to initial state
    dispatch(
      setAttribute({
        attribute: 'charisma',
        value: savedSheet.attributes.charisma,
      })
    );
    dispatch(
      setAttribute({
        attribute: 'constitution',
        value: savedSheet.attributes.constitution,
      })
    );
    dispatch(
      setAttribute({
        attribute: 'dexterity',
        value: savedSheet.attributes.dexterity,
      })
    );
    dispatch(
      setAttribute({
        attribute: 'intelligence',
        value: savedSheet.attributes.intelligence,
      })
    );
    dispatch(
      setAttribute({
        attribute: 'strength',
        value: savedSheet.attributes.strength,
      })
    );
    dispatch(
      setAttribute({
        attribute: 'wisdom',
        value: savedSheet.attributes.wisdom,
      })
    );

    dispatch(updatePreview(savedSheet));
    if (savedSheet.race) dispatch(submitRace(savedSheet.race));
    // if (savedSheet.role) dispatch(submitRole(savedSheet.role));
    // if (savedSheet.origin) dispatch(submitOrigin(savedSheet.origin));
    // if (savedSheet.devotion) dispatch(submitDevotion(savedSheet.devotion));
    // TODO: Inteligence Skills
    // TODO: Initial Equipment

    dispatch(setDetails({ name: sheet.name, url: sheet.image }));

    dispatch(resetOptionsReady());
    dispatch(setActiveSheet(id));

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
