import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
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
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AddAllIcon from '@mui/icons-material/PlaylistAdd';
import CustomIcon from '@mui/icons-material/Build';
import ClearIcon from '@mui/icons-material/Clear';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import debounce from 'lodash/debounce';

import Equipment, { equipGroup } from '../../../interfaces/Equipment';
import { SupplementId } from '../../../types/supplement.types';
import { dataRegistry } from '../../../data/registry';
import { useContentSupplements } from '../../../hooks/useContentSupplements';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { CATEGORY_ORDER } from './itemTypeStyles';
import {
  CatalogCategory,
  CatalogSubgroup,
  buildEquipmentCatalog,
} from './equipmentCatalog';
import CustomItemForm from './CustomItemForm';
import { AmmoTypeOption } from './ammo';
import ItemCategoryChips from './ItemCategoryChips';
import ItemSubfilterChips from './ItemSubfilterChips';
import ItemCatalogCard from './ItemCatalogCard';
import { resolveItemPresentation } from './itemEffects';

// ─── Keys das dimensões de empunhadura e alcance ────────────────────────────────
const WIELD_FILTER_KEYS = new Set(['1m', '2m']);
const RANGE_FILTER_KEYS = new Set(['distância', 'arremesso']);
const HAND_FILTER_KEYS = new Set([...WIELD_FILTER_KEYS, ...RANGE_FILTER_KEYS]);

/** Tags de empunhadura derivadas dos campos do equipamento. */
function getWeaponHandTags(item: Equipment): string[] {
  if (item.isAmmo) return [];
  const tags: string[] = [];
  if (item.twoHanded) tags.push('2m');
  else tags.push('1m');
  if (item.alcance && item.alcance !== '-') tags.push('distância');
  if (item.arremesso) tags.push('arremesso');
  return tags;
}

/**
 * Verifica se um item satisfaz os subfiltros ativos.
 * Subfiltros de categoria (simples/marcial/…) filtram pelo `ontologyTag` do
 * subgrupo; empunhadura (1m/2m) e alcance (distância/arremesso) combinam em E
 * entre si (ex.: `1m` + `distância` exibe apenas armas de 1 mão à distância).
 */
function itemMatchesSubfilters(
  item: Equipment,
  subgroup: CatalogSubgroup,
  subfilters: string[]
): boolean {
  if (subfilters.length === 0) return true;

  const catFilters = subfilters.filter((sf) => !HAND_FILTER_KEYS.has(sf));
  const wieldFilters = subfilters.filter((sf) => WIELD_FILTER_KEYS.has(sf));
  const rangeFilters = subfilters.filter((sf) => RANGE_FILTER_KEYS.has(sf));

  const catMatch =
    catFilters.length === 0 ||
    (subgroup.ontologyTag !== '' && catFilters.includes(subgroup.ontologyTag));

  if (wieldFilters.length === 0 && rangeFilters.length === 0) {
    return catMatch;
  }

  if (item.group !== 'Arma') return false;
  const tags = getWeaponHandTags(item);

  const wieldMatch =
    wieldFilters.length === 0 || wieldFilters.some((wf) => tags.includes(wf));
  const rangeMatch =
    rangeFilters.length === 0 || rangeFilters.some((rf) => tags.includes(rf));

  return catMatch && wieldMatch && rangeMatch;
}

// ─── SX constants ──────────────────────────────────────────────────────────

const PINNED_CONTENT_SX = {
  p: 0,
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minHeight: 0,
  overflow: 'hidden',
} as const;

const PINNED_COLUMN_SX = {
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minHeight: 0,
} as const;

const PINNED_LIST_SX = {
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  scrollbarGutter: 'stable',
  overscrollBehavior: 'contain',
} as const;

/** Grid responsivo: 1 col no mobile, 2 col no sm+. */
const GRID_SX = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
  gap: 1.25,
  px: 2,
  py: 1.25,
} as const;

const SECTION_HEADER_SX = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  px: 2,
  py: 1,
  bgcolor: 'action.hover',
  borderBottom: '1px solid',
  borderColor: 'divider',
} as const;

// ─── Props ─────────────────────────────────────────────────────────────────

