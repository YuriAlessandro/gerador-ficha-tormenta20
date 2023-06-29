/* eslint-disable react/jsx-props-no-spreading */
import React, { ComponentProps } from 'react';
import Select from 'react-select';
import { selectStyles } from '../common/selectStyles';
import { Option } from '../common/Option';

type Value<T, IsMulti extends boolean> = IsMulti extends true
  ? readonly Option<T>[]
  : Option<T>;

type Props<T, IsMulti extends boolean = false, V = Value<T, IsMulti>> = {
  options: Option<T>[];
  placeholder?: string;
  className?: ComponentProps<'div'>['className'];
  isSearcheable?: boolean;
  isMulti?: IsMulti;
  id: string;
  defaultValue?: V;
  isClearable?: boolean;
  onChange: (option: V) => void;
};

const SheetBuilderFormSelect = <
  T,
  IsMulti extends boolean = false,
  V extends Value<T, IsMulti> = Value<T, IsMulti>
>({
  onChange,
  isSearcheable,
  ...props
}: Props<T, IsMulti>) => (
  <Select
    {...props}
    isSearchable={isSearcheable ?? false}
    onChange={(newValue) => onChange(newValue as V)}
    styles={selectStyles}
  />
);

export default SheetBuilderFormSelect;
