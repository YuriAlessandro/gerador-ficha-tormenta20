import React from 'react';
import { Deities, DeityName, Devotion, Translator } from 't20-sheet-builder';
import { useDispatch, useSelector } from 'react-redux';
import { setOptionReady } from '@/store/slices/sheetBuilder/sheetBuilderSliceStepConfirmed';
import {
  selectPreviewRaceName,
  selectPreviewRoleName,
} from '@/store/slices/sheetBuilder/sheetBuilderSliceSheetPreview';
import SheetBuilderFormSelect from '../../SheetBuilderFormSelect';
import { Option } from '../../../common/Option';

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

  const raceName = useSelector(selectPreviewRaceName);
  const roleName = useSelector(selectPreviewRoleName);

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

      if (!isRaceAllowedToDevote) {
        setNotAllowed(
          `A raça selecionada (${raceName}) não permite essa devoção.`
        );
        return;
      }
      if (!isRoleAllowedToDevote) {
        setNotAllowed(
          `A classe selecionada (${roleName}) não permite essa devoção.`
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
