import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { SystemId } from '../types/system.types';
import {
  setSelectedSystem,
  setAvailableSystems,
  setLoading,
  setError,
} from '../store/slices/system/systemSlice';
import { dataRegistry } from '../data/registry';

/**
 * Hook for managing game system selection and data
 */
export function useSystem() {
  const dispatch = useDispatch();
  const { selectedSystem, availableSystems, loading, error } = useSelector(
    (state: RootState) => state.system
  );

  /**
   * Changes the current game system
   */
  const changeSystem = useCallback(
    (systemId: SystemId) => {
      dispatch(setSelectedSystem(systemId));
      dataRegistry.setCurrentSystem(systemId);
    },
    [dispatch]
  );

  /**
   * Fetches available systems from the backend
   */
  const fetchAvailableSystems = useCallback(async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const response = await fetch(
        `${
          process.env.REACT_APP_API_URL || 'http://localhost:3001'
        }/api/systems`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch available systems');
      }

      const data = await response.json();
      dispatch(setAvailableSystems(data.systems));
    } catch (err) {
      const fetchError = err as Error;
      dispatch(setError(fetchError.message));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  /**
   * Syncs the selected system with backend if user is authenticated
   */
  const syncSystemWithBackend = useCallback(
    async (systemId: SystemId, firebaseToken?: string) => {
      if (!firebaseToken) return;

      try {
        const response = await fetch(
          `${
            process.env.REACT_APP_API_URL || 'http://localhost:3001'
          }/api/systems/user`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${firebaseToken}`,
            },
            body: JSON.stringify({ systemId }),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to sync system with backend');
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error syncing system with backend:', err);
        // Don't throw - system selection should work offline
      }
    },
    []
  );

  /**
   * Initialize the data registry with the current system
   */
  useEffect(() => {
    dataRegistry.setCurrentSystem(selectedSystem);
  }, [selectedSystem]);

  return {
    selectedSystem,
    availableSystems,
    loading,
    error,
    changeSystem,
    fetchAvailableSystems,
    syncSystemWithBackend,
  };
}
