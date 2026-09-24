/**
 * Origem "Cria da Favela (Valkaria)" (Atlas de Arton).
 *
 * O +1 Constituição do livro vinha de `Origin.getAttributeModifier`, um gancho
 * exclusivo desta origem que SÓ o motor de ficha aleatória chamava — quem
 * criava pelo assistente não recebia o ponto (relato de usuário, ago/2026).
 * Virou `sheetAction` `ModifyAttribute` no poder, que passa pelo `applyPower` e
 * portanto vale nos dois motores, na troca de origem e é idempotente.
 *
 * Fichas JÁ SALVAS não são tocadas de propósito: `sheet.origin.powers` é uma
 * cópia congelada do poder e nada a refresca pelo catálogo, então as fichas
 * aleatórias antigas não somam o ponto duas vezes.
 */
import { describe, it, expect } from 'vitest';
import _ from 'lodash';
import generateRandomSheet, { generateEmptySheet } from '../general';
import { recalculateSheet } from '../recalculateSheet';
import { normalizeSheet } from '../sheetNormalizer';
import {
  removeOriginBenefits,
  applyRegionalOriginBenefits,
} from '../originBenefits';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import SelectOptions from '../../interfaces/SelectedOptions';
import CRIA_DA_FAVELA from '../../data/systems/tormenta20/atlas-de-arton/origins/cria-da-favela';
import atlasOriginPowers from '../../data/systems/tormenta20/atlas-de-arton/powers/originPowers';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import { SupplementId } from '../../types/supplement.types';

const ORIGIN_NAME = 'Cria da Favela (Valkaria)';
const POWER_NAME = 'Cria da Favela';
const POWER = atlasOriginPowers.CRIA_DA_FAVELA;

// Elfo, e não Humano: o Versátil sorteia um poder geral a cada recálculo e
// deixa qualquer asserção sobre a ficha intermitente.
const baseOptions = (origin: string, nivel = 1): SelectOptions => ({
  nivel,
  raca: 'Elfo',
  classe: 'Guerreiro',
  origin,
  devocao: { label: '--', value: '--' },
  supplements: [
    SupplementId.TORMENTA20_CORE,
    SupplementId.TORMENTA20_ATLAS_ARTON,
  ],
});

const con = (sheet: CharacterSheet): number =>
  sheet.atributos[Atributo.CONSTITUICAO].value;

const attributeEntries = (sheet: CharacterSheet) =>
  (sheet.sheetActionHistory || []).filter(
    (entry) =>
      entry.powerName === POWER_NAME &&
      entry.changes.some((change) => change.type === 'Attribute')
  );

