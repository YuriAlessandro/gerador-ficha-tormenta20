import { cloneDeep } from 'lodash';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { allSpellSchools, Spell, SpellSchool } from '../../interfaces/Spells';
import { findClassDescription, serializeSpellPath } from '../multiclass';
import { getSchoolChoiceConfig } from '../spellPathUtils';
import { collectSheetPowers } from '../powers/collectSheetPowers';
import { getPowerText } from '../powers/powerText';
import {
  buildSpellSchoolUpdates,
  describeChosenSpellSchools,
  getAllowedSpellSchools,
  getEditableSchoolTargets,
  getSpellsFromRemovedSchools,
} from '../spells/spellSchoolEditing';

const SCHOOLS: SpellSchool[] = ['Abjur', 'Evoc', 'Necro'];

function makeSheet(className: string): CharacterSheet {
  const sheet = createMockCharacterSheet();
  const classDesc = cloneDeep(findClassDescription(className)!);
  sheet.classe = classDesc.setup ? classDesc.setup(classDesc) : classDesc;
  sheet.classe.spellPath!.schools = [...SCHOOLS];
  sheet.steps = [];
  return sheet;
}

describe('getSchoolChoiceConfig', () => {
  it('Bardo, Druida e variantes escolhem 3 escolas dentre todas', () => {
    ['Bardo', 'Druida', 'Magimarcialista', 'Ermitão'].forEach((name) => {
      const classDesc = findClassDescription(name);
      expect(classDesc).toBeDefined();
      expect(getSchoolChoiceConfig(classDesc!)).toEqual({
        count: 3,
        available: allSpellSchools,
      });
    });
  });

  it('classes sem escolha de escolas retornam null', () => {
    ['Guerreiro', 'Clérigo', 'Arcanista'].forEach((name) => {
      expect(getSchoolChoiceConfig(findClassDescription(name)!)).toBeNull();
    });
  });

  it('homebrew usa schoolChoice, limitado ao tamanho do pool', () => {
    expect(
      getSchoolChoiceConfig({
        name: 'Homebrew',
        spellPath: {
          initialSpells: 2,
          spellType: 'Arcane',
          qtySpellsLearnAtLevel: () => 1,
          spellCircleAvailableAtLevel: () => 1,
          keyAttribute: Atributo.INTELIGENCIA,
          schoolChoice: { count: 4, available: ['Evoc', 'Trans'] },
        },
      })
    ).toEqual({ count: 2, available: ['Evoc', 'Trans'] });
  });
});

describe('getEditableSchoolTargets', () => {
  it('inclui a classe principal com as escolas atuais', () => {
    const targets = getEditableSchoolTargets(makeSheet('Bardo'));
    expect(targets).toHaveLength(1);
    expect(targets[0]).toMatchObject({
      className: 'Bardo',
      isMainClass: true,
      schools: SCHOOLS,
    });
  });

  it('não inclui classes sem escolha de escolas', () => {
    const sheet = createMockCharacterSheet();
    sheet.classe = cloneDeep(findClassDescription('Guerreiro')!);
    expect(getEditableSchoolTargets(sheet)).toEqual([]);
  });

  it('inclui multiclasse Druida e ignora multiclasse sem escolha', () => {
    const sheet = createMockCharacterSheet();
    sheet.classe = cloneDeep(findClassDescription('Guerreiro')!);
    const druida = makeSheet('Druida').classe.spellPath!;
    sheet.multiclassSpellPaths = {
      Druida: serializeSpellPath(druida, 'Druida'),
    };
    const targets = getEditableSchoolTargets(sheet);
    expect(targets).toHaveLength(1);
    expect(targets[0]).toMatchObject({
      className: 'Druida',
      isMainClass: false,
      schools: SCHOOLS,
    });
  });
});

describe('buildSpellSchoolUpdates', () => {
  it('sem mudança não gera atualização', () => {
    const sheet = makeSheet('Bardo');
    expect(buildSpellSchoolUpdates(sheet, {})).toEqual({});
    expect(
      buildSpellSchoolUpdates(sheet, { Bardo: ['Necro', 'Abjur', 'Evoc'] })
    ).toEqual({});
  });

  it('classe principal: troca as escolas preservando as funções do spellPath', () => {
    const sheet = makeSheet('Bardo');
    const next: SpellSchool[] = ['Abjur', 'Evoc', 'Ilusão'];
    const updates = buildSpellSchoolUpdates(sheet, { Bardo: next });

    expect(updates.classe?.spellPath?.schools).toEqual(next);
    expect(typeof updates.classe?.spellPath?.qtySpellsLearnAtLevel).toBe(
      'function'
    );
    // Não muta a ficha original
    expect(sheet.classe.spellPath?.schools).toEqual(SCHOOLS);
    expect(updates.steps?.at(-1)).toEqual({
      label: 'Edição Manual - Escolas de Magia',
      type: 'Magias',
      value: [{ name: 'Bardo', value: 'Abjur, Evoc, Ilusão' }],
    });
  });

  it('multiclasse: atualiza multiclassSpellPaths e multiclassSetups', () => {
    const sheet = createMockCharacterSheet();
    sheet.classe = cloneDeep(findClassDescription('Guerreiro')!);
    sheet.steps = [];
    sheet.multiclassSpellPaths = {
      Druida: serializeSpellPath(
        makeSheet('Druida').classe.spellPath!,
        'Druida'
      ),
    };
    sheet.multiclassSetups = { Druida: { spellSchools: [...SCHOOLS] } };

    const next: SpellSchool[] = ['Conv', 'Evoc', 'Trans'];
    const updates = buildSpellSchoolUpdates(sheet, { Druida: next });

    expect(updates.classe).toBeUndefined();
    expect(updates.multiclassSpellPaths?.Druida.schools).toEqual(next);
    expect(updates.multiclassSpellPaths?.Druida.className).toBe('Druida');
    expect(updates.multiclassSetups?.Druida.spellSchools).toEqual(next);
  });
});

