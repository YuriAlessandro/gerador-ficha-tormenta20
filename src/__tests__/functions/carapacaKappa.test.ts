/**
 * Carapaça Kappa (Ameaças de Arton): "Você soma sua Constituição na Defesa,
 * limitado pelo seu nível, mas apenas se não estiver usando armaduras pesadas
 * (se já faz isso, como pela habilidade Casca Grossa, em vez disso você recebe
 * +2 na Defesa)."
 *
 * A habilidade era puramente descritiva — nenhuma parcela chegava à Defesa.
 * Os testes comparam sempre contra a MESMA ficha com a habilidade removida da
 * raça, para isolar a contribuição dela do resto do cálculo de Defesa.
 */
import { describe, it, expect } from 'vitest';
import _ from 'lodash';
import { recalculateSheet } from '../../functions/recalculateSheet';
import { applyStatModifiers } from '../../functions/general';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { CharacterAttributes } from '../../interfaces/Character';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import Bag from '../../interfaces/Bag';
import { SupplementId } from '../../types/supplement.types';
import { dataRegistry } from '../../data/registry';
import { Armaduras } from '../../data/systems/tormenta20/equipamentos';
import { ClassDescription } from '../../interfaces/Class';
import { CARAPACA_KAPPA_ABILITY_NAME } from '../../functions/powers/kappaCarapaca';

const SUPPLEMENTS = [
  SupplementId.TORMENTA20_CORE,
  SupplementId.TORMENTA20_AMEACAS_ARTON,
];

const HEAVY_ARMOR = Armaduras.BRUNEA;

const findClass = (name: string): ClassDescription => {
  const classe = dataRegistry
    .getClassesBySupplements(SUPPLEMENTS)
    .find((c) => c.name === name);
  if (!classe) throw new Error(`Classe não encontrada: ${name}`);
  return classe;
};

const findRace = (name: string) => {
  const raca = dataRegistry
    .getRacesBySupplements(SUPPLEMENTS)
    .find((r) => r.name === name);
  if (!raca) throw new Error(`Raça não encontrada: ${name}`);
  return _.cloneDeep(raca);
};

type Opts = {
  className: string;
  nivel: number;
  con: number;
  heavyArmor?: boolean;
  /** Remove a Carapaça Kappa da raça — usado para obter a linha de base. */
  withoutAbility?: boolean;
};

const buildSheet = ({
  className,
  nivel,
  con,
  heavyArmor = false,
  withoutAbility = false,
}: Opts): CharacterSheet => {
  const classe = _.cloneDeep(findClass(className));
  const raca = findRace('Kappa');

  if (withoutAbility) {
    raca.abilities = raca.abilities.filter(
      (ability) => ability.name !== CARAPACA_KAPPA_ABILITY_NAME
    );
  }

  const atributos: CharacterAttributes = {
    [Atributo.FORCA]: { name: Atributo.FORCA, value: 1 },
    [Atributo.DESTREZA]: { name: Atributo.DESTREZA, value: 2 },
    [Atributo.CONSTITUICAO]: { name: Atributo.CONSTITUICAO, value: con },
    [Atributo.INTELIGENCIA]: { name: Atributo.INTELIGENCIA, value: 0 },
    [Atributo.SABEDORIA]: { name: Atributo.SABEDORIA, value: 0 },
    [Atributo.CARISMA]: { name: Atributo.CARISMA, value: -1 },
  };

  const bag = new Bag(
    (heavyArmor ? { Armadura: [_.cloneDeep(HEAVY_ARMOR)] } : {}) as never
  );
  const eq = bag.getEquipments();

  return {
    id: 'test-carapaca-kappa',
    nome: 'Test Kappa',
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
    generalPowers: [],
    classPowers: [],
    steps: [],
    equipStateMigrated: true,
    wornArmorId: heavyArmor ? eq.Armadura[0].id : undefined,
  } as unknown as CharacterSheet;
};

/** Quanto a Carapaça Kappa acrescentou à Defesa, isolada do resto. */
const carapacaContribution = (opts: Omit<Opts, 'withoutAbility'>): number => {
  const comHabilidade = recalculateSheet(buildSheet(opts));
  const semHabilidade = recalculateSheet(
    buildSheet({ ...opts, withoutAbility: true })
  );
  return comHabilidade.defesa - semHabilidade.defesa;
};

describe('Carapaça Kappa', () => {
  it('soma a Constituição na Defesa sem armadura pesada', () => {
    expect(
      carapacaContribution({ className: 'Guerreiro', nivel: 5, con: 3 })
    ).toBe(3);
  });

  it('limita a parcela de Constituição pelo nível', () => {
    // Con 3, nível 1 → soma só 1.
    expect(
      carapacaContribution({ className: 'Guerreiro', nivel: 1, con: 3 })
    ).toBe(1);
  });

  it('não dá nada com armadura pesada vestida', () => {
    expect(
      carapacaContribution({
        className: 'Guerreiro',
        nivel: 5,
        con: 3,
        heavyArmor: true,
      })
    ).toBe(0);
  });

  it('vira +2 quando a Casca Grossa já soma Constituição na Defesa', () => {
    // Lutador 3+ tem Casca Grossa. Sem o substituto, a Constituição entraria
    // duas vezes na Defesa.
    expect(
      carapacaContribution({ className: 'Lutador', nivel: 5, con: 3 })
    ).toBe(2);
  });

  it('não dá o +2 a um Lutador de armadura pesada', () => {
    // A parcela de Constituição da Casca Grossa também é cancelada pela
    // armadura pesada, então não há nada que "já faça isso".
    expect(
      carapacaContribution({
        className: 'Lutador',
        nivel: 5,
        con: 3,
        heavyArmor: true,
      })
    ).toBe(0);
  });

  it('não acumula ao recalcular várias vezes', () => {
    const primeira = recalculateSheet(
      buildSheet({ className: 'Guerreiro', nivel: 5, con: 3 })
    );
    const segunda = recalculateSheet(primeira);
    const terceira = recalculateSheet(segunda);

    expect(segunda.defesa).toBe(primeira.defesa);
    expect(terceira.defesa).toBe(primeira.defesa);
  });

  it('aparece na Defesa pelo motor de ficha aleatória também', () => {
    // `applyStatModifiers` é o outro motor de derivação; os dois divergem em
    // silêncio, então a injeção precisa estar espelhada nos dois.
    const base = recalculateSheet(
      buildSheet({ className: 'Guerreiro', nivel: 5, con: 3 })
    );
    const semBonus: CharacterSheet = {
      ...base,
      sheetBonuses: base.sheetBonuses.filter(
        (bonus) =>
          !(
            bonus.source.type === 'power' &&
            bonus.source.name === CARAPACA_KAPPA_ABILITY_NAME
          )
      ),
    };

    const aplicado = applyStatModifiers(semBonus);
    expect(aplicado.defesa - semBonus.defesa).toBe(3);
  });
});