export interface AddItemDialogProps {
  open: boolean;
  onClose: () => void;
  onAddItem: (item: Equipment, options?: { quantity?: number }) => void;
  /** Tipos de munição + pacotes que os resolvem. Ver `getAmmoTypeOptions`. */
  ammoTypeOptions?: AmmoTypeOption[];
  /** Currency available for the affordability hint (no blocking). */
  availableTibares?: number;
  /** Whether auto-deduct is on (changes the affordability label). */
  autoDeductMoney?: boolean;
  /** Toggle handler for the auto-deduct switch shown inside this dialog. */
  onToggleAutoDeductMoney?: (value: boolean) => void;
  /** Default category to open when opening the dialog. */
  defaultCategory?: equipGroup;
  /** Título do diálogo e dica do botão de adicionar. */
  title?: string;
  /**
   * Liga os botões "Adicionar todos" da categoria e de cada subcategoria.
   * Recebe os itens visíveis (respeitando a busca), na ordem da lista.
   */
  onAddMany?: (items: Equipment[]) => void;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

/** "Ataque Desarmado" primeiro (unidade base da categoria), depois A-Z. */
function sortCatalogItems(items: Equipment[]): Equipment[] {
  return [...items].sort((a, b) => {
    if (a.nome === 'Ataque Desarmado') return -1;
    if (b.nome === 'Ataque Desarmado') return 1;
    return a.nome.localeCompare(b.nome);
  });
}

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function matches(item: Equipment, query: string): boolean {
  if (!query) return true;
  const q = normalize(query);
  if (normalize(item.nome).includes(q)) return true;
  const { searchableText } = resolveItemPresentation(item);
  return searchableText ? normalize(searchableText).includes(q) : false;
}

// ─── Component ─────────────────────────────────────────────────────────────

const AddItemDialog: React.FC<AddItemDialogProps> = ({
  open,
  onClose,
  onAddItem,
  availableTibares,
  autoDeductMoney = false,
  onToggleAutoDeductMoney,
  defaultCategory,
  ammoTypeOptions = [],
  title = 'Adicionar à mochila',
  onAddMany,
}) => {
  const userSupplements: SupplementId[] = useContentSupplements();
  const equipmentCatalog = useMemo(
    () => buildEquipmentCatalog(userSupplements),
    [userSupplements]
  );

  const resolvedInitialGroup = useMemo((): equipGroup => {
    if (defaultCategory && CATEGORY_ORDER.includes(defaultCategory))
      return defaultCategory;
    return CATEGORY_ORDER[0];
  }, [defaultCategory]);

  const [activeGroup, setActiveGroup] =
    useState<equipGroup>(resolvedInitialGroup);
  const [subfilters, setSubfilters] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const isMobile = useIsMobile();

  // Sincroniza categoria inicial quando defaultCategory ou open mudam
  useEffect(() => {
    setActiveGroup(resolvedInitialGroup);
  }, [resolvedInitialGroup, open]);

  // Reseta subfiltros ao mudar de categoria
  useEffect(() => {
    setSubfilters([]);
  }, [activeGroup]);

  // Debounce da busca
  useEffect(() => {
    const update = debounce(
      (value: string) => setDebouncedSearch(value),
      300
    );
    update(search);
    return () => update.cancel();
  }, [search]);

  // Reseta estado ao fechar
  useEffect(() => {
    if (!open) {
      setSearch('');
      setDebouncedSearch('');
      setShowCustomForm(false);
      setSubfilters([]);
    }
  }, [open]);

  const handleCategoryChange = useCallback((group: equipGroup) => {
    setActiveGroup(group);
    setSubfilters([]);
  }, []);

  const toggleSubfilter = useCallback((key: string) => {
    setSubfilters((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }, []);

  const clearSubfilters = useCallback(() => setSubfilters([]), []);

  const activeCategory: CatalogCategory =
    equipmentCatalog.find((c) => c.group === activeGroup) ??
    equipmentCatalog[0];

  // Items visíveis de um subgrupo, aplicando subfiltros e busca
  const visibleItems = useCallback(
    (sub: CatalogSubgroup): Equipment[] => {
      let items = sub.items;
      if (subfilters.length > 0) {
        items = items.filter((item) =>
          itemMatchesSubfilters(item, sub, subfilters)
        );
      }
      return sortCatalogItems(items.filter((it) => matches(it, debouncedSearch)));
    },
    [subfilters, debouncedSearch]
  );

  const visibleSubgroups = useMemo(
    () => activeCategory.subgroups.filter((sub) => visibleItems(sub).length > 0),
    [activeCategory, visibleItems]
  );

  const totalMatches = useMemo(
    () =>
      visibleSubgroups.reduce((acc, sub) => acc + visibleItems(sub).length, 0),
    [visibleSubgroups, visibleItems]
  );

  const renderSubgroup = (sub: CatalogSubgroup) => {
    const sorted = visibleItems(sub);
    if (sorted.length === 0) return null;
    // Com apenas uma subcategoria visível o botão da categoria já faz o mesmo.
    const showAddAll = !!onAddMany && visibleSubgroups.length > 1;
    return (
      <Box key={sub.key} sx={{ mb: 1 }}>
        <Box sx={SECTION_HEADER_SX}>
          <Typography
            variant='subtitle2'
            sx={{ color: 'text.primary', fontWeight: 700, lineHeight: 1.2 }}
          >
            {sub.label}
          </Typography>
          {showAddAll && (
            <Button
              size='small'
              startIcon={<AddAllIcon />}
              onClick={() => onAddMany(sorted)}
              aria-label={`Adicionar todos de ${sub.label}`}
            >
              Adicionar todos ({sorted.length})
            </Button>
          )}
        </Box>
        <Box sx={GRID_SX}>
          {sorted.map((item) => {
            const supplementMeta = item.supplementId
              ? dataRegistry.getSupplementLabel(item.supplementId)
              : null;
            const cantAfford =
              autoDeductMoney &&
              item.preco !== undefined &&
              availableTibares !== undefined &&
              item.preco > availableTibares;
            return (
              <ItemCatalogCard
                key={`${item.group}-${item.nome}`}
                item={item}
                onAdd={(it, qty) => onAddItem(it, { quantity: qty })}
                cantAfford={cantAfford}
                supplementLabel={supplementMeta?.abbreviation}
                addLabel={title}
              />
            );
          })}
        </Box>
      </Box>
    );
  };

  // ── Layout helpers ──────────────────────────────────────────────────────
  // Mantém busca, chips e rodapé fixos tanto no mobile quanto no desktop,
  // evitando duas barras de rolagem paralelas e mantendo o saldo sempre visível.
  const pinnedLayout = !showCustomForm;

  const toolbar = (
    <>
      <Box sx={{ px: 2, pt: 1 }}>
        <TextField
          fullWidth
          size='small'
          placeholder='Buscar item no catálogo...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
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
            },
          }}
        />
      </Box>
      <ItemCategoryChips
        catalog={equipmentCatalog}
        activeGroup={activeGroup}
        onChange={handleCategoryChange}
      />
      <ItemSubfilterChips
        activeGroup={activeGroup}
        activeCategory={activeCategory}
        selected={subfilters}
        onToggle={toggleSubfilter}
        onClear={clearSubfilters}
      />
    </>
  );

