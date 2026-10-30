/**
 * Bardo lança só magias ARCANAS das escolas escolhidas (JdA: "Você pode lançar
 * magias arcanas de 1º círculo que pertençam a essas escolas"). Divinas só via
 * Aumentar Repertório. O spellPath era `'Both'`, então o assistente de subir
 * de nível (e a geração aleatória) ofertava magias divinas das escolas.
 */
import { describe, it, expect } from 'vitest';
import { restoreSpellPath } from '../../functions/general';
import { buildSpellPathFromSetup } from '../../functions/multiclass';
import { buildSpellPool } from '../../functions/spellPathUtils';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { SpellSchool } from '../../interfaces/Spells';
import { dataRegistry } from '../../data/registry';
import { SupplementId } from '../../types/supplement.types';
import BARDO from '../../data/systems/tormenta20/classes/bardo';

const supplements = [SupplementId.TORMENTA20_CORE];
const schools: SpellSchool[] = ['Encan', 'Ilusão', 'Evoc'];

function arcaneNamesUpTo(maxCircle: number): Set<string> {
  const names = new Set<string>();
  for (let circle = 1; circle <= maxCircle; circle += 1) {
    const byCircle = dataRegistry.getSpellsByCircleAndSupplements(
      circle,
      supplements
    );
    Object.values(byCircle.arcane)
      .flat()
      .forEach((spell) => names.add(spell.nome));
  }
  return names;
}

describe('Bardo - magias arcanas', () => {
  it('setup() define o Bardo como conjurador arcano', () => {
    const classe = BARDO.setup!(BARDO);
    expect(classe.spellPath?.spellType).toBe('Arcane');
  });

  it('o pool de magias só tem arcanas das escolas escolhidas', () => {
    const spellPath = { ...BARDO.setup!(BARDO).spellPath!, schools };
    const pool = buildSpellPool({ spellPath, maxCircle: 4, supplements });
    const arcane = arcaneNamesUpTo(4);

    expect(pool.spells.length).toBeGreaterThan(0);
    pool.spells.forEach((spell) => {
      expect(arcane.has(spell.nome)).toBe(true);
      expect(schools).toContain(spell.school);
    });
  });

  it('multiclasse em Bardo também é arcana', () => {
    const spellPath = buildSpellPathFromSetup('Bardo', undefined, {
      spellSchools: schools,
    });
    expect(spellPath?.spellType).toBe('Arcane');
    expect(spellPath?.schools).toEqual(schools);
  });

  it("ficha salva com spellType 'Both' vira arcana ao carregar, mantendo as escolas", () => {
    const sheet = {
      classe: {
        ...BARDO,
        spellPath: { spellType: 'Both', initialSpells: 2, schools },
      },
    } as unknown as CharacterSheet;

    restoreSpellPath(sheet, dataRegistry.getClassesBySupplements(supplements));

    expect(sheet.classe.spellPath?.spellType).toBe('Arcane');
    expect(sheet.classe.spellPath?.schools).toEqual(schools);
  });
});
