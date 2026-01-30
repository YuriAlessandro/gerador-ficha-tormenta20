import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useAuth } from './useAuth';
import { saveAppearanceSettings } from '../store/slices/auth/authSlice';
import { AppDispatch } from '../store';
import {
  AccentColorId,
  DEFAULT_ACCENT_COLOR,
  ACCENT_COLOR_STORAGE_KEY,
  isValidAccentColorId,
} from '../theme/accentColors';

const DARK_MODE_STORAGE_KEY = 'dkmFdn';

/**
 * Get initial accent color from localStorage
 */
const getStoredAccentColor = (): AccentColorId => {
  try {
    const stored = localStorage.getItem(ACCENT_COLOR_STORAGE_KEY);
    if (stored && isValidAccentColorId(stored)) {
      return stored;
    }
  } catch {
    // localStorage not available
  }
  return DEFAULT_ACCENT_COLOR;
};

/**
 * Get initial dark mode from localStorage
 */
const getStoredDarkMode = (): boolean => {
  try {
    const stored = localStorage.getItem(DARK_MODE_STORAGE_KEY);
    if (stored !== null) {
      return stored === 'true';
    }
  } catch {
    // localStorage not available
  }
  return false;
};

export interface UseUserPreferencesReturn {
  accentColor: AccentColorId;
  darkMode: boolean;
  setAccentColor: (color: AccentColorId) => void;
  setDarkMode: (enabled: boolean) => void;
  loading: boolean;
}

/**
 * Hook to manage user appearance preferences (accent color and dark mode)
 *
 * - For non-authenticated users: uses localStorage
 * - For authenticated users: syncs with backend
 * - Provides immediate UI updates regardless of auth state
 */
export const useUserPreferences = (): UseUserPreferencesReturn => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // Local state initialized from localStorage for immediate response
  const [localAccentColor, setLocalAccentColor] =
    useState<AccentColorId>(getStoredAccentColor);
  const [localDarkMode, setLocalDarkMode] =
    useState<boolean>(getStoredDarkMode);
  const [saving, setSaving] = useState(false);

  // Sync local state with user preferences when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // If user has preferences set in DB, use those
      if (user.accentColor && isValidAccentColorId(user.accentColor)) {
        setLocalAccentColor(user.accentColor);
        // Also update localStorage for consistency
        try {
          localStorage.setItem(ACCENT_COLOR_STORAGE_KEY, user.accentColor);
        } catch {
          // localStorage not available
        }
      }

      if (user.darkMode !== undefined) {
        setLocalDarkMode(user.darkMode);
        // Also update localStorage for consistency
        try {
          localStorage.setItem(DARK_MODE_STORAGE_KEY, String(user.darkMode));
        } catch {
          // localStorage not available
        }
      }
    }
  }, [isAuthenticated, user]);

  // Set accent color
  const setAccentColor = useCallback(
    (color: AccentColorId) => {
      // Update local state immediately for responsive UI
      setLocalAccentColor(color);

      // Save to localStorage
      try {
        localStorage.setItem(ACCENT_COLOR_STORAGE_KEY, color);
      } catch {
        // localStorage not available
      }

      // If authenticated, also save to backend
      if (isAuthenticated) {
        setSaving(true);
        dispatch(saveAppearanceSettings({ accentColor: color })).finally(() => {
          setSaving(false);
        });
      }
    },
    [dispatch, isAuthenticated]
  );

  // Set dark mode
  const setDarkMode = useCallback(
    (enabled: boolean) => {
      // Update local state immediately for responsive UI
      setLocalDarkMode(enabled);

      // Save to localStorage
      try {
        localStorage.setItem(DARK_MODE_STORAGE_KEY, String(enabled));
      } catch {
        // localStorage not available
      }

      // If authenticated, also save to backend
      if (isAuthenticated) {
        setSaving(true);
        dispatch(saveAppearanceSettings({ darkMode: enabled })).finally(() => {
          setSaving(false);
        });
      }
    },
    [dispatch, isAuthenticated]
  );

  // Compute final values - prefer DB user preferences when authenticated
  const accentColor = useMemo(() => {
    if (isAuthenticated && user?.accentColor) {
      return isValidAccentColorId(user.accentColor)
        ? user.accentColor
        : localAccentColor;
    }
    return localAccentColor;
  }, [isAuthenticated, user?.accentColor, localAccentColor]);

  const darkMode = useMemo(() => {
    if (isAuthenticated && user?.darkMode !== undefined) {
      return user.darkMode;
    }
    return localDarkMode;
  }, [isAuthenticated, user?.darkMode, localDarkMode]);

  return {
    accentColor,
    darkMode,
    setAccentColor,
    setDarkMode,
    loading: authLoading || saving,
  };
};

export default useUserPreferences;
