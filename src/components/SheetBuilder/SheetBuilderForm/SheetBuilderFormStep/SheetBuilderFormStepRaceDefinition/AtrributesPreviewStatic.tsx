import React from 'react';
import { AttributePreview } from './AttributePreview';
import AttributePreviewItem from './AttributePreviewItem';

type Props = {
  attributesPreview: AttributePreview[];
};

const AtrributesPreviewStatic = ({ attributesPreview }: Props) => (
  <div className='mb-6'>
    <h3 className='mb-3'>Atributos</h3>
    <ul className='flex gap-2 justify-center flex-wrap'>
      {attributesPreview.map(({ attribute, modifier, value }) => (
        <AttributePreviewItem
          key={attribute}
          attribute={attribute}
          value={value}
          modifier={modifier}
        />
      ))}
    </ul>
  </div>
);

export default AtrributesPreviewStatic;
