import {
  getDeityMaxSpellCircle,
  getDeitySpellCircleWarning,
} from '../powers/general';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import Divindade from '../../interfaces/Divindade';
import DEUSES_MENORES_DIVINDADES from '../../data/systems/tormenta20/deuses-menores/divindades';
import { DivindadeEnum } from '../../data/systems/tormenta20/divindades';
import CLERIGO from '../../data/systems/tormenta20/classes/clerigo';
import ARCANISTA from '../../data/systems/tormenta20/classes/arcanista';

/**
 * Regra do Guia de Deuses Menores: devotos de deus menor em classes
 * conjuradoras DIVINAS só lançam magias até o círculo que o deus oferece —
 * que é o próprio status divino.
 */
describe('círculo máximo concedido por deus menor', () => {
  const find = (name: string): Divindade => {
    const d = DEUSES_MENORES_DIVINDADES.find((x) => x.name === name);
    if (!d) throw new Error(`não encontrada: ${name}`);
    return d;
  };

  const TORIS = find('Toris'); // status 1
  const SCKHAR = find('Sckhar'); // status 5

  const build = (
    divindade: Divindade | null,
    classe = CLERIGO
  ): CharacterSheet => {
    const sheet = createMockCharacterSheet();
    sheet.nivel = 20;
    // `setup` é quem popula o spellPath da classe (mesma coisa que a geração
    // de ficha faz), então precisa rodar para o teste enxergar o spellType.
    sheet.classe = classe.setup ? classe.setup(classe) : { ...classe };
    sheet.devoto = divindade
      ? { divindade, poderes: [...divindade.poderes] }
      : undefined;
    return sheet;
  };

  it('o círculo máximo é o status divino', () => {
    expect(getDeityMaxSpellCircle(build(TORIS))).toBe(1);
    expect(getDeityMaxSpellCircle(build(SCKHAR))).toBe(5);
  });

  it('não limita devotos de deuses maiores nem não-devotos', () => {
    expect(getDeityMaxSpellCircle(build(DivindadeEnum.KHALMYR))).toBeNull();
    expect(getDeityMaxSpellCircle(build(null))).toBeNull();
  });

  it('não limita conjuradores não-divinos', () => {
    // Arcanista é conjurador arcano: a regra fala de classes divinas.
    expect(getDeityMaxSpellCircle(build(TORIS, ARCANISTA))).toBeNull();
  });

  it('avisa apenas nos círculos acima do concedido', () => {
    const sheet = build(TORIS); // status 1 → só 1º círculo
    expect(getDeitySpellCircleWarning(sheet, 1)).toBeNull();
    expect(getDeitySpellCircleWarning(sheet, 2)).toContain('Toris');
    expect(getDeitySpellCircleWarning(sheet, 5)).toContain('1º círculo');
  });

  it('não avisa nada quando o deus concede todos os círculos', () => {
    const sheet = build(SCKHAR); // status 5 → sem limite prático
    [1, 2, 3, 4, 5].forEach((c) => {
      expect(getDeitySpellCircleWarning(sheet, c)).toBeNull();
    });
  });
});
