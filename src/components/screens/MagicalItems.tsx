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
import { SEO, getPageSEO } from '../SEO';
import {
  ContentCopy as CopyIcon,
  ExpandMore as ExpandMoreIcon,
  History as HistoryIcon,
  AutoFixHigh as MagicIcon,
} from '@mui/icons-material';
import { TransitionGroup } from 'react-transition-group';
import EQUIPAMENTOS from '../../data/systems/tormenta20/equipamentos';
import {
  armorEnchantments,
  weaponsEnchantments,
} from '../../data/rewards/items';
import Equipment from '../../interfaces/Equipment';
import { ItemE } from '../../interfaces/Rewards';
import {
  GeneratedMagicalItem,
  MagicalItemsState,
} from '../../interfaces/MagicalItems';
import {
  addEnchantmentIfValid,
  calculateEnchantmentCost,
  validateEnchantmentCombination,
  validateEnchantmentForItemType,
} from '../../utils/magicalItemsValidation';

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

const MagicalItems: React.FC<{ isDarkMode: boolean }> = () => {
  const [state, setState] = useState<MagicalItemsState>({
    generationMode: 'random',
    selectedItemType: null,
    selectedItem: null,
    selectedEnchantments: [],
    enchantmentCount: 2,
    minEnchantmentCount: 1,
    maxEnchantmentCount: 3,
    generatedHistory: [],
  });

  const [alertMessage, setAlertMessage] = useState<string>('');
  const [itemSubType, setItemSubType] = useState<string>('all');
  const [availableItems, setAvailableItems] = useState<ItemOption[]>([]);

  const getEnchantments = (itemType: ItemType): ItemE[] => {
    if (itemType === 'weapon') return weaponsEnchantments;
    if (itemType === 'shield') {
      // Shields can use armor enchantments, including shield-only ones
      return armorEnchantments;
    }
    // Armor uses armor enchantments but excludes shield-only ones
    return armorEnchantments.filter((e) => !e.onlyShield);
  };

  const getValidEnchantments = (
    allEnchantments: ItemE[],
    selectedEnchantments: ItemE[],
    remainingCost: number,
    itemType: ItemType
  ): ItemE[] =>
    allEnchantments.filter((enchantment) => {
      // Skip if already selected
      if (
        selectedEnchantments.some(
          (selected) => selected.enchantment === enchantment.enchantment
        )
      )
        return false;

      // Check type compatibility
      if (!validateEnchantmentForItemType(enchantment, itemType)) return false;

      // Check cost
      const enchantmentCost = enchantment.double ? 2 : 1;
      return enchantmentCost <= remainingCost;
    });

  const generateRandomEnchantments = (
    allEnchantments: ItemE[],
    targetCount: number,
    itemType: ItemType
  ): ItemE[] => {
    const selectedEnchantments: ItemE[] = [];
    let remainingCost = 5; // Maximum cost allowed
    let attempts = 0;
    const maxAttempts = 100;

    while (
      selectedEnchantments.length < targetCount &&
      remainingCost > 0 &&
      attempts < maxAttempts
    ) {
      attempts += 1;

      // Get valid enchantments that can be selected
      const validEnchantments = getValidEnchantments(
        allEnchantments,
        selectedEnchantments,
        remainingCost,
        itemType
      );

      if (validEnchantments.length === 0) break;

      // Randomly select an enchantment
      const randomIndex = Math.floor(Math.random() * validEnchantments.length);
      const selectedEnchantment = validEnchantments[randomIndex];

      // Add the selected enchantment if we can afford it
      const enchantmentCost = selectedEnchantment.double ? 2 : 1;
      if (enchantmentCost <= remainingCost) {
        selectedEnchantments.push(selectedEnchantment);
        remainingCost -= enchantmentCost;
      }
    }

    return selectedEnchantments;
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
      selectedEnchantments: [],
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

  const handleMinEnchantmentCountChange = (
    _event: Event,
    newValue: number | number[]
  ) => {
    const newMin = newValue as number;
    setState((prev) => ({
      ...prev,
      minEnchantmentCount: newMin,
      maxEnchantmentCount: Math.max(newMin, prev.maxEnchantmentCount),
      selectedEnchantments: [],
    }));
  };

  const handleMaxEnchantmentCountChange = (
    _event: Event,
    newValue: number | number[]
  ) => {
    const newMax = newValue as number;
    setState((prev) => ({
      ...prev,
      maxEnchantmentCount: newMax,
      minEnchantmentCount: Math.min(newMax, prev.minEnchantmentCount),
      selectedEnchantments: [],
    }));
  };

  const handleModeToggle = () => {
    setState((prev) => ({
      ...prev,
      generationMode: prev.generationMode === 'random' ? 'manual' : 'random',
      selectedEnchantments: [],
    }));
  };

  const handleEnchantmentSelect = (
    _event: React.SyntheticEvent,
    value: ItemE[]
  ) => {
    if (!state.selectedItemType) return;

    const newEnchantments = value.reduce(
      (acc: ItemE[], selectedEnchantment: ItemE) =>
        addEnchantmentIfValid(selectedEnchantment, acc),
      []
    );

    const cost = calculateEnchantmentCost(newEnchantments);
    if (cost > 5) {
      setAlertMessage(
        'Muito caros! O custo total dos encantamentos não pode exceder 5 pontos.'
      );
      return;
    }

    setAlertMessage('');
    setState((prev) => ({
      ...prev,
      selectedEnchantments: newEnchantments,
    }));
  };

  const generateRandomItem = () => {
    if (!state.selectedItemType || !state.selectedItem) {
      setAlertMessage('Selecione o tipo e o antes de gerar.');
      return;
    }

    const selectedEquipment = availableItems.find(
      (item) => item.value === state.selectedItem
    )?.equipment;

    if (!selectedEquipment) return;

    // Generate random enchantments based on the min/max range
    const allEnchantments = getEnchantments(state.selectedItemType);
    const randomEnchantmentCount =
      Math.floor(
        Math.random() *
          (state.maxEnchantmentCount - state.minEnchantmentCount + 1)
      ) + state.minEnchantmentCount;
    const randomEnchantments = generateRandomEnchantments(
      allEnchantments,
      randomEnchantmentCount,
      state.selectedItemType
    );

    const newItem: GeneratedMagicalItem = {
      id: Date.now().toString(),
      itemName: selectedEquipment.nome,
      itemType: state.selectedItemType,
      enchantments: randomEnchantments.map((enchantment) => ({
        ...enchantment,
        appliesTo: state.selectedItemType as
          | 'weapon'
          | 'armor'
          | 'shield'
          | 'all',
      })),
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
      setAlertMessage('Selecione o tipo e o antes de gerar.');
      return;
    }

    if (state.selectedEnchantments.length === 0) {
      setAlertMessage('Selecione pelo menos um encantamento.');
      return;
    }

    const selectedEquipment = availableItems.find(
      (item) => item.value === state.selectedItem
    )?.equipment;

    if (!selectedEquipment) return;

    const validation = validateEnchantmentCombination(
      state.selectedEnchantments
    );
    if (!validation.isValid) {
      setAlertMessage(`Erro: ${validation.errors.join(', ')}`);
      return;
    }

    const newItem: GeneratedMagicalItem = {
      id: Date.now().toString(),
      itemName: selectedEquipment.nome,
      itemType: state.selectedItemType,
      enchantments: state.selectedEnchantments.map((enchantment) => ({
        ...enchantment,
        appliesTo: state.selectedItemType as
          | 'weapon'
          | 'armor'
          | 'shield'
          | 'all',
      })),
      timestamp: new Date(),
    };

    setState((prev) => ({
      ...prev,
      generatedHistory: [newItem, ...prev.generatedHistory.slice(0, 9)],
    }));

    setAlertMessage('');
  };

  const copyItemToClipboard = (item: GeneratedMagicalItem) => {
    const enchantmentText = item.enchantments
      .map((enchantment) => `${enchantment.enchantment}: ${enchantment.effect}`)
      .join('; ');

    const fullText = `${item.itemName} Mágico\\nEncantamentos: ${enchantmentText}`;
    navigator.clipboard.writeText(fullText);
  };

  const availableEnchantments = state.selectedItemType
    ? getEnchantments(state.selectedItemType)
        .filter((enchantment) => {
          // Filter out already selected enchantments
          if (
            state.selectedEnchantments.some(
              (selected) => selected.enchantment === enchantment.enchantment
            )
          )
            return false;

          // Filter by type
          return validateEnchantmentForItemType(
            enchantment,
            state.selectedItemType!
          );
        })
        .sort((a, b) => a.enchantment.localeCompare(b.enchantment))
    : [];

  const getEnchantmentOption = (enchantment: ItemE) => {
    const currentCost = calculateEnchantmentCost(state.selectedEnchantments);
    const enchantmentCost = enchantment.double ? 2 : 1;
    const wouldExceedCost = currentCost + enchantmentCost > 5;

    return {
      ...enchantment,
      disabled: wouldExceedCost,
    };
  };

  const magicalItemsSEO = getPageSEO('magicalItems');

  return (
    <>
      <SEO
        title={magicalItemsSEO.title}
        description={magicalItemsSEO.description}
        url='/itens-magicos'
      />
      <Container maxWidth='lg' sx={{ py: 3 }}>
        <Typography variant='h4' component='h1' gutterBottom>
          Gerador de Itens Mágicos
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
            <Grid size={12}>
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

            <Grid size={{ xs: 12, md: 4 }}>
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
              <Grid size={{ xs: 12, md: 4 }}>
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

            <Grid size={{ xs: 12, md: 4 }}>
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
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography gutterBottom>
                    Mínimo de Encantamentos: {state.minEnchantmentCount}
                  </Typography>
                  <Slider
                    value={state.minEnchantmentCount}
                    onChange={handleMinEnchantmentCountChange}
                    min={1}
                    max={5}
                    marks
                    valueLabelDisplay='auto'
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography gutterBottom>
                    Máximo de Encantamentos: {state.maxEnchantmentCount}
                  </Typography>
                  <Slider
                    value={state.maxEnchantmentCount}
                    onChange={handleMaxEnchantmentCountChange}
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
                <Grid size={12}>
                  <Autocomplete
                    multiple
                    options={availableEnchantments}
                    getOptionLabel={(option) => option.enchantment}
                    getOptionDisabled={(option) => {
                      const enchantmentOption = getEnchantmentOption(option);
                      return enchantmentOption.disabled;
                    }}
                    value={state.selectedEnchantments}
                    onChange={handleEnchantmentSelect}
                    renderInput={(params) => (
                      <TextField
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...params}
                        label='Encantamentos'
                        placeholder='Selecione os encantamentos'
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          variant='outlined'
                          label={`${option.enchantment}${
                            option.double ? ' (2 pts)' : ''
                          }`}
                          // eslint-disable-next-line react/jsx-props-no-spreading
                          {...getTagProps({ index })}
                        />
                      ))
                    }
                    renderOption={(props, option) => {
                      const enchantmentOption = getEnchantmentOption(option);
                      return (
                        <Box
                          component='li'
                          // eslint-disable-next-line react/jsx-props-no-spreading
                          {...props}
                          sx={{
                            opacity: enchantmentOption.disabled ? 0.5 : 1,
                            pointerEvents: enchantmentOption.disabled
                              ? 'none'
                              : 'auto',
                          }}
                        >
                          <Box>
                            <Typography variant='body2'>
                              {option.enchantment}
                              {option.double && (
                                <Chip
                                  size='small'
                                  label='2 pts'
                                  sx={{ ml: 1 }}
                                />
                              )}
                              {enchantmentOption.disabled && (
                                <Chip
                                  size='small'
                                  label='Muito caro'
                                  color='error'
                                  sx={{ ml: 1 }}
                                />
                              )}
                              {option.onlyShield && (
                                <Chip
                                  size='small'
                                  label='Só escudo'
                                  color='info'
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </Typography>
                            {option.effect && (
                              <Typography
                                variant='caption'
                                color='text.secondary'
                                sx={{ display: 'block', mb: 0.5 }}
                              >
                                {option.effect}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      );
                    }}
                    disabled={!state.selectedItemType}
                  />
                </Grid>

                {state.selectedEnchantments.length > 0 && (
                  <Grid size={12}>
                    <Typography variant='body2' color='text.secondary'>
                      Custo total:{' '}
                      {calculateEnchantmentCost(state.selectedEnchantments)}{' '}
                      pontos
                    </Typography>
                  </Grid>
                )}
              </>
            )}

            <Grid size={12}>
              <Button
                variant='contained'
                size='large'
                startIcon={<MagicIcon />}
                onClick={
                  state.generationMode === 'random'
                    ? generateRandomItem
                    : generateManualItem
                }
                disabled={!state.selectedItemType || !state.selectedItem}
              >
                Gerar Item Mágico
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
                        {item.itemName} Mágico
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
                      {item.enchantments.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant='subtitle2' gutterBottom>
                            Encantamentos:
                          </Typography>
                          {item.enchantments.map((enchantment) => (
                            <Accordion
                              key={`${item.id}-${enchantment.enchantment}`}
                              sx={{ mb: 1 }}
                            >
                              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography>
                                  {enchantment.enchantment}
                                  {enchantment.double && (
                                    <Chip
                                      size='small'
                                      label='2 pts'
                                      sx={{ ml: 1 }}
                                    />
                                  )}
                                  {enchantment.onlyShield && (
                                    <Chip
                                      size='small'
                                      label='Só escudo'
                                      color='info'
                                      sx={{ ml: 1 }}
                                    />
                                  )}
                                </Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                <Typography variant='body2'>
                                  {enchantment.effect}
                                </Typography>
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
    </>
  );
};

export default MagicalItems;
