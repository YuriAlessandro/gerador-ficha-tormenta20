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
import { UpdateFolderPayload } from '../services/folders.service';
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

    createFolder: (name: string, parentId: string | null = null) =>
      dispatch(createFolder({ name, parentId })),

    updateFolder: (id: string, payload: UpdateFolderPayload) =>
      dispatch(updateFolder({ id, payload })),

    deleteFolder: (id: string, newParentId: string | null = null) =>
      dispatch(deleteFolder({ id, newParentId })),

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
