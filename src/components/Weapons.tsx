import React from 'react';
import { Box, Chip, Tooltip, Typography } from '@mui/material';
import HandIcon from '@mui/icons-material/BackHand';
import Equipment, {
  AmmoType,
  BagEquipments,
  WeaponOverride,
} from '../interfaces/Equipment';
import { CompleteSkill } from '../interfaces/Skills';
import { CharacterAttributes } from '../interfaces/Character';
import Weapon from './Weapon';
import type { ActiveCondition } from '../premium/interfaces/ActiveCondition';
import type { ManeuverId, SheetBonus } from '../interfaces/CharacterSheet';
import ManeuverRow, { ManeuverRowData } from './ManeuverRow';
import {
  getWieldedItemIds,
  getWieldingSlot,
  pickDefaultWieldSlot,
  WieldingSlot,
  WieldingDisabledSlots,
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
  extraHand1ItemId?: string;
  extraHand2ItemId?: string;
  /** Oferece as mãos extras (poder Quatro Braços). */
  wieldingExtraHands?: boolean;
  onWieldingChange?: (itemId: string, slot: WieldingSlot) => void;
  /**
   * Optional disabled-slot map per item id (used when a two-handed weapon
   * is currently held to block conflicting assignments on others).
   */
  getWieldingDisabledSlots?: (
    itemId: string | undefined
  ) => WieldingDisabledSlots | undefined;
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
  /** Aviso informativo por arma, repassado a cada linha. */
  getWeaponWarning?: (weapon: Equipment) => string | undefined;
  /** Manobras de combate ativadas na ficha, listadas abaixo das armas. */
  maneuvers?: ManeuverRowData[];
  /** Troca a arma de uma manobra. Ausente = ficha em modo leitura. */
  onManeuverWeaponChange?: (id: ManeuverId, weaponId: string) => void;
}

const HELD_SLOT_LABELS: Record<Exclude<WieldingSlot, null>, string> = {
  main: 'Mão principal',
  off: 'Mão secundária',
  both: 'Duas mãos',
  extra1: 'Mão extra 1',
  extra2: 'Mão extra 2',
  bothExtra: 'Mãos extras',
};

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
    extraHand1ItemId,
    extraHand2ItemId,
    wieldingExtraHands = false,
    onWieldingChange,
    getWieldingDisabledSlots,
    wieldingTrackingActive,
    bagEquipments,
    onConsumeAmmo,
    hasArremessador,
    proficiencias,
    onWeaponSemanticsChange,
    getWeaponWarning,
    maneuvers = [],
    onManeuverWeaponChange,
  } = props;

  const wieldingState = {
    mainHandItemId,
    offHandItemId,
    extraHand1ItemId,
    extraHand2ItemId,
  };

  // Mãos ocupadas por algo que não é linha de ataque (esotérico, varinha,
  // escudo, tocha): o jogador precisa ver que a mão não está livre.
  const weaponIds = new Set((weapons ?? []).map((w) => w.id));
  const bagItems = bagEquipments
    ? (Object.values(bagEquipments) as (Equipment[] | undefined)[]).flatMap(
        (list) => list ?? []
      )
    : [];
  const heldItems = getWieldedItemIds(wieldingState)
    .filter((id) => !weaponIds.has(id))
    .map((id) => bagItems.find((item) => item.id === id))
    .filter((item): item is Equipment => !!item);
  const heldChips =
    heldItems.length > 0 ? (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
        {heldItems.map((item) => {
          const slot = getWieldingSlot(item.id, wieldingState);
          const hand = slot ? HELD_SLOT_LABELS[slot] : '';
          return (
            <Tooltip
              key={item.id}
              title={`Empunhado (${hand.toLowerCase()}). Para soltar ou trocar, use o ícone de mão em Equipamentos ou na mochila.`}
            >
              <Chip
                size='small'
                variant='outlined'
                icon={<HandIcon />}
                label={`${item.customDisplayName || item.nome} · ${hand}`}
              />
            </Tooltip>
          );
        })}
      </Box>
    ) : null;

  if ((!weapons || weapons.length === 0) && maneuvers.length === 0) {
    return (
      <Box>
        {heldChips}
        <Typography>Nenhuma arma equipada.</Typography>
      </Box>
    );
  }

  // Resolve o item de qualquer mão para o desempate de escudo do
  // `pickDefaultWieldSlot` (o que ocupa a mão pode não ser uma arma).
  const wieldingLookup = (id: string): Equipment | undefined => {
    if (!bagEquipments) return undefined;
    return [
      ...bagEquipments.Arma,
      ...bagEquipments.Escudo,
      ...bagEquipments.Alquimía,
      ...bagEquipments['Item Geral'],
      ...(bagEquipments['Esotérico'] ?? []),
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
          wieldingLookup,
          wieldingExtraHands
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
        wieldingExtraHands={wieldingExtraHands}
        wieldingTrackingActive={wieldingTrackingActive}
        availableAmmo={availableAmmo}
        onConsumeAmmo={onConsumeAmmo}
        hasArremessador={hasArremessador}
        proficiencyPenalty={proficiencyPenalty}
        warning={getWeaponWarning?.(equip)}
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
      {heldChips}
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
      {maneuvers.length > 0 && (
        <Box sx={{ mt: 1.5 }}>
          <Typography variant='subtitle2'>Manobras</Typography>
          {maneuvers.map((maneuver) => (
            <ManeuverRow
              key={maneuver.id}
              maneuver={maneuver}
              characterName={characterName}
              onWeaponChange={onManeuverWeaponChange}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Weapons;
