/**
 * Formatação de pré-requisitos de poder.
 *
 * O motivo deste arquivo existir: a Arma Sagrada do Paladino exige NÃO ser
 * devoto de Lena nem de Marah (`not: true`), e três das seis cópias do
 * formatador ignoravam a flag — a tabela de classes mostrava exatamente o
 * contrário da regra do livro.
 */
import { describe, it, expect } from 'vitest';
import { formatRequirement, formatRequirements } from '../requirementText';
import { RequirementType } from '../../interfaces/Poderes';
import PALADINO from '../../data/systems/tormenta20/classes/paladino';

describe('formatRequirement', () => {
  it('formata cada tipo na forma positiva', () => {
    expect(formatRequirement({ type: RequirementType.NIVEL, value: 5 })).toBe(
      'Nível 5'
    );
    expect(
      formatRequirement({
        type: RequirementType.ATRIBUTO,
        name: 'For',
        value: 2,
      })
    ).toBe('For 2');
    expect(
      formatRequirement({ type: RequirementType.PERICIA, name: 'Ladinagem' })
    ).toBe('Treinado em Ladinagem');
    expect(
      formatRequirement({
        type: RequirementType.PODER,
        name: 'Ataque Poderoso',
      })
    ).toBe('Ataque Poderoso');
    expect(
      formatRequirement({ type: RequirementType.DEVOTO, name: 'Khalmyr' })
    ).toBe('Devoto de Khalmyr');
    expect(
      formatRequirement({ type: RequirementType.DEVOTO, name: 'any' })
    ).toBe('Devoto de qualquer divindade');
    expect(
      formatRequirement({ type: RequirementType.PROFICIENCIA, name: 'all' })
    ).toBe('Proficiência em qualquer arma');
    expect(
      formatRequirement({ type: RequirementType.PODER_TORMENTA, value: 1 })
    ).toBe('Pelo menos 1 poder da Tormenta');
    expect(
      formatRequirement({ type: RequirementType.PODER_TORMENTA, value: 3 })
    ).toBe('Pelo menos 3 poderes da Tormenta');
    expect(
      formatRequirement({
        type: RequirementType.TEXT,
        text: 'A critério do mestre',
      })
    ).toBe('A critério do mestre');
  });

  it('lê o nome da classe de `name` (é o campo que o avaliador usa)', () => {
    expect(
      formatRequirement({ type: RequirementType.CLASSE, name: 'Guerreiro' })
    ).toBe('Classe: Guerreiro');
  });

  it('escreve a negação em frase natural, por tipo', () => {
    expect(
      formatRequirement({
        type: RequirementType.DEVOTO,
        name: 'Marah',
        not: true,
      })
    ).toBe('Não ser devoto de Marah');
    expect(
      formatRequirement({
        type: RequirementType.DEVOTO,
        name: 'any',
        not: true,
      })
    ).toBe('Não ser devoto');
    expect(
      formatRequirement({
        type: RequirementType.PERICIA,
        name: 'Ladinagem',
        not: true,
      })
    ).toBe('Não ser treinado em Ladinagem');
    expect(
      formatRequirement({
        type: RequirementType.HABILIDADE,
        name: 'Magias',
        not: true,
      })
    ).toBe('Não ter Magias');
    expect(
      formatRequirement({ type: RequirementType.NIVEL, value: 5, not: true })
    ).toBe('Não: Nível 5');
  });

  it('devolve string vazia para requisito sem conteúdo', () => {
    expect(formatRequirement({ type: RequirementType.PODER })).toBe('');
    expect(formatRequirement({ type: RequirementType.TEXT })).toBe('');
  });
});

describe('formatRequirements', () => {
  it('junta o grupo com E e os grupos com OU', () => {
    const text = formatRequirements([
      [
        { type: RequirementType.NIVEL, value: 5 },
        { type: RequirementType.PODER, name: 'Ataque Poderoso' },
      ],
      [{ type: RequirementType.NIVEL, value: 9 }],
    ]);

    expect(text).toBe('Nível 5 e Ataque Poderoso OU Nível 9');
  });

  it('respeita o separador e o texto de vazio configurados', () => {
    expect(
      formatRequirements(
        [
          [
            { type: RequirementType.NIVEL, value: 5 },
            { type: RequirementType.PODER, name: 'Ginete' },
          ],
        ],
        { andSeparator: ', ' }
      )
    ).toBe('Nível 5, Ginete');

    expect(formatRequirements([], { emptyText: 'Nenhum pré-requisito' })).toBe(
      'Nenhum pré-requisito'
    );
    expect(
      formatRequirements([[]], { emptyText: 'Nenhum pré-requisito' })
    ).toBe('Nenhum pré-requisito');
    expect(
      formatRequirements(undefined, { emptyText: 'Nenhum pré-requisito' })
    ).toBe('Nenhum pré-requisito');
  });

  it('aplica o sufixo de nível efetivo (Alma Livre)', () => {
    expect(
      formatRequirements([[{ type: RequirementType.NIVEL, value: 8 }]], {
        levelSuffix: ' (efetivo: nível −4)',
      })
    ).toBe('Nível 8 (efetivo: nível −4)');
  });

  it('Arma Sagrada é exibida como exclusão de Lena e Marah', () => {
    const armaSagrada = PALADINO.powers?.find(
      (power) => power.name === 'Arma Sagrada'
    );

    expect(armaSagrada).toBeDefined();
    expect(formatRequirements(armaSagrada?.requirements)).toBe(
      'Não ser devoto de Lena e Não ser devoto de Marah'
    );
  });
});
