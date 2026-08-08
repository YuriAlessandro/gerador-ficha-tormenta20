/**
 * Família Encouraçado — automação dos poderes gateados por armadura pesada.
 *
 * Feedback de usuário (ago/2026): Encouraçado ("+2 na Defesa, +2 para cada
 * outro poder que tenha Encouraçado como pré-requisito") não somava nada na
 * ficha, e Encastelado (RD) não tinha como ser conferido. Encouraçado só
 * existia como efeito ativo opt-in; Encastelado aplicava a RD por fora de
 * `sheetBonuses`, invisível no card do poder.
 *
 * Cobre os dois poderes que escalam (Encouraçado/Encastelado), o gate de
 * armadura VESTIDA (contra a versão antiga, que olhava a mochila inteira),
 * Inexpugnável e Fanático, e a migração do efeito ativo aposentado.
 */
import { describe, it, expect } from 'vitest';
import _ from 'lodash';
import { recalculateSheet } from '../../functions/recalculateSheet';
import { normalizeSheet } from '../../functions/sheetNormalizer';
import {
  countPowersRequiring,
  getHeavyArmorPowerBonuses,
  ENCOURACADO_POWER_NAME,
} from '../../functions/powers/heavyArmorPowers';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { CharacterAttributes } from '../../interfaces/Character';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import Bag from '../../interfaces/Bag';
import Skill from '../../interfaces/Skills';
import { SupplementId } from '../../types/supplement.types';
import { dataRegistry } from '../../data/registry';
import { Armaduras } from '../../data/systems/tormenta20/equipamentos';
import { ClassDescription } from '../../interfaces/Class';
import { GeneralPower } from '../../interfaces/Poderes';
import combatPowers from '../../data/systems/tormenta20/powers/combatPowers';
import hdaCombatPowers from '../../data/systems/tormenta20/herois-de-arton/powers/combatPowers';
import atlasOriginPowers from '../../data/systems/tormenta20/atlas-de-arton/powers/originPowers';
import {
  ACTIVE_POWERS,
  RETIRED_ACTIVE_POWER_KEYS,
} from '../../premium/data/activePowers';

const SUPPLEMENTS = [
  SupplementId.TORMENTA20_CORE,
  SupplementId.TORMENTA20_HEROIS_ARTON,
];

const LIGHT_ARMOR = Armaduras.GIBAODEPELES;
const HEAVY_ARMOR = Armaduras.BRUNEA;

const ENCOURACADO = () => _.cloneDeep(combatPowers.ENCOURACADO);
const INEXPUGNAVEL = () => _.cloneDeep(combatPowers.INEXPUGNAVEL);
const FANATICO = () => _.cloneDeep(combatPowers.FANATICO);
const ENCASTELADO = () => _.cloneDeep(hdaCombatPowers.ENCASTELADO);

const findClass = (name: string): ClassDescription => {
  const classe = dataRegistry
    .getClassesBySupplements(SUPPLEMENTS)
    .find((c) => c.name === name);
  if (!classe) throw new Error(`Classe não encontrada: ${name}`);
  return classe;
};

type Opts = {
  nivel?: number;
  /** Armadura VESTIDA. */
  armor?: typeof LIGHT_ARMOR;
  /** Armadura carregada na mochila, mas NÃO vestida. */
  carriedArmor?: typeof LIGHT_ARMOR;
  generalPowers?: GeneralPower[];
};

