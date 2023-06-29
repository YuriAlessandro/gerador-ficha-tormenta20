import React from 'react';
import AttributeInput from './AttributeInput';
import { SheetBuilderFormStepAttributesDefinitionProvider } from './SheetBuilderFormStepAttributesDefinitionContext';

const SheetBuilderFormStepAttributesDefinition = () => (
  <SheetBuilderFormStepAttributesDefinitionProvider>
    <form className='flex flex-row flex-wrap justify-center gap-4'>
      <AttributeInput attribute='strength' />
      <AttributeInput attribute='dexterity' />
      <AttributeInput attribute='constitution' />
      <AttributeInput attribute='intelligence' />
      <AttributeInput attribute='wisdom' />
      <AttributeInput attribute='charisma' />
    </form>
  </SheetBuilderFormStepAttributesDefinitionProvider>
);

export default SheetBuilderFormStepAttributesDefinition;
