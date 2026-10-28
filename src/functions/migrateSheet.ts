import { CharacterAttributes } from '@/interfaces/Character';
import CharacterSheet, {
  SheetActionHistoryEntry,
  SheetActionReceipt,
} from '@/interfaces/CharacterSheet';
import Skill from '@/interfaces/Skills';

/**
 * Nome antigo da perícia de Ofício de artesão, antes do rename para o nome do
 * livro ("Ofício (Artesão)" = Skill.OFICIO_ARTESANATO).
 */
const LEGACY_OFICIO_ARTESANATO = 'Ofício (Artesanato)';

/**
 * Interface do atributo antigo (antes da migração)
 * O sistema antigo tinha tanto `value` (valor base) quanto `mod` (modificador)
 */
interface LegacyCharacterAttribute {
  name: string;
  value: number;
  mod?: number; // Campo que foi removido na nova versão
}

interface LegacyCharacterAttributes {
  [key: string]: LegacyCharacterAttribute;
}

/**
 * Migra atributos do formato antigo (value + mod) para o novo formato (apenas value como modificador)
 * @param attrs - Atributos no formato antigo ou novo
 * @returns Atributos no formato novo
 */
export function migrateAttributes(
  attrs: LegacyCharacterAttributes | CharacterAttributes
): CharacterAttributes {
  const migrated: Record<string, { name: string; value: number }> = {};

  Object.entries(attrs).forEach(([key, attr]) => {
    if ('mod' in attr && attr.mod !== undefined) {
      // Formato antigo: usar mod como novo value
      migrated[key] = {
        name: attr.name,
        value: attr.mod,
      };
    } else {
      // Já está no formato novo
      migrated[key] = {
        name: attr.name,
        value: attr.value,
      };
    }
  });

  return migrated as CharacterAttributes;
}

/**
 * Renomeia, EM UM LUGAR SÓ, a perícia antiga "Ofício (Artesanato)" para o nome
 * do livro "Ofício (Artesão)" (`Skill.OFICIO_ARTESANATO`).
 *
 * Muta a ficha recebida, porque o chamador principal é `normalizeSheet`, que
 * também muta. Idempotente: rodar duas vezes não muda nada.
 *
 * Por que fica fora de `migrateSheet`: `migrateSheet` só é chamado no Histórico
 * e em Meus Personagens, então ficha da nuvem/embed/mesa virtual nunca migrava
 * e o pré-requisito de Ofício (Artesão) — inclusive a substituição do poder
 * Artesão Criativo — falhava em silêncio. Quem chama isso em todo caminho de
 * carga é `normalizeSheet`.
 */
export function migrateLegacyOficioArtesao(sheet: CharacterSheet): void {
  if (Array.isArray(sheet.skills)) {
    sheet.skills = sheet.skills.map((skill) =>
      (skill as string) === LEGACY_OFICIO_ARTESANATO
        ? Skill.OFICIO_ARTESANATO
        : skill
    );
  }

  if (Array.isArray(sheet.completeSkills)) {
    sheet.completeSkills = sheet.completeSkills.map((skill) =>
      (skill?.name as string) === LEGACY_OFICIO_ARTESANATO
        ? { ...skill, name: Skill.OFICIO_ARTESANATO }
        : skill
    );
  }
}

/**
 * Poderes renomeados para o nome do livro: nome antigo → nome atual. A ficha
 * guarda o nome do poder, que é a chave do refresh do catálogo, do resumo e
 * do desfazer nível — sem renomear, a ficha antiga perde a ligação com ele.
 */
const LEGACY_POWER_NAMES: Record<string, string> = {
  // JdA p. 58 (Clérigo). O nome antigo confundia com o acessório.
  'Símbolo Sagrado Abençoado': 'Símbolo Sagrado Energizado',
};

/** Nome atual do poder (o próprio nome, se não foi renomeado). */
export const currentPowerName = (name: string): string =>
  LEGACY_POWER_NAMES[name] ?? name;

const isLegacyPowerName = (name: string | undefined): boolean =>
  name !== undefined && name in LEGACY_POWER_NAMES;

function renameLegacyPowers<T extends { name: string }>(powers: T[]): T[] {
  return powers.map((power) =>
    isLegacyPowerName(power?.name)
      ? { ...power, name: currentPowerName(power.name) }
      : power
  );
}

