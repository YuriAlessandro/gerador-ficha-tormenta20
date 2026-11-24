import { createMockCharacterSheet } from '../../../../__mocks__/characterSheet';
import CharacterSheet from '../../../../interfaces/CharacterSheet';
import Equipment from '../../../../interfaces/Equipment';
import { GeneralPower } from '../../../../interfaces/Poderes';
import {
  spellsCircle1,
  spellsCircle2,
} from '../../../../data/systems/tormenta20/magias/generalSpells';
import magicPowers from '../../../../data/systems/tormenta20/powers/spellPowers';
import generateRandomSheet, { applyManualLevelUp } from '../../../general';
import { recalculateSheet } from '../../../recalculateSheet';
import { SupplementId } from '../../../../types/supplement.types';
import {
  applyRollBonus,
  augmentSpellRolls,
} from '../../../spellRollAugmentation';
import { getPowerSpellChoiceInfo } from '../../../../components/LevelUpWizard/steps/PowerSpellChoiceStep';
import {
  applySpellRollModifiers,
  getSheetSpellChoices,
  getSpellChoiceOptions,
  resolveSpellCast,
  setSpellModifierChoices,
} from '..';

const BOLA_DE_FOGO = spellsCircle2.bolaDeFogo;
const SOPRO_DAS_UIVANTES = spellsCircle2.soproDasUivantes;
const SONO = spellsCircle1.sono;
const FOCO = Object.values(magicPowers).find(
  (p) => p.name === 'Foco em Magia'
) as GeneralPower;

const withFoco = (picks: number, spells = [BOLA_DE_FOGO, SONO]) => {
  const sheet = createMockCharacterSheet();
  sheet.generalPowers = Array.from({ length: picks }, () => FOCO);
  sheet.spells = spells;
  return sheet;
};

describe('escolha de magias pelo poder', () => {
  it('lista a escolha da ficha com uma vaga por vez que o poder foi pego', () => {
    const sheet = withFoco(2);
    sheet.spellModifierChoices = { 'Foco em Magia': ['Sono'] };
    const [choice] = getSheetSpellChoices(sheet);
    expect(choice).toMatchObject({
      source: 'Foco em Magia',
      max: 2,
      chosen: ['Sono'],
      of: 'spell',
    });
    expect(
      getSpellChoiceOptions(sheet, choice).map((option) => option.value)
    ).toEqual(['Bola de Fogo', 'Sono']);
  });

  it('valor escolhido sem magia na ficha continua na lista para desmarcar', () => {
    const sheet = withFoco(1, [SONO]);
    sheet.spellModifierChoices = { 'Foco em Magia': ['Bola de Fogo'] };
    const [choice] = getSheetSpellChoices(sheet);
    expect(
      getSpellChoiceOptions(sheet, choice).map((option) => option.value)
    ).toEqual(['Bola de Fogo', 'Sono']);
  });

  it('gravar troca a lista da fonte; vazio remove a chave', () => {
    const sheet = withFoco(1);
    const next = setSpellModifierChoices(sheet, 'Foco em Magia', ['Sono']);
    expect(next).toEqual({ 'Foco em Magia': ['Sono'] });
    expect(
      setSpellModifierChoices(
        { ...sheet, spellModifierChoices: next },
        'Foco em Magia',
        []
      )
    ).toBeUndefined();
  });

  it('Cetro elemental genérico oferece os tipos de dano das magias', () => {
    const sheet = createMockCharacterSheet();
    sheet.spells = [BOLA_DE_FOGO, SOPRO_DAS_UIVANTES, SONO];
    sheet.bag.equipments.Esotérico = [
      { id: 'c', nome: 'Cetro elemental', group: 'Esotérico' } as Equipment,
    ];
    const [choice] = getSheetSpellChoices(sheet);
    expect(getSpellChoiceOptions(sheet, choice)).toEqual([
      { value: 'fogo', spells: ['Bola de Fogo'] },
      { value: 'frio', spells: ['Sopro das Uivantes'] },
    ]);
  });
});

