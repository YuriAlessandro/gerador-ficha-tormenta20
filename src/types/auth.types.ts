import { User } from 'firebase/auth';
import { SystemId } from './system.types';
import { SupplementId } from './supplement.types';
import { AccentColorId } from '../theme/accentColors';
import { DiceColorId } from './diceColors';

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
  diceColor?: DiceColorId;
  accentColor?: AccentColorId;
  darkMode?: boolean;
  bestiaryAnonymous?: boolean;
  /** Layout da biblioteca copiado para toda ficha nova (ver backend). */
  defaultSheetLayoutId?: string | null;
  termsAcceptedVersion?: number;
  /**
   * Tours guiados vistos/dispensados, por id de tour. Escrito só pelo motor de
   * tours (`PATCH /api/auth/tours`); o app público apenas carrega o campo.
   */
  onboarding?: {
    tours?: Record<string, { v: number; s: 'done' | 'dismissed'; at: string }>;
    offersOff?: boolean;
  };
  isModerator?: boolean;
  isEditor?: boolean;
  isAdmin?: boolean;
}

export interface AuthState {
  firebaseUser: User | null;
  dbUser: DbUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}
