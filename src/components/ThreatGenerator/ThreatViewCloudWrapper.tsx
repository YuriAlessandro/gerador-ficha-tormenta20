/* eslint-disable no-console */
/* eslint-disable react/jsx-boolean-value */
import React, { useState, useEffect, useRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PublicIcon from '@mui/icons-material/Public';
import SheetsService, {
  type UpdateSheetRequest,
} from '@/services/sheets.service';
import { useSheets } from '@/hooks/useSheets';
import {
  ThreatSheet,
  normalizeThreatSheet,
} from '../../interfaces/ThreatSheet';
import ThreatResult from './ThreatResult';
import { PublishBestiaryModal } from '../../premium';

export interface FolderInfo {
  folderId: string;
  folderName: string;
}

const ThreatViewCloudWrapper: React.FC = () => {
  const history = useHistory();
  const location = useLocation<{
    cloudThreatId?: string;
    folderInfo?: FolderInfo;
  }>();

  const [threat, setThreat] = useState<ThreatSheet | null>(null);
  const [cloudThreatId, setCloudThreatId] = useState<string | null>(null);
  const [folderInfo, setFolderInfo] = useState<FolderInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);
  const idExtracted = useRef(false);
  const { updateSheet } = useSheets();

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
    if (location.state?.folderInfo) {
      setFolderInfo(location.state.folderInfo);
    }

    // Clear the state to prevent reloading on subsequent renders
    history.replace('/threat-view', {});

    const loadThreat = async () => {
      try {
        setLoading(true);
        const fullSheet = await SheetsService.getSheetById(id);
        const threatData = normalizeThreatSheet(
          fullSheet.sheetData as unknown as ThreatSheet
        );
        if (fullSheet.image) {
          threatData.imageUrl = fullSheet.image;
        }
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

  // Condições e PV/PM atuais mudados na ficha vão para a nuvem na hora.
  const handleThreatUpdate = async (updated: ThreatSheet) => {
    setThreat(updated);
    if (!cloudThreatId) return;
    try {
      await updateSheet(cloudThreatId, {
        name: updated.name,
        sheetData: {
          ...updated,
          isThreat: true,
        } as unknown as UpdateSheetRequest['sheetData'],
        image: updated.imageUrl,
      }).unwrap();
    } catch (err) {
      console.error('Failed to update cloud threat:', err);
    }
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
        <Typography
          variant='body2'
          sx={{
            color: 'text.secondary',
          }}
        >
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
    <Box>
      <Container maxWidth='xl' sx={{ pt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant='outlined'
            color='secondary'
            startIcon={<PublicIcon />}
            onClick={() => setPublishOpen(true)}
          >
            Publicar no Bestiário
          </Button>
        </Box>
      </Container>
      <ThreatResult
        threat={threat}
        onEdit={handleEdit}
        isFromHistory={false}
        isSavedToCloud
        onSaveToCloud={async () => {}}
        folderInfo={folderInfo}
        onThreatUpdate={handleThreatUpdate}
        enableVitalsTracker
      />
      {cloudThreatId && (
        <PublishBestiaryModal
          open={publishOpen}
          presetSheetId={cloudThreatId}
          presetName={threat.name}
          onClose={() => setPublishOpen(false)}
          onSuccess={(pub) => {
            setPublishOpen(false);
            history.push(`/bestiario/${pub.id}`);
          }}
        />
      )}
    </Box>
  );
};

export default ThreatViewCloudWrapper;
