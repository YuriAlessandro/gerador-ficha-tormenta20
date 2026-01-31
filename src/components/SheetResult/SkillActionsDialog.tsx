import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Stack,
  Collapse,
  useTheme,
} from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CloseIcon from '@mui/icons-material/Close';
import { CompleteSkill } from '../../interfaces/Skills';
import { SkillAction, getSkillActions } from '../../data/skillActions';

interface SkillActionsDialogProps {
  open: boolean;
  onClose: () => void;
  skill: CompleteSkill | null;
  skillTotal: number;
  onRoll: (actionName: string) => void;
}

interface ActionCardProps {
  action: SkillAction;
  onRoll: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({ action, onRoll }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  return (
    <Box
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        p: 2,
        mb: 1.5,
        bgcolor: 'background.paper',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: theme.palette.primary.main,
          boxShadow: 1,
        },
      }}
    >
      <Stack
        direction='row'
        justifyContent='space-between'
        alignItems='flex-start'
        spacing={1}
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant='subtitle1' fontWeight='bold'>
            {action.name}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {action.summary}
          </Typography>
        </Box>
        <Button
          variant='contained'
          size='small'
          startIcon={<CasinoIcon />}
          onClick={onRoll}
          sx={{ flexShrink: 0 }}
        >
          Rolar
        </Button>
      </Stack>

      <Box sx={{ mt: 1 }}>
        <Button
          size='small'
          onClick={() => setExpanded(!expanded)}
          endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          sx={{ p: 0, minWidth: 'auto', textTransform: 'none' }}
        >
          {expanded ? 'Ocultar regras' : 'Ver regras'}
        </Button>
        <Collapse in={expanded}>
          <Box
            sx={{
              mt: 1,
              p: 1.5,
              bgcolor: 'action.hover',
              borderRadius: 1,
              whiteSpace: 'pre-line',
            }}
          >
            <Typography variant='body2'>{action.description}</Typography>
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
};

const SkillActionsDialog: React.FC<SkillActionsDialogProps> = ({
  open,
  onClose,
  skill,
  skillTotal,
  onRoll,
}) => {
  const isMobile = useMemo(() => window.innerWidth < 720, []);

  const actions = useMemo(() => {
    if (!skill) return [];
    return getSkillActions(skill.name);
  }, [skill]);

  const handleRoll = (actionName: string) => {
    onRoll(actionName);
    onClose();
  };

  if (!skill) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle>
        <Stack
          direction='row'
          justifyContent='space-between'
          alignItems='center'
        >
          <Stack direction='row' alignItems='center' spacing={1}>
            <CasinoIcon color='primary' />
            <Typography variant='h6' component='span'>
              {skill.name}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              (+{skillTotal})
            </Typography>
          </Stack>
          <IconButton onClick={onClose} size='small'>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        {/* Roll normal skill button */}
        <Box
          sx={{
            border: (t) => `2px solid ${t.palette.primary.main}`,
            borderRadius: 1,
            p: 2,
            mb: 2,
            bgcolor: (t) =>
              t.palette.mode === 'dark'
                ? 'rgba(33, 150, 243, 0.1)'
                : 'rgba(33, 150, 243, 0.05)',
          }}
        >
          <Stack
            direction='row'
            justifyContent='space-between'
            alignItems='center'
            spacing={1}
          >
            <Box>
              <Typography variant='subtitle1' fontWeight='bold'>
                Teste de {skill.name}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Rolar 1d20{skillTotal >= 0 ? '+' : ''}
                {skillTotal}
              </Typography>
            </Box>
            <Button
              variant='contained'
              startIcon={<CasinoIcon />}
              onClick={() => handleRoll(skill.name)}
            >
              Rolar
            </Button>
          </Stack>
        </Box>

        {/* Actions list */}
        {actions.length > 0 && (
          <Typography
            variant='overline'
            color='text.secondary'
            sx={{ display: 'block', mb: 1 }}
          >
            Ações Específicas
          </Typography>
        )}
        {actions.map((action) => (
          <ActionCard
            key={action.name}
            action={action}
            onRoll={() => handleRoll(action.name)}
          />
        ))}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SkillActionsDialog;
