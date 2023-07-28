import { PayloadAction } from '@reduxjs/toolkit';
import { useCallback } from 'react';
import { SheetBuilderError } from 't20-sheet-builder';
import { useAppDispatch } from '@/store/hooks';
import { setFormError } from '@/store/slices/sheetBuilder/sheetBuilderSliceForm';
import {
  SheetBuilderStepConfirmedState,
  setOptionReady,
} from '@/store/slices/sheetBuilder/sheetBuilderSliceStepConfirmed';
import { SheetBuilderFormError } from '../common/SheetBuilderFormError';

export type ConfirmFunction<Type> = <
  Entity extends Type,
  Payload,
  Action extends PayloadAction<Payload> = PayloadAction<Payload>
>(
  make: () => Entity,
  createAction: (entity: Entity) => Action,
  key: keyof SheetBuilderStepConfirmedState
) => void;

export const useSheetBuilderConfirm = <Type>() => {
  const dispatch = useAppDispatch();

  const confirm: ConfirmFunction<Type> = useCallback(
    (make, createSubmitAction, key) => {
      try {
        const entity = make();
        const action = createSubmitAction(entity);
        dispatch(action);
        dispatch(setOptionReady({ key, value: 'confirmed' }));
      } catch (err) {
        dispatch(setOptionReady({ key, value: 'pending' }));
        if (
          err instanceof SheetBuilderError ||
          err instanceof SheetBuilderFormError
        ) {
          dispatch(setFormError(err.message));
        } else {
          // eslint-disable-next-line no-console
          console.error(err);
          dispatch(setFormError('UNKNOWN_ERROR'));
        }
      }
    },
    [dispatch]
  );

  return {
    confirm,
  };
};
