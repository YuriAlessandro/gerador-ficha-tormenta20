/**
 * Testes de Edição de Atributos - Verificação de Modificadores Raciais
 *
 * Estes testes verificam que editar atributos de uma ficha NÃO causa
 * duplicação dos modificadores raciais.
 *
 * Raças testadas (Livro Base):
 * - Anão: +2 CON, +1 SAB, -1 DEX (modificadores fixos)
 * - Humano: +1 any x3 (modificadores flexíveis)
 * - Goblin: +2 DEX, +1 INT, -1 CAR (modificadores fixos)
 */
import { describe, it, expect } from 'vitest';
import { recalculateSheet } from '../recalculateSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { CharacterAttributes } from '../../interfaces/Character';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import Bag from '../../interfaces/Bag';
import { SupplementId } from '../../types/supplement.types';
import { dataRegistry } from '../../data/registry';

/**
 * Helper: Criar ficha base com raça e nível específicos
 *
 * @param raceName - Nome da raça (ex: 'Anão', 'Humano', 'Goblin')
 * @param className - Nome da classe (ex: 'Guerreiro', 'Ladino')
 * @param nivel - Nível do personagem
 * @param baseAttributes - Atributos já com modificadores raciais aplicados
 * @param raceAttributeChoices - Escolhas manuais para raças com atributos 'any'
 */
const createSheetWithRace = (
  raceName: string,
  className: string,
  nivel: number,
  baseAttributes: CharacterAttributes,
  raceAttributeChoices?: Atributo[]
): CharacterSheet => {
  const coreClasses = dataRegistry.getClassesBySupplements([
    SupplementId.TORMENTA20_CORE,
  ]);
  const coreRaces = dataRegistry.getRacesBySupplements([
    SupplementId.TORMENTA20_CORE,
  ]);

  const raceData = coreRaces.find((r) => r.name === raceName);
  const classData = coreClasses.find((c) => c.name === className);

  if (!raceData || !classData) {
    throw new Error(`Race ${raceName} or class ${className} not found`);
  }

  return {
    id: `test-${raceName.toLowerCase()}-${nivel}`,
    nome: `Test ${raceName}`,
    sexo: 'Masculino',
    nivel,
    atributos: baseAttributes,
    raca: raceData,
    classe: classData,
    raceAttributeChoices,
    skills: [],
    pv: 0,
    pm: 0,
    sheetBonuses: [],
    sheetActionHistory: [],
    defesa: 10,
    bag: new Bag(),
    devoto: undefined,
    origin: undefined,
    spells: [],
    displacement: 9,
    size: raceData.size || {
      naturalRange: 1.5,
      modifiers: { maneuver: 0, stealth: 0 },
      name: 'Médio',
    },
    maxSpaces: 10,
    generalPowers: [],
    classPowers: [],
    steps: [],
  };
};

