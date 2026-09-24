/**
 * "Paladino de Marah" (Deuses de Arton, p. 30).
 *
 * Um paladino devoto da Deusa da Paz pode substituir Golpe Divino por Mensagem
 * de Paz, pode trocar Luta por Diplomacia nas perícias iniciais e inclui
 * Atuação e Luta nas perícias de classe. É a ÚNICA troca de habilidade de
 * classe por divindade em todo o livro, mas a tabela é genérica.
 *
 * O caso que quebra em silêncio é o recálculo: `classe.abilities` é reconstruído
 * do zero a cada `recalculateSheet`, então a troca precisa ser reaplicada ali —
 * não basta gravá-la na criação.
 */
import _ from 'lodash';
import { generateEmptySheet } from '../general';
import { recalculateSheet } from '../recalculateSheet';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import SelectOptions from '../../interfaces/SelectedOptions';
import { ClassDescription } from '../../interfaces/Class';
import Skill from '../../interfaces/Skills';
import { SupplementId } from '../../types/supplement.types';
import { dataRegistry } from '../../data/registry';
import PALADINO from '../../data/systems/tormenta20/classes/paladino';
import CLERIGO from '../../data/systems/tormenta20/classes/clerigo';
import {
  applyDeityClassVariant,
  findDeityClassVariant,
  getDeityClassVariant,
} from '../../data/systems/tormenta20/deuses-de-arton/classes/deityClassVariants';

const DEUSES_ARTON = [
  SupplementId.TORMENTA20_CORE,
  SupplementId.TORMENTA20_DEUSES_ARTON,
];
const CORE_ONLY = [SupplementId.TORMENTA20_CORE];

const ALTERNATIVA = 'Mensagem de Paz';
const PADRAO = 'Golpe Divino';

const deityOf = (name: string) => {
  const deity = dataRegistry.getDeityByName(name, DEUSES_ARTON);
  if (!deity) throw new Error(`Divindade não encontrada: ${name}`);
  return deity;
};

const mkSheet = (
  deityName = 'Marah',
  classe: ClassDescription = PALADINO
): CharacterSheet => {
  const sheet = createMockCharacterSheet();
  sheet.nivel = 1;
  // Elfo: Humano sorteia um poder geral a cada recálculo e deixa o teste flaky.
  sheet.raca = { ...sheet.raca, name: 'Elfo' };
  sheet.classe = _.cloneDeep(classe);
  sheet.classe.originalAbilities = _.cloneDeep(classe.abilities);
  sheet.devoto = { divindade: deityOf(deityName), poderes: [] };
  sheet.supplements = DEUSES_ARTON;
  sheet.sheetBonuses = [];
  sheet.sheetActionHistory = [];
  sheet.classPowers = [];
  return sheet;
};

const abilityNames = (sheet: CharacterSheet) =>
  sheet.classe.abilities.map((a) => a.name);

