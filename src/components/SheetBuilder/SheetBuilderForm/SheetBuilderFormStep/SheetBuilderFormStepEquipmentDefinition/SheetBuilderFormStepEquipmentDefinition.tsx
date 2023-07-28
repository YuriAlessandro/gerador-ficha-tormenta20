import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  EquipmentName,
  MartialWeaponName,
  Proficiency,
  SimpleWeaponName,
  Translator,
} from 't20-sheet-builder';
import {
  selectPreviewProficiencies,
  selectPreviewRoleName,
} from '@/store/slices/sheetBuilder/sheetBuilderSliceSheetPreview';
import { submitInitialEquipment } from '@/store/slices/sheetBuilder/sheetBuilderSliceInitialEquipment';
import { setOptionReady } from '@/store/slices/sheetBuilder/sheetBuilderSliceStepConfirmed';
import ConfirmButton from '../../ConfirmButton';
import SimpleWeaponSelect from './SimpleWeaponSelect';
import MartialWeaponSelect from './MartialWeaponSelect';

const defaultEquipment = [
  EquipmentName.backpack,
  EquipmentName.sleepingBag,
  EquipmentName.travelerCostume,
];

const SheetBuilderFormStepEquipmentDefinition = () => {
  const [selectedSimpleWeapon, setSelectedSimpleWeapon] =
    useState<SimpleWeaponName>();
  const [selectedMartialWeapon, setSelectedMartialWeapon] =
    useState<MartialWeaponName>();
  // const [selectedArmor, setSelectedArmor] = useState<EquipmentName>();
  const [selectedArmor] = useState<EquipmentName>();

  const dispatch = useDispatch();
  const role = useSelector(selectPreviewRoleName);
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

  const hasMartialWeaponProficiency = proficiencies.find(
    (proficiency) => Proficiency.martial === proficiency
  );

  return (
    <div>
      <div className='mb-6'>
        {role ? (
          <div>
            <SimpleWeaponSelect
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
