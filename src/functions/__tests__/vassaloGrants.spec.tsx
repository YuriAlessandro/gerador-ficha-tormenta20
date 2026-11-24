import React from 'react';
import _ from 'lodash';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SuperiorItemField from '@/components/CharacterCreationWizard/steps/SuperiorItemField';
import generateRandomSheet, { applyManualLevelUp } from '../general';
import { recalculateSheet } from '../recalculateSheet';
import { revertLastLevel } from '../revertLevel';
import { normalizeSheet } from '../sheetNormalizer';
import { findClassDescription } from '../multiclass';
import { resolveGrantClasses } from '../powers/powerGrantClasses';
import {
  countRequirementSelections,
  getPowerSelectionRequirements,
} from '../powers/manualPowerSelection';
import {
  buildSuperiorItem,
  getSuperiorItemOptions,
  isSuperiorItemComplete,
} from '../superiorItemGrant';
import { dataRegistry } from '../../data/registry';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { DefenseEquipment } from '../../interfaces/Equipment';
import {
  SelectionOptions,
  SuperiorItemSelection,
} from '../../interfaces/PowerSelections';
import { SupplementId } from '../../types/supplement.types';
import PROFICIENCIAS from '../../data/systems/tormenta20/proficiencias';
import {
  CAMINHO_GOVERNANTE,
  CAMINHO_SOLDADO,
} from '../../data/systems/tormenta20/herois-de-arton/variantClasses/vassalo';

/** Vassalo 3 (Escudeiro Aprendiz), 6 (Cavaleiro do Reino) e 9 (Lorde). */
const supplements = [
  SupplementId.TORMENTA20_CORE,
  SupplementId.TORMENTA20_HEROIS_ARTON,
];
const VASSALO = findClassDescription('Vassalo')!;

const generate = (nivel: number) =>
  recalculateSheet(
    generateRandomSheet({
      nivel,
      raca: 'Anão',
      classe: 'Vassalo',
      origin: 'Aleatório',
      devocao: { label: '--', value: '--' },
      supplements,
    })
  );

const levelUp = (
  sheet: CharacterSheet,
  level: number,
  abilityEffectSelections: Record<string, SelectionOptions> = {}
) =>
  recalculateSheet(
    applyManualLevelUp(sheet, {
      level,
      powerChoice: 'class',
      abilityEffectSelections,
    })
  );

const mod = (name: string, context: 'weapon' | 'defense' = 'weapon') =>
  dataRegistry.getImprovementByName(name, context)!;

const espada: SuperiorItemSelection = {
  group: 'Arma',
  itemName: 'Espada Longa',
  modifications: [mod('Cruel'), mod('Certeira')],
};

const weaponNames = (sheet: CharacterSheet) =>
  sheet.bag.getEquipments().Arma.map((item) => item.nome);

