import {
  SerializedArcanist,
  SerializedArcanistLineageFaerie,
  SerializedArcanistSorcerer,
  SpellCircle,
  SpellName,
  SpellSchool,
  Spells,
  Translator,
} from 't20-sheet-builder';
import React, { useEffect } from 'react';
import { Option } from '@/components/SheetBuilder/common/Option';
import SheetBuilderFormSelect from '@/components/SheetBuilder/SheetBuilderForm/SheetBuilderFormSelect';
import { useSelector } from 'react-redux';
import { selectBuilderRole } from '@/store/slices/sheetBuilder/sheetBuilderSliceRoleDefinition';
import { useArcanistFormContext } from '../SheetBuilderFormRoleDefinitionArcanistContext';

const spellOptions: Option<SpellName>[] = Spells.getAll()
  .filter(
    (spell) =>
      spell.circle === SpellCircle.first &&
      (spell.school === SpellSchool.illusion ||
        spell.school === SpellSchool.enchantment)
  )
  .map<Option<SpellName>>((Spell) => ({
    label: Translator.getSpellTranslation(Spell.spellName),
    value: Spell.spellName,
  }));

const SheetBuilderFormRoleDefinitionArcanistSorcererFaerie = () => {
  const storedArcanist = useSelector(selectBuilderRole) as
    | SerializedArcanist<
        SerializedArcanistSorcerer<SerializedArcanistLineageFaerie>
      >
    | undefined;
  const {
    sorcererLineageFaerieExtraSpell,
    setSorcererLineageFaerieExtraSpell,
  } = useArcanistFormContext();

  useEffect(() => {
    if (storedArcanist) {
      setSorcererLineageFaerieExtraSpell(
        storedArcanist.path.lineage.extraSpell
      );
    }
  }, [storedArcanist]);

  const selectedValue = spellOptions.find(
    (option) => option.value === sorcererLineageFaerieExtraSpell
  );

  return (
    <div className='mb-3'>
      <p>Você se torna treinado em enganação</p>
      <p className='mb-3'>
        Você aprende uma magia de 1º círculo de encantamento ou ilusão, arcana
        ou divina, a sua escolha
      </p>
      <SheetBuilderFormSelect
        id='arcanist-sorcerer-faerie-extra-spell'
        options={spellOptions}
        placeholder='Escolha a magia'
        value={selectedValue}
        onChange={(option) => setSorcererLineageFaerieExtraSpell(option?.value)}
      />
    </div>
  );
};

export default SheetBuilderFormRoleDefinitionArcanistSorcererFaerie;
