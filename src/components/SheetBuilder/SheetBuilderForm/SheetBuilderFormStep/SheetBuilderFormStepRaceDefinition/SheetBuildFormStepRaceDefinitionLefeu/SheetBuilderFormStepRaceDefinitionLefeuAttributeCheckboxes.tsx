import React from 'react';
import { Attribute } from 't20-sheet-builder';
import { Stack } from '@mui/material';
import { AttributePreview } from '../AttributePreview';
import AttributePreviewItem from '../AttributePreviewItem';

type Props = {
  attributesPreview: AttributePreview[];
  toggleAttribute: (attribute: Attribute) => void;
};

const SheetBuilderFormStepRaceDefinitionLefeuAttributeCheckboxes = ({
  attributesPreview,
  toggleAttribute,
}: Props) => (
  <div className=''>
    <h3 className='mb-3'>+1 em três atributos diferentes, -1 em Carisma</h3>
    <Stack direction='row' spacing={2} justifyContent='center'>
      {attributesPreview.map(({ attribute, value, modifier }) => (
        <AttributePreviewItem
          key={attribute}
          attribute={attribute as Attribute}
          value={attribute === 'charisma' ? -1 : value}
          modifier={attribute === 'charisma' ? -1 : modifier}
          toggle={() => {
            if (attribute === 'charisma') return;
            toggleAttribute(attribute as Attribute);
          }}
        />
      ))}
    </Stack>
  </div>
);

export default SheetBuilderFormStepRaceDefinitionLefeuAttributeCheckboxes;
