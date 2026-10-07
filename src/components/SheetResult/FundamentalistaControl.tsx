import React, { useState } from 'react';
import {
  Box,
  FormControlLabel,
  IconButton,
  MenuItem,
  Popover,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CharacterSheet from '@/interfaces/CharacterSheet';
import { DogmaFundamentalista } from '@/interfaces/Character';
import { useFundamentalistAvailable } from '@/hooks/useFundamentalist';
import {
  DOGMA_LABELS,
  formatDogmaPages,
  FUNDAMENTALIST_VIOLATION_TEXT,
  getAvailableDogmas,
  getDogma,
  getDogmaFallbackNotice,
  getDogmaHeritageNote,
  getFundamentalistNotices,
  getPreferredWeaponRule,
  getSheetFundamentalista,
  isDivineClass,
  isFundamentalistBlocked,
  isFundamentalistEligibleDeity,
  resolveDogmaForClass,
} from '@/functions/powers/fundamentalista';

interface FundamentalistaControlProps {
  sheet: CharacterSheet;
  /** Ausente = somente leitura (ficha de outra pessoa, mesa). */
  onChange?: (next: CharacterSheet) => void;
}

/**
 * Marca de Fundamentalista (Deuses de Arton, p. 11) no cabeçalho da ficha.
 * O personagem pode se tornar ou deixar de ser fundamentalista a qualquer
 * momento — é estado, não escolha de criação. O ⓘ abre um popover por
 * CLIQUE (tooltip não abre por toque e não comporta dogma longo).
 */
const FundamentalistaControl: React.FC<FundamentalistaControlProps> = ({
  sheet,
  onChange,
}) => {
  const available = useFundamentalistAvailable();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const { devoto } = sheet;
  const dogma = getSheetFundamentalista(sheet);
  if (!devoto || devoto.divindadeSecundaria) return null;
  const deityName = devoto.divindade.name;
  if (!isFundamentalistEligibleDeity(deityName)) return null;
  if (!available && !dogma) return null;
  if (!onChange && !dogma) return null;

  const shownDogma = dogma ?? resolveDogmaForClass(sheet.classe, deityName);
  const info = getDogma(deityName, shownDogma);
  const heritageNote = getDogmaHeritageNote(info);
  const weaponRule = getPreferredWeaponRule(deityName);
  const fallbackNotice = getDogmaFallbackNotice(sheet.classe, deityName);
  const notices = [
    ...(fallbackNotice ? [fallbackNotice] : []),
    ...getFundamentalistNotices(deityName, shownDogma, sheet.raca?.name),
  ];
  // Restrição de raça do livro: não liga; uma ficha já marcada (raça trocada
  // depois) ainda pode desligar.
  const blocked = isFundamentalistBlocked(
    deityName,
    shownDogma,
    sheet.raca?.name
  );
  const canChooseDogma = !!onChange && !!dogma && !isDivineClass(sheet.classe);

  const setFundamentalista = (next: DogmaFundamentalista | undefined) => {
    if (!onChange) return;
    const rest = { ...devoto };
    delete rest.fundamentalista;
    onChange({
      ...sheet,
      devoto: next ? { ...rest, fundamentalista: { dogma: next } } : rest,
    });
  };

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25 }}>
      <FormControlLabel
        sx={{ m: 0 }}
        control={
          <Switch
            size='small'
            checked={!!dogma}
            disabled={!onChange || (blocked && !dogma)}
            onChange={(_e, checked) =>
              setFundamentalista(
                checked
                  ? resolveDogmaForClass(sheet.classe, deityName)
                  : undefined
              )
            }
          />
        }
        label={
          <Typography variant='caption' sx={{ color: 'text.secondary' }}>
            Fundamentalista
          </Typography>
        }
      />
      <IconButton
        size='small'
        aria-label='Sobre o dogma fundamentalista'
        onClick={(e) => setAnchor(e.currentTarget)}
      >
        <InfoOutlinedIcon fontSize='inherit' />
      </IconButton>
      <Popover
        open={!!anchor}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{ paper: { sx: { p: 2, maxWidth: 320 } } }}
      >
        <Typography variant='subtitle2' sx={{ mb: 1 }}>
          Fundamentalista de {deityName}
        </Typography>
        {canChooseDogma && (
          <TextField
            select
            size='small'
            fullWidth
            sx={{ mb: 1 }}
            label='Dogma seguido'
            value={shownDogma}
            onChange={(e) =>
              setFundamentalista(e.target.value as DogmaFundamentalista)
            }
          >
            {getAvailableDogmas(deityName).map((option) => (
              <MenuItem key={option} value={option}>
                {DOGMA_LABELS[option]}
              </MenuItem>
            ))}
          </TextField>
        )}
        {heritageNote && (
          <Typography
            variant='caption'
            sx={{ display: 'block', color: 'text.secondary' }}
          >
            {heritageNote}
          </Typography>
        )}
        {info && (
          <Typography variant='body2' sx={{ mb: 1 }}>
            {info.texto}
          </Typography>
        )}
        {weaponRule && (
          <Typography variant='caption' sx={{ display: 'block', mb: 0.5 }}>
            {weaponRule}
          </Typography>
        )}
        <Typography variant='caption' sx={{ display: 'block', mb: 0.5 }}>
          {FUNDAMENTALIST_VIOLATION_TEXT}
        </Typography>
        <Typography variant='caption' sx={{ display: 'block', mb: 0.5 }}>
          Também concede +1 poder concedido.
        </Typography>
        {notices.map((notice) => (
          <Typography
            key={notice}
            variant='caption'
            sx={{ display: 'block', mb: 0.5, color: 'warning.main' }}
          >
            {notice}
          </Typography>
        ))}
        {info && (
          <Typography
            variant='caption'
            sx={{ display: 'block', color: 'text.secondary' }}
          >
            Deuses de Arton, {formatDogmaPages(info.paginas)}.
          </Typography>
        )}
      </Popover>
    </Box>
  );
};

export default FundamentalistaControl;
