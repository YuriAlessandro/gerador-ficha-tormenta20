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
import { getAllowedClassPowers, isPowerAvailable } from '../powers';
import INVENTOR_POWERS from '../../data/systems/tormenta20/herois-de-arton/classPowers/inventor';
import CORE_INVENTOR from '../../data/systems/tormenta20/classes/inventor';
import { normalizeSheet } from '../sheetNormalizer';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import Skill from '../../interfaces/Skills';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import { ClassPower } from '../../interfaces/Class';
import { RequirementType } from '../../interfaces/Poderes';
import PALADINO from '../../data/systems/tormenta20/classes/paladino';
import { DivindadeEnum } from '../../data/systems/tormenta20/divindades';

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

describe('Artesão Criativo no caminho real do assistente (getAllowedClassPowers)', () => {
  const couraceiro = CORE_INVENTOR.powers?.find(
    (p) => p.name === 'Couraceiro'
  ) as ClassPower;

  /**
   * Ficha de Inventor com o catálogo das duas fontes (livro básico + Heróis de
   * Arton). `classe` é clonada porque o mock devolve um objeto compartilhado
   * entre todas as fichas de teste.
   */
  function createInventorSheet() {
    const sheet = createMockCharacterSheet();
    sheet.nivel = 5;
    sheet.classe = {
      ...sheet.classe,
      name: 'Inventor',
      powers: [...(CORE_INVENTOR.powers ?? []), ...INVENTOR_POWERS],
    };
    sheet.atributos[Atributo.CARISMA] = { name: Atributo.CARISMA, value: 1 };
    return sheet;
  }

  it('lista os poderes travados por outro Ofício quando tem Artesão Criativo + a perícia', () => {
    const sheet = createInventorSheet();
    sheet.skills = [Skill.OFICIO_ARTESANATO]; // sem Alfaiate, sem Armeiro
    sheet.classPowers = [artesaoCriativo];

    const allowed = getAllowedClassPowers(sheet, { classLevel: 5 }).map(
      (p) => p.name
    );

    expect(allowed).toContain('Estilista'); // Heróis de Arton, Ofício (Alfaiate)
    expect(allowed).toContain('Couraceiro'); // livro básico, Ofício (Armeiro)
  });

  it('sem Artesão Criativo os mesmos poderes ficam fora da lista', () => {
    const sheet = createInventorSheet();
    sheet.skills = [Skill.OFICIO_ARTESANATO];
    sheet.classPowers = [];

    const allowed = getAllowedClassPowers(sheet, { classLevel: 5 }).map(
      (p) => p.name
    );

    expect(allowed).not.toContain('Estilista');
    expect(allowed).not.toContain('Couraceiro');
  });

  it('perícia com o nome legado volta a valer depois de normalizeSheet', () => {
    const sheet = createInventorSheet();
    // Ficha anterior ao rename de 05/06/2026: guarda "Ofício (Artesanato)".
    sheet.skills = ['Ofício (Artesanato)' as Skill];
    sheet.completeSkills = [
      {
        name: 'Ofício (Artesanato)' as Skill,
        halfLevel: 2,
        training: 2,
        modAttr: Atributo.INTELIGENCIA,
        others: 0,
      },
    ];
    sheet.classPowers = [artesaoCriativo];

    expect(isPowerAvailable(sheet, estilista)).toBe(false);
    expect(isPowerAvailable(sheet, couraceiro)).toBe(false);

    normalizeSheet(sheet);

    expect(sheet.skills).toContain(Skill.OFICIO_ARTESANATO);
    expect(sheet.completeSkills?.[0].name).toBe(Skill.OFICIO_ARTESANATO);
    expect(isPowerAvailable(sheet, estilista)).toBe(true);
    expect(isPowerAvailable(sheet, couraceiro)).toBe(true);
  });

  it('substitui também um Ofício customizado, fora de ALL_SPECIFIC_OFICIOS', () => {
    const sheet = createInventorSheet();
    sheet.skills = [Skill.OFICIO_ARTESANATO];
    sheet.classPowers = [artesaoCriativo];

    const marceneiro: ClassPower = {
      name: 'Poder de Teste (Ofício customizado)',
      text: 'Requer um Ofício que não existe no livro.',
      requirements: [
        [
          {
            type: RequirementType.PERICIA,
            name: 'Ofício (Marceneiro)' as Skill,
          },
        ],
      ],
    };

    expect(isPowerAvailable(sheet, marceneiro)).toBe(true);

    const semPoder = createInventorSheet();
    semPoder.skills = [Skill.OFICIO_ARTESANATO];
    expect(isPowerAvailable(semPoder, marceneiro)).toBe(false);
  });
});

