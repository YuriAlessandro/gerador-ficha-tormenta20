import { useSelector } from 'react-redux';
import { Translator } from 't20-sheet-builder';
import React from 'react';
import {
  selectPreviewAttributes,
  selectPreviewDefense,
  selectPreviewDisplacement,
  selectPreviewLevel,
  selectPreviewOriginName,
  selectPreviewProficiencies,
  selectPreviewRaceName,
  selectPreviewRoleName,
} from '../../../store/slices/sheetBuilder/sheetBuilderSliceSheetPreview';
import SheetPreviewAttributes from './SheetPreviewAttributes';
import SheetPreviewDefense from './SheetPreviewDefense';
import SheetPreviewPoints from './SheetPreviewPoints';

const SheetPreviewStats = () => {
  const attributes = useSelector(selectPreviewAttributes);
  const defense = useSelector(selectPreviewDefense);
  const raceName = useSelector(selectPreviewRaceName);
  const roleName = useSelector(selectPreviewRoleName);
  const originName = useSelector(selectPreviewOriginName);
  const level = useSelector(selectPreviewLevel);
  const proficiencies = useSelector(selectPreviewProficiencies);
  const displacement = useSelector(selectPreviewDisplacement);

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
    const texts = [raceText, roleText, originText];
    return texts.filter((text) => text).join(', ');
  };

  return (
    <div className='flex flex-col gap-6 items-center'>
      <h2 className='font-medium'>
        {getTitle()} Nível {level}
      </h2>
      <SheetPreviewPoints />
      <SheetPreviewAttributes attributes={attributes} />
      <SheetPreviewDefense defense={defense} attributes={attributes} />
      <div className='flex flex-col'>
        <p>
          <strong>Deslocamento</strong>: {displacement}m
        </p>
        <p className='font-light'>
          <strong className='font-bold'>Proficiências</strong>:{' '}
          {proficiencies.map(Translator.getProficiencyTranslation).join(', ')}.
        </p>
      </div>
    </div>
  );
};

export default SheetPreviewStats;