describe('getSpellsFromRemovedSchools', () => {
  const spell = (nome: string, school: SpellSchool) =>
    ({ nome, school } as Spell);
  const spells = [
    spell('Escudo da Fé', 'Abjur'),
    spell('Seta Infalível', 'Evoc'),
  ];

  it('lista as magias das escolas removidas', () => {
    expect(
      getSpellsFromRemovedSchools(spells, SCHOOLS, ['Evoc', 'Necro', 'Trans'])
    ).toEqual([spells[0]]);
  });

  it('sem escola removida, lista vazia', () => {
    expect(getSpellsFromRemovedSchools(spells, SCHOOLS, SCHOOLS)).toEqual([]);
  });
});

describe('getAllowedSpellSchools', () => {
  it('Bardo: só as escolas escolhidas, com o rascunho prevalecendo', () => {
    const sheet = makeSheet('Bardo');
    expect(getAllowedSpellSchools(sheet)).toEqual(SCHOOLS);
    expect(getAllowedSpellSchools(sheet, { Bardo: ['Trans'] })).toEqual([
      'Trans',
    ]);
    // Rascunho vazio restringe tudo, não libera
    expect(getAllowedSpellSchools(sheet, { Bardo: [] })).toEqual([]);
  });

  it('sem classe conjuradora não há restrição', () => {
    const sheet = createMockCharacterSheet();
    sheet.classe = cloneDeep(findClassDescription('Guerreiro')!);
    delete sheet.classe.spellPath;
    expect(getAllowedSpellSchools(sheet)).toBeNull();
  });

  it('multiclasse com classe que aprende de todas as escolas não restringe', () => {
    const sheet = makeSheet('Bardo');
    const clerigo = findClassDescription('Clérigo')!;
    const clerigoPath = clerigo.setup!(cloneDeep(clerigo)).spellPath!;
    sheet.multiclassSpellPaths = {
      Clérigo: serializeSpellPath(clerigoPath, 'Clérigo'),
    };
    expect(getAllowedSpellSchools(sheet)).toBeNull();
  });

  it('Bardo + Druida: união das escolas', () => {
    const sheet = makeSheet('Bardo');
    const druida = makeSheet('Druida').classe.spellPath!;
    sheet.multiclassSpellPaths = {
      Druida: { ...serializeSpellPath(druida, 'Druida'), schools: ['Trans'] },
    };
    expect(getAllowedSpellSchools(sheet)?.sort()).toEqual(
      [...SCHOOLS, 'Trans'].sort()
    );
  });
});

describe('escolas no texto da habilidade Magias', () => {
  it('descreve as escolas por extenso', () => {
    expect(describeChosenSpellSchools(['Abjur', 'Evoc', 'Necro'])).toBe(
      'Escolas escolhidas: Abjuração, Evocação e Necromancia.'
    );
    expect(describeChosenSpellSchools(['Trans'])).toBe(
      'Escolas escolhidas: Transmutação.'
    );
  });

  it('a habilidade Magias do Bardo mostra as escolas atuais', () => {
    const sheet = makeSheet('Bardo');
    const magias = () =>
      collectSheetPowers(sheet).powers.find((p) => p.name === 'Magias')!;

    expect(getPowerText(magias())).toMatch(
      /Escolha três escolas de magia\..*Escolas escolhidas: Abjuração, Evocação e Necromancia\.$/
    );

    // Segue a edição sem precisar reescrever o texto gravado
    sheet.classe.spellPath!.schools = ['Ilusão', 'Trans', 'Conv'];
    expect(getPowerText(magias())).toMatch(
      /Escolas escolhidas: Ilusão, Transmutação e Convocação\.$/
    );
    const stored = sheet.classe.abilities.find((a) => a.name === 'Magias')!;
    expect(stored.text).not.toContain('Escolas escolhidas');
  });

  it('classes sem escolha de escolas não mudam o texto', () => {
    const sheet = createMockCharacterSheet();
    sheet.classe = cloneDeep(findClassDescription('Clérigo')!);
    const magias = collectSheetPowers(sheet).powers.find(
      (p) => p.name === 'Magias'
    );
    if (magias)
      expect(getPowerText(magias)).not.toContain('Escolas escolhidas');
  });
});
