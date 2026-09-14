import { describe, expect, it } from 'vitest';
import VASSALO, { CAMINHO_GOVERNANTE, CAMINHO_SOLDADO } from '../vassalo';
import CAVALEIRO from '../../../classes/cavaleiro';
import { ClassAbility } from '../../../../../../interfaces/Class';
import { createMockCharacterSheet } from '../../../../../../__mocks__/characterSheet';
import { getForeignClassPowers } from '../../../../../../functions/powers';

/**
 * O Vassalo é quase todo feito de concessões por nível ("recebe um poder de
 * cavaleiro a sua escolha", "recebe o poder Escudeiro"), e nenhuma delas
 * chegava a virar ação na ficha — a habilidade existia só como texto.
 *
 * Estes testes travam o vínculo entre o TEXTO do livro e a ação cadastrada:
 * uma habilidade cujo texto promete um poder precisa ter a ação que o entrega.
 */

const abilities = VASSALO.abilities ?? [];
const byName = (name: string): ClassAbility => {
  const found = abilities.find((ability) => ability.name === name);
  if (!found) throw new Error(`Habilidade ausente no Vassalo: ${name}`);
  return found;
};

const actionsOf = (name: string) =>
  (byName(name).sheetActions ?? []).map((entry) => entry.action);

describe('Vassalo', () => {
  describe('concessões de poder por nível', () => {
    // O Vassalo não ganha poder todo nível. A concessão é declarada na CLASSE
    // (`powerGrants`) e não como ação da habilidade: como ação, ela virava um
    // SEGUNDO passo de escolha, além do passo normal do nível — que por sua
    // vez aparecia vazio, já que a classe não tem catálogo próprio.
    const grants = VASSALO.powerGrants ?? [];

    it('concede poder exatamente nos níveis do livro', () => {
      expect(grants.map((grant) => grant.level)).toEqual([
        2, 4, 6, 7, 9, 12, 14, 16, 18,
      ]);
    });

    it('nenhuma habilidade concede poder por ação, para não duplicar o passo', () => {
      const comAcaoDePoder = abilities.filter((ability) =>
        (ability.sheetActions ?? []).some(
          (entry) => entry.action.type === 'getClassPower'
        )
      );

      expect(comAcaoDePoder).toEqual([]);
    });

    it.each([2, 4, 6, 12, 14, 16, 18])(
      'no nível %i o poder vem do Cavaleiro',
      (level) => {
        expect(
          grants.find((grant) => grant.level === level)?.fromClasses
        ).toEqual(['Cavaleiro']);
      }
    );

    it('no 7º nível aceita cavaleiro ou guerreiro', () => {
      expect(grants.find((grant) => grant.level === 7)?.fromClasses).toEqual([
        'Cavaleiro',
        'Guerreiro',
      ]);
    });

    it('no 9º nível aceita guerreiro ou nobre, os dois caminhos', () => {
      expect(grants.find((grant) => grant.level === 9)?.fromClasses).toEqual([
        'Guerreiro',
        'Nobre',
      ]);
    });

    it.each([1, 3, 5, 8, 10, 11, 13, 15, 17, 19, 20])(
      'no nível %i não concede poder nenhum',
      (level) => {
        expect(grants.some((grant) => grant.level === level)).toBe(false);
      }
    );
  });

  describe('concessões de poder específico', () => {
    it.each([
      ['Capitão do Reino', 'Escudeiro'],
      ['Lorde', 'Autoridade Feudal'],
      ['Barão', 'Título'],
    ])('%s concede %s, buscando na classe Cavaleiro', (ability, powerName) => {
      expect(actionsOf(ability)).toContainEqual(
        expect.objectContaining({
          type: 'grantSpecificClassPower',
          powerName,
          fromClass: 'Cavaleiro',
        })
      );
    });

    it('os três poderes existem mesmo no catálogo do Cavaleiro', () => {
      // Guarda contra erro de digitação: o nome é resolvido em runtime e um
      // engano só apareceria como exceção durante o level-up do jogador.
      const nomes = CAVALEIRO.powers.map((power) => power.name);
      expect(nomes).toEqual(
        expect.arrayContaining(['Escudeiro', 'Autoridade Feudal', 'Título'])
      );
    });
  });

  describe('caminhos do 9º nível', () => {
    it('Lorde oferece Soldado e Governante', () => {
      const escolha = actionsOf('Lorde').find(
        (action) => action.type === 'chooseFromOptions'
      );

      expect(escolha).toMatchObject({ optionKey: 'caminhoDoVassalo' });
      expect(
        (escolha as { options: { name: string }[] }).options.map((o) => o.name)
      ).toEqual([CAMINHO_SOLDADO, CAMINHO_GOVERNANTE]);
    });

    it('Visconde ramifica o benefício pelo caminho escolhido', () => {
      const bonuses = byName('Visconde').sheetBonuses ?? [];

      expect(bonuses).toHaveLength(2);
      expect(bonuses[0].condition?.clauses).toContainEqual({
        kind: 'optionChosen',
        value: CAMINHO_SOLDADO,
      });
      expect(bonuses[1].condition?.clauses).toContainEqual({
        kind: 'optionChosen',
        value: CAMINHO_GOVERNANTE,
      });
    });

    it('Marquês dá Defesa só no Caminho do Soldado', () => {
      const bonuses = byName('Marquês').sheetBonuses ?? [];

      expect(bonuses).toHaveLength(1);
      expect(bonuses[0].target).toMatchObject({ type: 'Defense' });
      expect(bonuses[0].condition?.clauses).toContainEqual({
        kind: 'optionChosen',
        value: CAMINHO_SOLDADO,
      });
    });
  });

  describe('resolução dos poderes de cavaleiro', () => {
    it('um vassalo enxerga poderes de Cavaleiro, com a classe carimbada', () => {
      const sheet = createMockCharacterSheet();
      sheet.classe = { ...sheet.classe, name: 'Vassalo', powers: [] } as never;
      sheet.nivel = 7;

      const powers = getForeignClassPowers(sheet, ['Cavaleiro'], 7);

      expect(powers.length).toBeGreaterThan(0);
      powers.forEach((power) => expect(power.className).toBe('Cavaleiro'));
    });

    it('não reoferece poder que o vassalo já tem', () => {
      const sheet = createMockCharacterSheet();
      sheet.classe = { ...sheet.classe, name: 'Vassalo', powers: [] } as never;
      sheet.nivel = 7;

      const [primeiro] = getForeignClassPowers(sheet, ['Cavaleiro'], 7);
      sheet.classPowers = [primeiro];

      const depois = getForeignClassPowers(sheet, ['Cavaleiro'], 7).map(
        (power) => power.name
      );
      if (!primeiro.canRepeat) expect(depois).not.toContain(primeiro.name);
    });
  });
});
