import { Attribute } from 't20-sheet-builder';
import React from 'react';
import { Stack } from '@mui/material';
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
    <Stack direction='row' spacing={2} justifyContent='center'>
      {attributesPreview.map(({ attribute, value, modifier }) => (
        <AttributePreviewItem
          key={attribute}
          attribute={attribute as Attribute}
          value={value}
          modifier={modifier}
          toggle={() => toggleAttribute(attribute as Attribute)}
        />
      ))}
    </Stack>
  </div>
);

export default SheetBuilderFormStepRaceDefinitionHumanAttributeCheckboxes;
