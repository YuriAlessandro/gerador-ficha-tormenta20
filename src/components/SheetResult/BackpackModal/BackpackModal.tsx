import React, { useMemo, useState } from 'react';
import {
  Alert,
  AppBar,
  Box,
  Button,
  Chip,
  Collapse,
  Dialog,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Slide,
  Stack,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import {
  Close as CloseIcon,
  ExpandLess as ExpandLessIcon,
  Inventory as InventoryIcon,
  Save as SaveIcon,
  Tune as TuneIcon,
} from '@mui/icons-material';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from 'react-beautiful-dnd';

import CharacterSheet, {
  Step,
  SubStep,
} from '../../../interfaces/CharacterSheet';
import Bag from '../../../interfaces/Bag';
import Equipment, { equipGroup } from '../../../interfaces/Equipment';
import { recalculateSheet } from '../../../functions/recalculateSheet';
import BackpackItemCard from './BackpackItemCard';
import BackpackToolbar from './BackpackToolbar';
import AddItemDialog from './AddItemDialog';
import ItemEditorDialog from './ItemEditorDialog';
import { useBackpackState } from './useBackpackState';
import { getWieldingSlot, getWornArmor } from './wielding';
import { CATEGORY_ORDER, itemTypeStyles } from './itemTypeStyles';

export interface BackpackModalProps {
  open: boolean;
  onClose: () => void;
  sheet: CharacterSheet;
  /** Persists changes to the parent's sheet handler. */
  onSave?: (updates: Partial<CharacterSheet>) => void;
}

const SlideUpTransition = React.forwardRef<
  unknown,
  TransitionProps & { children: React.ReactElement }
>((props, ref) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <Slide direction='up' ref={ref} {...props} />
));
SlideUpTransition.displayName = 'SlideUpTransition';

function buildEquipmentSubsteps(
  before: Equipment[],
  after: Equipment[]
): SubStep[] {
  const beforeIds = new Set(before.map((e) => e.id));
  const afterIds = new Set(after.map((e) => e.id));
  const added = after.filter((e) => e.id && !beforeIds.has(e.id));
  const removed = before.filter((e) => e.id && !afterIds.has(e.id));
  const subSteps: SubStep[] = [];
  added.forEach((e) =>
    subSteps.push({
      name: 'Adicionado',
      value: e.customDisplayName || e.nome,
    })
  );
  removed.forEach((e) =>
    subSteps.push({
      name: 'Removido',
      value: e.customDisplayName || e.nome,
    })
  );
  return subSteps;
}

