import React from 'react';
import { SkillName, Translator } from 't20-sheet-builder';
import { useAppSelector } from '@/store/hooks';
import { selectAttribute } from '@/store/slices/sheetBuilder/sheetBuilderSliceInitialAttributes';
import { setOptionReady } from '@/store/slices/sheetBuilder/sheetBuilderSliceStepConfirmed';
import { useDispatch, useSelector } from 'react-redux';
import { getSkills } from '@/components/SheetBuilder/common/SkillsFilter';
import { selectPreviewSkills } from '@/store/slices/sheetBuilder/sheetBuilderSliceSheetPreview';
import { submitintelligenceSkills } from '@/store/slices/sheetBuilder/sheetBuilderSliceIntelligenceSkills';
import SheetBuilderFormSelect from '../../SheetBuilderFormSelect';
import ConfirmButton from '../../ConfirmButton';

const SheetBuilderFormStepIntelligenceSkillsTraining = () => {
  const intelligence = useAppSelector(selectAttribute('intelligence'));
  const [selectedSkills, setSelectedSkills] = React.useState<SkillName[]>([]);
  const options = Object.values(SkillName).map((skillName) => ({
    label: Translator.getSkillTranslation(skillName),
    value: skillName,
  }));
  const skills = getSkills(Object.entries(useSelector(selectPreviewSkills)));
  const dispatch = useDispatch();

  const onConfirm = () => {
    dispatch(
      setOptionReady({
        key: 'isIntelligenceSkillsReady',
        value: 'confirmed',
      })
    );

    dispatch(submitintelligenceSkills({ skills: selectedSkills }));
  };

  return (
    <div>
      {intelligence <= 0 && (
        <p>
          Você não possui Inteligência o suficiente para treinar novas perícias.
        </p>
      )}
      {intelligence > 0 && (
        <>
          <p>
            Você recebe um número de perícias treinadas igual à sua
            Inteligência: {intelligence}
          </p>
          <div>
            <SheetBuilderFormSelect
              isMulti
              isSearcheable
              options={options}
              onChange={(selected) => {
                dispatch(
                  setOptionReady({
                    key: 'isIntelligenceSkillsReady',
                    value: 'pending',
                  })
                );
                setSelectedSkills(selected.map((option) => option.value));
              }}
              id='intelligence-skills-select'
              placeholder='Escolha a(s) perícia(s)'
              isOptionDisabled={(option) =>
                selectedSkills.length >= intelligence ||
                skills.includes(option.value)
              }
            />
            <div style={{ marginTop: '10px' }}>
              <ConfirmButton confirm={onConfirm} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SheetBuilderFormStepIntelligenceSkillsTraining;
