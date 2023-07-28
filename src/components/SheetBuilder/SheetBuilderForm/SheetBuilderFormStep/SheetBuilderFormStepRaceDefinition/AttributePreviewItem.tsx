/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Attribute, Translator } from 't20-sheet-builder';
import { Chip } from '@mui/material';
import { generateClassNames } from '../../../common/ClassNames';

type Props = {
  attribute: string;
  value: number;
  modifier?: number;
  toggle?: () => void;
};

const AttributePreviewItem = ({
  attribute,
  value,
  modifier,
  toggle,
}: Props) => {
  const isIncremented = Boolean(modifier && modifier > 0);
  const isDecremented = Boolean(modifier && modifier < 0);
  const classes = {
    success: isIncremented,
    error: isDecremented,
    default: !isIncremented && !isDecremented,
  };
  const customColor = generateClassNames(classes);
  const modifierWithSign = modifier && modifier > 0 ? `+${modifier}` : modifier;
  return (
    <Chip
      color={customColor as any}
      key={attribute}
      onClick={toggle}
      label={`${Translator.getAttributeTranslation(
        attribute as Attribute
      )}: ${value} ${modifier ? `(${modifierWithSign})` : ''}`}
    />
  );
};

export default AttributePreviewItem;
