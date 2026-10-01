import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import CharacterSheet from '@/interfaces/CharacterSheet';
import { EngenhocaData, Spell } from '@/interfaces/Spells';
import {
  APARATOS,
  Aparato,
  MAX_APARATOS_PER_ENGENHOCA,
} from '@/data/systems/tormenta20/herois-de-arton/aparatos';
import {
  getEngenhocaActivationBaseDC,
  getEngenhocaAparatos,
  getEngenhocaResistDC,
  getInventorLevel,
  getMaxEngenhocaCircle,
  isEngenhocaCircleAboveLimit,
} from '@/functions/spells/engenhoca';

interface EngenhocaDialogProps {
  open: boolean;
  onClose: () => void;
  spell: Spell;
  sheet: CharacterSheet;
  bonusSpellDC: number;
  /** Heróis de Arton ativo: mostra a seção de aparatos. */
  showAparatos: boolean;
  /** `undefined` = a magia deixa de ser engenhoca. */
  onSave: (engenhoca: EngenhocaData | undefined) => void;
}

/**
 * Configura a engenhoca de uma magia: nome da invenção, forma (empunhada ou
 * vestida), aparatos (Heróis de Arton) e se está enguiçada. `spell.nome` fica
 * intocado — o nome da invenção é só exibição.
 */
