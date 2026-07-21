import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from './useAuth';
import { saveAppearanceSettings } from '../store/slices/auth/authSlice';
import { AppDispatch, RootState } from '../store';
import {
  AccentColorId,
  DEFAULT_ACCENT_COLOR,
  ACCENT_COLOR_STORAGE_KEY,
  isValidAccentColorId,
  isAccentColorAllowed,
} from '../theme/accentColors';
import { SubscriptionStatus, SupportLevel } from '../types/subscription.types';

const DARK_MODE_STORAGE_KEY = 'dkmFdn';

interface SupporterState {
  isSupporter: boolean;
  /**
   * Falso enquanto o usuário está autenticado mas a assinatura ainda não foi
   * carregada. Nesse intervalo NÃO podemos tratá-lo como não-apoiador: isso
   * faria a cor de um apoiador piscar no vermelho (e, pior, seria persistido).
   */
  known: boolean;
}

/**
 * Supporter status derived straight from the (persisted) subscription slice.
 *
 * Lê o estado em vez de usar `useSubscription` de propósito: aquele hook
 * dispara um fetch a cada montagem, e este roda em todo consumidor de
 * `useAccentSectionBg`.
 */
const useSupporterState = (isAuthenticated: boolean): SupporterState => {
  const subscription = useSelector(
    (state: RootState) => state.subscription.subscription
  );

  return useMemo(() => {
    if (!isAuthenticated) return { isSupporter: false, known: true };
    if (!subscription) return { isSupporter: false, known: false };
    return {
      isSupporter:
        subscription.tier !== SupportLevel.FREE &&
        subscription.status === SubscriptionStatus.ACTIVE,
      known: true,
    };
  }, [isAuthenticated, subscription]);
};

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
  const supporter = useSupporterState(isAuthenticated);

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
    let current = localAccentColor;
    if (isAuthenticated && user?.accentColor) {
      current = isValidAccentColorId(user.accentColor)
        ? user.accentColor
        : localAccentColor;
    }

    // Cor exclusiva de apoiador em conta que não apoia (assinatura encerrada,
    // ou tema que deixou de ser gratuito) → volta para a cor padrão.
    if (
      supporter.known &&
      !isAccentColorAllowed(current, supporter.isSupporter)
    ) {
      return DEFAULT_ACCENT_COLOR;
    }
    return current;
  }, [
    isAuthenticated,
    user?.accentColor,
    localAccentColor,
    supporter.known,
    supporter.isSupporter,
  ]);

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

/**
 * Persists the fallback applied by `useUserPreferences` when the stored accent
 * color is no longer available to the user (fim do apoio, ou tema que deixou de
 * ser gratuito — caso dos antigos temas comemorativos da Copa 2026).
 *
 * Deve ser chamado UMA única vez, no topo da aplicação: dispara escrita
 * (localStorage/backend) e não faz sentido rodar em cada consumidor.
 */
export const useEnforceAccentColorAccess = (): void => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const supporter = useSupporterState(isAuthenticated);
  // Uma correção por sessão: sem isso, um PUT que falhe seria repetido a cada
  // render em que a dependência mudasse.
  const enforcedRef = useRef(false);

  useEffect(() => {
    if (authLoading || !supporter.known || enforcedRef.current) return;

    const stored = isAuthenticated ? user?.accentColor : getStoredAccentColor();

    if (!stored || !isValidAccentColorId(stored)) return;
    if (isAccentColorAllowed(stored, supporter.isSupporter)) return;

    enforcedRef.current = true;

    try {
      localStorage.setItem(ACCENT_COLOR_STORAGE_KEY, DEFAULT_ACCENT_COLOR);
    } catch {
      // localStorage not available
    }

    if (isAuthenticated) {
      dispatch(saveAppearanceSettings({ accentColor: DEFAULT_ACCENT_COLOR }));
    }
  }, [
    authLoading,
    isAuthenticated,
    user?.accentColor,
    supporter.known,
    supporter.isSupporter,
    dispatch,
  ]);
};

export default useUserPreferences;
