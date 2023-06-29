import React from 'react';
import { Attribute } from 't20-sheet-builder';
import AttributeInput from './AttributeInput';
import { SheetBuilderFormStepAttributesDefinitionProvider } from './SheetBuilderFormStepAttributesDefinitionContext';

const attributes: Attribute[] = [
  'strength',
  'dexterity',
  'constitution',
  'intelligence',
  'wisdom',
  'charisma',
];

const SheetBuilderFormStepAttributesDefinition = () => (
  <SheetBuilderFormStepAttributesDefinitionProvider>
    <form className='flex flex-row flex-wrap justify-center gap-4'>
      {attributes.map((attribute) => (
        <AttributeInput key={attribute} attribute={attribute} />
      ))}
    </form>
  </SheetBuilderFormStepAttributesDefinitionProvider>
);

export default SheetBuilderFormStepAttributesDefinition;
