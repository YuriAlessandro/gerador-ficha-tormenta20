import {
  applyAttributeSubstitution,
  getSheetAttributeSubstitution,
} from '../powers/attributeSubstitution';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet, { SheetBonus } from '../../interfaces/CharacterSheet';
import { ClassDescription } from '../../interfaces/Class';
import Skill from '../../interfaces/Skills';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import { dataRegistry } from '../../data/registry';
import { SupplementId } from '../../types/supplement.types';
import CLERIGO from '../../data/systems/tormenta20/classes/clerigo';
import { applyStatModifiers } from '../general';
import { recalculateSheet } from '../recalculateSheet';

/**
 * "Poder de Clérigo" (Usurpador, 2º nível): "Você substitui Sabedoria por
 * Carisma em todos os poderes de clérigo e concedidos com efeito baseado nesse
 * atributo."
 */
describe('Usurpador — substituição Sabedoria → Carisma', () => {
  const SUPPLEMENTS: SupplementId[] = [
    SupplementId.TORMENTA20_CORE,
    SupplementId.TORMENTA20_HEROIS_ARTON,
  ];

  const usurpadorClass = (): ClassDescription => {
    const classe = dataRegistry
      .getClassesBySupplements(SUPPLEMENTS)
      .find((c) => c.name === 'Usurpador');
    if (!classe) throw new Error('Usurpador não encontrado no registry');
    return classe;
  };

  const buildUsurpador = (nivel: number): CharacterSheet => {
    const classe = usurpadorClass();
    const sheet = createMockCharacterSheet();
    sheet.nivel = nivel;
    sheet.classe = {
      ...classe,
      abilities: classe.abilities.filter((a) => a.nivel <= nivel),
    };
    sheet.sheetBonuses = [];
    return sheet;
  };

  /** Nome de um poder que existe no catálogo do Clérigo (herdado pela variante). */
  const clericPowerName = (): string => usurpadorClass().powers[0].name;

  it('a habilidade "Poder de Clérigo" existe a partir do 2º nível', () => {
    const nomes = (nivel: number) =>
      buildUsurpador(nivel).classe.abilities.map((a) => a.name);
    expect(nomes(1)).not.toContain('Poder de Clérigo');
    expect(nomes(2)).toContain('Poder de Clérigo');
  });

  it('não há regra antes do 2º nível nem para o Clérigo comum', () => {
    expect(getSheetAttributeSubstitution(buildUsurpador(1))).toBeNull();

    const clerigo = createMockCharacterSheet();
    clerigo.nivel = 20;
    clerigo.classe = CLERIGO.setup ? CLERIGO.setup(CLERIGO) : { ...CLERIGO };
    expect(getSheetAttributeSubstitution(clerigo)).toBeNull();
  });

  it('reescreve modifier Attribute e CappedAttribute de poder de clérigo', () => {
    const sheet = buildUsurpador(10);
    const powerName = clericPowerName();
    sheet.sheetBonuses = [
      {
        source: { type: 'power', name: powerName },
        target: { type: 'PM' },
        modifier: { type: 'Attribute', attribute: Atributo.SABEDORIA },
      },
      {
        source: { type: 'power', name: powerName },
        target: { type: 'PV' },
        modifier: {
          type: 'CappedAttribute',
          attribute: Atributo.SABEDORIA,
          capBy: 'level',
        },
      },
    ];

    applyAttributeSubstitution(sheet);

    expect(sheet.sheetBonuses[0].modifier).toMatchObject({
      attribute: Atributo.CARISMA,
    });
    expect(sheet.sheetBonuses[1].modifier).toMatchObject({
      attribute: Atributo.CARISMA,
    });
  });

  it('reescreve HPAttributeReplacement e ModifySkillAttribute de poder concedido', () => {
    const sheet = buildUsurpador(10);
    sheet.sheetBonuses = [
      {
        // Dom da Esperança: "soma Sabedoria nos PV em vez de Constituição".
        source: { type: 'power', name: 'Dom da Esperança' },
        target: {
          type: 'HPAttributeReplacement',
          newAttribute: Atributo.SABEDORIA,
        },
        modifier: { type: 'Fixed', value: 0 },
      },
      {
        source: { type: 'divinity', divinityName: 'Khalmyr' },
        target: {
          type: 'ModifySkillAttribute',
          skill: Skill.INTUICAO,
          attribute: Atributo.SABEDORIA,
        },
        modifier: { type: 'Fixed', value: 0 },
      },
    ];

    applyAttributeSubstitution(sheet);

    expect(sheet.sheetBonuses[0].target).toMatchObject({
      newAttribute: Atributo.CARISMA,
    });
    expect(sheet.sheetBonuses[1].target).toMatchObject({
      attribute: Atributo.CARISMA,
    });
  });

  it('não toca em fontes fora do escopo (raça, origem, poder geral)', () => {
    const sheet = buildUsurpador(10);
    const foraDoEscopo: SheetBonus[] = [
      {
        source: { type: 'race', raceName: 'Elfo' },
        target: { type: 'PM' },
        modifier: { type: 'Attribute', attribute: Atributo.SABEDORIA },
      },
      {
        source: { type: 'origin', originName: 'Acólito' },
        target: { type: 'PV' },
        modifier: { type: 'Attribute', attribute: Atributo.SABEDORIA },
      },
      {
        source: { type: 'power', name: 'Poder Geral Inventado' },
        target: { type: 'PM' },
        modifier: { type: 'Attribute', attribute: Atributo.SABEDORIA },
      },
    ];
    sheet.sheetBonuses = foraDoEscopo;

    applyAttributeSubstitution(sheet);

    sheet.sheetBonuses.forEach((bonus) => {
      expect(bonus.modifier).toMatchObject({ attribute: Atributo.SABEDORIA });
    });
  });

  it('roda nos DOIS motores de derivação', () => {
    // Memória do projeto: geração aleatória (`applyStatModifiers`) e
    // wizard/recálculo (`recalculateSheet`) são caminhos separados que divergem
    // em silêncio. Uma regra nova precisa valer nos dois.
    const powerName = clericPowerName();
    const build = (): CharacterSheet => {
      const sheet = buildUsurpador(10);
      sheet.sheetBonuses = [
        {
          source: { type: 'power', name: powerName },
          target: { type: 'PM' },
          modifier: { type: 'Attribute', attribute: Atributo.SABEDORIA },
        },
      ];
      return sheet;
    };

    const peloMotorAleatorio = applyStatModifiers(build());
    expect(
      peloMotorAleatorio.sheetBonuses.find(
        (b) => b.source.type === 'power' && b.source.name === powerName
      )?.modifier
    ).toMatchObject({ attribute: Atributo.CARISMA });

    // No recálculo os bônus são reconstruídos a partir dos poderes da ficha, e
    // o passe roda depois disso.
    const paraRecalculo = build();
    paraRecalculo.classPowers = [
      {
        ...usurpadorClass().powers[0],
        sheetBonuses: [
          {
            source: { type: 'power', name: powerName },
            target: { type: 'PM' },
            modifier: { type: 'Attribute', attribute: Atributo.SABEDORIA },
          },
        ],
      },
    ];
    const peloRecalculo = recalculateSheet(paraRecalculo);
    const bonusDoPoder = peloRecalculo.sheetBonuses.filter(
      (b) => b.source.type === 'power' && b.source.name === powerName
    );
    expect(bonusDoPoder.length).toBeGreaterThan(0);
    bonusDoPoder.forEach((bonus) => {
      expect(bonus.modifier).toMatchObject({ attribute: Atributo.CARISMA });
    });
  });

  it('NÃO reescreve um bônus AO atributo Sabedoria', () => {
    // `target.type === 'Attribute'` é "+2 em Sabedoria" — um bônus ao atributo,
    // não um efeito baseado nele. Trocar viraria "+2 em Carisma".
    const sheet = buildUsurpador(10);
    sheet.sheetBonuses = [
      {
        source: { type: 'power', name: clericPowerName() },
        target: { type: 'Attribute', attribute: Atributo.SABEDORIA },
        modifier: { type: 'Fixed', value: 2 },
      },
    ];

    applyAttributeSubstitution(sheet);

    expect(sheet.sheetBonuses[0].target).toMatchObject({
      attribute: Atributo.SABEDORIA,
    });
  });
});
