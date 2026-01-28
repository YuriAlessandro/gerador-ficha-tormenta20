import React from 'react';
import '../assets/css/result.css';
import { Box, Grid, Typography } from '@mui/material';
import { DiceRoll } from '@/interfaces/DiceRoll';
import { CharacterAttribute } from '../interfaces/Character';
import { SpellPath } from '../interfaces/Class';
import { Spell } from '../interfaces/Spells';
import SpellRow from './SpellRow';

interface SpellsProp {
  spells: Spell[];
  spellPath: SpellPath | undefined;
  keyAttr: CharacterAttribute | null;
  nivel: number;
  onUpdateRolls?: (spell: Spell, newRolls: DiceRoll[]) => void;
  characterName?: string;
}

const Spells: React.FC<SpellsProp> = (props) => {
  const { spells, spellPath, keyAttr, nivel, onUpdateRolls, characterName } =
    props;

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
            <strong>Atributo-Chave:</strong> {keyAttr?.name}
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
              <Grid size={3}>
                <span />
              </Grid>
              <Grid size={1}>
                <Typography sx={{ fontSize: 12, fontWeight: 'bold' }}>
                  Escola
                </Typography>
              </Grid>
              <Grid size={2}>
                <Typography sx={{ fontSize: 12, fontWeight: 'bold' }}>
                  Execução
                </Typography>
              </Grid>
              <Grid size={1}>
                <Typography sx={{ fontSize: 12, fontWeight: 'bold' }}>
                  Alcance
                </Typography>
              </Grid>
              <Grid size={2.5}>
                <Typography sx={{ fontSize: 12, fontWeight: 'bold' }}>
                  Alvo/Área
                </Typography>
              </Grid>
              <Grid size={2.5}>
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
                />
              ))}
          </Box>
        </Box>
      )}
    </div>
  );
};

export default Spells;
