import React from 'react';
import { Box, Chip, Stack, Tooltip, Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { DefenseEquipment } from '../interfaces/Equipment';
import WieldingControl from './SheetResult/BackpackModal/WieldingControl';
import { WieldingSlot } from './SheetResult/BackpackModal/wielding';

interface DefenseEquipmentProps {
  equipment: DefenseEquipment;
  /** True when this is the currently worn armor. */
  isWorn?: boolean;
  /** True when this shield is wielded in a hand slot. */
  isWielded?: boolean;
  /** Current hand the shield occupies (only meaningful for shields). */
  wieldingSlot?: WieldingSlot;
  /** Quick-wield handler. When provided, a hand-icon button is rendered. */
  onWieldingChange?: (slot: WieldingSlot) => void;
  wieldingDisabledSlots?: Partial<Record<'main' | 'off', { reason: string }>>;
  /** True when the character lacks proficiency with this armor/shield. */
  isNonProficient?: boolean;
}

const DefenseItem: React.FC<DefenseEquipmentProps> = (props) => {
  const {
    equipment,
    isWorn = false,
    isWielded = false,
    wieldingSlot = null,
    onWieldingChange,
    wieldingDisabledSlots,
    isNonProficient = false,
  } = props;
  const { nome, defenseBonus, armorPenalty } = equipment;

  return (
    <Box sx={{ borderBottom: '1px solid #ccc', padding: '8px' }}>
      <Stack
        direction='row'
        spacing={0.75}
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack
          direction='row'
          spacing={0.75}
          sx={{
            alignItems: 'center',
            minWidth: 0,
            flex: 1,
          }}
        >
          <Typography
            sx={{
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {nome} +{defenseBonus} (-{armorPenalty} PA)
            {equipment.descricao && (
              <Tooltip title={equipment.descricao} arrow>
                <InfoOutlinedIcon
                  sx={{
                    fontSize: 14,
                    ml: 0.5,
                    color: 'text.secondary',
                    cursor: 'help',
                  }}
                />
              </Tooltip>
            )}
          </Typography>
          {isWorn && (
            <Chip
              size='small'
              label='Vestida'
              color='primary'
              sx={{ height: 18, fontSize: '0.65rem' }}
            />
          )}
          {isWielded && (
            <Chip
              size='small'
              label='Empunhado'
              color='primary'
              sx={{ height: 18, fontSize: '0.65rem' }}
            />
          )}
          {isNonProficient && (
            <Tooltip
              title={`Sem proficiência: enquanto ${
                equipment.group === 'Escudo' ? 'empunhado' : 'vestida'
              }, a penalidade de armadura se aplica a todas as perícias de Força e Destreza`}
              arrow
            >
              <Chip
                size='small'
                label='Sem proficiência'
                color='warning'
                sx={{ height: 18, fontSize: '0.65rem' }}
              />
            </Tooltip>
          )}
        </Stack>
        {onWieldingChange && (
          <Box sx={{ display: 'inline-flex' }}>
            <WieldingControl
              item={equipment}
              currentSlot={wieldingSlot}
              onChange={onWieldingChange}
              disabledSlots={wieldingDisabledSlots}
            />
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default DefenseItem;
