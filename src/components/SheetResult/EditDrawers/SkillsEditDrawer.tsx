import React, { useState, useEffect, useMemo } from 'react';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Checkbox,
  Button,
  Stack,
  IconButton,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import CharacterSheet, { Step } from '@/interfaces/CharacterSheet';
import Skill, { CompleteSkill } from '@/interfaces/Skills';

import { Atributo } from '@/data/systems/tormenta20/atributos';

interface SkillsEditDrawerProps {
  open: boolean;
  onClose: () => void;
  sheet: CharacterSheet;
  onSave: (updates: Partial<CharacterSheet>) => void;
}

interface EditedSkill {
  name: string;
  trained: boolean;
  others: number;
}

// Available Oficio options based on the Skills enum
const AVAILABLE_OFICIOS = [
  'Ofício (Armeiro)',
  'Ofício (Artesanato)',
  'Ofício (Alquímia)',
  'Ofício (Culinária)',
  'Ofício (Alfaiate)',
  'Ofício (Alvenaria)',
  'Ofício (Carpinteiro)',
  'Ofício (Joalheiro)',
  'Ofício (Fazendeiro)',
  'Ofício (Pescador)',
  'Ofício (Estalajadeiro)',
  'Ofício (Escriba)',
  'Ofício (Escultor)',
  'Ofício (Engenhoqueiro)',
  'Ofício (Pintor)',
  'Ofício (Minerador)',
];

