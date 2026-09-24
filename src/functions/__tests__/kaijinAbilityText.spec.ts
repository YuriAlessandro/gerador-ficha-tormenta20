import KAIJIN, {
  COURACA_RUBEA_POWER,
  DISFORME_POWER,
  KAIJIN_REFRESHED_DESCRIPTIONS,
  TERROR_VIVO_ABILITY_NAME,
  TERROR_VIVO_POWERS,
} from '../../data/systems/tormenta20/ameacas-de-arton/races/kaijin';
import { countTormentaPowers } from '../randomUtils';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import { normalizeSheet } from '../sheetNormalizer';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { GeneralPowerType } from '../../interfaces/Poderes';
import tormentaPowers from '../../data/systems/tormenta20/powers/tormentaPowers';

const getAbility = (name: string) => {
  const ability = KAIJIN.abilities.find((a) => a.name === name);
  if (!ability) throw new Error(`Habilidade ${name} não encontrada no Kaijin`);
  return ability;
};

// Texto que estava no dado antes da correção: dizia que o Kaijin NÃO pode
// empunhar itens mágicos, quando Ameaças de Arton diz o oposto — só pode
// empunhar itens mágicos ou adaptados.
const DISFORME_TEXTO_ANTIGO =
  'Por sua anatomia anômala, você não pode empunhar nem vestir itens mágicos ou especialmente adaptados para você (que demora um dia e custa 50% do preço do item, sem contar melhorias). Seus itens iniciais, e aqueles recebidos por sua origem ou habilidades, são adaptados para você. Esta habilidade conta como um poder da Tormenta, exceto para perda de Carisma.';

const CRIA_TEXTO_ANTIGO =
  'Você é uma criatura do tipo monstro e recebe +5 em testes de resistência contra efeitos causados pela Tormenta. Além disso, efeitos da Tormenta que não afetam lefou também não afetam você.';

describe('Kaijin — texto das habilidades', () => {
  test('Disforme permite itens mágicos ou adaptados, em vez de proibi-los', () => {
    const disforme = getAbility('Disforme');

    expect(disforme.description).toContain(
      'não pode empunhar nem vestir itens, a menos que sejam mágicos ou especialmente adaptados para você'
    );
    expect(disforme.description).not.toBe(DISFORME_TEXTO_ANTIGO);
  });

  test('Cria de Tormenta cobre efeitos de lefeu além dos da Tormenta', () => {
    expect(getAbility('Cria de Tormenta').description).toContain(
      'causados por lefeu e pela Tormenta'
    );
  });

  test('o poder falso de Tormenta usa o mesmo texto da habilidade', () => {
    expect(KAIJIN_REFRESHED_DESCRIPTIONS['Disforme (Kaijin)']).toBe(
      getAbility('Disforme').description
    );
  });
});

describe('normalizeSheet — refresh das habilidades do Kaijin', () => {
  test('corrige as cópias embutidas em fichas salvas antes da correção', () => {
    const sheet = createMockCharacterSheet();

    sheet.raca = {
      ...KAIJIN,
      abilities: [
        { ...getAbility('Cria de Tormenta'), description: CRIA_TEXTO_ANTIGO },
        { ...getAbility('Disforme'), description: DISFORME_TEXTO_ANTIGO },
      ],
    } as unknown as CharacterSheet['raca'];

    sheet.generalPowers = [
      {
        type: GeneralPowerType.TORMENTA,
        name: 'Disforme (Kaijin)',
        description: DISFORME_TEXTO_ANTIGO,
        requirements: [],
      },
    ];

    normalizeSheet(sheet);

    const disforme = sheet.raca.abilities.find((a) => a.name === 'Disforme');
    const cria = sheet.raca.abilities.find(
      (a) => a.name === 'Cria de Tormenta'
    );

    expect(disforme?.description).toBe(getAbility('Disforme').description);
    expect(cria?.description).toBe(getAbility('Cria de Tormenta').description);
    expect(sheet.generalPowers[0].description).toBe(
      getAbility('Disforme').description
    );

    // O refresh toca só a descrição: a concessão do poder falso continua de pé.
    expect(disforme?.sheetActions).toEqual(getAbility('Disforme').sheetActions);
  });

  test('carimba a isenção de Carisma nos poderes falsos salvos sem ela', () => {
    // `tormentaCountExcludesCharisma` é campo novo: a ficha antiga embute o
    // poder sem a flag e o Kaijin perdia Carisma por uma habilidade que o
    // livro isenta ("conta como um poder da Tormenta, exceto para perda de
    // Carisma").
    const sheet = createMockCharacterSheet();
    sheet.generalPowers = [
      { ...COURACA_RUBEA_POWER, tormentaCountExcludesCharisma: undefined },
      { ...DISFORME_POWER, tormentaCountExcludesCharisma: undefined },
    ];

    normalizeSheet(sheet);

    expect(countTormentaPowers(sheet)).toBe(2);
    expect(countTormentaPowers(sheet, { forCharismaPenalty: true })).toBe(0);
  });

  test('não mexe em habilidades de outras raças', () => {
    const sheet = createMockCharacterSheet();
    const original = sheet.raca.abilities.map((a) => a.description);

    normalizeSheet(sheet);

    expect(sheet.raca.abilities.map((a) => a.description)).toEqual(original);
  });
});

