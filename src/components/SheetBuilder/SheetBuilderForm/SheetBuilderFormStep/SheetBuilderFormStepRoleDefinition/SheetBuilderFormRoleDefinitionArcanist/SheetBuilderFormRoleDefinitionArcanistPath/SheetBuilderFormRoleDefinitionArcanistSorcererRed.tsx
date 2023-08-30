import {
  Attribute,
  GeneralPowerName,
  SerializedArcanist,
  SerializedArcanistLineageRed,
  SerializedArcanistSorcerer,
  TormentaPowers,
  Translator,
} from 't20-sheet-builder';
import React, { useEffect } from 'react';
import SheetBuilderFormSelect from '@/components/SheetBuilder/SheetBuilderForm/SheetBuilderFormSelect';
import { attributesOptions } from '@/components/SheetBuilder/common/Options';
import { Option } from '@/components/SheetBuilder/common/Option';
import { useSelector } from 'react-redux';
import { selectBuilderRole } from '@/store/slices/sheetBuilder/sheetBuilderSliceRoleDefinition';
import { useArcanistFormContext } from '../SheetBuilderFormRoleDefinitionArcanistContext';

const tormentaPowersOptions: Option<GeneralPowerName>[] =
  TormentaPowers.getAll().map((Power) => ({
    label: Translator.getTranslation(Power.powerName),
    value: Power.powerName,
  }));

const SheetBuilderFormRoleDefinitionArcanistSorcererRed = () => {
  const {
    sorcererLineageRedAttribute,
    sorcererLineageRedExtraPower,
    setSorcererLineageRedAttribute,
    setSorcererLineageRedExtraPower,
  } = useArcanistFormContext();

  const storedArcanist = useSelector(selectBuilderRole) as
    | SerializedArcanist<
        SerializedArcanistSorcerer<SerializedArcanistLineageRed>
      >
    | undefined;

  useEffect(() => {
    if (storedArcanist) {
      setSorcererLineageRedAttribute(
        storedArcanist.path.lineage.customTormentaAttribute
      );
      setSorcererLineageRedExtraPower(storedArcanist.path.lineage.extraPower);
    }
  }, [storedArcanist]);

  const attributeOptions = attributesOptions.filter(
    (option) => option.value !== 'charisma'
  );

  const selectedTormentaPower = tormentaPowersOptions.find(
    (option) => option.value === sorcererLineageRedExtraPower
  );

  const selectedAttribute = attributeOptions.find(
    (option) => option.value === sorcererLineageRedAttribute
  );

  return (
    <div className='mb-3'>
      <p>Você recebe um poder da tormenta</p>
      <SheetBuilderFormSelect
        id='arcanist-sorcerer-red-extra-power'
        options={tormentaPowersOptions}
        value={selectedTormentaPower}
        onChange={(option) => setSorcererLineageRedExtraPower(option?.value)}
        placeholder='Escolha um poder da tormenta'
      />
      <p>
        Além disso pode perder outro atributo em vez de Carisma por poderes de
        tormenta
      </p>
      <SheetBuilderFormSelect
        id='arcanist-sorcerer-red-custom-attribute'
        options={attributeOptions}
        value={selectedAttribute}
        onChange={(option) =>
          setSorcererLineageRedAttribute(option?.value as Attribute)
        }
        defaultValue={{ label: 'Carisma', value: 'charisma' }}
        placeholder='Escolha um atributo (opcional)'
        isClearable
      />
    </div>
  );
};

export default SheetBuilderFormRoleDefinitionArcanistSorcererRed;
