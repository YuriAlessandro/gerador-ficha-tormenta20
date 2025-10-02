import React, { useState } from 'react';
import { Alert, Box, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useSelector } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';
import { RootState } from '../../store';
import { useAuth } from '../../hooks/useAuth';
import { useSheets } from '../../hooks/useSheets';
import { useAlert } from '../../hooks/useDialog';
import ThreatResult from './ThreatResult';

const ThreatViewWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { isAuthenticated } = useAuth();
  const { createSheet: createSheetAction } = useSheets();
  const { showAlert } = useAlert();

  const threat = useSelector((state: RootState) =>
    state.threatStorage.threats.find((t) => t.id === id)
  );

  const [isSavedToCloud, setIsSavedToCloud] = useState(false);
  const [cloudThreatId, setCloudThreatId] = useState<string | null>(null);

  const handleSaveToCloud = async () => {
    if (!isAuthenticated || !threat || isSavedToCloud) return;

    try {
      // Create sheet in cloud with isThreat flag
      const result = await createSheetAction({
        name: threat.name,
        sheetData: {
          ...threat,
          isThreat: true,
        } as any,
      });

      if (result.type.endsWith('/fulfilled')) {
        const cloudSheet = result.payload as any;
        setCloudThreatId(cloudSheet.id);
        setIsSavedToCloud(true);
        showAlert('Ameaça salva na nuvem com sucesso!', 'Sucesso');
      }
    } catch (error) {
      console.error('Failed to save threat to cloud:', error);
      showAlert(
        'Não foi possível salvar a ameaça na nuvem. Ela permanece salva localmente.',
        'Erro ao Salvar'
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
          onClick={() => history.push('/threat-history')}
        >
          Voltar ao Histórico
        </Button>
      </Box>
    );
  }

  return (
    <ThreatResult
      threat={threat}
      isFromHistory
      isSavedToCloud={isSavedToCloud}
      onSaveToCloud={handleSaveToCloud}
    />
  );
};

export default ThreatViewWrapper;
