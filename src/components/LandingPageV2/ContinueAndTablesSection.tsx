import React, { useEffect, useMemo, useRef } from 'react';
import { Box } from '@mui/material';
import { useGameTable } from '../../premium/hooks/useGameTable';
import { GameTableStatus } from '../../premium/services/gameTable.service';
import ContinueJourneySection from './ContinueJourneySection';
import VirtualTablesColumn from './VirtualTablesColumn';
import ActiveSessionBanner from './ActiveSessionBanner';

interface ContinueAndTablesSectionProps {
  onClickButton: (link: string) => void;
  isAuthenticated: boolean;
}

const ContinueAndTablesSection: React.FC<ContinueAndTablesSectionProps> = ({
  onClickButton,
  isAuthenticated,
}) => {
  // useGameTable always runs (React rules of hooks); we ignore its data
  // when the user is not authenticated.
  const { tables, fetchUserTables } = useGameTable();

  // Tables are only fetched on demand. Without this, the home renders the
  // "Crie sua primeira mesa" empty state for users who have tables until
  // they visit /mesas and come back.
  const hasFetchedRef = useRef(false);
  useEffect(() => {
    if (!isAuthenticated || hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchUserTables().catch(() => {
      hasFetchedRef.current = false;
    });
  }, [isAuthenticated, fetchUserTables]);

  const activeTable = useMemo(() => {
    if (!isAuthenticated) return null;
    return tables.find((t) => t.status === GameTableStatus.ACTIVE) ?? null;
  }, [tables, isAuthenticated]);

  const recentTables = useMemo(() => {
    if (!isAuthenticated || tables.length === 0) return [];
    return [...tables].sort((a, b) => {
      const aTime = new Date(a.updatedAt).getTime();
      const bTime = new Date(b.updatedAt).getTime();
      return bTime - aTime;
    });
  }, [tables, isAuthenticated]);

  // 1. Unauthenticated → start-your-journey CTAs (handled inside ContinueJourneySection)
  if (!isAuthenticated) {
    return (
      <ContinueJourneySection
        onClickButton={onClickButton}
        isAuthenticated={isAuthenticated}
      />
    );
  }

  // 2. Active table → full-width spotlight
  if (activeTable) {
    return (
      <ActiveSessionBanner onClickButton={onClickButton} table={activeTable} />
    );
  }

  // 3. Default → two columns: recent sheets + tables
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
        gap: { xs: 3, sm: 3 },
        alignItems: 'start',
      }}
    >
      <ContinueJourneySection
        onClickButton={onClickButton}
        isAuthenticated={isAuthenticated}
      />
      <VirtualTablesColumn
        onClickButton={onClickButton}
        tables={recentTables}
      />
    </Box>
  );
};

export default ContinueAndTablesSection;
