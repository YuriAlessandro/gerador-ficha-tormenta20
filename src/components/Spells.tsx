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
import { Spell, spellsCircles } from '../interfaces/Spells';
import SpellRow from './SpellRow';

const SPELL_KEY_ATTRIBUTES = [
  Atributo.INTELIGENCIA,
  Atributo.SABEDORIA,
  Atributo.CARISMA,
];

interface SpellsProp {
  spells: Spell[];
  keyAttr: CharacterAttribute | null;
  selectedKeyAttribute: Atributo;
  nivel: number;
  onUpdateRolls?: (spell: Spell, newRolls: DiceRoll[]) => void;
  characterName?: string;
  currentPM?: number;
  maxPM?: number;
  tempPM?: number;
  onSpellCast?: (pmSpent: number) => void;
  isMago?: boolean;
  onToggleMemorized?: (spell: Spell) => void;
  onToggleAlwaysPrepared?: (spell: Spell) => void;
  onKeyAttributeChange?: (newAttr: Atributo) => void;
  bonusSpellDC?: number;
}

const Spells: React.FC<SpellsProp> = (props) => {
  const {
    spells,
    keyAttr,
    selectedKeyAttribute,
    nivel,
    onUpdateRolls,
    characterName,
    currentPM,
    maxPM,
    tempPM,
    onSpellCast,
    isMago,
    onToggleMemorized,
    onToggleAlwaysPrepared,
    onKeyAttributeChange,
    bonusSpellDC,
  } = props;

  const circleOrder = Object.values(spellsCircles);

  const spellsByCircle = circleOrder.reduce((groups, circle) => {
    const circleSpells = spells
      .filter((s) => s.spellCircle === circle)
      .sort((a, b) => a.nome.localeCompare(b.nome));
    if (circleSpells.length > 0) {
      groups.push({ circle, spells: circleSpells });
    }
    return groups;
  }, [] as { circle: spellsCircles; spells: Spell[] }[]);

  const mod = keyAttr ? keyAttr.value : 0;
  const bonus = bonusSpellDC || 0;
  const resistence = 10 + Math.floor(nivel * 0.5) + mod + bonus;

  const isMobile = window.innerWidth < 720;

  return (
    <div>
      {spells.length > 0 && (
        <div className='speelsInfos'>
          <span>
            <strong>Atributo-Chave:</strong>{' '}
            {onKeyAttributeChange ? (
              <Select
                value={selectedKeyAttribute}
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
              {` (10 + ¹/₂ nível + atributo-chave${
                bonus ? ` + ${bonus} bônus` : ''
              })`}
            </span>
          </span>
        </div>
      )}
      {isMago &&
        spells.length > 0 &&
        (() => {
          const preparableSpells = spells.filter((s) => !s.alwaysPrepared);
          const alwaysPreparedCount = spells.filter(
            (s) => s.alwaysPrepared
          ).length;
          const memorizedCount = preparableSpells.filter(
            (s) => s.memorized
          ).length;
          const memorizedLimit = Math.floor(preparableSpells.length / 2);
          return (
            <Box sx={{ mb: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={`Magias memorizadas: ${memorizedCount} / ${memorizedLimit}`}
                color={memorizedCount > memorizedLimit ? 'error' : 'primary'}
                size='small'
                variant='outlined'
              />
              {alwaysPreparedCount > 0 && (
                <Chip
                  label={`Sempre preparadas: ${alwaysPreparedCount}`}
                  color='warning'
                  size='small'
                  variant='outlined'
                />
              )}
            </Box>
          );
        })()}
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
            {spellsByCircle.map((group) => (
              <Box key={group.circle}>
                <Typography
                  variant='subtitle1'
                  sx={{
                    fontWeight: 'bold',
                    mt: 2,
                    mb: 1,
                    px: 1,
                    color: 'text.secondary',
                  }}
                >
                  {group.circle}
                </Typography>
                {group.spells.map((spell) => (
                  <SpellRow
                    key={spell.nome}
                    spell={spell}
                    onUpdateRolls={onUpdateRolls}
                    characterName={characterName}
                    currentPM={currentPM}
                    maxPM={maxPM}
                    tempPM={tempPM}
                    onSpellCast={onSpellCast}
                    isMago={isMago}
                    onToggleMemorized={onToggleMemorized}
                    onToggleAlwaysPrepared={onToggleAlwaysPrepared}
                  />
                ))}
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </div>
  );
};

export default Spells;
