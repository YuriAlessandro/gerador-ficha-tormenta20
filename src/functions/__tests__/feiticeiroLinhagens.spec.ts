import _ from 'lodash';
import { generateEmptySheet } from '../general';
import {
  recalculateSheet,
  reverseSheetActionsForPower,
} from '../recalculateSheet';
import { normalizeSheet } from '../sheetNormalizer';
import {
  getFilteredAvailableOptions,
  getPowerSelectionRequirements,
} from '../powers/manualPowerSelection';
import { getClassSetupAbilities } from '../multiclass';
import SelectOptions from '../../interfaces/SelectedOptions';
import { WizardSelections } from '../../interfaces/WizardSelections';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { ClassPower } from '../../interfaces/Class';
import { Spell } from '../../interfaces/Spells';
import Skill from '../../interfaces/Skills';
import { SupplementId } from '../../types/supplement.types';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import { spellsCircle1 } from '../../data/systems/tormenta20/magias/generalSpells';
import ARCANISTA, {
  FEITICEIRO_HERANCAS,
  HERANCA_APRIMORADA,
  HERANCA_SUPERIOR,
  feiticeiroPaths,
} from '../../data/systems/tormenta20/classes/arcanista';

/**
 * Linhagens do Feiticeiro (Tormenta 20 p. 39): herança básica no assistente de
 * criação e os efeitos das Heranças Aprimorada e Superior por linhagem.
 */
const SUPPLEMENTS = [
  SupplementId.TORMENTA20_CORE,
  SupplementId.TORMENTA20_DEUSES_ARTON,
];

// Elfo, e não Humano: o Humano sorteia um poder geral a cada recálculo.
const OPTIONS: SelectOptions = {
  nivel: 1,
  raca: 'Elfo',
  classe: 'Arcanista',
  origin: 'Acólito',
  devocao: { label: '--', value: '--' },
  supplements: SUPPLEMENTS,
};

const buildFeiticeiro = (selections: WizardSelections): CharacterSheet =>
  generateEmptySheet(OPTIONS, {
    arcanistaSubtype: 'Feiticeiro',
    ...selections,
  });

const herancas = (...names: string[]): ClassPower[] =>
  names.map((name) => {
    const power = (ARCANISTA.powers || []).find((p) => p.name === name);
    if (!power) throw new Error(`Poder não encontrado: ${name}`);
    return _.cloneDeep(power);
  });

const withHerancas = (
  sheet: CharacterSheet,
  ...names: string[]
): CharacterSheet => {
  const clone = _.cloneDeep(sheet);
  clone.classPowers = herancas(...names);
  return recalculateSheet(clone);
};

const attr = (sheet: CharacterSheet, atributo: Atributo) =>
  sheet.atributos[atributo].value;

const powerNamed = (sheet: CharacterSheet, name: string) =>
  sheet.classPowers?.find((p) => p.name === name);

