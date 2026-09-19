import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Chip, Divider, Link, Typography } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  encyclopediaPath,
  ResolvedItem,
} from '../../../functions/pocketGrimoire/resolveItems';
import { GeneralPowerWithSupplement } from '../../../data/registry';
import { formatRequirement } from '../../../functions/requirementText';
import { explainTerm } from '../../../functions/pocketGrimoire/spellGlossary';
import { ItemPresentation, ItemStat, presentItem } from './itemPresentation';
import { STAT_META } from './statIcons';
import TermInfo from './TermInfo';

/** Estatísticas com ícone e, nos termos padronizados, a explicação ⓘ. */
const StatGrid: React.FC<{ stats: ItemStat[] }> = ({ stats }) => (
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
    {stats.map((stat) => {
      const { label, Icon } = STAT_META[stat.kind];
      const explanation = explainTerm(stat.kind, stat.value);
      return (
        <Box key={stat.kind}>
          <Typography
            variant='caption'
            sx={{
              color: 'text.secondary',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <Icon sx={{ fontSize: '0.9rem', color: 'primary.main' }} />
            {label}
          </Typography>
          <Typography
            variant='body2'
            component='div'
            sx={{ fontWeight: 500, display: 'flex', alignItems: 'center' }}
          >
            {stat.value}
            {explanation && (
              <TermInfo term={stat.value} explanation={explanation} />
            )}
          </Typography>
        </Box>
      );
    })}
  </Box>
);

const SpellDetails: React.FC<{ view: ItemPresentation }> = ({ view }) => (
  <>
    <Typography variant='caption' sx={{ color: 'text.secondary' }}>
      {view.circle}º círculo · {view.subtitle}
    </Typography>
    <StatGrid stats={view.stats} />
    <Typography variant='body2' sx={{ whiteSpace: 'pre-wrap' }}>
      {view.description}
    </Typography>
    {view.aprimoramentos.length > 0 && (
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
          {view.aprimoramentos.map((apr) => (
            <li key={`${apr.cost}-${apr.text.slice(0, 30)}`}>
              <Typography variant='body2' component='span'>
                <strong>{apr.cost}:</strong> {apr.text}
              </Typography>
            </li>
          ))}
        </Box>
      </>
    )}
  </>
);

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

/** Resumo de classe/raça/origem/divindade inteira, montado dos dados. */
const FactList: React.FC<{ view: ItemPresentation }> = ({ view }) => (
  <Box component='dl' sx={{ m: 0, mt: 1 }}>
    {view.facts.map((fact) => (
      <Box key={fact.label} sx={{ mb: 1 }}>
        <Typography
          component='dt'
          variant='caption'
          sx={{ color: 'primary.main', fontWeight: 700 }}
        >
          {fact.label}
        </Typography>
        <Typography component='dd' variant='body2' sx={{ m: 0 }}>
          {fact.value}
        </Typography>
      </Box>
    ))}
  </Box>
);

/**
 * Conteúdo completo de um item, sem moldura. Usado dentro do card
 * expansível (modo lista) e na carta ampliada (modo cartas).
 */
const GrimoireItemDetails: React.FC<{ item: ResolvedItem }> = ({ item }) => {
  if (item.kind === 'spell') return <SpellDetails view={presentItem(item)} />;
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
  const view = presentItem(item);
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
      {view.facts.length > 0 && <FactList view={view} />}
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
