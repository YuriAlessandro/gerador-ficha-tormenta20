import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Grid,
  Paper,
  useTheme,
} from '@mui/material';
import {
  ThreatType,
  ThreatSize,
  ThreatRole,
  ThreatSheet,
} from '../../../interfaces/ThreatSheet';

interface StepOneProps {
  threat: Partial<ThreatSheet>;
  onUpdate: (updates: Partial<ThreatSheet>) => void;
}

const StepOne: React.FC<StepOneProps> = ({ threat, onUpdate }) => {
  const theme = useTheme();

  const handleTypeChange = (value: ThreatType) => {
    onUpdate({ type: value });
  };

  const handleSizeChange = (value: ThreatSize) => {
    onUpdate({ size: value });
  };

  const handleRoleChange = (value: ThreatRole) => {
    onUpdate({ role: value });
  };

  const handleDisplacementChange = (value: string) => {
    onUpdate({ displacement: value });
  };

  return (
    <Box p={3}>
      <Typography variant='h6' gutterBottom>
        Características Básicas
      </Typography>
      <Typography variant='body2' color='text.secondary' mb={3}>
        Defina o tipo, tamanho, papel e deslocamento da ameaça.
      </Typography>

      <Grid container spacing={3}>
        {/* Tipo */}
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={threat.type || ''}
              label='Tipo'
              onChange={(e) => handleTypeChange(e.target.value as ThreatType)}
            >
              {Object.values(ThreatType).map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Tamanho */}
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Tamanho</InputLabel>
            <Select
              value={threat.size || ''}
              label='Tamanho'
              onChange={(e) => handleSizeChange(e.target.value as ThreatSize)}
            >
              {Object.values(ThreatSize).map((size) => (
                <MenuItem key={size} value={size}>
                  {size}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Papel */}
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Papel</InputLabel>
            <Select
              value={threat.role || ''}
              label='Papel'
              onChange={(e) => handleRoleChange(e.target.value as ThreatRole)}
            >
              {Object.values(ThreatRole).map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Deslocamento */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label='Deslocamento'
            value={threat.displacement || ''}
            onChange={(e) => handleDisplacementChange(e.target.value)}
            placeholder='Ex: 9m'
          />
        </Grid>
      </Grid>

      {/* Informações sobre os papéis */}
      <Box mt={4}>
        <Typography variant='subtitle1' gutterBottom>
          Sobre os Papéis
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Paper
              variant='outlined'
              sx={{
                p: 2,
                height: '100%',
                backgroundColor:
                  threat.role === ThreatRole.SOLO
                    ? `${theme.palette.primary.light}20`
                    : 'transparent',
              }}
            >
              <Typography variant='subtitle2' gutterBottom>
                <strong>Solo</strong>
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Inimigo único poderoso, projetado para enfrentar um grupo de
                aventureiros sozinho.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              variant='outlined'
              sx={{
                p: 2,
                height: '100%',
                backgroundColor:
                  threat.role === ThreatRole.LACAIO
                    ? `${theme.palette.primary.light}20`
                    : 'transparent',
              }}
            >
              <Typography variant='subtitle2' gutterBottom>
                <strong>Lacaio</strong>
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Inimigos mais fracos, projetados para lutar em grupos e apoiar
                outras ameaças.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              variant='outlined'
              sx={{
                p: 2,
                height: '100%',
                backgroundColor:
                  threat.role === ThreatRole.ESPECIAL
                    ? `${theme.palette.primary.light}20`
                    : 'transparent',
              }}
            >
              <Typography variant='subtitle2' gutterBottom>
                <strong>Especial</strong>
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Ameaças únicas com características especiais, geralmente chefes
                ou criaturas importantes.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default StepOne;
