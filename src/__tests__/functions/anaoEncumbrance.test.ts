/**
 * "Devagar e Sempre" (Anão): o deslocamento é 6m e NÃO é reduzido por uso de
 * armadura nem por excesso de carga.
 *
 * A regra já existia na raça (`ignoreEncumbrance`), mas era perdida no ciclo de
 * salvar/carregar: `stripSheetForStorage` reconstruía `raca` a partir de uma
 * lista fixa de campos que não incluía a flag, e `rehydrateSheet` não a
 * restaurava — então toda ficha vinda da nuvem levava −3m ao recalcular.
 */
import { describe, it, expect } from 'vitest';
import _ from 'lodash';
import { recalculateSheet } from '../../functions/recalculateSheet';
import {
  rehydrateSheet,
  stripSheetForStorage,
} from '../../functions/sheetPayloadOptimizer';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { CharacterAttributes } from '../../interfaces/Character';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import Bag from '../../interfaces/Bag';
import Race from '../../interfaces/Race';
import { SupplementId } from '../../types/supplement.types';
import { dataRegistry } from '../../data/registry';
import { Armaduras } from '../../data/systems/tormenta20/equipamentos';
import { ClassDescription } from '../../interfaces/Class';

const SUPPLEMENTS = [SupplementId.TORMENTA20_CORE];

const HEAVY_ARMOR = Armaduras.BRUNEA;

/**
 * Força 2 ⇒ capacidade 10 + 2×2 = 14 espaços. 30.000 T$ valem 30 espaços
 * (1 a cada 1.000), o jeito mais direto de estourar o limite sem depender do
 * catálogo de itens.
 */
const OVERLOAD_MONEY = 30000;

/** Elfo é "Gracioso": 12m em vez dos 9m padrão. */
const ELFO_DISPLACEMENT = 12;

const findClass = (name: string): ClassDescription => {
  const classe = dataRegistry
    .getClassesBySupplements(SUPPLEMENTS)
    .find((c) => c.name === name);
  if (!classe) throw new Error(`Classe não encontrada: ${name}`);
  return classe;
};

const findRace = (name: string): Race => {
  const raca = dataRegistry
    .getRacesBySupplements(SUPPLEMENTS)
    .find((r) => r.name === name);
  if (!raca) throw new Error(`Raça não encontrada: ${name}`);
  return _.cloneDeep(raca);
};

type Opts = {
  /** Elfo em vez de Humano: o Humano sorteia um poder geral a cada recálculo. */
  raceName?: string;
  race?: Race;
  overloaded?: boolean;
  heavyArmor?: boolean;
};

const buildSheet = ({
  raceName = 'Elfo',
  race,
  overloaded = false,
  heavyArmor = false,
}: Opts): CharacterSheet => {
  const classe = _.cloneDeep(findClass('Guerreiro'));
  const raca = race ?? findRace(raceName);

  const atributos: CharacterAttributes = {
    [Atributo.FORCA]: { name: Atributo.FORCA, value: 2 },
    [Atributo.DESTREZA]: { name: Atributo.DESTREZA, value: 1 },
    [Atributo.CONSTITUICAO]: { name: Atributo.CONSTITUICAO, value: 2 },
    [Atributo.INTELIGENCIA]: { name: Atributo.INTELIGENCIA, value: 0 },
    [Atributo.SABEDORIA]: { name: Atributo.SABEDORIA, value: 0 },
    [Atributo.CARISMA]: { name: Atributo.CARISMA, value: 0 },
  };

  const bag = new Bag(
    (heavyArmor ? { Armadura: [_.cloneDeep(HEAVY_ARMOR)] } : {}) as never
  );
  const eq = bag.getEquipments();

  return {
    id: 'test-anao-encumbrance',
    nome: 'Test',
    sexo: 'Masculino',
    nivel: 1,
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
    displacement: 0,
    size: raca.size!,
    maxSpaces: 14,
    dinheiro: overloaded ? OVERLOAD_MONEY : 0,
    generalPowers: [],
    classPowers: [],
    steps: [],
    // Impede a auto-empunhadura/auto-vestimenta, para controlar o estado.
    equipStateMigrated: true,
    wornArmorId: heavyArmor ? eq.Armadura[0].id : undefined,
  } as unknown as CharacterSheet;
};

