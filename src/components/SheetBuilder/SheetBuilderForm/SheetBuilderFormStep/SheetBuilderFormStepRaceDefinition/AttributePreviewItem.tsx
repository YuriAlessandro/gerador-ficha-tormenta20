import React from 'react';
import { Attribute, Translator } from 't20-sheet-builder';
import { generateClassNames } from '../../../common/ClassNames';

type Props = {
  attribute: string;
  value: number;
  modifier?: number;
};

const AttributePreviewItem = ({ attribute, value, modifier }: Props) => {
  const isIncremented = Boolean(modifier && modifier > 0);
  const isDecremented = Boolean(modifier && modifier < 0);
  const classes = {
    'bg-green-100 text-slate-800': isIncremented,
    'bg-red-100 text-slate-800': isDecremented,
  };
  const customClassName = generateClassNames(classes);
  const modifierWithSign = modifier && modifier > 0 ? `+${modifier}` : modifier;
  return (
    <li
      key={attribute}
      className={`border border-white rounded-2xl 
      px-5 py-1 ${customClassName}`}
    >
      {Translator.getAttributeTranslation(attribute as Attribute)}: {value}{' '}
      {modifier && <span>({modifierWithSign})</span>}
    </li>
  );
};

export default AttributePreviewItem;
