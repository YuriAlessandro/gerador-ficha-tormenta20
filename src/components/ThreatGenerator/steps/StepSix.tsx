import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  useTheme,
} from '@mui/material';
import { Atributo } from '../../../data/systems/tormenta20/atributos';
import { ThreatSheet, ThreatAttributes } from '../../../interfaces/ThreatSheet';
import { calculateAllSkills } from '../../../functions/threatGenerator';

interface StepSixProps {
  threat: Partial<ThreatSheet>;
  onUpdate: (updates: Partial<ThreatSheet>) => void;
}

const StepSix: React.FC<StepSixProps> = ({ threat, onUpdate }) => {
  const theme = useTheme();

  const handleAttributeChange = (attribute: Atributo, value: string) => {
    let parsedValue: number | '-';

    if (value === '-' || value === '') {
      parsedValue = '-';
    } else {
      parsedValue = parseInt(value, 10) || 0;
    }

    const updatedAttributes = {
      ...threat.attributes,
      [attribute]: parsedValue,
    } as ThreatAttributes;
    onUpdate({ attributes: updatedAttributes });

    // Recalculate skills when attributes change
    if (threat.challengeLevel) {
      const updatedSkills = calculateAllSkills(
        threat.challengeLevel,
        updatedAttributes,
        threat.skills,
        threat.resistanceAssignments,
        threat.combatStats
      );
      onUpdate({ skills: updatedSkills });
    }
  };

  const handleSkillTrainingChange = (skillName: string, trained: boolean) => {
    const updatedSkills = (threat.skills || []).map((skill) =>
      skill.name === skillName ? { ...skill, trained } : skill
    );
    onUpdate({ skills: updatedSkills });

    // Recalculate totals
    if (threat.challengeLevel && threat.attributes) {
      const recalculatedSkills = calculateAllSkills(
        threat.challengeLevel,
        threat.attributes,
        updatedSkills,
        threat.resistanceAssignments,
        threat.combatStats
      );
      onUpdate({ skills: recalculatedSkills });
    }
  };

  // Initialize skills if not present
  React.useEffect(() => {
    if (
      threat.challengeLevel &&
      threat.attributes &&
      (!threat.skills || threat.skills.length === 0)
    ) {
      const initialSkills = calculateAllSkills(
        threat.challengeLevel,
        threat.attributes,
        [],
        threat.resistanceAssignments,
        threat.combatStats
      );
      onUpdate({ skills: initialSkills });
    }
  }, [threat.challengeLevel, threat.attributes]);

  if (!threat.challengeLevel) {
    return (
      <Box p={3}>
        <Alert severity='warning'>
          Selecione o nível de desafio nas etapas anteriores para configurar
          atributos e perícias.
        </Alert>
      </Box>
    );
  }

  const attributes = threat.attributes || ({} as ThreatAttributes);
  const skills = threat.skills || [];

  return (
    <Box p={3}>
      <Typography variant='h6' gutterBottom>
        Atributos e Perícias
      </Typography>
      <Typography variant='body2' color='text.secondary' mb={3}>
        Configure os atributos da ameaça. As perícias serão calculadas
        automaticamente.
      </Typography>

      <Grid container spacing={3}>
        {/* Attributes Section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant='outlined' sx={{ p: 3 }}>
            <Typography variant='subtitle1' gutterBottom>
              Atributos (Modificadores)
            </Typography>
            <Typography variant='body2' color='text.secondary' mb={2}>
              Insira apenas os <strong>modificadores</strong> dos atributos. Use
              &quot;-&quot; para atributos que a ameaça não possui. Esses
              valores não impactam as estatísticas de combate (já definidas pelo
              ND).
            </Typography>

            <Box mb={2}>
              <Typography variant='body2' fontWeight='bold' gutterBottom>
                Referência de Modificadores:
              </Typography>
              <Table size='small' sx={{ maxWidth: 400 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Categoria</TableCell>
                    <TableCell align='center'>Valor</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Não possui</TableCell>
                    <TableCell align='center'>-</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Incapaz</TableCell>
                    <TableCell align='center'>-5</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Incompetente</TableCell>
                    <TableCell align='center'>-4 ou -3</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Ineficaz</TableCell>
                    <TableCell align='center'>-2 ou -1</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Mediano</TableCell>
                    <TableCell align='center'>0 ou +1</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Notável</TableCell>
                    <TableCell align='center'>+2 ou +3</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Excelente</TableCell>
                    <TableCell align='center'>+4 ou +5</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Extraordinário</TableCell>
                    <TableCell align='center'>+6 ou +7</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Excepcional</TableCell>
                    <TableCell align='center'>+8 ou mais</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
            <Grid container spacing={2}>
              {Object.values(Atributo).map((attribute) => (
                <Grid size={6} key={attribute}>
                  <TextField
                    fullWidth
                    label={attribute}
                    value={
                      (attributes as unknown as Record<string, number | '-'>)[
                        attribute
                      ] ?? 0
                    }
                    onChange={(e) =>
                      handleAttributeChange(attribute, e.target.value)
                    }
                    placeholder='Ex: +2, -1, ou -'
                    helperText='Use "-" se não possui este atributo'
                  />
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Training Summary */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant='outlined' sx={{ p: 3 }}>
            <Typography variant='subtitle1' gutterBottom>
              Perícias Treinadas
            </Typography>
            <Typography variant='body2' color='text.secondary' mb={2}>
              Perícias marcadas como treinadas aparecerão na ficha final.
            </Typography>

            {skills
              .filter((skill) => skill.trained)
              .slice(0, 8)
              .map((skill) => (
                <Box key={skill.name} mb={1}>
                  <Typography
                    variant='body2'
                    sx={{
                      color:
                        skill.total >= 10
                          ? theme.palette.success.main
                          : 'inherit',
                    }}
                  >
                    {skill.name}: +{skill.total}
                  </Typography>
                </Box>
              ))}

            {skills.filter((skill) => skill.trained).length === 0 && (
              <Typography
                variant='body2'
                color='text.secondary'
                fontStyle='italic'
              >
                Nenhuma perícia treinada selecionada
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Skills Selection Table */}
      <Box mt={3}>
        <Typography variant='h6' gutterBottom>
          Configurar Perícias
        </Typography>
        <Typography variant='body2' color='text.secondary' mb={2}>
          Marque as perícias que a ameaça possui treinamento. Apenas perícias
          treinadas aparecerão na ficha final.
        </Typography>
        <Paper variant='outlined' sx={{ maxHeight: 400, overflow: 'auto' }}>
          <TableContainer>
            <Table size='small' stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Perícia</TableCell>
                  <TableCell align='center'>Atributo</TableCell>
                  <TableCell align='center'>Treinada</TableCell>
                  <TableCell align='center'>Total (se treinada)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {skills
                  .filter(
                    (skill) =>
                      !['Vontade', 'Fortitude', 'Reflexos'].includes(skill.name)
                  )
                  .map((skill) => (
                    <TableRow key={skill.name}>
                      <TableCell>{skill.name}</TableCell>
                      <TableCell align='center'>{skill.attribute}</TableCell>
                      <TableCell align='center'>
                        <Checkbox
                          checked={skill.trained}
                          onChange={(e) =>
                            handleSkillTrainingChange(
                              skill.name,
                              e.target.checked
                            )
                          }
                          size='small'
                        />
                      </TableCell>
                      <TableCell
                        align='center'
                        sx={{
                          fontWeight: skill.trained ? 'bold' : 'normal',
                          color: (() => {
                            if (!skill.trained) return 'text.disabled';
                            if (skill.total >= 10)
                              return theme.palette.success.main;
                            return 'inherit';
                          })(),
                        }}
                      >
                        +{skill.total}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      {/* Tips */}
      <Box mt={3}>
        <Alert severity='info'>
          <Typography variant='body2'>
            <strong>Fórmula das Perícias:</strong> ½ ND + modificador do
            atributo + bônus de treinamento
            <br />
            <strong>Bônus de Treinamento:</strong> +2 (ND 1-6), +4 (ND 7-14), +6
            (ND 15+)
          </Typography>
        </Alert>
      </Box>
    </Box>
  );
};

export default StepSix;
