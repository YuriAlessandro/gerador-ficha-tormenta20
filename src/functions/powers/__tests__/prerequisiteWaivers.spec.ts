import { describe, expect, it } from 'vitest';
import { Atributo } from '../../../data/systems/tormenta20/atributos';
import CharacterSheet from '../../../interfaces/CharacterSheet';
import {
  PrerequisiteWaiver,
  RequirementType,
} from '../../../interfaces/Poderes';
import { createMockCharacterSheet } from '../../../__mocks__/characterSheet';
import {
  findWaiverForPower,
  getActiveWaivers,
  isRequirementWaived,
  selectorMatches,
} from '../prerequisiteWaivers';

/**
 * O resolvedor de dispensas. Os testes de casamento existem para travar a
 * decisão de NÃO ter seletor por padrão textual em dados novos: o modo
 * substring é legado e está isolado em `nameIncludes`.
 */

const DOMINIO_DO_MEDO: PrerequisiteWaiver = {
  targets: {
    names: ['Terror Profundo'],
    classPowers: [{ className: 'Bárbaro', name: 'Alma Inabalável' }],
  },
  requirementTypes: [RequirementType.CLASSE, RequirementType.DEVOTO],
  unlocksOtherClassPowers: true,
  unlocksOtherDeityPowers: true,
  reason: 'Domínio do Medo',
};

const withGeneralPower = (
  sheet: CharacterSheet,
  power: Record<string, unknown>
) => {
  sheet.generalPowers = [power] as never;
  return sheet;
};

describe('selectorMatches', () => {
  it('casa por nome exato', () => {
    expect(
      selectorMatches(
        { names: ['Terror Profundo'] },
        { name: 'Terror Profundo' }
      )
    ).toBe(true);
  });

  it('não casa por prefixo nem por substring quando o modo é `names`', () => {
    // A garantia central: "Brado: Retardante" listado não pode arrastar
    // "Brado: Sísmico", que não tem descritor de medo.
    expect(
      selectorMatches(
        { names: ['Brado: Retardante'] },
        { name: 'Brado: Sísmico' }
      )
    ).toBe(false);
  });

  it('exige a classe certa para poder de classe', () => {
    const selector = DOMINIO_DO_MEDO.targets;
    expect(
      selectorMatches(selector, { name: 'Alma Inabalável' }, 'Bárbaro')
    ).toBe(true);
    expect(
      selectorMatches(selector, { name: 'Alma Inabalável' }, 'Guerreiro')
    ).toBe(false);
  });

  it('aceita a classe carimbada no próprio poder (multiclasse)', () => {
    expect(
      selectorMatches(DOMINIO_DO_MEDO.targets, {
        name: 'Alma Inabalável',
        className: 'Bárbaro',
      })
    ).toBe(true);
  });

  it('casa por tag declarada no poder-alvo', () => {
    expect(
      selectorMatches(
        { tags: ['medo'] },
        { name: 'Poder Qualquer', tags: ['medo'] }
      )
    ).toBe(true);
    expect(
      selectorMatches({ tags: ['medo'] }, { name: 'Poder Qualquer' })
    ).toBe(false);
  });

  it('mantém o casamento por substring no modo legado', () => {
    expect(
      selectorMatches(
        { nameIncludes: ['Carga de Cavalaria'] },
        { name: 'Carga de Cavalaria Aprimorada' }
      )
    ).toBe(true);
  });
});

