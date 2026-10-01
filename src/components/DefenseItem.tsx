import React from 'react';
import { Box, Chip, Stack, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { DefenseEquipment, ManualStatField } from '../interfaces/Equipment';
import { getManualStatFields } from '../functions/manualStats';
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

  // Mesma marca da linha de arma (`Weapon.tsx`): o valor digitado à mão fica
  // sublinhado em pontilhado — nele, melhorias e encantos não se aplicam, e
  // sem a marca a conta simplesmente não fecha.
  const manualStatFields = getManualStatFields(equipment);
  const manualMarkTitle =
    'Modificado manualmente — melhorias e bônus automáticos não se aplicam a este valor';
  const manualFieldNames = (
    [
      ['defenseBonus', 'defesa'],
      ['armorPenalty', 'penalidade de armadura'],
    ] as [ManualStatField, string][]
  )
    .filter(([field]) => manualStatFields.has(field))
    .map(([, label]) => label);

  const withManualMark = (field: ManualStatField, content: React.ReactNode) => {
    if (!manualStatFields.has(field)) return content;
    return (
      <Tooltip title={manualMarkTitle} disableTouchListener>
        <Box
          component='span'
          sx={{
            textDecoration: 'underline dotted',
            textUnderlineOffset: '3px',
            cursor: 'help',
          }}
        >
          {content}
        </Box>
      </Tooltip>
    );
  };

  return (
    <Box
      sx={{
        borderBottom: '1px solid #ccc',
        padding: '8px',
        // Sem proficiência: fundo âmbar sutil; a legenda explicativa é
        // renderizada uma única vez pela lista (DefenseEquipments.tsx).
        backgroundColor: isNonProficient
          ? (theme) => alpha(theme.palette.warning.main, 0.12)
          : undefined,
      }}
    >
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
            {nome}&nbsp;{withManualMark('defenseBonus', `+${defenseBonus}`)}
            &nbsp;({withManualMark('armorPenalty', `-${armorPenalty} PA`)})
            {manualFieldNames.length > 0 && (
              <Tooltip
                title={`${manualMarkTitle} (${manualFieldNames.join(', ')}).`}
                arrow
                enterTouchDelay={0}
                leaveTouchDelay={4000}
              >
                {/* O sublinhado explica no hover; o ícone existe pelo mobile. */}
                <EditNoteIcon
                  aria-label='Estatísticas modificadas manualmente'
                  sx={{
                    fontSize: 15,
                    ml: 0.5,
                    color: 'text.secondary',
                    cursor: 'help',
                  }}
                />
              </Tooltip>
            )}
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
