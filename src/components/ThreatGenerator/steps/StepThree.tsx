import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Alert,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
} from '@mui/material';
import {
  ThreatSheet,
  ResistanceAssignments,
  ResistanceType,
} from '../../../interfaces/ThreatSheet';

interface StepThreeProps {
  threat: Partial<ThreatSheet>;
  onUpdate: (updates: Partial<ThreatSheet>) => void;
}

const StepThree: React.FC<StepThreeProps> = ({ threat, onUpdate }) => {
  const theme = useTheme();

  const handleManaToggle = (checked: boolean) => {
    onUpdate({ hasManaPoints: checked });
  };

  const handleResistanceAssignment = (
    skill: string,
    resistanceType: ResistanceType
  ) => {
    if (!threat.resistanceAssignments) return;

    // Find current assignments
    const currentAssignments = { ...threat.resistanceAssignments };

    // Find what skill currently has this resistance type and swap
    const currentSkillWithThisType = Object.entries(currentAssignments).find(
      ([_, type]) => type === resistanceType
    );

    if (currentSkillWithThisType) {
      const [currentSkill] = currentSkillWithThisType;
      // Swap the assignments
      currentAssignments[currentSkill as keyof ResistanceAssignments] =
        currentAssignments[skill as keyof ResistanceAssignments];
    }

    currentAssignments[skill as keyof ResistanceAssignments] = resistanceType;

    onUpdate({ resistanceAssignments: currentAssignments });
  };

  const { combatStats } = threat;

  if (!threat.role || !threat.challengeLevel) {
    return (
      <Box p={3}>
        <Alert severity='warning'>
          Selecione o papel e o nível de desafio nas etapas anteriores para
          visualizar as estatísticas de combate.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant='h6' gutterBottom>
        Estatísticas de Combate
      </Typography>
      <Typography variant='body2' color='text.secondary' mb={3}>
        Estatísticas calculadas automaticamente com base no papel{' '}
        <strong>{threat.role}</strong> e nível de desafio{' '}
        <strong>ND {threat.challengeLevel}</strong>.
      </Typography>

      {/* Controle de Pontos de Mana */}
      <Box mb={3}>
        <FormControlLabel
          control={
            <Switch
              checked={threat.hasManaPoints || false}
              onChange={(e) => handleManaToggle(e.target.checked)}
              color='primary'
            />
          }
          label='Esta ameaça possui pontos de mana?'
        />
      </Box>

      {/* Resistance Assignments */}
      <Box mb={3}>
        <Paper variant='outlined' sx={{ p: 3 }}>
          <Typography variant='subtitle1' gutterBottom>
            Testes de Resistência
          </Typography>
          <Typography variant='body2' color='text.secondary' mb={2}>
            Atribua qual resistência será Forte, Média ou Fraca. Resistências
            fracas recebem bônus maiores (vulnerabilidade compensada),
            resistências fortes recebem bônus menores.
          </Typography>

          <Grid container spacing={2}>
            {['Fortitude', 'Reflexos', 'Vontade'].map((skill) => (
              <Grid size={{ xs: 12, sm: 4 }} key={skill}>
                <FormControl fullWidth size='small'>
                  <InputLabel>{skill}</InputLabel>
                  <Select
                    value={
                      threat.resistanceAssignments?.[
                        skill as keyof ResistanceAssignments
                      ] || ResistanceType.MEDIUM
                    }
                    label={skill}
                    onChange={(e) =>
                      handleResistanceAssignment(
                        skill,
                        e.target.value as ResistanceType
                      )
                    }
                  >
                    <MenuItem value={ResistanceType.STRONG}>
                      Forte (+{combatStats?.strongSave ?? '?'})
                    </MenuItem>
                    <MenuItem value={ResistanceType.MEDIUM}>
                      Média (+{combatStats?.mediumSave ?? '?'})
                    </MenuItem>
                    <MenuItem value={ResistanceType.WEAK}>
                      Fraca (+{combatStats?.weakSave ?? '?'})
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>

      {combatStats && (
        <Grid container spacing={3}>
          {/* Estatísticas Principais */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper variant='outlined' sx={{ p: 3, height: '100%' }}>
              <Typography variant='subtitle1' gutterBottom color='primary'>
                Estatísticas Principais
              </Typography>
              <TableContainer>
                <Table size='small'>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <strong>Defesa</strong>
                      </TableCell>
                      <TableCell align='right'>{combatStats.defense}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>Pontos de Vida</strong>
                      </TableCell>
                      <TableCell align='right'>
                        {combatStats.hitPoints}
                      </TableCell>
                    </TableRow>
                    {combatStats.manaPoints && (
                      <TableRow>
                        <TableCell>
                          <strong>Pontos de Mana</strong>
                        </TableCell>
                        <TableCell align='right'>
                          {combatStats.manaPoints}
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow>
                      <TableCell>
                        <strong>CD de Efeitos</strong>
                      </TableCell>
                      <TableCell align='right'>
                        {combatStats.standardEffectDC}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Ataques */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper variant='outlined' sx={{ p: 3, height: '100%' }}>
              <Typography variant='subtitle1' gutterBottom color='primary'>
                Ataques
              </Typography>
              <TableContainer>
                <Table size='small'>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <strong>Valor de Ataque</strong>
                      </TableCell>
                      <TableCell align='right'>
                        +{combatStats.attackValue}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>Dano Médio</strong>
                      </TableCell>
                      <TableCell align='right'>
                        {combatStats.averageDamage}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Resumo de Resistências Atribuídas */}
          <Grid size={12}>
            <Paper variant='outlined' sx={{ p: 3 }}>
              <Typography variant='subtitle1' gutterBottom color='primary'>
                Resumo das Resistências
              </Typography>
              <Grid container spacing={2}>
                <Grid size={4}>
                  <Box
                    textAlign='center'
                    p={2}
                    sx={{
                      backgroundColor: `${theme.palette.success.light}20`,
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant='subtitle2' gutterBottom>
                      <strong>Forte (+{combatStats.strongSave})</strong>
                    </Typography>
                    <Typography variant='body2'>
                      {Object.entries(threat.resistanceAssignments || {}).find(
                        ([_, type]) => type === ResistanceType.STRONG
                      )?.[0] || 'Não atribuído'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={4}>
                  <Box
                    textAlign='center'
                    p={2}
                    sx={{
                      backgroundColor: `${theme.palette.warning.light}20`,
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant='subtitle2' gutterBottom>
                      <strong>Média (+{combatStats.mediumSave})</strong>
                    </Typography>
                    <Typography variant='body2'>
                      {Object.entries(threat.resistanceAssignments || {}).find(
                        ([_, type]) => type === ResistanceType.MEDIUM
                      )?.[0] || 'Não atribuído'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={4}>
                  <Box
                    textAlign='center'
                    p={2}
                    sx={{
                      backgroundColor: `${theme.palette.error.light}20`,
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant='subtitle2' gutterBottom>
                      <strong>Fraca (+{combatStats.weakSave})</strong>
                    </Typography>
                    <Typography variant='body2'>
                      {Object.entries(threat.resistanceAssignments || {}).find(
                        ([_, type]) => type === ResistanceType.WEAK
                      )?.[0] || 'Não atribuído'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Informação Adicional */}
      <Box mt={3}>
        <Alert severity='info'>
          <Typography variant='body2'>
            <strong>Dica:</strong> Estas estatísticas são calculadas
            automaticamente com base nas tabelas oficiais do Tormenta 20. Você
            pode personalizá-las nas próximas etapas se necessário.
          </Typography>
        </Alert>
      </Box>
    </Box>
  );
};

export default StepThree;
