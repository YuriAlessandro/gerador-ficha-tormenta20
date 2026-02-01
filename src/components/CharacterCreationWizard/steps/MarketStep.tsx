import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  Alert,
  InputAdornment,
  Divider,
  Chip,
  Stack,
  useMediaQuery,
  useTheme,
  Button,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import Equipment, {
  BagEquipments,
  DefenseEquipment,
} from '@/interfaces/Equipment';
import {
  MarketEquipment,
  MarketSelections,
} from '@/interfaces/MarketEquipment';

interface MarketStepProps {
  initialMoney: number;
  bagEquipments: BagEquipments;
  availableEquipment: MarketEquipment;
  onChange: (data: MarketSelections) => void;
}

// Helper to check if equipment is DefenseEquipment
const isDefenseEquipment = (
  equip: Equipment | DefenseEquipment
): equip is DefenseEquipment => 'defenseBonus' in equip;

// Helper to format price
const formatPrice = (price: number | undefined): string => {
  if (price === undefined || price === 0) return 'Grátis';
  return `T$ ${price}`;
};

// Helper to calculate total bag spaces
const calcBagSpaces = (bagEquipments: BagEquipments): number =>
  Object.values(bagEquipments)
    .flat()
    .reduce((acc, item) => acc + (item?.spaces || 0), 0);

// Category labels in Portuguese
const CATEGORY_LABELS: Record<string, string> = {
  weapons: 'Armas',
  armors: 'Armaduras',
  shields: 'Escudos',
  generalItems: 'Itens Gerais',
  clothing: 'Vestuário',
  alchemy: 'Alquimia',
  food: 'Alimentação',
};

// Bag category labels
const BAG_CATEGORY_LABELS: Record<keyof BagEquipments, string> = {
  Arma: 'Armas',
  Armadura: 'Armaduras',
  Escudo: 'Escudos',
  'Item Geral': 'Itens Gerais',
  Alquimía: 'Alquimia',
  Vestuário: 'Vestuário',
  Hospedagem: 'Hospedagem',
  Alimentação: 'Alimentação',
  Animal: 'Animais',
  Veículo: 'Veículos',
  Serviço: 'Serviços',
};

