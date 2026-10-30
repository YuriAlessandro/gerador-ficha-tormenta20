import _ from 'lodash';
import { describe, expect, it } from 'vitest';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import Bag from '../../interfaces/Bag';
import CharacterSheet, {
  ManeuverId,
  SheetBonus,
} from '../../interfaces/CharacterSheet';
import Equipment from '../../interfaces/Equipment';
import { GeneralPowerType } from '../../interfaces/Poderes';
import { RaceSize } from '../../interfaces/Race';
import Skill, { CompleteSkill } from '../../interfaces/Skills';
import {
  getManeuverBonus,
  getManeuverWeaponOptions,
  resolveManeuverWeapon,
  UNARMED_MANEUVER_WEAPON_ID,
} from '../maneuvers';
import { normalizeSheet } from '../sheetNormalizer';
import { recalculateSheet } from '../recalculateSheet';
import { stripSheetForStorage } from '../sheetPayloadOptimizer';

const espada: Equipment = {
  id: 'espada',
  nome: 'Espada Longa',
  group: 'Arma',
  dano: '1d8',
  critico: '19',
  tipo: 'Corte',
  alcance: '-',
  weaponCategory: 'martial',
  spaces: 1,
};
const arco: Equipment = {
  id: 'arco',
  nome: 'Arco Curto',
  group: 'Arma',
  dano: '1d6',
  critico: 'x3',
  tipo: 'Perfuração',
  alcance: 'Médio',
  weaponCategory: 'simple',
  spaces: 1,
};
const desarmado: Equipment = {
  id: 'soco',
  nome: 'Ataque Desarmado',
  group: 'Arma',
  dano: '1d6',
  critico: 'x2',
  tipo: 'Impacto',
  alcance: '-',
  weaponTags: ['desarmado'],
  spaces: 0,
};
const luta = { name: Skill.LUTA, others: 7 } as CompleteSkill;

const makeSheet = (overrides: Partial<CharacterSheet> = {}): CharacterSheet => {
  const sheet = createMockCharacterSheet();
  return {
    ...sheet,
    size: {
      name: 'Médio',
      naturalRange: 1.5,
      modifiers: { stealth: 0, maneuver: 0 },
    },
    sheetBonuses: [],
    generalPowers: [],
    classPowers: [],
    ...overrides,
  } as CharacterSheet;
};

const totalFor = (
  id: ManeuverId,
  weapon: Equipment,
  sheet: CharacterSheet,
  proficiencias?: string[]
): number =>
  getManeuverBonus(id, weapon, {
    sheet,
    completeSkills: [luta],
    atributos: sheet.atributos,
    proficiencias,
  }).total;

const withBag = (weapons: Equipment[]) => ({
  bag: new Bag({ ...new Bag().getEquipments(), Arma: weapons }),
});

describe('opções de arma da manobra', () => {
  it('não oferece arma à distância e sempre oferece o desarmado', () => {
    const ids = getManeuverWeaponOptions('derrubar', [espada, arco]).map(
      (weapon) => weapon.id
    );
    expect(ids).toEqual(['espada', UNARMED_MANEUVER_WEAPON_ID]);
  });

  it('Agarrar recusa espada e cai no desarmado', () => {
    const options = getManeuverWeaponOptions('agarrar', [espada]);
    expect(options.map((weapon) => weapon.id)).toEqual([
      UNARMED_MANEUVER_WEAPON_ID,
    ]);
  });

  it('Agarrar aceita arma natural e o Desmontador', () => {
    const mordida: Equipment = {
      ...desarmado,
      id: 'mordida',
      nome: 'Mordida',
      weaponTags: ['natural'],
    };
    const desmontador: Equipment = {
      ...espada,
      id: 'desmontador',
      nome: 'Desmontador',
    };
    const ids = getManeuverWeaponOptions('agarrar', [
      espada,
      mordida,
      desmontador,
    ]).map((weapon) => weapon.id);
    expect(ids).toEqual(['mordida', 'desmontador', UNARMED_MANEUVER_WEAPON_ID]);
  });

  it('não duplica o desarmado quando ele já está na mochila', () => {
    const ids = getManeuverWeaponOptions('derrubar', [desarmado]).map(
      (weapon) => weapon.id
    );
    expect(ids).toEqual(['soco']);
  });
});

