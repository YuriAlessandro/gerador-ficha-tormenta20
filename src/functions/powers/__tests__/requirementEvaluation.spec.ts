import { describe, expect, it } from 'vitest';
import { Atributo } from '../../../data/systems/tormenta20/atributos';
import CharacterSheet from '../../../interfaces/CharacterSheet';
import { Requirement, RequirementType } from '../../../interfaces/Poderes';
import Skill from '../../../interfaces/Skills';
import { createMockCharacterSheet } from '../../../__mocks__/characterSheet';
import {
  evaluatePowerRequirements,
  RequirementContext,
} from '../requirementEvaluation';

/**
 * Este avaliador nasceu da fusão de duas cópias que viviam dentro do editor de
 * poderes e haviam divergido. Os testes cobrem tanto o comportamento que as
 * duas já tinham quanto os casos que só UMA delas tratava — é justamente onde
 * a fusão poderia regredir.
 */

const power = (requirements: Requirement[][], name = 'Poder de Teste') => ({
  name,
  requirements,
});

const train = (sheet: CharacterSheet, skill: Skill) => {
  const found = sheet.completeSkills?.find((s) => s.name === skill);
  if (!found) throw new Error(`${skill} ausente no mock`);
  found.training = 2;
};

const ctxOf = (
  sheet: CharacterSheet,
  extra: Partial<RequirementContext> = {}
): RequirementContext => ({ sheet, ...extra });

