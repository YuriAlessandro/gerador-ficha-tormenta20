/**
 * Bônus de Defesa condicionados ao uso de armadura.
 *
 * Vários poderes/habilidades oficiais só valem "se não estiver usando armadura"
 * (ou armadura pesada). Estes testes cobrem os dois sentidos da condição para
 * Tanga de Peles (Machado de Pedra) e para os poderes que receberam o backfill
 * da condição: Pele de Ferro, Insolência, Casca Grossa e Braços Calejados.
 */
import { describe, it, expect } from 'vitest';
import _ from 'lodash';
import { recalculateSheet } from '../../functions/recalculateSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { CharacterAttributes } from '../../interfaces/Character';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import Bag from '../../interfaces/Bag';
import { SupplementId } from '../../types/supplement.types';
import { dataRegistry } from '../../data/registry';
import { Armaduras } from '../../data/systems/tormenta20/equipamentos';
import { ClassDescription, ClassPower } from '../../interfaces/Class';

const SUPPLEMENTS = [
  SupplementId.TORMENTA20_CORE,
  SupplementId.TORMENTA20_HEROIS_ARTON,
];

/** Armadura leve (+4 Defesa) e armadura pesada (+5 Defesa). */
const LIGHT_ARMOR = Armaduras.GIBAODEPELES;
const HEAVY_ARMOR = Armaduras.BRUNEA;

const findClass = (name: string): ClassDescription => {
  const classe = dataRegistry
    .getClassesBySupplements(SUPPLEMENTS)
    .find((c) => c.name === name);
  if (!classe) throw new Error(`Classe não encontrada: ${name}`);
  return classe;
};

type Opts = {
  className: string;
  nivel: number;
  /** Armadura colocada na mochila e vestida. `undefined` = sem armadura. */
  armor?: typeof LIGHT_ARMOR;
  classPowers?: ClassPower[];
};

const buildSheet = ({ className, nivel, armor, classPowers }: Opts) => {
  const classe = _.cloneDeep(findClass(className));
  const humano = dataRegistry
    .getRacesBySupplements([SupplementId.TORMENTA20_CORE])
    .find((r) => r.name === 'Humano')!;

  const attributes: CharacterAttributes = {
    [Atributo.FORCA]: { name: Atributo.FORCA, value: 2 },
    [Atributo.DESTREZA]: { name: Atributo.DESTREZA, value: 1 },
    [Atributo.CONSTITUICAO]: { name: Atributo.CONSTITUICAO, value: 3 },
    [Atributo.INTELIGENCIA]: { name: Atributo.INTELIGENCIA, value: 0 },
    [Atributo.SABEDORIA]: { name: Atributo.SABEDORIA, value: 0 },
    [Atributo.CARISMA]: { name: Atributo.CARISMA, value: 3 },
  };

  const bag = new Bag(
    (armor ? { Armadura: [_.cloneDeep(armor)] } : {}) as never
  );
  const eq = bag.getEquipments();

  return {
    id: 'test-defense-armor-cond',
    nome: 'Test',
    sexo: 'Masculino',
    nivel,
    atributos: attributes,
    raca: humano,
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
    size: humano.size!,
    maxSpaces: 10,
    generalPowers: [],
    classPowers: classPowers ?? [],
    steps: [],
    // Impede a auto-empunhadura/auto-vestimenta, para controlar o estado.
    equipStateMigrated: true,
    wornArmorId: armor ? eq.Armadura[0].id : undefined,
  } as unknown as CharacterSheet;
};

/** Constituição efetiva depois do recálculo (a raça pode alterá-la). */
const conOf = (s: CharacterSheet) =>
  s.atributos[Atributo.CONSTITUICAO].value ?? 0;

const powerFrom = (className: string, powerName: string): ClassPower => {
  const power = (findClass(className).powers || []).find(
    (p) => p.name === powerName
  );
  if (!power) throw new Error(`Poder não encontrado: ${powerName}`);
  return _.cloneDeep(power) as ClassPower;
};

describe('Tanga de Peles (Machado de Pedra)', () => {
  it('soma a Constituição na Defesa quando não está usando armadura', () => {
    const semArmadura = recalculateSheet(
      buildSheet({ className: 'Machado de Pedra', nivel: 1 })
    );
    const comArmadura = recalculateSheet(
      buildSheet({
        className: 'Machado de Pedra',
        nivel: 1,
        armor: LIGHT_ARMOR,
      })
    );

    // Com armadura: perde a Constituição, mas ganha o bônus da armadura.
    expect(comArmadura.defesa).toBe(
      semArmadura.defesa - conOf(semArmadura) + LIGHT_ARMOR.defenseBonus
    );
  });

  it('não soma a Constituição nem com armadura leve', () => {
    const comArmadura = recalculateSheet(
      buildSheet({
        className: 'Machado de Pedra',
        nivel: 1,
        armor: LIGHT_ARMOR,
      })
    );

    // 10 (base) + 4 (gibão) + 1 (DES). Sem Constituição.
    expect(comArmadura.defesa).toBe(15);
  });

  it('concede +1 na Defesa no 3º nível e mais +1 a cada quatro níveis', () => {
    const defesaNoNivel = (nivel: number) =>
      recalculateSheet(buildSheet({ className: 'Machado de Pedra', nivel }))
        .defesa;

    const base = defesaNoNivel(1);
    expect(defesaNoNivel(2)).toBe(base);
    expect(defesaNoNivel(3)).toBe(base + 1);
    expect(defesaNoNivel(6)).toBe(base + 1);
    expect(defesaNoNivel(7)).toBe(base + 2);
    expect(defesaNoNivel(11)).toBe(base + 3);
    expect(defesaNoNivel(19)).toBe(base + 5);
  });

  it('mantém o bônus progressivo mesmo usando armadura', () => {
    const nivel1 = recalculateSheet(
      buildSheet({
        className: 'Machado de Pedra',
        nivel: 1,
        armor: LIGHT_ARMOR,
      })
    );
    const nivel7 = recalculateSheet(
      buildSheet({
        className: 'Machado de Pedra',
        nivel: 7,
        armor: LIGHT_ARMOR,
      })
    );

    expect(nivel7.defesa).toBe(nivel1.defesa + 2);
  });
});