describe('Paladino de Marah', () => {
  describe('quando a variante é oferecida', () => {
    it('Paladino devoto de Marah com Deuses de Arton ativo', () => {
      expect(
        getDeityClassVariant(['Marah'], PALADINO, DEUSES_ARTON)
      ).toBeDefined();
    });

    it('não é oferecida com o suplemento desativado', () => {
      expect(
        getDeityClassVariant(['Marah'], PALADINO, CORE_ONLY)
      ).toBeUndefined();
    });

    it('não é oferecida a paladino de outro deus', () => {
      expect(
        getDeityClassVariant(['Khalmyr'], PALADINO, DEUSES_ARTON)
      ).toBeUndefined();
    });

    it('não é oferecida a clérigo de Marah', () => {
      expect(
        getDeityClassVariant(['Marah'], CLERIGO, DEUSES_ARTON)
      ).toBeUndefined();
    });

    it('é oferecida com Marah como divindade SECUNDÁRIA (Devoção Dupla)', () => {
      expect(
        getDeityClassVariant(['Khalmyr', 'Marah'], PALADINO, DEUSES_ARTON)
      ).toBeDefined();
    });

    it('casa também com a variante Santo (mesma família de Paladino)', () => {
      const santo = dataRegistry.getClassByName('Santo', [
        SupplementId.TORMENTA20_CORE,
        SupplementId.TORMENTA20_HEROIS_ARTON,
      ]);

      expect(santo).toBeDefined();
      expect(
        getDeityClassVariant(['Marah'], santo!, DEUSES_ARTON)
      ).toBeDefined();
    });

    // Os formulários passam a CHAVE do enum, o catálogo passa o nome formatado.
    it('casa a divindade pela chave do formulário', () => {
      expect(
        getDeityClassVariant(['MARAH'], PALADINO, DEUSES_ARTON)
      ).toBeDefined();
    });
  });

  describe('troca de habilidade', () => {
    const variant = () => findDeityClassVariant(['Marah'], PALADINO);

    it('põe Mensagem de Paz no lugar de Golpe Divino', () => {
      const classe = applyDeityClassVariant(PALADINO, variant(), {
        alternativeAbility: ALTERNATIVA,
      });
      const names = classe.abilities.map((a) => a.name);

      expect(names).toContain(ALTERNATIVA);
      expect(names).not.toContain(PADRAO);
    });

    it('mantém a habilidade na MESMA posição da lista', () => {
      const original = PALADINO.abilities.findIndex((a) => a.name === PADRAO);
      const classe = applyDeityClassVariant(PALADINO, variant(), {
        alternativeAbility: ALTERNATIVA,
      });

      expect(classe.abilities[original].name).toBe(ALTERNATIVA);
    });

    it('sem escolha, Golpe Divino fica intacto', () => {
      const classe = applyDeityClassVariant(PALADINO, variant(), {});

      expect(classe.abilities.map((a) => a.name)).toContain(PADRAO);
    });

    it('não muta o catálogo compartilhado', () => {
      applyDeityClassVariant(PALADINO, variant(), {
        alternativeAbility: ALTERNATIVA,
      });

      expect(PALADINO.abilities.map((a) => a.name)).toContain(PADRAO);
    });
  });

  describe('perícias', () => {
    const variant = () => findDeityClassVariant(['Marah'], PALADINO);

    it('troca Luta por Diplomacia nas perícias iniciais quando escolhido', () => {
      const classe = applyDeityClassVariant(PALADINO, variant(), {
        swapInitialSkill: true,
      });
      const basicas = classe.periciasbasicas.flatMap((g) => g.list);

      expect(basicas).toContain(Skill.DIPLOMACIA);
      expect(basicas).not.toContain(Skill.LUTA);
      expect(basicas).toContain(Skill.VONTADE);
    });

    it('mantém Luta nas perícias iniciais sem a escolha', () => {
      const classe = applyDeityClassVariant(PALADINO, variant(), {});

      expect(classe.periciasbasicas.flatMap((g) => g.list)).toContain(
        Skill.LUTA
      );
    });

    // Automático: não depende de escolha nenhuma.
    it('inclui Atuação e Luta nas perícias de classe', () => {
      const classe = applyDeityClassVariant(PALADINO, variant(), {});

      expect(classe.periciasrestantes.list).toContain(Skill.ATUACAO);
      expect(classe.periciasrestantes.list).toContain(Skill.LUTA);
    });

    it('não duplica uma perícia que já era de classe', () => {
      const classe = applyDeityClassVariant(PALADINO, variant(), {});
      const diplomacias = classe.periciasrestantes.list.filter(
        (s) => s === Skill.DIPLOMACIA
      );

      expect(diplomacias).toHaveLength(1);
    });
  });

  describe('assistente de criação (generateEmptySheet)', () => {
    // Elfo, e não Humano: o Versátil sorteia um poder geral a cada recálculo.
    const options = (devocao = 'MARAH'): SelectOptions => ({
      nivel: 1,
      raca: 'Elfo',
      classe: 'Paladino',
      origin: '',
      devocao: { label: 'Marah', value: devocao },
      supplements: DEUSES_ARTON,
    });

    it('grava a escolha na ficha e troca a habilidade', () => {
      const sheet = generateEmptySheet(options(), {
        deityClassChoices: { alternativeAbility: ALTERNATIVA },
      });

      expect(sheet.deityClassChoices?.alternativeAbility).toBe(ALTERNATIVA);
      expect(abilityNames(sheet)).toContain(ALTERNATIVA);
      expect(abilityNames(sheet)).not.toContain(PADRAO);
    });

    // A perícia inicial é lida de `periciasbasicas` na montagem do objeto da
    // ficha: aplicar a variante tarde demais deixaria Luta treinada mesmo com a
    // troca escolhida.
    it('treina Diplomacia no lugar de Luta quando a troca é escolhida', () => {
      const sheet = generateEmptySheet(options(), {
        deityClassChoices: { swapInitialSkill: true },
      });

      expect(sheet.skills).toContain(Skill.DIPLOMACIA);
      expect(sheet.skills).not.toContain(Skill.LUTA);
    });

    it('sem a troca, Luta continua sendo a perícia inicial', () => {
      const sheet = generateEmptySheet(options(), {});

      expect(sheet.skills).toContain(Skill.LUTA);
    });

    it('não grava escolha órfã para paladino de outro deus', () => {
      const sheet = generateEmptySheet(options('KHALMYR'), {
        deityClassChoices: { alternativeAbility: ALTERNATIVA },
      });

      expect(sheet.deityClassChoices).toBeUndefined();
      expect(abilityNames(sheet)).toContain(PADRAO);
    });
  });

  describe('sobrevivência ao recálculo', () => {
    it('a troca é reaplicada a cada recálculo', () => {
      const sheet = mkSheet();
      sheet.deityClassChoices = { alternativeAbility: ALTERNATIVA };

      const recalculated = recalculateSheet(sheet);

      expect(abilityNames(recalculated)).toContain(ALTERNATIVA);
      expect(abilityNames(recalculated)).not.toContain(PADRAO);
    });

    it('sobrevive a recálculos sucessivos', () => {
      const sheet = mkSheet();
      sheet.deityClassChoices = { alternativeAbility: ALTERNATIVA };

      const twice = recalculateSheet(recalculateSheet(sheet));
      const matches = abilityNames(twice).filter((n) => n === ALTERNATIVA);

      expect(matches).toHaveLength(1);
      expect(abilityNames(twice)).not.toContain(PADRAO);
    });

    it('sobrevive a subir de nível', () => {
      const sheet = mkSheet();
      sheet.deityClassChoices = { alternativeAbility: ALTERNATIVA };
      sheet.nivel = 5;

      const recalculated = recalculateSheet(sheet);

      expect(abilityNames(recalculated)).toContain(ALTERNATIVA);
      expect(abilityNames(recalculated)).not.toContain(PADRAO);
      // As habilidades de nível maior continuam chegando normalmente.
      expect(abilityNames(recalculated)).toContain('Aura Sagrada');
    });

    // A ficha antiga sem `originalAbilities` cai no fallback do catálogo, que
    // devolve o Paladino cru — a troca tem que ser reaplicada por cima.
    it('funciona em ficha sem originalAbilities', () => {
      const sheet = mkSheet();
      delete sheet.classe.originalAbilities;
      sheet.deityClassChoices = { alternativeAbility: ALTERNATIVA };

      const recalculated = recalculateSheet(sheet);

      expect(abilityNames(recalculated)).toContain(ALTERNATIVA);
      expect(abilityNames(recalculated)).not.toContain(PADRAO);
    });

    it('ficha sem a escolha mantém Golpe Divino', () => {
      const recalculated = recalculateSheet(mkSheet());

      expect(abilityNames(recalculated)).toContain(PADRAO);
      expect(abilityNames(recalculated)).not.toContain(ALTERNATIVA);
    });

    it('a escolha não vaza para paladino de outro deus', () => {
      const sheet = mkSheet('Khalmyr');
      sheet.deityClassChoices = { alternativeAbility: ALTERNATIVA };

      const recalculated = recalculateSheet(sheet);

      expect(abilityNames(recalculated)).toContain(PADRAO);
      expect(abilityNames(recalculated)).not.toContain(ALTERNATIVA);
    });
  });
});
