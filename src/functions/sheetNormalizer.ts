import _ from 'lodash';
import CharacterSheet from '../interfaces/CharacterSheet';
import { CharacterAttributes } from '../interfaces/Character';
import Bag from '../interfaces/Bag';
import { Atributo } from '../data/systems/tormenta20/atributos';
import { RACE_SIZES } from '../data/systems/tormenta20/races/raceSizes/raceSizes';

const VALID_ATRIBUTOS = Object.values(Atributo) as string[];

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

  sheet.generalPowers = sheet.generalPowers.filter(
    (p) => p && typeof p.name === 'string'
  );
  if (sheet.classPowers) {
    sheet.classPowers = Array.isArray(sheet.classPowers)
      ? sheet.classPowers.filter((p) => p && typeof p.name === 'string')
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
    sheet.devoto.poderes = sheet.devoto.poderes.filter(
      (p) => p && typeof p.name === 'string'
    );
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