describe('Cria da Favela', () => {
  describe('dado do poder', () => {
    it('concede +1 Constituição por sheetAction', () => {
      expect(POWER.sheetActions).toHaveLength(1);
      expect(POWER.sheetActions?.[0]).toMatchObject({
        source: { type: 'origin', originName: ORIGIN_NAME },
        action: {
          type: 'ModifyAttribute',
          attribute: Atributo.CONSTITUICAO,
          value: 1,
        },
      });
    });

    it('não usa mais o gancho getAttributeModifier', () => {
      // Trava a remoção: ressuscitar o campo faria a ficha aleatória somar duas
      // vezes, porque o poder já aplica o mesmo +1.
      expect('getAttributeModifier' in CRIA_DA_FAVELA).toBe(false);
    });
  });

  describe('assistente de criação (generateEmptySheet)', () => {
    it('soma o +1 Constituição — o bug relatado', () => {
      // Delta contra uma origem-controle sem ação de atributo: o valor absoluto
      // depende do sorteio de atributos e não serve de asserção.
      const comOrigem = generateEmptySheet(baseOptions(ORIGIN_NAME), {});
      const controle = generateEmptySheet(
        baseOptions('Batedor Sambur (Sambúrdia)'),
        {}
      );

      expect(con(comOrigem) - con(controle)).toBe(1);
    });

    it('o PV de nível 1 já entra somando o ponto', () => {
      const sheet = generateEmptySheet(baseOptions(ORIGIN_NAME), {});

      expect(sheet.pv).toBe(sheet.classe.pv + con(sheet));
    });

    it('grava exatamente uma entrada no histórico', () => {
      const sheet = generateEmptySheet(baseOptions(ORIGIN_NAME), {});

      expect(attributeEntries(sheet)).toHaveLength(1);
    });
  });

  describe('ficha aleatória (generateRandomSheet)', () => {
    it('soma o +1 e o PV de nível 1 acompanha', () => {
      const sheet = generateRandomSheet(baseOptions(ORIGIN_NAME));

      expect(attributeEntries(sheet)).toHaveLength(1);
      expect(sheet.pv).toBe(sheet.classe.pv + con(sheet));
    });

    it('o PV de níveis acima também parte da base corrigida', () => {
      const sheet = generateRandomSheet(baseOptions(ORIGIN_NAME, 3));
      const perLevel = Math.max(sheet.classe.addpv + con(sheet), 1);

      expect(sheet.pv).toBe(sheet.classe.pv + con(sheet) + perLevel * 2);
    });

    it('o passo-a-passo mostra o PV final em "Vida máxima (+CON)"', () => {
      const sheet = generateRandomSheet(baseOptions(ORIGIN_NAME));
      const pvStep = sheet.steps.find(
        (step) => step.label === 'Vida máxima (+CON)'
      );

      expect(pvStep?.value[0].value).toBe(sheet.pv);
    });
  });

  describe('idempotência', () => {
    it('recalcular várias vezes não acumula o bônus', () => {
      const primeira = generateEmptySheet(baseOptions(ORIGIN_NAME), {});
      const segunda = recalculateSheet(_.cloneDeep(primeira));
      const terceira = recalculateSheet(_.cloneDeep(segunda));

      expect(con(segunda)).toBe(con(primeira));
      expect(con(terceira)).toBe(con(primeira));
      expect(attributeEntries(terceira)).toHaveLength(1);
    });
  });

  describe('troca de origem', () => {
    it('remover a origem devolve o ponto de Constituição', () => {
      const comOrigem = generateEmptySheet(baseOptions(ORIGIN_NAME), {});
      const semOrigem = removeOriginBenefits(_.cloneDeep(comOrigem));

      expect(con(semOrigem)).toBe(con(comOrigem) - 1);
      expect(attributeEntries(semOrigem)).toHaveLength(0);
    });

    it('sair e voltar para a origem termina em +1, não +2', () => {
      const comOrigem = generateEmptySheet(baseOptions(ORIGIN_NAME), {});
      const original = con(comOrigem);

      const semOrigem = removeOriginBenefits(_.cloneDeep(comOrigem));
      const deVolta = recalculateSheet(
        applyRegionalOriginBenefits(semOrigem, CRIA_DA_FAVELA)
      );

      expect(con(deVolta)).toBe(original);
    });
  });

  describe('fichas legadas', () => {
    /**
     * Ficha da época em que o poder era inerte e o +1 era mutação direta do
     * motor aleatório: Constituição já somada, histórico vazio, e a cópia
     * embutida do poder SEM `sheetActions`.
     */
    const legacySheet = (): CharacterSheet => {
      const sheet = createMockCharacterSheet();
      sheet.origin = {
        name: ORIGIN_NAME,
        powers: [_.omit(_.cloneDeep(POWER), 'sheetActions')],
      };
      sheet.sheetBonuses = [];
      sheet.sheetActionHistory = [];
      return sheet;
    };

    it('não recebe o bônus de novo ao ser aberta', () => {
      const legada = legacySheet();
      const antes = con(legada);

      normalizeSheet(legada);
      const recalculada = recalculateSheet(legada);

      expect(con(recalculada)).toBe(antes);
    });

    it('nada refresca a cópia embutida do poder de origem', () => {
      // É esta garantia que dispensa qualquer migração: se um dia algum refresh
      // passar a alcançar `origin.powers`, este teste quebra e avisa que as
      // fichas aleatórias antigas passariam a somar +2.
      const legada = legacySheet();
      normalizeSheet(legada);

      expect(legada.origin?.powers[0].sheetActions).toBeUndefined();
    });
  });
});
