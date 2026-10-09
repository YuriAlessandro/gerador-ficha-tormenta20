import { collectSheetPowers } from '../../functions/powers/collectSheetPowers';
import {
  classifyPowers,
  PowerOrigin,
  SheetPower,
} from '../../functions/powers/powerOrigins';
import {
  getPowerDisplayName,
  getPowerDisplayText,
} from '../../functions/powers/powerText';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { BonusGroup } from '../automations';
import { buildPassiveEffect } from '../effects';
import { foundryId, textToHtml } from '../normalize';
import { FoundryItem } from '../types';
import { buildFormulaRolls } from './spells';

interface PowerCategory {
  tipo: string;
  subtipo: string;
}

/** Origem do poder na ficha → `tipo`/`subtipo` do item `poder` no Foundry. */
function getPowerCategory(
  sheet: CharacterSheet,
  origin: PowerOrigin | undefined
): PowerCategory {
  const deity = sheet.devoto?.divindade?.name ?? '';

  switch (origin?.kind) {
    case 'classPower':
    case 'classAbility':
      return { tipo: 'classe', subtipo: origin.source ?? sheet.classe.name };
    case 'raceAbility':
    case 'generalRaca':
      return { tipo: 'racial', subtipo: origin.source ?? sheet.raca.name };
    case 'originPower':
      return { tipo: 'origem', subtipo: sheet.origin?.name ?? '' };
    case 'deityPower':
    case 'generalConcedidos':
    case 'customGranted':
      return { tipo: 'concedido', subtipo: deity };
    case 'generalCombate':
      return { tipo: 'geral', subtipo: 'Combate' };
    case 'generalDestino':
      return { tipo: 'geral', subtipo: 'Destino' };
    case 'generalMagia':
      return { tipo: 'geral', subtipo: 'Magia' };
    case 'generalTormenta':
      return { tipo: 'geral', subtipo: 'Tormenta' };
    case 'complication':
      return { tipo: 'complicacao', subtipo: '' };
    default:
      return { tipo: 'ability', subtipo: '' };
  }
}

function buildPower(power: SheetPower, category: PowerCategory): FoundryItem {
  return {
    _id: foundryId(),
    name: getPowerDisplayName(power),
    type: 'poder',
    effects: [],
    flags: {},
    system: {
      description: {
        value: textToHtml(getPowerDisplayText(power)),
        unidentified: '',
      },
      tipo: category.tipo,
      subtipo: category.subtipo,
      rolls: buildFormulaRolls(power.rolls),
    },
  };
}

/**
 * `bonusGroups` são as automações da ficha; o grupo cuja fonte é um poder
 * exportado vira efeito passivo desse poder e sai da lista devolvida em
 * `unclaimed` (o que sobra vira efeito do ator).
 */
export function buildPowerItems(
  sheet: CharacterSheet,
  bonusGroups: BonusGroup[]
): { items: FoundryItem[]; unclaimed: BonusGroup[] } {
  const { powers, counts, sources } = collectSheetPowers(sheet);
  const origins = classifyPowers(sources);

  const claimed = new Set<BonusGroup>();
  const items = powers.map((power) => {
    const item = buildPower(
      power,
      getPowerCategory(sheet, origins.get(power.name))
    );
    bonusGroups
      .filter((group) => group.powerName === power.name)
      .forEach((group) => {
        claimed.add(group);
        item.effects.push(buildPassiveEffect(item.name, group.changes, true));
      });

    const count = counts[power.name] ?? 1;
    if (count > 1) item.name = `${item.name} (x${count})`;
    return item;
  });

  return {
    items,
    unclaimed: bonusGroups.filter((group) => !claimed.has(group)),
  };
}
