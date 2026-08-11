import React from 'react';
import { Box, Typography } from '@mui/material';
import Equipment, {
  AmmoType,
  BagEquipments,
  WeaponOverride,
} from '../interfaces/Equipment';
import { CompleteSkill } from '../interfaces/Skills';
import { CharacterAttributes } from '../interfaces/Character';
import Weapon from './Weapon';
import type { ActiveCondition } from '../premium/interfaces/ActiveCondition';
import type { SheetBonus } from '../interfaces/CharacterSheet';
import {
  getWieldingSlot,
  pickDefaultWieldSlot,
  WieldingSlot,
} from './SheetResult/BackpackModal/wielding';
import { getAmmoUnits } from './SheetResult/BackpackModal/ammo';
import { getWeaponNonProficiencyPenalty } from '../functions/proficiencies';

interface WeaponsProps {
  weapons: Equipment[];
  getKey: (eId: string) => string;
  completeSkills: CompleteSkill[] | undefined;
  atributos: CharacterAttributes;
  /** Nível total do personagem — repassado a cada Weapon para os bônus de dano
   * por modo baseados em atributo limitado pelo nível (Arqueiro, Esgrimista). */
  nivel?: number;
  /** Map<className, classLevel> — resolve `{classLevel}` nos bônus `LevelCalc`
   * de fichas multiclasse (ex.: Instinto Selvagem usa o nível de Bárbaro, não o
   * total). Ausente = mono-classe, cai no nível total. */
  classLevels?: Map<string, number>;
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
  /**
   * True when the character has the Hynne "Arremessador" racial ability.
   * Forwarded to each Weapon to grant +1 damage step on ranged/thrown attacks.
   */
  hasArremessador?: boolean;
  /**
   * Effective proficiency list of the sheet (class + custom − removed). When
   * provided, weapons outside the list get the -5 non-proficiency penalty.
   */
  proficiencias?: string[];
  /**
   * Persiste a edição de perícia/atributos de uma arma. Ausente = ícone de
   * ajuste escondido em todas as linhas (ficha em modo leitura).
   */
  onWeaponSemanticsChange?: (weapon: Equipment, next: WeaponOverride) => void;
}

const Weapons: React.FC<WeaponsProps> = (props) => {
  const {
    weapons,
    getKey,
    completeSkills,
    atributos,
    nivel,
    classLevels,
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
    hasArremessador,
    proficiencias,
    onWeaponSemanticsChange,
  } = props;

  if (!weapons || weapons.length === 0) {
    return (
      <Box>
        <Typography>Nenhuma arma equipada.</Typography>
      </Box>
    );
  }

  const wieldingState = { mainHandItemId, offHandItemId };

  // Resolve o item de qualquer mão para o desempate de escudo do
  // `pickDefaultWieldSlot` (o que ocupa a mão pode não ser uma arma).
  const wieldingLookup = (id: string): Equipment | undefined => {
    if (!bagEquipments) return undefined;
    return [
      ...bagEquipments.Arma,
      ...bagEquipments.Escudo,
      ...bagEquipments.Alquimía,
      ...bagEquipments['Item Geral'],
    ].find((it) => it.id === id);
  };

  const hasNonProficientWeapon =
    !!proficiencias &&
    weapons.some(
      (equip) => getWeaponNonProficiencyPenalty(equip, proficiencias) !== 0
    );

  const weaponsDiv = weapons.map((equip) => {
    const availableAmmo =
      equip.ammoType && bagEquipments
        ? getAmmoUnits(bagEquipments, equip.ammoType)
        : undefined;
    const proficiencyPenalty = proficiencias
      ? getWeaponNonProficiencyPenalty(equip, proficiencias)
      : 0;
    return (
      <Weapon
        // Pelo id, não pelo nome: duas cópias empunhadas de um mesmo item
        // (Machadinha em cada mão) gerariam keys idênticas e embaralhariam o
        // estado de diálogo entre as duas linhas.
        key={equip.id ? getKey(equip.id) : getKey(equip.nome)}
        equipment={equip}
        defaultWieldSlot={pickDefaultWieldSlot(
          wieldingState,
          equip,
          wieldingLookup
        )}
        completeSkills={completeSkills}
        atributos={atributos}
        nivel={nivel}
        classLevels={classLevels}
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
        hasArremessador={hasArremessador}
        proficiencyPenalty={proficiencyPenalty}
        onSemanticsChange={
          onWeaponSemanticsChange
            ? (next) => onWeaponSemanticsChange(equip, next)
            : undefined
        }
      />
    );
  });

  return (
    <Box>
      {weaponsDiv}
      {hasNonProficientWeapon && (
        <Typography
          variant='caption'
          sx={{ display: 'block', mt: 0.5, color: 'warning.main' }}
        >
          ⚠️ Armas destacadas: sem proficiência — a penalidade de –5 nos testes
          de ataque já está aplicada.
        </Typography>
      )}
    </Box>
  );
};

export default Weapons;