describe('Cavaleiro do Reino (6º)', () => {
  // Nome exato do catálogo, sem depender da grafia
  const swordName = getSuperiorItemOptions('Arma', supplements).find(
    (item) => item.nome.toLowerCase() === 'espada longa'
  )!.nome;
  const selection = { ...espada, itemName: swordName };

  it('só conta como feita com o item e as duas melhorias', () => {
    const ability = VASSALO.abilities.find(
      (a) => a.name === 'Cavaleiro do Reino'
    )!;
    const [req] = getPowerSelectionRequirements(ability)!.requirements;
    const count = (superiorItem?: SuperiorItemSelection) =>
      countRequirementSelections(req, { superiorItem });

    expect(count(undefined)).toBe(0);
    expect(count({ ...selection, itemName: '' })).toBe(0);
    expect(count({ ...selection, modifications: [mod('Cruel')] })).toBe(0);
    expect(count(selection)).toBe(1);
  });

  it('Atroz ocupa as duas melhorias, com o pré-requisito', () => {
    const atroz = { ...selection, modifications: [mod('Cruel'), mod('Atroz')] };
    expect(isSuperiorItemComplete(atroz, 2)).toBe(true);
    const semCruel = [mod('Atroz'), mod('Certeira')];
    expect(
      isSuperiorItemComplete({ ...selection, modifications: semCruel }, 2)
    ).toBe(false);
  });

  it('material especial exige escolher o material', () => {
    const modifications = [mod('Material especial'), mod('Cruel')];
    const semMaterial = { ...selection, modifications };
    expect(isSuperiorItemComplete(semMaterial, 2)).toBe(false);
    expect(
      isSuperiorItemComplete({ ...semMaterial, material: 'adamante' }, 2)
    ).toBe(true);
  });

  it('entra na mochila sem trocar um item igual, e Desfazer Nível tira só ele', () => {
    const before = generate(5);
    const plain = _.omit(
      getSuperiorItemOptions('Arma', supplements).find(
        (item) => item.nome === swordName
      )!,
      'id'
    );
    before.bag.setEquipments({
      ...before.bag.getEquipments(),
      Arma: [{ ..._.cloneDeep(plain), nome: swordName }],
    });

    const after = levelUp(before, 6, {
      'Cavaleiro do Reino': { superiorItem: selection },
    });
    expect(weaponNames(after)).toEqual([swordName, swordName]);
    const granted = after.bag
      .getEquipments()
      .Arma.find((item) => item.modifications?.length);
    expect(granted?.modifications?.map((m) => m.mod)).toEqual([
      'Cruel',
      'Certeira',
    ]);
    expect(granted?.atkBonus).toBe((plain.atkBonus ?? 0) + 1);

    // Recalcular não duplica
    expect(weaponNames(recalculateSheet(after))).toHaveLength(2);

    const reverted = revertLastLevel(after);
    expect(weaponNames(reverted)).toEqual([swordName]);
    expect(reverted.bag.getEquipments().Arma[0].modifications).toBeUndefined();
  });

  it('sem escolha não concede nada (ficha antiga recalculada)', () => {
    const before = generate(5);
    const after = levelUp(before, 6);
    expect(weaponNames(after)).toEqual(weaponNames(before));
  });

  it('a ficha aleatória já sai com o item', () => {
    const sheet = generate(6);
    const items = _.flatten(
      (['Arma', 'Armadura', 'Escudo'] as const).map(
        (group) => sheet.bag.getEquipments()[group]
      )
    );
    const receipt = sheet.sheetActionHistory
      .flatMap((entry) => entry.changes)
      .find((change) => change.type === 'SuperiorItemGranted');
    if (receipt?.type !== 'SuperiorItemGranted') throw new Error('sem item');
    expect(
      items.find((item) => item.id === receipt.itemId)?.modifications
    ).toHaveLength(2);
  });

  it.each(['Arma', 'Armadura', 'Escudo'] as const)('monta %s', (group) => {
    const [option] = getSuperiorItemOptions(group, supplements);
    const item = buildSuperiorItem(
      { group, itemName: option.nome, modifications: [] },
      supplements
    );
    expect(item).toMatchObject({ nome: option.nome, group });
    // O catálogo é compartilhado e não pode ganhar id
    expect(item?.id).not.toBe(option.id);
  });

  it('a tela escolhe item e melhorias e limita a duas', () => {
    let current: SuperiorItemSelection | undefined;
    const Harness = () => {
      const [value, setValue] = React.useState<SuperiorItemSelection>();
      current = value;
      return (
        <SuperiorItemField
          groups={['Arma', 'Armadura', 'Escudo']}
          pick={2}
          supplements={supplements}
          value={value}
          onChange={setValue}
        />
      );
    };
    render(<Harness />);
    const choose = (label: string, option: string) => {
      const input = screen.getByLabelText(label);
      fireEvent.mouseDown(input);
      fireEvent.change(input, { target: { value: option } });
      fireEvent.click(
        within(screen.getByRole('listbox'))
          .getAllByRole('option')
          .find((el) => el.textContent?.startsWith(option))!
      );
    };

    choose('Item', swordName);
    choose('Modificações', 'Cruel');
    choose('Modificações', 'Certeira');
    expect(isSuperiorItemComplete(current, 2)).toBe(true);
    // Sem os suplementos da tela, o item escolhido não pode se perder
    expect(buildSuperiorItem(current!, [])?.nome).toBe(swordName);
    choose('Modificações', 'Equilibrada');
    expect(current?.modifications.map((m) => m.mod)).toEqual([
      'Cruel',
      'Certeira',
    ]);

    fireEvent.click(screen.getByRole('button', { name: 'Escudo' }));
    expect(current).toEqual({
      group: 'Escudo',
      itemName: '',
      modifications: [],
    });
  });
});

