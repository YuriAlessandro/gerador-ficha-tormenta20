import React from 'react';
import '../assets/css/result.css';
import { Box, Grid, Typography } from '@mui/material';
import { CharacterAttribute } from '../interfaces/Character';
import { SpellPath } from '../interfaces/Class';
import { Spell } from '../interfaces/Spells';
import SpellRow from './SpellRow';

interface SpellsProp {
  spells: Spell[];
  spellPath: SpellPath | undefined;
  keyAttr: CharacterAttribute | null;
  nivel: number;
}

const Spells: React.FC<SpellsProp> = (props) => {
  const { spells, spellPath, keyAttr, nivel } = props;

  spells.sort((spell1, spell2) => {
    if (spell1.spellCircle < spell2.spellCircle) return -1;
    return 1;
  });

  const mod = keyAttr ? keyAttr.mod : 0;
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
            {`${mod > 0 ? '+' : ''}${keyAttr?.mod}`}
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
            <Grid container spacing={2} sx={{ fontSize: 12 }}>
              <Grid item xs={4}>
                <span />
              </Grid>
              <Grid item xs={2}>
                <Typography sx={{ ml: -0.5, fontSize: 12, fontWeight: 'bold' }}>
                  Escola
                </Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography sx={{ ml: -0.5, fontSize: 12, fontWeight: 'bold' }}>
                  Execução
                </Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography sx={{ ml: -0.5, fontSize: 12, fontWeight: 'bold' }}>
                  Alcance
                </Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography sx={{ ml: -0.5, fontSize: 12, fontWeight: 'bold' }}>
                  Resistência
                </Typography>
              </Grid>
            </Grid>
          )}
          <Box>
            {spells
              .sort((a, b) => a.nome.localeCompare(b.nome))
              .map((spell) => (
                <SpellRow key={spell.nome} spell={spell} />
              ))}
          </Box>
        </Box>
      )}
    </div>
  );
};

export default Spells;