function hasLegacyPowerName(sheet: CharacterSheet): boolean {
  const powers = [
    ...(Array.isArray(sheet.classPowers) ? sheet.classPowers : []),
    ...(Array.isArray(sheet.generalPowers) ? sheet.generalPowers : []),
  ];
  return powers.some((power) => isLegacyPowerName(power?.name));
}

function migrateHistoryEntry(
  entry: SheetActionHistoryEntry
): SheetActionHistoryEntry {
  if (!entry) return entry;
  const { source, powerName, changes } = entry;
  const legacySource =
    source?.type === 'power' && isLegacyPowerName(source.name);
  const legacyChange = (change: SheetActionReceipt) =>
    (change?.type === 'PowerAdded' || change?.type === 'ClassPowerAdded') &&
    isLegacyPowerName(change.powerName);
  const hasLegacyChange = Array.isArray(changes) && changes.some(legacyChange);
  if (!legacySource && !isLegacyPowerName(powerName) && !hasLegacyChange) {
    return entry;
  }

  return {
    ...entry,
    source:
      legacySource && source.type === 'power'
        ? { ...source, name: currentPowerName(source.name) }
        : source,
    ...(powerName !== undefined && {
      powerName: currentPowerName(powerName),
    }),
    changes: hasLegacyChange
      ? changes.map((change) =>
          legacyChange(change) && 'powerName' in change
            ? { ...change, powerName: currentPowerName(change.powerName) }
            : change
        )
      : changes,
  };
}

/**
 * Renomeia poderes com nome antigo nos poderes escolhidos, na cópia da classe
 * e no histórico de ações (origem, `powerName` e recibos de poder adicionado).
 */
export function migrateLegacyPowerNames(sheet: CharacterSheet): void {
  if (Array.isArray(sheet.classPowers)) {
    sheet.classPowers = renameLegacyPowers(sheet.classPowers);
  }
  if (Array.isArray(sheet.generalPowers)) {
    sheet.generalPowers = renameLegacyPowers(sheet.generalPowers);
  }
  // Classe nova em vez de mutar: `migrateSheet` trabalha numa cópia rasa.
  if (Array.isArray(sheet.classe?.powers)) {
    sheet.classe = {
      ...sheet.classe,
      powers: renameLegacyPowers(sheet.classe.powers),
    };
  }
  if (Array.isArray(sheet.sheetActionHistory)) {
    sheet.sheetActionHistory =
      sheet.sheetActionHistory.map(migrateHistoryEntry);
  }
}

/**
 * Migra uma ficha completa, aplicando todas as migrações necessárias
 * @param sheet - Ficha no formato antigo ou novo
 * @returns Ficha no formato atual
 */
export function migrateSheet(sheet: CharacterSheet): CharacterSheet {
  const migratedSheet = { ...sheet };

  // Migrar atributos se necessário
  if (sheet.atributos) {
    migratedSheet.atributos = migrateAttributes(sheet.atributos);
  }

  // Remover campo manualAttributeEdits se existir (não é mais usado)
  if ('manualAttributeEdits' in migratedSheet) {
    delete (
      migratedSheet as CharacterSheet & {
        manualAttributeEdits?: Record<string, number>;
      }
    ).manualAttributeEdits;
  }

  migrateLegacyOficioArtesao(migratedSheet);
  migrateLegacyPowerNames(migratedSheet);

  return migratedSheet;
}

/**
 * Verifica se uma ficha precisa de migração
 * @param sheet - Ficha a verificar
 * @returns true se precisa de migração
 */
export function needsMigration(sheet: CharacterSheet): boolean {
  // Perícia antiga "Ofício (Artesanato)" precisa ser renomeada
  const hasLegacyOficio =
    (Array.isArray(sheet.skills) &&
      sheet.skills.some(
        (skill) => (skill as string) === LEGACY_OFICIO_ARTESANATO
      )) ||
    (Array.isArray(sheet.completeSkills) &&
      sheet.completeSkills.some(
        (skill) => (skill.name as string) === LEGACY_OFICIO_ARTESANATO
      ));
  if (hasLegacyOficio) return true;

  if (hasLegacyPowerName(sheet)) return true;

  if (!sheet.atributos) return false;

  // Verificar se algum atributo ainda tem o campo 'mod'
  return Object.values(sheet.atributos).some(
    (attr) =>
      'mod' in attr && (attr as LegacyCharacterAttribute).mod !== undefined
  );
}
