import { describe, expect, it } from 'vitest';
import DEUSES_MENORES_POWERS from '../../../data/systems/tormenta20/deuses-menores/powers';
import {
  GeneralPower,
  GeneralPowerType,
  Requirement,
  RequirementType,
} from '../../../interfaces/Poderes';
import { Atributo } from '../../../data/systems/tormenta20/atributos';
import Skill from '../../../interfaces/Skills';
import { SupplementId } from '../../../types/supplement.types';
import { createMockCharacterSheet } from '../../../__mocks__/characterSheet';
import { dataRegistry } from '../../../data/registry';
import {
  getAllowedClassPowers,
  getWaivedClassPowers,
  isPowerAvailable,
} from '../../powers';
import { getGrantedPowerPool } from '../grantedPowerPool';
import {
  collectWaiversFrom,
  isRequirementWaived,
} from '../prerequisiteWaivers';

/**
 * Ponta a ponta do concedido "Domínio do Medo" (Deus do Medo, Guia de Deuses
 * Menores): *"pode escolher poderes relacionados a efeitos de medo sem
 * necessidade de cumprir pré-requisitos de classe ou devoção"*.
 *
 * O teste do conjunto EXATO é o que trava a regressão que o resto do desenho
 * evita: conteúdo novo de suplemento não pode entrar na dispensa sozinho.
 */

const DOMINIO_DO_MEDO = DEUSES_MENORES_POWERS[GeneralPowerType.CONCEDIDOS].find(
  (power) => power.name === 'Domínio do Medo'
) as GeneralPower;

const ALL_SUPPLEMENTS = [
  SupplementId.TORMENTA20_CORE,
  SupplementId.TORMENTA20_AMEACAS_ARTON,
  SupplementId.TORMENTA20_ATLAS_ARTON,
  SupplementId.TORMENTA20_DEUSES_ARTON,
  SupplementId.TORMENTA20_HEROIS_ARTON,
  SupplementId.TORMENTA20_DEUSES_MENORES,
];

const waivers = collectWaiversFrom([DOMINIO_DO_MEDO]);

/** Devoto do Deus do Medo que já escolheu Domínio do Medo. */
const devotoDoMedo = () => {
  const sheet = createMockCharacterSheet();
  sheet.devoto = {
    divindade: { name: 'O Deus do Medo' },
    poderes: [DOMINIO_DO_MEDO],
  } as never;
  return sheet;
};