describe('passo da subida de nível', () => {
  it('segunda escolha de Foco em Magia: vaga nova e magia aprendida no nível', () => {
    const sheet = withFoco(1, [SONO]);
    sheet.spellModifierChoices = { 'Foco em Magia': ['Sono'] };
    const info = getPowerSpellChoiceInfo(
      sheet,
      'general',
      FOCO,
      [BOLA_DE_FOGO],
      undefined
    );
    expect(info?.choice).toMatchObject({ max: 2, chosen: ['Sono'] });
    expect(info?.options.map((option) => option.value)).toEqual([
      'Bola de Fogo',
      'Sono',
    ]);
  });

  it('poder sem escolha de magia não abre o passo', () => {
    const sheet = withFoco(0);
    const other = Object.values(magicPowers).find(
      (p) => p.name === 'Magia Acelerada'
    ) as GeneralPower;
    expect(
      getPowerSpellChoiceInfo(sheet, 'general', other, [], undefined)
    ).toBeNull();
  });

  it('applyManualLevelUp grava a escolha do poder do nível', () => {
    const base = recalculateSheet(
      generateRandomSheet({
        nivel: 1,
        raca: 'Humano',
        classe: 'Arcanista',
        origin: 'Aleatório',
        devocao: { label: '--', value: '--' },
        supplements: [SupplementId.TORMENTA20_CORE],
      })
    );
    const spellName = base.spells[0].nome;
    const result = applyManualLevelUp(base, {
      level: 2,
      powerChoice: 'general',
      selectedGeneralPower: FOCO,
      spellModifierChoices: {
        'Foco em Magia': [spellName],
        // Poder que o jogador desistiu de escolher: não entra.
        'Outro Poder': ['Sono'],
      },
    });
    expect(result.spellModifierChoices).toEqual({
      'Foco em Magia': [spellName],
    });
  });
});

describe('Cetro elemental por pedra', () => {
  const withItem = (nome: string): CharacterSheet => {
    const sheet = createMockCharacterSheet();
    sheet.bag.equipments.Esotérico = [
      { id: nome, nome, group: 'Esotérico' } as Equipment,
    ];
    return sheet;
  };

  it('Cetro elemental de fogo soma um dado só no dano de fogo', () => {
    const sheet = withItem('Cetro elemental de fogo');
    const rolls = applySpellRollModifiers(
      augmentSpellRolls(BOLA_DE_FOGO.rolls ?? [], []),
      resolveSpellCast(sheet, BOLA_DE_FOGO)
    );
    expect(rolls[0].dice).toBe('7d6');
    expect(resolveSpellCast(sheet, SOPRO_DAS_UIVANTES).typedDamage).toEqual([]);
    // Sem escolha a fazer: a pedra já vem no item.
    expect(resolveSpellCast(sheet, BOLA_DE_FOGO).spellChoices).toEqual([]);
  });

  it('Cetro elemental de frio vale para o Sopro das Uivantes', () => {
    const sheet = withItem('Cetro elemental de frio');
    const rolls = applySpellRollModifiers(
      augmentSpellRolls(SOPRO_DAS_UIVANTES.rolls ?? [], []),
      resolveSpellCast(sheet, SOPRO_DAS_UIVANTES)
    );
    expect(rolls.find((r) => /frio/i.test(r.label))?.dice).toBe('5d6');
    expect(rolls.find((r) => /impacto/i.test(r.label))?.dice).toBe('2d6');
  });
});

describe('rótulo do bônus por dado', () => {
  it('deixa claro que é +1 ponto por dado, não um dado a mais', () => {
    const roll = {
      label: 'Dano de Frio',
      dice: '4d6',
      baseDice: '4d6',
      isAugmented: false,
    };
    const result = applyRollBonus(roll, 1, 0);
    expect(result.dice).toBe('4d6+4');
    expect(result.addedSummary).toBe('+4 (+1 × 4 dados)');
  });
});
