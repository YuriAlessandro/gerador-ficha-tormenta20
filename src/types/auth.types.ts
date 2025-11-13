import { User } from 'firebase/auth';
import { SystemId } from './system.types';
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
  selectedSystem?: SystemId;
  enabledSupplements?: SupplementId[];
  hasCompletedInitialSetup?: boolean;
  dice3DEnabled?: boolean;
}

export interface AuthState {
  firebaseUser: User | null;
  dbUser: DbUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}
