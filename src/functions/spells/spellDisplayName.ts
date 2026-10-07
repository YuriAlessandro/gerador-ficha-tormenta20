import { Spell } from '../../interfaces/Spells';

/**
 * Nome exibido de uma magia da ficha: o nome da engenhoca quando o Inventor
 * batizou a invenção, senão o nome da magia. `spell.nome` continua sendo a
 * identidade — use isto só para exibição (título, histórico, PDF).
 */
export function getSpellDisplayName(spell: Spell): string {
  const custom = spell.engenhoca?.nome?.trim();
  return custom || spell.nome;
}

export default getSpellDisplayName;
