import KAIJIN, {
  KAIJIN_REFRESHED_DESCRIPTIONS,
} from '../../data/systems/tormenta20/ameacas-de-arton/races/kaijin';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import { normalizeSheet } from '../sheetNormalizer';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { GeneralPowerType } from '../../interfaces/Poderes';

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

  test('não mexe em habilidades de outras raças', () => {
    const sheet = createMockCharacterSheet();
    const original = sheet.raca.abilities.map((a) => a.description);

    normalizeSheet(sheet);

    expect(sheet.raca.abilities.map((a) => a.description)).toEqual(original);
  });
});
