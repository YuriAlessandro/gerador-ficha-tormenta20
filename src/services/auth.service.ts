import {
  auth,
  signInWithPopup,
  googleProvider,
  signOut,
  updateProfile,
  User,
} from '../config/firebase';
import api from './api';

import { SupplementId } from '../types/supplement.types';
import { AccentColorId } from '../theme/accentColors';

export interface DbUser {
  _id: string;
  firebaseUid: string;
  email: string;
  username: string;
  fullName?: string;
  photoURL?: string;
  emailVerified: boolean;
  isPremium: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  savedSheets: string[];
  enabledSupplements?: SupplementId[];
  hasCompletedInitialSetup?: boolean;
  dice3DEnabled?: boolean;
  accentColor?: AccentColorId;
  darkMode?: boolean;
}

export interface AuthResponse {
  user: DbUser;
  isNewUser: boolean;
  message: string;
}

class AuthService {
  // Login/Register with Google and sync with backend
  static async loginWithGoogle(): Promise<{
    firebaseUser: User;
    dbUser: DbUser;
  }> {
    // Sign in with Google popup
    const userCredential = await signInWithPopup(auth, googleProvider);
    const { user: firebaseUser } = userCredential;

    // Sync with backend (creates user if doesn't exist)
    const { data } = await api.post<AuthResponse>('/api/auth/sync');

    return {
      firebaseUser,
      dbUser: data.user,
    };
  }

  // Sync current Firebase user with backend
  static async syncUser(): Promise<DbUser | null> {
    const { currentUser } = auth;
    if (!currentUser) return null;

    try {
      const { data } = await api.post<AuthResponse>('/api/auth/sync');
      return data.user;
    } catch {
      return null;
    }
  }

  // Get current user from backend
  static async getCurrentUser(): Promise<DbUser | null> {
    const { currentUser } = auth;
    if (!currentUser) return null;

    try {
      const { data } = await api.get<{ user: DbUser }>('/api/auth/me');
      return data.user;
    } catch {
      return null;
    }
  }

  // Update user profile
  static async updateProfile(updates: {
    username?: string;
    fullName?: string;
    photoURL?: string;
  }): Promise<DbUser> {
    const { data } = await api.put<{ user: DbUser; message: string }>(
      '/api/auth/profile',
      updates
    );

    // Update Firebase display name if fullName changed
    const { currentUser } = auth;
    if (updates.fullName && currentUser) {
      await updateProfile(currentUser, {
        displayName: updates.fullName,
      });
    }

    return data.user;
  }

  // Logout user
  static async logout(): Promise<void> {
    await signOut(auth);
  }

  // Delete user account
  static async deleteAccount(): Promise<void> {
    // Delete from backend first
    await api.delete('/api/auth/account');

    // Then delete from Firebase
    const { currentUser } = auth;
    if (currentUser) {
      await currentUser.delete();
    }
  }

  // Save system setup (supplements selection)
  static async saveSystemSetup(
    supplements: SupplementId[],
    completeSetup = true
  ): Promise<DbUser> {
    await api.put<{
      supplements: SupplementId[];
      hasCompletedInitialSetup: boolean;
    }>('/api/supplements/user', {
      supplements,
      completeSetup,
    });

    // Retorna usuário atualizado
    const user = await this.getCurrentUser();
    if (!user) {
      throw new Error('Failed to fetch updated user');
    }
    return user;
  }

  // Save 3D dice settings
  static async saveDice3DSettings(enabled: boolean): Promise<DbUser> {
    const { data } = await api.put<{ user: DbUser; message: string }>(
      '/api/auth/profile',
      {
        dice3DEnabled: enabled,
      }
    );

    return data.user;
  }

  // Save appearance settings (accent color and dark mode)
  static async saveAppearanceSettings(settings: {
    accentColor?: AccentColorId;
    darkMode?: boolean;
  }): Promise<DbUser> {
    const { data } = await api.put<{ user: DbUser; message: string }>(
      '/api/auth/profile',
      settings
    );

    return data.user;
  }
}

export default AuthService;
