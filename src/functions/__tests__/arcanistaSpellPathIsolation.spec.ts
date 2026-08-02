import { cloneDeep } from 'lodash';
import ARCANISTA, {
  arcanistaSpellPaths,
  feiticeiroPaths,
} from '../../data/systems/tormenta20/classes/arcanista';
import { applyTeurgistaMistico } from '../powers/special';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import { SupplementId } from '../../types/supplement.types';

/**
 * `arcanistaSpellPaths` e `feiticeiroPaths` são objetos de MÓDULO, criados uma
 * única vez por sessão. Vários pontos do código mutam o spellPath da ficha in
 * place (`applyTeurgistaMistico`) ou concatenam texto na habilidade da linhagem
 * — sem cópia, uma ficha contaminava todas as geradas depois.
 */
describe('Isolamento do spellPath do Arcanista', () => {
  const SUPPLEMENTS = [
    SupplementId.TORMENTA20_CORE,
    SupplementId.TORMENTA20_DEUSES_ARTON,
  ];

  it('setup() nunca devolve a referência compartilhada', () => {
    for (let i = 0; i < 20; i += 1) {
      const setupClass = ARCANISTA.setup!(cloneDeep(ARCANISTA), SUPPLEMENTS);
      const subtype = setupClass.subname as keyof typeof arcanistaSpellPaths;
      expect(setupClass.spellPath).not.toBe(arcanistaSpellPaths[subtype]);
    }
  });

  it('Teurgista Místico não contamina o catálogo da classe', () => {
    const sheet = createMockCharacterSheet();
    sheet.classe = cloneDeep(ARCANISTA);
    sheet.classe.subname = 'Bruxo';
    sheet.classe.spellPath = { ...arcanistaSpellPaths.Bruxo };

    applyTeurgistaMistico(sheet);

    expect(sheet.classe.spellPath.crossTraditionLimit).toBe(1);
    // A definição da classe segue limpa.
    expect(arcanistaSpellPaths.Bruxo.crossTraditionLimit).toBeUndefined();
    expect(arcanistaSpellPaths.Bruxo.includeDivineSchools).toBeUndefined();
  });

  it('Linhagem Dracônica não acumula "Tipo escolhido" no catálogo', () => {
    const draconica = feiticeiroPaths.find(
      (p) => p.name === 'Linhagem Dracônica'
    )!;
    const textoOriginal = draconica.text;

    for (let i = 0; i < 30; i += 1) {
      ARCANISTA.setup!(cloneDeep(ARCANISTA), SUPPLEMENTS);
    }

    expect(draconica.text).toBe(textoOriginal);
    expect(draconica.text).not.toContain('Tipo escolhido');
  });
});
