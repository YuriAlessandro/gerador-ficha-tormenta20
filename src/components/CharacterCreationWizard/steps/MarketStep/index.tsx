import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import {
  Box,
  Typography,
  Alert,
  Collapse,
  Paper,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import debounce from 'lodash/debounce';
import cloneDeep from 'lodash/cloneDeep';
import { v4 as uuid } from 'uuid';
import Equipment, {
  BagEquipments,
  DefenseEquipment,
} from '@/interfaces/Equipment';
import {
  MarketEquipment,
  MarketSelections,
} from '@/interfaces/MarketEquipment';
import { calculateCurrencySpaces } from '@/functions/general';
import { normalizeSearch } from '@/functions/stringUtils';
import { isDefenseEquipment } from '@/functions/itemEnhancements/core';
import {
  isProficientWithWeapon,
  isProficientWithDefense,
} from '@/functions/proficiencies';
import { itemTypeStyles } from '@/components/SheetResult/BackpackModal/itemTypeStyles';
import MarketToolbar from './MarketToolbar';
import MarketListHeader from './MarketListHeader';
import MarketItemRow from './MarketItemRow';
import BagPanel from './BagPanel';
import {
  MARKET_CATEGORIES,
  MARKET_SORTERS,
  MarketCategoryDescriptor,
  MarketCategoryKey,
  MarketSortKey,
  BAG_KEY_BY_GROUP,
  DEFAULT_CATEGORY,
  SEARCH_RESULT_LIMIT,
  getDescriptor,
  getItemKey,
} from './marketCategories';

interface MarketStepProps {
  /** Dinheiro concedido pelo nível/origem. Só é reescrito se o usuário editar o campo. */
  initialMoney: number;
  /** Saldo atual — é daqui que o campo é semeado, para sobreviver a voltar/avançar de passo. */
  remainingMoney: number;
  bagEquipments: BagEquipments;
  purchasedIds?: string[];
  availableEquipment: MarketEquipment;
  proficiencias: string[];
  onChange: (data: MarketSelections) => void;
}

interface MarketSection {
  descriptor: MarketCategoryDescriptor;
  items: (Equipment | DefenseEquipment)[];
}

const LIST_SX = {
  maxHeight: { xs: '48vh', md: '44vh' },
  overflowY: 'auto',
  overflowX: 'hidden',
  position: 'relative',
} as const;

const SECTION_TITLE_SX = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.75,
  px: 1,
  py: 0.75,
  bgcolor: 'action.hover',
} as const;

const BAG_PAPER_SX = { p: 2, mt: 2 } as const;
const EMPTY_SX = {
  p: 3,
  textAlign: 'center',
  color: 'text.secondary',
} as const;
const FOOTER_SX = {
  display: 'block',
  px: 1,
  py: 1,
  textAlign: 'center',
  color: 'text.secondary',
} as const;

/** Espaços ocupados, respeitando a quantidade de cada entrada empilhada. */
const calcBagSpaces = (bagEquipments: BagEquipments): number =>
  Object.values(bagEquipments)
    .flat()
    .reduce(
      (acc, item) => acc + (item?.spaces || 0) * (item?.quantity ?? 1),
      0
    );

const addItemToBag = (
  bag: BagEquipments,
  item: Equipment | DefenseEquipment
): BagEquipments => {
  const key = BAG_KEY_BY_GROUP[item.group] ?? 'Item Geral';
  return {
    ...bag,
    [key]: [...(bag[key] as Equipment[]), item],
  };
};

const matchesSearch = (item: Equipment, query: string): boolean =>
  normalizeSearch(item.nome).includes(query) ||
  (item.descricao ? normalizeSearch(item.descricao).includes(query) : false);

