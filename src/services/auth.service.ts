import {
  auth,
  signInWithPopup,
  googleProvider,
  signOut,
  updateProfile,
  User,
} from '../config/firebase';
import api from './api';

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
}

export default AuthService;
