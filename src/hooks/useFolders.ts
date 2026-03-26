import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { RootState, AppDispatch } from '../store';
import {
  fetchFolders,
  createFolder,
  updateFolder,
  deleteFolder,
  moveSheetToFolder,
  clearFolders,
  clearFoldersError,
} from '../store/slices/folders/foldersSlice';
import { useAuth } from './useAuth';

export const useFolders = () => {
  const dispatch = useDispatch<AppDispatch>();
  const foldersState = useSelector((state: RootState) => state.folders);
  const { isAuthenticated } = useAuth();

  // Auto-fetch folders when hook is used (if authenticated and not already initialized)
  useEffect(() => {
    if (isAuthenticated && !foldersState.initialized && !foldersState.loading) {
      dispatch(fetchFolders());
    }
  }, [
    dispatch,
    foldersState.initialized,
    foldersState.loading,
    isAuthenticated,
  ]);

  const actions = {
    fetchFolders: () => dispatch(fetchFolders()),

    createFolder: (name: string) => dispatch(createFolder(name)),

    updateFolder: (id: string, name: string) =>
      dispatch(updateFolder({ id, name })),

    deleteFolder: (id: string) => dispatch(deleteFolder(id)),

    moveSheetToFolder: (sheetId: string, folderId: string | null) =>
      dispatch(moveSheetToFolder({ sheetId, folderId })),

    clearFolders: () => dispatch(clearFolders()),

    clearError: () => dispatch(clearFoldersError()),
  };

  return {
    folders: foldersState.folders,
    loading: foldersState.loading,
    error: foldersState.error,
    initialized: foldersState.initialized,
    ...actions,
  };
};
