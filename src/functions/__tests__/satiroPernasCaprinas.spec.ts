/**
 * Pernas Caprinas (Sátiro, Heróis de Arton p. 15): "você pode usar Destreza
 * como atributo-chave de Atletismo (em vez de Força)". O dado só tinha o bônus
 * de deslocamento — a ficha "Jão" (For 0 / Des 4) saía com Atletismo +4 no
 * lugar de +8.
 *
 * "Pode usar" = usa o MAIOR. A troca vale nos dois sentidos porque `modAttr` é
 * persistido em `completeSkills`: sem o bônus de volta para Força, uma ficha
 * cuja Força passasse a Destreza ficaria presa em Destreza.
 */
import { describe, it, expect } from 'vitest';
import _ from 'lodash';
import { buildJao, skillTotal } from './fixtures/fichaJao';
import { recalculateSheet } from '../recalculateSheet';
import { normalizeSheet } from '../sheetNormalizer';
import { evaluateBonusCondition } from '../bonusConditions';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import Skill from '../../interfaces/Skills';
import { Atributo } from '../../data/systems/tormenta20/atributos';

const atletismo = (sheet: CharacterSheet) =>
  sheet.completeSkills?.find((s) => s.name === Skill.ATLETISMO);

const withAttributes = (
  sheet: CharacterSheet,
  values: Partial<Record<Atributo, number>>
): CharacterSheet => {
  const next = _.cloneDeep(sheet);
  Object.entries(values).forEach(([attr, value]) => {
    next.atributos[attr as Atributo].value = value as number;
  });
  return next;
};

describe('Pernas Caprinas — Destreza como atributo-chave de Atletismo', () => {
  it('Jão (For 0, Des 4): Atletismo = 2 (½ nível) + 4 (Des) + 2 (treino) = +8', () => {
    const jao = buildJao();

    expect(atletismo(jao)?.modAttr).toBe(Atributo.DESTREZA);
    expect(skillTotal(jao, Skill.ATLETISMO)).toBe(8);
  });

  it('Força maior que Destreza: Atletismo fica com Força', () => {
    const forte = recalculateSheet(
      withAttributes(buildJao(), { [Atributo.FORCA]: 5 })
    );

    expect(atletismo(forte)?.modAttr).toBe(Atributo.FORCA);
    expect(skillTotal(forte, Skill.ATLETISMO)).toBe(2 + 5 + 2);
  });

  it('volta para Força quando a Força passa a Destreza depois', () => {
    const jao = buildJao();
    expect(atletismo(jao)?.modAttr).toBe(Atributo.DESTREZA);

    const depois = recalculateSheet(
      withAttributes(jao, { [Atributo.FORCA]: 6 })
    );

    expect(atletismo(depois)?.modAttr).toBe(Atributo.FORCA);
  });

  it('empate fica com Destreza (mesmo valor)', () => {
    const empate = recalculateSheet(
      withAttributes(buildJao(), { [Atributo.FORCA]: 4 })
    );

    expect(skillTotal(empate, Skill.ATLETISMO)).toBe(8);
  });

  it('ficha salva com a cópia antiga da habilidade é curada na carga', () => {
    const jao = buildJao();
    const antiga = _.cloneDeep(jao);
    antiga.raca.abilities = antiga.raca.abilities.map((ability) =>
      ability.name === 'Pernas Caprinas'
        ? {
            ...ability,
            sheetBonuses: ability.sheetBonuses?.filter(
              (b) => b.target.type === 'Displacement'
            ),
          }
        : ability
    );
    antiga.completeSkills = antiga.completeSkills?.map((s) =>
      s.name === Skill.ATLETISMO ? { ...s, modAttr: Atributo.FORCA } : s
    );
    expect(skillTotal(recalculateSheet(antiga), Skill.ATLETISMO)).toBe(4);

    normalizeSheet(antiga);

    expect(skillTotal(recalculateSheet(antiga), Skill.ATLETISMO)).toBe(8);
  });
});

describe('condição attributeCompare', () => {
  const sheet = createMockCharacterSheet();
  sheet.atributos[Atributo.FORCA].value = 1;
  sheet.atributos[Atributo.DESTREZA].value = 3;

  it('compara dois atributos da ficha', () => {
    const clause = {
      kind: 'attributeCompare' as const,
      attribute: Atributo.DESTREZA,
      op: 'gte' as const,
      otherAttribute: Atributo.FORCA,
    };

    expect(
      evaluateBonusCondition(sheet, { combinator: 'AND', clauses: [clause] })
    ).toBe(true);
    expect(
      evaluateBonusCondition(sheet, {
        combinator: 'AND',
        clauses: [{ ...clause, negate: true }],
      })
    ).toBe(false);
    expect(
      evaluateBonusCondition(sheet, {
        combinator: 'AND',
        clauses: [{ ...clause, op: 'lte' }],
      })
    ).toBe(false);
  });
});
