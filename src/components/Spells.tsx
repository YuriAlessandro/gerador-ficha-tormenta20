import React from 'react';
import '../assets/css/result.css';
import {
  Box,
  Chip,
  Grid,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import { DiceRoll } from '@/interfaces/DiceRoll';
import { Atributo } from '@/data/systems/tormenta20/atributos';
import { CharacterAttribute } from '../interfaces/Character';
import { SpellPath } from '../interfaces/Class';
import { Spell } from '../interfaces/Spells';
import SpellRow from './SpellRow';

const SPELL_KEY_ATTRIBUTES = [
  Atributo.INTELIGENCIA,
  Atributo.SABEDORIA,
  Atributo.CARISMA,
];

interface SpellsProp {
  spells: Spell[];
  spellPath: SpellPath | undefined;
  keyAttr: CharacterAttribute | null;
  nivel: number;
  onUpdateRolls?: (spell: Spell, newRolls: DiceRoll[]) => void;
  characterName?: string;
  currentPM?: number;
  maxPM?: number;
  onSpellCast?: (pmSpent: number) => void;
  isMago?: boolean;
  onToggleMemorized?: (spell: Spell) => void;
  onKeyAttributeChange?: (newAttr: Atributo) => void;
}

const Spells: React.FC<SpellsProp> = (props) => {
  const {
    spells,
    spellPath,
    keyAttr,
    nivel,
    onUpdateRolls,
    characterName,
    currentPM,
    maxPM,
    onSpellCast,
    isMago,
    onToggleMemorized,
    onKeyAttributeChange,
  } = props;

  spells.sort((spell1, spell2) => {
    if (spell1.spellCircle < spell2.spellCircle) return -1;
    return 1;
  });

  const mod = keyAttr ? keyAttr.value : 0;
  const resistence = 10 + Math.floor(nivel * 0.5) + mod;

  const isMobile = window.innerWidth < 720;

  return (
    <div>
      {spells.length > 0 && spellPath && (
        <div className='speelsInfos'>
          <span>
            <strong>Atributo-Chave:</strong>{' '}
            {onKeyAttributeChange && spellPath ? (
              <Select
                value={spellPath.keyAttribute}
                onChange={(e: SelectChangeEvent) =>
                  onKeyAttributeChange(e.target.value as Atributo)
                }
                size='small'
                variant='standard'
                sx={{ fontSize: 'inherit', minWidth: 100 }}
              >
                {SPELL_KEY_ATTRIBUTES.map((attr) => (
                  <MenuItem key={attr} value={attr}>
                    {attr}
                  </MenuItem>
                ))}
              </Select>
            ) : (
              keyAttr?.name
            )}
          </span>
          <span>
            <strong>Modificador:</strong>{' '}
            {`${mod > 0 ? '+' : ''}${keyAttr?.value}`}
          </span>
          <span>
            <strong>Teste de Resistência:</strong> {resistence}
            <span className='spellCalc'>
              {` (10 + ¹/₂ nível + atributo-chave)`}
            </span>
          </span>
        </div>
      )}
      {isMago && spells.length > 0 && (
        <Box sx={{ mb: 1 }}>
          <Chip
            label={`Magias memorizadas: ${
              spells.filter((s) => s.memorized).length
            } / ${Math.ceil(spells.length / 2)}`}
            color={
              spells.filter((s) => s.memorized).length >
              Math.ceil(spells.length / 2)
                ? 'error'
                : 'primary'
            }
            size='small'
            variant='outlined'
          />
        </Box>
      )}
      {spells.length === 0 ? (
        <span>Não Possui</span>
      ) : (
        <Box>
          {!isMobile && (
            <Grid
              container
              spacing={2}
              sx={{
                fontSize: 12,
                px: 2,
                py: 1,
              }}
            >
              <Grid size={2.5}>
                <span />
              </Grid>
              <Grid size={1}>
                <Typography sx={{ fontSize: 12, fontWeight: 'bold' }}>
                  Escola
                </Typography>
              </Grid>
              <Grid size={1.5}>
                <Typography sx={{ fontSize: 12, fontWeight: 'bold' }}>
                  Execução
                </Typography>
              </Grid>
              <Grid size={1}>
                <Typography sx={{ fontSize: 12, fontWeight: 'bold' }}>
                  Alcance
                </Typography>
              </Grid>
              <Grid size={2}>
                <Typography sx={{ fontSize: 12, fontWeight: 'bold' }}>
                  Alvo/Área
                </Typography>
              </Grid>
              <Grid size={2}>
                <Typography sx={{ fontSize: 12, fontWeight: 'bold' }}>
                  Duração
                </Typography>
              </Grid>
              <Grid size={2}>
                <Typography sx={{ fontSize: 12, fontWeight: 'bold' }}>
                  Resistência
                </Typography>
              </Grid>
            </Grid>
          )}
          <Box>
            {spells
              .sort((a, b) => a.nome.localeCompare(b.nome))
              .map((spell) => (
                <SpellRow
                  key={spell.nome}
                  spell={spell}
                  onUpdateRolls={onUpdateRolls}
                  characterName={characterName}
                  currentPM={currentPM}
                  maxPM={maxPM}
                  onSpellCast={onSpellCast}
                  isMago={isMago}
                  onToggleMemorized={onToggleMemorized}
                />
              ))}
          </Box>
        </Box>
      )}
    </div>
  );
};

export default Spells;
