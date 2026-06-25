import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Stack,
  TextField,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  useTheme,
} from '@mui/material';
import FitnessCenterOutlinedIcon from '@mui/icons-material/FitnessCenterOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import { Atributo } from '../../../data/systems/tormenta20/atributos';
import {
  ThreatSheet,
  ThreatAttributes,
  ThreatSkill,
  ResistanceAssignments,
  ResistanceType,
} from '../../../interfaces/ThreatSheet';
import {
  calculateAllSkills,
  calculateManaPoints,
} from '../../../functions/threatGenerator';
import { splitSkillsForDisplay } from '../utils/skillDisplayOrder';
import SectionCard from './shared/SectionCard';

interface StepAttributesSkillsProps {
  threat: Partial<ThreatSheet>;
  onUpdate: (updates: Partial<ThreatSheet>) => void;
}

const RESISTANCE_SKILL_NAMES = ['Fortitude', 'Reflexos', 'Vontade'];

const ATTRIBUTE_REFERENCE = [
  { label: 'Não possui', value: '-' },
  { label: 'Incapaz', value: '-5' },
  { label: 'Mediano', value: '0 ou +1' },
  { label: 'Notável', value: '+2 ou +3' },
  { label: 'Excelente', value: '+4 ou +5' },
  { label: 'Excepcional', value: '+8 ou mais' },
];

