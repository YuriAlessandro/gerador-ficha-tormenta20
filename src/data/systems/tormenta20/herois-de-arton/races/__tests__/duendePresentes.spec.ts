import _ from 'lodash';
import { recalculateSheet } from '../../../../../../functions/recalculateSheet';
import { normalizeSheet } from '../../../../../../functions/sheetNormalizer';
import { applyRaceCustomizationToSheet } from '../../../../../../functions/applyRaceCustomizationToSheet';
import { createMockCharacterSheet } from '../../../../../../__mocks__/characterSheet';
import CharacterSheet from '../../../../../../interfaces/CharacterSheet';
import Race from '../../../../../../interfaces/Race';
import Skill from '../../../../../../interfaces/Skills';
import { Atributo } from '../../../atributos';
import { spellsCircle1 } from '../../../magias/generalSpells';
import DUENDE_PRESENTES_POWERS from '../../powers/duendePresentes';
import DUENDE, { applyDuendeCustomization } from '../duende';
import { DUENDE_PRESENTES } from '../duende-config';

/**
 * Presentes de Magia e de Caos que concedem magia: Enfeitiçar, Invisibilidade,
 * Visão Feérica e as três Afinidades Elementais.
 */
const duendeWith = (presentes: string[]): Race =>
  applyDuendeCustomization(
    _.cloneDeep(DUENDE),
    'vegetal',
    'medio',
    [Atributo.CARISMA, Atributo.DESTREZA],
    presentes,
    Skill.DIPLOMACIA
  );

const buildSheet = (presentes: string[]): CharacterSheet => {
  const sheet = createMockCharacterSheet();
  sheet.raca = duendeWith(presentes);
  sheet.generalPowers = [];
  sheet.classPowers = [];
  sheet.spells = [];
  sheet.sentidos = [];
  sheet.sheetBonuses = [];
  sheet.sheetActionHistory = [];
  return sheet;
};

const spellNames = (sheet: CharacterSheet) => sheet.spells.map((s) => s.nome);
const findSpell = (sheet: CharacterSheet, nome: string) =>
  sheet.spells.find((s) => s.nome === nome);

describe('Presentes do Duende que concedem magia', () => {
  it('Enfeitiçar adiciona a magia com Carisma como atributo-chave', () => {
    const result = recalculateSheet(buildSheet(['enfeiticar']));

    expect(findSpell(result, 'Enfeitiçar')?.customKeyAttr).toBe(
      Atributo.CARISMA
    );
  });

  it('Invisibilidade adiciona a magia de 2º círculo', () => {
    const result = recalculateSheet(buildSheet(['invisibilidade']));

    expect(spellNames(result)).toContain('Invisibilidade');
  });

  it('Visão Feérica adiciona Visão Mística sempre ativa e mantém o sentido', () => {
    const result = recalculateSheet(buildSheet(['visao-feerica']));
    const spell = findSpell(result, 'Visão Mística (Sempre Ativo)');

    expect(spell).toBeDefined();
    expect(spell?.aprimoramentos).toEqual([]);
    expect(spell?.description).toContain('invisíveis');
    expect(result.sentidos).toContain(
      'Visão na penumbra; Visão Mística permanente'
    );
  });

  it('Afinidade Elemental adiciona as duas magias do elemento', () => {
    const result = recalculateSheet(buildSheet(['afinidade-agua']));

    expect(spellNames(result)).toEqual(
      expect.arrayContaining(['Criar Elementos', 'Névoa'])
    );
  });

  it('recalcular de novo não duplica nem barateia a magia', () => {
    const once = recalculateSheet(buildSheet(['enfeiticar', 'visao-feerica']));
    const twice = recalculateSheet(_.cloneDeep(once));

    expect(spellNames(twice)).toEqual(spellNames(once));
    expect(findSpell(twice, 'Enfeitiçar')?.manaReduction).toBeUndefined();
  });

  it('magia já conhecida não barateia e sobrevive à remoção do presente', () => {
    const sheet = buildSheet(['enfeiticar']);
    sheet.spells = [_.cloneDeep(spellsCircle1.enfeiticar)];

    const result = recalculateSheet(sheet);
    expect(result.spells).toHaveLength(1);
    expect(findSpell(result, 'Enfeitiçar')?.manaReduction).toBeUndefined();

    const semPresente = applyRaceCustomizationToSheet(result, duendeWith([]));
    expect(spellNames(semPresente)).toContain('Enfeitiçar');
  });

  it('trocar o presente remove a magia e o sentido que ele concedeu', () => {
    const comVisao = recalculateSheet(buildSheet(['visao-feerica']));
    const trocado = applyRaceCustomizationToSheet(
      comVisao,
      duendeWith(['enfeiticar'])
    );

    expect(spellNames(trocado)).toEqual(['Enfeitiçar']);
    expect(trocado.sentidos).not.toContain(
      'Visão na penumbra; Visão Mística permanente'
    );
  });

  it('o presente pego ao subir de nível concede a mesma magia', () => {
    const sheet = buildSheet([]);
    const power = DUENDE_PRESENTES_POWERS.find((p) => p.name === 'Enfeitiçar');
    sheet.generalPowers = [_.cloneDeep(power!)];

    expect(spellNames(recalculateSheet(sheet))).toContain('Enfeitiçar');
  });

  it('as duas cópias de cada presente têm as mesmas ações', () => {
    Object.values(DUENDE_PRESENTES).forEach(({ ability }) => {
      const power = DUENDE_PRESENTES_POWERS.find(
        (p) => p.name === ability.name
      );
      expect(power?.sheetActions).toEqual(ability.sheetActions);
    });
  });
});

describe('fichas de Duende salvas antes da automação', () => {
  // A ficha embute a cópia da habilidade de quando ela não concedia magia, e
  // já tem o recibo do sentido no histórico.
  const buildLegacySheet = (): CharacterSheet => {
    const legacy = recalculateSheet(
      buildSheet(['visao-feerica', 'enfeiticar'])
    );
    legacy.spells = [];
    legacy.raca.abilities = legacy.raca.abilities.map((ability) => ({
      ...ability,
      sheetActions: ability.sheetActions?.filter(
        (a) => a.action.type !== 'learnSpell'
      ),
    }));
    legacy.sheetActionHistory = legacy.sheetActionHistory.filter(
      (entry) => !entry.changes.some((c) => c.type === 'SpellsLearned')
    );
    return legacy;
  };

  it('sem o refresh, a ficha continua sem as magias', () => {
    expect(recalculateSheet(buildLegacySheet()).spells).toHaveLength(0);
  });

  it('normalizeSheet recoloca as ações e o recálculo concede as magias', () => {
    const legacy = buildLegacySheet();

    normalizeSheet(legacy);
    const result = recalculateSheet(legacy);

    expect(spellNames(result)).toEqual(
      expect.arrayContaining(['Visão Mística (Sempre Ativo)', 'Enfeitiçar'])
    );
    // O sentido já estava registrado: não duplica.
    expect(
      result.sentidos?.filter((s) => s.startsWith('Visão na penumbra'))
    ).toHaveLength(1);
  });
});
