import React from 'react';
import AttributeInput from './AttributeInput';
import { SheetBuilderFormStepAttributesDefinitionProvider } from './SheetBuilderFormStepAttributesDefinitionContext';
import { attributes } from '../../../common/Attributes';

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
