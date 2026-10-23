import { Atributo } from '../data/systems/tormenta20/atributos';
import PROFICIENCIAS from '../data/systems/tormenta20/proficiencias';
import {
  findClassDescription,
  getClassLevelsMap,
} from '../functions/multiclass';
import { getSheetProficiencias } from '../functions/proficiencies';
import CharacterSheet from '../interfaces/CharacterSheet';
import { FOUNDRY_SYSTEM_VERSION } from './version';
import { SheetAutomations } from './automations';
import {
  ATTRIBUTE_KEYS,
  FoundryAttribute,
  SENSES,
  toDamageTypeKey,
  toSizeKey,
} from './enums';
import { getArmorField } from './items/equipment';
import { getSpellKeyAttribute } from './items/spells';
import { foundryId, normalizeName } from './normalize';
import { buildSkills } from './skills';
import { FoundryData, FoundryItem } from './types';

function getAttribute(sheet: CharacterSheet, attribute: Atributo): number {
  return sheet.atributos?.[attribute]?.value ?? 0;
}

function buildAttributes(sheet: CharacterSheet): FoundryData {
  const atributos: FoundryData = {};
  (Object.keys(ATTRIBUTE_KEYS) as Atributo[]).forEach((attribute) => {
    // A ficha guarda o valor final; `value` é derivado (base + racial + bonus).
    atributos[ATTRIBUTE_KEYS[attribute]] = {
      base: getAttribute(sheet, attribute),
      racial: 0,
      bonus: 0,
    };
  });
  return atributos;
}

/**
 * Um item `classe` por classe da ficha: o nível do personagem no Foundry é a
 * soma dos `niveis` desses itens.
 */
export function buildClassItems(sheet: CharacterSheet): FoundryItem[] {
  const firstClass = sheet.classLevels?.[0]?.className ?? sheet.classe.name;

  return Array.from(getClassLevelsMap(sheet)).map(([className, levels]) => {
    const isMainClass = className === sheet.classe.name;
    const description = isMainClass
      ? sheet.classe
      : findClassDescription(
          className,
          sheet.classLevels?.find((entry) => entry.className === className)
            ?.classSubname
        );

    return {
      _id: foundryId(),
      name: className,
      type: 'classe',
      effects: [],
      flags: {},
      system: {
        inicial: className === firstClass,
        niveis: levels,
        pvPorNivel: description?.addpv ?? 0,
        pmPorNivel: description?.addpm ?? 0,
      },
    };
  });
}

/**
 * Defesa. O Foundry deriva o total de base + atributo + armadura/escudo
 * equipados + efeitos; mandamos a base e o atributo e fechamos a conta em
 * `outros`, que absorve o que a ficha soma por caminhos que o Foundry não
 * enxerga (bônus passageiros, atributo desligado).
 */
function buildDefense(
  sheet: CharacterSheet,
  items: FoundryItem[],
  automations: SheetAutomations
): FoundryData {
  const attribute = sheet.customDefenseAttribute ?? Atributo.DESTREZA;
  const base = sheet.customDefenseBase ?? 10;

  const equipped = items.filter(
    (item) => item.type === 'equipamento' && item.system.equipado
  );
  const armor = equipped.find((item) =>
    ['leve', 'pesada'].includes(String(item.system.tipo))
  );
  const shield = equipped.find((item) => item.system.tipo === 'escudo');
  const accessories = equipped.filter(
    (item) => item !== armor && item !== shield
  );

  const attributeValue = getAttribute(sheet, attribute);
  const attributePart =
    armor?.system.tipo === 'pesada'
      ? Math.min(Math.max(attributeValue, 0), getArmorField(armor, 'maxAtr'))
      : attributeValue;

  const derived =
    base +
    attributePart +
    (armor ? getArmorField(armor, 'value') : 0) +
    (shield ? getArmorField(shield, 'value') : 0) +
    accessories.reduce((sum, item) => sum + getArmorField(item, 'value'), 0) +
    // Bônus de Defesa que saem como efeito: o Foundry soma por conta própria.
    automations.defense;

  return {
    base,
    atributo: ATTRIBUTE_KEYS[attribute],
    outros: (sheet.defesa ?? derived) - derived,
  };
}

function buildSenses(sheet: CharacterSheet): FoundryData {
  const known: string[] = [];
  const custom: string[] = [];
  (sheet.sentidos ?? []).forEach((sense) => {
    const normalized = normalizeName(sense);
    const key = SENSES.find((candidate) => normalized.includes(candidate));
    if (key && !known.includes(key)) known.push(key);
    else if (!key) custom.push(sense);
  });
  return { value: known, custom: custom.join('; ') };
}

const WEAPON_PROFICIENCY_KEYS: Record<string, string> = {
  [PROFICIENCIAS.SIMPLES]: 'simples',
  [PROFICIENCIAS.MARCIAIS]: 'marcial',
  [PROFICIENCIAS.EXOTICAS]: 'exotica',
  [PROFICIENCIAS.FOGO]: 'fogo',
};

