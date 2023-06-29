import { SpellCircle, Spells, Translator } from 't20-sheet-builder';
import React from 'react';
import SheetBuilderFormSelect from '../../../../SheetBuilderFormSelect';
import { useArcanistFormContext } from '../SheetBuilderFormRoleDefinitionArcanistContext';

const SheetBuilderFormRoleDefinitionArcanistMage = () => {
  const { setMageSpell } = useArcanistFormContext();
  return (
    <div>
      <p>Você recebe uma magia adicional</p>
      <SheetBuilderFormSelect
        options={Object.values(Spells.getAll())
          .filter((spell) => spell.circle === SpellCircle.first)
          .map(({ spellName }) => ({
            value: spellName,
            label: Translator.getSpellTranslation(spellName),
          }))}
        onChange={(option) => setMageSpell(option?.value)}
        className='mb-3'
        placeholder='Escolha uma magia'
        id='arcanist-mage-spell-select'
      />
    </div>
  );
};

export default SheetBuilderFormRoleDefinitionArcanistMage;
