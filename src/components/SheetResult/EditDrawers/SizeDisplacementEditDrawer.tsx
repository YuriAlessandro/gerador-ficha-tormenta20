import React, { useEffect, useMemo, useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Stack,
  IconButton,
  Divider,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RestoreIcon from '@mui/icons-material/Restore';
import CharacterSheet, { MovementTypes } from '@/interfaces/CharacterSheet';
import { RaceSize, raceSize } from '@/interfaces/Race';
import { recalculateSheet } from '@/functions/recalculateSheet';
import {
  getRaceSize,
  getRaceDisplacement,
} from '@/data/systems/tormenta20/races/functions/functions';
import { RACE_SIZES } from '@/data/systems/tormenta20/races/raceSizes/raceSizes';

interface SizeDisplacementEditDrawerProps {
  open: boolean;
  onClose: () => void;
  sheet: CharacterSheet;
  onSave: (updates: Partial<CharacterSheet> | CharacterSheet) => void;
}

interface EditedData {
  displacementStr: string;
  useCustomDisplacement: boolean;
  selectedSizeKey: raceSize | '';
  useCustomSize: boolean;
  escaladaStr: string;
  escavarStr: string;
  natacaoStr: string;
  vooStr: string;
  pairar: boolean;
}

const findSizeKey = (size: RaceSize): raceSize | '' => {
  const entry = Object.entries(RACE_SIZES).find(
    ([_key, val]) => val.name === size.name
  );
  return entry ? (entry[0] as raceSize) : '';
};

const buildInitialEditedData = (sheet: CharacterSheet): EditedData => ({
  displacementStr: String(sheet.customDisplacement ?? sheet.displacement),
  useCustomDisplacement: sheet.customDisplacement !== undefined,
  selectedSizeKey: findSizeKey(sheet.customSize ?? sheet.size),
  useCustomSize: sheet.customSize !== undefined,
  escaladaStr: String(sheet.movementTypes?.escalada ?? ''),
  escavarStr: String(sheet.movementTypes?.escavar ?? ''),
  natacaoStr: String(sheet.movementTypes?.natacao ?? ''),
  vooStr: String(sheet.movementTypes?.voo ?? ''),
  pairar: sheet.movementTypes?.pairar ?? false,
});

const SizeDisplacementEditDrawer: React.FC<SizeDisplacementEditDrawerProps> = ({
  open,
  onClose,
  sheet,
  onSave,
}) => {
  const raceDefaultSize = useMemo(() => getRaceSize(sheet.raca), [sheet.raca]);
  const raceDefaultDisplacement = useMemo(
    () => getRaceDisplacement(sheet.raca),
    [sheet.raca]
  );

  const autoDisplacement = useMemo(() => {
    const baseDisplacementBonuses = sheet.sheetBonuses
      .filter((bonus) => bonus.target.type === 'Displacement')
      .reduce((acc, bonus) => {
        if (bonus.modifier.type === 'Fixed') {
          return acc + (bonus.modifier.value || 0);
        }
        return acc;
      }, 0);
    return raceDefaultDisplacement + baseDisplacementBonuses;
  }, [sheet.sheetBonuses, raceDefaultDisplacement]);

  const defaultSizeKey = useMemo(
    () => findSizeKey(raceDefaultSize),
    [raceDefaultSize]
  );

  const [editedData, setEditedData] = useState<EditedData>(
    buildInitialEditedData(sheet)
  );

  useEffect(() => {
    if (open) {
      setEditedData(buildInitialEditedData(sheet));
    }
  }, [
    open,
    sheet.customDisplacement,
    sheet.customSize,
    sheet.displacement,
    sheet.size,
    sheet.movementTypes,
  ]);

  const buildMovementTypes = (): MovementTypes | undefined => {
    const escalada = Number(editedData.escaladaStr) || 0;
    const escavar = Number(editedData.escavarStr) || 0;
    const natacao = Number(editedData.natacaoStr) || 0;
    const voo = Number(editedData.vooStr) || 0;
    const pairar = voo > 0 && editedData.pairar;

    if (escalada <= 0 && escavar <= 0 && natacao <= 0 && voo <= 0) {
      return undefined;
    }

    const result: MovementTypes = {};
    if (escalada > 0) result.escalada = escalada;
    if (escavar > 0) result.escavar = escavar;
    if (natacao > 0) result.natacao = natacao;
    if (voo > 0) result.voo = voo;
    if (pairar) result.pairar = true;
    return result;
  };

  const handleSave = () => {
    const customDisplacement = editedData.useCustomDisplacement
      ? Number(editedData.displacementStr) || 0
      : undefined;

    let customSize: RaceSize | undefined;
    let newSize = raceDefaultSize;

    if (
      editedData.useCustomSize &&
      editedData.selectedSizeKey &&
      editedData.selectedSizeKey !== defaultSizeKey
    ) {
      customSize = RACE_SIZES[editedData.selectedSizeKey];
      newSize = customSize;
    }

    const updates: Partial<CharacterSheet> = {
      customDisplacement,
      customSize,
      size: newSize,
      movementTypes: buildMovementTypes(),
    };

    const updatedSheet = { ...sheet, ...updates };
    const recalculatedSheet = recalculateSheet(updatedSheet, sheet);
    onSave(recalculatedSheet);
    onClose();
  };

  const handleCancel = () => {
    setEditedData(buildInitialEditedData(sheet));
    onClose();
  };

  const handleRestoreDisplacement = () => {
    setEditedData({
      ...editedData,
      displacementStr: String(autoDisplacement),
      useCustomDisplacement: false,
    });
  };

  const handleRestoreSize = () => {
    setEditedData({
      ...editedData,
      selectedSizeKey: defaultSizeKey,
      useCustomSize: false,
    });
  };

  const previewDisplacement = editedData.useCustomDisplacement
    ? Number(editedData.displacementStr) || 0
    : autoDisplacement;

  const previewSize =
    editedData.useCustomSize && editedData.selectedSizeKey
      ? RACE_SIZES[editedData.selectedSizeKey]
      : raceDefaultSize;

  const previewEscalada = Number(editedData.escaladaStr) || 0;
  const previewEscavar = Number(editedData.escavarStr) || 0;
  const previewNatacao = Number(editedData.natacaoStr) || 0;
  const previewVoo = Number(editedData.vooStr) || 0;
  const hasSecondaryMovement =
    previewEscalada > 0 ||
    previewEscavar > 0 ||
    previewNatacao > 0 ||
    previewVoo > 0;

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={handleCancel}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 450 } },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Stack
          direction='row'
          justifyContent='space-between'
          alignItems='center'
          mb={2}
        >
          <Typography variant='h6'>Editar Deslocamento e Tamanho</Typography>
          <IconButton onClick={handleCancel} size='small'>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        <Stack spacing={3}>
          {/* Deslocamento */}
          <Typography variant='subtitle2' sx={{ fontWeight: 'bold' }}>
            Deslocamento
          </Typography>

          <TextField
            fullWidth
            label='Terrestre (metros)'
            type='number'
            value={editedData.displacementStr}
            onChange={(e) => {
              setEditedData({
                ...editedData,
                displacementStr: e.target.value,
                useCustomDisplacement: true,
              });
            }}
            helperText={`Valor automático: ${autoDisplacement}m (${Math.floor(
              autoDisplacement / 1.5
            )}q)`}
            inputProps={{ min: 0, max: 100 }}
          />

          {editedData.useCustomDisplacement && (
            <Button
              variant='text'
              size='small'
              startIcon={<RestoreIcon />}
              onClick={handleRestoreDisplacement}
              sx={{ alignSelf: 'flex-start' }}
            >
              Restaurar valor automático
            </Button>
          )}

          <Divider />

          {/* Outros Deslocamentos */}
          <Typography variant='subtitle2' sx={{ fontWeight: 'bold' }}>
            Outros Deslocamentos
          </Typography>

          <TextField
            fullWidth
            label='Escalada (metros)'
            type='number'
            value={editedData.escaladaStr}
            onChange={(e) =>
              setEditedData({ ...editedData, escaladaStr: e.target.value })
            }
            inputProps={{ min: 0, max: 100 }}
          />

          <TextField
            fullWidth
            label='Escavar (metros)'
            type='number'
            value={editedData.escavarStr}
            onChange={(e) =>
              setEditedData({ ...editedData, escavarStr: e.target.value })
            }
            inputProps={{ min: 0, max: 100 }}
          />

          <TextField
            fullWidth
            label='Natação (metros)'
            type='number'
            value={editedData.natacaoStr}
            onChange={(e) =>
              setEditedData({ ...editedData, natacaoStr: e.target.value })
            }
            inputProps={{ min: 0, max: 100 }}
          />

          <TextField
            fullWidth
            label='Voo (metros)'
            type='number'
            value={editedData.vooStr}
            onChange={(e) =>
              setEditedData({
                ...editedData,
                vooStr: e.target.value,
                pairar: Number(e.target.value) > 0 ? editedData.pairar : false,
              })
            }
            inputProps={{ min: 0, max: 100 }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={editedData.pairar}
                onChange={(e) =>
                  setEditedData({ ...editedData, pairar: e.target.checked })
                }
                disabled={Number(editedData.vooStr) <= 0}
              />
            }
            label='Pairar'
          />

          <Divider />

          {/* Tamanho */}
          <Typography variant='subtitle2' sx={{ fontWeight: 'bold' }}>
            Tamanho
          </Typography>

          <FormControl fullWidth>
            <InputLabel>Tamanho</InputLabel>
            <Select
              value={editedData.selectedSizeKey}
              onChange={(e) => {
                const selectedKey = e.target.value as raceSize;
                setEditedData({
                  ...editedData,
                  selectedSizeKey: selectedKey,
                  useCustomSize: selectedKey !== defaultSizeKey,
                });
              }}
              label='Tamanho'
            >
              {Object.entries(RACE_SIZES).map(([key, sizeValue]) => (
                <MenuItem key={key} value={key}>
                  {sizeValue.name}
                  {key === defaultSizeKey && ' (Padrão da raça)'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {previewSize && (
            <Typography variant='caption' color='text.secondary'>
              Modificadores: Furtividade{' '}
              {previewSize.modifiers.stealth >= 0 ? '+' : ''}
              {previewSize.modifiers.stealth}, Manobra{' '}
              {previewSize.modifiers.maneuver >= 0 ? '+' : ''}
              {previewSize.modifiers.maneuver}
            </Typography>
          )}

          {editedData.useCustomSize && (
            <Button
              variant='text'
              size='small'
              startIcon={<RestoreIcon />}
              onClick={handleRestoreSize}
              sx={{ alignSelf: 'flex-start' }}
            >
              Restaurar tamanho da raça
            </Button>
          )}

          {/* Preview */}
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: 'background.default',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 'bold' }}>
              Preview
            </Typography>

            <Stack spacing={0.5}>
              <Typography variant='body2'>
                Terrestre: {previewDisplacement}m (
                {Math.floor(previewDisplacement / 1.5)}q)
                {editedData.useCustomDisplacement && ' (manual)'}
              </Typography>
              {previewEscalada > 0 && (
                <Typography variant='body2'>
                  Escalada: {previewEscalada}m (
                  {Math.floor(previewEscalada / 1.5)}q)
                </Typography>
              )}
              {previewEscavar > 0 && (
                <Typography variant='body2'>
                  Escavar: {previewEscavar}m ({Math.floor(previewEscavar / 1.5)}
                  q)
                </Typography>
              )}
              {previewNatacao > 0 && (
                <Typography variant='body2'>
                  Natação: {previewNatacao}m ({Math.floor(previewNatacao / 1.5)}
                  q)
                </Typography>
              )}
              {previewVoo > 0 && (
                <Typography variant='body2'>
                  Voo: {previewVoo}m ({Math.floor(previewVoo / 1.5)}q)
                  {editedData.pairar && ' (Pairar)'}
                </Typography>
              )}
              {!hasSecondaryMovement && (
                <Typography variant='body2' color='text.secondary'>
                  Nenhum deslocamento secundário
                </Typography>
              )}
              <Typography variant='body2'>
                Tamanho: {previewSize?.name ?? 'Médio'} (
                {previewSize?.name.charAt(0) ?? 'M'})
                {editedData.useCustomSize && ' (manual)'}
              </Typography>
            </Stack>
          </Box>

          {/* Buttons */}
          <Stack direction='row' spacing={2} sx={{ mt: 3 }}>
            <Button variant='outlined' onClick={handleCancel} fullWidth>
              Cancelar
            </Button>
            <Button variant='contained' onClick={handleSave} fullWidth>
              Salvar
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Drawer>
  );
};

export default SizeDisplacementEditDrawer;
