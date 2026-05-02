import React from 'react';
import { Alert, Box, Typography } from '@mui/material';
import { DefenseEquipment } from '../interfaces/Equipment';
import DefenseItem from './DefenseItem';
import {
  getWieldingSlot,
  WieldingSlot,
} from './SheetResult/BackpackModal/wielding';

interface DefenseEquipmentsProps {
  defenseEquipments: DefenseEquipment[];
  getKey: (eId: string) => string;
  wornArmorId?: string;
  mainHandItemId?: string;
  offHandItemId?: string;
  /** Handler to change shield wielding from this section directly. */
  onWieldingChange?: (itemId: string, slot: WieldingSlot) => void;
  /** Slot disable map per item id (e.g. 2H weapon blocking shield slots). */
  getWieldingDisabledSlots?: (
    itemId: string | undefined
  ) => Partial<Record<'main' | 'off', { reason: string }>> | undefined;
}

const DefenseEquipments: React.FC<DefenseEquipmentsProps> = (props) => {
  const {
    defenseEquipments,
    getKey,
    wornArmorId,
    mainHandItemId,
    offHandItemId,
    onWieldingChange,
    getWieldingDisabledSlots,
  } = props;
  const wieldingState = { mainHandItemId, offHandItemId };

  if (defenseEquipments.length === 0) {
    return (
      <Box>
        <Typography>Nenhum equipamento defensivo.</Typography>
      </Box>
    );
  }

  // Resolve which armor counts as worn (with the legacy fallback for sheets
  // that have exactly 1 armor and no wornArmorId).
  const armors = defenseEquipments.filter((e) => e.group === 'Armadura');
  let resolvedWornId = wornArmorId;
  if (!resolvedWornId && armors.length === 1) {
    resolvedWornId = armors[0].id;
  }
  const ambiguousArmor = !wornArmorId && armors.length >= 2;

  return (
    <Box>
      {ambiguousArmor && (
        <Alert severity='warning' sx={{ mb: 1 }}>
          <Typography variant='body2' sx={{ fontWeight: 600 }}>
            {armors.length} armaduras na mochila — escolha qual está vestindo no
            editor da Mochila.
          </Typography>
          <Typography variant='caption' sx={{ display: 'block' }}>
            Enquanto nenhuma estiver marcada, NENHUMA aplica bônus de defesa.
          </Typography>
        </Alert>
      )}
      {defenseEquipments.map((equip) => {
        const isWorn =
          equip.group === 'Armadura' &&
          equip.id !== undefined &&
          equip.id === resolvedWornId;
        const isWielded =
          equip.group === 'Escudo' &&
          equip.id !== undefined &&
          (equip.id === mainHandItemId || equip.id === offHandItemId);
        const isShield = equip.group === 'Escudo';
        return (
          <DefenseItem
            key={getKey(equip.nome)}
            equipment={equip}
            isWorn={isWorn}
            isWielded={isWielded}
            wieldingSlot={
              isShield ? getWieldingSlot(equip.id, wieldingState) : null
            }
            onWieldingChange={
              isShield && equip.id && onWieldingChange
                ? (slot) => onWieldingChange(equip.id as string, slot)
                : undefined
            }
            wieldingDisabledSlots={
              isShield && getWieldingDisabledSlots
                ? getWieldingDisabledSlots(equip.id)
                : undefined
            }
          />
        );
      })}
    </Box>
  );
};

export default DefenseEquipments;