/**
 * "Terror Vivo: ...recebe um poder da Tormenta à sua escolha, QUE NÃO CONTA
 * PARA PERDA DE CARISMA."
 *
 * O poder isento varia por ficha, então a ressalva não pode ser carimbada por
 * nome como a de Couraça Rúbea/Disforme: ela vai nas cópias oferecidas pela
 * habilidade, e o `sheetActionHistory` é o que permite curar ficha antiga.
 */
describe('Terror Vivo — poder da Tormenta isento de Carisma', () => {
  const terrorVivo = getAbility(TERROR_VIVO_ABILITY_NAME);

  test('oferece cópias isentas, não os objetos crus do catálogo', () => {
    const action = terrorVivo.sheetActions?.[0]?.action;
    if (action?.type !== 'getGeneralPower') {
      throw new Error('Terror Vivo deveria conceder um poder geral');
    }

    expect(action.availablePowers.length).toBeGreaterThan(0);
    expect(
      action.availablePowers.every(
        (power) => power.tormentaCountExcludesCharisma === true
      )
    ).toBe(true);
  });

  test('não contamina o catálogo de poderes da Tormenta', () => {
    // `getGeneralPower` empurra o objeto oferecido direto para a ficha; se a
    // flag fosse carimbada no singleton do catálogo, todo poder da Tormenta
    // escolhido por QUALQUER caminho pararia de cobrar Carisma.
    const antenas = TERROR_VIVO_POWERS.find((p) => p.name === 'Antenas');
    expect(antenas?.tormentaCountExcludesCharisma).toBe(true);
    expect(
      tormentaPowers.ANTENAS.tormentaCountExcludesCharisma
    ).toBeUndefined();
  });

  test('o poder concedido conta para a escala, mas não para o Carisma', () => {
    const sheet = createMockCharacterSheet();
    const concedido = TERROR_VIVO_POWERS.find((p) => p.name === 'Antenas');
    if (!concedido) throw new Error('Antenas não está no catálogo');
    sheet.generalPowers = [{ ...concedido }];

    expect(countTormentaPowers(sheet)).toBe(1);
    expect(countTormentaPowers(sheet, { forCharismaPenalty: true })).toBe(0);
  });

  test('normalizeSheet cura ficha antiga pelo histórico de ações', () => {
    const sheet = createMockCharacterSheet();
    // Cópia como as fichas salvas guardam: o objeto cru do catálogo, sem flag.
    sheet.generalPowers = [{ ...tormentaPowers.ANTENAS }];
    sheet.sheetActionHistory = [
      {
        source: { type: 'power', name: TERROR_VIVO_ABILITY_NAME },
        powerName: TERROR_VIVO_ABILITY_NAME,
        changes: [{ type: 'PowerAdded', powerName: 'Antenas' }],
      },
    ];

    expect(countTormentaPowers(sheet, { forCharismaPenalty: true })).toBe(1);

    normalizeSheet(sheet);

    expect(countTormentaPowers(sheet)).toBe(1);
    expect(countTormentaPowers(sheet, { forCharismaPenalty: true })).toBe(0);
  });

  test('só isenta o poder que veio do Terror Vivo', () => {
    const sheet = createMockCharacterSheet();
    sheet.generalPowers = [
      { ...tormentaPowers.ANTENAS },
      { ...tormentaPowers.CARAPACA },
    ];
    sheet.sheetActionHistory = [
      {
        source: { type: 'power', name: TERROR_VIVO_ABILITY_NAME },
        powerName: TERROR_VIVO_ABILITY_NAME,
        changes: [{ type: 'PowerAdded', powerName: 'Antenas' }],
      },
    ];

    normalizeSheet(sheet);

    expect(countTormentaPowers(sheet)).toBe(2);
    expect(countTormentaPowers(sheet, { forCharismaPenalty: true })).toBe(1);
  });

  test('não isenta poder concedido por outra habilidade', () => {
    const sheet = createMockCharacterSheet();
    sheet.generalPowers = [{ ...tormentaPowers.ANTENAS }];
    sheet.sheetActionHistory = [
      {
        source: { type: 'power', name: 'Versátil' },
        powerName: 'Versátil',
        changes: [{ type: 'PowerAdded', powerName: 'Antenas' }],
      },
    ];

    normalizeSheet(sheet);

    expect(countTormentaPowers(sheet, { forCharismaPenalty: true })).toBe(1);
  });
});
