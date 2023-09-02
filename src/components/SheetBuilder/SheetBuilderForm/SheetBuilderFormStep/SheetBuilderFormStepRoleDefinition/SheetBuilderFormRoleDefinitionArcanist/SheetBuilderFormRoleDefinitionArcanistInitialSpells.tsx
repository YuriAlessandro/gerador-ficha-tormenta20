import {
  SerializedArcanist,
  SpellCircle,
  Spells,
  Translator,
} from 't20-sheet-builder';
import React, { useEffect, useMemo } from 'react';
import SheetBuilderFormSelect from '@/components/SheetBuilder/SheetBuilderForm/SheetBuilderFormSelect';
import { setOptionReady } from '@/store/slices/sheetBuilder/sheetBuilderSliceStepConfirmed';
import { useDispatch, useSelector } from 'react-redux';
import { selectBuilderRole } from '@/store/slices/sheetBuilder/sheetBuilderSliceRoleDefinition';
import { useArcanistFormContext } from './SheetBuilderFormRoleDefinitionArcanistContext';

const SheetBuilderFormRoleDefinitionArcanistInitialSpells = () => {
  const role = useSelector(selectBuilderRole) as SerializedArcanist | undefined;
  const { initialSpells, setInitialSpells } = useArcanistFormContext();

  const spellsOptions = useMemo(
    () =>
      Object.values(Spells.getAll())
        .filter((spell) => spell.circle === SpellCircle.first)
        .map(({ spellName }) => ({
          value: spellName,
          label: Translator.getSpellTranslation(spellName),
        })),
    []
  );

  const storedSpells = useMemo(
    () =>
      spellsOptions.filter((option) =>
        role?.initialSpells.includes(option.value)
      ),
    [spellsOptions]
  );

  useEffect(() => {
    if (storedSpells) setInitialSpells(storedSpells.map(({ value }) => value));
  }, [storedSpells]);

  const dispatch = useDispatch();

  return (
    <div>
      <p>
        Você começa com 3 magias de primeiro círculo ({initialSpells.length}/3)
      </p>
      <SheetBuilderFormSelect
        options={spellsOptions}
        isMulti
        value={initialSpells.map((spell) => ({
          value: spell,
          label: Translator.getSpellTranslation(spell),
        }))}
        onChange={(options) => {
          dispatch(setOptionReady({ key: 'isRoleReady', value: 'pending' }));
          setInitialSpells(options.map(({ value }) => value));
        }}
        className='mb-3'
        placeholder='Escolha as magias'
        id='arcanist-initial-spells-select'
        isOptionDisabled={() => initialSpells.length >= 3}
      />
    </div>
  );
};

export default SheetBuilderFormRoleDefinitionArcanistInitialSpells;
