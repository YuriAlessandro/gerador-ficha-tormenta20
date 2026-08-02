import { cloneDeep } from 'lodash';
import generateRandomSheet, {
  applyManualLevelUp,
  restoreSpellPath,
} from '../general';
import { recalculateSheet } from '../recalculateSheet';
import {
  findClassDescription,
  getBaseAbilitiesForLevelUp,
} from '../multiclass';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import { dataRegistry } from '../../data/registry';
import { LevelUpSelections } from '../../interfaces/WizardSelections';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { SupplementId } from '../../types/supplement.types';
import { DIVINDADES } from '../../data/systems/tormenta20/divindades';
import SelectOptions from '../../interfaces/SelectedOptions';
import {
  applyLinhagemAbencoadaToSpellPath,
  createLinhagemAbencoada,
  getArcanistaSpellPath,
} from '../../data/systems/tormenta20/classes/arcanista';

/**
 * Linhagem Abençoada (Deuses de Arton, pág. 33): "No 2º nível, você recebe um
 * poder concedido do deus escolhido, aprovado pelo mestre, sem precisar ser
 * devoto dele".
 *
 * Dois pontos: o poder NÃO existe no 1º nível, e quem escolhe qual poder é o
 * jogador — não o sorteio. O bug era que `findClassDescription` sempre resolve
 * a entrada do REGISTRY da classe principal, que não tem as habilidades
 * injetadas pelo setup; o `selectedClassDesc || sheet.classe` então silenciava
 * a ficha e a habilidade de nível 2 nunca chegava ao wizard.
 */

const DEUS = 'Khalmyr';
const PODERES_DO_DEUS = DIVINDADES.find((d) => d.name === DEUS)!.poderes;

function makeFeiticeiroAbencoado(nivel: number): CharacterSheet {
  const arcanista = findClassDescription('Arcanista')!;
  const sheet = createMockCharacterSheet();
  sheet.nivel = nivel;
  sheet.classe = cloneDeep(arcanista);
  sheet.classe.subname = 'Feiticeiro';
  sheet.classe.spellPath = applyLinhagemAbencoadaToSpellPath(
    getArcanistaSpellPath('Feiticeiro')
  );
  const linhagem = createLinhagemAbencoada(DEUS);
  // `originalAbilities` guarda o catálogo completo; `abilities` fica filtrado
  // pelo nível, como o `applyClassAbilities` deixa a ficha.
  sheet.classe.originalAbilities = [...sheet.classe.abilities, ...linhagem];
  sheet.classe.abilities = sheet.classe.originalAbilities.filter(
    (ability) => ability.nivel <= nivel
  );
  sheet.classLevels = Array.from({ length: nivel }, (_unused, index) => ({
    level: index + 1,
    className: 'Arcanista',
    classSubname: 'Feiticeiro',
  }));
  return sheet;
}

const nomesDosPoderesDoDeus = new Set(PODERES_DO_DEUS.map((p) => p.name));

describe('Poder concedido da Linhagem Abençoada', () => {
  it('não é concedido no 1º nível', () => {
    const sheet = makeFeiticeiroAbencoado(1);
    const recalculated = recalculateSheet(sheet);

    const concedidos = recalculated.generalPowers.filter((p) =>
      nomesDosPoderesDoDeus.has(p.name)
    );
    expect(concedidos).toEqual([]);
    expect(
      recalculated.classe.abilities.some(
        (a) => a.name === 'Linhagem Abençoada (Poder Concedido)'
      )
    ).toBe(false);
  });

  it('no 2º nível respeita o poder escolhido pelo jogador', () => {
    const sheet = makeFeiticeiroAbencoado(1);
    const escolhido = PODERES_DO_DEUS[1];

    const selections: LevelUpSelections = {
      level: 2,
      powerChoice: 'class',
      abilityEffectSelections: {
        'Linhagem Abençoada (Poder Concedido)': { powers: [escolhido] },
      },
    };

    const result = applyManualLevelUp(sheet, selections);

    const concedidos = result.generalPowers.filter((p) =>
      nomesDosPoderesDoDeus.has(p.name)
    );
    expect(concedidos.map((p) => p.name)).toEqual([escolhido.name]);
  });

  it('o recálculo posterior não troca nem duplica o poder escolhido', () => {
    const sheet = makeFeiticeiroAbencoado(1);
    const escolhido = PODERES_DO_DEUS[1];

    const leveled = applyManualLevelUp(sheet, {
      level: 2,
      powerChoice: 'class',
      abilityEffectSelections: {
        'Linhagem Abençoada (Poder Concedido)': { powers: [escolhido] },
      },
    });
    // MainScreen recalcula a ficha depois do wizard, SEM as seleções manuais.
    const recalculated = recalculateSheet(leveled);

    const concedidos = recalculated.generalPowers.filter((p) =>
      nomesDosPoderesDoDeus.has(p.name)
    );
    expect(concedidos.map((p) => p.name)).toEqual([escolhido.name]);
  });
});

