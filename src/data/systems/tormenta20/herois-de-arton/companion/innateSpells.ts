import { Spell } from '../../../../../interfaces/Spells';
import { allArcaneSpellsCircle1 } from '../../magias/arcane';
import { allDivineSpellsCircle1 } from '../../magias/divine';

/**
 * Opções de magia para o truque "Magia Inata" do melhor amigo (Treinador):
 * todas as magias de 1º círculo, arcanas ou divinas, sem duplicatas (mesmo
 * nome) e ordenadas alfabeticamente.
 *
 * Fonte única compartilhada entre a criação, a subida de nível e a edição do
 * parceiro, para evitar listas divergentes.
 */
export function getInnateSpellOptions(): Spell[] {
  const byName = new Map<string, Spell>();
  [...allArcaneSpellsCircle1, ...allDivineSpellsCircle1].forEach((spell) => {
    if (!byName.has(spell.nome)) byName.set(spell.nome, spell);
  });
  return Array.from(byName.values()).sort((a, b) =>
    a.nome.localeCompare(b.nome)
  );
}

/** Busca uma magia de Magia Inata pelo nome. */
export function findInnateSpell(name: string): Spell | undefined {
  return getInnateSpellOptions().find((spell) => spell.nome === name);
}