describe('Insolência (Bucaneiro) - condicionada a armadura pesada', () => {
  it('soma o Carisma sem armadura pesada e o remove com armadura pesada', () => {
    const semArmadura = recalculateSheet(
      buildSheet({ className: 'Bucaneiro', nivel: 1 })
    );
    const armaduraLeve = recalculateSheet(
      buildSheet({ className: 'Bucaneiro', nivel: 1, armor: LIGHT_ARMOR })
    );
    const armaduraPesada = recalculateSheet(
      buildSheet({ className: 'Bucaneiro', nivel: 1, armor: HEAVY_ARMOR })
    );

    // Carisma 3, limitado pelo nível 1 => +1.
    const insolencia = 1;

    // Armadura leve não remove o bônus.
    expect(armaduraLeve.defesa).toBe(
      semArmadura.defesa + LIGHT_ARMOR.defenseBonus
    );

    // Armadura pesada remove a Insolência (e também o modificador de Destreza,
    // que já era suprimido pelo motor).
    expect(armaduraPesada.defesa).toBe(
      semArmadura.defesa - insolencia - 1 + HEAVY_ARMOR.defenseBonus
    );
  });
});

describe('Casca Grossa (Lutador) - condicionada a armadura pesada', () => {
  it('remove a Constituição com armadura pesada mas mantém o bônus progressivo', () => {
    const semArmadura = recalculateSheet(
      buildSheet({ className: 'Lutador', nivel: 7 })
    );
    const armaduraPesada = recalculateSheet(
      buildSheet({ className: 'Lutador', nivel: 7, armor: HEAVY_ARMOR })
    );

    // Constituição 3, limitada pelo nível 7 => +3. Destreza (+1) também é
    // suprimida pela armadura pesada.
    expect(armaduraPesada.defesa).toBe(
      semArmadura.defesa - 3 - 1 + HEAVY_ARMOR.defenseBonus
    );
  });
});

describe('Pele de Ferro (Bárbaro) - condicionada a armadura pesada', () => {
  it('aplica +4 sem armadura pesada e nada com armadura pesada', () => {
    const peleDeFerro = powerFrom('Bárbaro', 'Pele de Ferro');

    const semPoder = recalculateSheet(
      buildSheet({ className: 'Bárbaro', nivel: 8 })
    );
    const comPoder = recalculateSheet(
      buildSheet({
        className: 'Bárbaro',
        nivel: 8,
        classPowers: [peleDeFerro],
      })
    );
    expect(comPoder.defesa).toBe(semPoder.defesa + 4);

    const semPoderPesada = recalculateSheet(
      buildSheet({ className: 'Bárbaro', nivel: 8, armor: HEAVY_ARMOR })
    );
    const comPoderPesada = recalculateSheet(
      buildSheet({
        className: 'Bárbaro',
        nivel: 8,
        armor: HEAVY_ARMOR,
        classPowers: [peleDeFerro],
      })
    );
    expect(comPoderPesada.defesa).toBe(semPoderPesada.defesa);
  });
});

describe('Braços Calejados (Lutador) - condicionada a qualquer armadura', () => {
  it('some com armadura leve, diferente dos poderes gateados por armadura pesada', () => {
    const bracos = powerFrom('Lutador', 'Braços Calejados');

    const semPoder = recalculateSheet(
      buildSheet({ className: 'Lutador', nivel: 1 })
    );
    const comPoder = recalculateSheet(
      buildSheet({ className: 'Lutador', nivel: 1, classPowers: [bracos] })
    );
    // Força 2, limitada pelo nível 1 => +1.
    expect(comPoder.defesa).toBe(semPoder.defesa + 1);

    const semPoderLeve = recalculateSheet(
      buildSheet({ className: 'Lutador', nivel: 1, armor: LIGHT_ARMOR })
    );
    const comPoderLeve = recalculateSheet(
      buildSheet({
        className: 'Lutador',
        nivel: 1,
        armor: LIGHT_ARMOR,
        classPowers: [bracos],
      })
    );
    expect(comPoderLeve.defesa).toBe(semPoderLeve.defesa);
  });
});