describe('Edição de Atributos - Modificadores Raciais não devem duplicar', () => {
  describe('Anão (modificadores fixos: +2 CON, +1 SAB, -1 DEX) - Nível 1', () => {
    it('deve manter atributos corretos após edição simples de Força', () => {
      // Setup: Atributos APÓS aplicação racial
      // Base (pré-raça): FOR=2, DES=1, CON=1, INT=0, SAB=0, CAR=1
      // Após racial: FOR=2, DES=0 (-1), CON=3 (+2), INT=0, SAB=1 (+1), CAR=1
      const attributes: CharacterAttributes = {
        [Atributo.FORCA]: { name: Atributo.FORCA, value: 2 },
        [Atributo.DESTREZA]: { name: Atributo.DESTREZA, value: 0 }, // -1 racial aplicado
        [Atributo.CONSTITUICAO]: { name: Atributo.CONSTITUICAO, value: 3 }, // +2 racial aplicado
        [Atributo.INTELIGENCIA]: { name: Atributo.INTELIGENCIA, value: 0 },
        [Atributo.SABEDORIA]: { name: Atributo.SABEDORIA, value: 1 }, // +1 racial aplicado
        [Atributo.CARISMA]: { name: Atributo.CARISMA, value: 1 },
      };

      const sheet = createSheetWithRace('Anão', 'Guerreiro', 1, attributes);

      // Editar Força de 2 para 3
      const editedSheet = {
        ...sheet,
        atributos: {
          ...sheet.atributos,
          [Atributo.FORCA]: { name: Atributo.FORCA, value: 3 },
        },
      };

      const recalculated = recalculateSheet(editedSheet, sheet);

      // Verificar que modificadores raciais NÃO foram duplicados
      expect(recalculated.atributos[Atributo.FORCA].value).toBe(3); // Editado
      expect(recalculated.atributos[Atributo.DESTREZA].value).toBe(0); // Não deve ser -1 novamente
      expect(recalculated.atributos[Atributo.CONSTITUICAO].value).toBe(3); // Não deve ser 5
      expect(recalculated.atributos[Atributo.SABEDORIA].value).toBe(1); // Não deve ser 2
      expect(recalculated.atributos[Atributo.INTELIGENCIA].value).toBe(0); // Inalterado
      expect(recalculated.atributos[Atributo.CARISMA].value).toBe(1); // Inalterado
    });

    it('deve manter atributos corretos após múltiplas edições', () => {
      const attributes: CharacterAttributes = {
        [Atributo.FORCA]: { name: Atributo.FORCA, value: 2 },
        [Atributo.DESTREZA]: { name: Atributo.DESTREZA, value: 0 },
        [Atributo.CONSTITUICAO]: { name: Atributo.CONSTITUICAO, value: 3 },
        [Atributo.INTELIGENCIA]: { name: Atributo.INTELIGENCIA, value: 0 },
        [Atributo.SABEDORIA]: { name: Atributo.SABEDORIA, value: 1 },
        [Atributo.CARISMA]: { name: Atributo.CARISMA, value: 1 },
      };

      const sheet = createSheetWithRace('Anão', 'Guerreiro', 1, attributes);

      // Primeira edição: INT de 0 para 1
      const editedSheet1 = {
        ...sheet,
        atributos: {
          ...sheet.atributos,
          [Atributo.INTELIGENCIA]: { name: Atributo.INTELIGENCIA, value: 1 },
        },
      };

      const recalculated1 = recalculateSheet(editedSheet1, sheet);

      // Segunda edição: CAR de 1 para 2
      const editedSheet2 = {
        ...recalculated1,
        atributos: {
          ...recalculated1.atributos,
          [Atributo.CARISMA]: { name: Atributo.CARISMA, value: 2 },
        },
      };

      const recalculated2 = recalculateSheet(editedSheet2, recalculated1);

      // Verificar que os atributos raciais ainda estão corretos
      expect(recalculated2.atributos[Atributo.DESTREZA].value).toBe(0); // Racial mantido
      expect(recalculated2.atributos[Atributo.CONSTITUICAO].value).toBe(3); // Racial mantido
      expect(recalculated2.atributos[Atributo.SABEDORIA].value).toBe(1); // Racial mantido
      expect(recalculated2.atributos[Atributo.INTELIGENCIA].value).toBe(1); // Primeira edição
      expect(recalculated2.atributos[Atributo.CARISMA].value).toBe(2); // Segunda edição
    });
  });

  describe('Humano (modificadores any: +1 any x3) - Nível 3', () => {
    it('deve manter escolhas de atributos após edição', () => {
      // Setup: Humano escolheu FOR, DES, CON para +1
      // Base (pré-raça): FOR=2, DES=1, CON=1, INT=0, SAB=0, CAR=1
      // Após racial: FOR=3, DES=2, CON=2, INT=0, SAB=0, CAR=1
      const attributes: CharacterAttributes = {
        [Atributo.FORCA]: { name: Atributo.FORCA, value: 3 }, // base 2 + 1 racial
        [Atributo.DESTREZA]: { name: Atributo.DESTREZA, value: 2 }, // base 1 + 1 racial
        [Atributo.CONSTITUICAO]: { name: Atributo.CONSTITUICAO, value: 2 }, // base 1 + 1 racial
        [Atributo.INTELIGENCIA]: { name: Atributo.INTELIGENCIA, value: 0 },
        [Atributo.SABEDORIA]: { name: Atributo.SABEDORIA, value: 0 },
        [Atributo.CARISMA]: { name: Atributo.CARISMA, value: 1 },
      };

      const raceChoices = [
        Atributo.FORCA,
        Atributo.DESTREZA,
        Atributo.CONSTITUICAO,
      ];
      const sheet = createSheetWithRace(
        'Humano',
        'Guerreiro',
        3,
        attributes,
        raceChoices
      );

      // Editar INT de 0 para 2
      const editedSheet = {
        ...sheet,
        atributos: {
          ...sheet.atributos,
          [Atributo.INTELIGENCIA]: { name: Atributo.INTELIGENCIA, value: 2 },
        },
      };

      const recalculated = recalculateSheet(editedSheet, sheet);

      // Verificar que os +1 raciais não foram aplicados novamente
      expect(recalculated.atributos[Atributo.FORCA].value).toBe(3); // Não deve ser 4
      expect(recalculated.atributos[Atributo.DESTREZA].value).toBe(2); // Não deve ser 3
      expect(recalculated.atributos[Atributo.CONSTITUICAO].value).toBe(2); // Não deve ser 3
      expect(recalculated.atributos[Atributo.INTELIGENCIA].value).toBe(2); // Editado
      expect(recalculated.atributos[Atributo.SABEDORIA].value).toBe(0); // Inalterado
      expect(recalculated.atributos[Atributo.CARISMA].value).toBe(1); // Inalterado
    });

    it('deve preservar raceAttributeChoices após recálculo', () => {
      const attributes: CharacterAttributes = {
        [Atributo.FORCA]: { name: Atributo.FORCA, value: 3 },
        [Atributo.DESTREZA]: { name: Atributo.DESTREZA, value: 2 },
        [Atributo.CONSTITUICAO]: { name: Atributo.CONSTITUICAO, value: 2 },
        [Atributo.INTELIGENCIA]: { name: Atributo.INTELIGENCIA, value: 0 },
        [Atributo.SABEDORIA]: { name: Atributo.SABEDORIA, value: 0 },
        [Atributo.CARISMA]: { name: Atributo.CARISMA, value: 1 },
      };

      const raceChoices = [
        Atributo.FORCA,
        Atributo.DESTREZA,
        Atributo.CONSTITUICAO,
      ];
      const sheet = createSheetWithRace(
        'Humano',
        'Guerreiro',
        3,
        attributes,
        raceChoices
      );

      // Edição simples
      const editedSheet = {
        ...sheet,
        atributos: {
          ...sheet.atributos,
          [Atributo.SABEDORIA]: { name: Atributo.SABEDORIA, value: 1 },
        },
      };

      const recalculated = recalculateSheet(editedSheet, sheet);

      // raceAttributeChoices deve ser preservado
      expect(recalculated.raceAttributeChoices).toEqual(raceChoices);
    });
  });

  describe('Goblin (modificadores fixos: +2 DEX, +1 INT, -1 CAR) - Nível 7', () => {
    it('deve preservar modificadores raciais em nível alto', () => {
      // Setup: Atributos APÓS aplicação racial
      // Base (pré-raça): FOR=0, DES=2, CON=1, INT=1, SAB=1, CAR=2
      // Após racial: FOR=0, DES=4 (+2), CON=1, INT=2 (+1), SAB=1, CAR=1 (-1)
      const attributes: CharacterAttributes = {
        [Atributo.FORCA]: { name: Atributo.FORCA, value: 0 },
        [Atributo.DESTREZA]: { name: Atributo.DESTREZA, value: 4 }, // base 2 + 2 racial
        [Atributo.CONSTITUICAO]: { name: Atributo.CONSTITUICAO, value: 1 },
        [Atributo.INTELIGENCIA]: { name: Atributo.INTELIGENCIA, value: 2 }, // base 1 + 1 racial
        [Atributo.SABEDORIA]: { name: Atributo.SABEDORIA, value: 1 },
        [Atributo.CARISMA]: { name: Atributo.CARISMA, value: 1 }, // base 2 - 1 racial
      };

      const sheet = createSheetWithRace('Goblin', 'Ladino', 7, attributes);

      // Editar SAB de 1 para 3
      const editedSheet = {
        ...sheet,
        atributos: {
          ...sheet.atributos,
          [Atributo.SABEDORIA]: { name: Atributo.SABEDORIA, value: 3 },
        },
      };

      const recalculated = recalculateSheet(editedSheet, sheet);

      // Verificar que modificadores raciais NÃO foram duplicados
      expect(recalculated.atributos[Atributo.SABEDORIA].value).toBe(3); // Editado
      expect(recalculated.atributos[Atributo.DESTREZA].value).toBe(4); // Não deve ser 6
      expect(recalculated.atributos[Atributo.INTELIGENCIA].value).toBe(2); // Não deve ser 3
      expect(recalculated.atributos[Atributo.CARISMA].value).toBe(1); // Não deve ser 0
      expect(recalculated.atributos[Atributo.FORCA].value).toBe(0); // Inalterado
      expect(recalculated.atributos[Atributo.CONSTITUICAO].value).toBe(1); // Inalterado
    });

    it('deve manter PV/PM corretos após edição de Constituição', () => {
      const attributes: CharacterAttributes = {
        [Atributo.FORCA]: { name: Atributo.FORCA, value: 0 },
        [Atributo.DESTREZA]: { name: Atributo.DESTREZA, value: 4 },
        [Atributo.CONSTITUICAO]: { name: Atributo.CONSTITUICAO, value: 1 },
        [Atributo.INTELIGENCIA]: { name: Atributo.INTELIGENCIA, value: 2 },
        [Atributo.SABEDORIA]: { name: Atributo.SABEDORIA, value: 1 },
        [Atributo.CARISMA]: { name: Atributo.CARISMA, value: 1 },
      };

      const sheet = createSheetWithRace('Goblin', 'Ladino', 7, attributes);
      const initialSheet = recalculateSheet(sheet);
      const initialPV = initialSheet.pv;

      // Editar CON de 1 para 2 (deve aumentar PV)
      const editedSheet = {
        ...initialSheet,
        atributos: {
          ...initialSheet.atributos,
          [Atributo.CONSTITUICAO]: { name: Atributo.CONSTITUICAO, value: 2 },
        },
      };

      const recalculated = recalculateSheet(editedSheet, initialSheet);

      // PV deve aumentar com o aumento de CON (CON afeta PV por nível)
      expect(recalculated.pv).toBeGreaterThan(initialPV);

      // Modificadores raciais devem permanecer intactos
      expect(recalculated.atributos[Atributo.DESTREZA].value).toBe(4);
      expect(recalculated.atributos[Atributo.INTELIGENCIA].value).toBe(2);
      expect(recalculated.atributos[Atributo.CARISMA].value).toBe(1);
    });
  });

  /**
   * Testes em níveis altos com poder "Aumento de Atributo"
   *
   * O poder "Aumento de Atributo" adiciona +1 a um atributo escolhido.
   * Estes testes simulam fichas onde o bônus já foi aplicado (nos atributos)
   * e verificamos que edições manuais preservam esses valores.
   *
   * NOTA: O poder é adicionado SEM sheetActions para evitar reaplicação
   * durante o recálculo (o bônus já está nos valores dos atributos).
   */
  describe('Níveis altos com poder "Aumento de Atributo"', () => {
    // Poder "Aumento de Atributo" SEM sheetActions (bônus já aplicado nos atributos)
    const aumentoDeAtributoAplicado = {
      name: 'Aumento de Atributo',
      text: 'Você recebe +1 em um atributo.',
      requirements: [],
      canRepeat: true,
      // sheetActions removido pois o bônus já está nos atributos
    };

    describe('Elfo Guerreiro Nível 10 - Bônus de poder já aplicado', () => {
      it('deve preservar bônus do Aumento de Atributo após edição de outro atributo', () => {
        // Elfo: +2 INT, +1 DEX, -1 CON
        // Base: FOR=3, DES=2, CON=2, INT=1, SAB=0, CAR=0
        // Após racial: FOR=3, DES=3, CON=1, INT=3, SAB=0, CAR=0
        // Após Aumento de Atributo (FOR): FOR=4, DES=3, CON=1, INT=3, SAB=0, CAR=0
        const attributes: CharacterAttributes = {
          [Atributo.FORCA]: { name: Atributo.FORCA, value: 4 }, // 3 base + 1 poder
          [Atributo.DESTREZA]: { name: Atributo.DESTREZA, value: 3 }, // 2 + 1 racial
          [Atributo.CONSTITUICAO]: { name: Atributo.CONSTITUICAO, value: 1 }, // 2 - 1 racial
          [Atributo.INTELIGENCIA]: { name: Atributo.INTELIGENCIA, value: 3 }, // 1 + 2 racial
          [Atributo.SABEDORIA]: { name: Atributo.SABEDORIA, value: 0 },
          [Atributo.CARISMA]: { name: Atributo.CARISMA, value: 0 },
        };

        const sheet = createSheetWithRace('Elfo', 'Guerreiro', 10, attributes);

        // Adicionar o poder (sem sheetActions) e o histórico de ação
        sheet.classPowers = [aumentoDeAtributoAplicado];
        sheet.sheetActionHistory = [
          {
            source: { type: 'power', name: 'Aumento de Atributo' },
            powerName: 'Aumento de Atributo',
            changes: [
              {
                type: 'AttributeIncreasedByAumentoDeAtributo',
                attribute: Atributo.FORCA,
                plateau: 3, // Level 10 = plateau 3
              },
            ],
          },
        ];

        const initialSheet = recalculateSheet(sheet);

        // Editar SAB de 0 para 2 (atributo não afetado pelo poder)
        const editedSheet = {
          ...initialSheet,
          atributos: {
            ...initialSheet.atributos,
            [Atributo.SABEDORIA]: { name: Atributo.SABEDORIA, value: 2 },
          },
        };

        const recalculated = recalculateSheet(editedSheet, initialSheet);

        // Verificações:
        // 1. FOR deve manter o +1 do poder (não deve ser 3)
        expect(recalculated.atributos[Atributo.FORCA].value).toBe(4);
        // 2. SAB deve ser o valor editado
        expect(recalculated.atributos[Atributo.SABEDORIA].value).toBe(2);
        // 3. Modificadores raciais do Elfo preservados
        expect(recalculated.atributos[Atributo.DESTREZA].value).toBe(3); // +1 racial
        expect(recalculated.atributos[Atributo.CONSTITUICAO].value).toBe(1); // -1 racial
        expect(recalculated.atributos[Atributo.INTELIGENCIA].value).toBe(3); // +2 racial
      });
    });

    describe('Minotauro Bárbaro Nível 15 - Edição seguida de bônus de poder', () => {
      it('deve manter edição manual e bônus de poder separadamente', () => {
        // Minotauro: +2 FOR, +1 CON, -1 SAB
        // Base: FOR=3, DES=1, CON=2, INT=0, SAB=1, CAR=0
        // Após racial: FOR=5, DES=1, CON=3, INT=0, SAB=0, CAR=0
        // Após edição DES e poder em CON: FOR=5, DES=2, CON=4, INT=0, SAB=0, CAR=0
        const attributes: CharacterAttributes = {
          [Atributo.FORCA]: { name: Atributo.FORCA, value: 5 }, // 3 + 2 racial
          [Atributo.DESTREZA]: { name: Atributo.DESTREZA, value: 2 }, // editado de 1 para 2
          [Atributo.CONSTITUICAO]: { name: Atributo.CONSTITUICAO, value: 4 }, // 2 + 1 racial + 1 poder
          [Atributo.INTELIGENCIA]: { name: Atributo.INTELIGENCIA, value: 0 },
          [Atributo.SABEDORIA]: { name: Atributo.SABEDORIA, value: 0 }, // 1 - 1 racial
          [Atributo.CARISMA]: { name: Atributo.CARISMA, value: 0 },
        };

        const sheet = createSheetWithRace(
          'Minotauro',
          'Bárbaro',
          15,
          attributes
        );

        // Adicionar poder e histórico
        sheet.classPowers = [aumentoDeAtributoAplicado];
        sheet.sheetActionHistory = [
          {
            source: { type: 'power', name: 'Aumento de Atributo' },
            powerName: 'Aumento de Atributo',
            changes: [
              {
                type: 'AttributeIncreasedByAumentoDeAtributo',
                attribute: Atributo.CONSTITUICAO,
                plateau: 4, // Level 15 = plateau 4
              },
            ],
          },
        ];

        const initialSheet = recalculateSheet(sheet);

        // Editar INT de 0 para 1
        const editedSheet = {
          ...initialSheet,
          atributos: {
            ...initialSheet.atributos,
            [Atributo.INTELIGENCIA]: { name: Atributo.INTELIGENCIA, value: 1 },
          },
        };

        const recalculated = recalculateSheet(editedSheet, initialSheet);

        // Verificações:
        // 1. FOR preserva racial (+2)
        expect(recalculated.atributos[Atributo.FORCA].value).toBe(5);
        // 2. DES mantém o valor que já estava editado
        expect(recalculated.atributos[Atributo.DESTREZA].value).toBe(2);
        // 3. CON deve ter racial (+1) + poder (+1) = 4
        expect(recalculated.atributos[Atributo.CONSTITUICAO].value).toBe(4);
        // 4. INT é o valor recém editado
        expect(recalculated.atributos[Atributo.INTELIGENCIA].value).toBe(1);
        // 5. SAB mantém o -1 racial
        expect(recalculated.atributos[Atributo.SABEDORIA].value).toBe(0);
      });
    });

    describe('Qareen Arcanista Nível 17 - Múltiplos Aumento de Atributo', () => {
      it('deve preservar múltiplos bônus de Aumento de Atributo após edição', () => {
        // Qareen: +2 CAR, +1 INT, -1 SAB
        // Base: FOR=0, DES=1, CON=1, INT=3, SAB=1, CAR=2
        // Após racial: FOR=0, DES=1, CON=1, INT=4, SAB=0, CAR=4
        // Após 2x Aumento de Atributo (INT, CAR): INT=5, CAR=5
        const attributes: CharacterAttributes = {
          [Atributo.FORCA]: { name: Atributo.FORCA, value: 0 },
          [Atributo.DESTREZA]: { name: Atributo.DESTREZA, value: 1 },
          [Atributo.CONSTITUICAO]: { name: Atributo.CONSTITUICAO, value: 1 },
          [Atributo.INTELIGENCIA]: { name: Atributo.INTELIGENCIA, value: 5 }, // 3 + 1 racial + 1 poder
          [Atributo.SABEDORIA]: { name: Atributo.SABEDORIA, value: 0 }, // 1 - 1 racial
          [Atributo.CARISMA]: { name: Atributo.CARISMA, value: 5 }, // 2 + 2 racial + 1 poder
        };

        const sheet = createSheetWithRace(
          'Qareen',
          'Arcanista',
          17,
          attributes
        );

        // Adicionar 2 instâncias do poder (sem sheetActions)
        sheet.classPowers = [
          aumentoDeAtributoAplicado,
          aumentoDeAtributoAplicado,
        ];
        sheet.sheetActionHistory = [
          {
            source: { type: 'power', name: 'Aumento de Atributo' },
            powerName: 'Aumento de Atributo',
            changes: [
              {
                type: 'AttributeIncreasedByAumentoDeAtributo',
                attribute: Atributo.INTELIGENCIA,
                plateau: 5, // Level 17 = plateau 5
              },
            ],
          },
          {
            source: { type: 'power', name: 'Aumento de Atributo' },
            powerName: 'Aumento de Atributo',
            changes: [
              {
                type: 'AttributeIncreasedByAumentoDeAtributo',
                attribute: Atributo.CARISMA,
                plateau: 5, // Level 17 = plateau 5
              },
            ],
          },
        ];

        const initialSheet = recalculateSheet(sheet);

        // Editar CON de 1 para 3
        const editedSheet = {
          ...initialSheet,
          atributos: {
            ...initialSheet.atributos,
            [Atributo.CONSTITUICAO]: { name: Atributo.CONSTITUICAO, value: 3 },
          },
        };

        const recalculated = recalculateSheet(editedSheet, initialSheet);

        // Verificações:
        // 1. INT deve manter racial (+1) + poder (+1) = 5
        expect(recalculated.atributos[Atributo.INTELIGENCIA].value).toBe(5);
        // 2. CAR deve manter racial (+2) + poder (+1) = 5
        expect(recalculated.atributos[Atributo.CARISMA].value).toBe(5);
        // 3. CON deve ser o valor editado
        expect(recalculated.atributos[Atributo.CONSTITUICAO].value).toBe(3);
        // 4. SAB mantém o -1 racial
        expect(recalculated.atributos[Atributo.SABEDORIA].value).toBe(0);
        // 5. FOR e DES inalterados
        expect(recalculated.atributos[Atributo.FORCA].value).toBe(0);
        expect(recalculated.atributos[Atributo.DESTREZA].value).toBe(1);
      });

      it('deve calcular PM corretamente com bônus de atributo preservado', () => {
        // Arcanista usa INT para PM
        const attributes: CharacterAttributes = {
          [Atributo.FORCA]: { name: Atributo.FORCA, value: 0 },
          [Atributo.DESTREZA]: { name: Atributo.DESTREZA, value: 1 },
          [Atributo.CONSTITUICAO]: { name: Atributo.CONSTITUICAO, value: 1 },
          [Atributo.INTELIGENCIA]: { name: Atributo.INTELIGENCIA, value: 5 },
          [Atributo.SABEDORIA]: { name: Atributo.SABEDORIA, value: 0 },
          [Atributo.CARISMA]: { name: Atributo.CARISMA, value: 5 },
        };

        const sheet = createSheetWithRace(
          'Qareen',
          'Arcanista',
          17,
          attributes
        );
        sheet.classPowers = [aumentoDeAtributoAplicado];
        sheet.sheetActionHistory = [
          {
            source: { type: 'power', name: 'Aumento de Atributo' },
            powerName: 'Aumento de Atributo',
            changes: [
              {
                type: 'AttributeIncreasedByAumentoDeAtributo',
                attribute: Atributo.INTELIGENCIA,
                plateau: 5, // Level 17 = plateau 5
              },
            ],
          },
        ];

        const initialSheet = recalculateSheet(sheet);
        const initialPM = initialSheet.pm;
        const initialINT = initialSheet.atributos[Atributo.INTELIGENCIA].value;

        // Incrementar INT manualmente de 5 para 6
        const editedSheet = {
          ...initialSheet,
          atributos: {
            ...initialSheet.atributos,
            [Atributo.INTELIGENCIA]: { name: Atributo.INTELIGENCIA, value: 6 },
          },
        };

        const recalculated = recalculateSheet(editedSheet, initialSheet);

        // INT deve ter aumentado
        expect(recalculated.atributos[Atributo.INTELIGENCIA].value).toBe(6);
        expect(
          recalculated.atributos[Atributo.INTELIGENCIA].value
        ).toBeGreaterThan(initialINT);

        // PM não deve diminuir (pode aumentar ou manter dependendo da fórmula)
        // O importante é que o recálculo não quebra o PM
        expect(recalculated.pm).toBeGreaterThanOrEqual(initialPM);
      });
    });
  });

  /**
   * Teste dedicado: Elfo Arcanista com fluxo completo
   *
   * Simula um cenário realista de edição de ficha:
   * 1. Cria ficha de Elfo Arcanista nível 12
   * 2. Faz 3 edições de atributos
   * 3. Adiciona o poder "Aumento de Atributo"
   * 4. Faz mais uma edição de atributo
   *
   * Verifica que em nenhum momento os modificadores são duplicados.
   */
  describe('Elfo Arcanista - Fluxo completo de edições com poder', () => {
    it('deve manter integridade dos atributos através de múltiplas edições e adição de poder', () => {
      // Elfo: +2 INT, +1 DEX, -1 CON
      // Base para Arcanista: FOR=0, DES=2, CON=1, INT=4, SAB=1, CAR=0
      // Após racial: FOR=0, DES=3, CON=0, INT=6, SAB=1, CAR=0
      const initialAttributes: CharacterAttributes = {
        [Atributo.FORCA]: { name: Atributo.FORCA, value: 0 },
        [Atributo.DESTREZA]: { name: Atributo.DESTREZA, value: 3 }, // 2 + 1 racial
        [Atributo.CONSTITUICAO]: { name: Atributo.CONSTITUICAO, value: 0 }, // 1 - 1 racial
        [Atributo.INTELIGENCIA]: { name: Atributo.INTELIGENCIA, value: 6 }, // 4 + 2 racial
        [Atributo.SABEDORIA]: { name: Atributo.SABEDORIA, value: 1 },
        [Atributo.CARISMA]: { name: Atributo.CARISMA, value: 0 },
      };

      const sheet = createSheetWithRace(
        'Elfo',
        'Arcanista',
        12,
        initialAttributes
      );

      // Primeiro recálculo para estabelecer a ficha base
      let currentSheet = recalculateSheet(sheet);

      // Guardar valores iniciais para verificação
      const valoresIniciais = {
        FOR: currentSheet.atributos[Atributo.FORCA].value,
        DES: currentSheet.atributos[Atributo.DESTREZA].value,
        CON: currentSheet.atributos[Atributo.CONSTITUICAO].value,
        INT: currentSheet.atributos[Atributo.INTELIGENCIA].value,
        SAB: currentSheet.atributos[Atributo.SABEDORIA].value,
        CAR: currentSheet.atributos[Atributo.CARISMA].value,
        PM: currentSheet.pm,
      };

      // ========== EDIÇÃO 1: Aumentar Sabedoria de 1 para 2 ==========
      let editedSheet = {
        ...currentSheet,
        atributos: {
          ...currentSheet.atributos,
          [Atributo.SABEDORIA]: { name: Atributo.SABEDORIA, value: 2 },
        },
      };
      currentSheet = recalculateSheet(editedSheet, currentSheet);

      // Verificar que apenas SAB mudou
      expect(currentSheet.atributos[Atributo.SABEDORIA].value).toBe(2);
      expect(currentSheet.atributos[Atributo.INTELIGENCIA].value).toBe(
        valoresIniciais.INT
      ); // INT deve manter
      expect(currentSheet.atributos[Atributo.DESTREZA].value).toBe(
        valoresIniciais.DES
      ); // DES deve manter
      expect(currentSheet.atributos[Atributo.CONSTITUICAO].value).toBe(
        valoresIniciais.CON
      ); // CON deve manter

      // ========== EDIÇÃO 2: Aumentar Força de 0 para 1 ==========
      editedSheet = {
        ...currentSheet,
        atributos: {
          ...currentSheet.atributos,
          [Atributo.FORCA]: { name: Atributo.FORCA, value: 1 },
        },
      };
      currentSheet = recalculateSheet(editedSheet, currentSheet);

      // Verificar que FOR mudou e outros mantiveram
      expect(currentSheet.atributos[Atributo.FORCA].value).toBe(1);
      expect(currentSheet.atributos[Atributo.SABEDORIA].value).toBe(2); // Edição anterior preservada
      expect(currentSheet.atributos[Atributo.INTELIGENCIA].value).toBe(
        valoresIniciais.INT
      );
      expect(currentSheet.atributos[Atributo.DESTREZA].value).toBe(
        valoresIniciais.DES
      );

      // ========== EDIÇÃO 3: Aumentar Carisma de 0 para 1 ==========
      editedSheet = {
        ...currentSheet,
        atributos: {
          ...currentSheet.atributos,
          [Atributo.CARISMA]: { name: Atributo.CARISMA, value: 1 },
        },
      };
      currentSheet = recalculateSheet(editedSheet, currentSheet);

      // Verificar estado após 3 edições
      expect(currentSheet.atributos[Atributo.FORCA].value).toBe(1);
      expect(currentSheet.atributos[Atributo.DESTREZA].value).toBe(
        valoresIniciais.DES
      ); // 3 (racial)
      expect(currentSheet.atributos[Atributo.CONSTITUICAO].value).toBe(
        valoresIniciais.CON
      ); // 0 (racial)
      expect(currentSheet.atributos[Atributo.INTELIGENCIA].value).toBe(
        valoresIniciais.INT
      ); // 6 (racial)
      expect(currentSheet.atributos[Atributo.SABEDORIA].value).toBe(2);
      expect(currentSheet.atributos[Atributo.CARISMA].value).toBe(1);

      // ========== ADICIONAR PODER "Aumento de Atributo" em INT ==========
      // Simular adição do poder com o bônus já aplicado nos atributos
      const aumentoDeAtributo = {
        name: 'Aumento de Atributo',
        text: 'Você recebe +1 em um atributo.',
        requirements: [],
        canRepeat: true,
      };

      // Aumentar INT de 6 para 7 (efeito do poder)
      editedSheet = {
        ...currentSheet,
        classPowers: [aumentoDeAtributo],
        atributos: {
          ...currentSheet.atributos,
          [Atributo.INTELIGENCIA]: { name: Atributo.INTELIGENCIA, value: 7 },
        },
        sheetActionHistory: [
          ...currentSheet.sheetActionHistory,
          {
            source: { type: 'power', name: 'Aumento de Atributo' },
            powerName: 'Aumento de Atributo',
            changes: [
              {
                type: 'AttributeIncreasedByAumentoDeAtributo',
                attribute: Atributo.INTELIGENCIA,
                plateau: 3, // Nível 12 = plateau 3
              },
            ],
          },
        ],
      };
      currentSheet = recalculateSheet(editedSheet, currentSheet);

      // Verificar que o poder foi aplicado corretamente
      expect(currentSheet.atributos[Atributo.INTELIGENCIA].value).toBe(7); // 6 + 1 poder
      // Verificar que as edições anteriores foram preservadas
      expect(currentSheet.atributos[Atributo.FORCA].value).toBe(1);
      expect(currentSheet.atributos[Atributo.SABEDORIA].value).toBe(2);
      expect(currentSheet.atributos[Atributo.CARISMA].value).toBe(1);
      // Verificar que raciais não duplicaram
      expect(currentSheet.atributos[Atributo.DESTREZA].value).toBe(3); // +1 racial mantido
      expect(currentSheet.atributos[Atributo.CONSTITUICAO].value).toBe(0); // -1 racial mantido

      // ========== EDIÇÃO 4: Aumentar CON de 0 para 2 (após adicionar poder) ==========
      editedSheet = {
        ...currentSheet,
        atributos: {
          ...currentSheet.atributos,
          [Atributo.CONSTITUICAO]: { name: Atributo.CONSTITUICAO, value: 2 },
        },
      };
      currentSheet = recalculateSheet(editedSheet, currentSheet);

      // ========== VERIFICAÇÕES FINAIS ==========
      // Todos os valores devem estar corretos após todo o fluxo

      // Atributos editados manualmente
      expect(currentSheet.atributos[Atributo.FORCA].value).toBe(1); // Edição 2
      expect(currentSheet.atributos[Atributo.SABEDORIA].value).toBe(2); // Edição 1
      expect(currentSheet.atributos[Atributo.CARISMA].value).toBe(1); // Edição 3
      expect(currentSheet.atributos[Atributo.CONSTITUICAO].value).toBe(2); // Edição 4

      // Atributo com poder aplicado
      expect(currentSheet.atributos[Atributo.INTELIGENCIA].value).toBe(7); // 6 racial + 1 poder

      // Atributo com apenas racial (não editado)
      expect(currentSheet.atributos[Atributo.DESTREZA].value).toBe(3); // +1 racial do Elfo

      // PM deve ser razoável (Arcanista usa INT para PM)
      expect(currentSheet.pm).toBeGreaterThan(0);
      expect(currentSheet.pm).toBeGreaterThanOrEqual(valoresIniciais.PM);

      // Verificar que o poder está na ficha
      expect(currentSheet.classPowers).toBeDefined();
      expect(currentSheet.classPowers).toHaveLength(1);
      expect(currentSheet.classPowers![0].name).toBe('Aumento de Atributo');

      // Verificar que o histórico de ações está correto
      expect(
        currentSheet.sheetActionHistory.some(
          (h) =>
            h.powerName === 'Aumento de Atributo' &&
            h.changes.some(
              (c) =>
                c.type === 'AttributeIncreasedByAumentoDeAtributo' &&
                c.attribute === Atributo.INTELIGENCIA
            )
        )
      ).toBe(true);
    });
  });

  /**
   * Teste dedicado: Elfo Bardo - Verificação de PM através de múltiplas edições
   *
   * Fluxo:
   * 1. Cria ficha de Elfo Bardo nível 5 com CAR 4
   * 2. Verifica PM inicial
   * 3. Adiciona poder "Aumento de Atributo" em CAR (+1)
   * 4. Verifica PM após poder
   * 5. Sobe para nível 6
   * 6. Verifica PM final
   *
   * Elfo: +2 INT, +1 DEX, -1 CON (não afeta CAR)
   * Bardo: pm=4, addpm=4, keyAttr=CAR
   * Fórmula PM: basePM + keyAttrMod + addPMPerLevel * (nivel - 1)
   */
  describe('Elfo Bardo - Verificação de PM através de níveis e poderes', () => {
    it('deve calcular PM corretamente em todas as etapas', () => {
      // Elfo: +2 INT, +1 DEX, -1 CON
      // Para Bardo: CAR é o atributo chave
      // Base: FOR=0, DES=2, CON=0, INT=2, SAB=0, CAR=4
      // Após racial: FOR=0, DES=3, CON=-1, INT=4, SAB=0, CAR=4
      const initialAttributes: CharacterAttributes = {
        [Atributo.FORCA]: { name: Atributo.FORCA, value: 0 },
        [Atributo.DESTREZA]: { name: Atributo.DESTREZA, value: 3 }, // 2 + 1 racial
        [Atributo.CONSTITUICAO]: { name: Atributo.CONSTITUICAO, value: -1 }, // 0 - 1 racial
        [Atributo.INTELIGENCIA]: { name: Atributo.INTELIGENCIA, value: 4 }, // 2 + 2 racial
        [Atributo.SABEDORIA]: { name: Atributo.SABEDORIA, value: 0 },
        [Atributo.CARISMA]: { name: Atributo.CARISMA, value: 4 }, // Não afetado por racial
      };

      // ========== ETAPA 1: Criar ficha nível 5 ==========
      const sheet = createSheetWithRace('Elfo', 'Bardo', 5, initialAttributes);

      let currentSheet = recalculateSheet(sheet);

      // PM nível 5, CAR 4: basePM(4) + CAR(4) + addpm(4) * (5-1) = 4 + 4 + 16 = 24
      const pmNivel5Car4 = currentSheet.pm;
      expect(currentSheet.nivel).toBe(5);
      expect(currentSheet.atributos[Atributo.CARISMA].value).toBe(4);

      // ========== ETAPA 2: Adicionar "Aumento de Atributo" em CAR ==========
      const aumentoDeAtributo = {
        name: 'Aumento de Atributo',
        text: 'Você recebe +1 em um atributo.',
        requirements: [],
        canRepeat: true,
      };

      // CAR vai de 4 para 5
      let editedSheet: CharacterSheet = {
        ...currentSheet,
        classPowers: [aumentoDeAtributo],
        atributos: {
          ...currentSheet.atributos,
          [Atributo.CARISMA]: { name: Atributo.CARISMA, value: 5 },
        },
        sheetActionHistory: [
          ...currentSheet.sheetActionHistory,
          {
            source: { type: 'power' as const, name: 'Aumento de Atributo' },
            powerName: 'Aumento de Atributo',
            changes: [
              {
                type: 'AttributeIncreasedByAumentoDeAtributo' as const,
                attribute: Atributo.CARISMA,
                plateau: 2, // Nível 5 = plateau 2
              },
            ],
          },
        ],
      };
      currentSheet = recalculateSheet(editedSheet, currentSheet);

      // PM nível 5, CAR 5: basePM(4) + CAR(5) + addpm(4) * (5-1) = 4 + 5 + 16 = 25
      const pmNivel5Car5 = currentSheet.pm;
      expect(currentSheet.atributos[Atributo.CARISMA].value).toBe(5);
      expect(pmNivel5Car5).toBeGreaterThan(pmNivel5Car4); // PM deve aumentar com +1 CAR

      // ========== ETAPA 3: Subir para nível 6 ==========
      editedSheet = {
        ...currentSheet,
        nivel: 6,
      };
      currentSheet = recalculateSheet(editedSheet, currentSheet);

      // PM nível 6, CAR 5: basePM(4) + CAR(5) + addpm(4) * (6-1) = 4 + 5 + 20 = 29
      const pmNivel6Car5 = currentSheet.pm;
      expect(currentSheet.nivel).toBe(6);
      expect(pmNivel6Car5).toBeGreaterThan(pmNivel5Car5); // PM deve aumentar com +1 nível

      // ========== VERIFICAÇÕES FINAIS ==========
      // Verificar que atributos não foram corrompidos
      expect(currentSheet.atributos[Atributo.CARISMA].value).toBe(5);
      expect(currentSheet.atributos[Atributo.DESTREZA].value).toBe(3); // Racial elfo
      expect(currentSheet.atributos[Atributo.INTELIGENCIA].value).toBe(4); // Racial elfo
      expect(currentSheet.atributos[Atributo.CONSTITUICAO].value).toBe(-1); // Racial elfo

      // Verificar valores de PM esperados
      expect(pmNivel5Car4).toBe(29); // Nível 5, CAR 4
      expect(pmNivel5Car5).toBe(30); // Nível 5, CAR 5 (+1 pelo Aumento de Atributo)
      expect(pmNivel6Car5).toBe(35); // Nível 6, CAR 5 (+5 pelo nível)
    });
  });
});
