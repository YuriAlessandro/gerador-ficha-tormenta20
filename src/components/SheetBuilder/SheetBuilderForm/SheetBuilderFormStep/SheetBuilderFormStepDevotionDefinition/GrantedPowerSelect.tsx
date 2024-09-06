import React from 'react';
import { GrantedPowerName } from 't20-sheet-builder';
import { Option } from '@/components/SheetBuilder/common/Option';
import { useDispatch } from 'react-redux';
import { setOptionReady } from '@/store/slices/sheetBuilder/sheetBuilderSliceStepConfirmed';
import SheetBuilderFormSelect from '../../SheetBuilderFormSelect';

interface Props {
  grantedPowersOptions: Option<GrantedPowerName>[];
  grantedPowersCount: number;
  setGrantedPowers: (grantedPowers: GrantedPowerName[]) => void;
  selectedGrantedPowers: GrantedPowerName[];
}

const GrantedPowerSelect: React.FC<Props> = ({
  grantedPowersOptions,
  grantedPowersCount,
  setGrantedPowers,
  selectedGrantedPowers,
}) => {
  const dispatch = useDispatch();
  return (
    <div>
      {grantedPowersCount > 1 ? (
        <p>Selecione {grantedPowersCount} poderes concedidos</p>
      ) : (
        <p>Selecione {grantedPowersCount} poder concedido</p>
      )}
      <SheetBuilderFormSelect
        isMulti
        options={grantedPowersOptions}
        value={grantedPowersOptions.filter((option) =>
          selectedGrantedPowers.includes(option.value)
        )}
        onChange={(options) => {
          dispatch(
            setOptionReady({ key: 'isDevotionReady', value: 'pending' })
          );
          setGrantedPowers(options?.map((option) => option.value));
        }}
        className='mb-3'
        id='devotion-select'
        placeholder='Escolha um poder concedido'
      />
    </div>
  );
};

export default GrantedPowerSelect;
