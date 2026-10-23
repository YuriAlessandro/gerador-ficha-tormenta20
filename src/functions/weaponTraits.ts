import Equipment from '../interfaces/Equipment';

/**
 * Habilidades de arma do livro que poderes consultam, gravadas como
 * `weaponTags` no catálogo (`equipamentos.ts` e suplementos). Por serem tags,
 * o jogador marca/desmarca no editor de item e em armas personalizadas e
 * homebrew — e a mesma checagem vale para todas.
 *
 * Fichas salvas recebem as tags do catálogo em `refreshBagItemsFromCatalog`
 * (a não ser que o jogador tenha editado as tags do item — `hasManualTags`).
 *
 * Fonte das marcações no catálogo: tabela de armas (seções "Corpo a Corpo —
 * Leves") e descrições ("é uma arma ágil") de cada livro. A regra opcional
 * "Mais Armas Ágeis" (Heróis de Arton) NÃO é aplicada.
 */
export const WEAPON_TAG_LEVE = 'leve';
export const WEAPON_TAG_AGIL = 'agil';
export const WEAPON_TAG_ESPADA = 'espada';

/**
 * Comparação sem caixa nem acento: as tags são texto livre no editor e no
 * homebrew, e "Ágil"/"Leve" digitados à mão têm que valer como `agil`/`leve`.
 */
const normalizeTag = (tag: string): string =>
  tag
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

const hasWeaponTag = (weapon: Equipment, tag: string): boolean =>
  weapon.weaponTags?.some((t) => normalizeTag(t) === tag) === true;

/**
 * A arma é leve ou ágil? Usada pelo filtro `lightOrAgileOnly` (poder
 * Esgrimista), sempre junto de `meleeOnly` — que é quem exclui o uso à
 * distância.
 */
export function isLightOrAgileMeleeWeapon(weapon: Equipment): boolean {
  return (
    hasWeaponTag(weapon, WEAPON_TAG_LEVE) ||
    hasWeaponTag(weapon, WEAPON_TAG_AGIL)
  );
}

/**
 * A arma é uma arma de DISPARO? (arcos, bestas, armas de fogo, funda) — arma à
 * distância que NÃO é de arremesso. Usada pelo filtro `firingOnly` (poder
 * Estilo de Disparo). Espelha a lógica de `meleeOnly` invertida em
 * `weaponMatchesBonus`: tem alcance real e `arremesso` falso.
 */
export function isFiringWeapon(weapon: Equipment): boolean {
  const { alcance } = weapon;
  return !!alcance && alcance !== '-' && !weapon.arremesso;
}

/**
 * A arma é uma espada? Usada pela condição `wieldingSword` e pelo filtro
 * `swordOnly` (Estilo Clássico).
 *
 * Critério do catálogo: a arma é descrita como espada nas regras/no nome. Fora:
 * Cinquedea e Dirk (o livro as trata como adagas/punhais) e Neko-te/Mordida do
 * diabo.
 */
export function isSword(weapon: Equipment): boolean {
  return hasWeaponTag(weapon, WEAPON_TAG_ESPADA);
}
