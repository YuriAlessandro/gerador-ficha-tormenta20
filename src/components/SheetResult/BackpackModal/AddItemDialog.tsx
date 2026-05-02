import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Build as CustomIcon,
  Clear as ClearIcon,
  Close as CloseIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import debounce from 'lodash/debounce';

import Equipment, { equipGroup } from '../../../interfaces/Equipment';
import {
  SUPPLEMENT_METADATA,
  SupplementId,
} from '../../../types/supplement.types';
import { useAuth } from '../../../hooks/useAuth';
import { CATEGORY_ORDER, itemTypeStyles } from './itemTypeStyles';
import {
  CatalogCategory,
  CatalogSubgroup,
  buildEquipmentCatalog,
} from './equipmentCatalog';
import CustomItemForm from './CustomItemForm';

export interface AddItemDialogProps {
  open: boolean;
  onClose: () => void;
  onAddItem: (item: Equipment, options?: { quantity?: number }) => void;
  /** Currency available for the affordability hint (no blocking). */
  availableTibares?: number;
  /** Whether auto-deduct is on (changes the affordability label). */
  autoDeductMoney?: boolean;
  /** Toggle handler for the auto-deduct switch shown inside this dialog. */
  onToggleAutoDeductMoney?: (value: boolean) => void;
  /** Default category to open when opening the dialog. */
  defaultCategory?: equipGroup;
}

function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

function matches(item: Equipment, query: string): boolean {
  if (!query) return true;
  const q = normalize(query);
  return (
    normalize(item.nome).includes(q) ||
    (item.descricao ? normalize(item.descricao).includes(q) : false)
  );
}

