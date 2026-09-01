import React, { useMemo, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import {
  Box,
  Button,
  Divider,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import CharacterSheet from '@/interfaces/CharacterSheet';
import { ClassPower } from '@/interfaces/Class';
import { GeneralPower, OriginPower } from '@/interfaces/Poderes';
import { POWER_ORIGINS } from '@/functions/powers/powerOrigins';
import { PowerAvailability } from '@/functions/powers/requirementEvaluation';
import CustomPowerDialog from '../CustomPowerDialog';
import EnsinarTruqueDialog from '../EnsinarTruqueDialog';
import GolpePessoalBuilder from '../GolpePessoalBuilder';
import PowerSelectionDialog from '../PowerSelectionDialog';
import CatalogPanel from './CatalogPanel';
import SelectedPanel, { SelectedGroup } from './SelectedPanel';
import { CatalogEntry, usePowerCatalog } from './usePowerCatalog';
import { usePowersEditor } from './usePowersEditor';
import { getDevotionLabel } from '../../../../functions/powers/deityNames';
import { CATALOG_MIN_WIDTH, SELECTED_PANEL_WIDTH } from './powersEditorStyles';

const ALWAYS_AVAILABLE: PowerAvailability = {
  available: true,
  bypassed: false,
  groups: [],
};

const UNAVAILABLE: PowerAvailability = {
  available: false,
  bypassed: false,
  groups: [],
};

interface PowersEditorContentProps {
  open: boolean;
  sheet: CharacterSheet;
  onSave: (updates: Partial<CharacterSheet>) => void;
  onClose: () => void;
  isMobile: boolean;
}

/** Conta instâncias por nome, para o `×N`. */
function countByName(powers: { name: string }[]): Map<string, number> {
  const counts = new Map<string, number>();
  powers.forEach((p) => counts.set(p.name, (counts.get(p.name) ?? 0) + 1));
  return counts;
}

/**
 * O miolo do editor — e a razão de ele viver separado do shell.
 *
 * Todos os hooks pesados (catálogo de centenas de poderes, sets de classe,
 * cache de disponibilidade) moram aqui. Como este componente é renderizado
 * como filho do `Dialog`, e o `Dialog` do MUI não monta os filhos enquanto
 * está fechado, nada disso roda com o editor fechado. No editor antigo esses
 * mesmos hooks ficavam no corpo do componente, **fora** do `Drawer`, e
 * rodavam a cada render da ficha inteira.
 */
const PowersEditorContent: React.FC<PowersEditorContentProps> = ({
  open,
  sheet,
  onSave,
  onClose,
  isMobile,
}) => {
  const editor = usePowersEditor({ open, sheet, onSave, onClose });
  const [mobileTab, setMobileTab] = useState<'catalog' | 'selected'>('catalog');

  const {
    selectedPowers,
    selectedClassPowers,
    selectedOriginPowers,
    selectedCustomPowers,
    selectedDeityPowers,
    selectedCustomGrantedPowers,
    powerCategories,
    classPowerSets,
    classAbilitySets,
    getOriginForPower,
    getAvailability,
    isDevoto,
    isDeityPowerAvailable,
    isDeityPowerSelected,
  } = editor;

  // ── Disponibilidade por item ─────────────────────────────────────────────
  // Poder de origem e poder concedido não passam pelo avaliador de
  // pré-requisitos: o que os libera é a origem da ficha e a divindade.
  const resolveAvailability = (entry: CatalogEntry): PowerAvailability => {
    switch (entry.source.type) {
      case 'class':
        return getAvailability(entry.source.power, 'class');
      case 'origin':
        return sheet.origin?.name === getOriginForPower(entry.source.power)
          ? ALWAYS_AVAILABLE
          : UNAVAILABLE;
      case 'general':
        if (entry.kind === 'generalConcedidos' && isDevoto) {
          return isDeityPowerAvailable(entry.source.power)
            ? ALWAYS_AVAILABLE
            : UNAVAILABLE;
        }
        return getAvailability(entry.source.power, 'general');
      default:
        return ALWAYS_AVAILABLE;
    }
  };

  const catalog = usePowerCatalog({
    powerCategories,
    classPowerSets,
    classAbilitySets,
    raceName: sheet.raca.name,
    raceAbilities: sheet.raca.abilities ?? [],
    customPowers: selectedCustomPowers,
    resolveAvailability,
  });

  // ── Seleção ──────────────────────────────────────────────────────────────
  const counts = useMemo(
    () =>
      countByName([
        ...selectedPowers,
        ...selectedClassPowers,
        ...selectedOriginPowers,
        ...selectedDeityPowers,
      ]),
    [
      selectedClassPowers,
      selectedDeityPowers,
      selectedOriginPowers,
      selectedPowers,
    ]
  );

  const isSelected = (entry: CatalogEntry): boolean => {
    switch (entry.source.type) {
      case 'class':
        return selectedClassPowers.some((p) => p.name === entry.name);
      case 'origin':
        return selectedOriginPowers.some((p) => p.name === entry.name);
      case 'general':
        if (entry.kind === 'generalConcedidos' && isDevoto) {
          return isDeityPowerSelected(entry.source.power);
        }
        return selectedPowers.some((p) => p.name === entry.name);
      case 'custom':
        return true;
      default:
        return false;
    }
  };

  const handleToggle = (entry: CatalogEntry) => {
    switch (entry.source.type) {
      case 'class':
        editor.handleClassPowerToggle(
          entry.source.power,
          entry.source.className
        );
        break;
      case 'origin':
        editor.handleOriginPowerToggle(entry.source.power);
        break;
      case 'general':
        if (entry.kind === 'generalConcedidos' && isDevoto) {
          editor.handleDeityPowerToggle(entry.source.power);
        } else {
          editor.handlePowerToggle(entry.source.power);
        }
        break;
      case 'custom':
        editor.handleRemoveCustomPower(entry.source.power.id);
        break;
      default:
        break;
    }
  };

  /**
   * Poder de origem não tem fluxo de repetição, e poder concedido de devoto
   * vive em `devoto.poderes` — mandá-lo pelo caminho dos poderes gerais
   * duplicaria o poder na lista errada. Nesses casos o "+" não aparece.
   */
  const canAddAnother = (entry: CatalogEntry): boolean => {
    if (!entry.repeatable) return false;
    if (entry.source.type === 'class') return true;
    if (entry.source.type !== 'general') return false;
    return !(entry.kind === 'generalConcedidos' && isDevoto);
  };

  const handleAddAnother = (entry: CatalogEntry) => {
    if (entry.source.type === 'class') {
      editor.handleAddRepeatableClassPower(
        entry.source.power,
        entry.source.className
      );
    } else if (entry.source.type === 'general') {
      editor.handleAddRepeatablePower(entry.source.power);
    }
  };

  // ── Painel direito ───────────────────────────────────────────────────────
  /** Agrupa instâncias repetidas numa linha só, com `×N`. */
  const dedupe = <T extends { name: string }>(
    powers: T[],
    onRemove: (power: T) => void,
    prefix: string,
    unmetOf?: (power: T) => boolean
  ) =>
    Array.from(new Set(powers.map((p) => p.name))).map((name) => {
      const power = powers.find((p) => p.name === name)!;
      return {
        key: `${prefix}:${name}`,
        name,
        count: powers.filter((p) => p.name === name).length,
        unmet: unmetOf?.(power),
        onRemove: () => onRemove(power),
      };
    });

  const selectedGroups = useMemo<SelectedGroup[]>(() => {
    const groups: SelectedGroup[] = [];

    const push = (
      key: string,
      kind: keyof typeof POWER_ORIGINS,
      label: string,
      items: SelectedGroup['items']
    ) => {
      if (items.length === 0) return;
      groups.push({
        key,
        label,
        icon: POWER_ORIGINS[kind].icon,
        color: POWER_ORIGINS[kind].color,
        items,
      });
    };

    // Poderes de classe agrupados por classe, como no catálogo.
    const byClass = new Map<string, ClassPower[]>();
    selectedClassPowers.forEach((power) => {
      const className = power.className ?? sheet.classe.name;
      byClass.set(className, [...(byClass.get(className) ?? []), power]);
    });
    byClass.forEach((powers, className) => {
      push(
        `classPower:${className}`,
        'classPower',
        POWER_ORIGINS.classPower.label(className),
        dedupe(
          powers,
          editor.handleClassPowerRemove,
          `classPower:${className}`,
          (p) => !getAvailability(p, 'class').available
        )
      );
    });

    push(
      'originPower',
      'originPower',
      POWER_ORIGINS.originPower.label(),
      dedupe(
        selectedOriginPowers,
        editor.handleOriginPowerToggle,
        'originPower'
      )
    );

    push(
      'deityPower',
      'deityPower',
      getDevotionLabel(sheet)
        ? `Concedidos por ${getDevotionLabel(sheet)}`
        : POWER_ORIGINS.deityPower.label(),
      dedupe(selectedDeityPowers, editor.handleDeityPowerRemove, 'deityPower')
    );

    push(
      'generalPower',
      'generalCombate',
      'Poderes Gerais',
      dedupe(
        selectedPowers,
        editor.handlePowerRemove,
        'generalPower',
        (p) => !getAvailability(p, 'general').available
      )
    );

    push(
      'customGranted',
      'customGranted',
      POWER_ORIGINS.customGranted.label(),
      selectedCustomGrantedPowers.map((power) => ({
        key: `customGranted:${power.id}`,
        name: power.name,
        count: 1,
        onEdit: () =>
          editor.setCustomGrantedPowerDialog({
            open: true,
            powerToEdit: power,
          }),
        onRemove: () => editor.handleRemoveCustomGrantedPower(power.id),
      }))
    );

    push(
      'custom',
      'custom',
      POWER_ORIGINS.custom.label(),
      selectedCustomPowers.map((power) => ({
        key: `custom:${power.id}`,
        name: power.name,
        count: 1,
        onEdit: () =>
          editor.setCustomPowerDialog({ open: true, powerToEdit: power }),
        onRemove: () => editor.handleRemoveCustomPower(power.id),
      }))
    );

    return groups;
    // eslint-disable-next-line
  }, [
    editor,
    getAvailability,
    selectedClassPowers,
    selectedCustomGrantedPowers,
    selectedCustomPowers,
    selectedDeityPowers,
    selectedOriginPowers,
    selectedPowers,
    sheet.classe.name,
    sheet.devoto,
  ]);

  const automaticGroups = useMemo<SelectedGroup[]>(() => {
    const groups: SelectedGroup[] = [];

    classAbilitySets.forEach(({ className, abilities }) => {
      groups.push({
        key: `classAbility:${className}`,
        label: POWER_ORIGINS.classAbility.label(className),
        icon: POWER_ORIGINS.classAbility.icon,
        color: POWER_ORIGINS.classAbility.color,
        items: abilities.map((ability) => ({
          key: `classAbility:${className}:${ability.name}`,
          name: `${ability.name} (Nv.${ability.nivel})`,
          count: 1,
        })),
      });
    });

    const raceAbilities = sheet.raca.abilities ?? [];
    if (raceAbilities.length > 0) {
      groups.push({
        key: 'raceAbility',
        label: POWER_ORIGINS.raceAbility.label(sheet.raca.name),
        icon: POWER_ORIGINS.raceAbility.icon,
        color: POWER_ORIGINS.raceAbility.color,
        items: raceAbilities.map((ability) => ({
          key: `raceAbility:${ability.name}`,
          name: ability.name,
          count: 1,
        })),
      });
    }

    return groups;
  }, [classAbilitySets, sheet.raca.abilities, sheet.raca.name]);

  const selectedCount = selectedGroups.reduce(
    (total, group) => total + group.items.length,
    0
  );

  // ── Render ───────────────────────────────────────────────────────────────
  const selectedPanel = (
    <Box
      sx={{
        width: isMobile ? '100%' : SELECTED_PANEL_WIDTH,
        flexShrink: 0,
        overflowY: 'auto',
        borderLeft: isMobile ? 'none' : '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack
        direction='row'
        sx={{ alignItems: 'center', gap: 1, px: 1.5, pt: 1.5 }}
      >
        <Typography
          variant='overline'
          sx={{ flex: 1, color: 'text.secondary' }}
        >
          Na ficha
        </Typography>
        <Button
          size='small'
          startIcon={<AddIcon />}
          onClick={() => editor.setCustomPowerDialog({ open: true })}
        >
          Personalizado
        </Button>
      </Stack>
      <SelectedPanel
        groups={selectedGroups}
        automaticGroups={automaticGroups}
      />
    </Box>
  );

  const catalogPanel = (
    <CatalogPanel
      catalog={catalog}
      counts={counts}
      isSelected={isSelected}
      onToggle={handleToggle}
      canAddAnother={canAddAnother}
      onAddAnother={handleAddAnother}
    />
  );

  return (
    <>
      {isMobile && (
        <Tabs
          value={mobileTab}
          onChange={(_e, value) => setMobileTab(value)}
          variant='fullWidth'
          sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
        >
          <Tab value='catalog' label='Catálogo' />
          <Tab value='selected' label={`Na ficha (${selectedCount})`} />
        </Tabs>
      )}

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          overflow: 'hidden',
          '& > *': { minWidth: isMobile ? 0 : CATALOG_MIN_WIDTH },
        }}
      >
        {isMobile
          ? (mobileTab === 'catalog' && catalogPanel) ||
            (mobileTab === 'selected' && selectedPanel)
          : null}
        {!isMobile && (
          <>
            {catalogPanel}
            {selectedPanel}
          </>
        )}
      </Box>

      <Divider />
      <Stack
        direction='row'
        spacing={1.5}
        sx={{ p: 1.5, justifyContent: 'flex-end', flexShrink: 0 }}
      >
        <Button variant='outlined' onClick={editor.handleCancel}>
          Cancelar
        </Button>
        <Button variant='contained' onClick={editor.handleSave}>
          Salvar
        </Button>
      </Stack>

      {/* Diálogos filhos, montados só quando abertos. */}
      {editor.selectionDialog.open && editor.selectionDialog.requirements && (
        <PowerSelectionDialog
          open={editor.selectionDialog.open}
          onClose={editor.handleSelectionCancel}
          onConfirm={editor.handleSelectionConfirm}
          requirements={editor.selectionDialog.requirements}
          sheet={sheet}
        />
      )}

      {editor.golpePessoalDialog.open &&
        editor.golpePessoalDialog.powerToAdd && (
          <GolpePessoalBuilder
            open={editor.golpePessoalDialog.open}
            sheet={sheet}
            activeSupplements={editor.allSupplements}
            onClose={editor.closeGolpePessoalDialog}
            onConfirm={editor.handleGolpePessoalConfirm}
          />
        )}

      {editor.customPowerDialog.open && (
        <CustomPowerDialog
          open={editor.customPowerDialog.open}
          onClose={() => editor.setCustomPowerDialog({ open: false })}
          onSave={editor.handleSaveCustomPower}
          power={editor.customPowerDialog.powerToEdit}
        />
      )}

      {editor.customGrantedPowerDialog.open && (
        <CustomPowerDialog
          open={editor.customGrantedPowerDialog.open}
          onClose={() => editor.setCustomGrantedPowerDialog({ open: false })}
          onSave={editor.handleSaveCustomGrantedPower}
          power={editor.customGrantedPowerDialog.powerToEdit}
        />
      )}

      {editor.ensinarTruqueDialog.open && sheet.companions?.length ? (
        <EnsinarTruqueDialog
          open={editor.ensinarTruqueDialog.open}
          companions={sheet.companions}
          trainerLevel={editor.trainerLevel}
          pendingCount={editor.ensinarTruqueDialog.pendingCount}
          onComplete={(picks) => {
            editor.setEnsinarTruqueDialog({ open: false, pendingCount: 0 });
            editor.commitSave(picks);
          }}
          onCancel={() =>
            editor.setEnsinarTruqueDialog({ open: false, pendingCount: 0 })
          }
        />
      ) : null}
    </>
  );
};

export type { GeneralPower, OriginPower };
export default PowersEditorContent;
