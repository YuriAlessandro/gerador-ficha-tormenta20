import { SpellCircle, Spells, Translator } from 't20-sheet-builder';
import React from 'react';
import SheetBuilderFormSelect from '@/components/SheetBuilder/SheetBuilderForm/SheetBuilderFormSelect';
import { useArcanistFormContext } from './SheetBuilderFormRoleDefinitionArcanistContext';

const SheetBuilderFormRoleDefinitionArcanistInitialSpells = () => {
  const { setInitialSpells } = useArcanistFormContext();
  const [spellsAmount, setSpellsAmount] = React.useState(0);

  return (
    <div>
      <p>Você começa com 3 magias de primeiro círculo ({spellsAmount}/3)</p>
      <SheetBuilderFormSelect
        options={Object.values(Spells.getAll())
          .filter((spell) => spell.circle === SpellCircle.first)
          .map(({ spellName }) => ({
            value: spellName,
            label: Translator.getSpellTranslation(spellName),
          }))}
        isMulti
        onChange={(options) => {
          setSpellsAmount(options.length);
          setInitialSpells(options.map(({ value }) => value));
        }}
        className='mb-3'
        placeholder='Escolha as magias'
        id='arcanist-initial-spells-select'
        isOptionDisabled={() => spellsAmount >= 3}
      />
    </div>
  );
};

export default SheetBuilderFormRoleDefinitionArcanistInitialSpells;
