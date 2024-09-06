import {
  selectPreviewRaceName,
  selectPreviewRoleName,
} from '@/store/slices/sheetBuilder/sheetBuilderSliceSheetPreview';
import { setOptionReady } from '@/store/slices/sheetBuilder/sheetBuilderSliceStepConfirmed';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { Deities, DeityName, Devotion, Translator } from 't20-sheet-builder';
import { Option } from '../../../common/Option';
import SheetBuilderFormSelect from '../../SheetBuilderFormSelect';

interface Props {
  setDevotion: (devotion?: DeityName) => void;
  setNotAllowed: (reason: string) => void;
  selectedDevotion?: DeityName;
}

const DevotionSelect: React.FC<Props> = ({
  setDevotion,
  setNotAllowed,
  selectedDevotion,
}) => {
  const dispatch = useDispatch();

  const params = useParams<{ id: string }>();
  const roleName = useSelector(selectPreviewRoleName(params.id));
  const raceName = useSelector(selectPreviewRaceName(params.id));

  const devotionOptions: Option<DeityName>[] = Object.values(DeityName)
    .filter((name) => name === DeityName.linwuh)
    .map((deityName) => ({
      label: Translator.getTranslation(deityName),
      value: deityName,
    }));

  const onChangeDevotion = (option: Option<DeityName>) => {
    // Create placeholder devotion just to check if it's allowed
    const devotion = new Devotion(Deities.get(option.value as DeityName), []);

    if (raceName && roleName) {
      const isRaceAllowedToDevote =
        devotion.deity.allowedToDevote !== 'all'
          ? devotion.deity.allowedToDevote.races.includes(raceName)
          : true;
      const isRoleAllowedToDevote =
        devotion.deity.allowedToDevote !== 'all'
          ? devotion.deity.allowedToDevote.roles.includes(roleName)
          : true;

      if (!isRaceAllowedToDevote && !isRoleAllowedToDevote) {
        setNotAllowed(
          `Essa divindade não aceita devotos da combinação ${Translator.getRaceTranslation(
            raceName
          )} e ${Translator.getRoleTranslation(roleName)}`
        );
        return;
      }
    }

    setNotAllowed('');
    dispatch(setOptionReady({ key: 'isDevotionReady', value: 'pending' }));
    setDevotion(option?.value);
  };

  return (
    <SheetBuilderFormSelect
      options={devotionOptions}
      value={devotionOptions.find(
        (option) => option.value === selectedDevotion
      )}
      onChange={onChangeDevotion}
      className='mb-3'
      id='devotion-select'
      placeholder='Escolha uma divindade'
    />
  );
};

export default DevotionSelect;
