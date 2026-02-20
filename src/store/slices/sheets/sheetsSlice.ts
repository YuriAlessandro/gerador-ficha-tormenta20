import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import sheetsService, {
  SheetData,
  SheetListData,
  CreateSheetRequest,
  UpdateSheetRequest,
} from '../../../services/sheets.service';

export interface SheetsState {
  sheets: SheetListData[];
  currentSheet: SheetData | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

const initialState: SheetsState = {
  sheets: [],
  currentSheet: null,
  loading: false,
  error: null,
  initialized: false,
};

// Async thunks
export const fetchUserSheets = createAsyncThunk(
  'sheets/fetchUserSheets',
  async () => {
    const sheets = await sheetsService.getUserSheets();
    return sheets;
  }
);

export const fetchSheetById = createAsyncThunk(
  'sheets/fetchSheetById',
  async (id: string) => {
    const sheet = await sheetsService.getSheetById(id);
    return sheet;
  }
);

export const createSheet = createAsyncThunk(
  'sheets/createSheet',
  async (sheetRequest: CreateSheetRequest) => {
    const sheet = await sheetsService.createSheet(sheetRequest);
    return sheet;
  }
);

export const updateSheet = createAsyncThunk(
  'sheets/updateSheet',
  async ({ id, updates }: { id: string; updates: UpdateSheetRequest }) => {
    const sheet = await sheetsService.updateSheet(id, updates);
    return sheet;
  }
);

export const deleteSheet = createAsyncThunk(
  'sheets/deleteSheet',
  async (id: string) => {
    await sheetsService.deleteSheet(id);
    return id;
  }
);

export const duplicateSheet = createAsyncThunk(
  'sheets/duplicateSheet',
  async (id: string) => {
    const sheet = await sheetsService.duplicateSheet(id);
    return sheet;
  }
);

// Slice
const sheetsSlice = createSlice({
  name: 'sheets',
  initialState,
  reducers: {
    clearSheets: (state) => {
      state.sheets = [];
      state.currentSheet = null;
      state.initialized = false;
      state.error = null;
    },
    setCurrentSheet: (state, action: PayloadAction<SheetData | null>) => {
      state.currentSheet = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch user sheets
    builder
      .addCase(fetchUserSheets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserSheets.fulfilled, (state, action) => {
        state.loading = false;
        state.sheets = action.payload;
        state.initialized = true;
        state.error = null;
      })
      .addCase(fetchUserSheets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch sheets';
        state.initialized = true; // Prevent infinite retry loop
      });

    // Fetch sheet by ID
    builder
      .addCase(fetchSheetById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSheetById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSheet = action.payload;
        state.error = null;
      })
      .addCase(fetchSheetById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch sheet';
      });

    // Create sheet
    builder
      .addCase(createSheet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSheet.fulfilled, (state, action) => {
        state.loading = false;
        state.sheets.unshift(sheetsService.toSheetListData(action.payload));
        state.currentSheet = action.payload;
        state.error = null;
      })
      .addCase(createSheet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create sheet';
      });

    // Update sheet
    builder
      .addCase(updateSheet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSheet.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.sheets.findIndex(
          (sheet) => sheet.id === action.payload.id
        );
        if (index !== -1) {
          state.sheets[index] = sheetsService.toSheetListData(action.payload);
        }
        if (state.currentSheet && state.currentSheet.id === action.payload.id) {
          state.currentSheet = action.payload;
        }
        state.error = null;
      })
      .addCase(updateSheet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update sheet';
      });

    // Delete sheet
    builder
      .addCase(deleteSheet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSheet.fulfilled, (state, action) => {
        state.loading = false;
        state.sheets = state.sheets.filter(
          (sheet) => sheet.id !== action.payload
        );
        if (state.currentSheet && state.currentSheet.id === action.payload) {
          state.currentSheet = null;
        }
        state.error = null;
      })
      .addCase(deleteSheet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete sheet';
      });

    // Duplicate sheet
    builder
      .addCase(duplicateSheet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(duplicateSheet.fulfilled, (state, action) => {
        state.loading = false;
        state.sheets.unshift(sheetsService.toSheetListData(action.payload));
        state.error = null;
      })
      .addCase(duplicateSheet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to duplicate sheet';
      });
  },
});

export const { clearSheets, setCurrentSheet, clearError, setLoading } =
  sheetsSlice.actions;

export default sheetsSlice.reducer;
