import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Alert, Box, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../../hooks/useAuth';
import { useSheets } from '../../hooks/useSheets';
import { useAlert } from '../../hooks/useDialog';
import { ThreatSheet } from '../../interfaces/ThreatSheet';
import ThreatResult from './ThreatResult';

interface CloudThreatData {
  id: string;
  name: string;
  sheetData: any;
  image?: string;
  description?: string;
  updatedAt: string;
}

const ThreatViewCloudWrapper: React.FC = () => {
  const history = useHistory();
  const location = useLocation<{ cloudThreat?: CloudThreatData }>();
  const { isAuthenticated } = useAuth();
  const { updateSheet: updateSheetAction } = useSheets();
  const { showAlert } = useAlert();

  const [threat, setThreat] = useState<ThreatSheet | null>(null);
  const [cloudThreatId, setCloudThreatId] = useState<string | null>(null);

  useEffect(() => {
    if (location.state?.cloudThreat) {
      const cloudThreat = location.state.cloudThreat;

      // Extract threat from cloudThreat.sheetData
      const threatData = cloudThreat.sheetData as ThreatSheet;

      setThreat(threatData);
      setCloudThreatId(cloudThreat.id);

      // Clear the state to prevent reloading on subsequent renders
      history.replace('/threat-view', {});
    }
  }, [location.state, history]);

  const handleEdit = () => {
    if (!threat || !cloudThreatId) return;

    // Navigate to generator with threat data for editing
    history.push('/gerador-ameacas', {
      cloudThreat: {
        id: cloudThreatId,
        sheetData: threat,
      },
    });
  };

  const handleUpdate = async (updatedThreat: ThreatSheet) => {
    if (!cloudThreatId) return;

    try {
      // Update in Redux state (for immediate UI update)
      await updateSheetAction(cloudThreatId, {
        name: updatedThreat.name,
        sheetData: {
          ...updatedThreat,
          isThreat: true,
        } as any,
      });

      setThreat(updatedThreat);
    } catch (error) {
      console.error('Failed to update cloud threat:', error);
      showAlert(
        'Não foi possível atualizar a ameaça na nuvem.',
        'Erro ao Atualizar'
      );
    }
  };

  if (!threat) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity='error' sx={{ mb: 2 }}>
          Ameaça não encontrada!
        </Alert>
        <Button
          variant='contained'
          startIcon={<ArrowBackIcon />}
          onClick={() => history.push('/meus-personagens')}
        >
          Voltar a Meus Personagens
        </Button>
      </Box>
    );
  }

  return (
    <ThreatResult
      threat={threat}
      onEdit={handleEdit}
      isFromHistory={false}
      isSavedToCloud={true}
      onSaveToCloud={async () => {}} // Already saved, so no-op
    />
  );
};

export default ThreatViewCloudWrapper;
