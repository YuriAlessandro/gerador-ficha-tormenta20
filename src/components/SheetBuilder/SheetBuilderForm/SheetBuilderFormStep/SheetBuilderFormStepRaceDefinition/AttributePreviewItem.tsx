import React from 'react';
import { Attribute, Translator } from 't20-sheet-builder';

type Props = {
  attribute: string;
  value: number;
  modifier?: number;
};

const getClassNames = (modifier?: number) => {
  const isIncremented = modifier && modifier > 0;
  const isDecremented = modifier && modifier < 0;
  const incrementedClassName = 'bg-green-100 text-slate-800';
  const decrementedClassName = 'bg-red-100 text-slate-800';

  if (isIncremented) {
    return incrementedClassName;
  }

  if (isDecremented) {
    return decrementedClassName;
  }

  return '';
};

const AttributePreviewItem = ({ attribute, value, modifier }: Props) => {
  const customClassName = getClassNames(modifier);
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