const StepAttributesSkills: React.FC<StepAttributesSkillsProps> = ({
  threat,
  onUpdate,
}) => {
  const theme = useTheme();

  const handleAttributeChange = (attribute: Atributo, value: string) => {
    const parsedValue: number | '-' =
      value === '-' || value === '' ? '-' : parseInt(value, 10) || 0;

    const updatedAttributes = {
      ...threat.attributes,
      [attribute]: parsedValue,
    } as ThreatAttributes;

    if (threat.challengeLevel) {
      const updatedSkills = calculateAllSkills(
        threat.challengeLevel,
        updatedAttributes,
        threat.skills,
        threat.resistanceAssignments,
        threat.combatStats
      );
      onUpdate({ attributes: updatedAttributes, skills: updatedSkills });
    } else {
      onUpdate({ attributes: updatedAttributes });
    }
  };

  const handleManaToggle = (checked: boolean) => {
    if (!threat.challengeLevel || !threat.combatStats) {
      onUpdate({ hasManaPoints: checked });
      return;
    }
    // Aditivo: preserva edições manuais de Defesa/PV/CD ao alternar o mana.
    onUpdate({
      hasManaPoints: checked,
      combatStats: {
        ...threat.combatStats,
        manaPoints: checked
          ? calculateManaPoints(threat.challengeLevel)
          : undefined,
      },
    });
  };

  const handleResistanceAssignment = (
    skill: string,
    resistanceType: ResistanceType
  ) => {
    if (!threat.resistanceAssignments) return;

    const currentAssignments = { ...threat.resistanceAssignments };
    const currentSkillWithThisType = Object.entries(currentAssignments).find(
      ([, type]) => type === resistanceType
    );

    if (currentSkillWithThisType) {
      const [currentSkill] = currentSkillWithThisType;
      currentAssignments[currentSkill as keyof ResistanceAssignments] =
        currentAssignments[skill as keyof ResistanceAssignments];
    }
    currentAssignments[skill as keyof ResistanceAssignments] = resistanceType;

    if (threat.challengeLevel && threat.attributes) {
      const updatedSkills = calculateAllSkills(
        threat.challengeLevel,
        threat.attributes,
        threat.skills,
        currentAssignments,
        threat.combatStats
      );
      onUpdate({
        resistanceAssignments: currentAssignments,
        skills: updatedSkills,
      });
    } else {
      onUpdate({ resistanceAssignments: currentAssignments });
    }
  };

  const handleCombatStatChange = (
    field: 'defense' | 'hitPoints' | 'standardEffectDC' | 'manaPoints',
    value: number
  ) => {
    if (!threat.combatStats) return;
    onUpdate({
      combatStats: {
        ...threat.combatStats,
        [field]: value,
      },
    });
  };

  const handleSkillTrainingChange = (skillName: string, trained: boolean) => {
    const updatedSkills = (threat.skills || []).map((skill) =>
      skill.name === skillName ? { ...skill, trained } : skill
    );

    if (threat.challengeLevel && threat.attributes) {
      const recalculatedSkills = calculateAllSkills(
        threat.challengeLevel,
        threat.attributes,
        updatedSkills,
        threat.resistanceAssignments,
        threat.combatStats
      );
      onUpdate({ skills: recalculatedSkills });
    } else {
      onUpdate({ skills: updatedSkills });
    }
  };

  const handleSkillOverrideChange = (skillName: string, value: string) => {
    const updatedSkills = (threat.skills || []).map((skill) => {
      if (skill.name !== skillName) return skill;

      if (value === '') {
        return {
          name: skill.name,
          attribute: skill.attribute,
          trained: skill.trained,
          customBonus: skill.customBonus,
          total: skill.total,
        };
      }

      const parsed = parseInt(value, 10);
      if (Number.isNaN(parsed)) return skill;

      return { ...skill, overrideTotal: parsed };
    });

    onUpdate({ skills: updatedSkills });
  };

  // Inicializa perícias quando ainda não existem (guarda contra sobrescrever
  // perícias/overrides já salvos ao editar uma ameaça existente).
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

  if (!threat.challengeLevel || !threat.role) {
    return (
      <Box p={{ xs: 2, sm: 3 }}>
        <Alert severity='warning'>
          Defina o papel e o nível de desafio na etapa{' '}
          <strong>Informações Gerais</strong> para configurar atributos, combate
          e perícias.
        </Alert>
      </Box>
    );
  }

  const attributes = threat.attributes || ({} as ThreatAttributes);
  const skills = threat.skills || [];
  const { priority, rest } = splitSkillsForDisplay(skills);
  const { combatStats } = threat;

  const renderSkillRow = (skill: ThreatSkill) => {
    const isResistance = RESISTANCE_SKILL_NAMES.includes(skill.name);
    return (
      <TableRow key={skill.name} hover>
        <TableCell>{skill.name}</TableCell>
        <TableCell align='center'>{skill.attribute}</TableCell>
        <TableCell align='center'>
          {isResistance ? (
            <Checkbox
              checked={false}
              disabled
              size='small'
              title='Resistências usam o valor da tabela de combate (atribuição Forte/Média/Fraca). Use o campo Total para sobrescrever.'
            />
          ) : (
            <Checkbox
              checked={skill.trained}
              onChange={(e) =>
                handleSkillTrainingChange(skill.name, e.target.checked)
              }
              size='small'
            />
          )}
        </TableCell>
        <TableCell align='center'>
          <TextField
            size='small'
            type='number'
            value={skill.overrideTotal !== undefined ? skill.overrideTotal : ''}
            placeholder={`${skill.total}`}
            onChange={(e) =>
              handleSkillOverrideChange(skill.name, e.target.value)
            }
            inputProps={{
              style: {
                textAlign: 'center',
                width: 60,
                fontWeight:
                  skill.overrideTotal !== undefined ? 'bold' : 'normal',
                color:
                  skill.overrideTotal !== undefined
                    ? theme.palette.warning.main
                    : undefined,
              },
            }}
            sx={{ maxWidth: 90 }}
          />
        </TableCell>
      </TableRow>
    );
  };

  return (
    <Box p={{ xs: 2, sm: 3 }}>
      <Typography variant='h6' gutterBottom>
        Atributos e Perícias
      </Typography>
      <Typography variant='body2' color='text.secondary' mb={3}>
        Defina os atributos, ajuste as estatísticas de combate e configure as
        perícias da ameaça.
      </Typography>

      <Stack spacing={3}>
        {/* Atributos */}
        <SectionCard
          icon={<FitnessCenterOutlinedIcon />}
          title='Atributos'
          subtitle='Insira os modificadores. Use "-" para atributos que a ameaça não possui.'
        >
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Grid container spacing={2}>
                {Object.values(Atributo).map((attribute) => (
                  <Grid size={{ xs: 6, sm: 4 }} key={attribute}>
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
                    />
                  </Grid>
                ))}
              </Grid>
              <Typography
                variant='caption'
                color='text.secondary'
                display='block'
                mt={1.5}
              >
                Esses valores não impactam as estatísticas de combate (definidas
                pelo ND), apenas o cálculo das perícias.
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Typography variant='body2' fontWeight='bold' gutterBottom>
                Referência de Modificadores
              </Typography>
              <Table size='small'>
                <TableBody>
                  {ATTRIBUTE_REFERENCE.map((ref) => (
                    <TableRow key={ref.label}>
                      <TableCell sx={{ border: 0, py: 0.25 }}>
                        {ref.label}
                      </TableCell>
                      <TableCell align='right' sx={{ border: 0, py: 0.25 }}>
                        {ref.value}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Grid>
          </Grid>
        </SectionCard>

        {/* Estatísticas de Combate */}
        <SectionCard
          icon={<ShieldOutlinedIcon />}
          title='Estatísticas de Combate'
          subtitle={`Calculadas pelo papel ${threat.role} e ND ${threat.challengeLevel}. Ajuste se necessário.`}
        >
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

          {combatStats && (
            <>
              <Grid container spacing={2} mt={0.5}>
                <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                  <TextField
                    fullWidth
                    type='number'
                    label='Defesa'
                    value={combatStats.defense}
                    onChange={(e) =>
                      handleCombatStatChange(
                        'defense',
                        parseInt(e.target.value, 10) || 0
                      )
                    }
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                  <TextField
                    fullWidth
                    type='number'
                    label='Pontos de Vida'
                    value={combatStats.hitPoints}
                    onChange={(e) =>
                      handleCombatStatChange(
                        'hitPoints',
                        parseInt(e.target.value, 10) || 0
                      )
                    }
                  />
                </Grid>
                {threat.hasManaPoints && (
                  <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                    <TextField
                      fullWidth
                      type='number'
                      label='Pontos de Mana'
                      value={combatStats.manaPoints ?? 0}
                      onChange={(e) =>
                        handleCombatStatChange(
                          'manaPoints',
                          parseInt(e.target.value, 10) || 0
                        )
                      }
                    />
                  </Grid>
                )}
                <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                  <TextField
                    fullWidth
                    type='number'
                    label='CD de Efeitos'
                    value={combatStats.standardEffectDC}
                    onChange={(e) =>
                      handleCombatStatChange(
                        'standardEffectDC',
                        parseInt(e.target.value, 10) || 0
                      )
                    }
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                  <TextField
                    fullWidth
                    disabled
                    label='Valor de Ataque'
                    value={`+${combatStats.attackValue}`}
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                  <TextField
                    fullWidth
                    disabled
                    label='Dano Médio'
                    value={combatStats.averageDamage}
                  />
                </Grid>
              </Grid>

              {/* Atribuição de resistências */}
              <Box mt={3}>
                <Typography variant='subtitle2' gutterBottom>
                  Testes de Resistência
                </Typography>
                <Typography variant='body2' color='text.secondary' mb={2}>
                  Atribua qual resistência será Forte, Média ou Fraca. O valor
                  escolhido pré-preenche Fortitude/Reflexos/Vontade na tabela de
                  perícias abaixo.
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
                            Forte (+{combatStats.strongSave})
                          </MenuItem>
                          <MenuItem value={ResistanceType.MEDIUM}>
                            Média (+{combatStats.mediumSave})
                          </MenuItem>
                          <MenuItem value={ResistanceType.WEAK}>
                            Fraca (+{combatStats.weakSave})
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  ))}
                </Grid>
                <Box display='flex' gap={1} flexWrap='wrap' mt={2}>
                  <Chip
                    label={`Forte: +${combatStats.strongSave}`}
                    color='success'
                    size='small'
                  />
                  <Chip
                    label={`Média: +${combatStats.mediumSave}`}
                    color='warning'
                    size='small'
                  />
                  <Chip
                    label={`Fraca: +${combatStats.weakSave}`}
                    color='error'
                    size='small'
                  />
                </Box>
              </Box>

              {/* Qualidades especiais */}
              <Box mt={3}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label='Qualidades Especiais'
                  value={threat.specialQualities || ''}
                  onChange={(e) =>
                    onUpdate({ specialQualities: e.target.value })
                  }
                  placeholder='Ex: Visão no escuro, RD 5, Resistência à magia +5, Imune a veneno'
                  helperText='Sentidos especiais, redução de dano, imunidades e resistências.'
                />
              </Box>
            </>
          )}
        </SectionCard>

        {/* Perícias */}
        <SectionCard
          icon={<PsychologyOutlinedIcon />}
          title='Perícias'
          subtitle='Marque as perícias treinadas. Apenas treinadas (e resistências) aparecem na ficha.'
        >
          <TableContainer
            sx={{
              maxHeight: 460,
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
            }}
          >
            <Table size='small' stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Perícia</TableCell>
                  <TableCell align='center'>Atributo</TableCell>
                  <TableCell align='center'>Treinada</TableCell>
                  <TableCell align='center'>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {priority.map(renderSkillRow)}
                {rest.length > 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      sx={{
                        py: 0.75,
                        backgroundColor: theme.palette.action.hover,
                      }}
                    >
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        fontWeight={600}
                      >
                        Demais perícias
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                {rest.map(renderSkillRow)}
              </TableBody>
            </Table>
          </TableContainer>

          <Alert severity='info' sx={{ mt: 2 }}>
            <Typography variant='body2'>
              <strong>Perícias:</strong> ½ ND + modificador do atributo + bônus
              de treinamento (+2 ND 1-6, +4 ND 7-14, +6 ND 15+).
              <br />
              <strong>Resistências (Fortitude, Reflexos, Vontade):</strong>{' '}
              pré-preenchidas pela atribuição Forte/Média/Fraca acima.
              Treinamento não se aplica — use o campo Total para sobrescrever.
              <br />
              <strong>Sobrescrita:</strong> insira um valor no campo Total para
              substituir o cálculo automático; limpe o campo para restaurar.
            </Typography>
          </Alert>
        </SectionCard>
      </Stack>
    </Box>
  );
};

export default StepAttributesSkills;