describe('Lorde (9º)', () => {
  const grant = VASSALO.powerGrants!.find((g) => g.level === 9)!;

  it('o caminho decide a classe do poder', () => {
    expect(resolveGrantClasses(grant, CAMINHO_SOLDADO)).toEqual(['Guerreiro']);
    expect(resolveGrantClasses(grant, CAMINHO_GOVERNANTE)).toEqual(['Nobre']);
    expect(resolveGrantClasses(grant)).toEqual(['Guerreiro', 'Nobre']);
  });

  it('na ficha aleatória o poder combina com o caminho', () => {
    _.times(15, () => {
      const before = generate(9);
      const path = before.sheetActionHistory
        .flatMap((entry) => entry.changes)
        .find(
          (change) =>
            change.type === 'OptionChosen' &&
            change.optionKey === 'caminhoDoVassalo'
        );
      if (path?.type !== 'OptionChosen') throw new Error('sem caminho');
      const wrong = path.chosenName === CAMINHO_SOLDADO ? 'Nobre' : 'Guerreiro';
      // Guerreiro também é oferecido no 7º, então só o Nobre é inequívoco
      if (wrong === 'Nobre') {
        expect(
          (before.classPowers ?? []).filter((p) => p.className === 'Nobre')
        ).toEqual([]);
      }
    });
  });
});

describe('Escudeiro Aprendiz (3º)', () => {
  const heavy = getSuperiorItemOptions('Armadura', supplements).find(
    (item) => (item as DefenseEquipment).isHeavyArmor
  ) as DefenseEquipment;
  const light = getSuperiorItemOptions('Armadura', supplements).find(
    (item) => !(item as DefenseEquipment).isHeavyArmor
  ) as DefenseEquipment;

  const wearing = (
    proficient: boolean,
    armor: DefenseEquipment
  ): CharacterSheet => {
    const sheet = generate(2);
    sheet.classe.proficiencias = sheet.classe.proficiencias.filter(
      (p) => p !== PROFICIENCIAS.PESADAS
    );
    if (proficient) sheet.classe.proficiencias.push(PROFICIENCIAS.PESADAS);
    sheet.bag.setEquipments({
      ...sheet.bag.getEquipments(),
      Armadura: [{ ..._.cloneDeep(armor), id: 'armadura' }],
    });
    sheet.wornArmorId = 'armadura';
    return recalculateSheet(sheet);
  };

  it('já proficiente: +2 na Defesa com armadura pesada, estável e reversível', () => {
    const before = wearing(true, heavy);
    const after = levelUp(before, 3);
    expect(after.defesa).toBe(before.defesa + 2);
    expect(recalculateSheet(after).defesa).toBe(after.defesa);
    const reverted = revertLastLevel(after);
    expect(reverted.defesa).toBe(before.defesa);
    expect(reverted.classe.proficiencias).toContain(PROFICIENCIAS.PESADAS);
  });

  it('já proficiente, com armadura leve: nada', () => {
    const before = wearing(true, light);
    expect(levelUp(before, 3).defesa).toBe(before.defesa);
  });

  it('não proficiente: ganha a proficiência, sem o +2', () => {
    const before = wearing(false, heavy);
    const after = levelUp(before, 3);
    expect(after.classe.proficiencias).toContain(PROFICIENCIAS.PESADAS);
    expect(after.defesa).toBe(before.defesa);
    expect(recalculateSheet(after).defesa).toBe(before.defesa);
  });
});

describe('ficha salva com a cópia antiga das habilidades', () => {
  it('recebe as ações novas ao abrir, sem ganhar item sozinha', () => {
    const saved = levelUp(generate(5), 6);
    const strip = (list?: typeof saved.classe.abilities) =>
      list?.map((a) =>
        a.name === 'Cavaleiro do Reino' ? _.omit(a, 'sheetActions') : a
      );
    saved.classe.abilities = strip(saved.classe.abilities)!;
    saved.classe.originalAbilities = strip(saved.classe.originalAbilities);
    const weapons = weaponNames(saved);
    const { defesa } = saved;

    normalizeSheet(saved);
    expect(
      saved.classe.originalAbilities?.find(
        (a) => a.name === 'Cavaleiro do Reino'
      )?.sheetActions?.[0].action.type
    ).toBe('grantSuperiorItem');
    const opened = recalculateSheet(saved);
    expect(weaponNames(opened)).toEqual(weapons);
    expect(opened.defesa).toBe(defesa);
  });
});