describe('Domínio do Medo', () => {
  it('está cadastrado com a dispensa de classe e devoção', () => {
    expect(DOMINIO_DO_MEDO).toBeDefined();
    const [waiver] = DOMINIO_DO_MEDO.waivesPrerequisites ?? [];
    expect(waiver.requirementTypes).toEqual([
      RequirementType.CLASSE,
      RequirementType.DEVOTO,
    ]);
    expect(waiver.unlocksOtherClassPowers).toBe(true);
  });

  describe('concedidos de outros deuses', () => {
    it('dispensa a cláusula DEVOTO dos cinco concedidos de medo, e só deles', () => {
      const concedidos = dataRegistry
        .getPowersBySupplements(ALL_SUPPLEMENTS)
        [GeneralPowerType.CONCEDIDOS].filter(
          (power) => power.name !== 'Domínio do Medo'
        );

      const liberados = concedidos
        .filter(
          (power) =>
            isPowerAvailable(devotoDoMedo(), power) &&
            !isPowerAvailable(createMockCharacterSheet(), power)
        )
        .map((power) => power.name)
        .sort();

      expect(liberados).toEqual([
        'Alimentar-se do Pavor',
        'Aura de Medo',
        'Olhar Amedrontador',
        'Temor Arcano',
        'Terror Profundo',
      ]);
    });

    it('não entra nas VAGAS de poder concedido do próprio deus', () => {
      // As vagas (`qtdPoderesConcedidos`) são preenchidas só com poderes do
      // deus da ficha. O Domínio do Medo libera ESCOLHA via poder geral, não
      // uma vaga de devoção a mais — senão um clérigo do Deus do Medo, que só
      // tem um concedido para oferecer, ganharia a segunda vaga de outro deus.
      const pool = getGrantedPowerPool(['O Deus do Medo'], ALL_SUPPLEMENTS).map(
        (power) => power.name
      );

      expect(pool).toEqual(['Domínio do Medo']);
    });

    it('dispensa a cláusula DEVOTO de outro deus', () => {
      const auraDeMedo: GeneralPower = {
        name: 'Aura de Medo',
        description: '',
        type: GeneralPowerType.CONCEDIDOS,
        requirements: [
          [{ type: RequirementType.DEVOTO, name: 'Kallyadranoch' }],
        ],
      };

      expect(isPowerAvailable(devotoDoMedo(), auraDeMedo)).toBe(true);
      // Sem o poder, a cláusula volta a valer.
      expect(isPowerAvailable(createMockCharacterSheet(), auraDeMedo)).toBe(
        false
      );
    });

    it('não alcança concedido que só toca Intimidação', () => {
      // "Armadura de Ossos" (Tenebra) dá +2 em Defesa e Intimidação. Intimidação
      // produz medo pela ação Assustar, mas o poder não é um efeito de medo —
      // incluí-lo transformaria a dispensa num passe livre de utilidade.
      const armaduraDeOssos: GeneralPower = {
        name: 'Armadura de Ossos',
        description: '',
        type: GeneralPowerType.CONCEDIDOS,
        requirements: [[{ type: RequirementType.DEVOTO, name: 'Tenebra' }]],
      };

      expect(isPowerAvailable(devotoDoMedo(), armaduraDeOssos)).toBe(false);
    });

    it('não alcança concedido anti-medo', () => {
      // Um devoto do Deus do Medo ganhando imunidade a medo de Khalmyr
      // inverteria a intenção da bênção.
      const coragemTotal: GeneralPower = {
        name: 'Coragem Total',
        description: '',
        type: GeneralPowerType.CONCEDIDOS,
        requirements: [[{ type: RequirementType.DEVOTO, name: 'Khalmyr' }]],
      };

      expect(isPowerAvailable(devotoDoMedo(), coragemTotal)).toBe(false);
    });
  });

  describe('escopo da dispensa', () => {
    // "sem cumprir pré-requisitos de classe ou devoção" — e SÓ isso. Atributo,
    // perícia, nível e poder continuam valendo, inclusive nos poderes que o
    // waiver alcança.
    const alvo = { name: 'Terror Profundo' };
    const bloqueantes: [string, Requirement][] = [
      [
        'ATRIBUTO',
        { type: RequirementType.ATRIBUTO, name: Atributo.FORCA, value: 99 },
      ],
      [
        'PERICIA',
        { type: RequirementType.PERICIA, name: Skill.OFICIO_ARTESANATO },
      ],
      ['NIVEL', { type: RequirementType.NIVEL, value: 20 }],
      ['PODER', { type: RequirementType.PODER, name: 'Poder Inexistente' }],
      [
        'PROFICIENCIA',
        { type: RequirementType.PROFICIENCIA, name: 'Armas Exóticas' },
      ],
      ['RACA', { type: RequirementType.RACA, name: 'Osteon' }],
    ];

    it.each(bloqueantes)('não dispensa %s', (_tipo, requirement) => {
      expect(isRequirementWaived(requirement, alvo, waivers).waived).toBe(
        false
      );

      // E o veredito final continua negativo, não só o requisito isolado.
      expect(
        isPowerAvailable(devotoDoMedo(), {
          name: 'Terror Profundo',
          description: '',
          type: GeneralPowerType.CONCEDIDOS,
          requirements: [[requirement]],
        })
      ).toBe(false);
    });

    it.each([
      ['CLASSE', { type: RequirementType.CLASSE, name: 'Bucaneiro' }],
      ['DEVOTO', { type: RequirementType.DEVOTO, name: 'Kallyadranoch' }],
    ] as [string, Requirement][])('dispensa %s', (_tipo, requirement) => {
      expect(isRequirementWaived(requirement, alvo, waivers).waived).toBe(true);
    });

    it('exige TODOS os requisitos não dispensados do grupo', () => {
      // Grupo com devoção (dispensada) E atributo impossível (não dispensado):
      // o poder segue indisponível. É o E do grupo, não um OU disfarçado.
      const misto: GeneralPower = {
        name: 'Terror Profundo',
        description: '',
        type: GeneralPowerType.CONCEDIDOS,
        requirements: [
          [
            { type: RequirementType.DEVOTO, name: 'Kallyadranoch' },
            { type: RequirementType.ATRIBUTO, name: Atributo.FORCA, value: 99 },
          ],
        ],
      };

      expect(isPowerAvailable(devotoDoMedo(), misto)).toBe(false);
    });
  });

  describe('poderes de classe de outra classe', () => {
    it('dispensa a classe mas mantém o requisito de perícia', () => {
      // "Flagelo dos Mares" (Bucaneiro) exige Intimidação treinada. A dispensa
      // é só de classe e devoção — perícia continua valendo.
      const flagelo = {
        name: 'Flagelo dos Mares',
        text: '',
        requirements: [
          [{ type: RequirementType.PERICIA, name: Skill.INTIMIDACAO }],
        ],
      };

      // O mock já vem com Intimidação treinada: destreinar é o que isola o
      // requisito de perícia do de classe.
      const semPericia = devotoDoMedo();
      semPericia.skills = semPericia.skills.filter(
        (skill) => skill !== Skill.INTIMIDACAO
      );
      expect(
        isPowerAvailable(semPericia, flagelo, { className: 'Bucaneiro' })
      ).toBe(false);

      expect(
        isPowerAvailable(devotoDoMedo(), flagelo, { className: 'Bucaneiro' })
      ).toBe(true);
    });

    it('mantém o requisito PODER, que fecha as cadeias inalcançáveis', () => {
      // "Brado: Assombroso" exige Brado Assustador, poder de classe de Bárbaro
      // SEM descritor de medo — logo não destravado. Só é alcançável por quem
      // conseguir o pré-requisito por outra via (Alma Livre, por exemplo).
      const brado = {
        name: 'Brado: Assombroso',
        text: '',
        requirements: [
          [{ type: RequirementType.PODER, name: 'Brado Assustador' }],
        ],
      };

      expect(
        isPowerAvailable(devotoDoMedo(), brado, { className: 'Bárbaro' })
      ).toBe(false);
    });

    it('entra em getAllowedClassPowers, que alimenta criação e subida de nível', () => {
      // O bug original: a dispensa só valia no editor de poderes. O motor de
      // criação (`general.ts`) e o assistente de subida de nível leem daqui,
      // e o catálogo de poderes de classe é o da classe da ficha.
      const sheet = devotoDoMedo();
      sheet.nivel = 2;

      const nomes = getAllowedClassPowers(sheet).map((power) => power.name);

      expect(nomes).toContain('Ameaça Brutal');
      expect(nomes).toContain('Presença de Muralha');
      // Sem a dispensa, nenhum poder de outra classe aparece.
      const base = createMockCharacterSheet();
      base.nivel = 2;
      expect(getAllowedClassPowers(base).map((p) => p.name)).not.toContain(
        'Ameaça Brutal'
      );
    });

    it('carimba a classe de origem, para agrupamento e avaliação', () => {
      const encontrado = getWaivedClassPowers(devotoDoMedo(), waivers).find(
        (power) => power.name === 'Alma Inabalável'
      );

      expect(encontrado?.className).toBe('Bárbaro');
    });

    it('não duplica poder de classe que o personagem já tem', () => {
      // Um bárbaro devoto do Deus do Medo já vê Alma Inabalável no catálogo
      // normal; o waiver não pode devolvê-la de novo.
      const barbaro = devotoDoMedo();
      barbaro.classe = { ...barbaro.classe, name: 'Bárbaro' } as never;

      const nomes = getWaivedClassPowers(barbaro, waivers).map((p) => p.name);
      expect(nomes).not.toContain('Alma Inabalável');
    });

    it('não vaza para a mesma classe quando o nome não está na lista', () => {
      const bradoSismico = {
        name: 'Brado: Sísmico',
        text: '',
        requirements: [[{ type: RequirementType.CLASSE, name: 'Bárbaro' }]],
      };

      expect(
        isPowerAvailable(devotoDoMedo(), bradoSismico, {
          className: 'Bárbaro',
        })
      ).toBe(false);
    });
  });
});
