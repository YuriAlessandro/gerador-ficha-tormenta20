import { Attribute } from 't20-sheet-builder';
import React from 'react';
import AttributeCheckbox from '../AttributeCheckbox';
import { AttributePreview } from '../AttributePreview';
import AttributePreviewItem from '../AttributePreviewItem';

type Props = {
  attributesPreview: AttributePreview[];
  toggleAttribute: (attribute: Attribute) => void;
};

const SheetBuilderFormStepRaceDefinitionHumanAttributeCheckboxes = ({
  attributesPreview,
  toggleAttribute,
}: Props) => (
  <div className=''>
    <h3 className='mb-3'>+1 em três atributos diferentes</h3>
    <ul className='flex flex-row flex-wrap gap-2 justify-center mb-6'>
      {attributesPreview.map(({ attribute, value, modifier }) => (
        <AttributeCheckbox
          key={attribute}
          toggle={() => toggleAttribute(attribute as Attribute)}
          attributePreviewItem={
            <AttributePreviewItem
              attribute={attribute as Attribute}
              value={value}
              modifier={modifier}
            />
          }
        />
      ))}
    </ul>
  </div>
);

export default SheetBuilderFormStepRaceDefinitionHumanAttributeCheckboxes;