const SkillsEditDrawer: React.FC<SkillsEditDrawerProps> = ({
  open,
  onClose,
  sheet,
  onSave,
}) => {
  const [editedSkills, setEditedSkills] = useState<EditedSkill[]>([]);
  const [selectedOficio, setSelectedOficio] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (sheet.completeSkills && open) {
      const skills = sheet.completeSkills.map((skill) => ({
        name: skill.name,
        trained: (skill.training ?? 0) > 0,
        others: skill.others ?? 0,
      }));
      setEditedSkills(skills);
      setSearchQuery(''); // Reset search when opening
    }
  }, [sheet.completeSkills, open]);

  const handleSkillTrainingChange = (skillName: string, trained: boolean) => {
    setEditedSkills((prev) => {
      if (!trained && skillName.startsWith('Ofício')) {
        // Remove Oficio skills when unchecked
        return prev.filter((skill) => skill.name !== skillName);
      }
      // Update training status for other skills
      return prev.map((skill) =>
        skill.name === skillName ? { ...skill, trained } : skill
      );
    });
  };

  const handleSkillOthersChange = (skillName: string, others: number) => {
    setEditedSkills((prev) =>
      prev.map((skill) =>
        skill.name === skillName ? { ...skill, others } : skill
      )
    );
  };

  const calculateSkillTotal = (skill: EditedSkill): number => {
    const originalSkill = sheet.completeSkills?.find(
      (s) => s.name === skill.name
    );

    // Helper function to determine training bonus based on level
    const skillTrainingMod = (isTrained: boolean, level: number): number => {
      if (!isTrained) return 0;
      if (level >= 15) return 6;
      if (level >= 7) return 4;
      return 2;
    };

    // For new Oficio skills, calculate manually
    if (!originalSkill && skill.name.startsWith('Ofício')) {
      const intMod = sheet.atributos.Inteligência.value;
      const halfLevel = Math.floor(sheet.nivel / 2);
      const training = skillTrainingMod(skill.trained, sheet.nivel);
      return halfLevel + intMod + training + skill.others;
    }

    if (!originalSkill) return 0;

    const attrBonus = originalSkill.modAttr
      ? sheet.atributos[originalSkill.modAttr].value
      : 0;
    const halfLevel = originalSkill.halfLevel ?? 0;
    const training = skillTrainingMod(skill.trained, sheet.nivel);

    return halfLevel + attrBonus + training + skill.others;
  };

  const getAvailableOficios = (): string[] => {
    const existingOficios = editedSkills
      .filter((skill) => skill.name.startsWith('Ofício'))
      .map((skill) => skill.name);

    return AVAILABLE_OFICIOS.filter(
      (oficio) => !existingOficios.includes(oficio)
    );
  };

  const handleAddOficio = () => {
    if (!selectedOficio) return;

    const newSkill: EditedSkill = {
      name: selectedOficio,
      trained: false,
      others: 0,
    };

    setEditedSkills((prev) => [...prev, newSkill]);
    setSelectedOficio('');
  };

  const handleSave = () => {
    if (!sheet.completeSkills) return;

    // Helper function to determine training bonus based on level
    const skillTrainingMod = (isTrained: boolean, level: number): number => {
      if (!isTrained) return 0;
      if (level >= 15) return 6;
      if (level >= 7) return 4;
      return 2;
    };

    // Update existing skills, but filter out removed Oficios
    const updatedSkills: CompleteSkill[] = sheet.completeSkills
      .filter((originalSkill) => {
        // If it's an Oficio and not in editedSkills, it was removed
        if (originalSkill.name.startsWith('Ofício')) {
          return editedSkills.some((s) => s.name === originalSkill.name);
        }
        return true; // Keep all non-Oficio skills
      })
      .map((originalSkill) => {
        const editedSkill = editedSkills.find(
          (s) => s.name === originalSkill.name
        );
        if (!editedSkill) return originalSkill;

        return {
          ...originalSkill,
          training: skillTrainingMod(editedSkill.trained, sheet.nivel),
          others: editedSkill.others,
        };
      });

    // Add new Oficio skills (only trained ones are in editedSkills now)
    const newOficios: CompleteSkill[] = editedSkills
      .filter(
        (editedSkill) =>
          editedSkill.name.startsWith('Ofício') &&
          !sheet.completeSkills?.some((s) => s.name === editedSkill.name)
      )
      .map((editedSkill) => ({
        name: editedSkill.name as Skill,
        halfLevel: Math.floor(sheet.nivel / 2),
        modAttr: Atributo.INTELIGENCIA,
        training: skillTrainingMod(editedSkill.trained, sheet.nivel),
        others: editedSkill.others,
      }));

    const finalSkills = [...updatedSkills, ...newOficios];

    // Track skill changes in steps
    const originalTrainedSkills =
      sheet.completeSkills
        ?.filter((s) => (s.training ?? 0) > 0)
        .map((s) => s.name) || [];
    const newTrainedSkills = finalSkills
      .filter((s) => (s.training ?? 0) > 0)
      .map((s) => s.name);

    const newlyTrained = newTrainedSkills.filter(
      (name) => !originalTrainedSkills.includes(name)
    );
    const newlyUntrained = originalTrainedSkills.filter(
      (name) => !newTrainedSkills.includes(name)
    );

    const newSteps: Step[] = [];

    if (newlyTrained.length > 0) {
      newSteps.push({
        label: 'Edição Manual - Perícias Treinadas',
        type: 'Perícias',
        value: newlyTrained.map((name) => ({
          name,
          value: `${name} - treinada`,
        })),
      });
    }

    if (newlyUntrained.length > 0) {
      newSteps.push({
        label: 'Edição Manual - Perícias Destreinadas',
        type: 'Perícias',
        value: newlyUntrained.map((name) => ({
          name,
          value: `${name} - destreinada`,
        })),
      });
    }

    // Check for bonus changes
    const bonusChanges = editedSkills.filter((editedSkill) => {
      const originalSkill = sheet.completeSkills?.find(
        (s) => s.name === editedSkill.name
      );
      return (
        originalSkill && (originalSkill.others ?? 0) !== editedSkill.others
      );
    });

    if (bonusChanges.length > 0) {
      newSteps.push({
        label: 'Edição Manual - Bônus de Perícias',
        type: 'Perícias',
        value: bonusChanges.map((skill) => ({
          name: skill.name,
          value: `${skill.name}: ${skill.others >= 0 ? '+' : ''}${
            skill.others
          }`,
        })),
      });
    }

    const updates: Partial<CharacterSheet> = {
      completeSkills: finalSkills,
    };

    if (newSteps.length > 0) {
      updates.steps = [...sheet.steps, ...newSteps];
    }

    onSave(updates);
    onClose();
  };

  const handleCancel = () => {
    if (sheet.completeSkills) {
      const skills = sheet.completeSkills.map((skill) => ({
        name: skill.name,
        trained: (skill.training ?? 0) > 0,
        others: skill.others ?? 0,
      }));
      setEditedSkills(skills);
    }
    onClose();
  };

  const sortedSkills = useMemo(() => {
    const filtered = searchQuery
      ? editedSkills.filter((skill) =>
          skill.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : editedSkills;
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [editedSkills, searchQuery]);

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={handleCancel}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 600 }, overflow: 'hidden' },
      }}
    >
      <Box
        sx={{
          p: 3,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Stack
          direction='row'
          justifyContent='space-between'
          alignItems='center'
          mb={2}
        >
          <Typography variant='h6'>Editar Perícias</Typography>
          <IconButton onClick={handleCancel} size='small'>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        <Typography variant='body2' sx={{ mb: 2 }}>
          Marque as perícias treinadas e ajuste os valores de
          &ldquo;Outros&rdquo; conforme necessário.
        </Typography>

        <TextField
          fullWidth
          size='small'
          placeholder='Buscar perícia...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon color='action' />
              </InputAdornment>
            ),
          }}
        />

        <TableContainer
          component={Paper}
          sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}
        >
          <Table stickyHeader size='small'>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    fontWeight: 'bold',
                  }}
                >
                  Perícia
                </TableCell>
                <TableCell
                  align='center'
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    fontWeight: 'bold',
                  }}
                >
                  Treinada
                </TableCell>
                <TableCell
                  align='center'
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    fontWeight: 'bold',
                  }}
                >
                  Outros
                </TableCell>
                <TableCell
                  align='center'
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    fontWeight: 'bold',
                  }}
                >
                  Total
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedSkills.map((skill) => (
                <TableRow key={skill.name}>
                  <TableCell>{skill.name}</TableCell>
                  <TableCell align='center'>
                    <Checkbox
                      checked={skill.trained}
                      onChange={(e) =>
                        handleSkillTrainingChange(skill.name, e.target.checked)
                      }
                      size='small'
                    />
                  </TableCell>
                  <TableCell align='center'>
                    <TextField
                      type='number'
                      value={skill.others}
                      onChange={(e) =>
                        handleSkillOthersChange(
                          skill.name,
                          parseInt(e.target.value, 10) || 0
                        )
                      }
                      size='small'
                      sx={{ width: 70 }}
                      inputProps={{
                        style: { textAlign: 'center' },
                      }}
                    />
                  </TableCell>
                  <TableCell align='center'>
                    <Typography fontWeight='bold'>
                      {calculateSkillTotal(skill)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {getAvailableOficios().length > 0 && (
          <Box
            sx={{
              mt: 3,
              p: 2,
              backgroundColor: 'action.hover',
              borderRadius: 1,
              flexShrink: 0,
            }}
          >
            <Typography variant='subtitle2' sx={{ mb: 2 }}>
              Adicionar Novo Ofício
            </Typography>
            <Stack direction='row' spacing={2} alignItems='center'>
              <FormControl sx={{ minWidth: 200, flexGrow: 1 }}>
                <InputLabel>Selecione um Ofício</InputLabel>
                <Select
                  value={selectedOficio}
                  label='Selecione um Ofício'
                  onChange={(e) => setSelectedOficio(e.target.value)}
                  size='small'
                >
                  {getAvailableOficios().map((oficio) => (
                    <MenuItem key={oficio} value={oficio}>
                      {oficio}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant='contained'
                onClick={handleAddOficio}
                disabled={!selectedOficio}
                startIcon={<AddIcon />}
                size='small'
              >
                Adicionar
              </Button>
            </Stack>
          </Box>
        )}

        <Stack direction='row' spacing={2} sx={{ mt: 4, flexShrink: 0 }}>
          <Button
            fullWidth
            variant='contained'
            color='warning'
            onClick={handleSave}
          >
            Salvar
          </Button>
          <Button fullWidth variant='outlined' onClick={handleCancel}>
            Cancelar
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
};

export default SkillsEditDrawer;
