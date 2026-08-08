/**
 * Regressão: a origem "Futura Lenda (Nova Malpetrim)" concede um poder de
 * classe "normalmente disponível a partir do 2º nível". A lista oferecida era
 * exatamente o COMPLEMENTO do correto — só apareciam os poderes com requisito
 * explícito de NÍVEL alto (justamente os que o personagem não cumpre), e todo
 * poder genuinamente disponível no 2º nível ficava de fora.
 */
import { describe, expect, it } from 'vitest';
import _ from 'lodash';
import { getFuturaLendaClassPowers } from '../../functions/powers';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import GUERREIRO from '../../data/systems/tormenta20/classes/guerreiro';
import CLERIGO from '../../data/systems/tormenta20/classes/clerigo';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { ClassDescription, ClassPower } from '../../interfaces/Class';
import { RequirementType } from '../../interfaces/Poderes';
import PROFICIENCIAS from '../../data/systems/tormenta20/proficiencias';

// A ficha-mock tem For +2, Des +1, Con +1, Int 0, Sab 0, Car -1.
const buildSheet = (classe: ClassDescription, nivel = 1): CharacterSheet => {
  const sheet = createMockCharacterSheet();
  sheet.classe = _.cloneDeep(classe);
  sheet.nivel = nivel;
  sheet.classPowers = [];
  return sheet;
};

const names = (powers: ClassPower[]) => powers.map((power) => power.name);

const guerreiroPower = (name: string): ClassPower => {
  const power = GUERREIRO.powers.find((p) => p.name === name);
  if (!power) throw new Error(`Poder de fixture ausente: ${name}`);
  return power;
};

describe('getFuturaLendaClassPowers', () => {
  it('inclui poderes sem requisito de nível', () => {
    const list = names(getFuturaLendaClassPowers(buildSheet(GUERREIRO)));

    expect(list).toContain('Bater e Correr'); // requirements: []
    expect(list).toContain('Aumento de Atributo'); // requirements: []
    expect(list).toContain('Ataque Reflexo'); // Destreza 1 (ficha tem +1)
  });

  it('inclui poder de NÍVEL 2 quando os demais pré-requisitos são atendidos', () => {
    const sheet = buildSheet(GUERREIRO);
    sheet.classPowers = [guerreiroPower('Especialização em Arma')];

    // Mestre em Arma: [PODER 'Especialização em Arma', NIVEL 2]
    expect(names(getFuturaLendaClassPowers(sheet))).toContain('Mestre em Arma');
  });

  it('exclui poder de NÍVEL 2 quando falta o pré-requisito de poder', () => {
    const list = names(getFuturaLendaClassPowers(buildSheet(GUERREIRO)));

    expect(list).not.toContain('Mestre em Arma');
  });

  it('exclui poderes com requisito de nível acima do 2º', () => {
    const list = names(getFuturaLendaClassPowers(buildSheet(GUERREIRO)));

    expect(list).not.toContain('Golpe Pessoal'); // NIVEL 5
    expect(list).not.toContain('Tornado de Dor'); // NIVEL 6
    expect(list).not.toContain('Planejamento Marcial'); // NIVEL 10
    expect(list).not.toContain('Especialização em Armadura'); // NIVEL 12
  });

  it('mantém o corte no 2º nível mesmo em ficha de nível alto (recálculo)', () => {
    const list = names(getFuturaLendaClassPowers(buildSheet(GUERREIRO, 12)));

    expect(list).not.toContain('Especialização em Armadura');
    expect(list).not.toContain('Golpe Pessoal');
    expect(list).toContain('Bater e Correr');
  });

  it('exclui poderes cujo pré-requisito de atributo não é atendido', () => {
    const list = names(getFuturaLendaClassPowers(buildSheet(GUERREIRO)));

    expect(list).not.toContain('Ambidestria'); // Destreza 2, ficha tem +1
    expect(list).not.toContain('Arqueiro'); // Sabedoria 1, ficha tem 0
    expect(list).not.toContain('Esgrimista'); // Inteligência 1, ficha tem 0
  });

  it('exclui poderes cujo pré-requisito de proficiência não é atendido', () => {
    const classe = _.cloneDeep(GUERREIRO);
    classe.proficiencias = [PROFICIENCIAS.SIMPLES];
    classe.powers = [
      {
        name: 'Poder de Fogo',
        text: 'teste',
        requirements: [
          [{ type: RequirementType.PROFICIENCIA, name: PROFICIENCIAS.FOGO }],
        ],
      },
      { name: 'Poder Livre', text: 'teste', requirements: [] },
    ];

    expect(names(getFuturaLendaClassPowers(buildSheet(classe)))).toEqual([
      'Poder Livre',
    ]);
  });

  it('oferece mais de uma opção para o Clérigo (regressão do auto-select silencioso)', () => {
    const list = names(getFuturaLendaClassPowers(buildSheet(CLERIGO)));

    expect(list.length).toBeGreaterThan(1);
    expect(list).not.toContain('Autoridade Eclesiástica'); // NIVEL 5
  });

  it('não repete poder já possuído sem canRepeat, mas mantém os repetíveis', () => {
    const sheet = buildSheet(GUERREIRO);
    sheet.classPowers = [
      guerreiroPower('Bater e Correr'),
      guerreiroPower('Aumento de Atributo'),
    ];

    const list = names(getFuturaLendaClassPowers(sheet));

    expect(list).not.toContain('Bater e Correr');
    expect(list).toContain('Aumento de Atributo'); // canRepeat
  });

  it('usa o catálogo do registro quando classe.powers vem vazio (ficha carregada)', () => {
    const sheet = buildSheet(GUERREIRO);
    sheet.classe.powers = [];

    expect(names(getFuturaLendaClassPowers(sheet))).toContain('Bater e Correr');
  });
});