describe('Devagar e Sempre — Anão', () => {
  it('mantém 6m de deslocamento sob excesso de carga', () => {
    const anao = recalculateSheet(
      buildSheet({ raceName: 'Anão', overloaded: true })
    );

    expect(anao.displacement).toBe(6);
  });

  it('mantém 6m usando armadura pesada', () => {
    const anao = recalculateSheet(
      buildSheet({ raceName: 'Anão', heavyArmor: true })
    );

    expect(anao.displacement).toBe(6);
  });

  it('mantém 6m com armadura pesada E sobrecarga ao mesmo tempo', () => {
    const anao = recalculateSheet(
      buildSheet({ raceName: 'Anão', heavyArmor: true, overloaded: true })
    );

    expect(anao.displacement).toBe(6);
  });
});

describe('Penalidade normal de carga/armadura (raça sem a isenção)', () => {
  it('Elfo sem sobrecarga tem o deslocamento cheio', () => {
    expect(recalculateSheet(buildSheet({})).displacement).toBe(
      ELFO_DISPLACEMENT
    );
  });

  it('Elfo sobrecarregado perde 3m', () => {
    expect(
      recalculateSheet(buildSheet({ overloaded: true })).displacement
    ).toBe(ELFO_DISPLACEMENT - 3);
  });

  it('Elfo com armadura pesada perde 3m', () => {
    expect(
      recalculateSheet(buildSheet({ heavyArmor: true })).displacement
    ).toBe(ELFO_DISPLACEMENT - 3);
  });
});

describe('Raças derivadas herdam a isenção da raça original', () => {
  const osteonDe = (oldRaceName: string): Race => {
    const osteon = findRace('Osteon');
    osteon.oldRace = findRace(oldRaceName);
    return osteon;
  };

  it('Osteon de Anão mantém os 6m sob sobrecarga', () => {
    const sheet = recalculateSheet(
      buildSheet({ race: osteonDe('Anão'), overloaded: true })
    );

    expect(sheet.displacement).toBe(6);
  });

  it('Osteon de Elfo continua sofrendo a penalidade', () => {
    const sheet = recalculateSheet(
      buildSheet({ race: osteonDe('Elfo'), overloaded: true })
    );

    expect(sheet.displacement).toBe(ELFO_DISPLACEMENT - 3);
    expect(
      recalculateSheet(buildSheet({ race: osteonDe('Elfo') })).displacement
    ).toBe(ELFO_DISPLACEMENT);
  });
});

describe('A isenção sobrevive ao ciclo de salvar/carregar', () => {
  it('strip → rehydrate preserva ignoreEncumbrance e o deslocamento', () => {
    const anao = recalculateSheet(
      buildSheet({ raceName: 'Anão', overloaded: true })
    );

    // JSON.parse/stringify reproduz a ida e volta pela nuvem (funções somem).
    const stored = JSON.parse(
      JSON.stringify(stripSheetForStorage(_.cloneDeep(anao)))
    ) as Record<string, unknown>;
    const loaded = rehydrateSheet(stored, SUPPLEMENTS);
    loaded.bag = Bag.fromStored(loaded.bag);

    expect(loaded.raca.ignoreEncumbrance).toBe(true);
    expect(recalculateSheet(loaded).displacement).toBe(6);
  });

  it('ficha legada sem a flag recebe a isenção do catálogo', () => {
    const anao = buildSheet({ raceName: 'Anão', overloaded: true });
    // Fichas salvas antes de jun/2026 embutem a cópia da raça sem a flag.
    delete anao.raca.ignoreEncumbrance;

    const loaded = rehydrateSheet(
      anao as unknown as Record<string, unknown>,
      SUPPLEMENTS
    );

    expect(loaded.raca.ignoreEncumbrance).toBe(true);
    expect(recalculateSheet(loaded).displacement).toBe(6);
  });

  it('não inventa isenção para quem não tem', () => {
    const elfo = buildSheet({ overloaded: true });
    const loaded = rehydrateSheet(
      elfo as unknown as Record<string, unknown>,
      SUPPLEMENTS
    );

    expect(loaded.raca.ignoreEncumbrance).toBe(false);
    expect(recalculateSheet(loaded).displacement).toBe(ELFO_DISPLACEMENT - 3);
  });
});
