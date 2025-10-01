import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { RootState, AppDispatch } from '../store';
import {
  fetchUserSheets,
  fetchSheetById,
  createSheet,
  updateSheet,
  deleteSheet,
  duplicateSheet,
  clearSheets,
  setCurrentSheet,
  clearError,
} from '../store/slices/sheets/sheetsSlice';
import {
  CreateSheetRequest,
  UpdateSheetRequest,
  SheetData,
} from '../services/sheets.service';

export const useSheets = () => {
  const dispatch = useDispatch<AppDispatch>();
  const sheets = useSelector((state: RootState) => state.sheets);

  // Auto-fetch sheets when hook is used (if not already initialized)
  useEffect(() => {
    if (!sheets.initialized && !sheets.loading) {
      dispatch(fetchUserSheets());
    }
  }, [dispatch, sheets.initialized, sheets.loading]);

  const actions = {
    // Fetch all user sheets
    fetchSheets: () => dispatch(fetchUserSheets()),

    // Fetch specific sheet by ID
    fetchSheet: (id: string) => dispatch(fetchSheetById(id)),

    // Create new sheet
    createSheet: (sheetRequest: CreateSheetRequest) =>
      dispatch(createSheet(sheetRequest)),

    // Update existing sheet
    updateSheet: (id: string, updates: UpdateSheetRequest) =>
      dispatch(updateSheet({ id, updates })),

    // Delete sheet
    deleteSheet: (id: string) => dispatch(deleteSheet(id)),

    // Duplicate sheet
    duplicateSheet: (id: string) => dispatch(duplicateSheet(id)),

    // Clear all sheets (on logout)
    clearSheets: () => dispatch(clearSheets()),

    // Set current sheet
    setCurrentSheet: (sheet: SheetData | null) =>
      dispatch(setCurrentSheet(sheet)),

    // Clear error
    clearError: () => dispatch(clearError()),
  };

  return {
    sheets: sheets.sheets,
    currentSheet: sheets.currentSheet,
    loading: sheets.loading,
    error: sheets.error,
    initialized: sheets.initialized,
    ...actions,
  };
};
