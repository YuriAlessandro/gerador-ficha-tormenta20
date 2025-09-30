import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Stack,
  IconButton,
  Divider,
  Autocomplete,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CharacterSheet, { Step, SubStep } from '@/interfaces/CharacterSheet';
import RACAS from '@/data/racas';
import CLASSES from '@/data/classes';
import { ORIGINS } from '@/data/origins';
import { allDivindadeNames } from '@/interfaces/Divindade';
import { DivindadeEnum } from '@/data/divindades';
import { CharacterAttributes } from '@/interfaces/Character';
import { Atributo } from '@/data/atributos';
import { recalculateSheet } from '@/functions/recalculateSheet';
import { nomes, nameGenerators } from '@/data/nomes';

interface SheetInfoEditDrawerProps {
  open: boolean;
  onClose: () => void;
  sheet: CharacterSheet;
  onSave: (updates: Partial<CharacterSheet> | CharacterSheet) => void;
}

interface EditedData {
  nome: string;
  nivel: number;
  sexo: string;
  raceName: string;
  className: string;
  originName: string;
  deityName: string;
  attributes: CharacterAttributes;
}

// Helper function to calculate the highest attribute value for a given modifier
const calculateValueFromModifier = (modifier: number): number =>
  // Formula: modifier = floor((value - 10) / 2)
  // Reverse: value = modifier * 2 + 10 + 1 (using highest value for the modifier)
  modifier * 2 + 11;

