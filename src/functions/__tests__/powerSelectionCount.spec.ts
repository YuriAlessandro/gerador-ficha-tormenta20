import {
  countRequirementSelections,
  getPowerSelectionRequirements,
} from '../powers/manualPowerSelection';
import { PowerSelectionRequirement } from '../../interfaces/PowerSelections';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import { GeneralPower, GeneralPowerType } from '../../interfaces/Poderes';
import racePowers from '../../data/systems/tormenta20/herois-de-arton/powers/racePowers';

const { TRADICAO_PERDIDA } = racePowers;

const makeRequirement = (
  type: PowerSelectionRequirement['type'],
  pick = 1
): PowerSelectionRequirement => ({
  type,
  availableOptions: [],
  pick,
  label: `Requisição de teste (${type})`,
});

const fakePower = (name: string): GeneralPower => ({
  name,
  description: '',
  type: GeneralPowerType.COMBATE,
  requirements: [],
});

describe('countRequirementSelections', () => {
  // Regressão: o assistente travava o botão "Próximo" ao escolher Tradição
  // Perdida porque a contagem não conhecia `chooseFromOptions`.
  it('conta uma escolha de chooseFromOptions (Tradição Perdida)', () => {
    const reqs = getPowerSelectionRequirements(TRADICAO_PERDIDA);
    expect(reqs).not.toBeNull();
    const requirement = reqs!.requirements[0];
    expect(requirement.type).toBe('chooseFromOptions');

    expect(
      countRequirementSelections(requirement, {
        chosenOption: [Atributo.FORCA],
      })
    ).toBe(1);
  });

  it('retorna 0 para chooseFromOptions sem escolha', () => {
    const requirement = makeRequirement('chooseFromOptions');
    expect(countRequirementSelections(requirement, {})).toBe(0);
    expect(countRequirementSelections(requirement, undefined)).toBe(0);
  });

  it('conta multi-pick de chooseFromOptions', () => {
    const requirement = makeRequirement('chooseFromOptions', 2);
    expect(
      countRequirementSelections(requirement, {
        chosenOption: ['Opção A', 'Opção B'],
      })
    ).toBe(2);
  });

  it('conta tipos simples pela sua lista correspondente', () => {
    expect(
      countRequirementSelections(makeRequirement('learnSkill'), {
        skills: ['Acrobacia'],
      })
    ).toBe(1);
    expect(
      countRequirementSelections(
        makeRequirement('selectWeaponSpecialization'),
        {
          weapons: ['Espada Longa'],
        }
      )
    ).toBe(1);
    expect(
      countRequirementSelections(makeRequirement('getGeneralPower'), {
        powers: [fakePower('Poder Qualquer')],
      })
    ).toBe(1);
  });

  it('Versátil: 2 perícias OU 1 perícia + 1 poder completam a escolha', () => {
    const requirement = makeRequirement('humanoVersatil', 2);
    expect(
      countRequirementSelections(requirement, { skills: ['Atletismo'] })
    ).toBe(1);
    expect(
      countRequirementSelections(requirement, {
        skills: ['Atletismo', 'Luta'],
      })
    ).toBe(2);
    expect(
      countRequirementSelections(requirement, {
        skills: ['Atletismo'],
        powers: [fakePower('Ataque Poderoso')],
      })
    ).toBe(2);
  });

  it('Memória Póstuma: perícia, poder ou habilidade de raça contam 1', () => {
    const requirement = makeRequirement('osteonMemoriaPostuma');
    expect(countRequirementSelections(requirement, {})).toBe(0);
    expect(
      countRequirementSelections(requirement, { skills: ['Ofício'] })
    ).toBe(1);
    expect(
      countRequirementSelections(requirement, {
        raceAbilities: [{ raceName: 'Elfo', abilityName: 'Herança Feérica' }],
      })
    ).toBe(1);
  });

  it('Golpe Pessoal e Alma Livre são contagens booleanas', () => {
    expect(
      countRequirementSelections(makeRequirement('buildGolpePessoal'), {})
    ).toBe(0);
    expect(
      countRequirementSelections(makeRequirement('almaLivreSelectClass'), {
        almaLivreClass: 'Guerreiro',
      })
    ).toBe(0);
  });

  // O chamador deve tratar `null` como "não bloquear" — assim um tipo novo
  // nunca prende o assistente como aconteceu com `chooseFromOptions`.
  it('retorna null para tipo não contável', () => {
    expect(
      countRequirementSelections(makeRequirement('learnClassAbility'), {})
    ).toBeNull();
  });
});
