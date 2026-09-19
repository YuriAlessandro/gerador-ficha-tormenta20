import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Chip, Divider, Link, Typography } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  encyclopediaPath,
  GrimoireSpell,
  ResolvedItem,
} from '../../../functions/pocketGrimoire/resolveItems';
import { GeneralPowerWithSupplement } from '../../../data/registry';
import { formatRequirement } from '../../../functions/requirementText';

const SpellDetails: React.FC<{ spell: GrimoireSpell }> = ({ spell }) => {
  const stats = [
    { label: 'Execução', value: spell.execucao },
    { label: 'Alcance', value: spell.alcance },
    { label: 'Alvo', value: spell.alvo },
    { label: 'Área', value: spell.area },
    { label: 'Duração', value: spell.duracao },
    { label: 'Resistência', value: spell.resistencia },
  ].filter((stat) => stat.value);

  return (
    <>
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
    </>
  );
};

const PowerDetails: React.FC<{
  subtitle?: string;
  power: GeneralPowerWithSupplement;
}> = ({ subtitle, power }) => {
  const requirementGroups = power.requirements.filter(
    (group) => group.length > 0
  );
  return (
    <>
      {subtitle && (
        <Typography variant='caption' sx={{ color: 'text.secondary' }}>
          {subtitle}
        </Typography>
      )}
      <Typography variant='body2' sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>
        {power.description}
      </Typography>
      {requirementGroups.length > 0 && (
        <Box sx={{ mt: 1.5 }}>
          <Typography
            variant='subtitle2'
            color='primary'
            sx={{ fontFamily: 'Tfont, serif' }}
          >
            Pré-requisitos
          </Typography>
          {requirementGroups.map((group, index) => (
            <Box
              key={group.map((req) => formatRequirement(req)).join('|')}
              sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}
            >
              {index > 0 && (
                <Typography
                  variant='caption'
                  sx={{ fontStyle: 'italic', mr: 1 }}
                >
                  ou
                </Typography>
              )}
              {group.map((req) => (
                <Chip
                  key={formatRequirement(req)}
                  label={formatRequirement(req)}
                  size='small'
                  variant='outlined'
                  sx={{ m: 0.25 }}
                />
              ))}
            </Box>
          ))}
        </Box>
      )}
    </>
  );
};

/**
 * Conteúdo completo de um item, sem moldura. Usado dentro do card
 * expansível (modo lista) e na carta ampliada (modo cartas).
 */
const GrimoireItemDetails: React.FC<{ item: ResolvedItem }> = ({ item }) => {
  if (item.kind === 'spell') return <SpellDetails spell={item.spell} />;
  if (item.kind === 'power') {
    return <PowerDetails subtitle={item.entry.subtitle} power={item.power} />;
  }
  if (item.kind === 'missing') {
    return (
      <Typography variant='body2' sx={{ color: 'text.secondary' }}>
        {item.name} não existe mais na enciclopédia.
      </Typography>
    );
  }
  const { entry } = item;
  return (
    <>
      {entry.subtitle && (
        <Typography variant='caption' sx={{ color: 'text.secondary' }}>
          {entry.subtitle}
        </Typography>
      )}
      {entry.description && (
        <Typography variant='body2' sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>
          {entry.description}
        </Typography>
      )}
      {item.kind === 'summary' && (
        <Link
          component={RouterLink}
          to={encyclopediaPath(entry)}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            mt: 1,
          }}
        >
          Ver na enciclopédia
          <OpenInNewIcon fontSize='inherit' />
        </Link>
      )}
    </>
  );
};

export default GrimoireItemDetails;
