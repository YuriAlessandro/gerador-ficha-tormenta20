import React, { useState } from 'react';
import {
  Deities,
  DeityName,
  Devotion,
  EmptyMind,
  GrantedPower,
  GrantedPowerName,
  Translator,
} from 't20-sheet-builder';
import { selectPreviewGrantedPowersCount } from '@/store/slices/sheetBuilder/sheetBuilderSliceSheetPreview';
import { useSelector } from 'react-redux';
import { submitDevotion } from '@/store/slices/sheetBuilder/sheetBuilderSliceDevotionDefinition';
import DevotionSelect from './DevotionSelect';
import GrantedPowerSelect from './GrantedPowerSelect';
import ConfirmButton from '../../ConfirmButton';
import { useSheetBuilderConfirm } from '../../useSheetBuilderSubmit';

const SheetBuilderFormStepDevotionDefinition = () => {
  const { confirm } = useSheetBuilderConfirm<Devotion>();

  const [devotion, setDevotion] = useState<DeityName>();
  const [selectedGrantedPowers, setGrantedPowers] = useState<GrantedPower[]>(
    []
  );

  const makeDevotion = () =>
    new Devotion(Deities.get(devotion as DeityName), selectedGrantedPowers);
  const createSubmitAction = () =>
    submitDevotion({
      deity: new Devotion(
        Deities.get(devotion as DeityName),
        selectedGrantedPowers
      ),
    });
  const onSetGrantedPowers = (grantedPowers: GrantedPowerName[]) => {
    setGrantedPowers(grantedPowers.map(() => new EmptyMind()));
  };

  const onSaveDevotion = () => {
    confirm(makeDevotion, createSubmitAction, 'isDevotionReady');
  };

  const grantedPowersOptions = devotion
    ? Deities.get(devotion).grantedPowers.map((power: GrantedPowerName) => ({
        label: Translator.getPowerTranslation(power),
        value: power,
      }))
    : [];

  const grantedPowersCount = useSelector(selectPreviewGrantedPowersCount);

  return (
    <div>
      <DevotionSelect setDevotion={setDevotion} />
      {grantedPowersOptions.length > 0 && (
        <GrantedPowerSelect
          grantedPowersOptions={grantedPowersOptions}
          grantedPowersCount={grantedPowersCount}
          setGrantedPowers={onSetGrantedPowers}
        />
      )}

      <ConfirmButton confirm={onSaveDevotion} />
    </div>
  );
};

export default SheetBuilderFormStepDevotionDefinition;
