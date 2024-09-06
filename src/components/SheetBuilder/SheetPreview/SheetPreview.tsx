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
import { useParams } from 'react-router';

const SheetPreview: React.FC<{ handleChange: (idx: number) => void }> = ({
  handleChange,
}) => {
  const params = useParams<{ id: string }>();
  const name = useSelector(selectPreviewName(params.id));
  const image = useSelector(selectPreviewImage(params.id));
  const raceName = useSelector(selectPreviewRaceName(params.id));
  const roleName = useSelector(selectPreviewRoleName(params.id));
  const originName = useSelector(selectPreviewOriginName(params.id));
  const level = useSelector(selectPreviewLevel(params.id));
  const displacement = useSelector(selectPreviewDisplacement(params.id));
  const devotion = useSelector(selectPreviewDevotion(params.id));
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
