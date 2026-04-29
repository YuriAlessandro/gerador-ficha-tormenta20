import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Alert,
  FormControlLabel,
  Radio,
  RadioGroup,
  Paper,
} from '@mui/material';
import { getSpellsOfCircle } from '@/data/systems/tormenta20/magias/generalSpells';
import { Spell } from '@/interfaces/Spells';

interface MoreauSapienciaSpellStepProps {
  selectedSpell: string | undefined;
  onChange: (spellName: string) => void;
}

const MoreauSapienciaSpellStep: React.FC<MoreauSapienciaSpellStepProps> = ({
  selectedSpell,
  onChange,
}) => {
  const divinationSpells = useMemo<Spell[]>(
    () => getSpellsOfCircle(1).filter((spell) => spell.school === 'Adiv'),
    []
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  const selected = divinationSpells.find((s) => s.nome === selectedSpell);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant='body1' color='text.secondary'>
        Escolha uma magia de 1º círculo da escola de Adivinhação. O
        atributo-chave dessa magia será Sabedoria.
      </Typography>

      <RadioGroup value={selectedSpell || ''} onChange={handleChange}>
        {divinationSpells.map((spell) => (
          <Paper key={spell.nome} sx={{ p: 2, mb: 1 }}>
            <FormControlLabel
              value={spell.nome}
              control={<Radio />}
              label={
                <Box>
                  <Typography variant='subtitle1' fontWeight='bold'>
                    {spell.nome}
                  </Typography>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    display='block'
                    sx={{ mb: 0.5 }}
                  >
                    Execução: {spell.execucao} | Alcance: {spell.alcance} |
                    Duração: {spell.duracao}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {spell.description}
                  </Typography>
                </Box>
              }
            />
          </Paper>
        ))}
      </RadioGroup>

      {selected && (
        <Alert severity='info'>
          Você escolheu <strong>{selected.nome}</strong>. Ela entrará na ficha
          com Sabedoria como atributo-chave.
        </Alert>
      )}
    </Box>
  );
};

export default MoreauSapienciaSpellStep;
