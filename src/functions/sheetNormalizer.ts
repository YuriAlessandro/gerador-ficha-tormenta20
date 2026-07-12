import _ from 'lodash';
import CharacterSheet, { SheetBonus } from '../interfaces/CharacterSheet';
import { CharacterAttributes } from '../interfaces/Character';
import Bag from '../interfaces/Bag';
import { Atributo } from '../data/systems/tormenta20/atributos';
import { RACE_SIZES } from '../data/systems/tormenta20/races/raceSizes/raceSizes';
import { getCompanionTrickDefinition } from '../data/systems/tormenta20/herois-de-arton/companion/companionTricks';
import GRANTED_POWERS from '../data/systems/tormenta20/powers/grantedPowers';
import {
  ARQUEIRO_SHEET_BONUSES,
  ESGRIMISTA_SHEET_BONUSES,
  ESTILO_DE_DISPARO_SHEET_BONUSES,
} from '../data/systems/tormenta20/powers/classPowerSheetBonuses';

const VALID_ATRIBUTOS = Object.values(Atributo) as string[];

const GRANTED_POWERS_BY_NAME = new Map(
  Object.values(GRANTED_POWERS).map((power) => [power.name, power])
);

// Poderes cujos `sheetBonuses` passaram a existir depois de já haver fichas
// salvas com a cópia embutida SEM automação (Arqueiro, Esgrimista, Estilo de
// Disparo). Refrescamos a cópia embutida pelo dado atual para que a automação
// alcance essas fichas — mesmo princípio do refresh de poderes concedidos
// (GRANTED_POWERS) logo abaixo. Homebrew de mesmo nome ficaria com bônus
// sobrescrito, mas nenhum dos três é reproduzível como homebrew hoje.
const WEAPON_DAMAGE_POWER_BONUSES_BY_NAME = new Map<string, SheetBonus[]>([
  ['Arqueiro', ARQUEIRO_SHEET_BONUSES],
  ['Esgrimista', ESGRIMISTA_SHEET_BONUSES],
  ['Estilo de Disparo', ESTILO_DE_DISPARO_SHEET_BONUSES],
]);

function refreshWeaponDamagePower<
  T extends { name: string; sheetBonuses?: SheetBonus[] }
>(power: T): T {
  const bonuses = WEAPON_DAMAGE_POWER_BONUSES_BY_NAME.get(power.name);
  if (!bonuses) return power;
  return { ...power, sheetBonuses: bonuses };
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
    .map(refreshWeaponDamagePower);
  if (sheet.classPowers) {
    sheet.classPowers = Array.isArray(sheet.classPowers)
      ? sheet.classPowers
          .filter((p) => p && typeof p.name === 'string')
          .map(refreshWeaponDamagePower)
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
  }

  if (sheet.raca) {
    sheet.raca.abilities = sheet.raca.abilities.filter(
      (a) => a && typeof a.name === 'string'
    );
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
      ? sheet.origin.powers.filter((p) => p && typeof p.name === 'string')
      : [];
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

  // Devoto parcial (sem divindade) quebra o Result (`devoto.divindade.name`);
  // sem como reconstruir a divindade, remove o resto.
  if (sheet.devoto) {
    if (!sheet.devoto.divindade?.name) {
      delete sheet.devoto;
    } else if (!Array.isArray(sheet.devoto.poderes)) {
      sheet.devoto.poderes = [];
    }
  }

  sanitizeSheetElements(sheet);
}

export default normalizeSheet;
