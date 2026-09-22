import _ from 'lodash';
import HOBGOBLIN, {
  HOBGOBLIN_REFRESHED_DESCRIPTIONS,
} from '../../data/systems/tormenta20/ameacas-de-arton/races/hobgoblin';
import { applyRaceAbilities } from '../general';
import { recalculateSheet } from '../recalculateSheet';
import { normalizeSheet } from '../sheetNormalizer';
import { inventor } from '../../__mocks__/classes/inventor';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import Skill from '../../interfaces/Skills';
import CharacterSheet from '../../interfaces/CharacterSheet';
import {
  getFilteredAvailableOptions,
  getPowerSelectionRequirements,
} from '../powers/manualPowerSelection';

/**
 * Feedback de usuário: Arte da Guerra (Hobgoblin) deveria TREINAR Guerra
 * ("Você é treinado em Guerra...", Ameaças de Arton cap. 1), mas o dado
 * implementava um bônus numérico de +2 na perícia — que além de errado deixava
 * a perícia destreinada na ficha.
 */
const getAbility = (name: string) => {
  const ability = HOBGOBLIN.abilities.find((a) => a.name === name);
  if (!ability)
    throw new Error(`Habilidade ${name} não encontrada no Hobgoblin`);
  return ability;
};

const guerraRow = (sheet: CharacterSheet) =>
  sheet.completeSkills?.find((s) => s.name === Skill.GUERRA);

describe('Arte da Guerra — dado', () => {
  test('treina Guerra por sheetAction, não por bônus de perícia', () => {
    const ability = getAbility('Arte da Guerra');

    expect(ability.sheetActions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          action: {
            type: 'learnSkill',
            availableSkills: [Skill.GUERRA],
            pick: 1,
          },
        }),
      ])
    );

    // Lock de regressão: nenhum bônus numérico mirando Guerra.
    const guerraBonuses = (ability.sheetBonuses ?? []).filter(
      (bonus) =>
        bonus.target.type === 'Skill' && bonus.target.name === Skill.GUERRA
    );
    expect(guerraBonuses).toHaveLength(0);
  });

  test('mantém a proficiência em armas marciais', () => {
    expect(getAbility('Arte da Guerra').sheetActions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          action: {
            type: 'addProficiency',
            availableProficiencies: ['Armas Marciais'],
            pick: 1,
          },
        }),
      ])
    );
  });

  test('Metalurgia Hobgoblin cobra ¼ em vez de ⅓, como no livro', () => {
    const { description } = getAbility('Metalurgia Hobgoblin');
    expect(description).toContain('(em vez de ⅓)');
    expect(description).not.toContain('(em vez de ½)');
  });
});

describe('Arte da Guerra — aplicação', () => {
  test('adiciona Guerra a skills e não soma +2 em others', () => {
    const sheet = recalculateSheet(
      applyRaceAbilities(_.cloneDeep(inventor(HOBGOBLIN)))
    );

    expect(sheet.skills).toContain(Skill.GUERRA);
    expect(guerraRow(sheet)?.training).toBe(2);
    expect(guerraRow(sheet)?.others).toBe(0);
  });

  test('não duplica Guerra quando a classe já treinou a perícia', () => {
    const base = _.cloneDeep(inventor(HOBGOBLIN));
    base.skills.push(Skill.GUERRA);

    const sheet = recalculateSheet(applyRaceAbilities(base));

    expect(sheet.skills.filter((s) => s === Skill.GUERRA)).toHaveLength(1);
    expect(guerraRow(sheet)?.training).toBe(2);
    expect(guerraRow(sheet)?.others).toBe(0);
  });

  test('não duplica Guerra quando a seleção manual do assistente ficou obsoleta', () => {
    const base = _.cloneDeep(inventor(HOBGOBLIN));
    base.skills.push(Skill.GUERRA);

    // O jogador auto-selecionou Guerra em "Efeitos de Poderes", voltou um passo
    // e treinou Guerra pela classe: a seleção manual persiste e apontaria para
    // uma perícia já treinada.
    const sheet = recalculateSheet(
      applyRaceAbilities(base, {
        'Arte da Guerra': { skills: [Skill.GUERRA] },
      })
    );

    expect(sheet.skills.filter((s) => s === Skill.GUERRA)).toHaveLength(1);
  });
});

describe('assistente — perícia já treinada', () => {
  test('o requisito de Arte da Guerra é um learnSkill de 1 perícia', () => {
    const requirements = getPowerSelectionRequirements(
      getAbility('Arte da Guerra')
    );

    expect(requirements?.requirements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'learnSkill',
          availableOptions: [Skill.GUERRA],
          pick: 1,
        }),
      ])
    );
  });

  /**
   * Proxy do clamp de `isStepValid` no `CharacterCreationWizardModal`: quando
   * Guerra já foi treinada pela classe, a lista de opções esvazia. Sem o clamp,
   * o botão "Próximo" exigia uma escolha que o passo não tinha como oferecer.
   */
  test('getFilteredAvailableOptions esvazia a lista quando Guerra já está treinada', () => {
    const requirement = getPowerSelectionRequirements(
      getAbility('Arte da Guerra')
    )?.requirements.find((r) => r.type === 'learnSkill');
    if (!requirement) throw new Error('Requisito learnSkill não encontrado');

    const sheet = createMockCharacterSheet();
    sheet.skills = [Skill.GUERRA];

    expect(getFilteredAvailableOptions(requirement, sheet)).toEqual([]);

    // Controle: sem Guerra treinada, a opção aparece (e o auto-select do
    // assistente resolve o passo sem prompt).
    sheet.skills = [];
    sheet.completeSkills = [];
    expect(getFilteredAvailableOptions(requirement, sheet)).toEqual([
      Skill.GUERRA,
    ]);
  });
});

describe('normalizeSheet — descrição do Hobgoblin', () => {
  test('reescreve Metalurgia Hobgoblin em fichas salvas com o texto antigo', () => {
    const sheet = createMockCharacterSheet();
    sheet.raca = {
      ...HOBGOBLIN,
      abilities: [
        {
          ...getAbility('Metalurgia Hobgoblin'),
          description:
            'Você recebe +2 em Ofício (armeiro) e, se for treinado nesta perícia, pode fabricar armas e armaduras superiores com uma melhoria. Se aprender a fabricar itens superiores desses tipos por outra habilidade, gasta apenas ¼ do preço das melhorias que aplica nesses itens (em vez de ½).',
        },
      ],
    };

    normalizeSheet(sheet);
    const metalurgia = sheet.raca.abilities.find(
      (a) => a.name === 'Metalurgia Hobgoblin'
    );

    expect(metalurgia?.description).toBe(
      HOBGOBLIN_REFRESHED_DESCRIPTIONS['Metalurgia Hobgoblin']
    );
    expect(metalurgia?.description).toContain('(em vez de ⅓)');
  });
});
