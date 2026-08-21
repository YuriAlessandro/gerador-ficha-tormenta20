import _ from 'lodash';
import CharacterSheet, { SheetBonus } from '../interfaces/CharacterSheet';
import { CharacterAttributes } from '../interfaces/Character';
import Bag from '../interfaces/Bag';
import { WeaponOverride } from '../interfaces/Equipment';
import { Atributo } from '../data/systems/tormenta20/atributos';
import { RACE_SIZES } from '../data/systems/tormenta20/races/raceSizes/raceSizes';
import RACE_COUNTS_AS from '../data/systems/tormenta20/races/raceCountsAs';
import { migrateNotesToJournal } from './playerJournal';
import { getCompanionTrickDefinition } from '../data/systems/tormenta20/herois-de-arton/companion/companionTricks';
import GRANTED_POWERS from '../data/systems/tormenta20/powers/grantedPowers';
import { getSuragelAlternativeAbility } from '../data/systems/tormenta20/deuses-de-arton/races/suragelAbilities';
import {
  KAIJIN_CHARISMA_EXEMPT_POWER_NAMES,
  KAIJIN_REFRESHED_DESCRIPTIONS,
} from '../data/systems/tormenta20/ameacas-de-arton/races/kaijin';
import {
  CENTAURO_REFRESHED_DESCRIPTIONS,
  CENTAURO_REFRESHED_PREREQ_HOOKS,
} from '../data/systems/tormenta20/ameacas-de-arton/races/centauro';
import { getComplicationByName } from '../premium/data/complications';
import { getAgeBracket } from '../premium/data/ageBrackets';
import { getAgeComplicationByName } from '../premium/data/ageComplications';
import { WILD_SHAPE_POWER_KEY } from '../premium/data/wildShapes';
import { RETIRED_ACTIVE_POWER_KEYS } from '../premium/data/activePowers';
import {
  ARQUEIRO_SHEET_BONUSES,
  ESGRIMISTA_SHEET_BONUSES,
  ESTILO_DE_DISPARO_SHEET_BONUSES,
  INEXPUGNAVEL_SHEET_BONUSES,
} from '../data/systems/tormenta20/powers/classPowerSheetBonuses';
import {
  BOLSOES_INSANOS_SHEET_BONUSES,
  CARAPACA_CORROMPIDA_SHEET_BONUSES,
  PELE_CORROMPIDA_SHEET_BONUSES,
} from '../data/systems/tormenta20/powers/tormentaPowerSheetBonuses';

const VALID_ATRIBUTOS = Object.values(Atributo) as string[];

const GRANTED_POWERS_BY_NAME = new Map(
  Object.values(GRANTED_POWERS).map((power) => [power.name, power])
);

// Poderes cujos `sheetBonuses` passaram a existir depois de já haver fichas
// salvas com a cópia embutida SEM automação (Arqueiro, Esgrimista, Estilo de
// Disparo, Inexpugnável). Refrescamos a cópia embutida pelo dado atual para que
// a automação alcance essas fichas — mesmo princípio do refresh de poderes
// concedidos (GRANTED_POWERS) logo abaixo. Homebrew de mesmo nome ficaria com
// bônus sobrescrito, mas nenhum destes é reproduzível como homebrew hoje.
//
// Os três poderes da Tormenta abaixo são OBRIGATÓRIOS, não cosméticos:
// - Carapaça Corrompida e Pele Corrompida tinham a RD hardcoded por nome nos
//   dois motores; ao migrar para `sheetBonuses`, quem já tem o poder PERDERIA a
//   RD sem este refresh.
// - Bolsões Insanos era `Fixed: 2`, ignorando o "+1 para cada outro poder da
//   Tormenta"; sem o refresh a cópia errada fica travada para sempre.
const REFRESHED_POWER_BONUSES_BY_NAME = new Map<string, SheetBonus[]>([
  ['Arqueiro', ARQUEIRO_SHEET_BONUSES],
  ['Esgrimista', ESGRIMISTA_SHEET_BONUSES],
  ['Estilo de Disparo', ESTILO_DE_DISPARO_SHEET_BONUSES],
  ['Inexpugnável', INEXPUGNAVEL_SHEET_BONUSES],
  ['Carapaça Corrompida', CARAPACA_CORROMPIDA_SHEET_BONUSES],
  ['Pele Corrompida', PELE_CORROMPIDA_SHEET_BONUSES],
  ['Bolsões Insanos', BOLSOES_INSANOS_SHEET_BONUSES],
]);