  const itemsArea = (() => {
    if (activeCategory.subgroups.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            Sem itens de catálogo para esta categoria. Crie um item
            personalizado.
          </Typography>
        </Box>
      );
    }
    if (totalMatches === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            {subfilters.length > 0
              ? 'Nenhum item corresponde aos filtros ativos.'
              : 'Nenhum item corresponde à busca.'}
          </Typography>
        </Box>
      );
    }
    return (
      <Box sx={{ pb: 2 }}>
        {onAddMany && (
          <Box sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
            <Button
              variant='outlined'
              size='small'
              startIcon={<AddAllIcon />}
              onClick={() =>
                onAddMany(visibleSubgroups.flatMap(visibleItems))
              }
            >
              {debouncedSearch || subfilters.length > 0
                ? `Adicionar os ${totalMatches} encontrados`
                : `Adicionar todos de ${activeCategory.label} (${totalMatches})`}
            </Button>
          </Box>
        )}
        {activeCategory.subgroups.map(renderSubgroup)}
      </Box>
    );
  })();

  const footer = (
    <>
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
          sx={{ alignItems: 'center', flexWrap: 'wrap' }}
        >
          <Typography variant='body2' sx={{ color: 'text.secondary', fontWeight: 500 }}>
            {availableTibares !== undefined && (
              <>Saldo: T$ {availableTibares.toFixed(2)}</>
            )}
          </Typography>
          {onToggleAutoDeductMoney && (
            <Tooltip title='Quando ativo, adicionar um item desconta o preço do saldo. Remover devolve apenas o que foi comprado agora.'>
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
    </>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth='md'
      fullScreen={isMobile}
      slotProps={{
        paper: {
          sx: {
            height: isMobile ? '100dvh' : 'min(88dvh, 780px)',
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
    >
      <DialogTitle sx={{ pr: 6 }}>
        {title}
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
          aria-label='Fechar'
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={pinnedLayout ? PINNED_CONTENT_SX : { p: 0 }}>
        {showCustomForm ? (
          <Box sx={{ p: 2 }}>
            <CustomItemForm
              defaultGroup={activeGroup}
              ammoTypeOptions={ammoTypeOptions}
              onCancel={() => setShowCustomForm(false)}
              onSubmit={(item) => {
                onAddItem(item);
                setShowCustomForm(false);
              }}
            />
          </Box>
        ) : (
          <Box sx={PINNED_COLUMN_SX}>
            {toolbar}
            <Box sx={PINNED_LIST_SX}>{itemsArea}</Box>
            {footer}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddItemDialog;
