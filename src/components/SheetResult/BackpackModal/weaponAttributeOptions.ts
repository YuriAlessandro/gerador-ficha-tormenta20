import { Atributo } from '../../../data/systems/tormenta20/atributos';
import { WeaponAttribute } from '../../../interfaces/Equipment';

/**
 * Opções de atributo oferecidas nos seletores de ataque e dano de uma arma.
 * Vive num módulo próprio porque dois editores a consomem — o da Mochila
 * (`ItemEditorDialog`) e o da aba Ataques (`WeaponAttributesDialog`) — e listas
 * duplicadas divergiriam com o tempo.
 */
export const WEAPON_ATTRIBUTE_OPTIONS: WeaponAttribute[] = [
  Atributo.FORCA,
  Atributo.DESTREZA,
  Atributo.CONSTITUICAO,
  Atributo.INTELIGENCIA,
  Atributo.SABEDORIA,
  Atributo.CARISMA,
  'Nenhum',
];

/**
 * Rótulo do valor "vazio" no seletor de atributo de ATAQUE. Diferente do de
 * dano, que sempre mostra um atributo concreto (resolvido pela regra padrão),
 * o de ataque tem um estado "herda da perícia" que precisa ser nomeado.
 */
export const ATTACK_ATTRIBUTE_DEFAULT_LABEL = 'Padrão (atributo da perícia)';