describe('Requisitos negados (flag `not`)', () => {
  const armaSagrada = PALADINO.powers?.find((p) => p.name === 'Arma Sagrada');

  it('Arma Sagrada exclui devotos de Lena e Marah (regra do livro)', () => {
    expect(armaSagrada).toBeDefined();

    const khalmyr = createMockCharacterSheet();
    khalmyr.devoto = { divindade: DivindadeEnum.KHALMYR, poderes: [] };
    expect(isPowerAvailable(khalmyr, armaSagrada as ClassPower)).toBe(true);

    (['LENA', 'MARAH'] as const).forEach((deity) => {
      const sheet = createMockCharacterSheet();
      sheet.devoto = { divindade: DivindadeEnum[deity], poderes: [] };
      expect(isPowerAvailable(sheet, armaSagrada as ClassPower)).toBe(false);
    });
  });

  it('DEVOTO `any` negado exige não ter divindade nenhuma', () => {
    const power: ClassPower = {
      name: 'Poder de Teste (não devoto)',
      text: 'Requer não ser devoto.',
      requirements: [
        [{ type: RequirementType.DEVOTO, name: 'any', not: true }],
      ],
    };

    const semDeus = createMockCharacterSheet();
    expect(isPowerAvailable(semDeus, power)).toBe(true);

    const comDeus = createMockCharacterSheet();
    comDeus.devoto = { divindade: DivindadeEnum.KHALMYR, poderes: [] };
    expect(isPowerAvailable(comDeus, power)).toBe(false);
  });

  /**
   * Antes o `not` só era honrado em DEVOTO e HABILIDADE; nos outros 13 tipos
   * era ignorado em silêncio — e o builder de homebrew deixa o usuário marcar
   * "NÃO ter" em qualquer um deles.
   */
  it('vale para tipos que antes ignoravam a flag (PODER, NIVEL)', () => {
    const semAtaquePoderoso: ClassPower = {
      name: 'Poder de Teste (sem Ataque Poderoso)',
      text: 'Requer não ter Ataque Poderoso.',
      requirements: [
        [{ type: RequirementType.PODER, name: 'Ataque Poderoso', not: true }],
      ],
    };

    const sheet = createMockCharacterSheet();
    expect(isPowerAvailable(sheet, semAtaquePoderoso)).toBe(true);

    sheet.classPowers = [{ name: 'Ataque Poderoso', text: '' }];
    expect(isPowerAvailable(sheet, semAtaquePoderoso)).toBe(false);

    const abaixoDeCinco: ClassPower = {
      name: 'Poder de Teste (nível baixo)',
      text: 'Requer não ter nível 5.',
      requirements: [[{ type: RequirementType.NIVEL, value: 5, not: true }]],
    };

    const nivel2 = createMockCharacterSheet(); // nivel 2
    expect(isPowerAvailable(nivel2, abaixoDeCinco)).toBe(true);

    const nivel7 = createMockCharacterSheet();
    nivel7.nivel = 7;
    expect(isPowerAvailable(nivel7, abaixoDeCinco)).toBe(false);
  });

  it('TEXT negado continua permissivo (o usuário é quem julga)', () => {
    const power: ClassPower = {
      name: 'Poder de Teste (texto negado)',
      text: 'Requisito textual negado.',
      requirements: [
        [
          {
            type: RequirementType.TEXT,
            text: 'Não ter sido amaldiçoado',
            not: true,
          },
        ],
      ],
    };

    expect(isPowerAvailable(createMockCharacterSheet(), power)).toBe(true);
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