const MarketStep: React.FC<MarketStepProps> = ({
  initialMoney,
  bagEquipments,
  availableEquipment,
  onChange,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [currentMoney, setCurrentMoney] = useState(initialMoney);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | false>(
    false
  );

  // Calculate remaining money
  const remainingMoney = currentMoney;

  // Calculate bag spaces
  const bagSpaces = useMemo(
    () => calcBagSpaces(bagEquipments),
    [bagEquipments]
  );

  // Filter items by search query and sort alphabetically
  const filterItems = <T extends Equipment>(items: T[]): T[] => {
    let result = [...items];

    // Filter by search query if provided
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) => item.nome.toLowerCase().includes(query));
    }

    // Sort alphabetically by name
    result.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

    return result;
  };

  // Add item to the appropriate bag category
  const addItemToBag = (
    bag: BagEquipments,
    item: Equipment | DefenseEquipment
  ): BagEquipments => {
    const newBag = { ...bag };

    if (isDefenseEquipment(item)) {
      if (item.group === 'Armadura') {
        newBag.Armadura = [...newBag.Armadura, item];
      } else if (item.group === 'Escudo') {
        newBag.Escudo = [...newBag.Escudo, item];
      }
    } else if (item.group === 'Arma') {
      newBag.Arma = [...newBag.Arma, item];
    } else if (item.group === 'Alquimía') {
      newBag.Alquimía = [...newBag.Alquimía, item];
    } else if (item.group === 'Vestuário') {
      newBag.Vestuário = [...newBag.Vestuário, item];
    } else if (item.group === 'Alimentação') {
      newBag.Alimentação = [...newBag.Alimentação, item];
    } else if (item.group === 'Animal') {
      newBag.Animal = [...newBag.Animal, item];
    } else if (item.group === 'Veículo') {
      newBag.Veículo = [...newBag.Veículo, item];
    } else if (item.group === 'Serviço') {
      newBag.Serviço = [...newBag.Serviço, item];
    } else {
      newBag['Item Geral'] = [...newBag['Item Geral'], item];
    }

    return newBag;
  };

  // Handle money change
  const handleMoneyChange = (value: string) => {
    const numValue = parseInt(value, 10);
    if (!Number.isNaN(numValue) && numValue >= 0) {
      setCurrentMoney(numValue);
      onChange({
        initialMoney: numValue,
        remainingMoney: numValue,
        bagEquipments,
      });
    }
  };

  // Handle buying an item
  const handleBuyItem = (item: Equipment | DefenseEquipment) => {
    const price = item.preco || 0;
    if (price > remainingMoney) return;

    const newMoney = remainingMoney - price;
    const newBag = addItemToBag(bagEquipments, item);

    setCurrentMoney(newMoney);
    onChange({
      initialMoney: currentMoney,
      remainingMoney: newMoney,
      bagEquipments: newBag,
    });
  };

  // Handle adding item for free
  const handleAddFree = (item: Equipment | DefenseEquipment) => {
    const newBag = addItemToBag(bagEquipments, item);

    onChange({
      initialMoney: currentMoney,
      remainingMoney,
      bagEquipments: newBag,
    });
  };

  // Handle removing item from bag
  const handleRemoveItem = (
    category: keyof BagEquipments,
    index: number,
    item: Equipment | DefenseEquipment
  ) => {
    const newBag = { ...bagEquipments };
    const categoryItems = [...(newBag[category] || [])];
    categoryItems.splice(index, 1);

    // Type assertion needed due to BagEquipments structure
    if (category === 'Armadura' || category === 'Escudo') {
      (newBag[category] as DefenseEquipment[]) =
        categoryItems as DefenseEquipment[];
    } else {
      (newBag[category] as Equipment[]) = categoryItems as Equipment[];
    }

    // Refund money if item had a price
    const refund = item.preco || 0;
    const newMoney = remainingMoney + refund;
    setCurrentMoney(newMoney);

    onChange({
      initialMoney: currentMoney,
      remainingMoney: newMoney,
      bagEquipments: newBag,
    });
  };

  // Render item row
  const renderItemRow = (
    item: Equipment | DefenseEquipment,
    showActions: boolean = true
  ) => {
    const price = item.preco || 0;
    const canBuy = price <= remainingMoney;

    return (
      <Box
        key={item.nome}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 1,
          px: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          opacity: !canBuy && price > 0 ? 0.6 : 1,
          flexWrap: isMobile ? 'wrap' : 'nowrap',
          gap: 1,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction='row' spacing={1} alignItems='center'>
            <Typography
              variant='body2'
              fontWeight='medium'
              noWrap={!isMobile}
              sx={{ wordBreak: isMobile ? 'break-word' : 'normal' }}
            >
              {item.nome}
            </Typography>
            {item.supplementName && (
              <Chip
                label={item.supplementName}
                size='small'
                variant='outlined'
                color='info'
                sx={{ fontSize: '0.65rem', height: 18 }}
              />
            )}
          </Stack>
          <Stack direction='row' spacing={1} flexWrap='wrap' sx={{ mt: 0.5 }}>
            {item.dano && (
              <Chip
                label={`Dano: ${item.dano}`}
                size='small'
                variant='outlined'
              />
            )}
            {item.critico && (
              <Chip
                label={`Crit: ${item.critico}`}
                size='small'
                variant='outlined'
              />
            )}
            {isDefenseEquipment(item) && (
              <Chip
                label={`Def: +${item.defenseBonus}`}
                size='small'
                variant='outlined'
                color='primary'
              />
            )}
            {item.spaces !== undefined && item.spaces > 0 && (
              <Chip
                label={`${item.spaces} esp.`}
                size='small'
                variant='outlined'
              />
            )}
          </Stack>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexShrink: 0,
          }}
        >
          <Typography
            variant='body2'
            color={price === 0 ? 'success.main' : 'text.secondary'}
            sx={{ minWidth: 60, textAlign: 'right' }}
          >
            {formatPrice(price)}
          </Typography>

          {showActions && (
            <>
              <Tooltip title={canBuy ? '' : 'Dinheiro insuficiente'}>
                <span>
                  <Button
                    size='small'
                    variant='outlined'
                    startIcon={<AttachMoneyIcon />}
                    onClick={() => handleBuyItem(item)}
                    disabled={!canBuy || price === 0}
                    sx={{
                      color: '#DAA520',
                      borderColor: '#DAA520',
                      '&:hover': {
                        borderColor: '#B8860B',
                        backgroundColor: 'rgba(218, 165, 32, 0.08)',
                      },
                      '&.Mui-disabled': {
                        color: 'rgba(218, 165, 32, 0.4)',
                        borderColor: 'rgba(218, 165, 32, 0.4)',
                      },
                    }}
                  >
                    Comprar
                  </Button>
                </span>
              </Tooltip>
              <Tooltip title='Adicionar de graça'>
                <IconButton
                  size='small'
                  color='success'
                  onClick={() => handleAddFree(item)}
                >
                  <AddIcon fontSize='small' />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      </Box>
    );
  };

  // Render bag item row
  const renderBagItemRow = (
    item: Equipment | DefenseEquipment,
    category: keyof BagEquipments,
    index: number
  ) => (
    <Box
      key={`${item.nome}-${index}`}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 0.5,
        px: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant='body2'>{item.nome}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {item.preco !== undefined && item.preco > 0 && (
          <Typography variant='caption' color='text.secondary'>
            T$ {item.preco}
          </Typography>
        )}
        <Tooltip title='Remover (reembolsa se comprado)'>
          <IconButton
            size='small'
            color='error'
            onClick={() => handleRemoveItem(category, index, item)}
          >
            <DeleteIcon fontSize='small' />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  // Check if bag category has items
  const bagHasItems = Object.values(bagEquipments).some(
    (items) => items && items.length > 0
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant='body1' color='text.secondary'>
        Gerencie o dinheiro inicial e os equipamentos do seu personagem. Você
        pode comprar itens gastando dinheiro ($) ou adicioná-los gratuitamente
        (+).
      </Typography>

      {/* Money Section */}
      <Paper sx={{ p: 2 }}>
        <Typography variant='h6' gutterBottom>
          Dinheiro Inicial
        </Typography>
        <TextField
          type='number'
          value={currentMoney}
          onChange={(e) => handleMoneyChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>T$</InputAdornment>
            ),
          }}
          inputProps={{ min: 0 }}
          size='small'
          sx={{ width: 150 }}
        />
        <Typography
          variant='caption'
          display='block'
          color='text.secondary'
          sx={{ mt: 1 }}
        >
          Dinheiro restante: T$ {remainingMoney}
        </Typography>
      </Paper>

      {/* Bag Section */}
      <Paper sx={{ p: 2 }}>
        <Typography variant='h6' gutterBottom>
          Mochila
          <Chip
            label={`${bagSpaces} espaços`}
            size='small'
            sx={{ ml: 1 }}
            color='default'
          />
        </Typography>

        {!bagHasItems && (
          <Typography variant='body2' color='text.secondary'>
            Nenhum item na mochila ainda.
          </Typography>
        )}

        {Object.entries(bagEquipments).map(([category, items]) => {
          if (!items || items.length === 0) return null;
          const categoryKey = category as keyof BagEquipments;

          return (
            <Box key={category} sx={{ mb: 2 }}>
              <Typography
                variant='subtitle2'
                color='text.secondary'
                sx={{ mb: 0.5 }}
              >
                {BAG_CATEGORY_LABELS[categoryKey] || category}
              </Typography>
              {items.map((item: Equipment | DefenseEquipment, index: number) =>
                renderBagItemRow(item, categoryKey, index)
              )}
            </Box>
          );
        })}
      </Paper>

      <Divider />

      {/* Market Section */}
      <Box>
        <Typography variant='h6' gutterBottom>
          Mercado
        </Typography>

        {/* Search */}
        <TextField
          placeholder='Buscar item...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size='small'
          fullWidth
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {/* Categories */}
        {Object.entries(availableEquipment).map(([category, items]) => {
          if (!items || items.length === 0) return null;

          const filteredItems = filterItems(items as Equipment[]);
          if (filteredItems.length === 0) return null;

          return (
            <Accordion
              key={category}
              expanded={expandedCategory === category}
              onChange={(_, isExpanded) =>
                setExpandedCategory(isExpanded ? category : false)
              }
              sx={{ mb: 1 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>
                  {CATEGORY_LABELS[category] || category}
                  <Chip
                    label={filteredItems.length}
                    size='small'
                    sx={{ ml: 1 }}
                  />
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                {filteredItems.map((item) => renderItemRow(item))}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>

      <Alert severity='info'>
        Você pode editar o dinheiro inicial manualmente se o mestre permitir.
        Itens adicionados com o botão + não descontam do dinheiro.
      </Alert>
    </Box>
  );
};

export default MarketStep;
