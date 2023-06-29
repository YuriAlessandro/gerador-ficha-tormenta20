import {
  SerializedSheetSpell,
  SpellCircle,
  Translator,
} from 't20-sheet-builder';
import React from 'react';
import SheetPreviewBoxItem from './SheetPreviewBoxItem';

type Props = {
  spell: SerializedSheetSpell;
};

const circleToNumber: Record<SpellCircle, number> = {
  [SpellCircle.first]: 1,
  [SpellCircle.second]: 2,
};

const SheetPreviewSpell = ({ spell }: Props) => {
  const translatedName = Translator.getSpellTranslation(spell.name);
  const circleNumber = circleToNumber[spell.circle];
  const translatedType = Translator.getSpellTypeTranslation(spell.type);
  const translatedSchool = Translator.getSpellSchoolTranslation(spell.school);

  return (
    <SheetPreviewBoxItem key={spell.name} title={translatedName}>
      <h5 className='text-sm font-medium text-slate-500 mb-1'>
        {translatedType} {circleNumber} ({translatedSchool})
      </h5>
      <ul className='text-sm'>
        {spell.effects.map((effect) => (
          <li key={effect.description}>{effect.description}</li>
        ))}
      </ul>
    </SheetPreviewBoxItem>
  );
};

export default SheetPreviewSpell;
