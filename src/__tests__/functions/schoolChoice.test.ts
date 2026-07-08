/**
 * Testes da escolha de escolas de magia (spellPath.schoolChoice), usada por
 * classes homebrew conjuradoras (estilo Bardo, mas declarativa — sem setup()).
 * Cobre o sorteio por ficha, a escolha do jogador via classSetup e a
 * não-contaminação do registry (spellPath compilado uma vez por sessão).
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resolveSchoolChoice } from '../../functions/spellPathUtils';
import {
  buildSpellPathFromSetup,
  applySerializedOverrides,
  serializeSpellPath,
} from '../../functions/multiclass';
import { restoreSpellPath } from '../../functions/general';
import { dataRegistry } from '../../data/registry';
import { allSpellSchools, SpellSchool } from '../../interfaces/Spells';
import { ClassDescription, SpellPath } from '../../interfaces/Class';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import { SupplementData } from '../../data/systems/tormenta20/core';
import { SupplementId } from '../../types/supplement.types';

const HOMEBREW_ID = 'homebrew:test-conjurador';
const POOL: SpellSchool[] = ['Evoc', 'Necro', 'Ilusão'];

const makeSpellPath = (): SpellPath => ({
  initialSpells: 2,
  spellType: 'Arcane',
  schoolChoice: { count: 2, available: [...POOL] },
  qtySpellsLearnAtLevel: () => 1,
  spellCircleAvailableAtLevel: () => 1,
  keyAttribute: Atributo.INTELIGENCIA,
});

const makeHomebrewClass = (): ClassDescription =>
  ({
    name: 'Conjurador Teste',
    pv: 8,
    addpv: 2,
    pm: 4,
    addpm: 4,
    periciasbasicas: [],
    periciasrestantes: { qtd: 2, list: [] },
    proficiencias: [],
    abilities: [],
    powers: [],
    probDevoto: 0,
    attrPriority: [],
    spellPath: makeSpellPath(),
  } as unknown as ClassDescription);

describe('resolveSchoolChoice', () => {
  it('sorteia `count` escolas do pool disponível', () => {
    const spellPath = makeSpellPath();
    resolveSchoolChoice(spellPath);
    expect(spellPath.schools).toHaveLength(2);
    spellPath.schools!.forEach((school) => {
      expect(POOL).toContain(school);
    });
  });

  it('usa todas as escolas quando `available` está ausente', () => {
    const spellPath = makeSpellPath();
    spellPath.schoolChoice = { count: 3 };
    resolveSchoolChoice(spellPath);
    expect(spellPath.schools).toHaveLength(3);
    spellPath.schools!.forEach((school) => {
      expect(allSpellSchools).toContain(school);
    });
  });

  it('não sobrescreve `schools` já definido (escolha do jogador/restore)', () => {
    const spellPath = makeSpellPath();
    spellPath.schools = ['Abjur'];
    resolveSchoolChoice(spellPath);
    expect(spellPath.schools).toEqual(['Abjur']);
  });

  it('é no-op sem `schoolChoice`', () => {
    const spellPath = makeSpellPath();
    delete spellPath.schoolChoice;
    resolveSchoolChoice(spellPath);
    expect(spellPath.schools).toBeUndefined();
  });

  it('limita `count` ao tamanho do pool (config defensiva)', () => {
    const spellPath = makeSpellPath();
    spellPath.schoolChoice = { count: 10, available: [...POOL] };
    resolveSchoolChoice(spellPath);
    expect(spellPath.schools).toHaveLength(POOL.length);
  });
});

describe('schoolChoice com classe homebrew no registry', () => {
  beforeEach(() => {
    dataRegistry.registerRuntimeSupplement(HOMEBREW_ID, {
      id: HOMEBREW_ID,
      races: [],
      classes: [makeHomebrewClass()],
      powers: { GERAL: [], COMBATE: [], DESTINO: [], MAGIA: [], TORMENTA: [] },
    } as unknown as SupplementData);
  });

  afterEach(() => {
    dataRegistry.unregisterRuntimeSupplement(HOMEBREW_ID);
  });

  const getRegistryClass = (): ClassDescription | undefined =>
    dataRegistry
      .getClassesBySupplements([
        SupplementId.TORMENTA20_CORE,
        HOMEBREW_ID as unknown as SupplementId,
      ])
      .find((c) => c.name === 'Conjurador Teste');

  describe('buildSpellPathFromSetup', () => {
    it('usa as escolas escolhidas pelo jogador (classSetup.spellSchools)', () => {
      const spellPath = buildSpellPathFromSetup('Conjurador Teste', undefined, {
        spellSchools: ['Evoc', 'Ilusão'],
      });
      expect(spellPath?.schools).toEqual(['Evoc', 'Ilusão']);
    });

    it('sorteia do pool quando não há escolha do jogador', () => {
      const spellPath = buildSpellPathFromSetup(
        'Conjurador Teste',
        undefined,
        undefined
      );
      expect(spellPath?.schools).toHaveLength(2);
      spellPath?.schools!.forEach((school) => {
        expect(POOL).toContain(school);
      });
    });

    it('não muta o spellPath da classe no registry', () => {
      const spellPath = buildSpellPathFromSetup('Conjurador Teste', undefined, {
        spellSchools: ['Necro', 'Ilusão'],
      });
      applySerializedOverrides(
        spellPath!,
        serializeSpellPath(spellPath!, 'Conjurador Teste')
      );
      expect(getRegistryClass()?.spellPath?.schools).toBeUndefined();
    });
  });

  describe('restoreSpellPath', () => {
    const classesWithHomebrew = () =>
      dataRegistry.getClassesBySupplements([
        SupplementId.TORMENTA20_CORE,
        HOMEBREW_ID as unknown as SupplementId,
      ]);

    it('restaura funções e preserva as escolas escolhidas na ficha salva', () => {
      const sheet = {
        classe: {
          name: 'Conjurador Teste',
          // spellPath serializado: funções perdidas no JSON, escolas escolhidas
          spellPath: {
            initialSpells: 2,
            spellType: 'Arcane',
            schools: ['Evoc', 'Necro'],
            keyAttribute: Atributo.INTELIGENCIA,
          },
        },
      } as unknown as CharacterSheet;

      restoreSpellPath(sheet, classesWithHomebrew());

      expect(typeof sheet.classe.spellPath?.qtySpellsLearnAtLevel).toBe(
        'function'
      );
      expect(sheet.classe.spellPath?.schools).toEqual(['Evoc', 'Necro']);
    });

    it('não contamina o registry com as escolas de uma ficha carregada', () => {
      const sheetA = {
        classe: {
          name: 'Conjurador Teste',
          spellPath: {
            initialSpells: 2,
            spellType: 'Arcane',
            schools: ['Evoc', 'Necro'],
            keyAttribute: Atributo.INTELIGENCIA,
          },
        },
      } as unknown as CharacterSheet;
      restoreSpellPath(sheetA, classesWithHomebrew());

      // A classe do registry segue com a escolha pendente (schools undefined)
      expect(getRegistryClass()?.spellPath?.schools).toBeUndefined();

      // Uma segunda ficha sem escolas salvas não herda as escolas da primeira
      const sheetB = {
        classe: {
          name: 'Conjurador Teste',
          spellPath: {
            initialSpells: 2,
            spellType: 'Arcane',
            keyAttribute: Atributo.INTELIGENCIA,
          },
        },
      } as unknown as CharacterSheet;
      restoreSpellPath(sheetB, classesWithHomebrew());
      expect(sheetB.classe.spellPath?.schools).toBeUndefined();
    });
  });
});
