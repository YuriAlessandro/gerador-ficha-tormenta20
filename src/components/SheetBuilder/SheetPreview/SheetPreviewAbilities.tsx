import React from 'react';
import { useSelector } from 'react-redux';
import { Translator } from 't20-sheet-builder';
import {
  selectPreviewRaceAbilities,
  selectPreviewRoleAbilities,
} from '@/store/slices/sheetBuilder/sheetBuilderSliceSheetPreview';
import SheetPreviewAbility from './SheetPreviewAbility';
import SheetPreviewList from './SheetPreviewList';

const SheetPreviewAbilities = () => {
  const raceAbilities = useSelector(selectPreviewRaceAbilities);
  const roleAbilities = useSelector(selectPreviewRoleAbilities);

  return (
    <div className='flex flex-col md:flex-row gap-4 md:gap-12'>
      <div className='flex-1'>
        <h3 className='font-semibold mb-6'>Habilidades de Raça</h3>
        <SheetPreviewList
          emptyText='Nenhuma habilidade de raça.'
          isEmpty={!raceAbilities?.length}
          list={
            <ul className='flex flex-col gap-6'>
              {raceAbilities?.map((ability) => (
                <SheetPreviewAbility
                  ability={ability}
                  translatedName={Translator.getRaceAbilityTranslation(
                    ability.name
                  )}
                  key={ability.name}
                />
              ))}
            </ul>
          }
        />
      </div>
      <hr className='md:hidden opacity-40' />
      <div className='flex-1'>
        <h3 className='font-semibold mb-6'>Habilidades de Classe</h3>
        <SheetPreviewList
          emptyText='Nenhuma habilidade de classe.'
          isEmpty={!roleAbilities || roleAbilities.length === 0}
          list={
            <ul className='flex flex-col gap-6'>
              {roleAbilities?.map((ability) => (
                <SheetPreviewAbility
                  ability={ability}
                  translatedName={Translator.getRoleAbilityTranslation(
                    ability.name
                  )}
                  key={ability.name}
                />
              ))}
            </ul>
          }
        />
      </div>
    </div>
  );
};

export default SheetPreviewAbilities;