describe('getBaseAbilitiesForLevelUp', () => {
  it('classe principal: inclui as habilidades injetadas no setup', () => {
    const sheet = makeFeiticeiroAbencoado(1);
    const registryArcanista = findClassDescription('Arcanista')!;

    const abilities = getBaseAbilitiesForLevelUp(
      sheet.classe,
      registryArcanista,
      'Arcanista'
    );

    expect(
      abilities.some((a) => a.name === 'Linhagem Abençoada (Poder Concedido)')
    ).toBe(true);
    // E não perde as habilidades normais da classe.
    expect(abilities.some((a) => a.name === 'Magias')).toBe(true);
  });

  it('classe secundária (multiclasse): usa as do registry', () => {
    const sheet = makeFeiticeiroAbencoado(3);
    const guerreiro = findClassDescription('Guerreiro')!;

    const abilities = getBaseAbilitiesForLevelUp(
      sheet.classe,
      guerreiro,
      'Guerreiro'
    );

    expect(
      abilities.some((a) => a.name === 'Linhagem Abençoada (Poder Concedido)')
    ).toBe(false);
    expect(abilities.length).toBeGreaterThan(0);
  });
});

describe('Geração aleatória de Feiticeiro Abençoado', () => {
  const SUPPLEMENTS = [
    SupplementId.TORMENTA20_CORE,
    SupplementId.TORMENTA20_DEUSES_ARTON,
  ];

  function generateAbencoados(nivel: number, tries: number): CharacterSheet[] {
    const options: SelectOptions = {
      nivel,
      raca: 'Humano',
      classe: 'Arcanista',
      origin: '',
      devocao: { label: '--', value: '--' },
      supplements: SUPPLEMENTS,
    };
    const sheets: CharacterSheet[] = [];
    for (let i = 0; i < tries; i += 1) {
      const sheet = generateRandomSheet(options);
      const isAbencoado = (sheet.classe.originalAbilities || []).some(
        (a) => a.name === 'Linhagem Abençoada'
      );
      if (isAbencoado) sheets.push(sheet);
    }
    return sheets;
  }

  it('nível 1: 4 magias e nenhum poder concedido da linhagem', () => {
    const sheets = generateAbencoados(1, 60);
    expect(sheets.length).toBeGreaterThan(0);

    sheets.forEach((sheet) => {
      expect(sheet.spells.length).toBeGreaterThanOrEqual(4);
      expect(
        sheet.classe.abilities.some(
          (a) => a.name === 'Linhagem Abençoada (Poder Concedido)'
        )
      ).toBe(false);
    });
  });

  it('recarregar a ficha preserva 4 magias iniciais e o teto de círculo', () => {
    const [sheet] = generateAbencoados(1, 60);
    expect(sheet).toBeDefined();

    // Round-trip: a serialização perde as funções do spellPath.
    const reloaded: CharacterSheet = JSON.parse(JSON.stringify(sheet));
    restoreSpellPath(
      reloaded,
      dataRegistry.getClassesBySupplements(SUPPLEMENTS)
    );

    expect(reloaded.classe.spellPath?.initialSpells).toBe(4);
    expect(reloaded.classe.spellPath?.crossTraditionRules?.maxCircle).toBe(1);
    expect(reloaded.classe.spellPath?.includeDivineSchools?.length).toBe(8);
  });
});