function refreshPowerBonuses<
  T extends { name: string; sheetBonuses?: SheetBonus[] }
>(power: T): T {
  const bonuses = REFRESHED_POWER_BONUSES_BY_NAME.get(power.name);
  if (!bonuses) return power;
  return { ...power, sheetBonuses: _.cloneDeep(bonuses) };
}

// Habilidades de RAÇA (e o poder falso que uma delas concede) cujo texto
// divergia da fonte oficial. Fichas antigas embutem a cópia errada e abrir uma
// ficha não dispara recálculo, então a correção do dado sozinha só alcançaria
// fichas novas.
//
// Allowlist em vez de refresh genérico das habilidades pelo catálogo da raça:
// várias raças variam a descrição por instância (Osteon, Lefou, Golem,
// variantes de atributo), e um match cego por nome apagaria essa variação.
const REFRESHED_DESCRIPTIONS_BY_NAME = new Map<string, string>([
  ...Object.entries(KAIJIN_REFRESHED_DESCRIPTIONS),
  ...Object.entries(CENTAURO_REFRESHED_DESCRIPTIONS),
]);

function refreshDescription<T extends { name: string; description?: string }>(
  entry: T
): T {
  const description = REFRESHED_DESCRIPTIONS_BY_NAME.get(entry.name);
  if (!description) return entry;
  return { ...entry, description };
}

/**
 * Refresh dos hooks de pré-requisito das habilidades do CENTAURO. Diferente do
 * refresh de descrição acima, este não é cosmético: os valores errados liberavam
 * poderes de verdade na ficha (ver `CENTAURO_REFRESHED_PREREQ_HOOKS`), e
 * `isPowerAvailable`/`PowersEditDrawer` leem a cópia embutida na ficha, nunca o
 * catálogo — sem isto a correção só alcançaria fichas novas.
 *
 * Gated pelo nome da raça (e não por um mapa global por nome de habilidade, como
 * as descrições) porque aqui se está DESFAZENDO algo que já vale na ficha.
 */
function refreshCentauroPrereqHooks<
  T extends {
    name: string;
    bypassPrereqForPowersNamed?: string[];
    grantsPowerRequirements?: string[];
  }
>(ability: T): T {
  const hooks = CENTAURO_REFRESHED_PREREQ_HOOKS[ability.name];
  if (!hooks) return ability;

  const refreshed = { ...ability };
  if (hooks.bypassPrereqForPowersNamed) {
    refreshed.bypassPrereqForPowersNamed = [
      ...hooks.bypassPrereqForPowersNamed,
    ];
  } else {
    delete refreshed.bypassPrereqForPowersNamed;
  }
  if (hooks.grantsPowerRequirements) {
    refreshed.grantsPowerRequirements = [...hooks.grantsPowerRequirements];
  } else {
    delete refreshed.grantsPowerRequirements;
  }
  return refreshed;
}

/**
 * A arma natural do Centauro nasceu com `tipo: 'Perf.'` (o livro diz impacto). A
 * cópia que está na mochila da ficha é intocável pelo recálculo: o handler de
 * `addEquipment` é pulado por `isActionAlreadyApplied` assim que existe a entrada
 * `EquipmentAdded` no `sheetActionHistory`, então a arma errada ficaria congelada
 * para sempre. Curamos o campo in loco.
 *
 * Mutação direta em vez de `bag.addEquipment`: reinjetar o item o faria receber
 * um `id` novo, o que desequiparia a arma (os slots de mão apontam para o id) e
 * embaralharia o `displayOrder`. `tipo` não entra em nenhum cálculo — só na
 * exibição e no PDF.
 *
 * Gate triplo (raça + nome do item + valor antigo) para não encostar em uma arma
 * homebrew chamada "Cascos" e para ser idempotente numa segunda passada.
 */
