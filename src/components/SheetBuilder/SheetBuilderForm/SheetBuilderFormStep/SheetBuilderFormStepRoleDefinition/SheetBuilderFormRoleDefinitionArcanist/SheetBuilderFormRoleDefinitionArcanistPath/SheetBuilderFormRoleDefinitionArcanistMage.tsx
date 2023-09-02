import {
  SerializedArcanist,
  SerializedArcanistMage,
  SpellCircle,
  Spells,
  Translator,
} from 't20-sheet-builder';
import React, { useEffect } from 'react';
import SheetBuilderFormSelect from '@/components/SheetBuilder/SheetBuilderForm/SheetBuilderFormSelect';
import { selectBuilderRole } from '@/store/slices/sheetBuilder/sheetBuilderSliceRoleDefinition';
import { useSelector } from 'react-redux';
import { useArcanistFormContext } from '../SheetBuilderFormRoleDefinitionArcanistContext';

const SheetBuilderFormRoleDefinitionArcanistMage = () => {
  const storedArcanist = useSelector(selectBuilderRole) as
    | SerializedArcanist<SerializedArcanistMage>
    | undefined;
  const { mageSpell, setMageSpell } = useArcanistFormContext();

  useEffect(() => {
    if (storedArcanist) setMageSpell(storedArcanist.path.extraSpell);
  }, [storedArcanist]);

  const options = Object.values(Spells.getAll())
    .filter((spell) => spell.circle === SpellCircle.first)
    .map(({ spellName }) => ({
      value: spellName,
      label: Translator.getSpellTranslation(spellName),
    }));

  const selectedValue = options.find((option) => option.value === mageSpell);

  return (
    <div>
      <p>Você recebe uma magia adicional</p>
      <SheetBuilderFormSelect
        options={options}
        value={selectedValue}
        onChange={(option) => setMageSpell(option?.value)}
        className='mb-3'
        placeholder='Escolha uma magia'
        id='arcanist-mage-spell-select'
      />
    </div>
  );
};

export default SheetBuilderFormRoleDefinitionArcanistMage;
