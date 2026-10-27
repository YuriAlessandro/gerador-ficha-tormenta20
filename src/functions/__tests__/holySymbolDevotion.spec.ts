/**
 * Símbolo sagrado só dá o +1 em testes de resistência para devotos:
 *
 * "Se você estiver vestindo (...) ou empunhando o símbolo sagrado de um deus do
 * qual é devoto, recebe +1 em testes de resistência." (Tormenta20 JdA, p. 157)
 *
 * O item é genérico (não guarda de qual deus é), então a condição é "a ficha é
 * devota de algum deus" — o símbolo carregado é tomado como o do próprio deus.
 * A melhoria Inscrito (Deuses de Arton, p. 54) "conta como um símbolo sagrado
 * desse deus", então segue a mesma regra.
 */
import { describe, it, expect } from 'vitest';
import _ from 'lodash';
import { recalculateSheet } from '../recalculateSheet';
import { evaluateBonusCondition } from '../bonusConditions';
import { getOriginBagEquipments } from '../originItems';
import { getHolySymbolBonuses } from '../holySymbol';
import { applyItemEnhancements } from '../itemEnhancements/applyEnhancements';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { CharacterAttributes } from '../../interfaces/Character';
import Equipment, { DefenseEquipment } from '../../interfaces/Equipment';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import Bag from '../../interfaces/Bag';
import Skill from '../../interfaces/Skills';
import { SupplementId } from '../../types/supplement.types';
import { dataRegistry } from '../../data/registry';
import { Armaduras } from '../../data/systems/tormenta20/equipamentos';
import KHALMYR from '../../data/systems/tormenta20/divindades/khalmyr';

const RESISTENCIAS = [Skill.FORTITUDE, Skill.REFLEXOS, Skill.VONTADE];
const CORE = [SupplementId.TORMENTA20_CORE];

/** Itens que a origem Acólito põe na mochila (símbolo sagrado incluso). */
const itensDoAcolito = (): Equipment[] => {
  const acolito = dataRegistry
    .getOriginsBySupplements(CORE)
    .find((o) => o.name === 'Acólito')!;
  return getOriginBagEquipments(acolito)['Item Geral'] ?? [];
};

const armaduraInscrita = (): DefenseEquipment =>
  applyItemEnhancements({
    ..._.cloneDeep(Armaduras.BRUNEA),
    modifications: [
      { mod: 'Inscrito', supplementId: SupplementId.TORMENTA20_DEUSES_ARTON },
    ],
  });

type Opts = {
  devoto?: boolean;
  generalItems?: Equipment[];
  armor?: DefenseEquipment;
};

const buildSheet = ({
  devoto = false,
  generalItems = [],
  armor,
}: Opts): CharacterSheet => {
  const classe = _.cloneDeep(
    dataRegistry
      .getClassesBySupplements(CORE)
      .find((c) => c.name === 'Guerreiro')!
  );
  // Elfo, não Humano: o Versátil sorteia poderes a cada recálculo.
  const raca = dataRegistry
    .getRacesBySupplements(CORE)
    .find((r) => r.name === 'Elfo')!;
  const atributos = Object.fromEntries(
    Object.values(Atributo).map((name) => [name, { name, value: 0 }])
  ) as unknown as CharacterAttributes;

  const bag = new Bag({
    ...(armor ? { Armadura: [_.cloneDeep(armor)] } : {}),
    ...(generalItems.length ? { 'Item Geral': generalItems } : {}),
  } as never);

  return {
    id: 'test-holy-symbol-devotion',
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
    wornArmorId: armor ? bag.getEquipments().Armadura[0].id : undefined,
    devoto: devoto ? { divindade: KHALMYR, poderes: [] } : undefined,
  } as unknown as CharacterSheet;
};

const resistencias = (opts: Opts) => {
  const sheet = recalculateSheet(buildSheet(opts));
  return RESISTENCIAS.map(
    (skill) => sheet.completeSkills?.find((s) => s.name === skill)?.others ?? 0
  );
};

describe('Símbolo sagrado exige devoção', () => {
  const semNada = resistencias({});
  const semNadaDevoto = resistencias({ devoto: true });

  it('Acólito não devoto: o símbolo da origem não dá +1', () => {
    expect(resistencias({ generalItems: itensDoAcolito() })).toEqual(semNada);
  });

  it('Acólito devoto: +1 nas três resistências', () => {
    expect(
      resistencias({ devoto: true, generalItems: itensDoAcolito() })
    ).toEqual(semNadaDevoto.map((v) => v + 1));
  });
});

describe('Inscrito segue a mesma regra', () => {
  const base = resistencias({ armor: Armaduras.BRUNEA });
  const baseDevoto = resistencias({ devoto: true, armor: Armaduras.BRUNEA });

  it('armadura Inscrita vestida por não devoto: sem +1', () => {
    expect(resistencias({ armor: armaduraInscrita() })).toEqual(base);
  });

  it('armadura Inscrita vestida por devoto: +1', () => {
    expect(resistencias({ devoto: true, armor: armaduraInscrita() })).toEqual(
      baseDevoto.map((v) => v + 1)
    );
  });
});

describe('condição isDevote', () => {
  it('é a condição dos bônus do símbolo sagrado', () => {
    getHolySymbolBonuses().forEach((bonus) => {
      expect(bonus.condition).toEqual({
        combinator: 'AND',
        clauses: [{ kind: 'isDevote' }],
      });
    });
  });

  it('vale para qualquer deus e falha sem devoção', () => {
    const condition = {
      combinator: 'AND' as const,
      clauses: [{ kind: 'isDevote' as const }],
    };
    expect(evaluateBonusCondition(buildSheet({}), condition)).toBe(false);
    expect(
      evaluateBonusCondition(buildSheet({ devoto: true }), condition)
    ).toBe(true);
  });
});
