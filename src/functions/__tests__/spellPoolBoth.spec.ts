import _ from 'lodash';
import { getNewSpells } from '../general';
import { findClassDescription } from '../multiclass';
import { dataRegistry } from '../../data/registry';
import { SupplementId } from '../../types/supplement.types';
import { ClassDescription } from '../../interfaces/Class';

/**
 * Regressão do construtor de pool de magias (`buildSpellPool`).
 *
 * Antes existiam três implementações — geração aleatória, wizard de criação e
 * wizard de evolução — e a da geração aleatória tinha dois defeitos:
 *
 * 1. não havia ramo para `spellType: 'Both'`, então o Bardo caía no `else` e
 *    era tratado como conjurador DIVINO;
 * 2. quando havia `schools`, a lista era RECONSTRUÍDA em vez de filtrada,
 *    descartando a tradição nativa e as magias cross acumuladas antes.
 *
 * O resultado é que Bardos gerados aleatoriamente (e o level-up automático)
 * só recebiam magias divinas.
 */

const CORE = [SupplementId.TORMENTA20_CORE];

function setupClass(name: string): ClassDescription {
  const classDesc = findClassDescription(name, undefined, CORE);
  if (!classDesc) throw new Error(`${name} não encontrado no registry`);
  return classDesc.setup
    ? classDesc.setup(_.cloneDeep(classDesc), CORE)
    : classDesc;
}

function exclusiveNames(
  tradition: 'arcane' | 'divine',
  circles: number[]
): Set<string> {
  const names = new Set<string>();
  circles.forEach((circle) => {
    const arcane = dataRegistry.getArcaneSpellsByCircleAndSupplements(
      circle,
      CORE
    );
    const divine = dataRegistry.getDivineSpellsByCircleAndSupplements(
      circle,
      CORE
    );
    const other = new Set(
      (tradition === 'arcane' ? divine : arcane).map((s) => s.nome)
    );
    (tradition === 'arcane' ? arcane : divine)
      .filter((s) => !other.has(s.nome))
      .forEach((s) => names.add(s.nome));
  });
  return names;
}

function sampleOfferedNames(
  classe: ClassDescription,
  nivel: number,
  rounds = 200
): Set<string> {
  const names = new Set<string>();
  for (let i = 0; i < rounds; i += 1) {
    getNewSpells(nivel, classe, [], CORE).forEach((spell) =>
      names.add(spell.nome)
    );
  }
  return names;
}

describe("Bardo (spellType 'Both'): arcanas E divinas", () => {
  it('o pool inicial tem magias das duas tradições', () => {
    const bardo = setupClass('Bardo');
    expect(bardo.spellPath?.spellType).toBe('Both');
    expect(bardo.spellPath?.schools?.length).toBeGreaterThan(0);

    const offered = sampleOfferedNames(bardo, 1);
    const arcane1 = exclusiveNames('arcane', [1]);
    const divine1 = exclusiveNames('divine', [1]);

    expect([...offered].some((n) => arcane1.has(n))).toBe(true);
    expect([...offered].some((n) => divine1.has(n))).toBe(true);
  });

  it('respeita as escolas escolhidas', () => {
    const bardo = setupClass('Bardo');
    const schools = bardo.spellPath?.schools ?? [];
    const allowed = new Set(schools);

    for (let i = 0; i < 30; i += 1) {
      getNewSpells(1, bardo, [], CORE).forEach((spell) => {
        expect(allowed.has(spell.school)).toBe(true);
      });
    }
  });
});

describe('Não-regressão das outras classes conjuradoras', () => {
  it('Druida: só divinas, e só das escolas escolhidas', () => {
    const druida = setupClass('Druida');
    expect(druida.spellPath?.spellType).toBe('Divine');
    const allowed = new Set(druida.spellPath?.schools ?? []);
    const arcaneOnly = exclusiveNames('arcane', [1]);

    const offered = sampleOfferedNames(druida, 1);
    expect(offered.size).toBeGreaterThan(0);
    expect([...offered].some((n) => arcaneOnly.has(n))).toBe(false);

    getNewSpells(1, druida, [], CORE).forEach((spell) => {
      expect(allowed.has(spell.school)).toBe(true);
    });
  });

  it('Clérigo: só divinas, todas as escolas', () => {
    const clerigo = setupClass('Clérigo');
    expect(clerigo.spellPath?.spellType).toBe('Divine');
    const arcaneOnly = exclusiveNames('arcane', [1]);
    const offered = sampleOfferedNames(clerigo, 1);

    expect(offered.size).toBeGreaterThan(0);
    expect([...offered].some((n) => arcaneOnly.has(n))).toBe(false);
  });

  it('Necromante: divinas de Necro em TODOS os círculos e nenhuma Encan', () => {
    // `includeDivineSchools: ['Necro']` sem `crossTraditionRules` = sem teto de
    // círculo. O campo novo é opt-in justamente para não regredir aqui.
    const necromante = findClassDescription(
      'Necromante',
      undefined,
      CORE.concat(SupplementId.TORMENTA20_HEROIS_ARTON)
    );
    expect(necromante?.spellPath?.includeDivineSchools).toEqual(['Necro']);
    expect(necromante?.spellPath?.crossTraditionRules).toBeUndefined();

    const supplements = CORE.concat(SupplementId.TORMENTA20_HEROIS_ARTON);
    const names = new Set<string>();
    for (let i = 0; i < 200; i += 1) {
      getNewSpells(9, necromante!, [], supplements).forEach((spell) => {
        expect(spell.school).not.toBe('Encan');
        names.add(spell.nome);
      });
    }

    // Divinas exclusivas de Necro do 2º círculo em diante seguem ofertadas.
    const divineNecroHigh = new Set(
      [2, 3]
        .flatMap((circle) => {
          const arcane = new Set(
            dataRegistry
              .getArcaneSpellsByCircleAndSupplements(circle, supplements)
              .map((s) => s.nome)
          );
          return dataRegistry
            .getDivineSpellsByCircleAndSupplements(circle, supplements)
            .filter((s) => s.school === 'Necro' && !arcane.has(s.nome));
        })
        .map((s) => s.nome)
    );
    expect(divineNecroHigh.size).toBeGreaterThan(0);
    expect([...names].some((n) => divineNecroHigh.has(n))).toBe(true);
  });
});
