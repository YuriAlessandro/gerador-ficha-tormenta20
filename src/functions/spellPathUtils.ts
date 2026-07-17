import { SpellPath } from '../interfaces/Class';
import { allSpellSchools } from '../interfaces/Spells';
import { pickFromArray } from './randomUtils';

/**
 * Resolve uma escolha de escolas pendente (`schoolChoice`) sorteando as
 * escolas — usado na geração aleatória, quando não há escolha do jogador.
 * No-op se a classe não tem escolha de escolas ou se `schools` já foi
 * definido (ex.: escolha do jogador no wizard ou valor restaurado de uma
 * ficha salva).
 *
 * IMPORTANTE: muta o spellPath recebido — chame sempre sobre uma cópia,
 * nunca sobre o objeto do registry (classes homebrew são compiladas uma
 * única vez por sessão).
 */
export function resolveSchoolChoice(spellPath: SpellPath): void {
  if (!spellPath.schoolChoice || spellPath.schools) return;
  const pool = spellPath.schoolChoice.available ?? allSpellSchools;
  spellPath.schools = pickFromArray(
    pool,
    Math.min(spellPath.schoolChoice.count, pool.length)
  );
}
