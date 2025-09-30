import { User } from 'firebase/auth';

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

export interface AuthState {
  firebaseUser: User | null;
  dbUser: DbUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  fullName?: string;
}