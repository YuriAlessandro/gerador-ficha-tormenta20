import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { formatRequirement } from '../../functions/requirementText';
import { SupplementId } from '../../types/supplement.types';
import AddToGrimoireButton from '../PocketGrimoire/AddToGrimoireButton';
import CopyUrlButton from '../Database/CopyUrlButton';
import DatabaseCard from '../Database/DatabaseCard';
import {
  TACTICAL_SUBCATEGORY_LABELS,
  UnifiedPowerItem,
} from './powersFilters';

interface PowerCardProps {
  power: UnifiedPowerItem;
  highlighted?: boolean;
}

const PowerCard: React.FC<PowerCardProps> = ({ power, highlighted = false }) => {
  const actions = (
    <>
      <AddToGrimoireButton itemId={power.grimoireItemId} itemName={power.name} />
      <CopyUrlButton
        itemName={power.name}
        itemType='poder'
        size='small'
        variant='minimal'
      />
    </>
  );

  const badges = (
    <>
      <Chip
        label={power.categoryLabel}
        size='small'
        variant='filled'
        color='primary'
        sx={{ fontFamily: 'Tfont, serif', fontSize: '0.7rem' }}
      />
      <Chip
        label={power.supplementName}
        size='small'
        variant='outlined'
        color={
          power.supplementId === SupplementId.TORMENTA20_CORE
            ? 'default'
            : 'secondary'
        }
        sx={{ fontFamily: 'Tfont, serif', fontSize: '0.7rem' }}
      />
      {power.races.map((race) => (
        <Chip
          key={`race-${race}`}
          label={`Raça: ${race}`}
          size='small'
          variant='outlined'
          color='success'
          sx={{ fontFamily: 'Tfont, serif', fontSize: '0.7rem' }}
        />
      ))}
      {power.deities.map((deity) => (
        <Chip
          key={`deity-${deity}`}
          label={`Deus: ${deity}`}
          size='small'
          variant='outlined'
          color='warning'
          sx={{ fontFamily: 'Tfont, serif', fontSize: '0.7rem' }}
        />
      ))}
      {power.classLabel && (
        <Chip
          label={
            power.eligibleClasses.length > 1
              ? `${power.classLabel} (+${power.eligibleClasses.length - 1})`
              : power.classLabel
          }
          size='small'
          variant='outlined'
          color='info'
          sx={{ fontFamily: 'Tfont, serif', fontSize: '0.7rem' }}
        />
      )}
      {power.distinctionName && (
        <Chip
          label={`Distinção: ${power.distinctionName}`}
          size='small'
          variant='outlined'
          color='warning'
          sx={{ fontFamily: 'Tfont, serif', fontSize: '0.7rem' }}
        />
      )}
      {power.subcategoriaTatica && (
        <Chip
          label={
            TACTICAL_SUBCATEGORY_LABELS[power.subcategoriaTatica] ||
            power.subcategoriaTatica
          }
          size='small'
          variant='outlined'
          sx={{ fontFamily: 'Tfont, serif', fontSize: '0.7rem' }}
        />
      )}
    </>
  );

  const hasReqs =
    power.requirements.length > 0 &&
    power.requirements.some((group) => group.length > 0);

  const footer = hasReqs ? (
    <Box>
      <Typography
        variant='caption'
        sx={{
          display: 'block',
          fontFamily: 'Tfont, serif',
          fontWeight: 700,
          color: 'text.secondary',
          mb: 0.5,
          textTransform: 'uppercase',
          letterSpacing: 0.4,
        }}
      >
        Requisitos
      </Typography>
      {power.requirements.map((reqGroup, reqIndex) => (
        <Box
          key={`${power.id}-reqGroup-${reqIndex}-${reqGroup
            .map((r) => r.name || r.text)
            .join('-')}`}
          sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.5, mb: 0.5 }}
        >
          {reqGroup.map((req, subIdx) => (
            <Chip
              key={`${power.id}-req-${subIdx}-${req.name || req.text}-${req.value || ''}`}
              label={formatRequirement(req)}
              size='small'
              variant='outlined'
              color='secondary'
              sx={{ fontFamily: 'Tfont, serif', fontSize: '0.72rem' }}
            />
          ))}
          {power.requirements.length > 1 &&
            reqIndex + 1 < power.requirements.length && (
              <Typography
                variant='caption'
                sx={{ fontStyle: 'italic', color: 'text.secondary', mx: 0.5 }}
              >
                ou
              </Typography>
            )}
        </Box>
      ))}
    </Box>
  ) : undefined;

  return (
    <DatabaseCard
      title={power.name}
      icon={<LocalFireDepartmentIcon fontSize='small' />}
      badges={badges}
      actions={actions}
      footer={footer}
      highlighted={highlighted}
    >
      <Typography
        variant='body2'
        sx={{
          whiteSpace: 'pre-line',
          lineHeight: 1.6,
          color: 'text.primary',
        }}
      >
        {power.description}
      </Typography>
    </DatabaseCard>
  );
};

export default PowerCard;
