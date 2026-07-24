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

/**
 * Teurgista Místico: "até N magias da tradição oposta POR CÍRCULO". O limite
 * (`crossTraditionLimit`) é contado por círculo, não globalmente — um círculo
 * já esgotado para de ofertar magias cross, mas círculos ainda abertos seguem
 * ofertando.
 *
 * Recebe o mapa `círculo -> nomes das magias cross ofertadas` e as magias já
 * conhecidas, e devolve:
 *   removeNames = nomes cross de círculos já no limite (remover do pool)
 *   keepNames   = nomes cross de círculos ainda abertos (marcação/enforcement)
 *
 * Nomes de magia são únicos e cada magia pertence a exatamente um círculo, então
 * os conjuntos por círculo são disjuntos e a contagem por nome é correta.
 */
export function partitionCrossTraditionByCircle(
  crossNamesByCircle: Map<number, Set<string>>,
  knownSpellNames: Iterable<string>,
  crossTraditionLimit: number
): { removeNames: Set<string>; keepNames: Set<string> } {
  const known = new Set(knownSpellNames);
  const removeNames = new Set<string>();
  const keepNames = new Set<string>();
  crossNamesByCircle.forEach((names) => {
    let knownInCircle = 0;
    names.forEach((n) => {
      if (known.has(n)) knownInCircle += 1;
    });
    const target =
      knownInCircle >= crossTraditionLimit ? removeNames : keepNames;
    names.forEach((n) => target.add(n));
  });
  return { removeNames, keepNames };
}
