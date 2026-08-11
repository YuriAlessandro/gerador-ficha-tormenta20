import CharacterSheet from '../../interfaces/CharacterSheet';
import { Spell } from '../../interfaces/Spells';
import { SupplementId } from '../../types/supplement.types';
import { buildSpellPool } from '../spellPathUtils';
import { getDeityMaxSpellCircle } from '../powers/general';

/**
 * Magias DERIVADAS: classes com `spellPath.spellAccess === 'allOfType'` não
 * aprendem magia nenhuma — elas lançam qualquer magia do seu tipo nos círculos
 * a que têm acesso. Hoje só o Usurpador (habilidade "Usurpar").
 *
 * Contrato central: a lista é computada NO RENDER e **nunca** persistida em
 * `sheet.spells` — mesmo modelo de `getDeitySpellCircleWarning`. Gravá-la
 * inflaria a ficha em ~140 magias, quebraria o PDF e ficaria desatualizada a
 * cada mudança de nível ou de suplemento.
 */

/** Lista estável para o caso "sem acesso", para não recriar referência. */
const EMPTY_SPELLS = Object.freeze([] as Spell[]) as Spell[];

/** A classe lança qualquer magia do tipo em vez de aprender magias. */
export function hasDerivedSpellAccess(sheet: CharacterSheet): boolean {
  return sheet?.classe?.spellPath?.spellAccess === 'allOfType';
}

/**
 * Maior círculo acessível: progressão da classe limitada pelo status divino da
 * divindade (regra do Guia de Deuses Menores). `0` = sem acesso.
 *
 * Espelha `SpellsEditDrawer.canCastCircle` — se um mudar, o outro muda junto.
 */
export function getDerivedSpellCircle(sheet: CharacterSheet): number {
  const spellPath = sheet?.classe?.spellPath;
  if (!spellPath) return 0;
  // `spellCircleAvailableAtLevel` é função e se perde na serialização; fichas
  // carregadas antes do restoreSpellPath chegam aqui com ela ausente.
  if (typeof spellPath.spellCircleAvailableAtLevel !== 'function') return 0;

  const levelCircle = spellPath.spellCircleAvailableAtLevel(sheet.nivel);
  const deityMaxCircle = getDeityMaxSpellCircle(sheet);
  const circle =
    deityMaxCircle === null
      ? levelCircle
      : Math.min(levelCircle, deityMaxCircle);

  return Math.max(0, circle);
}

/**
 * Cache por (tipo, círculo, escolas, suplementos). Devolver a MESMA referência
 * entre chamadas é o que mantém o `useMemo` do Result barato e evita invalidar
 * os memos internos do SpellsDisplay — são ~140 objetos por entrada.
 *
 * O catálogo do registry é compartilhado, então o resultado é congelado: quem
 * precisar mutar uma magia (rolagens efêmeras) tem que clonar antes.
 */
const derivedSpellsCache = new Map<string, Spell[]>();

/**
 * Todas as magias do `spellType` da classe até o círculo acessível, vindas dos
 * suplementos ativos.
 *
 * Passa por `buildSpellPool` de propósito: é a implementação única do pool
 * (dedup, filtro de escolas, cross-tradition) e não deve ser reimplementada.
 */
export function getDerivedSpells(
  sheet: CharacterSheet,
  supplements: SupplementId[]
): Spell[] {
  if (!hasDerivedSpellAccess(sheet)) return EMPTY_SPELLS;

  const spellPath = sheet.classe.spellPath!;
  const circle = getDerivedSpellCircle(sheet);
  if (circle < 1) return EMPTY_SPELLS;

  const key = [
    spellPath.spellType,
    circle,
    (spellPath.schools ?? []).join(','),
    (spellPath.excludeSchools ?? []).join(','),
    [...supplements].sort().join(','),
  ].join('|');

  const cached = derivedSpellsCache.get(key);
  if (cached) return cached;

  const { spells } = buildSpellPool({
    spellPath,
    maxCircle: circle,
    supplements,
  });
  // Congelado porque a referência é compartilhada entre todos os renders (e
  // entre fichas com o mesmo círculo): quem precisar alterar uma magia tem que
  // clonar antes.
  const frozen = Object.freeze(spells) as Spell[];
  derivedSpellsCache.set(key, frozen);
  return frozen;
}

/** Texto explicativo exibido no topo da aba Magias, ou `null`. */
export function getDerivedSpellsNotice(sheet: CharacterSheet): string | null {
  if (!hasDerivedSpellAccess(sheet)) return null;

  const circle = getDerivedSpellCircle(sheet);
  if (circle < 1) return null;

  return (
    `Usurpar: você não aprende magias — pode lançar qualquer magia divina até ` +
    `o ${circle}º círculo passando em um teste de Enganação (CD 15 + custo em ` +
    `PM da magia). Se falhar, a magia é perdida mas os PM são gastos mesmo ` +
    `assim. Você não pode escolher 10 nesse teste e sofre penalidade de ` +
    `armadura nele, além de –5 em um local com símbolo sagrado visível.`
  );
}
