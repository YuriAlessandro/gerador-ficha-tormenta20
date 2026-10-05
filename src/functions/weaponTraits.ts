import Equipment from '../interfaces/Equipment';

/**
 * Armas corpo a corpo LEVES ou ÁGEIS (por nome).
 *
 * O catálogo de armas (`equipamentos.ts` e suplementos) NÃO codifica as
 * propriedades "leve"/"ágil" em campo estruturado — elas só existem no texto
 * das regras. Por isso a marcação é feita por nome, no mesmo espírito de
 * `CORE_WEAPON_CATEGORY_BY_NAME` em `proficiencies.ts`: cobre também as cópias
 * de armas embutidas em fichas salvas (que não carregam campos novos).
 *
 * Fonte de cada entrada:
 * - Heróis de Arton: extraídas das seções "Corpo a Corpo — Leves" do próprio
 *   arquivo de dados (`herois-de-arton/equipment/weapons.ts`) — autoritativo.
 * - Core (T20 Jambô): pela propriedade "Leve"/"Ágil" da tabela de armas oficial.
 *
 * TODO (revisar RAW com o usuário): candidatas cujo status "leve/ágil" não é
 * confirmável pelos dados e ficou fora por precaução — incluir apenas após
 * conferência no livro. Uma inclusão errada bufa indevidamente o dano, então o
 * default é conservador (na dúvida, fora):
 *   'Foice', 'Cimitarra', 'Corrente de Espinhos' (core),
 *   'Rapieira', 'Espadim', 'Espada canora' (Heróis de Arton),
 *   'Neko-te', 'Gládio', 'Espada vespa', 'Mordida do diabo',
 *   'Presa de serpente' (Ameaças de Arton).
 */
export const LIGHT_OR_AGILE_MELEE_WEAPON_NAMES: ReadonlySet<string> = new Set([
  // Core
  'Adaga',
  'Espada Curta',
  'Manopla',
  'Machadinha',
  'Florete',
  'Chicote',
  // Heróis de Arton — seções "Corpo a Corpo — Leves"
  'Bastão lúdico',
  'Adaga oposta',
  'Agulha de Ahlen',
  'Cinquedea',
  'Dirk',
  'Martelo leve',
  'Kimbata',
]);

/**
 * A arma é corpo a corpo leve ou ágil? Usada pelo filtro `lightOrAgileOnly`
 * (poder Esgrimista). Membership por nome — a lista contém apenas armas corpo a
 * corpo, então não precisa de checagem extra de alcance.
 */
export function isLightOrAgileMeleeWeapon(weapon: Equipment): boolean {
  return LIGHT_OR_AGILE_MELEE_WEAPON_NAMES.has(weapon.nome);
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
 * ESPADAS (por nome) — o catálogo não tem campo de "tipo de arma", então, como
 * as listas acima, a marcação é por nome de catálogo. Usada pela condição
 * `wieldingSword` e pelo filtro `swordOnly` (Estilo Clássico).
 *
 * Critério: a arma é descrita como espada nas regras/no nome. Fora: Cinquedea
 * e Dirk (o livro as trata como adagas/punhais) e Neko-te/Mordida do diabo.
 */
export const SWORD_WEAPON_NAMES: ReadonlySet<string> = new Set([
  // Core
  'Espada Curta',
  'Cimitarra',
  'Espada Longa',
  'Florete',
  'Alfange',
  'Montante',
  'Espada Bastarda',
  'Katana',
  // Heróis de Arton
  'Espada larga',
  'Espadim',
  'Espada de execução',
  'Espada canora',
  'Espada-gadanho',
  'Khopesh',
  'Rapieira',
  'Montante cinético',
  // Ameaças de Arton
  'Gládio',
  'Espada vespa',
  'Presa de serpente',
]);

/** A arma é uma espada? Membership por nome de catálogo. */
export function isSword(weapon: Equipment): boolean {
  return SWORD_WEAPON_NAMES.has(weapon.nome);
}
