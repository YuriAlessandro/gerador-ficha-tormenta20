import {
  getDerivedSpellCircle,
  getDerivedSpells,
  getDerivedSpellsNotice,
  hasDerivedSpellAccess,
} from '../spells/derivedSpells';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { ClassDescription } from '../../interfaces/Class';
import { spellsCircles } from '../../interfaces/Spells';
import { dataRegistry } from '../../data/registry';
import { SupplementId } from '../../types/supplement.types';
import CLERIGO from '../../data/systems/tormenta20/classes/clerigo';

/**
 * Usurpar (Usurpador): a classe não aprende magia nenhuma, mas pode lançar
 * qualquer magia divina dos círculos a que tem acesso. A lista é derivada no
 * render — `sheet.spells` continua vazio.
 */
describe('Usurpador — magias derivadas (Usurpar)', () => {
  const CORE_ONLY: SupplementId[] = [SupplementId.TORMENTA20_CORE];
  const CORE_E_HDA: SupplementId[] = [
    SupplementId.TORMENTA20_CORE,
    SupplementId.TORMENTA20_HEROIS_ARTON,
  ];

  // USURPADOR sozinho é VariantClassOverrides (sem pv/pm/powers) — a classe
  // utilizável só existe depois da mesclagem com o Clérigo feita no registry.
  const usurpadorClass = (): ClassDescription => {
    const classe = dataRegistry
      .getClassesBySupplements(CORE_E_HDA)
      .find((c) => c.name === 'Usurpador');
    if (!classe) throw new Error('Usurpador não encontrado no registry');
    return classe;
  };

  const buildUsurpador = (nivel: number): CharacterSheet => {
    const sheet = createMockCharacterSheet();
    sheet.nivel = nivel;
    sheet.classe = { ...usurpadorClass() };
    sheet.spells = [];
    return sheet;
  };

  it('marca acesso derivado só para o Usurpador', () => {
    expect(hasDerivedSpellAccess(buildUsurpador(1))).toBe(true);

    const clerigo = createMockCharacterSheet();
    clerigo.nivel = 1;
    clerigo.classe = CLERIGO.setup ? CLERIGO.setup(CLERIGO) : { ...CLERIGO };
    expect(hasDerivedSpellAccess(clerigo)).toBe(false);
    expect(getDerivedSpells(clerigo, CORE_ONLY)).toHaveLength(0);
    expect(getDerivedSpellsNotice(clerigo)).toBeNull();
  });

  it('segue a progressão de círculos da classe (1º/5º/9º/13º/17º)', () => {
    const casos: [number, number][] = [
      [1, 1],
      [4, 1],
      [5, 2],
      [8, 2],
      [9, 3],
      [13, 4],
      [17, 5],
      [20, 5],
    ];
    casos.forEach(([nivel, circulo]) => {
      expect(getDerivedSpellCircle(buildUsurpador(nivel))).toBe(circulo);
    });
  });

  it('devolve todas as magias divinas até o círculo acessível', () => {
    const nivel1 = getDerivedSpells(buildUsurpador(1), CORE_ONLY);
    // 30 magias divinas de 1º círculo no core.
    expect(nivel1).toHaveLength(30);
    expect(
      nivel1.every((spell) => spell.spellCircle === spellsCircles.c1)
    ).toBe(true);

    // O repertório cresce a cada novo círculo desbloqueado.
    const nivel5 = getDerivedSpells(buildUsurpador(5), CORE_ONLY);
    const nivel20 = getDerivedSpells(buildUsurpador(20), CORE_ONLY);
    expect(nivel5.length).toBeGreaterThan(nivel1.length);
    expect(nivel20.length).toBeGreaterThan(nivel5.length);

    // Sem nomes repetidos (o pool dedupa entre suplementos).
    const nomes = nivel20.map((spell) => spell.nome);
    expect(new Set(nomes).size).toBe(nomes.length);
  });

  it('inclui as magias divinas dos suplementos ativos', () => {
    const semSuplemento = getDerivedSpells(buildUsurpador(1), CORE_ONLY);
    const comSuplemento = getDerivedSpells(buildUsurpador(1), [
      ...CORE_E_HDA,
      SupplementId.TORMENTA20_DEUSES_ARTON,
    ]);
    expect(comSuplemento.length).toBeGreaterThan(semSuplemento.length);
  });

  it('devolve a MESMA referência entre chamadas (cache)', () => {
    // Referência estável é o que mantém o useMemo do Result barato — são ~140
    // objetos por entrada e o SpellsDisplay memoiza em cima da lista.
    const a = getDerivedSpells(buildUsurpador(9), CORE_ONLY);
    const b = getDerivedSpells(buildUsurpador(9), CORE_ONLY);
    expect(a).toBe(b);
    expect(Object.isFrozen(a)).toBe(true);
  });

  it('nunca persiste as magias na ficha', () => {
    const sheet = buildUsurpador(20);
    getDerivedSpells(sheet, CORE_ONLY);
    expect(sheet.spells).toHaveLength(0);
  });

  it('não deriva nada quando o spellPath perdeu as funções', () => {
    // Ficha carregada antes do restoreSpellPath: spellCircleAvailableAtLevel
    // não sobrevive à serialização.
    const sheet = buildUsurpador(10);
    sheet.classe = {
      ...sheet.classe,
      spellPath: {
        ...sheet.classe.spellPath!,
        spellCircleAvailableAtLevel: undefined as unknown as (
          level: number
        ) => number,
      },
    };
    expect(getDerivedSpellCircle(sheet)).toBe(0);
    expect(getDerivedSpells(sheet, CORE_ONLY)).toHaveLength(0);
    expect(getDerivedSpellsNotice(sheet)).toBeNull();
  });

  it('traz o aviso do teste de Enganação com o círculo atual', () => {
    const aviso = getDerivedSpellsNotice(buildUsurpador(9));
    expect(aviso).toContain('3º círculo');
    expect(aviso).toContain('Enganação');
    expect(aviso).toContain('CD 15');
  });
});
