import React, { useEffect, useState } from 'react';
import {
  getSheetEquipments,
  submitInitialEquipment,
} from '@/store/slices/sheetBuilder/sheetBuilderSliceInitialEquipment';
import { selectPreviewProficiencies } from '@/store/slices/sheetBuilder/sheetBuilderSliceSheetPreview';
import { setOptionReady } from '@/store/slices/sheetBuilder/sheetBuilderSliceStepConfirmed';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArmorName,
  EquipmentName,
  MartialWeaponName,
  Proficiency,
  SimpleWeaponName,
  Translator,
} from 't20-sheet-builder';
import { selectBuilderRole } from '../../../../../store/slices/sheetBuilder/sheetBuilderSliceRoleDefinition';
import ConfirmButton from '../../ConfirmButton';
import DefensiveWeaponSelect from './DefenseEquipmentSelect';
import MartialWeaponSelect from './MartialWeaponSelect';
import SimpleWeaponSelect from './SimpleWeaponSelect';

const defaultEquipment = [
  EquipmentName.backpack,
  EquipmentName.sleepingBag,
  EquipmentName.travelerCostume,
];

const SheetBuilderFormStepEquipmentDefinition = () => {
  const storedEquipment = useSelector(getSheetEquipments);

  const [selectedSimpleWeapon, setSelectedSimpleWeapon] =
    useState<SimpleWeaponName>();
  const [selectedMartialWeapon, setSelectedMartialWeapon] =
    useState<MartialWeaponName>();
  const [selectedArmor, setSelectedArmor] = useState<ArmorName>();

  const dispatch = useDispatch();
  const role = useSelector(selectBuilderRole);
  const proficiencies = useSelector(selectPreviewProficiencies);

  const confirm = () => {
    if (!selectedSimpleWeapon) return;
    dispatch(
      setOptionReady({
        key: 'isEquipmentReady',
        value: 'confirmed',
      })
    );
    dispatch(
      submitInitialEquipment({
        simpleWeapon: { name: selectedSimpleWeapon },
        martialWeapon: selectedMartialWeapon
          ? { name: selectedMartialWeapon }
          : undefined,
        armor: selectedArmor ? { name: selectedArmor } : undefined,
      })
    );
  };

  useEffect(() => {
    // console.log(storedEquipment);
    if (storedEquipment) {
      setSelectedSimpleWeapon(storedEquipment.simpleWeapon?.name);
      setSelectedMartialWeapon(storedEquipment.martialWeapon?.name);
      setSelectedArmor(storedEquipment.armor?.name);
    }
  }, [storedEquipment]);

  const hasMartialWeaponProficiency = proficiencies.find(
    (proficiency) => Proficiency.martial === proficiency
  );

  const hasLightArmorProficiency = proficiencies.find(
    (proficiency) => Proficiency.lightArmor === proficiency
  );

  const hasHeavyArmorProficiency = proficiencies.find(
    (proficiency) => Proficiency.heavyArmor === proficiency
  );

  return (
    <div>
      <div className='mb-6'>
        {role ? (
          <div>
            <SimpleWeaponSelect
              selectedSimpleWeapon={selectedSimpleWeapon}
              setSelected={(selected) => {
                dispatch(
                  setOptionReady({
                    key: 'isEquipmentReady',
                    value: 'pending',
                  })
                );
                setSelectedSimpleWeapon(selected);
              }}
            />
            {hasMartialWeaponProficiency && (
              <MartialWeaponSelect
                selectedMartialWeapon={selectedMartialWeapon}
                setSelected={(selected) => {
                  dispatch(
                    setOptionReady({
                      key: 'isEquipmentReady',
                      value: 'pending',
                    })
                  );
                  setSelectedMartialWeapon(selected);
                }}
              />
            )}
            <DefensiveWeaponSelect
              selectedArmor={selectedArmor}
              setSelected={(selected) => {
                dispatch(
                  setOptionReady({
                    key: 'isEquipmentReady',
                    value: 'pending',
                  })
                );
                setSelectedArmor(selected);
              }}
              hasLightArmorProficiency={
                hasLightArmorProficiency
                  ? hasLightArmorProficiency.length > 0
                  : false
              }
              hasHeavyArmorProficiency={
                hasHeavyArmorProficiency
                  ? hasHeavyArmorProficiency.length > 0
                  : false
              }
            />
            <ConfirmButton confirm={confirm} />
          </div>
        ) : (
          <div>
            <p>
              Confirme uma classe para poder escolher suas armas e armaduras.
            </p>
          </div>
        )}
      </div>
      <div className='mb-6 flex'>
        <div className='bg-white p-5 rounded-md'>
          <h3 className='mb-3 text-rose-600 font-bold'>Equipamento Padrão</h3>
          <ul className='text-slate-950'>
            {defaultEquipment.map((equipment) => (
              <li key={equipment}>
                {Translator.getEquipmentTranslation(equipment)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SheetBuilderFormStepEquipmentDefinition;