describe('evaluatePowerRequirements', () => {
  describe('ATRIBUTO', () => {
    it('atende quando o atributo alcança o valor e não expõe "current"', () => {
      const sheet = createMockCharacterSheet();
      sheet.atributos[Atributo.FORCA].value = 3;

      const result = evaluatePowerRequirements(
        power([
          [{ type: RequirementType.ATRIBUTO, name: Atributo.FORCA, value: 3 }],
        ]),
        ctxOf(sheet)
      );

      expect(result.available).toBe(true);
      expect(result.groups[0].requirements[0].met).toBe(true);
      expect(result.groups[0].requirements[0].current).toBeUndefined();
    });

    it('falha abaixo do valor e informa quanto o personagem tem', () => {
      const sheet = createMockCharacterSheet();
      sheet.atributos[Atributo.FORCA].value = 1;

      const result = evaluatePowerRequirements(
        power([
          [{ type: RequirementType.ATRIBUTO, name: Atributo.FORCA, value: 3 }],
        ]),
        ctxOf(sheet)
      );

      expect(result.available).toBe(false);
      expect(result.groups[0].requirements[0].current).toBe('você tem 1');
      expect(result.groups[0].requirements[0].label).toContain('Força');
    });
  });

  describe('NIVEL', () => {
    it('compara com o nível da ficha e informa o nível atual ao falhar', () => {
      const sheet = createMockCharacterSheet();
      sheet.nivel = 2;

      const ok = evaluatePowerRequirements(
        power([[{ type: RequirementType.NIVEL, value: 2 }]]),
        ctxOf(sheet)
      );
      const nope = evaluatePowerRequirements(
        power([[{ type: RequirementType.NIVEL, value: 6 }]]),
        ctxOf(sheet)
      );

      expect(ok.available).toBe(true);
      expect(nope.available).toBe(false);
      expect(nope.groups[0].requirements[0].current).toBe('você é nível 2');
    });
  });

  describe('PODER', () => {
    const requiresAtaquePoderoso = power([
      [{ type: RequirementType.PODER, name: 'Ataque Poderoso' }],
    ]);

    it('não atende quando o personagem não tem o poder', () => {
      expect(
        evaluatePowerRequirements(
          requiresAtaquePoderoso,
          ctxOf(createMockCharacterSheet())
        ).available
      ).toBe(false);
    });

    it('atende com o poder já salvo na ficha', () => {
      const sheet = createMockCharacterSheet();
      sheet.generalPowers = [{ name: 'Ataque Poderoso' }] as never;

      expect(
        evaluatePowerRequirements(requiresAtaquePoderoso, ctxOf(sheet))
          .available
      ).toBe(true);
    });

    it('atende com o poder apenas MARCADO na sessão do editor', () => {
      // O motivo de este módulo existir em vez de reusar `isPowerAvailable`:
      // marcar o pré-requisito e o poder dependente na mesma visita precisa
      // destravar a segunda linha sem passar por um save.
      const result = evaluatePowerRequirements(
        requiresAtaquePoderoso,
        ctxOf(createMockCharacterSheet(), {
          pendingGeneralPowers: [{ name: 'Ataque Poderoso' }],
        })
      );

      expect(result.available).toBe(true);
    });

    it('um poder de CLASSE marcado também satisfaz o requisito', () => {
      // A cópia geral do drawer ignorava `selectedClassPowers`; a de classe não.
      const result = evaluatePowerRequirements(
        requiresAtaquePoderoso,
        ctxOf(createMockCharacterSheet(), {
          pendingClassPowers: [{ name: 'Ataque Poderoso' }],
        })
      );

      expect(result.available).toBe(true);
    });

    it('habilidade de classe concedida automaticamente conta como ter o poder', () => {
      // Briga de Rua e Chuva de Golpes (Heróis de Arton) pedem "Briga", que é
      // habilidade de 1º nível do Lutador, não um poder escolhível. Sem isto o
      // assistente de evolução libera o poder e o editor o marca indisponível.
      const sheet = createMockCharacterSheet();
      sheet.classe = {
        ...sheet.classe,
        abilities: [{ name: 'Ataque Poderoso', text: '', nivel: 1 }],
      };

      expect(
        evaluatePowerRequirements(requiresAtaquePoderoso, ctxOf(sheet))
          .available
      ).toBe(true);
    });

    it('habilidade racial com grantsPowerRequirements conta como ter o poder', () => {
      const sheet = createMockCharacterSheet();
      sheet.raca.abilities = [
        { name: 'Dádiva', grantsPowerRequirements: ['Ataque Poderoso'] },
      ] as never;

      expect(
        evaluatePowerRequirements(requiresAtaquePoderoso, ctxOf(sheet))
          .available
      ).toBe(true);
    });
  });

  describe('PERICIA', () => {
    it('requisito de Ofício genérico aceita qualquer Ofício treinado', () => {
      const sheet = createMockCharacterSheet();
      train(sheet, Skill.OFICIO_ARTESANATO);

      const result = evaluatePowerRequirements(
        power([[{ type: RequirementType.PERICIA, name: Skill.OFICIO }]]),
        ctxOf(sheet)
      );

      expect(result.available).toBe(true);
    });

    it('perícia específica exige treinamento naquela perícia', () => {
      const sheet = createMockCharacterSheet();
      const req = power([
        [{ type: RequirementType.PERICIA, name: Skill.ATLETISMO }],
      ]);

      expect(evaluatePowerRequirements(req, ctxOf(sheet)).available).toBe(
        false
      );

      train(sheet, Skill.ATLETISMO);
      expect(evaluatePowerRequirements(req, ctxOf(sheet)).available).toBe(true);
    });

    it('Artesão Criativo faz Ofício (Artesão) substituir outro Ofício específico', () => {
      const sheet = createMockCharacterSheet();
      train(sheet, Skill.OFICIO_ARTESANATO);
      const req = power([
        [{ type: RequirementType.PERICIA, name: Skill.OFICIO_ALQUIMIA }],
      ]);

      // Só treinado em Artesão, sem o poder: não substitui.
      expect(evaluatePowerRequirements(req, ctxOf(sheet)).available).toBe(
        false
      );

      // Com o poder marcado na sessão, substitui.
      expect(
        evaluatePowerRequirements(
          req,
          ctxOf(sheet, { pendingGeneralPowers: [{ name: 'Artesão Criativo' }] })
        ).available
      ).toBe(true);
    });
  });

  describe('PROFICIENCIA', () => {
    it("'all' aceita qualquer proficiência de arma que não seja Simples", () => {
      // A cópia de poderes de CLASSE não tratava 'all' e procurava uma
      // proficiência literalmente chamada "all" — sempre falhava.
      const sheet = createMockCharacterSheet();
      sheet.classe.proficiencias = ['Armas Simples', 'Armas Marciais'];
      const req = power([
        [{ type: RequirementType.PROFICIENCIA, name: 'all' }],
      ]);

      expect(
        evaluatePowerRequirements(req, ctxOf(sheet), 'class').available
      ).toBe(true);

      sheet.classe.proficiencias = ['Armas Simples'];
      expect(
        evaluatePowerRequirements(req, ctxOf(sheet), 'class').available
      ).toBe(false);
    });
  });

  describe('CLASSE', () => {
    it('é avaliado também para poderes de classe', () => {
      // Antes da fusão este case não existia no avaliador de poderes de
      // classe: caía no `default: true` e liberava tudo.
      const sheet = createMockCharacterSheet();
      sheet.classe.name = 'Guerreiro';

      expect(
        evaluatePowerRequirements(
          power([[{ type: RequirementType.CLASSE, name: 'Bárbaro' }]]),
          ctxOf(sheet),
          'class'
        ).available
      ).toBe(false);

      expect(
        evaluatePowerRequirements(
          power([[{ type: RequirementType.CLASSE, name: 'Guerreiro' }]]),
          ctxOf(sheet),
          'class'
        ).available
      ).toBe(true);
    });
  });

  describe('DEVOTO', () => {
    const devotoDe = (name: string) =>
      ({ divindade: { name } } as CharacterSheet['devoto']);

    it("'any' exige apenas ser devoto de alguma divindade", () => {
      const sheet = createMockCharacterSheet();
      const req = power([[{ type: RequirementType.DEVOTO, name: 'any' }]]);

      expect(evaluatePowerRequirements(req, ctxOf(sheet)).available).toBe(
        false
      );

      sheet.devoto = devotoDe('Khalmyr');
      expect(evaluatePowerRequirements(req, ctxOf(sheet)).available).toBe(true);
    });

    it('divindade nomeada casa sem diferenciar maiúsculas', () => {
      const sheet = createMockCharacterSheet();
      sheet.devoto = devotoDe('Khalmyr');

      expect(
        evaluatePowerRequirements(
          power([[{ type: RequirementType.DEVOTO, name: 'khalmyr' }]]),
          ctxOf(sheet)
        ).available
      ).toBe(true);
    });

    it('vale para poderes de classe — a Arma Sagrada do Paladino', () => {
      const sheet = createMockCharacterSheet();
      sheet.devoto = devotoDe('Khalmyr');

      // Arma Sagrada exige NÃO ser devoto de Lena nem de Marah.
      const armaSagrada = power([
        [
          { type: RequirementType.DEVOTO, name: 'Lena', not: true },
          { type: RequirementType.DEVOTO, name: 'Marah', not: true },
        ],
      ]);

      expect(
        evaluatePowerRequirements(armaSagrada, ctxOf(sheet), 'class').available
      ).toBe(true);

      sheet.devoto = devotoDe('Marah');
      expect(
        evaluatePowerRequirements(armaSagrada, ctxOf(sheet), 'class').available
      ).toBe(false);
    });
  });

  describe('semântica dos grupos', () => {
    it('grupos são OU entre si', () => {
      const sheet = createMockCharacterSheet();
      sheet.atributos[Atributo.FORCA].value = 4;
      sheet.atributos[Atributo.DESTREZA].value = 0;

      const result = evaluatePowerRequirements(
        power([
          [
            {
              type: RequirementType.ATRIBUTO,
              name: Atributo.DESTREZA,
              value: 3,
            },
          ],
          [{ type: RequirementType.ATRIBUTO, name: Atributo.FORCA, value: 3 }],
        ]),
        ctxOf(sheet)
      );

      expect(result.available).toBe(true);
      expect(result.groups.map((g) => g.met)).toEqual([false, true]);
    });

    it('requisitos dentro do grupo são E', () => {
      const sheet = createMockCharacterSheet();
      sheet.nivel = 6;
      sheet.atributos[Atributo.FORCA].value = 1;

      const result = evaluatePowerRequirements(
        power([
          [
            { type: RequirementType.NIVEL, value: 3 },
            { type: RequirementType.ATRIBUTO, name: Atributo.FORCA, value: 3 },
          ],
        ]),
        ctxOf(sheet)
      );

      expect(result.available).toBe(false);
      expect(result.groups[0].requirements.map((r) => r.met)).toEqual([
        true,
        false,
      ]);
    });

    it('poder sem pré-requisito fica disponível e sem grupos a exibir', () => {
      const result = evaluatePowerRequirements(
        power([]),
        ctxOf(createMockCharacterSheet())
      );

      expect(result.available).toBe(true);
      expect(result.groups).toEqual([]);
      expect(result.bypassed).toBe(false);
    });
  });

  describe('flag not', () => {
    it('inverte o veredito do requisito', () => {
      const sheet = createMockCharacterSheet();
      sheet.generalPowers = [{ name: 'Ataque Poderoso' }] as never;

      const result = evaluatePowerRequirements(
        power([
          [{ type: RequirementType.PODER, name: 'Ataque Poderoso', not: true }],
        ]),
        ctxOf(sheet)
      );

      expect(result.available).toBe(false);
      expect(result.groups[0].requirements[0].met).toBe(false);
      expect(result.groups[0].requirements[0].label).toBe(
        'Não ter Ataque Poderoso'
      );
    });
  });

  describe('bypass racial', () => {
    it('dispensa os pré-requisitos e não devolve nada para exibir', () => {
      const sheet = createMockCharacterSheet();
      sheet.atributos[Atributo.FORCA].value = 0;
      sheet.raca.abilities = [
        {
          name: 'Ginete Natural',
          bypassPrereqForPowersNamed: ['Carga de Cavalaria'],
        },
      ] as never;

      const result = evaluatePowerRequirements(
        power(
          [
            [
              {
                type: RequirementType.ATRIBUTO,
                name: Atributo.FORCA,
                value: 5,
              },
            ],
          ],
          'Carga de Cavalaria'
        ),
        ctxOf(sheet)
      );

      expect(result.available).toBe(true);
      expect(result.bypassed).toBe(true);
      expect(result.groups).toEqual([]);
    });

    it('não vaza para poderes de nome não listado', () => {
      const sheet = createMockCharacterSheet();
      sheet.atributos[Atributo.FORCA].value = 0;
      sheet.raca.abilities = [
        {
          name: 'Ginete Natural',
          bypassPrereqForPowersNamed: ['Carga de Cavalaria'],
        },
      ] as never;

      const result = evaluatePowerRequirements(
        power(
          [
            [
              {
                type: RequirementType.ATRIBUTO,
                name: Atributo.FORCA,
                value: 5,
              },
            ],
          ],
          'Ataque Poderoso'
        ),
        ctxOf(sheet)
      );

      expect(result.available).toBe(false);
      expect(result.bypassed).toBe(false);
    });
  });

  describe('TIER_LIMIT', () => {
    const req = power([[{ type: RequirementType.TIER_LIMIT, name: 'Bênção' }]]);

    it('conta poderes GERAIS quando o poder avaliado é geral', () => {
      const sheet = createMockCharacterSheet();

      expect(evaluatePowerRequirements(req, ctxOf(sheet)).available).toBe(true);

      expect(
        evaluatePowerRequirements(
          req,
          ctxOf(sheet, { pendingGeneralPowers: [{ name: 'Bênção Dracônica' }] })
        ).available
      ).toBe(false);
    });

    it('conta poderes de CLASSE quando o poder avaliado é de classe', () => {
      const sheet = createMockCharacterSheet();

      // Um poder geral marcado não deve consumir a cota do escopo de classe.
      expect(
        evaluatePowerRequirements(
          req,
          ctxOf(sheet, {
            pendingGeneralPowers: [{ name: 'Bênção Dracônica' }],
          }),
          'class'
        ).available
      ).toBe(true);

      expect(
        evaluatePowerRequirements(
          req,
          ctxOf(sheet, { pendingClassPowers: [{ name: 'Bênção Dracônica' }] }),
          'class'
        ).available
      ).toBe(false);
    });
  });
});
