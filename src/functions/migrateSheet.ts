import { CharacterAttributes } from '@/interfaces/Character';
import CharacterSheet from '@/interfaces/CharacterSheet';
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

  // Renomear perícia antiga "Ofício (Artesanato)" → "Ofício (Artesão)"
  if (Array.isArray(sheet.skills)) {
    migratedSheet.skills = sheet.skills.map((skill) =>
      (skill as string) === LEGACY_OFICIO_ARTESANATO
        ? Skill.OFICIO_ARTESANATO
        : skill
    );
  }

  if (Array.isArray(sheet.completeSkills)) {
    migratedSheet.completeSkills = sheet.completeSkills.map((skill) =>
      (skill.name as string) === LEGACY_OFICIO_ARTESANATO
        ? { ...skill, name: Skill.OFICIO_ARTESANATO }
        : skill
    );
  }

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

  if (!sheet.atributos) return false;

  // Verificar se algum atributo ainda tem o campo 'mod'
  return Object.values(sheet.atributos).some(
    (attr) =>
      'mod' in attr && (attr as LegacyCharacterAttribute).mod !== undefined
  );
}