const BackpackModal: React.FC<BackpackModalProps> = ({
  open,
  onClose,
  sheet,
  onSave,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const initialMoney = useMemo(
    () => ({
      dinheiro: sheet.dinheiro ?? 0,
      dinheiroTC: sheet.dinheiroTC ?? 0,
      dinheiroTO: sheet.dinheiroTO ?? 0,
    }),
    [sheet.dinheiro, sheet.dinheiroTC, sheet.dinheiroTO]
  );
  const forca = sheet.atributos.Força.value;

  const state = useBackpackState({
    bag: sheet.bag,
    initialMoney,
    forca,
    initialCustomMaxSpaces: sheet.customMaxSpaces,
    initialMainHandItemId: sheet.mainHandItemId,
    initialOffHandItemId: sheet.offHandItemId,
    initialWornArmorId: sheet.wornArmorId,
    initialGroupByCategory: sheet.backpackGroupByCategory,
    open,
  });

  const {
    orderedItems,
    filteredItems,
    totals,
    filters,
    setSearchQuery,
    toggleCategoryFilter,
    resetCategoryFilters,
    reorderMode,
    setReorderMode,
    staged,
    isDirty,
    addItem,
    removeItem,
    setQuantity,
    updateItem,
    setMoney,
    setCustomMaxSpaces,
    setAutoDeductMoney,
    reorder,
    setWielding,
    setWornArmor,
    setGroupByCategory,
    revertChanges,
  } = state;

  const wieldingState = {
    mainHandItemId: staged.mainHandItemId,
    offHandItemId: staged.offHandItemId,
  };
  const mainHandItem = staged.mainHandItemId
    ? orderedItems.find((it) => it.id === staged.mainHandItemId)
    : undefined;
  const offHandItem = staged.offHandItemId
    ? orderedItems.find((it) => it.id === staged.offHandItemId)
    : undefined;
  const wieldingTwoHanded =
    staged.mainHandItemId !== undefined &&
    staged.mainHandItemId === staged.offHandItemId;
  const twoHandedItem = wieldingTwoHanded ? mainHandItem : undefined;

  const armorsInBag = orderedItems.filter((it) => it.group === 'Armadura');
  const wornArmor = getWornArmor(armorsInBag, staged.wornArmorId);
  const ambiguousArmor =
    armorsInBag.length >= 2 && staged.wornArmorId === undefined;

  /**
   * Returns the slot disable map for an item card. Blocks slots when a hand
   * is occupied by:
   *   - a two-handed weapon (both slots blocked for any other item);
   *   - a shield (the corresponding hand is blocked for any other item — the
   *     player must soltar the shield first to wield a weapon there).
   * The occupant item itself is never blocked, so the user can still soltar.
   */
  const getDisabledSlots = (
    itemId: string | undefined
  ): Partial<Record<'main' | 'off', { reason: string }>> | undefined => {
    if (wieldingTwoHanded && twoHandedItem && itemId !== twoHandedItem.id) {
      const reason = `Mão ocupada por ${
        twoHandedItem.customDisplayName || twoHandedItem.nome
      } (duas mãos). Solte primeiro.`;
      return { main: { reason }, off: { reason } };
    }

    const disabled: Partial<Record<'main' | 'off', { reason: string }>> = {};
    if (
      mainHandItem &&
      mainHandItem.group === 'Escudo' &&
      itemId !== mainHandItem.id
    ) {
      disabled.main = {
        reason: `Mão ocupada por ${
          mainHandItem.customDisplayName || mainHandItem.nome
        } (escudo). Solte primeiro.`,
      };
    }
    if (
      offHandItem &&
      offHandItem.group === 'Escudo' &&
      itemId !== offHandItem.id
    ) {
      disabled.off = {
        reason: `Mão ocupada por ${
          offHandItem.customDisplayName || offHandItem.nome
        } (escudo). Solte primeiro.`,
      };
    }
    return Object.keys(disabled).length > 0 ? disabled : undefined;
  };

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  // Collapsed by default on every viewport — money/capacity tweaks are
  // occasional and the totals row already gives the at-a-glance summary.
  const [moneySectionOpen, setMoneySectionOpen] = useState(false);

  const progressPercent = Math.min(
    100,
    (totals.totalSpaces / Math.max(totals.maxSpaces, 1)) * 100
  );

  const handleClose = () => {
    if (isDirty) {
      const confirmed =
        // eslint-disable-next-line no-alert
        window.confirm('Você tem alterações não salvas na mochila. Descartar?');
      if (!confirmed) return;
      revertChanges();
    }
    onClose();
  };

  const handleSave = () => {
    if (!onSave) {
      onClose();
      return;
    }

    const beforeItems = sheet.bag.getOrderedEquipments();
    const newBag = new Bag(staged.equipments, true, staged.displayOrder);

    const recalculated = recalculateSheet(
      {
        ...sheet,
        bag: newBag,
        dinheiro: staged.money.dinheiro,
        dinheiroTC: staged.money.dinheiroTC,
        dinheiroTO: staged.money.dinheiroTO,
        customMaxSpaces: staged.customMaxSpaces,
      },
      undefined,
      undefined,
      { skipPMRecalc: true, skipPVRecalc: true }
    );

    // Bag may be re-built into a plain object during recalc — rehydrate.
    const finalBag =
      recalculated.bag instanceof Bag
        ? recalculated.bag
        : new Bag(
            (recalculated.bag as Bag | undefined)?.equipments ??
              staged.equipments,
            true,
            staged.displayOrder
          );

    const subSteps = buildEquipmentSubsteps(
      beforeItems,
      finalBag.getOrderedEquipments()
    );
    if (staged.money.dinheiro !== initialMoney.dinheiro) {
      subSteps.push({
        name: 'T$',
        value: `${initialMoney.dinheiro} → ${staged.money.dinheiro}`,
      });
    }
    if (staged.money.dinheiroTC !== initialMoney.dinheiroTC) {
      subSteps.push({
        name: 'TC',
        value: `${initialMoney.dinheiroTC} → ${staged.money.dinheiroTC}`,
      });
    }
    if (staged.money.dinheiroTO !== initialMoney.dinheiroTO) {
      subSteps.push({
        name: 'TO',
        value: `${initialMoney.dinheiroTO} → ${staged.money.dinheiroTO}`,
      });
    }

    const editStep: Step = {
      label: 'Edição Manual - Equipamentos',
      type: 'Edição Manual - Equipamentos',
      value: subSteps,
    };

    onSave({
      bag: finalBag,
      dinheiro: staged.money.dinheiro,
      dinheiroTC: staged.money.dinheiroTC,
      dinheiroTO: staged.money.dinheiroTO,
      customMaxSpaces: staged.customMaxSpaces,
      maxSpaces: recalculated.maxSpaces ?? sheet.maxSpaces,
      defesa: recalculated.defesa ?? sheet.defesa,
      displacement: recalculated.displacement ?? sheet.displacement,
      mainHandItemId: staged.mainHandItemId,
      offHandItemId: staged.offHandItemId,
      wornArmorId: staged.wornArmorId,
      backpackGroupByCategory: staged.groupByCategory,
      steps: [...sheet.steps, editStep],
    });

    onClose();
  };

  const handleEdit = (item: Equipment) => {
    setEditingItem(item);
    setEditorOpen(true);
  };

  /**
   * Reorders globally based on a drag inside the (possibly filtered) list.
   * In flat mode, the visible subset is `filteredItems`. In grouped mode, each
   * category is its own Droppable; cross-group drops are rejected so the
   * "visible subset" for the math is the items of that group inside
   * `filteredItems`. The displayOrder rebuild strategy is the same in both:
   * place the moved id immediately before its new visible neighbor.
   */
  const GROUP_DROPPABLE_PREFIX = 'backpack-group-';

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const srcDroppable = result.source.droppableId;
    const destDroppable = result.destination.droppableId;
    if (srcDroppable !== destDroppable) return; // cross-group drag rejected

    const srcVisibleIdx = result.source.index;
    const destVisibleIdx = result.destination.index;
    if (srcVisibleIdx === destVisibleIdx) return;

    // Determine the visible subset that the drag was performed within.
    let subset: Equipment[] = filteredItems;
    if (srcDroppable.startsWith(GROUP_DROPPABLE_PREFIX)) {
      const cat = srcDroppable.slice(GROUP_DROPPABLE_PREFIX.length);
      subset = filteredItems.filter((it) => it.group === cat);
    }

    const movedId = subset[srcVisibleIdx]?.id;
    if (!movedId) return;

    // Build the new visible-subset order.
    const newVisibleIds = subset.map((it) => it.id ?? '');
    const [picked] = newVisibleIds.splice(srcVisibleIdx, 1);
    newVisibleIds.splice(destVisibleIdx, 0, picked);

    // Remove the moved id from the global list, then re-insert it before the
    // visible neighbor (or at the end if it was dropped at the visible tail).
    const globalWithoutMoved = staged.displayOrder.filter(
      (id) => id !== movedId
    );
    const newDestVisiblePosition = newVisibleIds.indexOf(movedId);
    const neighborAfter = newVisibleIds[newDestVisiblePosition + 1] ?? null;
    let insertAt = globalWithoutMoved.length;
    if (neighborAfter) {
      const at = globalWithoutMoved.indexOf(neighborAfter);
      if (at >= 0) insertAt = at;
    }
    const nextOrder = [
      ...globalWithoutMoved.slice(0, insertAt),
      movedId,
      ...globalWithoutMoved.slice(insertAt),
    ];
    reorder(nextOrder);
  };

  const handleEditorSave = (next: Equipment) => {
    if (next.id) updateItem(next.id, next);
    setEditorOpen(false);
    setEditingItem(null);
  };

  const renderItemCard = (item: Equipment) => (
    <BackpackItemCard
      item={item}
      isOverflowing={item.id ? totals.overflowItemIds.has(item.id) : false}
      reorderMode={reorderMode}
      onEdit={() => handleEdit(item)}
      onDelete={() => item.id && removeItem(item.id)}
      onIncrementQuantity={
        item.group !== 'Armadura' && item.group !== 'Escudo'
          ? () => item.id && setQuantity(item.id, (item.quantity ?? 1) + 1)
          : undefined
      }
      onDecrementQuantity={
        item.group !== 'Armadura' && item.group !== 'Escudo'
          ? () =>
              item.id &&
              setQuantity(item.id, Math.max(1, (item.quantity ?? 1) - 1))
          : undefined
      }
      wieldingSlot={getWieldingSlot(item.id, wieldingState)}
      onWieldingChange={
        item.id ? (slot) => setWielding(item.id as string, slot) : undefined
      }
      wieldingDisabledSlots={getDisabledSlots(item.id)}
      isWorn={item.id !== undefined && wornArmor?.id === item.id}
      onWornChange={
        item.id && item.group === 'Armadura'
          ? (worn) => setWornArmor(worn ? (item.id as string) : null)
          : undefined
      }
      onAdjustAmmoUnits={
        item.isAmmo && item.id
          ? (delta) => {
              const next: Equipment = {
                ...item,
                unitsRemaining: Math.max(0, (item.unitsRemaining ?? 0) + delta),
              };
              updateItem(item.id as string, next);
            }
          : undefined
      }
    />
  );

  // Group items by category for the grouped layout, preserving the manual
  // displayOrder within each group via filteredItems already being ordered.
  const groupsForRender: { group: equipGroup; items: Equipment[] }[] =
    staged.groupByCategory
      ? CATEGORY_ORDER.map((cat) => ({
          group: cat,
          items: filteredItems.filter((it) => it.group === cat),
        })).filter((g) => g.items.length > 0)
      : [];

  const renderDraggableCard = (
    item: Equipment,
    idx: number,
    cardSizing?: Record<string, string>
  ) => {
    const draggableId = item.id ?? `${item.nome}-${idx}`;
    return (
      <Draggable key={draggableId} draggableId={draggableId} index={idx}>
        {(dragProvided, snapshot) => (
          <Box
            ref={dragProvided.innerRef}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...dragProvided.draggableProps}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...dragProvided.dragHandleProps}
            sx={{
              flex: cardSizing ?? {
                xs: '1 1 100%',
                sm: '1 1 calc(50% - 12px)',
                md: '1 1 calc(33.333% - 12px)',
                lg: '1 1 calc(25% - 12px)',
              },
              minWidth: 0,
              opacity: snapshot.isDragging ? 0.85 : 1,
            }}
          >
            {renderItemCard(item)}
          </Box>
        )}
      </Draggable>
    );
  };

  const moneyField = (
    label: string,
    value: number,
    onChange: (next: number) => void,
    helper?: string
  ) => (
    <TextField
      label={label}
      size='small'
      value={value}
      onChange={(e) => {
        const v = parseFloat(e.target.value.replace(',', '.'));
        onChange(Number.isNaN(v) ? 0 : v);
      }}
      inputProps={{ inputMode: 'decimal' }}
      helperText={helper}
      sx={{ width: { xs: 'calc(50% - 4px)', sm: 120 } }}
    />
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={isMobile}
      maxWidth='lg'
      fullWidth
      TransitionComponent={SlideUpTransition}
      PaperProps={{
        sx: {
          height: isMobile ? '100%' : '90vh',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <AppBar position='sticky' color='default' elevation={0}>
        <Toolbar
          sx={{
            display: 'flex',
            gap: { xs: 1, sm: 1.5 },
            alignItems: 'center',
            minHeight: { xs: 52, sm: 64 },
            px: { xs: 1.5, sm: 2 },
          }}
        >
          <InventoryIcon
            color='primary'
            fontSize={isMobile ? 'small' : 'medium'}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant={isMobile ? 'subtitle1' : 'h6'}
              component='div'
              sx={{ lineHeight: 1.2 }}
              noWrap
            >
              Mochila
            </Typography>
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ display: 'block' }}
              noWrap
            >
              {filteredItems.length} item(ns) · {totals.totalSpaces}/
              {totals.maxSpaces} esp.
            </Typography>
          </Box>
          <Tooltip title='Fechar'>
            <IconButton onClick={handleClose} aria-label='Fechar mochila'>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
        <LinearProgress
          variant='determinate'
          value={progressPercent}
          color={totals.isOverloaded ? 'error' : 'primary'}
        />
      </AppBar>

      <BackpackToolbar
        searchQuery={filters.searchQuery}
        onSearchQueryChange={setSearchQuery}
        selectedCategories={filters.selectedCategories}
        onToggleCategory={toggleCategoryFilter}
        onResetCategories={resetCategoryFilters}
        reorderMode={reorderMode}
        onReorderModeChange={setReorderMode}
        onAddItem={() => setAddDialogOpen(true)}
        groupByCategory={staged.groupByCategory}
        onGroupByCategoryChange={setGroupByCategory}
      />

      {(mainHandItem || offHandItem || wornArmor) && (
        <Box
          sx={{
            px: { xs: 1.25, sm: 2 },
            py: { xs: 0.75, sm: 1 },
            bgcolor: 'background.default',
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 0.5,
            alignItems: 'center',
          }}
        >
          {wornArmor && (
            <Chip
              size='small'
              color='primary'
              variant='outlined'
              label={`🛡️ ${wornArmor.customDisplayName || wornArmor.nome}`}
              onDelete={() => setWornArmor(null)}
              sx={{ maxWidth: '100%' }}
            />
          )}
          {wieldingTwoHanded && twoHandedItem ? (
            <Chip
              size='small'
              color='primary'
              variant='outlined'
              label={`🤝 ${
                twoHandedItem.customDisplayName || twoHandedItem.nome
              }`}
              onDelete={() => setWielding(twoHandedItem.id ?? '', null)}
              sx={{ maxWidth: '100%' }}
            />
          ) : (
            <>
              {mainHandItem && (
                <Chip
                  size='small'
                  color='primary'
                  variant='outlined'
                  label={`🤚 ${
                    mainHandItem.customDisplayName || mainHandItem.nome
                  }`}
                  onDelete={() => setWielding(mainHandItem.id ?? '', null)}
                  sx={{ maxWidth: '100%' }}
                />
              )}
              {offHandItem && (
                <Chip
                  size='small'
                  color='secondary'
                  variant='outlined'
                  label={`✋ ${
                    offHandItem.customDisplayName || offHandItem.nome
                  }`}
                  onDelete={() => setWielding(offHandItem.id ?? '', null)}
                  sx={{ maxWidth: '100%' }}
                />
              )}
            </>
          )}
        </Box>
      )}

      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {ambiguousArmor && (
          <Alert severity='warning' sx={{ mb: 2 }}>
            <Typography variant='body2' sx={{ fontWeight: 600 }}>
              Você tem {armorsInBag.length} armaduras na mochila. Escolha qual
              está vestindo.
            </Typography>
            <Typography variant='caption' sx={{ display: 'block', mt: 0.25 }}>
              Enquanto nenhuma estiver marcada como vestida, NENHUMA aplica seu
              bônus de defesa ou penalidade. Use o botão de armadura no card.
            </Typography>
          </Alert>
        )}

        {totals.isOverloaded && (
          <Alert severity='error' sx={{ mb: 2 }}>
            <Typography variant='body2' sx={{ fontWeight: 600 }}>
              Você está sobrecarregado: {totals.totalSpaces} /{' '}
              {totals.maxSpaces} espaços usados
            </Typography>
            <Typography variant='caption' sx={{ display: 'block', mt: 0.25 }}>
              Itens em vermelho excedem o limite na ordem da mochila. Você ainda
              pode carregá-los, mas seu deslocamento sofre penalidade enquanto
              estiver sobrecarregado. (Capacidade = 10 + 2×Força, ou 10 −
              |Força| quando negativa. Cada 1.000 moedas conta 1 espaço.)
            </Typography>
          </Alert>
        )}

        {filteredItems.length === 0 && (
          <Box
            sx={{
              textAlign: 'center',
              color: 'text.secondary',
              py: 6,
            }}
          >
            <Typography variant='body2'>
              {orderedItems.length === 0
                ? 'Sua mochila está vazia. Use "Adicionar item" para começar.'
                : 'Nenhum item corresponde aos filtros atuais.'}
            </Typography>
          </Box>
        )}

        {filteredItems.length > 0 && !staged.groupByCategory && reorderMode && (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId='backpack-items'>
              {(provided) => (
                <Box
                  ref={provided.innerRef}
                  // eslint-disable-next-line react/jsx-props-no-spreading
                  {...provided.droppableProps}
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1.5,
                  }}
                >
                  {filteredItems.map((item, idx) =>
                    renderDraggableCard(item, idx)
                  )}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          </DragDropContext>
        )}

        {filteredItems.length > 0 &&
          !staged.groupByCategory &&
          !reorderMode && (
            <Grid container spacing={1.5}>
              {filteredItems.map((item) => (
                <Grid
                  key={item.id ?? item.nome}
                  size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                >
                  {renderItemCard(item)}
                </Grid>
              ))}
            </Grid>
          )}

        {filteredItems.length > 0 && staged.groupByCategory && (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {groupsForRender.map(({ group, items }) => {
                const style = itemTypeStyles[group];
                const Icon = style.icon;
                return (
                  <Box key={group}>
                    <Stack
                      direction='row'
                      spacing={1}
                      alignItems='center'
                      sx={{
                        mb: 1,
                        pb: 0.5,
                        borderBottom: 1,
                        borderColor: 'divider',
                      }}
                    >
                      <Icon
                        style={{ fontSize: 18, color: style.color }}
                        aria-hidden
                      />
                      <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
                        {style.label}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        ({items.length})
                      </Typography>
                    </Stack>
                    <Droppable
                      droppableId={`${GROUP_DROPPABLE_PREFIX}${group}`}
                      isDropDisabled={!reorderMode}
                    >
                      {(provided) =>
                        reorderMode ? (
                          <Box
                            ref={provided.innerRef}
                            // eslint-disable-next-line react/jsx-props-no-spreading
                            {...provided.droppableProps}
                            sx={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: 1.5,
                              minHeight: 40,
                            }}
                          >
                            {items.map((item, idx) =>
                              renderDraggableCard(item, idx)
                            )}
                            {provided.placeholder}
                          </Box>
                        ) : (
                          <Box
                            ref={provided.innerRef}
                            // eslint-disable-next-line react/jsx-props-no-spreading
                            {...provided.droppableProps}
                          >
                            <Grid container spacing={1.5}>
                              {items.map((item) => (
                                <Grid
                                  key={item.id ?? item.nome}
                                  size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                                >
                                  {renderItemCard(item)}
                                </Grid>
                              ))}
                            </Grid>
                            {provided.placeholder}
                          </Box>
                        )
                      }
                    </Droppable>
                  </Box>
                );
              })}
            </Box>
          </DragDropContext>
        )}
      </Box>

      <Divider />

      <Box
        sx={{
          px: { xs: 1.25, sm: 2 },
          py: { xs: 1, sm: 1.5 },
          display: 'flex',
          flexDirection: 'column',
          gap: { xs: 0.75, sm: 1.25 },
          bgcolor: 'background.paper',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <Stack
            direction='row'
            spacing={1.5}
            sx={{ flexWrap: 'wrap', minWidth: 0 }}
          >
            <Typography variant='caption' color='text.secondary'>
              Itens{' '}
              <Box
                component='span'
                sx={{ fontWeight: 600, color: 'text.primary' }}
              >
                {totals.itemSpaces}
              </Box>
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Moedas{' '}
              <Box
                component='span'
                sx={{ fontWeight: 600, color: 'text.primary' }}
              >
                {totals.currencySpaces}
              </Box>
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Total{' '}
              <Box
                component='span'
                sx={{
                  fontWeight: 700,
                  color: totals.isOverloaded ? 'error.main' : 'text.primary',
                }}
              >
                {totals.totalSpaces} / {totals.maxSpaces}
              </Box>
            </Typography>
          </Stack>
          <Tooltip
            title={
              moneySectionOpen
                ? 'Esconder dinheiro e capacidade'
                : 'Ajustar dinheiro e capacidade'
            }
          >
            <IconButton
              size='small'
              onClick={() => setMoneySectionOpen((v) => !v)}
              aria-label='Ajustar dinheiro e capacidade'
            >
              {moneySectionOpen ? (
                <ExpandLessIcon fontSize='small' />
              ) : (
                <TuneIcon fontSize='small' />
              )}
            </IconButton>
          </Tooltip>
        </Box>

        <Collapse in={moneySectionOpen} unmountOnExit={isMobile}>
          <Stack
            direction='row'
            spacing={1}
            sx={{
              flexWrap: 'wrap',
              alignItems: 'flex-start',
              gap: 1,
            }}
          >
            {moneyField('T$', staged.money.dinheiro, (v) =>
              setMoney({ dinheiro: v })
            )}
            {moneyField(
              'TC',
              staged.money.dinheiroTC,
              (v) => setMoney({ dinheiroTC: v }),
              '1 TC = T$ 0,1'
            )}
            {moneyField(
              'TO',
              staged.money.dinheiroTO,
              (v) => setMoney({ dinheiroTO: v }),
              '1 TO = T$ 10'
            )}
            <TextField
              label='Espaço máx.'
              size='small'
              value={staged.customMaxSpaces ?? ''}
              placeholder={String(totals.maxSpaces)}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === '') {
                  setCustomMaxSpaces(undefined);
                  return;
                }
                const v = parseInt(raw, 10);
                setCustomMaxSpaces(Number.isNaN(v) ? undefined : v);
              }}
              inputProps={{ inputMode: 'numeric' }}
              helperText='Limpar = padrão'
              sx={{ width: { xs: 'calc(50% - 4px)', sm: 140 } }}
            />
          </Stack>
        </Collapse>

        <Stack
          direction='row'
          spacing={1}
          sx={{ justifyContent: 'flex-end', mt: { xs: 0.25, sm: 0 } }}
        >
          <Button onClick={handleClose} size={isMobile ? 'small' : 'medium'}>
            Cancelar
          </Button>
          <Button
            variant='contained'
            startIcon={isMobile ? undefined : <SaveIcon />}
            onClick={handleSave}
            disabled={!isDirty}
            size={isMobile ? 'small' : 'medium'}
          >
            Salvar
          </Button>
        </Stack>
      </Box>

      <AddItemDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onAddItem={(item, options) => {
          addItem(item, options);
          setAddDialogOpen(false);
        }}
        availableTibares={staged.money.dinheiro}
        autoDeductMoney={staged.autoDeductMoney}
        onToggleAutoDeductMoney={setAutoDeductMoney}
      />

      <ItemEditorDialog
        open={editorOpen}
        onClose={() => {
          setEditorOpen(false);
          setEditingItem(null);
        }}
        item={editingItem}
        onSave={handleEditorSave}
      />
    </Dialog>
  );
};

export default BackpackModal;
