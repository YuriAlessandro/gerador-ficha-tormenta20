import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import GrimoireCardShell from './GrimoireCardShell';
import { GeneralPowerWithSupplement } from '../../../data/registry';
import { EncyclopediaEntry } from '../../../functions/encyclopediaSearch';
import { formatRequirement } from '../../../functions/requirementText';

interface Props {
  entry: EncyclopediaEntry;
  power: GeneralPowerWithSupplement;
  defaultOpen: boolean;
  onRemove: () => void;
}

const GrimoirePowerCard: React.FC<Props> = ({
  entry,
  power,
  defaultOpen,
  onRemove,
}) => {
  const requirementGroups = power.requirements.filter(
    (group) => group.length > 0
  );

  return (
    <GrimoireCardShell
      title={power.name}
      summary={entry.subtitle}
      defaultOpen={defaultOpen}
      onRemove={onRemove}
    >
      {entry.subtitle && (
        <Typography variant='caption' sx={{ color: 'text.secondary' }}>
          {entry.subtitle}
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
    </GrimoireCardShell>
  );
};

export default GrimoirePowerCard;
