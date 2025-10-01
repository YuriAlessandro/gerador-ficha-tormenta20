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
  Container,
  Chip,
} from '@mui/material';
import {
  Storage as StorageIcon,
  CloudOff as CloudOffIcon,
} from '@mui/icons-material';
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
} from '@/store/slices/sheetStorage/sheetStorage';
import { useAlert, useConfirm } from '../../hooks/useDialog';

const SheetList = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { showAlert, AlertDialog } = useAlert();
  const { showConfirm, ConfirmDialog } = useConfirm();

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
      <Container maxWidth='lg' sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box
            display='flex'
            justifyContent='space-between'
            alignItems='center'
            flexWrap='wrap'
            gap={2}
            mb={2}
          >
            <Box>
              <Typography
                variant='h3'
                component='h1'
                sx={{
                  fontFamily: 'Tfont',
                  fontWeight: 'bold',
                  fontSize: { xs: '2rem', md: '3rem' },
                  color: 'primary.main',
                }}
              >
                Histórico Local
              </Typography>
              <Box display='flex' alignItems='center' gap={1} mt={1}>
                <StorageIcon color='action' fontSize='small' />
                <Typography variant='body2' color='text.secondary'>
                  Salvo no navegador
                </Typography>
                <Chip
                  icon={<CloudOffIcon />}
                  label='Offline'
                  size='small'
                  variant='outlined'
                  sx={{ ml: 1 }}
                />
              </Box>
            </Box>

            <Button onClick={onClickNewSheet} variant='contained'>
              Criar nova ficha
            </Button>
          </Box>

          {sheets.length > 0 && (
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              {sheets.length}{' '}
              {sheets.length === 1 ? 'personagem' : 'personagens'} salvo
              localmente
            </Typography>
          )}
        </Box>

        {(!sheets || sheets.length <= 0) && (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              px: 2,
            }}
          >
            <StorageIcon
              sx={{
                fontSize: { xs: 80, md: 120 },
                color: 'text.secondary',
                mb: 2,
              }}
            />
            <Typography
              variant='h5'
              sx={{
                mb: 2,
                color: 'text.primary',
              }}
            >
              Nenhuma ficha salva localmente
            </Typography>
            <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
              As fichas salvas localmente ficam armazenadas apenas neste
              navegador.
            </Typography>
            <Button variant='contained' onClick={onClickNewSheet}>
              Criar Primeira Ficha
            </Button>
          </Box>
        )}
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
      </Container>
    </>
  );
};

export default SheetList;