describe('Linhagem Feérica - herança básica', () => {
  const feerica = () =>
    buildFeiticeiro({
      feiticeiroLinhagem: 'Linhagem Feérica',
      powerEffectSelections: {
        'Linhagem Feérica': { spells: [spellsCircle1.enfeiticar] },
      },
    });

  it('o assistente treina Enganação e aprende a magia escolhida', () => {
    const sheet = feerica();

    expect(sheet.skills).toContain(Skill.ENGANACAO);
    expect(sheet.spells.map((s) => s.nome)).toContain('Enfeitiçar');
  });

  it('o assistente oferece a escolha: a linhagem entra nas habilidades de setup', () => {
    const abilities = getClassSetupAbilities('Arcanista', {
      arcanistaSubtype: 'Feiticeiro',
      feiticeiroLinhagem: 'Linhagem Feérica',
    });
    const linhagem = abilities.find((a) => a.name === 'Linhagem Feérica');

    const requirements = getPowerSelectionRequirements(linhagem!);
    expect(
      requirements?.requirements.map((requirement) => requirement.type)
    ).toEqual(['learnSkill', 'learnAnySpellFromHighestCircle']);
  });

  it('a magia é de 1º círculo, encantamento ou ilusão, arcana ou divina', () => {
    const sheet = feerica();
    // Nível alto: sem o teto, o pool subiria para o círculo mais alto.
    sheet.nivel = 9;
    sheet.spells = [];
    const linhagem = feiticeiroPaths.find((p) => p.name === 'Linhagem Feérica');
    const requirement = getPowerSelectionRequirements(
      linhagem!
    )?.requirements.find((r) => r.type === 'learnAnySpellFromHighestCircle');

    const options = getFilteredAvailableOptions(
      requirement!,
      sheet,
      SUPPLEMENTS
    ) as Spell[];

    expect(options.length).toBeGreaterThan(0);
    options.forEach((spell) => {
      expect(spell.spellCircle).toBe(spellsCircle1.enfeiticar.spellCircle);
      expect(['Encan', 'Ilusão']).toContain(spell.school);
    });
    // Divina de encantamento do 1º círculo.
    expect(options.map((s) => s.nome)).toContain('Bênção');
  });

  it('ficha salva sem Enganação recebe a perícia e mantém a magia', () => {
    const legacy = feerica();
    const stripSkill = (ability: (typeof legacy.classe.abilities)[number]) =>
      ability.name === 'Linhagem Feérica'
        ? {
            ...ability,
            sheetActions: ability.sheetActions?.filter(
              (a) => a.action.type !== 'learnSkill'
            ),
          }
        : ability;
    legacy.classe.abilities = legacy.classe.abilities.map(stripSkill);
    legacy.classe.originalAbilities =
      legacy.classe.originalAbilities?.map(stripSkill);
    legacy.skills = legacy.skills.filter((s) => s !== Skill.ENGANACAO);
    legacy.sheetActionHistory = legacy.sheetActionHistory.filter(
      (entry) => !entry.changes.some((c) => c.type === 'SkillsAdded')
    );
    const spellsBefore = legacy.spells.map((s) => s.nome);

    normalizeSheet(legacy);
    const result = recalculateSheet(legacy);

    expect(result.skills).toContain(Skill.ENGANACAO);
    expect(result.spells.map((s) => s.nome)).toEqual(spellsBefore);
  });
});

