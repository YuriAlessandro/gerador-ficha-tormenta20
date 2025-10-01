import React from 'react';
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
import tormenta20 from '@/assets/images/tormenta20.jpg';
import {
  SavedSheet,
  createNewSheet,
  removeSheet,
  selectStoredSheets,
  selectSheetsCount,
  selectCanCreateNewSheet,
  MAX_CHARACTERS_LIMIT,
} from '@/store/slices/sheetStorage/sheetStorage';
import CharacterLimitIndicator from '../CharacterLimitIndicator';
import { useAlert, useConfirm } from '../../hooks/useDialog';

const SheetList = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { showAlert, AlertDialog } = useAlert();
  const { showConfirm, ConfirmDialog } = useConfirm();

  const sheetsOnStore = useSelector(selectStoredSheets);
  const sheetsCount = useSelector(selectSheetsCount);
  const canCreateNewSheet = useSelector(selectCanCreateNewSheet);
  const sheets = Object.values(sheetsOnStore).filter(
    (sheet) => sheet.id !== ''
  );

  const onClickNewSheet = () => {
    if (!canCreateNewSheet) {
      showAlert(
        `Você atingiu o limite máximo de ${MAX_CHARACTERS_LIMIT} personagens salvos. Remova uma ficha para criar uma nova.`,
        'Limite Atingido'
      );
      return;
    }

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

  const onClickDelete = async (id: string) => {
    const confirmDelete = await showConfirm(
      'Tem certeza que deseja apagar essa ficha? Isso não poderá ser desfeito.',
      'Confirmar Exclusão',
      'Excluir',
      'Cancelar'
    );
    if (confirmDelete) {
      dispatch(removeSheet(id));
    }
  };

  return (
    <>
      <AlertDialog />
      <ConfirmDialog />
      <Box m={3}>
        <Stack direction='row' spacing={2} alignItems='center' mb={2}>
          <Button
            onClick={onClickNewSheet}
            variant='contained'
            disabled={!canCreateNewSheet}
          >
            Criar nova ficha
          </Button>
          <CharacterLimitIndicator
            current={sheetsCount}
            max={MAX_CHARACTERS_LIMIT}
          />
          <Typography variant='body2' color='text.secondary'>
            {sheetsCount} de {MAX_CHARACTERS_LIMIT} personagens
          </Typography>
        </Stack>

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
                        {` ${new Date(sheet.date).toLocaleTimeString(
                          'pt-BR'
                        )} (${sheet.id})`}
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
    </>
  );
};

export default SheetList;