const buildSheet = ({
  nivel = 6,
  armor,
  carriedArmor,
  generalPowers = [],
}: Opts = {}): CharacterSheet => {
  const classe = _.cloneDeep(findClass('Guerreiro'));
  // Elfo, não Humano: o Versátil do Humano sorteia um poder geral a cada
  // recálculo e o sorteio pode cair justamente em Encouraçado — o que tornaria
  // estes testes intermitentes.
  const raca = dataRegistry
    .getRacesBySupplements([SupplementId.TORMENTA20_CORE])
    .find((r) => r.name === 'Elfo')!;

  const atributos: CharacterAttributes = {
    [Atributo.FORCA]: { name: Atributo.FORCA, value: 2 },
    [Atributo.DESTREZA]: { name: Atributo.DESTREZA, value: 1 },
    [Atributo.CONSTITUICAO]: { name: Atributo.CONSTITUICAO, value: 3 },
    [Atributo.INTELIGENCIA]: { name: Atributo.INTELIGENCIA, value: 0 },
    [Atributo.SABEDORIA]: { name: Atributo.SABEDORIA, value: 0 },
    [Atributo.CARISMA]: { name: Atributo.CARISMA, value: 0 },
  };

  const armaduras = [
    ...(armor ? [_.cloneDeep(armor)] : []),
    ...(carriedArmor ? [_.cloneDeep(carriedArmor)] : []),
  ];
  const bag = new Bag(
    (armaduras.length ? { Armadura: armaduras } : {}) as never
  );
  const eq = bag.getEquipments();

  return {
    id: 'test-encouracado-family',
    nome: 'Test',
    sexo: 'Masculino',
    nivel,
    atributos,
    raca,
    classe,
    skills: [],
    pv: 20,
    pm: 3,
    sheetBonuses: [],
    sheetActionHistory: [],
    defesa: 10,
    bag,
    devoto: undefined,
    origin: undefined,
    spells: [],
    displacement: 9,
    size: raca.size!,
    maxSpaces: 10,
    generalPowers,
    classPowers: [],
    steps: [],
    // Sem auto-empunhadura/auto-vestimenta: o estado é controlado pelo teste.
    equipStateMigrated: true,
    wornArmorId: armor ? eq.Armadura[0].id : undefined,
  } as unknown as CharacterSheet;
};

const defesaCom = (opts: Opts) => recalculateSheet(buildSheet(opts)).defesa;
const rdGeralCom = (opts: Opts) =>
  recalculateSheet(buildSheet(opts)).reducaoDeDano?.Geral ?? 0;

describe('Encouraçado — +2 na Defesa com armadura pesada', () => {
  it('soma +2 automaticamente, sem precisar ativar nada', () => {
    const base = defesaCom({ armor: HEAVY_ARMOR });
    expect(
      defesaCom({ armor: HEAVY_ARMOR, generalPowers: [ENCOURACADO()] })
    ).toBe(base + 2);
  });

  it('não soma nada com armadura leve', () => {
    const base = defesaCom({ armor: LIGHT_ARMOR });
    expect(
      defesaCom({ armor: LIGHT_ARMOR, generalPowers: [ENCOURACADO()] })
    ).toBe(base);
  });

  it('não soma nada sem armadura', () => {
    expect(defesaCom({ generalPowers: [ENCOURACADO()] })).toBe(defesaCom({}));
  });

  it('não basta CARREGAR a armadura pesada: ela precisa estar vestida', () => {
    const opts = { armor: LIGHT_ARMOR, carriedArmor: HEAVY_ARMOR };
    expect(defesaCom({ ...opts, generalPowers: [ENCOURACADO()] })).toBe(
      defesaCom(opts)
    );
  });

  it('escala +2 por poder dependente (Inexpugnável e Encastelado)', () => {
    // Guarda contra dado compartilhado poluído por outro teste: a escala só faz
    // sentido se os dependentes realmente listarem Encouraçado no pré-requisito.
    expect(
      countPowersRequiring(
        buildSheet({ generalPowers: [INEXPUGNAVEL(), ENCASTELADO()] }),
        ENCOURACADO_POWER_NAME
      )
    ).toBe(2);

    const base = defesaCom({ armor: HEAVY_ARMOR });

    expect(
      defesaCom({
        armor: HEAVY_ARMOR,
        generalPowers: [ENCOURACADO(), INEXPUGNAVEL()],
      })
    ).toBe(base + 4);

    expect(
      defesaCom({
        armor: HEAVY_ARMOR,
        generalPowers: [ENCOURACADO(), INEXPUGNAVEL(), ENCASTELADO()],
      })
    ).toBe(base + 6);
  });

  it('aparece em sheetBonuses com o poder como fonte (card "Aplicado na ficha")', () => {
    const sheet = recalculateSheet(
      buildSheet({ armor: HEAVY_ARMOR, generalPowers: [ENCOURACADO()] })
    );
    const bonus = sheet.sheetBonuses.find(
      (b) =>
        b.source.type === 'power' &&
        b.source.name === ENCOURACADO_POWER_NAME &&
        b.target.type === 'Defense'
    );
    expect(bonus?.modifier).toEqual({ type: 'Fixed', value: 2 });
  });
});

