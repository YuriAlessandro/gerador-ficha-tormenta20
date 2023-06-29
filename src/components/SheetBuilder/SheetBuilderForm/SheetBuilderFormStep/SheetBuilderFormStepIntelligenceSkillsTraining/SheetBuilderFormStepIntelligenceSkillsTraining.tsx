import React from 'react';
import { SkillName, Translator } from 't20-sheet-builder';
import SheetBuilderFormSelect from '../../SheetBuilderFormSelect';
import { useAppSelector } from '../../../../../store/hooks';
import { selectAttribute } from '../../../../../store/slices/sheetBuilder/sheetBuilderSliceInitialAttributes';

const SheetBuilderFormStepIntelligenceSkillsTraining = () => {
  const intelligence = useAppSelector(selectAttribute('intelligence'));
  const [, setSelectedSkills] = React.useState<SkillName[]>([]);
  const options = Object.values(SkillName).map((skillName) => ({
    label: Translator.getSkillTranslation(skillName),
    value: skillName,
  }));
  return (
    <div>
      <p>
        Você recebe um número de perícias treinadas igual à sua inteligência:{' '}
        {intelligence}
      </p>
      {intelligence > 0 && (
        <SheetBuilderFormSelect
          isMulti
          isSearcheable
          options={options}
          onChange={(selected) =>
            setSelectedSkills(selected.map((option) => option.value))
          }
          id='intelligence-skills-select'
          placeholder='Escolha a(s) perícia(s)'
        />
      )}
    </div>
  );
};

export default SheetBuilderFormStepIntelligenceSkillsTraining;
