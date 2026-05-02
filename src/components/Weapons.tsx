import React from 'react';
import { Box, Typography } from '@mui/material';
import Equipment, { AmmoType, BagEquipments } from '../interfaces/Equipment';
import { CompleteSkill } from '../interfaces/Skills';
import { CharacterAttributes } from '../interfaces/Character';
import Weapon from './Weapon';
import type { ActiveCondition } from '../premium/interfaces/ActiveCondition';
import type { SheetBonus } from '../interfaces/CharacterSheet';
import {
  getWieldingSlot,
  WieldingSlot,
} from './SheetResult/BackpackModal/wielding';
import { getAmmoUnits } from './SheetResult/BackpackModal/ammo';

interface WeaponsProps {
  weapons: Equipment[];
  getKey: (eId: string) => string;
  completeSkills: CompleteSkill[] | undefined;
  atributos: CharacterAttributes;
  modFor: number;
  characterName?: string;
  attackConditions?: ActiveCondition[];
  sheetBonuses?: SheetBonus[];
  mainHandItemId?: string;
  offHandItemId?: string;
  onWieldingChange?: (itemId: string, slot: WieldingSlot) => void;
  /**
   * Optional disabled-slot map per item id (used when a two-handed weapon
   * is currently held to block conflicting assignments on others).
   */
  getWieldingDisabledSlots?: (
    itemId: string | undefined
  ) => Partial<Record<'main' | 'off', { reason: string }>> | undefined;
  /**
   * True when at least one hand slot is currently occupied — drives the
   * "weapon not wielded" attack confirmation. Forwarded to each Weapon.
   */
  wieldingTrackingActive?: boolean;
  /** Bag equipments — used to look up available ammo per weapon. */
  bagEquipments?: BagEquipments;
  /** Handler invoked to decrement 1 unit of the matching ammo. */
  onConsumeAmmo?: (ammoType: AmmoType) => void;
}

const Weapons: React.FC<WeaponsProps> = (props) => {
  const {
    weapons,
    getKey,
    completeSkills,
    atributos,
    modFor,
    characterName,
    attackConditions,
    sheetBonuses,
    mainHandItemId,
    offHandItemId,
    onWieldingChange,
    getWieldingDisabledSlots,
    wieldingTrackingActive,
    bagEquipments,
    onConsumeAmmo,
  } = props;

  if (!weapons || weapons.length === 0) {
    return (
      <Box>
        <Typography>Nenhuma arma equipada.</Typography>
      </Box>
    );
  }

  const wieldingState = { mainHandItemId, offHandItemId };

  const weaponsDiv = weapons.map((equip) => {
    const availableAmmo =
      equip.ammoType && bagEquipments
        ? getAmmoUnits(bagEquipments, equip.ammoType)
        : undefined;
    return (
      <Weapon
        key={getKey(equip.nome)}
        equipment={equip}
        completeSkills={completeSkills}
        atributos={atributos}
        modDano={modFor}
        characterName={characterName}
        attackConditions={attackConditions}
        sheetBonuses={sheetBonuses}
        wieldingSlot={getWieldingSlot(equip.id, wieldingState)}
        onWieldingChange={
          onWieldingChange && equip.id
            ? (slot) => onWieldingChange(equip.id as string, slot)
            : undefined
        }
        wieldingDisabledSlots={
          getWieldingDisabledSlots
            ? getWieldingDisabledSlots(equip.id)
            : undefined
        }
        wieldingTrackingActive={wieldingTrackingActive}
        availableAmmo={availableAmmo}
        onConsumeAmmo={onConsumeAmmo}
      />
    );
  });

  return <Box>{weaponsDiv}</Box>;
};

export default Weapons;