describe('Encastelado — RD Geral com armadura pesada', () => {
  it('concede RD Geral 2 e escala +1 por outro poder dependente', () => {
    expect(
      rdGeralCom({ armor: HEAVY_ARMOR, generalPowers: [ENCASTELADO()] })
    ).toBe(2);

    // Encastelado não conta a si mesmo; Inexpugnável e Fanático somam +1 cada.
    expect(
      rdGeralCom({
        armor: HEAVY_ARMOR,
        generalPowers: [ENCASTELADO(), INEXPUGNAVEL(), FANATICO()],
      })
    ).toBe(4);
  });

  it('não concede RD sem armadura pesada vestida', () => {
    expect(
      rdGeralCom({ armor: LIGHT_ARMOR, generalPowers: [ENCASTELADO()] })
    ).toBe(0);
    expect(
      rdGeralCom({
        armor: LIGHT_ARMOR,
        carriedArmor: HEAVY_ARMOR,
        generalPowers: [ENCASTELADO()],
      })
    ).toBe(0);
  });
});

describe('Inexpugnável — +2 nos testes de resistência com armadura pesada', () => {
  const resistencias = [Skill.FORTITUDE, Skill.REFLEXOS, Skill.VONTADE];

  const othersDe = (sheet: CharacterSheet, skill: Skill) =>
    sheet.completeSkills?.find((s) => s.name === skill)?.others ?? 0;

  it('soma +2 em Fortitude, Reflexos e Vontade com armadura pesada', () => {
    const semPoder = recalculateSheet(buildSheet({ armor: HEAVY_ARMOR }));
    const comPoder = recalculateSheet(
      buildSheet({ armor: HEAVY_ARMOR, generalPowers: [INEXPUGNAVEL()] })
    );

    resistencias.forEach((skill) => {
      expect(othersDe(comPoder, skill)).toBe(othersDe(semPoder, skill) + 2);
    });
  });

  it('não soma nada com armadura leve', () => {
    const semPoder = recalculateSheet(buildSheet({ armor: LIGHT_ARMOR }));
    const comPoder = recalculateSheet(
      buildSheet({ armor: LIGHT_ARMOR, generalPowers: [INEXPUGNAVEL()] })
    );

    resistencias.forEach((skill) => {
      expect(othersDe(comPoder, skill)).toBe(othersDe(semPoder, skill));
    });
  });
});

describe('Fanático — deslocamento não reduzido por armadura pesada', () => {
  it('cancela a penalidade de −3 da armadura pesada', () => {
    const semArmadura = recalculateSheet(buildSheet({})).displacement;
    const comPesada = recalculateSheet(
      buildSheet({ armor: HEAVY_ARMOR })
    ).displacement;
    const comPesadaEFanatico = recalculateSheet(
      buildSheet({ armor: HEAVY_ARMOR, generalPowers: [FANATICO()] })
    ).displacement;

    expect(comPesada).toBe(semArmadura - 3);
    expect(comPesadaEFanatico).toBe(semArmadura);
  });
});