const EngenhocaDialog: React.FC<EngenhocaDialogProps> = ({
  open,
  onClose,
  spell,
  sheet,
  bonusSpellDC,
  showAparatos,
  onSave,
}) => {
  const isMobile = window.innerWidth <= 768;

  const [enabled, setEnabled] = useState(!!spell.engenhoca);
  const [nome, setNome] = useState(spell.engenhoca?.nome ?? '');
  const [forma, setForma] = useState<EngenhocaData['forma']>(
    spell.engenhoca?.forma ?? 'empunhada'
  );
  const [aparatos, setAparatos] = useState<Aparato[]>(
    getEngenhocaAparatos(spell.engenhoca)
  );
  const [enguicada, setEnguicada] = useState(!!spell.engenhoca?.enguicada);

  useEffect(() => {
    if (!open) return;
    setEnabled(!!spell.engenhoca);
    setNome(spell.engenhoca?.nome ?? '');
    setForma(spell.engenhoca?.forma ?? 'empunhada');
    setAparatos(getEngenhocaAparatos(spell.engenhoca));
    setEnguicada(!!spell.engenhoca?.enguicada);
  }, [open, spell]);

  const draft = useMemo<EngenhocaData>(() => {
    const data: EngenhocaData = { forma };
    const trimmed = nome.trim();
    if (trimmed) data.nome = trimmed;
    if (aparatos.length > 0) data.aparatos = aparatos.map((a) => a.id);
    if (enguicada) data.enguicada = true;
    return data;
  }, [nome, forma, aparatos, enguicada]);

  const draftSpell = useMemo<Spell>(
    () => ({ ...spell, engenhoca: draft }),
    [spell, draft]
  );

  const activationDC = getEngenhocaActivationBaseDC(sheet, draftSpell);
  const resistDC = getEngenhocaResistDC(sheet, draftSpell, bonusSpellDC);
  const circleAboveLimit = isEngenhocaCircleAboveLimit(sheet, spell);
  const maxCircle = getMaxEngenhocaCircle(getInventorLevel(sheet));

  const missingRequirements = aparatos
    .filter((a) => a.requires && !aparatos.some((b) => b.id === a.requires))
    .map((a) => {
      const required = APARATOS.find((b) => b.id === a.requires);
      return `${a.nome} exige ${required?.nome ?? a.requires}.`;
    });

  const handleSave = () => {
    onSave(enabled ? draft : undefined);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle>Engenhoca — {spell.nome}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <FormControlLabel
            control={
              <Switch
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
              />
            }
            label='Esta magia é uma engenhoca'
          />

          {enabled && (
            <>
              {circleAboveLimit && (
                <Alert severity='warning'>
                  No seu nível de inventor você só fabrica engenhocas de até{' '}
                  {maxCircle}º círculo.
                </Alert>
              )}

              <TextField
                label='Nome da engenhoca'
                placeholder={`Ex.: Canhão de vapor (simula ${spell.nome})`}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                helperText='Vazio usa o nome da magia.'
                fullWidth
                slotProps={{ htmlInput: { maxLength: 60 } }}
              />

              <Box>
                <Typography variant='subtitle2' sx={{ mb: 0.5 }}>
                  Forma
                </Typography>
                <ToggleButtonGroup
                  exclusive
                  size='small'
                  value={forma}
                  onChange={(_, value) => value && setForma(value)}
                >
                  <ToggleButton value='empunhada'>Empunhada</ToggleButton>
                  <ToggleButton value='vestida'>Vestida</ToggleButton>
                </ToggleButtonGroup>
                <Typography
                  variant='caption'
                  sx={{ display: 'block', color: 'text.secondary', mt: 0.5 }}
                >
                  {forma === 'vestida'
                    ? 'Precisa estar vestida para ser ativada e conta no limite de itens vestidos.'
                    : 'Precisa estar em sua mão para ser ativada.'}
                </Typography>
              </Box>

              {showAparatos && (
                <Box>
                  <Autocomplete
                    multiple
                    options={APARATOS}
                    value={aparatos}
                    onChange={(_, value) =>
                      setAparatos(value.slice(0, MAX_APARATOS_PER_ENGENHOCA))
                    }
                    getOptionLabel={(option) => option.nome}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    getOptionDisabled={(option) =>
                      aparatos.length >= MAX_APARATOS_PER_ENGENHOCA &&
                      !aparatos.some((a) => a.id === option.id)
                    }
                    renderOption={(props, option) => (
                      // eslint-disable-next-line react/jsx-props-no-spreading
                      <Box component='li' {...props} key={option.id}>
                        <Box>
                          <Typography variant='body2'>
                            {option.nome}{' '}
                            <Typography
                              component='span'
                              variant='caption'
                              sx={{ color: 'text.secondary' }}
                            >
                              T$ {option.preco.toLocaleString('pt-BR')}
                            </Typography>
                          </Typography>
                          {option.restriction && (
                            <Typography
                              variant='caption'
                              sx={{ color: 'text.secondary' }}
                            >
                              {option.restriction}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    )}
                    renderInput={(params) => (
                      <TextField
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...params}
                        label='Aparatos (até 2)'
                        helperText='Um aparato soma +2 na CD de ativação; dois somam +5.'
                      />
                    )}
                  />
                  {missingRequirements.map((message) => (
                    <Alert key={message} severity='warning' sx={{ mt: 1 }}>
                      {message}
                    </Alert>
                  ))}
                  {aparatos.map((aparato) => (
                    <Box
                      key={aparato.id}
                      sx={{
                        mt: 1,
                        p: 1,
                        borderRadius: 1,
                        bgcolor: 'action.hover',
                      }}
                    >
                      <Typography variant='body2' sx={{ fontWeight: 700 }}>
                        {aparato.nome}
                      </Typography>
                      <Typography variant='caption'>
                        {aparato.descricao}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}

              <FormControlLabel
                control={
                  <Checkbox
                    checked={enguicada}
                    onChange={(e) => setEnguicada(e.target.checked)}
                  />
                }
                label='Enguiçada (precisa de 1 hora de conserto)'
              />

              <Stack direction='row' sx={{ gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  color='primary'
                  label={`CD de ativação ${activationDC} + aprimoramentos`}
                />
                <Chip
                  variant='outlined'
                  label={`CD para resistir ${resistDC} (Int)`}
                />
              </Stack>
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant='contained'
          onClick={handleSave}
          // Desligado numa magia que já não era engenhoca: nada a salvar.
          disabled={!enabled && !spell.engenhoca}
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EngenhocaDialog;
