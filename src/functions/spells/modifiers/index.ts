/**
 * Motor de modificadores de magia — ponto de entrada.
 *
 *  - `catalog`  índice nome → `spellModifiers` declarados nos dados
 *  - `collect`  quais fontes a ficha tem (poderes, habilidades, itens)
 *  - `match`    filtro de magia (escola, tradição, nome, alcance, cura/dano)
 *  - `resolve`  perfil único de uma magia + custo e rolagens
 *  - `effects`  parte do perfil que mexe no efeito ativo da magia
 *
 * Para um poder/item novo afetar magias, declare `spellModifiers` nos dados;
 * nenhum consumidor precisa mudar.
 */
export {
  resolveSpellCast,
  computeSpellPmCost,
  getSpellDisplayPmCost,
  applySpellRollModifiers,
} from './resolve';
export type { SpellCastProfile } from './resolve';
export { applySpellEffectModifiers, hasSpellEffectModifiers } from './effects';
export type { EffectOptionLike } from './effects';
export { collectSheetSpellModifiers } from './collect';
export { spellMatchesFilter } from './match';
