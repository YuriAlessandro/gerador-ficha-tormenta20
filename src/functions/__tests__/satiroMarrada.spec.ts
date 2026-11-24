/**
 * Marrada (Sátiro, Heróis de Arton p. 15): "Você possui uma arma natural de
 * marrada (dano 1d6, crítico x2, impacto). Uma vez por rodada, quando usa a ação
 * agredir para atacar com outra arma, pode gastar 1 PM para fazer um ataque
 * corpo a corpo extra com a marrada." A habilidade era só texto — a ficha não
 * tinha o ataque. Mesmo padrão dos Chifres do Minotauro e dos Cascos do
 * Centauro (`addEquipment`).
 */
import { describe, it, expect } from 'vitest';
import _ from 'lodash';
import { buildJao } from './fixtures/fichaJao';
import { recalculateSheet } from '../recalculateSheet';
import { normalizeSheet } from '../sheetNormalizer';
import { isWeaponMelee } from '../weaponSkill';
import CharacterSheet from '../../interfaces/CharacterSheet';

const marradas = (sheet: CharacterSheet) =>
  sheet.bag.equipments.Arma.filter((arma) => arma.nome === 'Marrada');

describe('Marrada — arma natural do Sátiro', () => {
  it('Jão tem a marrada: 1d6, x2, impacto, corpo a corpo, natural', () => {
    const [marrada, ...extras] = marradas(buildJao());

    expect(extras).toHaveLength(0);
    expect(marrada).toMatchObject({
      dano: '1d6',
      critico: 'x2',
      tipo: 'Impac.',
      preco: 0,
    });
    expect(marrada.weaponTags).toContain('natural');
    expect(isWeaponMelee(marrada)).toBe(true);
  });

  it('a nota descreve o ataque extra (1 PM, 1x/rodada, com agredir)', () => {
    const [marrada] = marradas(buildJao());

    expect(marrada.descricao).toBe(
      'Ataque extra: 1 PM, 1x/rodada, ao usar agredir com outra arma.'
    );
  });

  it('recalcular de novo não duplica a arma', () => {
    const jao = recalculateSheet(recalculateSheet(buildJao()));

    expect(marradas(jao)).toHaveLength(1);
  });

  it('ficha de Sátiro salva sem a ação ganha a marrada no próximo recálculo', () => {
    const antiga = _.cloneDeep(buildJao());
    antiga.raca.abilities = antiga.raca.abilities.map((ability) =>
      ability.name === 'Marrada'
        ? { ...ability, sheetActions: undefined }
        : ability
    );
    antiga.bag.equipments.Arma = antiga.bag.equipments.Arma.filter(
      (arma) => arma.nome !== 'Marrada'
    );
    antiga.sheetActionHistory = antiga.sheetActionHistory.filter(
      (entry) =>
        !entry.changes.some(
          (change) =>
            change.type === 'EquipmentAdded' &&
            (change.equipment.Arma ?? []).some((e) => e.nome === 'Marrada')
        )
    );
    expect(marradas(recalculateSheet(antiga))).toHaveLength(0);

    normalizeSheet(antiga);

    expect(marradas(recalculateSheet(antiga))).toHaveLength(1);
  });
});