const ARMOR_PROFICIENCY_KEYS: Record<string, string> = {
  [PROFICIENCIAS.LEVES]: 'lev',
  [PROFICIENCIAS.PESADAS]: 'pes',
  [PROFICIENCIAS.ESCUDOS]: 'esc',
};

function buildTraits(sheet: CharacterSheet): FoundryData {
  const weapons: string[] = [];
  const armors: string[] = [];
  // Proficiências que o sistema não tem como chave (arma nomeada, marciais de
  // distância, fogo de uma mão) ficam no campo de texto.
  const others: string[] = [];
  getSheetProficiencias(sheet).forEach((proficiency) => {
    if (WEAPON_PROFICIENCY_KEYS[proficiency]) {
      weapons.push(WEAPON_PROFICIENCY_KEYS[proficiency]);
    } else if (ARMOR_PROFICIENCY_KEYS[proficiency]) {
      armors.push(ARMOR_PROFICIENCY_KEYS[proficiency]);
    } else others.push(proficiency);
  });

  const resistencias: FoundryData = {};
  Object.entries(sheet.reducaoDeDano ?? {}).forEach(([type, value]) => {
    const key = toDamageTypeKey(type);
    if (!key || !value) return;
    resistencias[key] = { base: value };
  });

  return {
    tamanho: toSizeKey((sheet.customSize ?? sheet.size)?.name),
    profArmas: { value: weapons, custom: others.join('; ') },
    profArmaduras: { value: armors, custom: '' },
    resistencias,
  };
}

function buildMovement(sheet: CharacterSheet): FoundryData {
  const secondary = sheet.computedMovementTypes ?? sheet.movementTypes ?? {};
  const move = (base: number | undefined): FoundryData => ({
    base: base ?? 0,
    bonus: [],
  });
  return {
    walk: move(sheet.displacement),
    climb: move(secondary.escalada),
    burrow: move(secondary.escavar),
    swim: move(secondary.natacao),
    fly: move(secondary.voo),
    hover: !!secondary.pairar,
    unit: 'm',
  };
}

function buildLoad(sheet: CharacterSheet): FoundryData {
  const attribute = sheet.maxSpacesAttribute ?? Atributo.FORCA;
  const value = getAttribute(sheet, attribute);
  // O sistema calcula o limite como `base + atributo × 2` (ou `+ atributo` se
  // negativo); invertemos para o limite bater com o da ficha.
  const fromAttribute = value > 0 ? value * 2 : value;
  return {
    atributo: ATTRIBUTE_KEYS[attribute],
    base: sheet.maxSpaces !== undefined ? sheet.maxSpaces - fromAttribute : 10,
    bonus: [],
  };
}

export function buildActorSystem(
  sheet: CharacterSheet,
  items: FoundryItem[],
  automations: SheetAutomations
): FoundryData {
  const pv = sheet.pv ?? 0;
  const pm = sheet.pm ?? 0;
  const keyAttribute = getSpellKeyAttribute(sheet);
  const conjuracao: FoundryAttribute | '' = keyAttribute
    ? ATTRIBUTE_KEYS[keyAttribute]
    : '';

  return {
    atributos: buildAttributes(sheet),
    attributes: {
      // PV/PM máximos são os totais da ficha: o ator sai com o cálculo manual
      // ligado (`flags.tormenta20.lvlconfig.manual`), senão o Foundry os
      // recalcularia só a partir dos itens de classe.
      pv: {
        value: sheet.currentPV ?? pv,
        max: pv,
        min: -Math.floor(pv / 2),
        temp: sheet.tempPV ?? 0,
      },
      pm: {
        value: sheet.currentPM ?? pm,
        max: pm,
        min: 0,
        temp: sheet.tempPM ?? 0,
      },
      defesa: buildDefense(sheet, items, automations),
      movement: buildMovement(sheet),
      sentidos: buildSenses(sheet),
      conjuracao,
      carga: buildLoad(sheet),
    },
    detalhes: {
      raca: sheet.raca?.name ?? '',
      origem: sheet.origin?.name ?? '',
      divindade: sheet.devoto?.divindade?.name ?? '',
      info: `Ficha criada no Fichas de Nimb para o sistema Tormenta20 v${FOUNDRY_SYSTEM_VERSION}`,
    },
    dinheiro: {
      // T$ é o tibar de prata; TO e TC são as moedas de ouro e de cobre.
      tp: sheet.dinheiro ?? 0,
      to: sheet.dinheiroTO ?? 0,
      tc: sheet.dinheiroTC ?? 0,
      tl: 0,
    },
    tracos: buildTraits(sheet),
    pericias: buildSkills(sheet, automations.skillOthers),
  };
}