describe('Herança Aprimorada e Superior', () => {
  it('mostram o texto da herança da linhagem do personagem', () => {
    const sheet = withHerancas(
      buildFeiticeiro({ feiticeiroLinhagem: 'Linhagem Feérica' }),
      HERANCA_APRIMORADA,
      HERANCA_SUPERIOR
    );

    expect(powerNamed(sheet, HERANCA_APRIMORADA)?.dynamicText).toBe(
      `Linhagem Feérica: ${FEITICEIRO_HERANCAS['Linhagem Feérica'].aprimorada}`
    );
    expect(powerNamed(sheet, HERANCA_SUPERIOR)?.dynamicText).toContain(
      'Você recebe +2 em Carisma'
    );
  });

  it('ficha salva com o poder genérico ganha o texto ao ser carregada', () => {
    const sheet = buildFeiticeiro({ feiticeiroLinhagem: 'Linhagem Rubra' });
    sheet.classPowers = herancas(HERANCA_APRIMORADA);

    normalizeSheet(sheet);

    expect(powerNamed(sheet, HERANCA_APRIMORADA)?.dynamicText).toContain(
      'Linhagem Rubra'
    );
  });

  describe('Linhagem Feérica', () => {
    const base = () =>
      buildFeiticeiro({ feiticeiroLinhagem: 'Linhagem Feérica' });

    it('Superior dá +2 em Carisma uma única vez, e o PM acompanha', () => {
      const sheet = base();
      const aprimorada = withHerancas(sheet, HERANCA_APRIMORADA);
      const superior = withHerancas(
        sheet,
        HERANCA_APRIMORADA,
        HERANCA_SUPERIOR
      );

      expect(attr(aprimorada, Atributo.CARISMA)).toBe(
        attr(sheet, Atributo.CARISMA)
      );
      expect(attr(superior, Atributo.CARISMA)).toBe(
        attr(sheet, Atributo.CARISMA) + 2
      );
      expect(superior.pm).toBe(aprimorada.pm + 2);

      const again = recalculateSheet(_.cloneDeep(superior));
      expect(attr(again, Atributo.CARISMA)).toBe(
        attr(superior, Atributo.CARISMA)
      );
    });

    it('remover o poder devolve o Carisma', () => {
      const sheet = base();
      const superior = withHerancas(sheet, HERANCA_SUPERIOR);

      reverseSheetActionsForPower(superior, HERANCA_SUPERIOR);

      expect(attr(superior, Atributo.CARISMA)).toBe(
        attr(sheet, Atributo.CARISMA)
      );
    });
  });

  describe('Linhagem Dracônica', () => {
    const base = () => {
      const sheet = buildFeiticeiro({
        feiticeiroLinhagem: 'Linhagem Dracônica',
        draconicaDamageType: 'Elétrico',
      });
      sheet.atributos[Atributo.CARISMA].value = 3;
      return recalculateSheet(sheet);
    };

    it('a herança básica dá RD 5 do tipo escolhido', () => {
      expect(base().reducaoDeDano?.Eletricidade).toBe(5);
    });

    it('Superior soma o Carisma nos PV pela segunda vez', () => {
      const sheet = base();
      const superior = withHerancas(sheet, HERANCA_SUPERIOR);

      expect(superior.pv).toBe(sheet.pv + 3);
      expect(powerNamed(superior, HERANCA_SUPERIOR)?.dynamicText).toContain(
        'Tipo de dano: Elétrico'
      );
    });

    it('ficha salva sem a RD a recebe pelo tipo gravado no texto', () => {
      const legacy = base();
      const toLegacy = (ability: (typeof legacy.classe.abilities)[number]) =>
        ability.name === 'Linhagem Dracônica'
          ? {
              ...ability,
              // Formato do assistente antes da correção.
              text: 'Um de seus antepassados foi um majestoso dragão. Tipo escolhido: Frio. Você soma seu modificador de Carisma em seus pontos de vida iniciais e recebe resistência ao tipo de dano escolhido 5.',
              sheetBonuses: ability.sheetBonuses?.filter(
                (b) => b.target.type !== 'DamageReduction'
              ),
            }
          : ability;
      legacy.classe.abilities = legacy.classe.abilities.map(toLegacy);
      legacy.classe.originalAbilities =
        legacy.classe.originalAbilities?.map(toLegacy);

      normalizeSheet(legacy);
      const result = recalculateSheet(legacy);

      expect(result.reducaoDeDano?.Frio).toBe(5);
      expect(result.reducaoDeDano?.Eletricidade).toBeUndefined();
    });
  });

  describe('Linhagem Rubra', () => {
    it('as heranças contam como poder da Tormenta, sem perda de Carisma', () => {
      const sheet = withHerancas(
        buildFeiticeiro({ feiticeiroLinhagem: 'Linhagem Rubra' }),
        HERANCA_APRIMORADA,
        HERANCA_SUPERIOR
      );

      [HERANCA_APRIMORADA, HERANCA_SUPERIOR].forEach((name) => {
        const power = powerNamed(sheet, name);
        expect(power?.countAsTormentaPower).toBe(true);
        expect(power?.tormentaCountExcludesCharisma).toBe(true);
      });
    });

    it('Superior dá +4 PM por poder da Tormenta', () => {
      const sheet = withHerancas(
        buildFeiticeiro({ feiticeiroLinhagem: 'Linhagem Rubra' }),
        HERANCA_SUPERIOR
      );

      expect(
        sheet.sheetBonuses.some(
          (b) =>
            b.source.type === 'power' &&
            b.source.name === HERANCA_SUPERIOR &&
            b.target.type === 'PM'
        )
      ).toBe(true);
    });
  });

  describe('Linhagem Abençoada', () => {
    it('Superior dá +1 em Sabedoria', () => {
      const sheet = buildFeiticeiro({
        feiticeiroLinhagem: 'Linhagem Abençoada',
        linhagemAbencoada: { deus: 'Wynna' },
      });
      const superior = withHerancas(sheet, HERANCA_SUPERIOR);

      expect(attr(superior, Atributo.SABEDORIA)).toBe(
        attr(sheet, Atributo.SABEDORIA) + 1
      );
    });
  });

  it('não mexe em fichas sem linhagem', () => {
    const sheet = buildFeiticeiro({ arcanistaSubtype: 'Mago' });
    const result = withHerancas(sheet, HERANCA_SUPERIOR);

    expect(powerNamed(result, HERANCA_SUPERIOR)?.dynamicText).toBeUndefined();
  });
});
