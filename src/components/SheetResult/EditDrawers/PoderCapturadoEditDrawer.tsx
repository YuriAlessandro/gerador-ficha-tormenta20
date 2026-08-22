import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import CharacterSheet, {
  PoderCapturadoChoice,
} from '@/interfaces/CharacterSheet';
import Divindade from '@/interfaces/Divindade';
import { useContentSupplements } from '@/hooks/useContentSupplements';
import {
  CapturablePower,
  getCapturablePowers,
  getMajorDeities,
  getPoderCapturadoSlots,
} from '@/functions/powers/poderCapturado';

interface PoderCapturadoEditDrawerProps {
  open: boolean;
  onClose: () => void;
  sheet: CharacterSheet;
  onSave: (poderesCapturados: PoderCapturadoChoice[]) => void;
}

const UNAVAILABLE_LABEL: Record<
  NonNullable<CapturablePower['reason']>,
  string
> = {
  'class-exclusive':
    'Poder exclusivo de uma classe — a regra proíbe capturá-lo.',
  requirements: 'Você não cumpre os pré-requisitos deste poder.',
};

/**
 * Escolha dos pares deus maior + poder concedido do Poder Capturado
 * (Usurpador, 4º nível).
 *
 * Drawer próprio em vez de estender o `PowersEditor`: a seção de deus de lá
 * é acoplada a `sheet.devoto`, que o Usurpador por regra nunca tem.
 */
const PoderCapturadoEditDrawer: React.FC<PoderCapturadoEditDrawerProps> = ({
  open,
  onClose,
  sheet,
  onSave,
}) => {
  const supplements = useContentSupplements();

  const [choices, setChoices] = useState<PoderCapturadoChoice[]>([]);
  const [selectedDeity, setSelectedDeity] = useState<Divindade | null>(null);

  const deities = useMemo(() => getMajorDeities(supplements), [supplements]);
  const slots = getPoderCapturadoSlots(sheet);

  useEffect(() => {
    if (open) {
      setChoices([...(sheet.poderesCapturados ?? [])]);
      setSelectedDeity(null);
    }
  }, [open, sheet.poderesCapturados]);

  const capturablePowers = useMemo(
    () => (selectedDeity ? getCapturablePowers(sheet, selectedDeity) : []),
    [sheet, selectedDeity]
  );

  const isChosen = (divindade: string, poder: string): boolean =>
    choices.some((c) => c.divindade === divindade && c.poder === poder);

  const handleAdd = (deity: Divindade, powerName: string) => {
    if (isChosen(deity.name, powerName)) return;
    setChoices((prev) => [
      ...prev,
      { divindade: deity.name, poder: powerName, level: sheet.nivel },
    ]);
  };

  const handleRemove = (index: number) => {
    setChoices((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(choices);
    onClose();
  };

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: { xs: '100%', sm: 600 } } } }}
    >
      <Box
        sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}
      >
        <Stack
          direction='row'
          sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}
        >
          <Typography variant='h6'>Poder Capturado</Typography>
          <IconButton onClick={onClose} size='small'>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Typography variant='body2' sx={{ color: 'text.secondary', mb: 2 }}>
          Escolha um deus maior por nível e um poder concedido desse deus. Você
          não pode escolher poderes exclusivos de qualquer classe, inclusive
          clérigo. Depois, use o botão de ativar no poder para gastar uma hora e
          fazer o teste de Enganação.
        </Typography>

        <Stack direction='row' spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
          <Chip
            size='small'
            color={choices.length > slots ? 'warning' : 'default'}
            label={`${choices.length} de ${slots} escolhas`}
          />
        </Stack>

        {choices.length > slots && (
          <Alert severity='warning' sx={{ mb: 2 }}>
            Você tem mais escolhas do que o seu nível concede. O aviso é
            informativo — nada é removido automaticamente.
          </Alert>
        )}

        <Paper variant='outlined' sx={{ mb: 2 }}>
          {choices.length === 0 ? (
            <Typography
              variant='body2'
              sx={{ color: 'text.secondary', p: 2, textAlign: 'center' }}
            >
              Nenhum poder capturado ainda.
            </Typography>
          ) : (
            <List dense disablePadding>
              {choices.map((choice, index) => (
                <ListItem
                  key={`${choice.divindade}-${choice.poder}`}
                  divider={index < choices.length - 1}
                  secondaryAction={
                    <IconButton
                      edge='end'
                      size='small'
                      onClick={() => handleRemove(index)}
                    >
                      <DeleteOutlineIcon fontSize='small' />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={choice.poder}
                    secondary={`${choice.divindade} · escolhido no ${choice.level}º nível`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>

        <Divider sx={{ mb: 2 }} />

        <Autocomplete
          options={deities}
          value={selectedDeity}
          onChange={(_event, value) => setSelectedDeity(value)}
          getOptionLabel={(deity) => deity.name}
          isOptionEqualToValue={(a, b) => a.name === b.name}
          renderInput={(params) => (
            <TextField
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...params}
              label='Deus maior'
              size='small'
            />
          )}
          sx={{ mb: 2 }}
        />

        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {selectedDeity && capturablePowers.length === 0 && (
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              Este deus não tem poderes concedidos disponíveis.
            </Typography>
          )}
          <List dense disablePadding>
            {capturablePowers.map(({ power, available, reason }) => {
              const alreadyChosen =
                !!selectedDeity && isChosen(selectedDeity.name, power.name);
              const hasBonuses = (power.sheetBonuses ?? []).length > 0;
              const row = (
                <ListItemButton
                  disabled={!available || alreadyChosen}
                  onClick={() =>
                    selectedDeity && handleAdd(selectedDeity, power.name)
                  }
                >
                  <ListItemText
                    primary={
                      <Stack
                        direction='row'
                        spacing={1}
                        sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                      >
                        <span>{power.name}</span>
                        {alreadyChosen && (
                          <Chip
                            size='small'
                            color='primary'
                            label='Escolhido'
                          />
                        )}
                        {available && !hasBonuses && (
                          <Chip
                            size='small'
                            variant='outlined'
                            label='Narrativo'
                          />
                        )}
                      </Stack>
                    }
                    secondary={power.description}
                    slotProps={{ secondary: { variant: 'caption' } }}
                  />
                </ListItemButton>
              );

              return (
                <ListItem key={power.name} disablePadding>
                  {reason ? (
                    <Tooltip title={UNAVAILABLE_LABEL[reason]}>
                      <Box sx={{ width: '100%' }}>{row}</Box>
                    </Tooltip>
                  ) : (
                    row
                  )}
                </ListItem>
              );
            })}
          </List>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Alert severity='info' sx={{ mb: 2 }}>
          Poderes marcados como <strong>Narrativo</strong> não têm bônus
          automatizáveis: ativá-los serve como marcador de que você conta como
          devoto daquele deus.
        </Alert>

        <Stack direction='row' spacing={1} sx={{ justifyContent: 'flex-end' }}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant='contained' onClick={handleSave}>
            Salvar
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
};

export default PoderCapturadoEditDrawer;
