import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import FoldersService, { Folder } from '../../../services/folders.service';

export interface FoldersState {
  folders: Folder[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

const initialState: FoldersState = {
  folders: [],
  loading: false,
  error: null,
  initialized: false,
};

// Async thunks
export const fetchFolders = createAsyncThunk(
  'folders/fetchFolders',
  async () => {
    const folders = await FoldersService.getUserFolders();
    return folders;
  }
);

export const createFolder = createAsyncThunk(
  'folders/createFolder',
  async (name: string) => {
    const folder = await FoldersService.createFolder(name);
    return folder;
  }
);

export const updateFolder = createAsyncThunk(
  'folders/updateFolder',
  async ({ id, name }: { id: string; name: string }) => {
    const folder = await FoldersService.updateFolder(id, name);
    return folder;
  }
);

export const deleteFolder = createAsyncThunk(
  'folders/deleteFolder',
  async (id: string) => {
    await FoldersService.deleteFolder(id);
    return id;
  }
);

export const moveSheetToFolder = createAsyncThunk(
  'folders/moveSheetToFolder',
  async ({
    sheetId,
    folderId,
  }: {
    sheetId: string;
    folderId: string | null;
  }) => {
    await FoldersService.moveSheetToFolder(sheetId, folderId);
    return { sheetId, folderId };
  }
);

// Slice
const foldersSlice = createSlice({
  name: 'folders',
  initialState,
  reducers: {
    clearFolders: (state) => {
      state.folders = [];
      state.initialized = false;
      state.error = null;
    },
    clearFoldersError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch folders
    builder
      .addCase(fetchFolders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFolders.fulfilled, (state, action) => {
        state.loading = false;
        state.folders = action.payload;
        state.initialized = true;
        state.error = null;
      })
      .addCase(fetchFolders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch folders';
        state.initialized = true;
      });

    // Create folder
    builder
      .addCase(createFolder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createFolder.fulfilled, (state, action) => {
        state.loading = false;
        state.folders.push(action.payload);
        state.error = null;
      })
      .addCase(createFolder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create folder';
      });

    // Update folder
    builder
      .addCase(updateFolder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateFolder.fulfilled,
        (state, action: PayloadAction<Folder>) => {
          state.loading = false;
          const index = state.folders.findIndex(
            (f) => f.id === action.payload.id
          );
          if (index !== -1) {
            state.folders[index] = action.payload;
          }
          state.error = null;
        }
      )
      .addCase(updateFolder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update folder';
      });

    // Delete folder
    builder
      .addCase(deleteFolder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteFolder.fulfilled, (state, action) => {
        state.loading = false;
        state.folders = state.folders.filter((f) => f.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteFolder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete folder';
      });

    // Move sheet to folder (no folder state change needed, but clear loading)
    builder
      .addCase(moveSheetToFolder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(moveSheetToFolder.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(moveSheetToFolder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to move sheet';
      });
  },
});

export const { clearFolders, clearFoldersError } = foldersSlice.actions;

export default foldersSlice.reducer;
