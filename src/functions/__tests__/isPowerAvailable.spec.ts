/**
 * Testes para o poder "Artesão Criativo" (Inventor) e a perícia Ofício (Artesão).
 *
 * Regras verificadas:
 * - O poder deve ser selecionável quando o personagem tem Ofício (Artesão).
 * - Tendo o poder + Ofício (Artesão), a perícia substitui qualquer outro Ofício
 *   específico em pré-requisitos (ex.: Estilista, que pede Ofício (Alfaiate)).
 * - Sem o poder OU sem a perícia, a substituição não ocorre.
 * - Requisito genérico de Ofício continua satisfeito por qualquer Ofício específico.
 */
import { describe, it, expect } from 'vitest';
import { isPowerAvailable } from '../powers';
import INVENTOR_POWERS from '../../data/systems/tormenta20/herois-de-arton/classPowers/inventor';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import Skill from '../../interfaces/Skills';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import { ClassPower } from '../../interfaces/Class';
import { RequirementType } from '../../interfaces/Poderes';

function getInventorPower(name: string): ClassPower {
  const power = INVENTOR_POWERS.find((p) => p.name === name);
  if (!power) throw new Error(`${name} não encontrado em INVENTOR_POWERS`);
  return power;
}

const artesaoCriativo = getInventorPower('Artesão Criativo');
const estilista = getInventorPower('Estilista');

describe('Artesão Criativo e Ofício (Artesão)', () => {
  it('Artesão Criativo fica disponível com Ofício (Artesão) treinado', () => {
    const sheet = createMockCharacterSheet();
    sheet.skills = [Skill.OFICIO_ARTESANATO];

    expect(isPowerAvailable(sheet, artesaoCriativo)).toBe(true);
  });

  it('Artesão Criativo NÃO fica disponível sem a perícia', () => {
    const sheet = createMockCharacterSheet();
    sheet.skills = [Skill.ATLETISMO];

    expect(isPowerAvailable(sheet, artesaoCriativo)).toBe(false);
  });

  it('substitui outro Ofício em pré-requisito (Estilista) quando tem o poder + perícia', () => {
    const sheet = createMockCharacterSheet();
    sheet.skills = [Skill.OFICIO_ARTESANATO]; // sem Ofício (Alfaiate)
    sheet.atributos[Atributo.CARISMA] = { name: Atributo.CARISMA, value: 1 };
    sheet.classPowers = [artesaoCriativo];

    expect(isPowerAvailable(sheet, estilista)).toBe(true);
  });

  it('NÃO substitui sem o poder Artesão Criativo (só a perícia)', () => {
    const sheet = createMockCharacterSheet();
    sheet.skills = [Skill.OFICIO_ARTESANATO];
    sheet.atributos[Atributo.CARISMA] = { name: Atributo.CARISMA, value: 1 };
    sheet.classPowers = [];

    expect(isPowerAvailable(sheet, estilista)).toBe(false);
  });

  it('NÃO substitui sem Ofício (Artesão) treinado (só o poder)', () => {
    const sheet = createMockCharacterSheet();
    sheet.skills = [Skill.ATLETISMO];
    sheet.atributos[Atributo.CARISMA] = { name: Atributo.CARISMA, value: 1 };
    sheet.classPowers = [artesaoCriativo];

    expect(isPowerAvailable(sheet, estilista)).toBe(false);
  });

  it('requisito genérico de Ofício continua satisfeito por qualquer Ofício específico', () => {
    const sheet = createMockCharacterSheet();
    sheet.skills = [Skill.OFICIO_CULINARIA];

    const genericOficioPower: ClassPower = {
      name: 'Poder de Teste (Ofício genérico)',
      text: 'Requer Ofício genérico.',
      requirements: [[{ type: RequirementType.PERICIA, name: Skill.OFICIO }]],
    };

    expect(isPowerAvailable(sheet, genericOficioPower)).toBe(true);
  });
});

describe('Requisito RequirementType.CLASSE (o nome fica em rule.name)', () => {
  const guerreiroPower: ClassPower = {
    name: 'Poder de Teste (exige Guerreiro)',
    text: 'Requer classe Guerreiro.',
    requirements: [[{ type: RequirementType.CLASSE, name: 'Guerreiro' }]],
  };

  it('disponível quando a classe do personagem bate com o requisito', () => {
    const sheet = createMockCharacterSheet();
    sheet.classe = { ...sheet.classe, name: 'Guerreiro' };

    expect(isPowerAvailable(sheet, guerreiroPower)).toBe(true);
  });

  it('indisponível quando a classe do personagem não bate', () => {
    const sheet = createMockCharacterSheet();
    sheet.classe = { ...sheet.classe, name: 'Arcanista' };

    expect(isPowerAvailable(sheet, guerreiroPower)).toBe(false);
  });

  it('disponível para variante da classe exigida (isClassOrVariantOf)', () => {
    const sheet = createMockCharacterSheet();
    sheet.classe = {
      ...sheet.classe,
      name: 'Bárbaro Selvagem',
      isVariant: true,
      baseClassName: 'Bárbaro',
    };

    const barbaroPower: ClassPower = {
      name: 'Poder de Teste (exige Bárbaro)',
      text: 'Requer classe Bárbaro.',
      requirements: [[{ type: RequirementType.CLASSE, name: 'Bárbaro' }]],
    };

    expect(isPowerAvailable(sheet, barbaroPower)).toBe(true);
  });
});