function healCentauroHoovesDamageType(sheet: CharacterSheet): void {
  if (sheet.raca?.name !== 'Centauro') return;
  const weapons = sheet.bag?.equipments?.Arma;
  if (!Array.isArray(weapons)) return;
  weapons.forEach((weapon) => {
    if (weapon?.nome === 'Cascos' && weapon.tipo === 'Perf.') {
      // eslint-disable-next-line no-param-reassign
      weapon.tipo = 'Impac.';
    }
  });
}

// Poderes que sempre contaram como poder da Tormenta "exceto para perda de
// Carisma", mas cujo dado não setava a flag que implementa a ressalva. Ela é
// campo novo, então a cópia embutida nas fichas salvas não a tem — sem este
// carimbo a correção só alcançaria fichas novas.
const CHARISMA_EXEMPT_POWER_NAMES = new Set<string>(
  KAIJIN_CHARISMA_EXEMPT_POWER_NAMES
);

function refreshCharismaExemption<
  T extends { name: string; tormentaCountExcludesCharisma?: boolean }
>(power: T): T {
  if (!CHARISMA_EXEMPT_POWER_NAMES.has(power.name)) return power;
  if (power.tormentaCountExcludesCharisma) return power;
  return { ...power, tormentaCountExcludesCharisma: true };
}

// Poderes de ORIGEM cujos `sheetBonuses` DEIXARAM de valer sempre. Ao contrário
// dos refreshes acima (que só ligam automação nova), aqui é preciso também
// DESFAZER o que já foi aplicado: abrir uma ficha não dispara recálculo, então
// `sheetBonuses` e `completeSkills[].others` persistidos manteriam o bônus para
// sempre em quem já tinha a origem.
//
// Procurado: Vivo ou Morto — o +5 em Intimidação e o –5 em Diplomacia só valem
// contra quem, a critério do mestre, reconhece o personagem; viraram efeito
// ativo (`origin:procurado-vivo-ou-morto`). Allowlist em vez de refresh
// genérico das origens: homebrew e ajustes do usuário ficam intocados.
const ORIGIN_POWER_BONUSES_BY_NAME = new Map<string, SheetBonus[]>([
  ['Procurado: Vivo ou Morto', []],
]);

/**
 * Desfaz um `sheetBonus` de perícia que já estava aplicado e persistido na
 * ficha: remove a entrada de `sheetBonuses` (some do detalhamento do "Outros")
 * e devolve o valor a `completeSkills[].others` (some do número exibido).
 *
 * Só trata `Skill` + `Fixed`, que é o que os poderes desta allowlist aplicavam;
 * qualquer outra forma sai de `sheetBonuses` e o valor derivado se acerta no
 * próximo recálculo. `manualOthers` não é tocado.
 */
function undoPersistedSkillBonus(
  sheet: CharacterSheet,
  stale: SheetBonus
): void {
  const index = sheet.sheetBonuses.findIndex((bonus) =>
    _.isEqual(bonus, stale)
  );
  if (index === -1) return;
  sheet.sheetBonuses.splice(index, 1);

  const { target, modifier } = stale;
  if (target.type !== 'Skill' || modifier.type !== 'Fixed') return;

  const skill = sheet.completeSkills?.find((sk) => sk?.name === target.name);
  if (!skill || typeof skill.others !== 'number') return;
  skill.others -= modifier.value;
}

/**
 * Refresca a cópia embutida de um poder de origem pelo dado atual, desfazendo
 * os bônus que deixaram de existir. Idempotente: na segunda passada a cópia
 * embutida já está atualizada, então não sobra nada para desfazer.
 */
function refreshOriginPower<
  T extends { name: string; sheetBonuses?: SheetBonus[] }
>(sheet: CharacterSheet, power: T): T {
  const current = ORIGIN_POWER_BONUSES_BY_NAME.get(power.name);
  if (!current) return power;

  (power.sheetBonuses ?? [])
    .filter((stale) => !current.some((bonus) => _.isEqual(bonus, stale)))
    .forEach((stale) => undoPersistedSkillBonus(sheet, stale));

  // Cópia: o array do mapa é do módulo e seria compartilhado por todas as
  // fichas normalizadas na sessão.
  return { ...power, sheetBonuses: _.cloneDeep(current) };
}

