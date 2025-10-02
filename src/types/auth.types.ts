import { User } from 'firebase/auth';
import { SupplementId } from './supplement.types';

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
}

export interface AuthState {
  firebaseUser: User | null;
  dbUser: DbUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}
