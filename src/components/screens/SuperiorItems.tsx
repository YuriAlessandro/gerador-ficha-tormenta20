import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Collapse,
  Container,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Slider,
  Switch,
  TextField,
  Typography,
  Autocomplete,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slide,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  ExpandMore as ExpandMoreIcon,
  History as HistoryIcon,
  Shuffle as ShuffleIcon,
} from '@mui/icons-material';
import { TransitionGroup } from 'react-transition-group';
import EQUIPAMENTOS from '../../data/equipamentos';
import {
  armorsModifications,
  weaponsModifications,
} from '../../data/rewards/items';
import { getSpecialMaterial } from '../../functions/rewards/rewardsGenerator';
import Equipment from '../../interfaces/Equipment';
import { ItemMod } from '../../interfaces/Rewards';
import {
  GeneratedSuperiorItem,
  SuperiorItemsState,
} from '../../interfaces/SuperiorItems';
import {
  addModificationWithPrerequisites,
  calculateModificationCost,
  validateModificationCombination,
} from '../../utils/superiorItemsValidation';
import { getSpecialMaterialData } from '../../data/specialMaterials';

type ItemType = 'weapon' | 'armor' | 'shield';

interface ItemOption {
  label: string;
  value: string;
  equipment: Equipment;
}

const allWeapons = [
  ...EQUIPAMENTOS.armasSimples,
  ...EQUIPAMENTOS.armasMarciais,
  ...EQUIPAMENTOS.armasExoticas,
  ...EQUIPAMENTOS.armasDeFogo,
];

const allArmors = [
  ...EQUIPAMENTOS.armadurasLeves,
  ...EQUIPAMENTOS.armaduraPesada,
];

const weaponsByType = {
  all: allWeapons,
  simple: EQUIPAMENTOS.armasSimples,
  martial: EQUIPAMENTOS.armasMarciais,
  exotic: EQUIPAMENTOS.armasExoticas,
  firearm: EQUIPAMENTOS.armasDeFogo,
};

const armorsByType = {
  all: allArmors,
  light: EQUIPAMENTOS.armadurasLeves,
  heavy: EQUIPAMENTOS.armaduraPesada,
};

const weaponSubtypes = [
  { value: 'simple', label: 'Simples' },
  { value: 'martial', label: 'Marciais' },
  { value: 'exotic', label: 'Exóticas' },
  { value: 'firearm', label: 'De Fogo' },
];

const armorSubtypes = [
  { value: 'light', label: 'Leves' },
  { value: 'heavy', label: 'Pesadas' },
];

const materialOptions = [
  { value: 'aço rubi', label: 'Aço Rubi' },
  { value: 'adamante', label: 'Adamante' },
  { value: 'gelo eterno', label: 'Gelo Eterno' },
  { value: 'madeira Tollon', label: 'Madeira Tollon' },
  { value: 'matéria vermelha', label: 'Matéria Vermelha' },
  { value: 'mitral', label: 'Mitral' },
];