const VALID_WEAPON_ATTRIBUTES = new Set([...VALID_ATRIBUTOS, 'Nenhum']);

/**
 * Saneia `weaponOverrides` (edições sobre armas virtuais). O mapa vem inteiro da
 * nuvem sem schema forte, então descartamos entradas que não são objeto e
 * atributos fora da união; entradas que ficam vazias somem, e o mapa some
 * quando não sobra nenhuma.
 */
function sanitizeWeaponOverrides(sheet: CharacterSheet): void {
  const raw = sheet.weaponOverrides;
  if (raw === undefined) return;
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    delete sheet.weaponOverrides;
    return;
  }

  const cleaned: NonNullable<CharacterSheet['weaponOverrides']> = {};
  Object.entries(raw).forEach(([key, entry]) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return;
    const next: WeaponOverride = {};
    if (typeof entry.customSkill === 'string')
      next.customSkill = entry.customSkill;
    if (VALID_WEAPON_ATTRIBUTES.has(entry.attackAttribute as string))
      next.attackAttribute = entry.attackAttribute;
    if (VALID_WEAPON_ATTRIBUTES.has(entry.damageAttribute as string))
      next.damageAttribute = entry.damageAttribute;
    if (Object.keys(next).length > 0) cleaned[key] = next;
  });

  if (Object.keys(cleaned).length === 0) delete sheet.weaponOverrides;
  else sheet.weaponOverrides = cleaned;
}

/**
 * Saneia os mapas de modificador temporário de atributo (`bonusAtributos`,
 * escrito pelo jogador, e `atributosTemporarios`, derivado do recálculo). Os
 * dois chegam da nuvem sem schema forte, e um valor não-numérico aqui vira NaN
 * em TODA derivação da ficha (perícias, ataque, Defesa, CD, carga).
 *
 * Descarta chaves fora do enum `Atributo` e valores não-finitos, poda zeros e
 * remove o campo quando não sobra nada — mapa vazio persistido viraria ruído no
 * delta da nuvem.
 */
function sanitizeAttributeModifierMaps(sheet: CharacterSheet): void {
  (['bonusAtributos', 'atributosTemporarios'] as const).forEach((field) => {
    const raw = sheet[field];
    if (raw === undefined) return;
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
      delete sheet[field];
      return;
    }

    const cleaned: Partial<Record<Atributo, number>> = {};
    Object.entries(raw).forEach(([key, value]) => {
      if (!VALID_ATRIBUTOS.includes(key)) return;
      if (typeof value !== 'number' || !Number.isFinite(value)) return;
      const rounded = Math.trunc(value);
      if (rounded === 0) return;
      cleaned[key as Atributo] = rounded;
    });

    if (Object.keys(cleaned).length === 0) delete sheet[field];
    else sheet[field] = cleaned;
  });
}

/**
 * Saneia os ELEMENTOS dos arrays da ficha. Garantir que os arrays existem não
 * basta: entradas nulas ou sem campos obrigatórios (magia sem `nome`, poder
 * sem `name`, entrada de histórico sem `changes`, step sem `value`) explodem
 * em `.map`/`.localeCompare`/`.forEach` no render do Result e em ~15 pontos do
 * recalculateSheet. Descarta o irrecuperável e repara o reparável.
 */