describe('arma resolvida da manobra', () => {
  const options = [espada, desarmado];

  it('usa a escolhida', () => {
    expect(
      resolveManeuverWeapon(
        { id: 'derrubar', weaponId: 'soco' },
        options,
        'espada'
      ).id
    ).toBe('soco');
  });

  it('arma removida da mochila cai na empunhada', () => {
    expect(
      resolveManeuverWeapon(
        { id: 'derrubar', weaponId: 'sumiu' },
        options,
        'espada'
      ).id
    ).toBe('espada');
  });

  it('empunhar arco não vale: cai na primeira opção', () => {
    expect(resolveManeuverWeapon({ id: 'derrubar' }, options, 'arco').id).toBe(
      'espada'
    );
  });
});

describe('bônus da manobra', () => {
  it('soma a perícia e o atkBonus da arma', () => {
    const weapon = { ...espada, atkBonus: 2 };
    expect(totalFor('derrubar', weapon, makeSheet(withBag([weapon])))).toBe(9);
  });

  it('aplica a penalidade de não proficiência', () => {
    expect(totalFor('derrubar', espada, makeSheet(withBag([espada])), [])).toBe(
      2
    );
  });

  it.each([
    ['Pequeno', -2, 5],
    ['Grande', 2, 9],
  ])('tamanho %s modifica o teste', (name, maneuver, expected) => {
    const size = {
      name,
      naturalRange: 1.5,
      modifiers: { stealth: 0, maneuver },
    } as RaceSize;
    expect(
      totalFor('derrubar', espada, makeSheet({ ...withBag([espada]), size }))
    ).toBe(expected);
  });

  it('Equilibrada dá +2 em qualquer manobra', () => {
    const weapon = { ...espada, modifications: [{ mod: 'Equilibrada' }] };
    expect(totalFor('quebrar', weapon, makeSheet(withBag([weapon])))).toBe(9);
  });

  it('arma de Heróis de Arton só bonifica as manobras do texto', () => {
    const malho = { ...espada, id: 'malho', nome: 'Malho' };
    const sheet = makeSheet(withBag([malho]));
    expect(totalFor('empurrar', malho, sheet)).toBe(9);
    expect(totalFor('desarmar', malho, sheet)).toBe(7);
  });

  it('poder só vale na manobra dele', () => {
    const sheet = makeSheet({
      ...withBag([espada]),
      generalPowers: [{ name: 'Derrubar Aprimorado' }],
    } as Partial<CharacterSheet>);
    expect(totalFor('derrubar', espada, sheet)).toBe(9);
    expect(totalFor('desarmar', espada, sheet)).toBe(7);
  });

  it('poder concedido em devoto.poderes também conta', () => {
    const sheet = makeSheet({
      ...withBag([espada]),
      devoto: { poderes: [{ name: 'Quebrar Encanto' }] },
    } as unknown as Partial<CharacterSheet>);
    expect(totalFor('quebrar', espada, sheet)).toBe(9);
  });

  it('Herança de Kundali vale em todas as manobras', () => {
    const sheet = makeSheet({
      ...withBag([espada]),
      raca: {
        ...createMockCharacterSheet().raca,
        abilities: [{ name: 'Herança de Kundali' }],
      },
    } as unknown as Partial<CharacterSheet>);
    expect(totalFor('empurrar', espada, sheet)).toBe(9);
  });

  it.each([
    ['Lutador de Chão', 'agarrar', 9],
    ['Lutador de Chão', 'derrubar', 9],
    ['Lutador de Chão', 'empurrar', 7],
    ['Mão na Boca', 'agarrar', 9],
    ['Mão na Boca', 'derrubar', 7],
  ] as [string, ManeuverId, number][])(
    'poder de classe %s em %s',
    (name, id, expected) => {
      const sheet = makeSheet({
        ...withBag([espada, desarmado]),
        classPowers: [{ name }],
      } as Partial<CharacterSheet>);
      expect(totalFor(id, desarmado, sheet)).toBe(expected);
    }
  );

  it('Mãos Membranosas: +1, mais +1 a cada 2 OUTROS poderes da Tormenta', () => {
    const tormenta = (name: string) => ({
      name,
      type: GeneralPowerType.TORMENTA,
    });
    const withPowers = (names: string[]) =>
      makeSheet({
        ...withBag([desarmado]),
        generalPowers: names.map(tormenta),
      } as unknown as Partial<CharacterSheet>);

    expect(
      totalFor('agarrar', desarmado, withPowers(['Mãos Membranosas']))
    ).toBe(8);
    expect(
      totalFor('agarrar', desarmado, withPowers(['Mãos Membranosas', 'A']))
    ).toBe(8);
    expect(
      totalFor('agarrar', desarmado, withPowers(['Mãos Membranosas', 'A', 'B']))
    ).toBe(9);
    expect(
      totalFor('derrubar', desarmado, withPowers(['Mãos Membranosas']))
    ).toBe(7);
  });

  it('desarmado virtual nunca sofre penalidade de proficiência', () => {
    const [unarmed] = getManeuverWeaponOptions('agarrar', []);
    expect(totalFor('agarrar', unarmed, makeSheet(withBag([])), [])).toBe(7);
  });

  it('bônus real do recálculo conta uma vez na mochila e no desarmado virtual', () => {
    const recalculated = recalculateSheet(
      makeSheet({
        ...withBag([espada]),
        generalPowers: [
          {
            name: 'Poder de Teste',
            sheetBonuses: [
              {
                source: { type: 'power', name: 'Poder de Teste' },
                target: { type: 'WeaponAttack' },
                modifier: { type: 'Fixed', value: 2 },
              },
            ],
          },
        ],
      } as unknown as Partial<CharacterSheet>)
    );
    const baked = recalculated.bag.equipments.Arma.find(
      (weapon) => weapon.id === 'espada'
    ) as Equipment;
    const [unarmed] = getManeuverWeaponOptions('agarrar', [baked]);
    expect(baked.atkBonus).toBe(2);
    expect(totalFor('derrubar', baked, recalculated)).toBe(9);
    expect(totalFor('agarrar', unarmed, recalculated)).toBe(9);
  });

  describe('bônus gerais de ataque contam uma única vez', () => {
    const fury: SheetBonus = {
      source: { type: 'power', name: 'Fúria' },
      target: { type: 'WeaponAttack' },
      modifier: { type: 'Fixed', value: 2 },
    };

    it('em arma da mochila, vem só do atkBonus bakeado', () => {
      const baked = { ...espada, atkBonus: 2 };
      expect(
        totalFor(
          'derrubar',
          baked,
          makeSheet({ ...withBag([baked]), sheetBonuses: [fury] })
        )
      ).toBe(9);
    });

    it('em desarmado virtual, é somado ao vivo', () => {
      const [unarmed] = getManeuverWeaponOptions('agarrar', []);
      expect(
        totalFor(
          'agarrar',
          unarmed,
          makeSheet({ ...withBag([]), sheetBonuses: [fury] })
        )
      ).toBe(9);
    });
  });
});

