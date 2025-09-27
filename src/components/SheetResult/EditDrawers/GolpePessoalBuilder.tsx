import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Alert,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import {
  GOLPE_PESSOAL_EFFECTS,
  GolpePessoalBuild,
  GolpePessoalEffect,
  ELEMENTAL_DAMAGE_TYPES,
  BASIC_SPELLS_1ST_2ND_CIRCLE,
} from '../../../data/golpePessoal';
import { validateGolpePessoalBuild } from '../../../functions/powers/golpePessoal';
import CharacterSheet from '../../../interfaces/CharacterSheet';

interface GolpePessoalBuilderProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (build: GolpePessoalBuild) => void;
  initialBuild?: GolpePessoalBuild;
  sheet?: CharacterSheet;
}

interface EffectSelection {
  effect: GolpePessoalEffect;
  effectKey?: string;
  count: number;
  choices: string[];
}

const GolpePessoalBuilder: React.FC<GolpePessoalBuilderProps> = ({
  open,
  onClose,
  onConfirm,
  initialBuild,
  sheet,
}) => {
  const [weapon, setWeapon] = useState<string>('');
  const [selectedEffects, setSelectedEffects] = useState<
    Record<string, EffectSelection>
  >({});
  const [errors, setErrors] = useState<string[]>([]);

  const calculateTotalCost = (): number =>
    Object.values(selectedEffects).reduce((total, selection) => {
      let cost = selection.effect.cost * selection.count;

      // Handle variable costs
      if (
        selection.effect.variableCost &&
        selection.effect.name === 'Conjurador'
      ) {
        // Assume 1st circle spell for now (could be enhanced)
        cost = 2 * selection.count;
      }

      return total + cost;
    }, 0);

  const generateDescription = (): string => {
    const effectDescriptions = Object.values(selectedEffects).map(
      (selection) => {
        let desc = selection.effect.name;

        if (selection.count > 1) {
          desc += ` (${selection.count}x)`;
        }

        if (selection.choices.length > 0) {
          desc += ` (${selection.choices.join(', ')})`;
        }

        return desc;
      }
    );

    return `Golpe Pessoal (${weapon}) - ${effectDescriptions.join(
      ', '
    )} [${calculateTotalCost()} PM]`;
  };

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      if (initialBuild) {
        setWeapon(initialBuild.weapon);
        // Convert build to selections
        const effects: Record<string, EffectSelection> = {};
        initialBuild.effects.forEach((effectData) => {
          const effect = GOLPE_PESSOAL_EFFECTS[effectData.effectName];
          if (effect) {
            effects[effectData.effectName] = {
              effect,
              count: effectData.repeats,
              choices: effectData.choices || [],
            };
          }
        });
        setSelectedEffects(effects);
      } else {
        setWeapon('');
        setSelectedEffects({});
      }
      setErrors([]);
    }
  }, [open, initialBuild]);

  const handleEffectToggle = (effectName: string) => {
    // Find the effect by comparing the name property
    const effectEntry = Object.entries(GOLPE_PESSOAL_EFFECTS).find(
      ([, effect]) => effect.name === effectName
    );

    if (!effectEntry) return;

    const [effectKey, effect] = effectEntry;

    setSelectedEffects((prev) => {
      const newSelections = { ...prev };

      if (newSelections[effectKey]) {
        delete newSelections[effectKey];
      } else {
        newSelections[effectKey] = {
          effect,
          effectKey, // Store the key for later use
          count: 1,
          choices: [],
        };
      }

      return newSelections;
    });
  };

  const handleEffectCountChange = (effectName: string, delta: number) => {
    // Find the key for this effect name
    const effectKey = Object.entries(selectedEffects).find(
      ([, selection]) => selection.effect.name === effectName
    )?.[0];

    if (!effectKey) return;

    setSelectedEffects((prev) => {
      const newSelections = { ...prev };
      const selection = newSelections[effectKey];

      if (selection) {
        const newCount = Math.max(0, selection.count + delta);
        const maxRepeats = selection.effect.maxRepeats || Infinity;

        if (newCount === 0) {
          delete newSelections[effectKey];
        } else if (newCount <= maxRepeats) {
          selection.count = newCount;
        }
      }

      return newSelections;
    });
  };

  const handleChoiceChange = (
    effectName: string,
    choiceIndex: number,
    value: string
  ) => {
    // Find the key for this effect name
    const effectKey = Object.entries(selectedEffects).find(
      ([, selection]) => selection.effect.name === effectName
    )?.[0];

    if (!effectKey) return;

    setSelectedEffects((prev) => {
      const newSelections = { ...prev };
      const selection = newSelections[effectKey];

      if (selection) {
        const newChoices = [...selection.choices];
        newChoices[choiceIndex] = value;
        selection.choices = newChoices;
      }

      return newSelections;
    });
  };

  const handleConfirm = () => {
    const build: GolpePessoalBuild = {
      weapon,
      effects: Object.entries(selectedEffects).map(([key, selection]) => ({
        effectName: key, // Use the key (e.g., 'BRUTAL') instead of the name
        repeats: selection.count,
        choices: selection.choices,
      })),
      totalCost,
      description: generateDescription(),
    };

    const validation = validateGolpePessoalBuild(build);

    if (validation.isValid) {
      onConfirm(build);
      onClose();
    } else {
      setErrors(validation.errors);
    }
  };

  const generateDescription = (): string => {
    const effectDescriptions = Object.values(selectedEffects).map(
      (selection) => {
        let desc = selection.effect.name;

        if (selection.count > 1) {
          desc += ` (${selection.count}x)`;
        }

        if (selection.choices.length > 0) {
          desc += ` (${selection.choices.join(', ')})`;
        }

        return desc;
      }
    );

    return `Golpe Pessoal (${weapon}) - ${effectDescriptions.join(
      ', '
    )} [${totalCost} PM]`;
  };

  const renderEffectCard = (effect: GolpePessoalEffect) => {
    // Find the key for this effect in GOLPE_PESSOAL_EFFECTS
    const effectKey = Object.entries(GOLPE_PESSOAL_EFFECTS).find(
      ([, e]) => e.name === effect.name
    )?.[0];

    const isSelected = effectKey ? !!selectedEffects[effectKey] : false;
    const selection = effectKey ? selectedEffects[effectKey] : null;

    const getCategoryColor = (category: string) => {
      switch (category) {
        case 'offensive':
          return '#f44336';
        case 'utility':
          return '#2196f3';
        case 'drawback':
          return '#ff9800';
        default:
          return '#757575';
      }
    };

    const getCategoryIcon = (category: string) => {
      switch (category) {
        case 'offensive':
          return '⚔️';
        case 'utility':
          return '🎯';
        case 'drawback':
          return '⚠️';
        default:
          return '❓';
      }
    };

    return (
      <Card
        key={effect.name}
        sx={{
          mb: 2,
          border: isSelected ? 2 : 1,
          borderColor: isSelected ? 'primary.main' : 'divider',
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': {
            borderColor: 'primary.main',
            transform: 'translateY(-1px)',
          },
        }}
        onClick={() => handleEffectToggle(effect.name)}
      >
        <CardContent>
          <Box
            display='flex'
            justifyContent='space-between'
            alignItems='flex-start'
            mb={1}
          >
            <Box display='flex' alignItems='center' gap={1}>
              <Typography variant='h6'>
                {getCategoryIcon(effect.category)} {effect.name}
              </Typography>
              <Chip
                label={`${effect.cost > 0 ? '+' : ''}${effect.cost} PM`}
                size='small'
                color={effect.cost > 0 ? 'primary' : 'warning'}
                sx={{
                  backgroundColor: getCategoryColor(effect.category),
                  color: 'white',
                }}
              />
            </Box>

            {isSelected && selection && (
              <Box display='flex' alignItems='center' gap={1}>
                {effect.canRepeat && (
                  <>
                    <IconButton
                      size='small'
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEffectCountChange(effect.name, -1);
                      }}
                    >
                      <RemoveIcon />
                    </IconButton>
                    <Typography>{selection.count}</Typography>
                    <IconButton
                      size='small'
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEffectCountChange(effect.name, 1);
                      }}
                      disabled={
                        effect.maxRepeats
                          ? selection.count >= effect.maxRepeats
                          : false
                      }
                    >
                      <AddIcon />
                    </IconButton>
                  </>
                )}
              </Box>
            )}
          </Box>

          <Typography variant='body2' color='text.secondary' paragraph>
            {effect.description}
          </Typography>

          {/* Choice selectors */}
          {isSelected && selection && effect.requiresChoice && (
            <Box mt={2}>
              {effect.requiresChoice === 'element' && (
                <FormControl fullWidth size='small'>
                  <InputLabel>Tipo de Dano</InputLabel>
                  <Select
                    value={selection.choices[0] || ''}
                    label='Tipo de Dano'
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      handleChoiceChange(effect.name, 0, e.target.value)
                    }
                  >
                    {ELEMENTAL_DAMAGE_TYPES.map((element) => (
                      <MenuItem key={element} value={element}>
                        {element}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {effect.requiresChoice === 'spell' && (
                <FormControl fullWidth size='small'>
                  <InputLabel>Magia</InputLabel>
                  <Select
                    value={selection.choices[0] || ''}
                    label='Magia'
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      handleChoiceChange(effect.name, 0, e.target.value)
                    }
                  >
                    {BASIC_SPELLS_1ST_2ND_CIRCLE.map((spell) => (
                      <MenuItem key={spell} value={spell}>
                        {spell}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  const offensiveEffects = Object.values(GOLPE_PESSOAL_EFFECTS).filter(
    (e) => e.category === 'offensive'
  );
  const utilityEffects = Object.values(GOLPE_PESSOAL_EFFECTS).filter(
    (e) => e.category === 'utility'
  );
  const drawbackEffects = Object.values(GOLPE_PESSOAL_EFFECTS).filter(
    (e) => e.category === 'drawback'
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth='lg' fullWidth>
      <DialogTitle>
        <Box display='flex' alignItems='center' gap={1}>
          <SettingsIcon />
          Construtor de Golpe Pessoal
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Weapon Selection */}
        <Box mb={3}>
          <FormControl fullWidth>
            <InputLabel>Arma Específica</InputLabel>
            <Select
              value={weapon}
              label='Arma Específica'
              onChange={(e) => setWeapon(e.target.value)}
            >
              {sheet?.bag?.equipments?.Arma &&
              sheet.bag.equipments.Arma.length > 0 ? (
                sheet.bag.equipments.Arma.map((arma) => (
                  <MenuItem key={arma.nome} value={arma.nome}>
                    {arma.nome}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>
                  Nenhuma arma disponível no inventário
                </MenuItem>
              )}
            </Select>
          </FormControl>
          {(!sheet?.bag?.equipments?.Arma ||
            sheet.bag.equipments.Arma.length === 0) && (
            <Typography
              variant='caption'
              color='error'
              sx={{ mt: 1, display: 'block' }}
            >
              Adicione armas ao inventário do personagem antes de criar um Golpe
              Pessoal
            </Typography>
          )}
        </Box>

        {/* Cost Display */}
        <Box mb={3}>
          <Alert
            severity={totalCost >= 1 ? 'success' : 'warning'}
            sx={{ mb: 2 }}
          >
            <Typography variant='h6'>
              Custo Total: {totalCost} PM {totalCost < 1 && '(Mínimo: 1 PM)'}
            </Typography>
            {Object.keys(selectedEffects).length > 0 && (
              <Typography variant='body2' sx={{ mt: 1 }}>
                {generateDescription()}
              </Typography>
            )}
          </Alert>
        </Box>

        {errors.length > 0 && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {errors.map((error) => (
              <Typography key={error}>{error}</Typography>
            ))}
          </Alert>
        )}

        {/* Effect Categories */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant='h6' gutterBottom sx={{ color: '#f44336' }}>
              ⚔️ Efeitos Ofensivos
            </Typography>
            {offensiveEffects.map(renderEffectCard)}
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant='h6' gutterBottom sx={{ color: '#2196f3' }}>
              🎯 Efeitos Utilitários
            </Typography>
            {utilityEffects.map(renderEffectCard)}
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant='h6' gutterBottom sx={{ color: '#ff9800' }}>
              ⚠️ Limitações (Reduzem Custo)
            </Typography>
            {drawbackEffects.map(renderEffectCard)}
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={handleConfirm}
          variant='contained'
          disabled={
            !weapon ||
            Object.keys(selectedEffects).length === 0 ||
            !sheet?.bag?.equipments?.Arma ||
            sheet.bag.equipments.Arma.length === 0
          }
        >
          Confirmar Golpe Pessoal
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GolpePessoalBuilder;