function sanitizeSheetElements(sheet: CharacterSheet): void {
  sheet.spells = sheet.spells
    .filter((s) => s && typeof s.nome === 'string')
    .map((s) => {
      if (s.aprimoramentos === undefined) return s;
      const aprimoramentos = Array.isArray(s.aprimoramentos)
        ? s.aprimoramentos.filter((a) => a && typeof a.text === 'string')
        : [];
      return { ...s, aprimoramentos };
    });

  sheet.skills = sheet.skills.filter((s) => typeof s === 'string');

  sheet.generalPowers = sheet.generalPowers
    .filter((p) => p && typeof p.name === 'string')
    .map(refreshPowerBonuses)
    .map(refreshDescription)
    .map(refreshCharismaExemption);
  if (sheet.classPowers) {
    sheet.classPowers = Array.isArray(sheet.classPowers)
      ? sheet.classPowers
          .filter((p) => p && typeof p.name === 'string')
          .map(refreshPowerBonuses)
      : [];
  }

  if (sheet.classe) {
    sheet.classe.abilities = sheet.classe.abilities
      .filter((a) => a && typeof a.name === 'string')
      .map((a) => (typeof a.nivel === 'number' ? a : { ...a, nivel: 1 }));
    if (sheet.classe.originalAbilities !== undefined) {
      sheet.classe.originalAbilities = Array.isArray(
        sheet.classe.originalAbilities
      )
        ? sheet.classe.originalAbilities
            .filter((a) => a && typeof a.name === 'string')
            .map((a) => (typeof a.nivel === 'number' ? a : { ...a, nivel: 1 }))
        : undefined;
    }
    sheet.classe.powers = sheet.classe.powers.filter(
      (p) => p && typeof p.name === 'string'
    );
    // Proficiência inválida (`null`/`undefined`) quebra tudo que compara nomes:
    // o aviso de não proficiência no Result, o PDF e o editor de proficiências.
    // Fichas antigas têm essas entradas porque o sorteio completava com
    // `undefined` quando as opções acabavam (ver pickFromArray).
    sheet.classe.proficiencias = sheet.classe.proficiencias.filter(
      (p) => typeof p === 'string' && p.length > 0
    );
  }
  if (sheet.customProficiencias !== undefined) {
    sheet.customProficiencias = Array.isArray(sheet.customProficiencias)
      ? sheet.customProficiencias.filter(
          (p) => typeof p === 'string' && p.length > 0
        )
      : undefined;
  }
  if (sheet.removedProficiencias !== undefined) {
    sheet.removedProficiencias = Array.isArray(sheet.removedProficiencias)
      ? sheet.removedProficiencias.filter(
          (p) => typeof p === 'string' && p.length > 0
        )
      : undefined;
  }

  if (sheet.raca) {
    sheet.raca.abilities = sheet.raca.abilities
      .filter((a) => a && typeof a.name === 'string')
      .map(refreshDescription);

    // `countsAsRaces` é dado estático de catálogo (nunca escolha do usuário),
    // então sobrescrever pelo mapa atual cura fichas salvas antes do campo
    // existir — sem isso, um Soterrado do localStorage continuaria sem acesso
    // aos poderes de raça de Osteon. O caminho da nuvem tem a cura equivalente
    // em `rehydrateSheet`.
    const countsAs = RACE_COUNTS_AS[sheet.raca.name];
    if (countsAs) sheet.raca.countsAsRaces = countsAs;

    if (sheet.raca.name === 'Centauro') {
      sheet.raca.abilities = sheet.raca.abilities.map(
        refreshCentauroPrereqHooks
      );
      healCentauroHoovesDamageType(sheet);
    }

    // Mesmo princípio do refresh de poderes concedidos abaixo: a ficha embute a
    // cópia da herança de Suraggel da época em que foi escolhida, e antes de
    // jul/2026 essa cópia levava só 4 campos. Refrescar pelo catálogo atual faz
    // as escolhas mecanizadas depois (habilidade élfica de Nivenciuén, forma
    // selvagem de Arbória/Chacina) alcançarem fichas antigas.
    if (sheet.suragelAbility) {
      const current = getSuragelAlternativeAbility(sheet.suragelAbility);
      const index = sheet.raca.abilities.findIndex(
        (a) => a.name === sheet.suragelAbility
      );
      if (current && index !== -1) {
        sheet.raca.abilities[index] = {
          ...sheet.raca.abilities[index],
          description: current.description,
          sheetBonuses: current.sheetBonuses,
          sheetActions: current.sheetActions,
        };
      }
    }
  }

  if (sheet.devoto) {
    // Fichas salvas embutem a cópia do poder da época em que foi escolhido; os
    // recálculos aplicam essa cópia, não a definição atual. Refrescar
    // `sheetBonuses`/`description` pelo dado atual para que correções nos
    // poderes concedidos alcancem fichas antigas. Poderes fora do core
    // (homebrew/outras fontes) não têm match e ficam intocados.
    sheet.devoto.poderes = sheet.devoto.poderes
      .filter((p) => p && typeof p.name === 'string')
      .map((p) => {
        const current = GRANTED_POWERS_BY_NAME.get(p.name);
        if (!current) return p;
        return {
          ...p,
          description: current.description,
          sheetBonuses: current.sheetBonuses,
        };
      });
  }

  if (sheet.origin) {
    sheet.origin.powers = Array.isArray(sheet.origin.powers)
      ? sheet.origin.powers
          .filter((p) => p && typeof p.name === 'string')
          .map((p) => refreshOriginPower(sheet, p))
      : [];
  }

  if (sheet.complication) {
    // Mesmo princípio do refresh de poderes concedidos acima: a ficha embute
    // a cópia da complicação da época da escolha; refrescar pelo dado atual
    // para que correções alcancem fichas antigas (sheetActions ficam como
    // estão — histórico já aplicado).
    const current = getComplicationByName(sheet.complication.name);
    if (current) {
      sheet.complication = {
        ...sheet.complication,
        description: current.description,
        type: current.type,
        className: current.className,
        behavioral: current.behavioral,
        prerequisite: current.prerequisite,
        sheetBonuses: current.sheetBonuses,
      };
    }
  }

  if (sheet.age) {
    // Idem para as complicações de idade: a ficha embute cópias, e refrescar
    // pelo catálogo faz correções de dados alcançarem fichas antigas. A faixa
    // etária em si não é copiada — `getAgeBracket` resolve pelo id.
    sheet.age.complications = (
      Array.isArray(sheet.age.complications) ? sheet.age.complications : []
    )
      .filter((c) => c && typeof c.name === 'string')
      .map((c) => {
        const current = getAgeComplicationByName(c.name);
        return current
          ? {
              ...c,
              description: current.description,
              sheetBonuses: current.sheetBonuses,
            }
          : c;
      });
  }

  // Result renderiza `step.value.map` e o recalculateSheet lê `step.label`.
  sheet.steps = sheet.steps.filter(
    (s) => s && typeof s.label === 'string' && Array.isArray(s.value)
  );

  sheet.sheetBonuses = sheet.sheetBonuses.filter(
    (b) => b && b.target && b.modifier
  );

  // recalculateSheet lê `entry.source.type` e itera `entry.changes`; a
  // reversão de poderes acessa `atributos[change.attribute]` sem validação.
  sheet.sheetActionHistory = sheet.sheetActionHistory
    .filter((e) => e && e.source && Array.isArray(e.changes))
    .map((e) => ({
      ...e,
      changes: e.changes.filter(
        (c) =>
          c &&
          typeof c.type === 'string' &&
          (c.type !== 'Attribute' || VALID_ATRIBUTOS.includes(c.attribute))
      ),
    }));

  // SkillTable acessa `atributos[skill.modAttr].value` quando modAttr é
  // truthy — um valor corrompido fora dos 6 atributos quebraria o render.
  // (completeSkills === undefined é válido: sinal de "reconstruir" no recalc.)
  if (sheet.completeSkills !== undefined) {
    sheet.completeSkills = Array.isArray(sheet.completeSkills)
      ? sheet.completeSkills
          .filter((sk) => sk && typeof sk.name === 'string')
          .map((sk) =>
            sk.modAttr && !VALID_ATRIBUTOS.includes(sk.modAttr)
              ? { ...sk, modAttr: undefined }
              : sk
          )
      : undefined;
  }

  // Truques de parceiro duplicados (bug histórico do LevelUpWizard, que
  // permitia repetir truques não-repetíveis): mantém a 1ª ocorrência (preserva
  // as `choices` originais); truques com canRepeat ficam intactos. O
  // recalculateSheet refaz os stats derivados na sequência.
  if (Array.isArray(sheet.companions)) {
    sheet.companions = sheet.companions.map((companion) => {
      if (!companion || !Array.isArray(companion.tricks)) return companion;
      const seen = new Set<string>();
      const tricks = companion.tricks.filter((t) => {
        if (!t || typeof t.name !== 'string') return false;
        const def = getCompanionTrickDefinition(t.name);
        if (def?.requirements?.canRepeat) return true;
        if (seen.has(t.name)) return false;
        seen.add(t.name);
        return true;
      });
      return tricks.length === companion.tricks.length
        ? companion
        : { ...companion, tricks };
    });
  }
}

