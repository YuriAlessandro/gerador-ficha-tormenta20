/* eslint-disable no-console */
/* eslint-disable react/jsx-boolean-value */
import React, { useState, useEffect, useRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SheetsService from '@/services/sheets.service';
import {
  ThreatSheet,
  normalizeThreatSheet,
} from '../../interfaces/ThreatSheet';
import ThreatResult from './ThreatResult';

const ThreatViewCloudWrapper: React.FC = () => {
  const history = useHistory();
  const location = useLocation<{ cloudThreatId?: string }>();

  const [threat, setThreat] = useState<ThreatSheet | null>(null);
  const [cloudThreatId, setCloudThreatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const idExtracted = useRef(false);

  useEffect(() => {
    // Only extract id from location.state once
    if (idExtracted.current) return;

    const id = location.state?.cloudThreatId;
    if (!id) {
      setLoading(false);
      setError('Ameaça não encontrada!');
      return;
    }

    idExtracted.current = true;
    setCloudThreatId(id);

    // Clear the state to prevent reloading on subsequent renders
    history.replace('/threat-view', {});

    const loadThreat = async () => {
      try {
        setLoading(true);
        const fullSheet = await SheetsService.getSheetById(id);
        const threatData = normalizeThreatSheet(
          fullSheet.sheetData as unknown as ThreatSheet
        );
        setThreat(threatData);
      } catch (err) {
        console.error('Failed to load threat from cloud:', err);
        setError('Não foi possível carregar a ameaça.');
      } finally {
        setLoading(false);
      }
    };

    loadThreat();
  }, [location.state, history]);

  const handleEdit = () => {
    if (!threat || !cloudThreatId) return;

    // Navigate to generator with full threat data for editing
    history.push('/gerador-ameacas', {
      cloudThreat: {
        id: cloudThreatId,
        sheetData: threat,
      },
    });
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography variant='body2' color='text.secondary'>
          Carregando ameaça...
        </Typography>
      </Box>
    );
  }

  if (error || !threat) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity='error' sx={{ mb: 2 }}>
          {error || 'Ameaça não encontrada!'}
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
      isSavedToCloud
      onSaveToCloud={async () => {}}
    />
  );
};

export default ThreatViewCloudWrapper;
