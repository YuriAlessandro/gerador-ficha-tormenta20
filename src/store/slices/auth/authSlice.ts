import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from 'firebase/auth';
import authService from '../../../services/auth.service';
import { AuthState, DbUser } from '../../../types/auth.types';

const initialState: AuthState = {
  firebaseUser: null,
  dbUser: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

// Async thunks
export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async () => {
    const result = await authService.loginWithGoogle();
    return {
      firebaseUser: {
        uid: result.firebaseUser.uid,
        email: result.firebaseUser.email,
        displayName: result.firebaseUser.displayName,
        photoURL: result.firebaseUser.photoURL,
      },
      dbUser: result.dbUser,
    };
  }
);

export const syncUser = createAsyncThunk('auth/syncUser', async () => {
  const dbUser = await authService.syncUser();
  return dbUser;
});

export const logout = createAsyncThunk('auth/logout', async () => {
  await authService.logout();
});

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (updates: {
    username?: string;
    fullName?: string;
    photoURL?: string;
  }) => {
    const updatedUser = await authService.updateProfile(updates);
    return updatedUser;
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setFirebaseUser: (state, action: PayloadAction<User | null>) => {
      if (action.payload) {
        state.firebaseUser = {
          uid: action.payload.uid,
          email: action.payload.email,
          displayName: action.payload.displayName,
          photoURL: action.payload.photoURL,
        } as User;
        state.isAuthenticated = true;
      } else {
        state.firebaseUser = null;
        state.isAuthenticated = false;
      }
    },
    setDbUser: (state, action: PayloadAction<DbUser | null>) => {
      state.dbUser = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearAuth: (state) => {
      state.firebaseUser = null;
      state.dbUser = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Google Login
    builder
      .addCase(loginWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.loading = false;
        state.firebaseUser = action.payload.firebaseUser as User;
        state.dbUser = action.payload.dbUser;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Google login failed';
      });

    // Sync User
    builder
      .addCase(syncUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(syncUser.fulfilled, (state, action) => {
        state.loading = false;
        state.dbUser = action.payload;
      })
      .addCase(syncUser.rejected, (state) => {
        state.loading = false;
      });

    // Logout
    builder.addCase(logout.fulfilled, (state) => {
      state.firebaseUser = null;
      state.dbUser = null;
      state.isAuthenticated = false;
      state.error = null;
    });

    // Update Profile
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.dbUser = action.payload;
    });
  },
});

export const { setFirebaseUser, setDbUser, setLoading, setError, clearAuth } =
  authSlice.actions;

export default authSlice.reducer;
