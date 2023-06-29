import React from 'react';
import { Attribute, Attributes, Translator } from 't20-sheet-builder';
import { addSign } from '../common/StringHelper';

type Props = {
  attributes: Attributes;
};

const SheetPreviewAttributes = ({ attributes }: Props) => (
  <ul className='flex gap-3 flex-wrap justify-center'>
    {Object.entries(attributes).map(([attribute, value]) => (
      <li key={attribute} className='flex flex-col w-20'>
        <p className='text-sm mb-2'>
          {Translator.getAttributeTranslation(attribute as Attribute)}
        </p>
        <p className='bg-white text-slate-900 rounded-2xl px-3 py-1 md:py-2 mb-1'>
          {addSign(value)}
        </p>
      </li>
    ))}
  </ul>
);

export default SheetPreviewAttributes;
