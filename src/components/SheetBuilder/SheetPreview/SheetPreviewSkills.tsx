import { useSelector } from 'react-redux';
import { SkillName, Translator } from 't20-sheet-builder';
import React from 'react';
import SheetPreviewItem from './SheetPreviewValueItem';
import {
  selectPreviewAttributes,
  selectPreviewSkills,
} from '../../../store/slices/sheetBuilder/sheetBuilderSliceSheetPreview';

const SheetPreviewSkills = () => {
  const skills = useSelector(selectPreviewSkills);
  const attributes = useSelector(selectPreviewAttributes);

  return (
    <ul className='flex flex-col gap-2 items-center'>
      {Object.entries(skills)
        .sort(([skill], [skill2]) => {
          const skillNameTranslation = Translator.getSkillTranslation(
            skill as SkillName
          );
          const skillNameTranslation2 = Translator.getSkillTranslation(
            skill2 as SkillName
          );
          return skillNameTranslation.localeCompare(skillNameTranslation2);
        })
        .map(([key, skill]) => {
          const skillName = key as SkillName;
          const skillNameTranslation =
            Translator.getSkillTranslation(skillName);
          const attributeTranslation = Translator.getAttributeTranslation(
            skill.attribute
          );
          return (
            <li key={skillName} className='flex items-center gap-2'>
              <div className='w-24 flex flex-col'>
                <SheetPreviewItem
                  label={skillNameTranslation}
                  value={skill.total}
                />
              </div>
              +
              <div className='flex flex-col w-20'>
                <SheetPreviewItem
                  label={attributeTranslation}
                  value={attributes[skill.attribute]}
                />
              </div>
              +
              <div className='flex flex-col'>
                <SheetPreviewItem label='Treino' value={skill.trainingPoints} />
              </div>
              +
              <div className='flex flex-col'>
                <SheetPreviewItem
                  label='Outros'
                  value={skill.fixedModifiers.total}
                />
              </div>
            </li>
          );
        })}
    </ul>
  );
};

export default SheetPreviewSkills;
