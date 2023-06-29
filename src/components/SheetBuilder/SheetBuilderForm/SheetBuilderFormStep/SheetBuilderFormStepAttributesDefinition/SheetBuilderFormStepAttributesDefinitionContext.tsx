import React, { PropsWithChildren, createContext } from 'react';
import { Attribute } from 't20-sheet-builder';
import { useAttributesInputs } from './useAttributeInputs';

type SheetBuilderFormStepAttributesDefinitionContextType = {
  attributes: Record<Attribute, number>;
  increment: (attribute: Attribute) => void;
  decrement: (attribute: Attribute) => void;
};

const SheetBuilderFormStepAttributesDefinitionContext =
  createContext<SheetBuilderFormStepAttributesDefinitionContextType>(
    null as unknown as SheetBuilderFormStepAttributesDefinitionContextType
  );

export const SheetBuilderFormStepAttributesDefinitionProvider: React.FC<
  PropsWithChildren<Record<string, unknown>>
> = ({ children }) => {
  const { decrement, increment, ...attributes } = useAttributesInputs();
  return (
    <SheetBuilderFormStepAttributesDefinitionContext.Provider
      value={{
        attributes,
        decrement,
        increment,
      }}
    >
      {children}
    </SheetBuilderFormStepAttributesDefinitionContext.Provider>
  );
};

export const useSheetBuilderFormStepAttributesDefinitionContext = () => {
  const context = React.useContext(
    SheetBuilderFormStepAttributesDefinitionContext
  );

  if (!context) {
    throw new Error(
      'useSheetBuilderFormStepAttributesDefinitionContext must be used within a SheetBuilderFormStepAttributesDefinitionProvider'
    );
  }

  return context;
};
