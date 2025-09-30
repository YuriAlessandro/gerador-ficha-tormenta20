import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
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
  // Register new user with Firebase and sync with backend
  async register(
    email: string,
    password: string,
    fullName?: string
  ): Promise<{ firebaseUser: User; dbUser: DbUser }> {
    try {
      // Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      // Update display name if provided
      if (fullName) {
        await updateProfile(firebaseUser, { displayName: fullName });
      }

      // Sync with backend
      const { data } = await api.post<AuthResponse>('/api/auth/sync');

      return {
        firebaseUser,
        dbUser: data.user,
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Login user with Firebase and sync with backend
  async login(
    email: string,
    password: string
  ): Promise<{ firebaseUser: User; dbUser: DbUser }> {
    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      // Sync with backend
      const { data } = await api.post<AuthResponse>('/api/auth/sync');

      return {
        firebaseUser,
        dbUser: data.user,
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Sync current Firebase user with backend
  async syncUser(): Promise<DbUser | null> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return null;

      const { data } = await api.post<AuthResponse>('/api/auth/sync');
      return data.user;
    } catch (error) {
      console.error('Sync error:', error);
      return null;
    }
  }

  // Get current user from backend
  async getCurrentUser(): Promise<DbUser | null> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return null;

      const { data } = await api.get<{ user: DbUser }>('/api/auth/me');
      return data.user;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  // Update user profile
  async updateProfile(updates: {
    username?: string;
    fullName?: string;
    photoURL?: string;
  }): Promise<DbUser> {
    try {
      const { data } = await api.put<{ user: DbUser; message: string }>(
        '/api/auth/profile',
        updates
      );

      // Update Firebase display name if fullName changed
      if (updates.fullName && auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: updates.fullName });
      }

      return data.user;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  // Send password reset email
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  // Delete user account
  async deleteAccount(): Promise<void> {
    try {
      // Delete from backend first
      await api.delete('/api/auth/account');

      // Then delete from Firebase
      if (auth.currentUser) {
        await auth.currentUser.delete();
      }
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
  }
}

export default new AuthService();