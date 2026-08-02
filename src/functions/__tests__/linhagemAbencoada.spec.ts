import { getNewSpells } from '../general';
import { dataRegistry } from '../../data/registry';
import { SupplementId } from '../../types/supplement.types';
import { ClassDescription } from '../../interfaces/Class';
import { Spell } from '../../interfaces/Spells';
import ARCANISTA, {
  applyLinhagemAbencoadaToSpellPath,
  getArcanistaSpellPath,
  HERANCA_APRIMORADA,
  HERANCA_SUPERIOR,
} from '../../data/systems/tormenta20/classes/arcanista';

/**
 * Linhagem Abençoada (Deuses de Arton, pág. 33):
 *
 * "Você aprende uma magia divina de 1º círculo e pode aprender magias divinas
 * de 1º círculo como magias de feiticeiro."
 *
 * Ou seja: o Feiticeiro continua com acesso à lista ARCANA (3 magias iniciais
 * pelo livro básico) e a linhagem SOMA a lista divina de 1º círculo mais uma
 * magia divina extra — 4 magias no 1º nível, pelo menos uma delas divina.
 * A Herança Aprimorada libera divinas de 2º e 3º círculos; a Superior, 4º e 5º.
 */

const SUPPLEMENTS = [
  SupplementId.TORMENTA20_CORE,
  SupplementId.TORMENTA20_DEUSES_ARTON,
];

function makeFeiticeiro(abencoado: boolean): ClassDescription {
  const base = getArcanistaSpellPath('Feiticeiro');
  return {
    ...ARCANISTA,
    subname: 'Feiticeiro',
    spellPath: abencoado ? applyLinhagemAbencoadaToSpellPath(base) : base,
  };
}

/** Nomes que só existem na lista divina, por círculo. */
function exclusiveDivineNames(circle: number): Set<string> {
  const arcane = new Set(
    dataRegistry
      .getArcaneSpellsByCircleAndSupplements(circle, SUPPLEMENTS)
      .map((s) => s.nome)
  );
  return new Set(
    dataRegistry
      .getDivineSpellsByCircleAndSupplements(circle, SUPPLEMENTS)
      .filter((s) => !arcane.has(s.nome))
      .map((s) => s.nome)
  );
}

/** Nomes que só existem na lista arcana, por círculo. */
function exclusiveArcaneNames(circle: number): Set<string> {
  const divine = new Set(
    dataRegistry
      .getDivineSpellsByCircleAndSupplements(circle, SUPPLEMENTS)
      .map((s) => s.nome)
  );
  return new Set(
    dataRegistry
      .getArcaneSpellsByCircleAndSupplements(circle, SUPPLEMENTS)
      .filter((s) => !divine.has(s.nome))
      .map((s) => s.nome)
  );
}

/**
 * Pool efetivamente ofertado num nível: sorteia muitas vezes uma única magia e
 * acumula os nomes. `getNewSpells` não expõe o pool, então amostramos.
 */
function sampleOfferedNames(
  classe: ClassDescription,
  nivel: number,
  ownedPowerNames: string[],
  rounds = 400
): Set<string> {
  const names = new Set<string>();
  for (let i = 0; i < rounds; i += 1) {
    getNewSpells(nivel, classe, [], SUPPLEMENTS, null, ownedPowerNames).forEach(
      (spell) => names.add(spell.nome)
    );
  }
  return names;
}

describe('Linhagem Abençoada: magias iniciais', () => {
  const feiticeiro = makeFeiticeiro(true);
  const divineCircle1 = exclusiveDivineNames(1);
  const arcaneCircle1 = exclusiveArcaneNames(1);

  it('as duas listas de 1º círculo têm magias exclusivas (sanidade dos dados)', () => {
    expect(divineCircle1.size).toBeGreaterThan(0);
    expect(arcaneCircle1.size).toBeGreaterThan(0);
  });

  it('sempre 4 magias, com pelo menos 1 divina', () => {
    for (let i = 0; i < 100; i += 1) {
      const spells = getNewSpells(1, feiticeiro, [], SUPPLEMENTS);
      expect(spells).toHaveLength(4);
      expect(
        spells.filter((s) => divineCircle1.has(s.nome)).length
      ).toBeGreaterThanOrEqual(1);
    }
  });

  it('a lista arcana continua disponível (a linhagem soma, não substitui)', () => {
    const offered = sampleOfferedNames(feiticeiro, 1, [], 100);
    const arcaneOffered = [...offered].filter((n) => arcaneCircle1.has(n));
    expect(arcaneOffered.length).toBeGreaterThan(0);
  });

  it('Feiticeiro sem a linhagem: 3 magias e nenhuma divina exclusiva', () => {
    const comum = makeFeiticeiro(false);
    const offered = sampleOfferedNames(comum, 1, [], 100);
    expect(getNewSpells(1, comum, [], SUPPLEMENTS)).toHaveLength(3);
    expect([...offered].some((n) => divineCircle1.has(n))).toBe(false);
  });
});

describe('Linhagem Abençoada: teto de círculo das magias divinas', () => {
  const feiticeiro = makeFeiticeiro(true);

  const divineAbove = (circles: number[]): Set<string> => {
    const names = new Set<string>();
    circles.forEach((circle) =>
      exclusiveDivineNames(circle).forEach((n) => names.add(n))
    );
    return names;
  };

  it('Herança Básica, nível 5 (2º círculo): divinas só de 1º círculo', () => {
    const offered = sampleOfferedNames(feiticeiro, 5, []);
    const forbidden = divineAbove([2]);
    expect([...offered].some((n) => forbidden.has(n))).toBe(false);
    // Mas as arcanas de 2º círculo continuam ofertadas.
    const arcane2 = exclusiveArcaneNames(2);
    expect([...offered].some((n) => arcane2.has(n))).toBe(true);
    // E as divinas de 1º círculo seguem disponíveis.
    const divine1 = exclusiveDivineNames(1);
    expect([...offered].some((n) => divine1.has(n))).toBe(true);
  });

  it('Herança Aprimorada, nível 13 (4º círculo): divinas até o 3º', () => {
    const offered = sampleOfferedNames(feiticeiro, 13, [HERANCA_APRIMORADA]);
    const divine3 = exclusiveDivineNames(3);
    expect([...offered].some((n) => divine3.has(n))).toBe(true);
    const forbidden = divineAbove([4]);
    expect([...offered].some((n) => forbidden.has(n))).toBe(false);
  });

  it('Herança Superior, nível 17 (5º círculo): divinas até o 5º', () => {
    const offered = sampleOfferedNames(feiticeiro, 17, [
      HERANCA_APRIMORADA,
      HERANCA_SUPERIOR,
    ]);
    const divine5 = exclusiveDivineNames(5);
    expect([...offered].some((n) => divine5.has(n))).toBe(true);
  });

  it('sem heranças no 17º nível: nenhuma divina acima do 1º círculo', () => {
    const offered = sampleOfferedNames(feiticeiro, 17, []);
    const forbidden = divineAbove([2, 3, 4, 5]);
    const leaked: string[] = [...offered].filter((n) => forbidden.has(n));
    expect(leaked).toEqual([]);
  });

  it('o mínimo de 1 divina vale só no 1º nível', () => {
    // No 3º nível o Feiticeiro aprende 1 magia; exigir que ela fosse divina
    // travaria a evolução na lista errada.
    const spells: Spell[] = getNewSpells(3, feiticeiro, [], SUPPLEMENTS);
    expect(spells).toHaveLength(1);
  });
});
