/**
 * Símbolo sagrado e a melhoria Inscrito (Deuses de Arton).
 *
 * Relato de usuário (out/2026): armadura Inscrita não dava o +1 nas
 * resistências — a melhoria era só descritiva. Pela regra, o item "conta como
 * um símbolo sagrado desse deus (inclusive fornecendo o bônus de +1 em testes
 * de resistência)", e só vale vestido ou empunhado. Como é o MESMO bônus do
 * Símbolo sagrado, os dois não acumulam.
 */
import { describe, it, expect } from 'vitest';
import _ from 'lodash';
import { recalculateSheet } from '../../functions/recalculateSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { CharacterAttributes } from '../../interfaces/Character';
import Equipment, { DefenseEquipment } from '../../interfaces/Equipment';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import Bag from '../../interfaces/Bag';
import Skill from '../../interfaces/Skills';
import { SupplementId } from '../../types/supplement.types';
import { dataRegistry } from '../../data/registry';
import { Armaduras } from '../../data/systems/tormenta20/equipamentos';
import { equipamentoAventureiro } from '../../data/systems/tormenta20/equipamentos-gerais';
import { applyItemEnhancements } from '../../functions/itemEnhancements/applyEnhancements';

const RESISTENCIAS = [Skill.FORTITUDE, Skill.REFLEXOS, Skill.VONTADE];

const inscrita = (armor: DefenseEquipment): DefenseEquipment =>
  applyItemEnhancements({
    ..._.cloneDeep(armor),
    modifications: [
      { mod: 'Inscrito', supplementId: SupplementId.TORMENTA20_DEUSES_ARTON },
      { mod: 'Reforçada' },
    ],
    enchantments: [{ enchantment: 'Defensor' }],
  });

const simboloSagrado = (): Equipment =>
  _.cloneDeep(
    equipamentoAventureiro.find((e) => e.nome === 'Símbolo sagrado')!
  );

type Opts = {
  /** Armadura VESTIDA. */
  armor?: DefenseEquipment;
  /** Armadura carregada na mochila, mas NÃO vestida. */
  carriedArmor?: DefenseEquipment;
  generalItems?: Equipment[];
};

const buildSheet = ({
  armor,
  carriedArmor,
  generalItems = [],
}: Opts): CharacterSheet => {
  const classe = _.cloneDeep(
    dataRegistry
      .getClassesBySupplements([SupplementId.TORMENTA20_CORE])
      .find((c) => c.name === 'Guerreiro')!
  );
  // Elfo, não Humano: o Versátil sorteia poderes a cada recálculo.
  const raca = dataRegistry
    .getRacesBySupplements([SupplementId.TORMENTA20_CORE])
    .find((r) => r.name === 'Elfo')!;
  const atributos = Object.fromEntries(
    Object.values(Atributo).map((name) => [name, { name, value: 0 }])
  ) as unknown as CharacterAttributes;

  const armaduras = [armor, carriedArmor].filter(Boolean) as DefenseEquipment[];
  const bag = new Bag({
    ...(armaduras.length ? { Armadura: _.cloneDeep(armaduras) } : {}),
    ...(generalItems.length ? { 'Item Geral': generalItems } : {}),
  } as never);
  const eq = bag.getEquipments();

  return {
    id: 'test-holy-symbol',
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
    spells: [],
    displacement: 9,
    size: raca.size!,
    maxSpaces: 10,
    generalPowers: [],
    classPowers: [],
    steps: [],
    equipStateMigrated: true,
    wornArmorId: armor ? eq.Armadura[0].id : undefined,
  } as unknown as CharacterSheet;
};

const resistencias = (opts: Opts) => {
  const sheet = recalculateSheet(buildSheet(opts));
  return RESISTENCIAS.map(
    (skill) => sheet.completeSkills?.find((s) => s.name === skill)?.others ?? 0
  );
};

const base = resistencias({ armor: Armaduras.ARMADURA_COMPLETA });
const plusOne = base.map((value) => value + 1);

describe('Inscrito conta como símbolo sagrado', () => {
  it('armadura Inscrita vestida dá +1 nas três resistências', () => {
    expect(
      resistencias({ armor: inscrita(Armaduras.ARMADURA_COMPLETA) })
    ).toEqual(plusOne);
  });

  it('não vale com a armadura só carregada na mochila', () => {
    expect(
      resistencias({
        armor: Armaduras.ARMADURA_COMPLETA,
        carriedArmor: inscrita(Armaduras.BRUNEA),
      })
    ).toEqual(base);
  });

  it('não acumula com um Símbolo sagrado na mochila', () => {
    expect(
      resistencias({
        armor: inscrita(Armaduras.ARMADURA_COMPLETA),
        generalItems: [simboloSagrado()],
      })
    ).toEqual(plusOne);
  });

  it('dois Símbolos sagrados também não acumulam', () => {
    expect(
      resistencias({
        armor: Armaduras.ARMADURA_COMPLETA,
        generalItems: [simboloSagrado(), simboloSagrado()],
      })
    ).toEqual(plusOne);
  });

  it('Reforçada e Defensor continuam somando na armadura Inscrita', () => {
    const armor = inscrita(Armaduras.ARMADURA_COMPLETA);
    expect(armor.defenseBonus).toBe(
      Armaduras.ARMADURA_COMPLETA.defenseBonus + 3
    );
    expect(armor.armorPenalty).toBe(
      Armaduras.ARMADURA_COMPLETA.armorPenalty + 1
    );
  });
});