// Helper function to get name suggestions based on race and gender
const getNameSuggestions = (raceName: string, gender: string): string[] => {
  // Convert gender from display format to data format
  const genderKey = gender === 'Masculino' ? 'Homem' : 'Mulher';

  // Check if this race has specific names
  if (nomes[raceName] && nomes[raceName][genderKey]) {
    return nomes[raceName][genderKey];
  }

  // For special races like Lefou, Osteon, etc., try to get names from name generators
  const race = RACAS.find((r) => r.name === raceName);
  if (race && nameGenerators[raceName]) {
    // For complex name generators, return a sample of generated names
    const sampleNames: string[] = [];
    for (let i = 0; i < 10; i += 1) {
      try {
        const name = nameGenerators[raceName](race, genderKey);
        if (name && !sampleNames.includes(name)) {
          sampleNames.push(name);
        }
      } catch (error) {
        // If name generation fails, break the loop
        break;
      }
    }
    return sampleNames;
  }

  // Default fallback to Humano names if no specific names found
  return nomes.Humano[genderKey] || [];
};
const SheetInfoEditDrawer: React.FC<SheetInfoEditDrawerProps> = ({
  open,
  onClose,
  sheet,
  onSave,
}) => {
  const [editedData, setEditedData] = useState<EditedData>({
    nome: sheet.nome,
    nivel: sheet.nivel,
    sexo: sheet.sexo || 'Masculino',
    raceName: sheet.raca.name,
    className: sheet.classe.name,
    originName: sheet.origin?.name || '',
    deityName: sheet.devoto?.divindade.name || '',
    attributes: { ...sheet.atributos },
  });

  // State for name suggestions
  const [nameSuggestions, setNameSuggestions] = useState<string[]>(() =>
    getNameSuggestions(sheet.raca.name, sheet.sexo || 'Masculino')
  );

  useEffect(() => {
    setEditedData({
      nome: sheet.nome,
      nivel: sheet.nivel,
      sexo: sheet.sexo || 'Masculino',
      raceName: sheet.raca.name,
      className: sheet.classe.name,
      originName: sheet.origin?.name || '',
      deityName: sheet.devoto?.divindade.name || '',
      attributes: { ...sheet.atributos },
    });
    setNameSuggestions(
      getNameSuggestions(sheet.raca.name, sheet.sexo || 'Masculino')
    );
  }, [sheet, open]);

  // Update name suggestions when race or gender changes
  useEffect(() => {
    setNameSuggestions(
      getNameSuggestions(editedData.raceName, editedData.sexo)
    );
  }, [editedData.raceName, editedData.sexo]);

  const recalculateSkills = (level: number) => {
    if (!sheet.completeSkills) return sheet.completeSkills;

    return sheet.completeSkills.map((skill) => ({
      ...skill,
      halfLevel: Math.floor(level / 2),
    }));
  };

  const recalculatePV = (
    level: number,
    className: string,
    attributes = sheet.atributos
  ) => {
    const classData = CLASSES.find((c) => c.name === className);
    if (!classData) return sheet.pv;

    const conMod = attributes.Constituição.mod;
    const pvBase = classData.pv + conMod;
    const pvPerLevel = classData.addpv + conMod;

    return pvBase + pvPerLevel * (level - 1);
  };

  const recalculatePM = (
    level: number,
    className: string,
    attributes = sheet.atributos
  ) => {
    const classData = CLASSES.find((c) => c.name === className);
    if (!classData) return sheet.pm;

    // Get the key attribute modifier for PM calculation
    let keyAttrMod = 0;
    if (classData.spellPath) {
      const keyAttr = attributes[classData.spellPath.keyAttribute];
      keyAttrMod = keyAttr ? keyAttr.mod : 0;
    }

    const pmBase = classData.pm + keyAttrMod;
    const pmPerLevel = classData.addpm + keyAttrMod;

    return pmBase + pmPerLevel * (level - 1);
  };

  const handleAttributeModifierChange = (
    atributo: Atributo,
    newMod: number
  ) => {
    // Clamp the modifier to reasonable bounds
    const clampedMod = Math.max(-5, Math.min(10, newMod));
    const newValue = calculateValueFromModifier(clampedMod);

    setEditedData((prev) => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [atributo]: {
          ...prev.attributes[atributo],
          value: newValue,
          mod: clampedMod,
        },
      },
    }));
  };

  const handleSave = () => {
    const updates: Partial<CharacterSheet> = {
      nome: editedData.nome,
      nivel: editedData.nivel,
      sexo: editedData.sexo,
      atributos: editedData.attributes,
    };

    // Track manual edits in steps
    const newSteps: Step[] = [];

    // Check for basic info changes
    const infoChanges: SubStep[] = [];
    if (editedData.nome !== sheet.nome) {
      infoChanges.push({ name: 'Nome', value: editedData.nome });
    }
    if (editedData.nivel !== sheet.nivel) {
      infoChanges.push({ name: 'Nível', value: editedData.nivel.toString() });
    }
    if (editedData.sexo !== sheet.sexo) {
      infoChanges.push({ name: 'Gênero', value: editedData.sexo });
    }

    if (infoChanges.length > 0) {
      newSteps.push({
        label: 'Edição Manual - Informações Básicas',
        type: 'Edição Manual',
        value: infoChanges,
      });
    }

    // Check for attribute changes
    const attrChanges: SubStep[] = [];
    Object.entries(editedData.attributes).forEach(([attrName, attrData]) => {
      const originalAttr =
        sheet.atributos[attrName as keyof CharacterAttributes];
      if (attrData.mod !== originalAttr.mod) {
        attrChanges.push({
          name: attrName,
          value: `${attrData.mod >= 0 ? '+' : ''}${attrData.mod}`,
        });
      }
    });

    if (attrChanges.length > 0) {
      newSteps.push({
        label: 'Edição Manual - Modificadores de Atributos',
        type: 'Atributos',
        value: attrChanges,
      });
    }

    // Check for race change
    if (editedData.raceName !== sheet.raca.name) {
      newSteps.push({
        label: 'Edição Manual - Raça',
        type: 'Edição Manual',
        value: [{ name: 'Raça', value: editedData.raceName }],
      });
    }

    // Check for class change
    if (editedData.className !== sheet.classe.name) {
      newSteps.push({
        label: 'Edição Manual - Classe',
        type: 'Edição Manual',
        value: [{ name: 'Classe', value: editedData.className }],
      });
    }

    // Check for origin change
    if (editedData.originName !== (sheet.origin?.name || '')) {
      newSteps.push({
        label: 'Edição Manual - Origem',
        type: 'Edição Manual',
        value: [{ name: 'Origem', value: editedData.originName || 'Removida' }],
      });
    }

    // Check for deity change
    if (editedData.deityName !== (sheet.devoto?.divindade.name || '')) {
      newSteps.push({
        label: 'Edição Manual - Divindade',
        type: 'Edição Manual',
        value: [
          { name: 'Divindade', value: editedData.deityName || 'Removida' },
        ],
      });
    }

    // Add new steps to the sheet
    if (newSteps.length > 0) {
      updates.steps = [...sheet.steps, ...newSteps];
    }

    // Check if attributes have changed
    const attributesChanged =
      JSON.stringify(editedData.attributes) !== JSON.stringify(sheet.atributos);

    // Recalculate level-dependent values if level changed
    if (editedData.nivel !== sheet.nivel) {
      updates.completeSkills = recalculateSkills(editedData.nivel);
      updates.pv = recalculatePV(
        editedData.nivel,
        editedData.className,
        editedData.attributes
      );
      updates.pm = recalculatePM(
        editedData.nivel,
        editedData.className,
        editedData.attributes
      );
    }

    // Recalculate PV/PM if attributes changed (even if level didn't change)
    if (attributesChanged && editedData.nivel === sheet.nivel) {
      updates.pv = recalculatePV(
        editedData.nivel,
        editedData.className,
        editedData.attributes
      );
      updates.pm = recalculatePM(
        editedData.nivel,
        editedData.className,
        editedData.attributes
      );
    }

    // Find and update race if changed
    if (editedData.raceName !== sheet.raca.name) {
      const newRace = RACAS.find((r) => r.name === editedData.raceName);
      if (newRace) {
        updates.raca = newRace;
      }
    }

    // Find and update class if changed
    if (editedData.className !== sheet.classe.name) {
      const newClass = CLASSES.find((c) => c.name === editedData.className);
      if (newClass) {
        updates.classe = newClass;
        // Recalculate PV and PM for the new class
        updates.pv = recalculatePV(
          editedData.nivel,
          editedData.className,
          editedData.attributes
        );
        updates.pm = recalculatePM(
          editedData.nivel,
          editedData.className,
          editedData.attributes
        );
      }
    }

    // Find and update origin if changed
    if (editedData.originName && editedData.originName !== sheet.origin?.name) {
      const newOrigin = Object.values(ORIGINS).find(
        (o) => o.name === editedData.originName
      );
      if (newOrigin) {
        updates.origin = {
          name: newOrigin.name,
          powers: newOrigin.poderes || [],
        };
      }
    } else if (!editedData.originName && sheet.origin) {
      updates.origin = undefined;
    }

    // Find and update deity if changed
    if (
      editedData.deityName &&
      editedData.deityName !== sheet.devoto?.divindade.name
    ) {
      const newDeity = Object.values(DivindadeEnum).find(
        (d) => d.name === editedData.deityName
      );
      if (newDeity) {
        updates.devoto = {
          divindade: newDeity,
          poderes: [],
        };
      }
    } else if (!editedData.deityName && sheet.devoto) {
      updates.devoto = undefined;
    }

    // Use recalculation for full sheet update if attributes, race, or deity changed
    const raceChanged = editedData.raceName !== sheet.raca.name;
    const deityChanged =
      editedData.deityName !== (sheet.devoto?.divindade.name || '');
    const shouldUseRecalculateSheet =
      attributesChanged || raceChanged || deityChanged;

    if (shouldUseRecalculateSheet) {
      const updatedSheet = { ...sheet, ...updates };
      const recalculatedSheet = recalculateSheet(updatedSheet);
      onSave(recalculatedSheet);
    } else {
      onSave(updates);
    }

    onClose();
  };

  const handleCancel = () => {
    setEditedData({
      nome: sheet.nome,
      nivel: sheet.nivel,
      sexo: sheet.sexo || 'Masculino',
      raceName: sheet.raca.name,
      className: sheet.classe.name,
      originName: sheet.origin?.name || '',
      deityName: sheet.devoto?.divindade.name || '',
      attributes: { ...sheet.atributos },
    });
    setNameSuggestions(
      getNameSuggestions(sheet.raca.name, sheet.sexo || 'Masculino')
    );
    onClose();
  };

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={handleCancel}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 450 } },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Stack
          direction='row'
          justifyContent='space-between'
          alignItems='center'
          mb={2}
        >
          <Typography variant='h6'>Editar Informações da Ficha</Typography>
          <IconButton onClick={handleCancel} size='small'>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        <Stack spacing={3}>
          <Autocomplete
            freeSolo
            options={nameSuggestions}
            value={editedData.nome}
            onChange={(event, newValue) => {
              setEditedData({ ...editedData, nome: newValue || '' });
            }}
            onInputChange={(event, newInputValue) => {
              setEditedData({ ...editedData, nome: newInputValue });
            }}
            renderInput={(params) => (
              <TextField
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...params}
                fullWidth
                label='Nome'
                helperText='Digite ou selecione um nome baseado na raça e gênero'
              />
            )}
          />

          <TextField
            fullWidth
            label='Nível'
            type='number'
            value={editedData.nivel}
            onChange={(e) =>
              setEditedData({
                ...editedData,
                nivel: parseInt(e.target.value, 10) || 1,
              })
            }
            inputProps={{ min: 1, max: 20 }}
          />

          <FormControl fullWidth>
            <InputLabel>Gênero</InputLabel>
            <Select
              value={editedData.sexo}
              label='Gênero'
              onChange={(e) =>
                setEditedData({ ...editedData, sexo: e.target.value })
              }
            >
              <MenuItem value='Masculino'>Masculino</MenuItem>
              <MenuItem value='Feminino'>Feminino</MenuItem>
              <MenuItem value='Outro'>Outro</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Raça</InputLabel>
            <Select
              value={editedData.raceName}
              label='Raça'
              onChange={(e) =>
                setEditedData({
                  ...editedData,
                  raceName: e.target.value as string,
                })
              }
            >
              {RACAS.map((race) => (
                <MenuItem key={race.name} value={race.name}>
                  {race.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Classe</InputLabel>
            <Select
              value={editedData.className}
              label='Classe'
              onChange={(e) =>
                setEditedData({ ...editedData, className: e.target.value })
              }
            >
              {CLASSES.map((cls) => (
                <MenuItem key={cls.name} value={cls.name}>
                  {cls.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Origem</InputLabel>
            <Select
              value={editedData.originName}
              label='Origem'
              onChange={(e) =>
                setEditedData({ ...editedData, originName: e.target.value })
              }
            >
              <MenuItem value=''>Nenhuma</MenuItem>
              {Object.values(ORIGINS).map((origin) => (
                <MenuItem key={origin.name} value={origin.name}>
                  {origin.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Divindade</InputLabel>
            <Select
              value={editedData.deityName}
              label='Divindade'
              onChange={(e) =>
                setEditedData({ ...editedData, deityName: e.target.value })
              }
            >
              <MenuItem value=''>Nenhuma</MenuItem>
              {allDivindadeNames.map((deity) => (
                <MenuItem key={deity} value={deity}>
                  {deity}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Divider sx={{ my: 3 }} />

          <Typography variant='h6' sx={{ mb: 2 }}>
            Atributos
          </Typography>

          <Typography variant='body2' sx={{ mb: 2 }}>
            Ajuste os modificadores dos atributos. O valor será definido
            automaticamente.
          </Typography>

          <Stack spacing={2}>
            {Object.values(Atributo).map((atributo) => {
              const attribute = editedData.attributes[atributo];
              return (
                <Stack
                  key={atributo}
                  direction='row'
                  spacing={2}
                  alignItems='center'
                >
                  <Box sx={{ minWidth: '120px' }}>
                    <Typography variant='body2'>{atributo}:</Typography>
                  </Box>
                  <TextField
                    size='small'
                    type='number'
                    value={attribute.mod}
                    onChange={(e) => {
                      const newMod = parseInt(e.target.value, 10) || 0;
                      handleAttributeModifierChange(atributo, newMod);
                    }}
                    inputProps={{
                      min: -5,
                      max: 10,
                    }}
                    sx={{ width: '80px' }}
                  />
                </Stack>
              );
            })}
          </Stack>
        </Stack>

        <Stack direction='row' spacing={2} sx={{ mt: 4 }}>
          <Button fullWidth variant='contained' onClick={handleSave}>
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

export default SheetInfoEditDrawer;
