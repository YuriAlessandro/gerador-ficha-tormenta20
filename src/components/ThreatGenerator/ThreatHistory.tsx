import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { RootState } from '../../store';
import { deleteThreat, selectThreat } from '../../store/slices/threatStorage';
import { ThreatSheet } from '../../interfaces/ThreatSheet';
import {
  getTierDisplayName,
  getTierByChallengeLevel,
} from '../../functions/threatGenerator';
import { useSheetLimit } from '../../hooks/useSheetLimit';
import { useSubscription } from '../../hooks/useSubscription';
import { SubscriptionTier } from '../../types/subscription.types';
import SheetLimitDialog from '../common/SheetLimitDialog';

const ThreatHistory: React.FC = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const threats = useSelector(
    (state: RootState) => state.threatStorage.threats
  );
  const { tier } = useSubscription();
  const { menaceCount, maxMenaceSheets, canCreateMenace } = useSheetLimit();
  const [searchTerm, setSearchTerm] = useState('');
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    threatId: string | null;
    threatName: string;
  }>({ open: false, threatId: null, threatName: '' });

  const filteredThreats = threats.filter(
    (threat) =>
      threat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      threat.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      threat.challengeLevel.toString().includes(searchTerm)
  );

  const handleView = (threat: ThreatSheet) => {
    dispatch(selectThreat(threat.id));
    history.push(`/threat/${threat.id}`);
  };

  const handleEdit = (threat: ThreatSheet) => {
    dispatch(selectThreat(threat.id));
    history.push(`/threat-generator?edit=${threat.id}`);
  };

  const handleDelete = (threatId: string) => {
    dispatch(deleteThreat(threatId));
    setDeleteDialog({ open: false, threatId: null, threatName: '' });
  };

  const confirmDelete = (threat: ThreatSheet) => {
    setDeleteDialog({
      open: true,
      threatId: threat.id,
      threatName: threat.name,
    });
  };

  const handleNewThreat = () => {
    // Check sheet limit before creating new threat
    if (!canCreateMenace) {
      setShowLimitDialog(true);
      return;
    }
    history.push('/threat-generator');
  };

  const handleBack = () => {
    history.push('/');
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          display='flex'
          alignItems='center'
          justifyContent='space-between'
          flexWrap='wrap'
          gap={2}
        >
          <Box display='flex' alignItems='center' gap={2}>
            <IconButton onClick={handleBack}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant='h4'>Histórico de Ameaças</Typography>
          </Box>
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={handleNewThreat}
          >
            Nova Ameaça
          </Button>
        </Box>

        <Box mt={2}>
          <TextField
            fullWidth
            placeholder='Buscar por nome, tipo ou ND...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Paper>

      {/* Threats List */}
      {filteredThreats.length === 0 ? (
        <Alert severity='info'>
          {searchTerm
            ? 'Nenhuma ameaça encontrada com os termos de busca.'
            : 'Nenhuma ameaça salva ainda. Crie sua primeira ameaça!'}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredThreats.map((threat) => {
            const threatTier = getTierDisplayName(
              getTierByChallengeLevel(threat.challengeLevel)
            );

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={threat.id}>
                <Card>
                  <CardContent>
                    <Typography variant='h6' gutterBottom>
                      {threat.name}
                    </Typography>

                    <Box display='flex' gap={0.5} flexWrap='wrap' mb={2}>
                      <Chip label={threat.type} size='small' color='primary' />
                      <Chip label={threat.size} size='small' />
                      <Chip
                        label={`ND ${threat.challengeLevel}`}
                        size='small'
                        color='error'
                      />
                    </Box>

                    <Typography
                      variant='body2'
                      color='text.secondary'
                      gutterBottom
                    >
                      <strong>Papel:</strong> {threat.role}
                    </Typography>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      gutterBottom
                    >
                      <strong>Patamar:</strong> {threatTier}
                    </Typography>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      gutterBottom
                    >
                      <strong>PV:</strong> {threat.combatStats.hitPoints} |{' '}
                      <strong>Defesa:</strong> {threat.combatStats.defense}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      <strong>Ataques:</strong> {threat.attacks.length} |{' '}
                      <strong>Habilidades:</strong> {threat.abilities.length}
                    </Typography>
                  </CardContent>

                  <CardActions>
                    <Button
                      size='small'
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleView(threat)}
                    >
                      Visualizar
                    </Button>
                    <Button
                      size='small'
                      startIcon={<EditIcon />}
                      onClick={() => handleEdit(threat)}
                      color='primary'
                    >
                      Editar
                    </Button>
                    <IconButton
                      size='small'
                      color='error'
                      onClick={() => confirmDelete(threat)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Sheet Limit Dialog */}
      <SheetLimitDialog
        open={showLimitDialog}
        onClose={() => setShowLimitDialog(false)}
        currentCount={menaceCount}
        maxCount={maxMenaceSheets}
        tierName={tier === SubscriptionTier.FREE ? 'Gratuito' : tier}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() =>
          setDeleteDialog({ open: false, threatId: null, threatName: '' })
        }
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir a ameaça &quot;
            {deleteDialog.threatName}&quot;?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setDeleteDialog({ open: false, threatId: null, threatName: '' })
            }
          >
            Cancelar
          </Button>
          <Button
            color='error'
            variant='contained'
            onClick={() =>
              deleteDialog.threatId && handleDelete(deleteDialog.threatId)
            }
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ThreatHistory;