const AddItemDialog: React.FC<AddItemDialogProps> = ({
  open,
  onClose,
  onAddItem,
  availableTibares,
  autoDeductMoney = false,
  onToggleAutoDeductMoney,
  defaultCategory,
}) => {
  const { user } = useAuth();
  const userSupplements: SupplementId[] = user?.enabledSupplements ?? [
    SupplementId.TORMENTA20_CORE,
  ];
  const equipmentCatalog = useMemo(
    () => buildEquipmentCatalog(userSupplements),
    [userSupplements]
  );

  const initialIdx = useMemo(() => {
    if (!defaultCategory) return 0;
    const i = CATEGORY_ORDER.indexOf(defaultCategory);
    return i >= 0 ? i : 0;
  }, [defaultCategory]);

  const [tabIndex, setTabIndex] = useState(initialIdx);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);

  useEffect(() => {
    setTabIndex(initialIdx);
  }, [initialIdx, open]);

  useEffect(() => {
    const update = debounce((value: string) => setDebouncedSearch(value), 300);
    update(search);
    return () => update.cancel();
  }, [search]);

  useEffect(() => {
    if (!open) {
      setSearch('');
      setDebouncedSearch('');
      setShowCustomForm(false);
    }
  }, [open]);

  const activeCategory: CatalogCategory =
    equipmentCatalog.find((c) => c.group === CATEGORY_ORDER[tabIndex]) ??
    equipmentCatalog[0];

  const renderItemRow = (item: Equipment) => {
    const supplementMeta = item.supplementId
      ? SUPPLEMENT_METADATA[item.supplementId as SupplementId]
      : null;
    const cantAfford =
      autoDeductMoney &&
      item.preco !== undefined &&
      availableTibares !== undefined &&
      item.preco > availableTibares;
    return (
      <ListItem
        key={`${item.group}-${item.nome}`}
        secondaryAction={
          <Tooltip
            title={
              cantAfford
                ? 'Saldo insuficiente — desative "Auto-descontar T$" para adicionar mesmo assim.'
                : 'Adicionar à mochila'
            }
          >
            <span>
              <IconButton
                edge='end'
                onClick={() => onAddItem(item)}
                color='primary'
                aria-label={`Adicionar ${item.nome}`}
                disabled={cantAfford}
              >
                <AddIcon />
              </IconButton>
            </span>
          </Tooltip>
        }
      >
        <ListItemText
          primary={
            <Stack
              direction='row'
              spacing={0.75}
              alignItems='center'
              sx={{ flexWrap: 'wrap' }}
            >
              <Typography variant='body2' sx={{ fontWeight: 500 }}>
                {item.nome}
              </Typography>
              {supplementMeta && (
                <Chip
                  size='small'
                  label={supplementMeta.abbreviation}
                  color='primary'
                  variant='outlined'
                  sx={{ height: 18, fontSize: '0.65rem' }}
                />
              )}
              {cantAfford && (
                <Chip
                  size='small'
                  label='Saldo insuficiente'
                  color='warning'
                  sx={{ height: 18, fontSize: '0.65rem' }}
                />
              )}
            </Stack>
          }
          secondary={
            <Stack
              direction='row'
              spacing={1.5}
              sx={{ flexWrap: 'wrap', mt: 0.25 }}
            >
              {item.preco !== undefined && (
                <Typography variant='caption' color='text.secondary'>
                  T$ {item.preco}
                </Typography>
              )}
              {item.spaces !== undefined && (
                <Typography variant='caption' color='text.secondary'>
                  {item.spaces} esp.
                </Typography>
              )}
              {item.descricao && (
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    flex: 1,
                  }}
                >
                  {item.descricao}
                </Typography>
              )}
            </Stack>
          }
        />
      </ListItem>
    );
  };

  const renderSubgroup = (sub: CatalogSubgroup) => {
    const filtered = sub.items.filter((it) => matches(it, debouncedSearch));
    if (filtered.length === 0) return null;
    const sorted = [...filtered].sort((a, b) => a.nome.localeCompare(b.nome));
    return (
      <Box key={sub.key} sx={{ mb: 1.5 }}>
        <Typography
          variant='overline'
          color='text.secondary'
          sx={{ pl: 2, display: 'block' }}
        >
          {sub.label}
        </Typography>
        <List dense disablePadding>
          {sorted.map(renderItemRow)}
        </List>
      </Box>
    );
  };

  const totalMatches = activeCategory.subgroups.reduce(
    (acc, sub) =>
      acc + sub.items.filter((it) => matches(it, debouncedSearch)).length,
    0
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='md'>
      <DialogTitle sx={{ pr: 6 }}>
        Adicionar à mochila
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
          aria-label='Fechar'
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        {showCustomForm ? (
          <Box sx={{ p: 2 }}>
            <CustomItemForm
              defaultGroup={CATEGORY_ORDER[tabIndex]}
              onCancel={() => setShowCustomForm(false)}
              onSubmit={(item) => {
                onAddItem(item);
                setShowCustomForm(false);
              }}
            />
          </Box>
        ) : (
          <Box>
            <Box sx={{ px: 2, pt: 1 }}>
              <TextField
                fullWidth
                size='small'
                placeholder='Buscar item no catálogo...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <SearchIcon fontSize='small' />
                    </InputAdornment>
                  ),
                  endAdornment: search ? (
                    <InputAdornment position='end'>
                      <IconButton
                        size='small'
                        onClick={() => setSearch('')}
                        aria-label='Limpar busca'
                      >
                        <ClearIcon fontSize='small' />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                }}
              />
            </Box>
            <Tabs
              value={tabIndex}
              onChange={(_, v) => setTabIndex(v)}
              variant='scrollable'
              scrollButtons='auto'
              sx={{ borderBottom: 1, borderColor: 'divider', mt: 1 }}
            >
              {CATEGORY_ORDER.map((g) => {
                const style = itemTypeStyles[g];
                const Icon = style.icon;
                return (
                  <Tab
                    key={g}
                    label={style.label}
                    icon={
                      <Icon
                        style={{ fontSize: 16, color: style.color }}
                        aria-hidden
                      />
                    }
                    iconPosition='start'
                    sx={{ minHeight: 40, py: 0.5 }}
                  />
                );
              })}
            </Tabs>

            <Box sx={{ minHeight: 280, maxHeight: 480, overflowY: 'auto' }}>
              {(() => {
                if (activeCategory.subgroups.length === 0) {
                  return (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Typography variant='body2' color='text.secondary'>
                        Sem itens de catálogo para esta categoria. Crie um item
                        personalizado.
                      </Typography>
                    </Box>
                  );
                }
                if (totalMatches === 0) {
                  return (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Typography variant='body2' color='text.secondary'>
                        Nenhum item corresponde à busca.
                      </Typography>
                    </Box>
                  );
                }
                return (
                  <Box sx={{ pb: 2 }}>
                    {activeCategory.subgroups.map(renderSubgroup)}
                  </Box>
                );
              })()}
            </Box>

            <Divider />

            <Box
              sx={{
                p: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 1,
                flexWrap: 'wrap',
              }}
            >
              <Stack
                direction='row'
                spacing={2}
                alignItems='center'
                sx={{ flexWrap: 'wrap' }}
              >
                <Typography variant='caption' color='text.secondary'>
                  {availableTibares !== undefined && (
                    <>Saldo: T$ {availableTibares.toFixed(2)}</>
                  )}
                </Typography>
                {onToggleAutoDeductMoney && (
                  <Tooltip title='Quando ativo, adicionar um item desconta o preço do saldo. Remover devolve.'>
                    <FormControlLabel
                      control={
                        <Switch
                          size='small'
                          checked={autoDeductMoney}
                          onChange={(_, v) => onToggleAutoDeductMoney(v)}
                        />
                      }
                      label='Auto-descontar T$'
                      sx={{ ml: 0 }}
                    />
                  </Tooltip>
                )}
              </Stack>
              <Button
                startIcon={<CustomIcon />}
                variant='outlined'
                onClick={() => setShowCustomForm(true)}
              >
                Criar item personalizado
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddItemDialog;
