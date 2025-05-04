import React, { useEffect, useState } from 'react';
import {
  Deities,
  DeityName,
  Devotion,
  GrantedPowerFactory,
  GrantedPowerName,
  Translator,
} from 't20-sheet-builder';
import { useParams } from 'react-router';
import {
  selectPreviewGrantedPowersCount,
  selectPreviewRaceName,
  selectPreviewRoleName,
} from '@/store/slices/sheetBuilder/sheetBuilderSliceSheetPreview';
import { useSelector } from 'react-redux';
import {
  getStoredDevotion,
  submitDevotion,
} from '@/store/slices/sheetBuilder/sheetBuilderSliceDevotionDefinition';
import DevotionSelect from './DevotionSelect';
import GrantedPowerSelect from './GrantedPowerSelect';
import ConfirmButton from '../../ConfirmButton';
import { useSheetBuilderConfirm } from '../../useSheetBuilderSubmit';

const SheetBuilderFormStepDevotionDefinition = () => {
  const storedDevotion = useSelector(getStoredDevotion);
  const { confirm } = useSheetBuilderConfirm<Devotion>();
  const params = useParams<{ id: string }>();
  const raceName = useSelector(selectPreviewRaceName(params.id));
  const roleName = useSelector(selectPreviewRoleName(params.id));

  const [selectedDevotion, setDevotion] = useState<DeityName>();
  const [selectedGrantedPowers, setGrantedPowers] = useState<
    GrantedPowerName[]
  >([]);
  const [notAllowed, setNotAllowed] = useState('');

  useEffect(() => {
    if (storedDevotion && storedDevotion.devotion) {
      setDevotion(storedDevotion.devotion?.deity.name);
      setGrantedPowers(storedDevotion.devotion.choosedPowers);
    }
  }, [storedDevotion]);

  const makeDevotion = () => {
    const devotion = new Devotion(
      Deities.get(selectedDevotion as DeityName),
      selectedGrantedPowers.map((power) => GrantedPowerFactory.make(power))
    );

    return devotion;
  };
  const createSubmitAction = (devotion: Devotion) =>
    submitDevotion(devotion.serialize());

  const onSetGrantedPowers = (grantedPowers: GrantedPowerName[]) => {
    setGrantedPowers(grantedPowers);
  };

  const onSaveDevotion = () => {
    confirm(makeDevotion, createSubmitAction, 'isDevotionReady');
  };

  const grantedPowersOptions = selectedDevotion
    ? Deities.get(selectedDevotion).grantedPowers.map(
        (power: GrantedPowerName) => ({
          label: Translator.getPowerTranslation(power),
          value: power,
        })
      )
    : [];

  const grantedPowersCount = useSelector(
    selectPreviewGrantedPowersCount(params.id)
  );

  return (
    <div>
      {(!raceName || !roleName) && <p>Selecione raça e classe primeiro.</p>}
      {raceName && roleName && (
        <>
          <DevotionSelect
            selectedDevotion={selectedDevotion}
            setDevotion={setDevotion}
            setNotAllowed={setNotAllowed}
          />
          {grantedPowersOptions.length > 0 && (
            <GrantedPowerSelect
              selectedGrantedPowers={selectedGrantedPowers}
              grantedPowersOptions={grantedPowersOptions}
              grantedPowersCount={grantedPowersCount}
              setGrantedPowers={onSetGrantedPowers}
            />
          )}

          <ConfirmButton
            confirm={onSaveDevotion}
            disabled={notAllowed !== ''}
            label={notAllowed !== '' ? notAllowed : 'Atualizar'}
          />
        </>
      )}
    </div>
  );
};

export default SheetBuilderFormStepDevotionDefinition;