describe('getActiveWaivers', () => {
  it('coleta waivers dos poderes da ficha', () => {
    const sheet = withGeneralPower(createMockCharacterSheet(), {
      name: 'Domínio do Medo',
      waivesPrerequisites: [DOMINIO_DO_MEDO],
    });

    expect(getActiveWaivers(sheet)).toEqual([DOMINIO_DO_MEDO]);
  });

  it('coleta de poderes concedidos, que vivem em devoto.poderes', () => {
    const sheet = createMockCharacterSheet();
    sheet.devoto = {
      divindade: { name: 'O Deus do Medo' },
      poderes: [
        { name: 'Domínio do Medo', waivesPrerequisites: [DOMINIO_DO_MEDO] },
      ],
    } as never;

    expect(getActiveWaivers(sheet)).toHaveLength(1);
  });

  it('enxerga o que está marcado no editor e ainda não foi salvo', () => {
    const sheet = createMockCharacterSheet();

    const waivers = getActiveWaivers(sheet, {
      generalPowers: [
        { name: 'Domínio do Medo', waivesPrerequisites: [DOMINIO_DO_MEDO] },
      ] as never,
    });

    expect(waivers).toEqual([DOMINIO_DO_MEDO]);
  });

  it('normaliza o bypassPrereqForPowersNamed legado para um waiver total', () => {
    const sheet = createMockCharacterSheet();
    sheet.raca.abilities = [
      {
        name: 'Ginete Natural',
        bypassPrereqForPowersNamed: ['Carga de Cavalaria'],
      },
    ] as never;

    const [waiver] = getActiveWaivers(sheet);
    expect(waiver.targets.nameIncludes).toEqual(['Carga de Cavalaria']);
    // Sem `requirementTypes` = dispensa tudo, que é o que o campo sempre fez.
    expect(waiver.requirementTypes).toBeUndefined();
    expect(waiver.reason).toBe('Ginete Natural');
  });

  it('não coleta habilidade de classe de nível ainda não alcançado', () => {
    const sheet = createMockCharacterSheet();
    sheet.nivel = 3;
    sheet.classe.abilities = [
      { name: 'Futura', nivel: 10, waivesPrerequisites: [DOMINIO_DO_MEDO] },
    ] as never;

    expect(getActiveWaivers(sheet)).toEqual([]);
  });
});

describe('isRequirementWaived', () => {
  const waivers = [DOMINIO_DO_MEDO];
  const alvo = { name: 'Terror Profundo' };

  it('dispensa os tipos listados', () => {
    const result = isRequirementWaived(
      { type: RequirementType.DEVOTO, name: 'Kallyadranoch' },
      alvo,
      waivers
    );

    expect(result.waived).toBe(true);
    expect(result.reason).toBe('Domínio do Medo');
  });

  it('não dispensa tipo fora da lista', () => {
    // "sem cumprir pré-requisitos de classe ou devoção" — perícia continua
    // valendo, e é o que mantém Flagelo dos Mares exigindo Intimidação.
    expect(
      isRequirementWaived(
        { type: RequirementType.PERICIA, name: 'Intimidação' },
        alvo,
        waivers
      ).waived
    ).toBe(false);
  });

  it('não alcança poder fora do seletor', () => {
    expect(
      isRequirementWaived(
        { type: RequirementType.DEVOTO, name: 'Tenebra' },
        { name: 'Armadura de Ossos' },
        waivers
      ).waived
    ).toBe(false);
  });

  it('nunca dispensa requisito negado', () => {
    // `not` existe para PROIBIR uma combinação; ignorá-lo inverteria a regra
    // em vez de afrouxá-la.
    expect(
      isRequirementWaived(
        { type: RequirementType.DEVOTO, name: 'Khalmyr', not: true },
        alvo,
        waivers
      ).waived
    ).toBe(false);
  });

  it('waiver sem requirementTypes dispensa qualquer tipo', () => {
    const total: PrerequisiteWaiver[] = [
      { targets: { names: ['Terror Profundo'] }, reason: 'Teste' },
    ];

    expect(
      isRequirementWaived(
        { type: RequirementType.ATRIBUTO, name: Atributo.FORCA, value: 5 },
        alvo,
        total
      ).waived
    ).toBe(true);
  });
});

describe('findWaiverForPower', () => {
  it('devolve o waiver inteiro, para a UI e para o eixo de catálogo', () => {
    const waiver = findWaiverForPower({ name: 'Terror Profundo' }, [
      DOMINIO_DO_MEDO,
    ]);

    expect(waiver?.unlocksOtherDeityPowers).toBe(true);
    expect(waiver?.reason).toBe('Domínio do Medo');
  });

  it('devolve undefined quando nenhum waiver alcança o poder', () => {
    expect(
      findWaiverForPower({ name: 'Ataque Poderoso' }, [DOMINIO_DO_MEDO])
    ).toBeUndefined();
  });
});