describe('persistência de enabledManeuvers', () => {
  const enabledManeuvers = [
    { id: 'derrubar' as const, weaponId: 'espada' },
    { id: 'agarrar' as const },
  ];

  it('sobrevive a stripSheetForStorage', () => {
    const stripped = stripSheetForStorage(makeSheet({ enabledManeuvers }));
    expect(stripped.enabledManeuvers).toEqual(enabledManeuvers);
  });

  it('sobrevive a recalculateSheet', () => {
    const sheet = makeSheet({ enabledManeuvers });
    expect(recalculateSheet(sheet).enabledManeuvers).toEqual(enabledManeuvers);
  });

  it('normalizeSheet limpa dado corrompido', () => {
    const sheet = makeSheet({
      enabledManeuvers: [
        { id: 'derrubar', weaponId: 7 },
        { id: 'voar' },
        null,
        { id: 'derrubar' },
      ],
    } as unknown as Partial<CharacterSheet>);
    normalizeSheet(sheet);
    expect(sheet.enabledManeuvers).toEqual([{ id: 'derrubar' }]);
  });

  it('normalizeSheet remove o campo quando nada é válido', () => {
    const sheet = makeSheet({
      enabledManeuvers: 'lixo',
    } as unknown as Partial<CharacterSheet>);
    normalizeSheet(sheet);
    expect(_.has(sheet, 'enabledManeuvers')).toBe(false);
  });
});