/**
 * Repara invariantes estruturais de uma ficha desserializada (nuvem,
 * localStorage, embed). Documentos antigos ou corrompidos podem chegar sem
 * campos que o restante do app assume como sempre presentes (ex.: um delta
 * update que fez `$unset` de `atributos`), e qualquer acesso quebra o render
 * inteiro via ErrorBoundary.
 *
 * Chamado por `restoreSpellPath`, que já é o chokepoint de todos os caminhos
 * de carga de ficha (MainScreen, SheetViewPage, Owlbear, páginas premium).
 *
 * Regra: só PREENCHE o que falta com defaults neutros — nunca sobrescreve
 * dados presentes. Não fabrica `classe`/`raca` inteiras (ficha sem elas é
 * lixo irrecuperável; quem protege o render nesses casos é o try/catch dos
 * consumidores).
 */
export function normalizeSheet(sheet: CharacterSheet): void {
  if (!sheet.atributos) {
    sheet.atributos = {} as CharacterAttributes;
  }
  Object.values(Atributo).forEach((attr) => {
    const current = sheet.atributos[attr];
    if (!current || typeof current.value !== 'number') {
      sheet.atributos[attr] = { name: attr, value: 0 };
    }
  });

  if (typeof sheet.nome !== 'string') sheet.nome = '';
  if (typeof sheet.nivel !== 'number' || sheet.nivel < 1) sheet.nivel = 1;
  if (typeof sheet.pv !== 'number') sheet.pv = 0;
  if (typeof sheet.pm !== 'number') sheet.pm = 0;
  if (typeof sheet.defesa !== 'number') sheet.defesa = 10;
  if (typeof sheet.displacement !== 'number') sheet.displacement = 9;
  if (typeof sheet.maxSpaces !== 'number') {
    sheet.maxSpaces = 10 + sheet.atributos[Atributo.FORCA].value * 2;
  }

  if (!sheet.size || typeof sheet.size.name !== 'string') {
    sheet.size = _.cloneDeep(RACE_SIZES.MEDIO);
  }

  if (!sheet.bag) sheet.bag = Bag.fromStored();

  if (!Array.isArray(sheet.skills)) sheet.skills = [];
  if (!Array.isArray(sheet.spells)) sheet.spells = [];
  if (!Array.isArray(sheet.generalPowers)) sheet.generalPowers = [];
  if (!Array.isArray(sheet.sheetBonuses)) sheet.sheetBonuses = [];
  if (!Array.isArray(sheet.sheetActionHistory)) sheet.sheetActionHistory = [];
  if (!Array.isArray(sheet.steps)) sheet.steps = [];

  // Todo o pipeline (setup do Arcanista, recalculateSheet, UI) assume esses
  // arrays dentro de classe/raça. O Result acessa proficiencias/powers
  // diretamente (ex.: `classe.proficiencias.filter`).
  if (sheet.classe) {
    if (!Array.isArray(sheet.classe.abilities)) sheet.classe.abilities = [];
    if (!Array.isArray(sheet.classe.powers)) sheet.classe.powers = [];
    if (!Array.isArray(sheet.classe.proficiencias)) {
      sheet.classe.proficiencias = [];
    }
    if (!Array.isArray(sheet.classe.periciasbasicas)) {
      sheet.classe.periciasbasicas = [];
    }
    if (!Array.isArray(sheet.classe.periciasrestantes?.list)) {
      sheet.classe.periciasrestantes = { qtd: 0, list: [] };
    }
  }
  if (sheet.raca && !Array.isArray(sheet.raca.abilities)) {
    sheet.raca.abilities = [];
  }
  if (sheet.raca && !Array.isArray(sheet.raca.attributes?.attrs)) {
    sheet.raca.attributes = { attrs: [] };
  }

  // Complicação malformada (sem nome ou sem o poder concedido) não tem como
  // ser reaplicada nem exibida; descarta.
  if (
    sheet.complication &&
    (typeof sheet.complication.name !== 'string' ||
      typeof sheet.complication.grantedPowerName !== 'string')
  ) {
    delete sheet.complication;
  }

  // Idade com faixa etária desconhecida não resolve no catálogo — nem os
  // bônus nem o rótulo saem de pé, então descarta o bloco inteiro.
  if (sheet.age && !getAgeBracket(sheet.age.bracket)) {
    delete sheet.age;
  }
  if (sheet.age && typeof sheet.age.extraLevels !== 'number') {
    // `extraLevels` é só memória de quanto a faixa concedeu na criação; um
    // valor ausente vira 0 em vez de derrubar a ficha.
    sheet.age.extraLevels = 0;
  }

  // Devoto parcial (sem divindade) quebra o Result (`devoto.divindade.name`);
  // sem como reconstruir a divindade, remove o resto.
  if (sheet.devoto) {
    if (!sheet.devoto.divindade?.name) {
      delete sheet.devoto;
    } else if (!Array.isArray(sheet.devoto.poderes)) {
      sheet.devoto.poderes = [];
    }
  }

  // Companheiros animais sem id ou sem arquétipo não resolvem no catálogo de
  // parceiros: virariam cards vazios sem bônus nenhum.
  if (Array.isArray(sheet.animalCompanions)) {
    sheet.animalCompanions = sheet.animalCompanions.filter(
      (companion) =>
        !!companion &&
        typeof companion.id === 'string' &&
        typeof companion.archetype === 'string'
    );
  } else if (sheet.animalCompanions !== undefined) {
    delete sheet.animalCompanions;
  }

  // Efeitos ativos APOSENTADOS: a regra virou automação passiva, mas o efeito
  // salvo carrega os próprios `bonuses` e seria somado por cima do passivo novo.
  // Não mexemos em `defesa`/`reducaoDeDano` aqui — carregar a ficha não dispara
  // recálculo, e o próximo recálculo reconstrói os dois do zero.
  if (Array.isArray(sheet.activeEffects)) {
    sheet.activeEffects = sheet.activeEffects.filter(
      (effect) => !effect || !RETIRED_ACTIVE_POWER_KEYS.has(effect.powerKey)
    );
  }

  // Campos DERIVADOS da Forma Selvagem que podem ter sido serializados órfãos
  // (ficha salva no meio de uma transformação e depois editada por outro
  // caminho). `recalculateSheet` os recria a partir de `activeEffects`; deixar
  // um `baseSize` órfão travaria o tamanho da ficha para sempre.
  const inWildShape = (sheet.activeEffects ?? []).some(
    (effect) => effect?.powerKey === WILD_SHAPE_POWER_KEY
  );
  if (!inWildShape) {
    if (sheet.baseSize) {
      // O tamanho exibido ainda é o da forma: restaura antes de descartar.
      sheet.size = sheet.customSize ?? sheet.baseSize;
      delete sheet.baseSize;
    }
    delete sheet.computedMovementTypes;
  }

  // Overrides de arma virtual. Ao contrário dos campos derivados acima, estes
  // NÃO são podados fora da forma: o ponto deles é justamente persistir entre
  // transformações. Só sanidade de shape, contra ficha corrompida na nuvem.
  sanitizeWeaponOverrides(sheet);
  sanitizeAttributeModifierMaps(sheet);

  sanitizeSheetElements(sheet);

  // Anotações livres antigas viram o primeiro nó do Diário do Jogador. Só age
  // em ficha que TEM anotação e ainda NÃO tem diário, e não apaga o texto
  // original — ver `migrateNotesToJournal`.
  migrateNotesToJournal(sheet);
}

export default normalizeSheet;
