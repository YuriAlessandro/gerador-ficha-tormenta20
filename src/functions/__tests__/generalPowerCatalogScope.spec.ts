import { describe, expect, it } from 'vitest';
import { getPowersAllowedByRequirements } from '../powers';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import { SupplementId } from '../../types/supplement.types';
import { GeneralPowerType } from '../../interfaces/Poderes';
import Skill from '../../interfaces/Skills';
import CharacterSheet from '../../interfaces/CharacterSheet';

/**
 * `getPowersAllowedByRequirements` alimenta o SORTEIO de poder geral (subida de
 * nível, Propósito de Criação, Humano Versátil, Memória Póstuma…). Ela lia o
 * catálogo `data/poderes` — o módulo deprecated, que é só o core —, então
 * nenhum poder geral de suplemento entrava em ficha aleatória, mesmo com o
 * suplemento ligado. E, como o catálogo é um só, os CONCEDIDOS entravam na
 * lista: todo concedido tem pré-requisito DEVOTO, que o próprio devoto
 * satisfaz, então um devoto podia receber um poder da divindade como poder
 * geral de nível.
 */
const trainIn = (sheet: CharacterSheet, skill: Skill) => {
  const found = sheet.completeSkills?.find((s) => s.name === skill);
  if (!found) throw new Error(`${skill} ausente no mock`);
  found.training = 2;
  sheet.skills.push(skill);
};

const namesOf = (sheet: CharacterSheet, supplements?: SupplementId[]) =>
  getPowersAllowedByRequirements(sheet, supplements).map((p) => p.name);

describe('getPowersAllowedByRequirements — escopo do catálogo', () => {
  it('sem suplemento carimbado, fica no core (comportamento de ficha antiga)', () => {
    const sheet = createMockCharacterSheet();
    trainIn(sheet, Skill.CAVALGAR);

    const names = namesOf(sheet);

    expect(names).toContain('Ginete');
    expect(names).not.toContain('Combate Montado');
  });

  it('inclui poderes do suplemento quando ele está ativo', () => {
    const sheet = createMockCharacterSheet();
    trainIn(sheet, Skill.CAVALGAR);
    sheet.generalPowers = [{ name: 'Ginete' }] as never;

    const names = namesOf(sheet, [
      SupplementId.TORMENTA20_CORE,
      SupplementId.TORMENTA20_AMEACAS_ARTON,
    ]);

    expect(names).toContain('Combate Montado');
    expect(names).toContain('Dois Como Um');
    // Pende de Combate Montado, que a ficha ainda não tem.
    expect(names).not.toContain('Resistência Montada');
  });

  it('lê `sheet.supplements` quando ninguém passa a lista', () => {
    const sheet = createMockCharacterSheet();
    trainIn(sheet, Skill.CAVALGAR);
    sheet.generalPowers = [{ name: 'Ginete' }] as never;
    sheet.supplements = [
      SupplementId.TORMENTA20_CORE,
      SupplementId.TORMENTA20_AMEACAS_ARTON,
    ];

    expect(namesOf(sheet)).toContain('Combate Montado');
  });

  it('nunca oferece poder concedido nem poder de raça como poder geral', () => {
    const sheet = createMockCharacterSheet();
    sheet.devoto = {
      divindade: { name: 'Khalmyr' },
      poderes: [],
    } as never;

    const powers = getPowersAllowedByRequirements(sheet, [
      SupplementId.TORMENTA20_CORE,
      SupplementId.TORMENTA20_HEROIS_ARTON,
    ]);

    expect(powers.map((p) => p.type)).not.toContain(
      GeneralPowerType.CONCEDIDOS
    );
    expect(powers.map((p) => p.type)).not.toContain(GeneralPowerType.RACA);
    expect(powers.map((p) => p.name)).not.toContain('Espada Justiceira');
  });

  it('Ginete Altivo (Hippion) libera a cadeia montada no sorteio', () => {
    const sheet = createMockCharacterSheet();
    trainIn(sheet, Skill.CAVALGAR);
    sheet.devoto = {
      divindade: { name: 'Hippion' },
      poderes: [{ name: 'Ginete Altivo', grantsPowerRequirements: ['Ginete'] }],
    } as never;

    const names = namesOf(sheet, [
      SupplementId.TORMENTA20_CORE,
      SupplementId.TORMENTA20_AMEACAS_ARTON,
    ]);

    expect(names).toContain('Combate Montado');
    expect(names).toContain('Carga de Cavalaria');
  });
});
