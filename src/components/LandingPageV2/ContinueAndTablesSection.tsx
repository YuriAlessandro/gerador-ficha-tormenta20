import React, { useMemo } from 'react';
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
  const { tables } = useGameTable();

  const activeTable = useMemo(() => {
    if (!isAuthenticated) return null;
    return tables.find((t) => t.status === GameTableStatus.ACTIVE) ?? null;
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
      <VirtualTablesColumn onClickButton={onClickButton} tables={tables} />
    </Box>
  );
};

export default ContinueAndTablesSection;
