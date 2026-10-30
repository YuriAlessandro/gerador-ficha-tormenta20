import type CharacterSheet from '../interfaces/CharacterSheet';

/**
 * Habilidades de classe APRENDIDAS fora da própria classe — origem "Duplo
 * Feérico" (`learnClassAbility`) e concessões como `grantSpecificClassAbility`.
 *
 * Elas moram em `classPowers` com o nome composto `"<Habilidade> (<Classe>)"`,
 * nunca em `classe.abilities`. Todo código que pergunta "a ficha tem a
 * habilidade X?" olhando só `classe.abilities` (ou o nome exato) deixa a
 * habilidade aprendida de fora — por isso o ponto único aqui.
 *
 * Regra do livro: o personagem usa a habilidade "como se tivesse 1 nível
 * naquela classe" — ver `LEARNED_CLASS_ABILITY_LEVEL`.
 *
 * Módulo FOLHA (só import de tipo), seguro para `general.ts` e `data/`.
 */

/** Nível de classe com que uma habilidade aprendida funciona. */
export const LEARNED_CLASS_ABILITY_LEVEL = 1;

export interface LearnedClassAbility {
  abilityName: string;
  className: string;
  /** Nome da entrada em `classPowers`. */
  entryName: string;
}

type LearnedSheet = Pick<CharacterSheet, 'sheetActionHistory' | 'classPowers'>;

export const composeLearnedAbilityName = (
  abilityName: string,
  className: string
): string => `${abilityName} (${className})`;

/**
 * Habilidades aprendidas ainda presentes na ficha. A fonte é o recibo
 * `ClassAbilityLearned` do histórico; exigir a entrada em `classPowers` descarta
 * o que o jogador já removeu.
 */
export function getLearnedClassAbilities(
  sheet: LearnedSheet
): LearnedClassAbility[] {
  const powerNames = new Set((sheet.classPowers ?? []).map((p) => p.name));
  const seen = new Set<string>();
  const learned: LearnedClassAbility[] = [];
  (sheet.sheetActionHistory ?? []).forEach((entry) => {
    entry.changes.forEach((change) => {
      if (change.type !== 'ClassAbilityLearned') return;
      const entryName = composeLearnedAbilityName(
        change.abilityName,
        change.className
      );
      if (!powerNames.has(entryName) || seen.has(entryName)) return;
      seen.add(entryName);
      learned.push({
        abilityName: change.abilityName,
        className: change.className,
        entryName,
      });
    });
  });
  return learned;
}

/** A ficha aprendeu a habilidade `abilityName` (de `className`, se dado)? */
export function hasLearnedClassAbility(
  sheet: LearnedSheet,
  abilityName: string,
  className?: string
): boolean {
  return getLearnedClassAbilities(sheet).some(
    (learned) =>
      learned.abilityName === abilityName &&
      (className === undefined || learned.className === className)
  );
}

/** `powerName` é a entrada de `classPowers` de uma habilidade aprendida? */
export function isLearnedClassAbilityEntry(
  sheet: LearnedSheet,
  powerName: string
): boolean {
  return getLearnedClassAbilities(sheet).some(
    (learned) => learned.entryName === powerName
  );
}

/**
 * A ficha tem a habilidade de classe `abilityName` — pela própria classe
 * (`classe.abilities`, já filtrada pelo nível) ou aprendida.
 */
export function sheetHasClassAbility(
  sheet: LearnedSheet & Pick<CharacterSheet, 'classe'>,
  abilityName: string
): boolean {
  return (
    (sheet.classe?.abilities ?? []).some((a) => a.name === abilityName) ||
    hasLearnedClassAbility(sheet, abilityName)
  );
}

/**
 * Autoconfiança (Nobre): Carisma no lugar de Destreza na Defesa — pela classe
 * ou aprendida pelo Duplo Feérico.
 */
export function usesCharismaForDefense(
  sheet: LearnedSheet & Pick<CharacterSheet, 'classe'>
): boolean {
  return (
    sheet.classe?.name === 'Nobre' ||
    hasLearnedClassAbility(sheet, 'Autoconfiança', 'Nobre')
  );
}