const MarketStep: React.FC<MarketStepProps> = ({
  initialMoney,
  remainingMoney: persistedRemainingMoney,
  bagEquipments,
  purchasedIds,
  availableEquipment,
  proficiencias,
  onChange,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [money, setMoney] = useState<number | null>(persistedRemainingMoney);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] =
    useState<MarketCategoryKey>(DEFAULT_CATEGORY);
  const [subFilter, setSubFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<MarketSortKey>('nome');
  const [autoDeduct, setAutoDeduct] = useState(true);
  const [bagOpen, setBagOpen] = useState(false);
  const [lastActionKey, setLastActionKey] = useState<string | null>(null);

  const remainingMoney = money ?? 0;
  const ownedIds = useMemo(() => purchasedIds ?? [], [purchasedIds]);

  // Debounce da busca: sem ele, cada tecla refiltra e re-renderiza a lista.
  useEffect(() => {
    const update = debounce((value: string) => setSearch(value), 250);
    update(searchInput);
    return () => update.cancel();
  }, [searchInput]);

  // Um único timer para o feedback de "adicionado", com cleanup no unmount —
  // o código anterior deixava um setTimeout solto por item.
  const flashTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(
    () => () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
    },
    []
  );

  const flash = useCallback((key: string) => {
    setLastActionKey(key);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setLastActionKey(null), 1500);
  }, []);

  const bagSpaces = useMemo(
    () =>
      calcBagSpaces(bagEquipments) + calculateCurrencySpaces(remainingMoney),
    [bagEquipments, remainingMoney]
  );

  const bagItemCount = useMemo(
    () =>
      Object.values(bagEquipments)
        .flat()
        .reduce((acc, item) => acc + (item?.quantity ?? 1), 0),
    [bagEquipments]
  );

  // Totais do catálogo, calculados uma vez. NÃO tornar sensível à busca: isso
  // obrigaria a filtrar as 9 categorias a cada tecla, que é exatamente o que
  // travava este passo antes.
  const categoryCounts = useMemo(
    () =>
      MARKET_CATEGORIES.reduce<Record<string, number>>((acc, descriptor) => {
        acc[descriptor.key] = availableEquipment[descriptor.key]?.length ?? 0;
        return acc;
      }, {}),
    [availableEquipment]
  );

  const descriptor = useMemo(
    () => getDescriptor(activeCategory),
    [activeCategory]
  );

  const isSearching = search.trim().length > 0;

  /**
   * Fora da busca: uma seção, a categoria ativa. Buscando: varre TODAS as
   * categorias e devolve uma seção por categoria com resultado — assim a busca
   * continua global (como era com os accordions) sem perder as colunas
   * específicas de cada tipo de item.
   */
  const { sections, totalResults } = useMemo(() => {
    const query = isSearching ? normalizeSearch(search) : '';
    const sorter = MARKET_SORTERS[sortBy];

    const buildSection = (
      target: MarketCategoryDescriptor,
      applySubFilter: boolean
    ): MarketSection | null => {
      const source = availableEquipment[target.key] ?? [];
      const active = applySubFilter
        ? target.subFilters?.find((filter) => filter.key === subFilter)
        : undefined;

      const items = source.filter(
        (item) =>
          (!active || active.test(item)) &&
          (!query || matchesSearch(item, query))
      );
      if (items.length === 0) return null;
      return { descriptor: target, items: [...items].sort(sorter) };
    };

    if (!isSearching) {
      const section = buildSection(descriptor, true);
      return {
        sections: section ? [section] : [],
        totalResults: section?.items.length ?? 0,
      };
    }

    const found = MARKET_CATEGORIES.map((target) =>
      buildSection(target, false)
    ).filter((section): section is MarketSection => section !== null);

    const total = found.reduce((acc, section) => acc + section.items.length, 0);

    // Teto de renderização para buscas de 1-2 letras, que casam quase tudo.
    let budget = SEARCH_RESULT_LIMIT;
    const capped = found
      .map((section) => {
        if (budget <= 0) return null;
        const items = section.items.slice(0, budget);
        budget -= items.length;
        return { ...section, items };
      })
      .filter((section): section is MarketSection => section !== null);

    return { sections: capped, totalResults: total };
  }, [availableEquipment, descriptor, isSearching, search, sortBy, subFilter]);

  const renderedResults = useMemo(
    () => sections.reduce((acc, section) => acc + section.items.length, 0),
    [sections]
  );

  // Handlers estáveis: dependem de dinheiro/mochila, que mudam a cada compra,
  // então leem o estado corrente de uma ref em vez de fechar sobre ele. Sem
  // isso o `React.memo` das linhas não valeria nada.
  const latest = useRef({
    remainingMoney,
    bagEquipments,
    initialMoney,
    autoDeduct,
    ownedIds,
  });
  latest.current = {
    remainingMoney,
    bagEquipments,
    initialMoney,
    autoDeduct,
    ownedIds,
  };

  const handleAdd = useCallback(
    (item: Equipment | DefenseEquipment, quantity: number) => {
      const { current } = latest;
      const cost = (item.preco ?? 0) * quantity;
      if (current.autoDeduct && cost > current.remainingMoney) return;

      // Clone obrigatório: o catálogo do registry é compartilhado e `ensureIds`
      // gravaria o id no objeto de origem.
      const entry: Equipment = {
        ...cloneDeep(item),
        id: uuid(),
        quantity,
      };
      const newRemaining = current.autoDeduct
        ? current.remainingMoney - cost
        : current.remainingMoney;

      if (current.autoDeduct) setMoney(newRemaining);

      onChange({
        initialMoney: current.initialMoney,
        remainingMoney: newRemaining,
        bagEquipments: addItemToBag(current.bagEquipments, entry),
        purchasedIds:
          current.autoDeduct && cost > 0
            ? [...current.ownedIds, entry.id as string]
            : current.ownedIds,
      });
      flash(getItemKey(item));
    },
    [onChange, flash]
  );

  const handleRemove = useCallback(
    (ids: string[]) => {
      const { current } = latest;
      const removing = new Set(ids);
      const paid = new Set(current.ownedIds);

      let refund = 0;
      const newBag = Object.entries(current.bagEquipments).reduce(
        (acc, [category, items]) => {
          const kept = (items as Equipment[]).filter((item) => {
            if (!item.id || !removing.has(item.id)) return true;
            // Só devolve dinheiro de item efetivamente pago. Itens adicionados
            // de graça e os concedidos pela origem não reembolsam.
            if (paid.has(item.id)) {
              refund += (item.preco ?? 0) * (item.quantity ?? 1);
            }
            return false;
          });
          return { ...acc, [category]: kept };
        },
        {} as BagEquipments
      );

      const newRemaining = current.remainingMoney + refund;
      if (refund > 0) setMoney(newRemaining);

      onChange({
        initialMoney: current.initialMoney,
        remainingMoney: newRemaining,
        bagEquipments: newBag,
        purchasedIds: current.ownedIds.filter((id) => !removing.has(id)),
      });
    },
    [onChange]
  );

  const handleMoneyChange = useCallback(
    (value: number | null) => {
      const { current } = latest;
      setMoney(value);
      onChange({
        initialMoney: value ?? 0,
        remainingMoney: value ?? 0,
        bagEquipments: current.bagEquipments,
        purchasedIds: current.ownedIds,
      });
    },
    [onChange]
  );

  const handleCategoryChange = useCallback((key: MarketCategoryKey) => {
    setActiveCategory(key);
    setSubFilter(null);
  }, []);

  const handleToggleBag = useCallback(() => setBagOpen((open) => !open), []);

  const isProficient = useCallback(
    (item: Equipment | DefenseEquipment): boolean => {
      if (item.group === 'Arma') {
        return isProficientWithWeapon(item, proficiencias);
      }
      if (isDefenseEquipment(item)) {
        return isProficientWithDefense(item, proficiencias);
      }
      return true;
    },
    [proficiencias]
  );

  return (
    <Box>
      <MarketToolbar
        money={money}
        remainingMoney={remainingMoney}
        bagItemCount={bagItemCount}
        bagSpaces={bagSpaces}
        search={searchInput}
        activeCategory={activeCategory}
        categoryCounts={categoryCounts}
        descriptor={descriptor}
        subFilter={subFilter}
        sortBy={sortBy}
        autoDeduct={autoDeduct}
        compact={isMobile}
        onMoneyChange={handleMoneyChange}
        onSearchChange={setSearchInput}
        onCategoryChange={handleCategoryChange}
        onSubFilterChange={setSubFilter}
        onSortChange={setSortBy}
        onAutoDeductChange={setAutoDeduct}
        onToggleBag={handleToggleBag}
      />

      <Collapse in={bagOpen} unmountOnExit>
        <Paper variant='outlined' sx={BAG_PAPER_SX}>
          <BagPanel
            bagEquipments={bagEquipments}
            purchasedIds={ownedIds}
            bagSpaces={bagSpaces}
            onRemove={handleRemove}
          />
        </Paper>
      </Collapse>

      <Box sx={LIST_SX}>
        {sections.length === 0 && (
          <Typography variant='body2' sx={EMPTY_SX}>
            Nenhum item encontrado.
          </Typography>
        )}

        {sections.map((section) => {
          const gridTemplate = [
            'minmax(150px, 1.6fr)',
            ...section.descriptor.stats.map((stat) => stat.width),
            'minmax(64px, 84px)',
            isMobile ? '0px' : 'minmax(150px, 172px)',
          ].join(' ');
          const SectionIcon = itemTypeStyles[section.descriptor.group]?.icon;

          return (
            <Box key={section.descriptor.key}>
              {isSearching && (
                <Box sx={SECTION_TITLE_SX}>
                  {SectionIcon && (
                    <SectionIcon
                      sx={{ fontSize: 16 }}
                      style={{
                        color: itemTypeStyles[section.descriptor.group]?.color,
                      }}
                    />
                  )}
                  <Typography variant='caption' sx={{ fontWeight: 600 }}>
                    {section.descriptor.label}
                  </Typography>
                </Box>
              )}
              {!isMobile && (
                <MarketListHeader
                  descriptor={section.descriptor}
                  gridTemplate={gridTemplate}
                />
              )}
              {section.items.map((item) => {
                const key = getItemKey(item);
                const price = item.preco ?? 0;
                return (
                  <MarketItemRow
                    key={key}
                    item={item}
                    descriptor={section.descriptor}
                    gridTemplate={gridTemplate}
                    affordable={!autoDeduct || price <= remainingMoney}
                    justAdded={lastActionKey === key}
                    proficient={isProficient(item)}
                    showCategoryIcon={false}
                    compact={isMobile}
                    onAdd={handleAdd}
                  />
                );
              })}
            </Box>
          );
        })}

        {isSearching && renderedResults < totalResults && (
          <Typography variant='caption' sx={FOOTER_SX}>
            Mostrando {renderedResults} de {totalResults} resultados — refine a
            busca.
          </Typography>
        )}
      </Box>

      <Alert severity='info' sx={{ mt: 2 }}>
        Ajuste o dinheiro inicial se o mestre permitir. Com o desconto
        automático desligado, os itens entram na mochila sem custo.
      </Alert>
    </Box>
  );
};

export default MarketStep;
