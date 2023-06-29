import React from 'react';
import Select from 'react-select';
import { selectStyles } from '../common/selectStyles';

type Value<T, IsMulti extends boolean> = IsMulti extends true
  ? readonly T[]
  : T;

type Props<T, IsMulti extends boolean, V = Value<T, IsMulti>> = Record<
  string,
  any
> & {
  options: T[];
  isMulti?: IsMulti;
  onChange: (newValue: V) => void;
};

const SheetBuilderFormSelect = <T, IsMulti extends boolean = false>({
  options,
  onChange,
  placeholder,
  className,
  isSearcheable,
  isMulti,
  id,
  isClearable,
  defaultValue,
}: Props<T, IsMulti>) => (
  <Select
    options={options}
    styles={selectStyles}
    onChange={(newValue) => onChange(newValue)}
    placeholder={placeholder}
    className={className}
    isSearchable={isSearcheable ?? false}
    isMulti={isMulti}
    instanceId={id}
    isClearable={isClearable}
    defaultValue={defaultValue}
  />
);

export default SheetBuilderFormSelect;
