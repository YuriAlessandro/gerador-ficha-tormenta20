import React from 'react';
import { Translator } from 't20-sheet-builder';
import { useSelector } from 'react-redux';
import {
  selectPreviewLevel,
  selectPreviewOriginName,
  selectPreviewRaceName,
  selectPreviewRoleName,
  selectPreviewDisplacement,
  selectPreviewDevotion,
} from '@/store/slices/sheetBuilder/sheetBuilderSliceSheetPreview';

import SheetViewer from '@/components/SheetViewer';
import {
  selectPreviewImage,
  selectPreviewName,
} from '@/store/slices/sheetBuilder/sheetBuilderSliceStepDetails';

const SheetPreview: React.FC<{ handleChange: (idx: number) => void }> = ({
  handleChange,
}) => {
  const name = useSelector(selectPreviewName);
  const image = useSelector(selectPreviewImage);
  const raceName = useSelector(selectPreviewRaceName);
  const roleName = useSelector(selectPreviewRoleName);
  const originName = useSelector(selectPreviewOriginName);
  const level = useSelector(selectPreviewLevel);
  const displacement = useSelector(selectPreviewDisplacement);
  const devotion = useSelector(selectPreviewDevotion);

  const getTitle = () => {
    const translatedRaceName =
      raceName && Translator.getRaceTranslation(raceName);
    const translatedRoleName =
      roleName && Translator.getRoleTranslation(roleName);
    const translatedOriginName =
      originName && Translator.getOriginTranslation(originName);

    const raceText = translatedRaceName ? `${translatedRaceName}` : '';
    const roleText = translatedRoleName ? `${translatedRoleName}` : '';
    const originText = translatedOriginName ? `${translatedOriginName}` : '';
    return raceText && roleText ? `${raceText} ${roleText}, ${originText}` : '';
  };

  const devotionName = devotion.devotion
    ? Translator.getTranslation(devotion.devotion?.deity.name)
    : '';

  return (
    <SheetViewer
      allowEdition
      handleChange={handleChange}
      displacement={displacement}
      level={level}
      title={getTitle()}
      name={name}
      image={image}
      devotion={devotionName}
    />
  );
};

export default SheetPreview;
