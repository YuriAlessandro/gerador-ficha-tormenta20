import React from 'react';
import { Box, Chip, Divider, Typography } from '@mui/material';
import GrimoireCardShell from './GrimoireCardShell';
import { GrimoireSpell } from '../../../functions/pocketGrimoire/resolveItems';

interface Props {
  spell: GrimoireSpell;
  defaultOpen: boolean;
  onRemove: () => void;
}

const GrimoireSpellCard: React.FC<Props> = ({
  spell,
  defaultOpen,
  onRemove,
}) => {
  const stats = [
    { label: 'Execução', value: spell.execucao },
    { label: 'Alcance', value: spell.alcance },
    { label: 'Alvo', value: spell.alvo },
    { label: 'Área', value: spell.area },
    { label: 'Duração', value: spell.duracao },
    { label: 'Resistência', value: spell.resistencia },
  ].filter((stat) => stat.value);

  return (
    <GrimoireCardShell
      title={spell.nome}
      summary={`${spell.school} · ${spell.execucao} · ${spell.alcance}`}
      chips={spell.spellTypes.map((type) => (
        <Chip
          key={type}
          label={type}
          size='small'
          variant='outlined'
          color={type === 'Arcana' ? 'primary' : 'secondary'}
          sx={{ height: 20, fontSize: '0.7rem' }}
        />
      ))}
      defaultOpen={defaultOpen}
      onRemove={onRemove}
    >
      <Typography variant='caption' sx={{ color: 'text.secondary' }}>
        {spell.circle}º círculo · {spell.school}
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)' },
          gap: 1,
          my: 1.5,
          p: 1.5,
          borderRadius: 1,
          bgcolor: 'action.hover',
        }}
      >
        {stats.map((stat) => (
          <Box key={stat.label}>
            <Typography
              variant='caption'
              sx={{ color: 'text.secondary', display: 'block' }}
            >
              {stat.label}
            </Typography>
            <Typography variant='body2' sx={{ fontWeight: 500 }}>
              {stat.value}
            </Typography>
          </Box>
        ))}
      </Box>
      <Typography variant='body2' sx={{ whiteSpace: 'pre-wrap' }}>
        {spell.description}
      </Typography>
      {spell.aprimoramentos && spell.aprimoramentos.length > 0 && (
        <>
          <Divider sx={{ my: 1.5 }} />
          <Typography
            variant='subtitle2'
            color='primary'
            sx={{ fontFamily: 'Tfont, serif' }}
          >
            Aprimoramentos
          </Typography>
          <Box component='ul' sx={{ pl: 2, my: 0.5 }}>
            {spell.aprimoramentos.map((apr) => (
              <li key={`${apr.addPm}-${apr.text.slice(0, 30)}`}>
                <Typography variant='body2' component='span'>
                  <strong>{apr.trick ? 'TRUQUE' : `+${apr.addPm} PM`}:</strong>{' '}
                  {apr.text}
                </Typography>
              </li>
            ))}
          </Box>
        </>
      )}
    </GrimoireCardShell>
  );
};

export default GrimoireSpellCard;
