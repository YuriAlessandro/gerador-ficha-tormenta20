import React from 'react';
import { Alert, Box, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useSelector } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';
import { RootState } from '../../store';
import ThreatResult from './ThreatResult';

const ThreatViewWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const threat = useSelector((state: RootState) =>
    state.threatStorage.threats.find((t) => t.id === id)
  );

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

  return <ThreatResult threat={threat} isFromHistory />;
};

export default ThreatViewWrapper;