const SuperiorItems: React.FC<{ isDarkMode: boolean }> = () => {
  const [state, setState] = useState<SuperiorItemsState>({
    generationMode: 'random',
    selectedItemType: null,
    selectedItem: null,
    selectedModifications: [],
    modificationCount: 2,
    minModificationCount: 1,
    maxModificationCount: 3,
    generatedHistory: [],
  });

  const [alertMessage, setAlertMessage] = useState<string>('');
  const [itemSubType, setItemSubType] = useState<string>('all');
  const [availableItems, setAvailableItems] = useState<ItemOption[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');

  const getModifications = (itemType: ItemType): ItemMod[] => {
    if (itemType === 'weapon') return weaponsModifications;
    return armorsModifications;
  };

  const getValidMods = (
    allMods: ItemMod[],
    selectedMods: ItemMod[],
    remainingCost: number
  ): ItemMod[] =>
    allMods.filter((mod) => {
      // Skip if already selected
      if (selectedMods.some((selected) => selected.mod === mod.mod))
        return false;

      // Check prerequisite
      if (mod.prerequisite) {
        return selectedMods.some(
          (selected) => selected.mod === mod.prerequisite
        );
      }

      // Check cost
      const modCost = mod.double ? 2 : 1;
      return modCost <= remainingCost;
    });

  const generateRandomModifications = (
    allMods: ItemMod[],
    targetCount: number
  ): ItemMod[] => {
    const selectedMods: ItemMod[] = [];
    let remainingCost = 5; // Maximum cost allowed
    let attempts = 0;
    const maxAttempts = 100;

    while (
      selectedMods.length < targetCount &&
      remainingCost > 0 &&
      attempts < maxAttempts
    ) {
      attempts += 1;

      // Get valid modifications that can be selected
      const validMods = getValidMods(allMods, selectedMods, remainingCost);

      if (validMods.length === 0) break;

      // Randomly select a modification
      const randomIndex = Math.floor(Math.random() * validMods.length);
      const selectedMod = validMods[randomIndex];

      // Check if we can add prerequisites and the modification
      let canAddMod = true;
      let totalCostNeeded = selectedMod.double ? 2 : 1;

      // Add prerequisites if needed
      if (
        selectedMod.prerequisite &&
        !selectedMods.some((mod) => mod.mod === selectedMod.prerequisite)
      ) {
        const prerequisite = allMods.find(
          (mod) => mod.mod === selectedMod.prerequisite
        );
        if (prerequisite) {
          const prereqCost = prerequisite.double ? 2 : 1;
          totalCostNeeded += prereqCost;
          if (totalCostNeeded <= remainingCost) {
            selectedMods.push(prerequisite);
            remainingCost -= prereqCost;
          } else {
            canAddMod = false;
          }
        }
      }

      // Add the selected modification if we can afford it
      if (canAddMod && totalCostNeeded <= remainingCost) {
        const modCost = selectedMod.double ? 2 : 1;
        selectedMods.push(selectedMod);
        remainingCost -= modCost;
      }
    }

    return selectedMods;
  };

  const updateAvailableItems = (itemType: ItemType, subType: string) => {
    let items: Equipment[] = [];

    if (itemType === 'weapon') {
      items = weaponsByType[subType as keyof typeof weaponsByType] || [];
    } else if (itemType === 'armor') {
      items = armorsByType[subType as keyof typeof armorsByType] || [];
    } else if (itemType === 'shield') {
      items = EQUIPAMENTOS.escudos;
    }

    const options: ItemOption[] = items
      .sort((a, b) => a.nome.localeCompare(b.nome))
      .map((item) => ({
        label: item.nome,
        value: item.nome,
        equipment: item,
      }));

    setAvailableItems(options);
  };

  const handleItemTypeChange = (event: SelectChangeEvent<ItemType>) => {
    const newType = event.target.value as ItemType;
    setState((prev) => ({
      ...prev,
      selectedItemType: newType,
      selectedItem: null,
      selectedModifications: [],
    }));
    setItemSubType('all');
    updateAvailableItems(newType, 'all');
  };

  const handleSubTypeChange = (event: SelectChangeEvent<string>) => {
    const newSubType = event.target.value;
    setItemSubType(newSubType);
    if (state.selectedItemType) {
      updateAvailableItems(state.selectedItemType, newSubType);
    }
  };

  const handleItemChange = (
    _event: React.SyntheticEvent,
    value: ItemOption | null
  ) => {
    setState((prev) => ({
      ...prev,
      selectedItem: value?.value || null,
    }));
  };

  const handleMinModificationCountChange = (
    _event: Event,
    newValue: number | number[]
  ) => {
    const newMin = newValue as number;
    setState((prev) => ({
      ...prev,
      minModificationCount: newMin,
      maxModificationCount: Math.max(newMin, prev.maxModificationCount),
      selectedModifications: [],
    }));
  };

  const handleMaxModificationCountChange = (
    _event: Event,
    newValue: number | number[]
  ) => {
    const newMax = newValue as number;
    setState((prev) => ({
      ...prev,
      maxModificationCount: newMax,
      minModificationCount: Math.min(newMax, prev.minModificationCount),
      selectedModifications: [],
    }));
  };

  const handleModeToggle = () => {
    setState((prev) => ({
      ...prev,
      generationMode: prev.generationMode === 'random' ? 'manual' : 'random',
      selectedModifications: [],
    }));
  };

  const handleModificationSelect = (
    _event: React.SyntheticEvent,
    value: ItemMod[]
  ) => {
    if (!state.selectedItemType) return;

    const allMods = getModifications(state.selectedItemType);

    const newMods = value.reduce(
      (acc: ItemMod[], selectedMod: ItemMod) =>
        addModificationWithPrerequisites(selectedMod, acc, allMods),
      []
    );

    const cost = calculateModificationCost(newMods);
    if (cost > 5) {
      setAlertMessage(
        'Muito caras! O custo total das modificações não pode exceder 5 pontos.'
      );
      return;
    }

    setAlertMessage('');
    setState((prev) => ({
      ...prev,
      selectedModifications: newMods,
    }));

    // Clear selected material if Material especial is no longer selected
    if (!newMods.some((mod) => mod.mod === 'Material especial')) {
      setSelectedMaterial('');
    }
  };

  const generateRandomItem = () => {
    if (!state.selectedItemType || !state.selectedItem) {
      setAlertMessage('Selecione o tipo e o item antes de gerar.');
      return;
    }

    const selectedEquipment = availableItems.find(
      (item) => item.value === state.selectedItem
    )?.equipment;

    if (!selectedEquipment) return;

    // Generate random modifications based on the min/max range
    const allMods = getModifications(state.selectedItemType);
    const randomModCount =
      Math.floor(
        Math.random() *
          (state.maxModificationCount - state.minModificationCount + 1)
      ) + state.minModificationCount;
    const randomMods = generateRandomModifications(allMods, randomModCount);

    const newItem: GeneratedSuperiorItem = {
      id: Date.now().toString(),
      itemName: selectedEquipment.nome,
      itemType: state.selectedItemType,
      modifications: randomMods.map((mod) => {
        // Replace "Material especial" with actual material
        if (mod.mod === 'Material especial') {
          const specialMaterial = getSpecialMaterial();
          const materialData = getSpecialMaterialData(specialMaterial);
          const relevantEffect =
            state.selectedItemType === 'weapon'
              ? materialData?.weaponEffect
              : materialData?.armorEffect;

          return {
            ...mod,
            mod: `Material ${specialMaterial}`,
            description:
              relevantEffect?.effect || `Material ${specialMaterial}`,
            appliesTo: state.selectedItemType as
              | 'weapon'
              | 'armor'
              | 'shield'
              | 'all',
          };
        }

        return {
          ...mod,
          description: mod.description || '',
          appliesTo: state.selectedItemType as
            | 'weapon'
            | 'armor'
            | 'shield'
            | 'all',
        };
      }),
      timestamp: new Date(),
    };

    setState((prev) => ({
      ...prev,
      generatedHistory: [newItem, ...prev.generatedHistory.slice(0, 9)],
    }));

    setAlertMessage('');
  };

  const generateManualItem = () => {
    if (!state.selectedItemType || !state.selectedItem) {
      setAlertMessage('Selecione o tipo e o item antes de gerar.');
      return;
    }

    if (state.selectedModifications.length === 0) {
      setAlertMessage('Selecione pelo menos uma modificação.');
      return;
    }

    // Check if Material especial is selected but no material type chosen
    if (
      state.selectedModifications.some(
        (mod) => mod.mod === 'Material especial'
      ) &&
      !selectedMaterial
    ) {
      setAlertMessage('Selecione o tipo de material especial.');
      return;
    }

    const selectedEquipment = availableItems.find(
      (item) => item.value === state.selectedItem
    )?.equipment;

    if (!selectedEquipment) return;

    const validation = validateModificationCombination(
      state.selectedModifications
    );
    if (!validation.isValid) {
      setAlertMessage(`Erro: ${validation.errors.join(', ')}`);
      return;
    }

    const newItem: GeneratedSuperiorItem = {
      id: Date.now().toString(),
      itemName: selectedEquipment.nome,
      itemType: state.selectedItemType,
      modifications: state.selectedModifications.map((mod) => {
        // Replace "Material especial" with selected material
        if (mod.mod === 'Material especial' && selectedMaterial) {
          const materialData = getSpecialMaterialData(selectedMaterial);
          const relevantEffect =
            state.selectedItemType === 'weapon'
              ? materialData?.weaponEffect
              : materialData?.armorEffect;

          return {
            ...mod,
            mod: `Material ${selectedMaterial}`,
            description:
              relevantEffect?.effect || `Material ${selectedMaterial}`,
            appliesTo: state.selectedItemType as
              | 'weapon'
              | 'armor'
              | 'shield'
              | 'all',
          };
        }

        return {
          ...mod,
          description: mod.description || '',
          appliesTo: state.selectedItemType as
            | 'weapon'
            | 'armor'
            | 'shield'
            | 'all',
        };
      }),
      timestamp: new Date(),
    };

    setState((prev) => ({
      ...prev,
      generatedHistory: [newItem, ...prev.generatedHistory.slice(0, 9)],
    }));

    setAlertMessage('');
  };

  const copyItemToClipboard = (item: GeneratedSuperiorItem) => {
    const modText = item.modifications
      .map((mod) => `${mod.mod}: ${mod.description}`)
      .join('; ');

    const fullText = `${item.itemName}\nModificações: ${modText}`;
    navigator.clipboard.writeText(fullText);
  };

  const availableModifications = state.selectedItemType
    ? getModifications(state.selectedItemType)
        .filter(
          (mod) =>
            !state.selectedModifications.some(
              (selected) => selected.mod === mod.mod
            )
        )
        .sort((a, b) => a.mod.localeCompare(b.mod))
    : [];

  const getModificationOption = (mod: ItemMod) => {
    const hasPrerequisite = mod.prerequisite
      ? state.selectedModifications.some(
          (selected) => selected.mod === mod.prerequisite
        )
      : true;

    return {
      ...mod,
      disabled: !hasPrerequisite,
    };
  };

  return (
    <Container maxWidth='lg' sx={{ py: 3 }}>
      <Typography variant='h4' component='h1' gutterBottom>
        Gerador de Itens Superiores
      </Typography>

      <Collapse in={alertMessage.length > 0}>
        <Alert
          sx={{ mb: 2 }}
          severity='error'
          onClose={() => setAlertMessage('')}
        >
          {alertMessage}
        </Alert>
      </Collapse>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={state.generationMode === 'manual'}
                  onChange={handleModeToggle}
                />
              }
              label={`Modo: ${
                state.generationMode === 'random' ? 'Aleatório' : 'Manual'
              }`}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Tipo do Item</InputLabel>
              <Select
                value={state.selectedItemType || ''}
                onChange={handleItemTypeChange}
                label='Tipo do Item'
              >
                <MenuItem value='weapon'>Armas</MenuItem>
                <MenuItem value='armor'>Armaduras</MenuItem>
                <MenuItem value='shield'>Escudos</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {state.selectedItemType && state.selectedItemType !== 'shield' && (
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Subtipo</InputLabel>
                <Select
                  value={itemSubType}
                  onChange={handleSubTypeChange}
                  label='Subtipo'
                >
                  <MenuItem value='all'>Todos</MenuItem>
                  {state.selectedItemType === 'weapon' &&
                    weaponSubtypes.map((sub) => (
                      <MenuItem key={sub.value} value={sub.value}>
                        {sub.label}
                      </MenuItem>
                    ))}
                  {state.selectedItemType === 'armor' &&
                    armorSubtypes.map((sub) => (
                      <MenuItem key={sub.value} value={sub.value}>
                        {sub.label}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          <Grid item xs={12} md={4}>
            <Autocomplete
              options={availableItems}
              getOptionLabel={(option) => option.label}
              value={
                availableItems.find(
                  (item) => item.value === state.selectedItem
                ) || null
              }
              onChange={handleItemChange}
              renderInput={(params) => {
                const { InputLabelProps, InputProps, ...rest } = params;
                return (
                  <TextField
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...rest}
                    InputLabelProps={InputLabelProps}
                    InputProps={InputProps}
                    label='Item Específico'
                  />
                );
              }}
              disabled={!state.selectedItemType}
            />
          </Grid>

          {state.generationMode === 'random' && (
            <>
              <Grid item xs={12} md={6}>
                <Typography gutterBottom>
                  Mínimo de Modificações: {state.minModificationCount}
                </Typography>
                <Slider
                  value={state.minModificationCount}
                  onChange={handleMinModificationCountChange}
                  min={1}
                  max={5}
                  marks
                  valueLabelDisplay='auto'
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography gutterBottom>
                  Máximo de Modificações: {state.maxModificationCount}
                </Typography>
                <Slider
                  value={state.maxModificationCount}
                  onChange={handleMaxModificationCountChange}
                  min={1}
                  max={5}
                  marks
                  valueLabelDisplay='auto'
                />
              </Grid>
            </>
          )}

          {state.generationMode === 'manual' && (
            <>
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={availableModifications}
                  getOptionLabel={(option) => option.mod}
                  getOptionDisabled={(option) => {
                    const modOption = getModificationOption(option);
                    return modOption.disabled;
                  }}
                  value={state.selectedModifications}
                  onChange={handleModificationSelect}
                  renderInput={(params) => (
                    <TextField
                      // eslint-disable-next-line react/jsx-props-no-spreading
                      {...params}
                      label='Modificações'
                      placeholder='Selecione as modificações'
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant='outlined'
                        label={`${option.mod}${
                          option.double ? ' (2 pts)' : ''
                        }`}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...getTagProps({ index })}
                      />
                    ))
                  }
                  renderOption={(props, option) => {
                    const modOption = getModificationOption(option);
                    return (
                      <Box
                        component='li'
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...props}
                        sx={{
                          opacity: modOption.disabled ? 0.5 : 1,
                          pointerEvents: modOption.disabled ? 'none' : 'auto',
                        }}
                      >
                        <Box>
                          <Typography variant='body2'>
                            {option.mod}
                            {option.double && (
                              <Chip size='small' label='2 pts' sx={{ ml: 1 }} />
                            )}
                            {modOption.disabled && (
                              <Chip
                                size='small'
                                label='Bloqueado'
                                color='error'
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Typography>
                          {option.description && (
                            <Typography
                              variant='caption'
                              color='text.secondary'
                              sx={{ display: 'block', mb: 0.5 }}
                            >
                              {option.description}
                            </Typography>
                          )}
                          {option.prerequisite && (
                            <Typography
                              variant='caption'
                              color={
                                modOption.disabled
                                  ? 'error.main'
                                  : 'warning.main'
                              }
                              sx={{ display: 'block' }}
                            >
                              Requer: {option.prerequisite}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    );
                  }}
                  disabled={!state.selectedItemType}
                />
              </Grid>

              {state.selectedModifications.some(
                (mod) => mod.mod === 'Material especial'
              ) && (
                <Grid item xs={12}>
                  <Autocomplete
                    options={materialOptions}
                    getOptionLabel={(option) => option.label}
                    value={
                      materialOptions.find(
                        (opt) => opt.value === selectedMaterial
                      ) || null
                    }
                    onChange={(_, value) =>
                      setSelectedMaterial(value?.value || '')
                    }
                    renderInput={(params) => (
                      <TextField
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...params}
                        label='Tipo de Material'
                        placeholder='Selecione o material especial'
                        required
                      />
                    )}
                  />
                </Grid>
              )}

              {selectedMaterial && (
                <Grid item xs={12}>
                  {(() => {
                    const materialData =
                      getSpecialMaterialData(selectedMaterial);
                    if (!materialData) return null;
                    const relevantEffect =
                      state.selectedItemType === 'weapon'
                        ? materialData.weaponEffect
                        : materialData.armorEffect;
                    if (!relevantEffect) return null;
                    return (
                      <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Typography variant='h6' gutterBottom>
                          Efeito do Material: {materialData.name}
                        </Typography>
                        <Typography variant='body2'>
                          <strong>Efeito:</strong> {relevantEffect.effect}
                        </Typography>
                      </Paper>
                    );
                  })()}
                </Grid>
              )}

              {state.selectedModifications.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant='body2' color='text.secondary'>
                    Custo total:{' '}
                    {calculateModificationCost(state.selectedModifications)}{' '}
                    pontos
                  </Typography>
                </Grid>
              )}
            </>
          )}

          <Grid item xs={12}>
            <Button
              variant='contained'
              size='large'
              startIcon={<ShuffleIcon />}
              onClick={
                state.generationMode === 'random'
                  ? generateRandomItem
                  : generateManualItem
              }
              disabled={!state.selectedItemType || !state.selectedItem}
            >
              Gerar Item Superior
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {state.generatedHistory.length > 0 && (
        <Box>
          <Typography variant='h5' gutterBottom>
            <HistoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Itens Gerados
          </Typography>

          <TransitionGroup>
            {state.generatedHistory.map((item) => (
              <Slide key={item.id} direction='right' timeout={600}>
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant='h6' component='h3'>
                      {item.itemName}
                    </Typography>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      gutterBottom
                    >
                      {item.itemType === 'weapon' && 'Arma'}
                      {item.itemType === 'armor' && 'Armadura'}
                      {item.itemType === 'shield' && 'Escudo'}
                      {' • '}
                      {new Date(item.timestamp).toLocaleString()}
                    </Typography>
                    {item.modifications.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant='subtitle2' gutterBottom>
                          Modificações:
                        </Typography>
                        {item.modifications.map((mod) => (
                          <Accordion
                            key={`${item.id}-${mod.mod}`}
                            sx={{ mb: 1 }}
                          >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Typography>
                                {mod.mod}
                                {mod.double && (
                                  <Chip
                                    size='small'
                                    label='2 pts'
                                    sx={{ ml: 1 }}
                                  />
                                )}
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Typography variant='body2'>
                                {mod.description}
                              </Typography>
                              {mod.prerequisite && (
                                <Typography
                                  variant='caption'
                                  color='warning.main'
                                >
                                  Pré-requisito: {mod.prerequisite}
                                </Typography>
                              )}
                            </AccordionDetails>
                          </Accordion>
                        ))}
                      </Box>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button
                      size='small'
                      startIcon={<CopyIcon />}
                      onClick={() => copyItemToClipboard(item)}
                    >
                      Copiar
                    </Button>
                  </CardActions>
                </Card>
              </Slide>
            ))}
          </TransitionGroup>
        </Box>
      )}
    </Container>
  );
};

export default SuperiorItems;
