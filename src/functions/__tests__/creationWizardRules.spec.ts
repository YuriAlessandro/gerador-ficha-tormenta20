import { describe, expect, it } from 'vitest';
import {
  buildCreationWizardContext,
  getCreationGaps,
  getCreationSteps,
  isCreationStepComplete,
} from '../wizardRules/creationWizardRules';
import { WizardAccess } from '../wizardRules/types';
import SelectedOptions from '../../interfaces/SelectedOptions';
import { WizardSelections } from '../../interfaces/WizardSelections';
import { SupplementId } from '../../types/supplement.types';
import { expandOficioInBasicas } from '../../data/systems/tormenta20/pericias';
import GUERREIRO from '../../data/systems/tormenta20/classes/guerreiro';
import EQUIPAMENTOS, {
  Armaduras,
} from '../../data/systems/tormenta20/equipamentos';

/**
 * Regras do assistente de criação em funções puras (Builds v2, bloco 1B):
 * mesmos passos e mesma habilitação do "Próximo" que o componente usava.
 */
const ACCESS: WizardAccess = {
  optionalRules: false,
  complications: false,
  multiclass: false,
};

const options = (overrides: Partial<SelectedOptions> = {}): SelectedOptions => ({
  nivel: 1,
  raca: 'Humano',
  classe: 'Guerreiro',
  origin: 'Acólito',
  devocao: { label: '--', value: '--' },
  supplements: [SupplementId.TORMENTA20_CORE],
  ...overrides,
});

const ctxFor = (
  selections: WizardSelections,
  selectedOptions = options(),
  access = ACCESS
) => buildCreationWizardContext({ selectedOptions, selections, access });

const gapSteps = (selections: WizardSelections, selectedOptions = options()) =>
  getCreationGaps(ctxFor(selections, selectedOptions)).map((gap) => gap.step);

/** Perícias do Guerreiro completas: uma de cada grupo "ou" + as restantes. */
const guerreiroSkills = (): WizardSelections => {
  const orGroups = expandOficioInBasicas(GUERREIRO.periciasbasicas).filter(
    (group) => group.type === 'or'
  );
  return {
    baseSkillChoices: orGroups.map((group) => group.list[0]),
    classSkills: GUERREIRO.periciasrestantes.list.slice(
      0,
      GUERREIRO.periciasrestantes.qtd
    ),
  };
};

describe('getCreationSteps', () => {
  it('começa em "Informações Básicas" e termina em "Mercado"', () => {
    const steps = getCreationSteps(ctxFor({}));
    expect(steps[0]).toBe('Informações Básicas');
    expect(steps[steps.length - 1]).toBe('Mercado');
    expect(steps).toContain('Perícias da Classe');
    expect(steps).toContain('Equipamento Inicial');
  });

  it('Arcanista tem "Caminho do Arcanista" e "Magias Iniciais"', () => {
    const steps = getCreationSteps(
      ctxFor({}, options({ raca: 'Elfo', classe: 'Arcanista' }))
    );
    expect(steps).toContain('Caminho do Arcanista');
    expect(steps).toContain('Magias Iniciais');
    expect(steps).not.toContain('Linhagem do Feiticeiro');
  });

  it('Feiticeiro acrescenta "Linhagem do Feiticeiro"', () => {
    const steps = getCreationSteps(
      ctxFor(
        { arcanistaSubtype: 'Feiticeiro' },
        options({ raca: 'Elfo', classe: 'Arcanista' })
      )
    );
    expect(steps).toContain('Linhagem do Feiticeiro');
  });

  it('"Complicação" só existe com acesso e Heróis de Arton', () => {
    const herois = options({
      supplements: [
        SupplementId.TORMENTA20_CORE,
        SupplementId.TORMENTA20_HEROIS_ARTON,
      ],
    });
    expect(getCreationSteps(ctxFor({}, herois))).not.toContain('Complicação');

    const withAccess = ctxFor({}, herois, { ...ACCESS, complications: true });
    expect(getCreationSteps(withAccess)).toContain('Complicação');
    expect(isCreationStepComplete(withAccess, 'Complicação')).toBe(false);
    expect(
      isCreationStepComplete(
        ctxFor({ complication: 'declined' }, herois, {
          ...ACCESS,
          complications: true,
        }),
        'Complicação'
      )
    ).toBe(true);
  });
});

describe('getCreationGaps', () => {
  it('sem nome: lacuna em "Informações Básicas"', () => {
    expect(gapSteps({})).toContain('Informações Básicas');
    expect(gapSteps({ characterName: 'Ana' })).not.toContain(
      'Informações Básicas'
    );
  });

  it('Guerreiro sem perícias: lacuna em "Perícias da Classe"', () => {
    expect(gapSteps({})).toContain('Perícias da Classe');
    expect(gapSteps(guerreiroSkills())).not.toContain('Perícias da Classe');
  });

  it('Arcanista sem caminho e Feiticeiro Dracônico sem tipo de dano', () => {
    const arcanista = options({ raca: 'Elfo', classe: 'Arcanista' });
    expect(gapSteps({}, arcanista)).toContain('Caminho do Arcanista');
    expect(
      gapSteps(
        {
          arcanistaSubtype: 'Feiticeiro',
          feiticeiroLinhagem: 'Linhagem Dracônica',
        },
        arcanista
      )
    ).toContain('Linhagem do Feiticeiro');
    expect(
      gapSteps(
        {
          arcanistaSubtype: 'Feiticeiro',
          feiticeiroLinhagem: 'Linhagem Dracônica',
          draconicaDamageType: 'Fogo',
        },
        arcanista
      )
    ).not.toContain('Linhagem do Feiticeiro');
  });

  it('"Equipamento Inicial" do Guerreiro exige arma simples, marcial e armadura', () => {
    const simpleWeapon = EQUIPAMENTOS.armasSimples[0];
    const martialWeapon = EQUIPAMENTOS.armasMarciais[0];
    expect(gapSteps({ classEquipment: { simpleWeapon } })).toContain(
      'Equipamento Inicial'
    );
    expect(
      gapSteps({ classEquipment: { simpleWeapon, martialWeapon } })
    ).toContain('Equipamento Inicial');
    expect(
      gapSteps({
        classEquipment: {
          simpleWeapon,
          martialWeapon,
          armor: Armaduras.BRUNEA,
        },
      })
    ).not.toContain('Equipamento Inicial');
  });

  it('as lacunas são da criação (nível 1) e seguem a ordem dos passos', () => {
    const ctx = ctxFor({});
    const gaps = getCreationGaps(ctx);
    expect(gaps.every((gap) => gap.level === 1)).toBe(true);
    const steps = getCreationSteps(ctx);
    const positions = gaps.map((gap) => steps.indexOf(gap.step));
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });
});