describe('Migração do efeito ativo aposentado', () => {
  it('não existe mais definição ativa para Encouraçado', () => {
    expect(ACTIVE_POWERS.some((def) => def.key === 'general:encouracado')).toBe(
      false
    );
    expect(RETIRED_ACTIVE_POWER_KEYS.has('general:encouracado')).toBe(true);
  });

  it('normalizeSheet remove o efeito salvo e o bônus não conta em dobro', () => {
    const sheet = buildSheet({
      armor: HEAVY_ARMOR,
      generalPowers: [ENCOURACADO()],
    });
    sheet.activeEffects = [
      {
        id: 'legacy',
        powerKey: 'general:encouracado',
        name: 'Encouraçado',
        optionId: 'encouracado',
        label: '+2 Defesa (armadura pesada)',
        bonuses: [
          {
            target: { type: 'Defense' },
            modifier: { type: 'Fixed', value: 2 },
          },
        ],
      },
    ] as unknown as CharacterSheet['activeEffects'];

    normalizeSheet(sheet);
    expect(sheet.activeEffects).toEqual([]);

    const base = defesaCom({ armor: HEAVY_ARMOR });
    expect(recalculateSheet(sheet).defesa).toBe(base + 2);
  });

  it('o recálculo ignora o efeito aposentado que escape da normalização', () => {
    const sheet = buildSheet({
      armor: HEAVY_ARMOR,
      generalPowers: [ENCOURACADO()],
    });
    sheet.activeEffects = [
      {
        id: 'legacy',
        powerKey: 'general:encouracado',
        name: 'Encouraçado',
        optionId: 'encouracado',
        label: '+2 Defesa (armadura pesada)',
        bonuses: [
          {
            target: { type: 'Defense' },
            modifier: { type: 'Fixed', value: 2 },
          },
        ],
      },
    ] as unknown as CharacterSheet['activeEffects'];

    const base = defesaCom({ armor: HEAVY_ARMOR });
    expect(recalculateSheet(sheet).defesa).toBe(base + 2);
  });
});

describe('Detecção de armadura pesada (vestida, não carregada)', () => {
  it('Selvagem Sanguinário não é negado por carregar armadura pesada na mochila', () => {
    const selvagem = () =>
      _.cloneDeep(
        atlasOriginPowers.SELVAGEM_SANGUINARIO
      ) as unknown as GeneralPower;

    // Vestindo leve: a RD 1 vale, mesmo com uma pesada guardada na mochila.
    expect(
      rdGeralCom({ armor: LIGHT_ARMOR, generalPowers: [selvagem()] })
    ).toBe(1);
    expect(
      rdGeralCom({
        armor: LIGHT_ARMOR,
        carriedArmor: HEAVY_ARMOR,
        generalPowers: [selvagem()],
      })
    ).toBe(1);

    // Vestindo pesada: aí sim o poder não se aplica.
    expect(
      rdGeralCom({ armor: HEAVY_ARMOR, generalPowers: [selvagem()] })
    ).toBe(0);
  });

  it('a RD do Bárbaro não vaza para outras classes mono-classe', () => {
    // `getClassLevel` devolve o nível total para qualquer classe quando a ficha
    // não tem `classLevels`; sem o guard, todo personagem de nível 5+ ganhava
    // a Resistência a Dano do Bárbaro.
    expect(rdGeralCom({ nivel: 6, armor: LIGHT_ARMOR })).toBe(0);
  });
});

describe('Idempotência e helpers', () => {
  it('recalcular duas vezes não acumula Defesa nem RD', () => {
    const uma = recalculateSheet(
      buildSheet({
        armor: HEAVY_ARMOR,
        generalPowers: [ENCOURACADO(), ENCASTELADO()],
      })
    );
    const duas = recalculateSheet(uma);

    expect(duas.defesa).toBe(uma.defesa);
    expect(duas.reducaoDeDano?.Geral).toBe(uma.reducaoDeDano?.Geral);
  });

  it('countPowersRequiring exclui o próprio poder quando pedido', () => {
    const sheet = buildSheet({
      generalPowers: [ENCOURACADO(), INEXPUGNAVEL(), ENCASTELADO()],
    });

    expect(countPowersRequiring(sheet, ENCOURACADO_POWER_NAME)).toBe(2);
    expect(
      countPowersRequiring(sheet, ENCOURACADO_POWER_NAME, 'Encastelado')
    ).toBe(1);
  });

  it('getHeavyArmorPowerBonuses devolve vazio sem armadura pesada vestida', () => {
    expect(
      getHeavyArmorPowerBonuses(
        buildSheet({ armor: LIGHT_ARMOR, generalPowers: [ENCOURACADO()] })
      )
    ).toEqual([]);
    expect(
      getHeavyArmorPowerBonuses(
        buildSheet({ armor: HEAVY_ARMOR, generalPowers: [ENCOURACADO()] })
      )
    ).toHaveLength(1);
  });
});
