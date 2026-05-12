/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Stack,
  Typography,
  Box,
  Chip,
  Divider,
  Tabs,
  Tab,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Autocomplete,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import {
  CompanionSheet,
  CompanionType,
  CompanionSize,
  CompanionTrick,
  CompanionNaturalWeapon,
  NaturalWeaponDamageType,
  SpiritEnergyType,
  CompanionManualOverrides,
} from '@/interfaces/Companion';
import {
  calculateCompanionStats,
  revertCompanionToOriginal,
  COMPANION_AVAILABLE_SKILLS,
  COMPANION_WEAPON_DAMAGE_TYPES,
} from '@/data/systems/tormenta20/herois-de-arton/companion';
import {
  getCompanionTrickDefinition,
  getAvailableTricks,
} from '@/data/systems/tormenta20/herois-de-arton/companion/companionTricks';
import {
  Atributo,
  ATTR_ABBREVIATIONS,
} from '@/data/systems/tormenta20/atributos';
import Skill from '@/interfaces/Skills';

const COMPANION_TYPES: CompanionType[] = [
  'Animal',
  'Construto',
  'Espírito',
  'Monstro',
  'Morto-Vivo',
];

const ALL_SIZES: CompanionSize[] = ['Pequeno', 'Médio', 'Grande', 'Enorme'];

interface CompanionEditDialogProps {
  open: boolean;
  onClose: () => void;
  companion: CompanionSheet;
  trainerLevel: number;
  trainerCharisma: number;
  onSave: (updated: CompanionSheet) => void;
}

type DraftState = {
  // Base inputs (mutated directly on companion)
  name?: string;
  companionType: CompanionType;
  size: CompanionSize;
  spiritEnergyType?: SpiritEnergyType;
  treinoIntensivo?: boolean;
  tricks: CompanionTrick[];
  baseSkills: Skill[];
  baseDamageType: NaturalWeaponDamageType;
  // Derived overrides
  overrides: CompanionManualOverrides;
};

function buildInitialDraft(companion: CompanionSheet): DraftState {
  return {
    name: companion.name,
    companionType: companion.companionType,
    size: companion.size,
    spiritEnergyType: companion.spiritEnergyType,
    treinoIntensivo: companion.treinoIntensivo,
    tricks: [...companion.tricks],
    baseSkills: [...companion.skills],
    baseDamageType:
      companion.naturalWeapons[0]?.damageType ||
      ('Corte' as NaturalWeaponDamageType),
    overrides: companion.manualOverrides
      ? { ...companion.manualOverrides }
      : {},
  };
}

const CompanionEditDialog: React.FC<CompanionEditDialogProps> = ({
  open,
  onClose,
  companion,
  trainerLevel,
  trainerCharisma,
  onSave,
}) => {
  const isMobile = useMemo(() => window.innerWidth < 720, []);
  const [activeTab, setActiveTab] = useState(0);
  const [draft, setDraft] = useState<DraftState>(() =>
    buildInitialDraft(companion)
  );
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setDraft(buildInitialDraft(companion));
      setActiveTab(0);
    }
  }, [open, companion]);

  // Computa preview dos valores auto a partir do draft (para mostrar ao usuário o "valor automático")
  const previewCompanion = useMemo<CompanionSheet>(() => {
    const draftCompanion: CompanionSheet = {
      ...companion,
      name: draft.name,
      companionType: draft.companionType,
      size: draft.size,
      spiritEnergyType: draft.spiritEnergyType,
      treinoIntensivo: draft.treinoIntensivo,
      tricks: draft.tricks,
      skills: draft.baseSkills,
      naturalWeapons: [
        {
          ...(companion.naturalWeapons[0] || {
            damageDice: '1d8',
            criticalMultiplier: 2,
            threatMargin: 20,
          }),
          damageType: draft.baseDamageType,
        },
        ...companion.naturalWeapons.slice(1),
      ],
      manualOverrides: draft.overrides,
    };
    return calculateCompanionStats(
      draftCompanion,
      trainerLevel,
      trainerCharisma
    );
  }, [draft, companion, trainerLevel, trainerCharisma]);

  const autoStateForDisplay = previewCompanion.originalAutoState;

  const updateOverride = useCallback(
    <K extends keyof CompanionManualOverrides>(
      key: K,
      value: CompanionManualOverrides[K] | undefined
    ) => {
      setDraft((prev) => {
        const next = { ...prev.overrides };
        if (value === undefined) {
          delete next[key];
        } else {
          next[key] = value;
        }
        return { ...prev, overrides: next };
      });
    },
    []
  );

  const clearOverride = useCallback(
    (key: keyof CompanionManualOverrides) => updateOverride(key, undefined),
    [updateOverride]
  );

  const handleSave = useCallback(() => {
    const updatedCompanion: CompanionSheet = {
      ...companion,
      name: draft.name,
      companionType: draft.companionType,
      size: draft.size,
      spiritEnergyType:
        draft.companionType === 'Espírito' ? draft.spiritEnergyType : undefined,
      treinoIntensivo: draft.treinoIntensivo,
      tricks: draft.tricks,
      skills: draft.baseSkills,
      naturalWeapons: [
        {
          ...(companion.naturalWeapons[0] || {
            damageDice: '1d8',
            criticalMultiplier: 2,
            threatMargin: 20,
          }),
          damageType: draft.baseDamageType,
        },
        ...companion.naturalWeapons.slice(1),
      ],
      manualOverrides:
        Object.keys(draft.overrides).length > 0 ? draft.overrides : undefined,
    };
    const recalculated = calculateCompanionStats(
      updatedCompanion,
      trainerLevel,
      trainerCharisma
    );
    onSave(recalculated);
    onClose();
  }, [companion, draft, trainerLevel, trainerCharisma, onSave, onClose]);

  const handleConfirmReset = useCallback(() => {
    const restored = revertCompanionToOriginal(
      companion,
      trainerLevel,
      trainerCharisma
    );
    setDraft(buildInitialDraft(restored));
    setConfirmResetOpen(false);
  }, [companion, trainerLevel, trainerCharisma]);

  const hasOverrides = Object.keys(draft.overrides).length > 0;
  const canReset = !!companion.originalAutoState;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='md'
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle>
        <Stack
          direction='row'
          alignItems='center'
          justifyContent='space-between'
        >
          <Stack direction='row' alignItems='center' spacing={1}>
            <Typography variant='h6' fontWeight='bold'>
              Editar Melhor Amigo
            </Typography>
            {hasOverrides && (
              <Chip
                size='small'
                color='warning'
                label='Edições manuais'
                variant='outlined'
              />
            )}
          </Stack>
          <Stack direction='row' alignItems='center' spacing={0.5}>
            <Tooltip
              title={
                canReset
                  ? 'Restaurar valores originais (mantém PV de combate)'
                  : 'Sem estado original disponível'
              }
            >
              <span>
                <IconButton
                  size='small'
                  onClick={() => setConfirmResetOpen(true)}
                  disabled={!canReset}
                  color='warning'
                >
                  <RestartAltIcon />
                </IconButton>
              </span>
            </Tooltip>
            <IconButton size='small' onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </Stack>
        <Tabs
          value={activeTab}
          onChange={(_, idx) => setActiveTab(idx)}
          variant='scrollable'
          scrollButtons='auto'
          sx={{ mt: 1 }}
        >
          <Tab label='Geral' />
          <Tab label='Combate' />
          <Tab label='Armas Naturais' />
          <Tab label='Perícias' />
          <Tab label='Truques' />
          <Tab label='Magias' />
          <Tab label='Outros' />
        </Tabs>
      </DialogTitle>
      <DialogContent dividers>
        {activeTab === 0 && (
          <GeneralTab
            draft={draft}
            setDraft={setDraft}
            autoSnapshot={autoStateForDisplay}
            updateOverride={updateOverride}
            clearOverride={clearOverride}
          />
        )}
        {activeTab === 1 && (
          <CombatTab
            draft={draft}
            autoSnapshot={autoStateForDisplay}
            updateOverride={updateOverride}
            clearOverride={clearOverride}
          />
        )}
        {activeTab === 2 && (
          <NaturalWeaponsTab
            draft={draft}
            setDraft={setDraft}
            autoSnapshot={autoStateForDisplay}
            updateOverride={updateOverride}
            clearOverride={clearOverride}
          />
        )}
        {activeTab === 3 && (
          <SkillsTab
            draft={draft}
            setDraft={setDraft}
            previewCompanion={previewCompanion}
            autoSnapshot={autoStateForDisplay}
            updateOverride={updateOverride}
            clearOverride={clearOverride}
          />
        )}
        {activeTab === 4 && (
          <TricksTab
            draft={draft}
            setDraft={setDraft}
            trainerLevel={trainerLevel}
          />
        )}
        {activeTab === 5 && <SpellsTab previewCompanion={previewCompanion} />}
        {activeTab === 6 && (
          <OtherTab
            previewCompanion={previewCompanion}
            autoSnapshot={autoStateForDisplay}
            updateOverride={updateOverride}
            clearOverride={clearOverride}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='inherit'>
          Cancelar
        </Button>
        <Button onClick={handleSave} variant='contained' color='primary'>
          Salvar
        </Button>
      </DialogActions>

      <Dialog
        open={confirmResetOpen}
        onClose={() => setConfirmResetOpen(false)}
        maxWidth='xs'
      >
        <DialogTitle>Restaurar valores originais?</DialogTitle>
        <DialogContent>
          <Typography variant='body2'>
            Todas as edições manuais serão revertidas para os valores
            auto-gerados. O tracking de PV de combate (PV atual, PV temporário e
            incremento de PV) será preservado.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmResetOpen(false)} color='inherit'>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmReset}
            variant='contained'
            color='warning'
          >
            Restaurar
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

// ============================================================================
// Tab: Geral
// ============================================================================
const GeneralTab: React.FC<{
  draft: DraftState;
  setDraft: React.Dispatch<React.SetStateAction<DraftState>>;
  autoSnapshot?: CompanionSheet['originalAutoState'];
  updateOverride: <K extends keyof CompanionManualOverrides>(
    key: K,
    value: CompanionManualOverrides[K] | undefined
  ) => void;
  clearOverride: (key: keyof CompanionManualOverrides) => void;
}> = ({ draft, setDraft, autoSnapshot, updateOverride, clearOverride }) => {
  const autoAttrs = autoSnapshot?.attributes;
  const overrideAttrs = draft.overrides.attributes;
  const displayAttrs: Record<Atributo, number> = overrideAttrs ||
    autoAttrs || {
      [Atributo.FORCA]: 0,
      [Atributo.DESTREZA]: 0,
      [Atributo.CONSTITUICAO]: 0,
      [Atributo.INTELIGENCIA]: 0,
      [Atributo.SABEDORIA]: 0,
      [Atributo.CARISMA]: 0,
    };
  const hasAttrOverride = overrideAttrs !== undefined;

  const updateAttr = (attr: Atributo, value: number) => {
    const next = { ...displayAttrs, [attr]: value };
    updateOverride('attributes', next);
  };

  return (
    <Stack spacing={2}>
      <TextField
        label='Nome'
        value={draft.name || ''}
        onChange={(e) =>
          setDraft((p) => ({ ...p, name: e.target.value || undefined }))
        }
        size='small'
        fullWidth
      />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <FormControl size='small' fullWidth>
          <InputLabel>Tipo</InputLabel>
          <Select
            label='Tipo'
            value={draft.companionType}
            onChange={(e) =>
              setDraft((p) => ({
                ...p,
                companionType: e.target.value as CompanionType,
                spiritEnergyType:
                  e.target.value === 'Espírito'
                    ? p.spiritEnergyType
                    : undefined,
              }))
            }
          >
            {COMPANION_TYPES.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size='small' fullWidth>
          <InputLabel>Tamanho</InputLabel>
          <Select
            label='Tamanho'
            value={draft.size}
            onChange={(e) =>
              setDraft((p) => ({ ...p, size: e.target.value as CompanionSize }))
            }
          >
            {ALL_SIZES.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
      {draft.companionType === 'Espírito' && (
        <FormControl size='small' fullWidth>
          <InputLabel>Energia espiritual</InputLabel>
          <Select
            label='Energia espiritual'
            value={draft.spiritEnergyType || 'Positiva'}
            onChange={(e) =>
              setDraft((p) => ({
                ...p,
                spiritEnergyType: e.target.value as SpiritEnergyType,
              }))
            }
          >
            <MenuItem value='Positiva'>Positiva</MenuItem>
            <MenuItem value='Negativa'>Negativa</MenuItem>
          </Select>
        </FormControl>
      )}
      <FormControlLabel
        control={
          <Switch
            checked={!!draft.treinoIntensivo}
            onChange={(e) =>
              setDraft((p) => ({ ...p, treinoIntensivo: e.target.checked }))
            }
          />
        }
        label='Treino Intensivo (Treinador nível 5+)'
      />
      <Divider />
      <Stack direction='row' justifyContent='space-between' alignItems='center'>
        <Typography variant='subtitle2' fontWeight='bold'>
          Atributos
        </Typography>
        {hasAttrOverride && (
          <Button
            size='small'
            startIcon={<RestartAltIcon />}
            onClick={() => clearOverride('attributes')}
          >
            Restaurar auto
          </Button>
        )}
      </Stack>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(3, 1fr)', sm: 'repeat(6, 1fr)' },
          gap: 1,
        }}
      >
        {[
          Atributo.FORCA,
          Atributo.DESTREZA,
          Atributo.CONSTITUICAO,
          Atributo.INTELIGENCIA,
          Atributo.SABEDORIA,
          Atributo.CARISMA,
        ].map((attr) => (
          <TextField
            key={attr}
            label={ATTR_ABBREVIATIONS[attr]}
            type='number'
            size='small'
            value={displayAttrs[attr]}
            onChange={(e) =>
              updateAttr(attr, parseInt(e.target.value, 10) || 0)
            }
            InputProps={{
              sx: hasAttrOverride ? { borderColor: 'warning.main' } : undefined,
            }}
          />
        ))}
      </Box>
      {autoAttrs && hasAttrOverride && (
        <Typography variant='caption' color='text.secondary'>
          Valores automáticos:{' '}
          {[
            Atributo.FORCA,
            Atributo.DESTREZA,
            Atributo.CONSTITUICAO,
            Atributo.INTELIGENCIA,
            Atributo.SABEDORIA,
            Atributo.CARISMA,
          ]
            .map(
              (a) =>
                `${ATTR_ABBREVIATIONS[a]} ${autoAttrs[a] >= 0 ? '+' : ''}${
                  autoAttrs[a]
                }`
            )
            .join(' · ')}
        </Typography>
      )}
    </Stack>
  );
};

// ============================================================================
// Tab: Combate
// ============================================================================
const OverrideNumberField: React.FC<{
  label: string;
  autoValue: number | undefined;
  overrideValue: number | undefined;
  onChange: (v: number | undefined) => void;
  onClear: () => void;
}> = ({ label, autoValue, overrideValue, onChange, onClear }) => {
  const hasOverride = overrideValue !== undefined;
  const displayValue = hasOverride ? overrideValue : autoValue ?? 0;
  return (
    <Stack direction='row' alignItems='center' spacing={1}>
      <TextField
        label={label}
        type='number'
        size='small'
        value={displayValue}
        onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
        fullWidth
        helperText={
          hasOverride && autoValue !== undefined
            ? `Auto: ${autoValue}`
            : undefined
        }
      />
      {hasOverride && (
        <Tooltip title='Restaurar valor automático'>
          <IconButton size='small' onClick={onClear}>
            <RestartAltIcon fontSize='small' />
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  );
};

const CombatTab: React.FC<{
  draft: DraftState;
  autoSnapshot?: CompanionSheet['originalAutoState'];
  updateOverride: <K extends keyof CompanionManualOverrides>(
    key: K,
    value: CompanionManualOverrides[K] | undefined
  ) => void;
  clearOverride: (key: keyof CompanionManualOverrides) => void;
}> = ({ draft, autoSnapshot, updateOverride, clearOverride }) => {
  const move = draft.overrides.movementTypes || autoSnapshot?.movementTypes;
  const hasMovementOverride = draft.overrides.movementTypes !== undefined;

  return (
    <Stack spacing={2}>
      <OverrideNumberField
        label='PV máximo'
        autoValue={autoSnapshot?.pv}
        overrideValue={draft.overrides.pv}
        onChange={(v) => updateOverride('pv', v)}
        onClear={() => clearOverride('pv')}
      />
      <OverrideNumberField
        label='Defesa'
        autoValue={autoSnapshot?.defesa}
        overrideValue={draft.overrides.defesa}
        onChange={(v) => updateOverride('defesa', v)}
        onClear={() => clearOverride('defesa')}
      />
      <OverrideNumberField
        label='Deslocamento'
        autoValue={autoSnapshot?.displacement}
        overrideValue={draft.overrides.displacement}
        onChange={(v) => updateOverride('displacement', v)}
        onClear={() => clearOverride('displacement')}
      />
      <OverrideNumberField
        label='Redução de Dano'
        autoValue={autoSnapshot?.reducaoDeDano ?? 0}
        overrideValue={draft.overrides.reducaoDeDano}
        onChange={(v) =>
          updateOverride('reducaoDeDano', v === 0 ? undefined : v)
        }
        onClear={() => clearOverride('reducaoDeDano')}
      />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <OverrideNumberField
          label='Bônus de ataque'
          autoValue={autoSnapshot?.attackBonus ?? 0}
          overrideValue={draft.overrides.attackBonus}
          onChange={(v) => updateOverride('attackBonus', v)}
          onClear={() => clearOverride('attackBonus')}
        />
        <OverrideNumberField
          label='Bônus de dano'
          autoValue={autoSnapshot?.damageBonus ?? 0}
          overrideValue={draft.overrides.damageBonus}
          onChange={(v) => updateOverride('damageBonus', v)}
          onClear={() => clearOverride('damageBonus')}
        />
      </Stack>
      <Divider />
      <Stack direction='row' alignItems='center' justifyContent='space-between'>
        <Typography variant='subtitle2' fontWeight='bold'>
          Tipos de movimento
        </Typography>
        {hasMovementOverride && (
          <Button
            size='small'
            startIcon={<RestartAltIcon />}
            onClick={() => clearOverride('movementTypes')}
          >
            Restaurar auto
          </Button>
        )}
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          label='Voo'
          type='number'
          size='small'
          value={move?.voo ?? 0}
          onChange={(e) =>
            updateOverride('movementTypes', {
              ...(move || {}),
              voo: parseInt(e.target.value, 10) || 0,
            })
          }
        />
        <TextField
          label='Escalada'
          type='number'
          size='small'
          value={move?.escalada ?? 0}
          onChange={(e) =>
            updateOverride('movementTypes', {
              ...(move || {}),
              escalada: parseInt(e.target.value, 10) || 0,
            })
          }
        />
        <TextField
          label='Natação'
          type='number'
          size='small'
          value={move?.natacao ?? 0}
          onChange={(e) =>
            updateOverride('movementTypes', {
              ...(move || {}),
              natacao: parseInt(e.target.value, 10) || 0,
            })
          }
        />
      </Stack>
    </Stack>
  );
};

// ============================================================================
// Tab: Armas Naturais
// ============================================================================
const NaturalWeaponsTab: React.FC<{
  draft: DraftState;
  setDraft: React.Dispatch<React.SetStateAction<DraftState>>;
  autoSnapshot?: CompanionSheet['originalAutoState'];
  updateOverride: <K extends keyof CompanionManualOverrides>(
    key: K,
    value: CompanionManualOverrides[K] | undefined
  ) => void;
  clearOverride: (key: keyof CompanionManualOverrides) => void;
}> = ({ draft, setDraft, autoSnapshot, updateOverride, clearOverride }) => {
  const weapons =
    draft.overrides.naturalWeapons || autoSnapshot?.naturalWeapons || [];
  const hasOverride = draft.overrides.naturalWeapons !== undefined;

  const setWeapons = (next: CompanionNaturalWeapon[]) => {
    updateOverride('naturalWeapons', next);
  };

  return (
    <Stack spacing={2}>
      <Stack direction='row' alignItems='center' justifyContent='space-between'>
        <FormControl size='small' sx={{ minWidth: 200 }}>
          <InputLabel>Tipo de dano (principal)</InputLabel>
          <Select
            label='Tipo de dano (principal)'
            value={draft.baseDamageType}
            onChange={(e) =>
              setDraft((p) => ({
                ...p,
                baseDamageType: e.target.value as NaturalWeaponDamageType,
              }))
            }
          >
            {COMPANION_WEAPON_DAMAGE_TYPES.map((d) => (
              <MenuItem key={d} value={d}>
                {d}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {hasOverride && (
          <Button
            size='small'
            startIcon={<RestartAltIcon />}
            onClick={() => clearOverride('naturalWeapons')}
          >
            Restaurar lista auto
          </Button>
        )}
      </Stack>
      <Typography variant='caption' color='text.secondary'>
        O tipo de dano principal alimenta o cálculo automático das armas
        naturais. Editar a lista abaixo cria um override que substitui toda a
        lista auto-gerada.
      </Typography>
      <Divider />
      <Stack spacing={1}>
        {weapons.map((w, idx) => (
          <Stack
            // eslint-disable-next-line react/no-array-index-key
            key={idx}
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            alignItems='center'
          >
            <FormControl size='small' sx={{ minWidth: 130 }}>
              <InputLabel>Dano</InputLabel>
              <Select
                label='Dano'
                value={w.damageType}
                onChange={(e) => {
                  const next = [...weapons];
                  next[idx] = {
                    ...w,
                    damageType: e.target.value as NaturalWeaponDamageType,
                  };
                  setWeapons(next);
                }}
              >
                {COMPANION_WEAPON_DAMAGE_TYPES.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label='Dado'
              size='small'
              value={w.damageDice}
              onChange={(e) => {
                const next = [...weapons];
                next[idx] = { ...w, damageDice: e.target.value };
                setWeapons(next);
              }}
              sx={{ minWidth: 90 }}
            />
            <TextField
              label='Crítico (x)'
              type='number'
              size='small'
              value={w.criticalMultiplier}
              onChange={(e) => {
                const next = [...weapons];
                next[idx] = {
                  ...w,
                  criticalMultiplier: parseInt(e.target.value, 10) || 2,
                };
                setWeapons(next);
              }}
              sx={{ minWidth: 90 }}
            />
            <TextField
              label='Margem'
              type='number'
              size='small'
              value={w.threatMargin}
              onChange={(e) => {
                const next = [...weapons];
                next[idx] = {
                  ...w,
                  threatMargin: parseInt(e.target.value, 10) || 20,
                };
                setWeapons(next);
              }}
              sx={{ minWidth: 90 }}
            />
            <IconButton
              size='small'
              color='error'
              onClick={() => {
                const next = weapons.filter((_, i) => i !== idx);
                setWeapons(next);
              }}
            >
              <DeleteOutlineIcon fontSize='small' />
            </IconButton>
          </Stack>
        ))}
        <Button
          size='small'
          startIcon={<AddIcon />}
          onClick={() =>
            setWeapons([
              ...weapons,
              {
                damageType: draft.baseDamageType,
                damageDice: '1d6',
                criticalMultiplier: 2,
                threatMargin: 20,
              },
            ])
          }
        >
          Adicionar arma
        </Button>
      </Stack>
    </Stack>
  );
};

// ============================================================================
// Tab: Perícias
// ============================================================================
const SkillsTab: React.FC<{
  draft: DraftState;
  setDraft: React.Dispatch<React.SetStateAction<DraftState>>;
  previewCompanion: CompanionSheet;
  autoSnapshot?: CompanionSheet['originalAutoState'];
  updateOverride: <K extends keyof CompanionManualOverrides>(
    key: K,
    value: CompanionManualOverrides[K] | undefined
  ) => void;
  clearOverride: (key: keyof CompanionManualOverrides) => void;
}> = ({
  draft,
  setDraft,
  previewCompanion,
  autoSnapshot,
  updateOverride,
  clearOverride,
}) => {
  const finalSkills =
    draft.overrides.skills || previewCompanion.skills || autoSnapshot?.skills;
  const hasOverride = draft.overrides.skills !== undefined;

  return (
    <Stack spacing={2}>
      <Typography variant='subtitle2' fontWeight='bold'>
        Perícias escolhidas (input base)
      </Typography>
      <Autocomplete
        multiple
        size='small'
        options={COMPANION_AVAILABLE_SKILLS}
        value={draft.baseSkills}
        onChange={(_, val) => setDraft((p) => ({ ...p, baseSkills: val }))}
        renderInput={(params) => (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <TextField {...params} label='Perícias escolhidas' />
        )}
      />
      <Divider />
      <Stack direction='row' alignItems='center' justifyContent='space-between'>
        <Typography variant='subtitle2' fontWeight='bold'>
          Perícias treinadas finais (output)
        </Typography>
        {hasOverride && (
          <Button
            size='small'
            startIcon={<RestartAltIcon />}
            onClick={() => clearOverride('skills')}
          >
            Restaurar auto
          </Button>
        )}
      </Stack>
      <Typography variant='caption' color='text.secondary'>
        A lista abaixo é a final (após processamento automático de truques e
        bônus do tipo). Edite para sobrescrever totalmente.
      </Typography>
      <Autocomplete
        multiple
        size='small'
        options={Object.values(Skill)}
        value={finalSkills || []}
        onChange={(_, val) => updateOverride('skills', val as Skill[])}
        renderInput={(params) => (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <TextField {...params} label='Perícias treinadas (final)' />
        )}
      />
    </Stack>
  );
};

// ============================================================================
// Tab: Truques
// ============================================================================
const TricksTab: React.FC<{
  draft: DraftState;
  setDraft: React.Dispatch<React.SetStateAction<DraftState>>;
  trainerLevel: number;
}> = ({ draft, setDraft, trainerLevel }) => {
  // Contar armas naturais aproximadamente
  const naturalWeaponCount = 1;

  const availableToAdd = useMemo(
    () =>
      getAvailableTricks(
        trainerLevel,
        draft.companionType,
        draft.size,
        draft.tricks,
        naturalWeaponCount,
        false
      ),
    [trainerLevel, draft.companionType, draft.size, draft.tricks]
  );

  const removeTrick = (idx: number) => {
    setDraft((p) => ({
      ...p,
      tricks: p.tricks.filter((_, i) => i !== idx),
    }));
  };

  const addTrick = (trickName: string) => {
    setDraft((p) => ({ ...p, tricks: [...p.tricks, { name: trickName }] }));
  };

  return (
    <Stack spacing={2}>
      <Typography variant='caption' color='text.secondary'>
        Modificar truques recalcula automaticamente atributos, PV, defesa e
        outros derivados (a menos que estejam sobrescritos manualmente).
      </Typography>
      <Stack spacing={1}>
        {draft.tricks.length === 0 && (
          <Typography variant='body2' color='text.secondary'>
            Nenhum truque.
          </Typography>
        )}
        {draft.tricks.map((trick, idx) => {
          const def = getCompanionTrickDefinition(trick.name);
          return (
            <Stack
              // eslint-disable-next-line react/no-array-index-key
              key={`${trick.name}-${idx}`}
              direction='row'
              alignItems='flex-start'
              spacing={1}
              sx={{
                p: 1,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <Box flex={1}>
                <Typography variant='body2' fontWeight='bold'>
                  {trick.name}
                </Typography>
                {trick.choices && Object.keys(trick.choices).length > 0 && (
                  <Typography variant='caption' color='text.secondary'>
                    Escolhas:{' '}
                    {Object.entries(trick.choices)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(', ')}
                  </Typography>
                )}
                {def?.text && (
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    sx={{ display: 'block', mt: 0.5 }}
                  >
                    {def.text}
                  </Typography>
                )}
              </Box>
              <IconButton
                size='small'
                color='error'
                onClick={() => removeTrick(idx)}
              >
                <DeleteOutlineIcon fontSize='small' />
              </IconButton>
            </Stack>
          );
        })}
      </Stack>
      <Divider />
      <FormControl size='small' fullWidth>
        <InputLabel>Adicionar truque</InputLabel>
        <Select
          label='Adicionar truque'
          value=''
          onChange={(e) => {
            if (e.target.value) addTrick(e.target.value as string);
          }}
        >
          {availableToAdd.length === 0 && (
            <MenuItem value='' disabled>
              Nenhum disponível
            </MenuItem>
          )}
          {availableToAdd.map((t) => (
            <MenuItem key={t.name} value={t.name}>
              {t.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Typography variant='caption' color='text.secondary'>
        Truques com sub-escolhas (atributo, movimento, etc.) são adicionados sem
        escolha — edite manualmente após adicionar se necessário.
      </Typography>
    </Stack>
  );
};

// ============================================================================
// Tab: Magias
// ============================================================================
const SpellsTab: React.FC<{
  previewCompanion: CompanionSheet;
}> = ({ previewCompanion }) => {
  const spells = previewCompanion.spells || [];
  return (
    <Stack spacing={2}>
      <Typography variant='caption' color='text.secondary'>
        Magias do parceiro são gerenciadas pelo fluxo de Ensinar Truque com sub
        escolha de magia. Aqui você pode visualizá-las.
      </Typography>
      {spells.length === 0 && (
        <Typography variant='body2' color='text.secondary'>
          Nenhuma magia.
        </Typography>
      )}
      {spells.map((s, idx) => (
        <Box
          // eslint-disable-next-line react/no-array-index-key
          key={`${s.nome}-${idx}`}
          sx={{
            p: 1,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
          }}
        >
          <Typography variant='body2' fontWeight='bold'>
            {s.nome}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            {s.spellCircle} · {s.school}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
};

// ============================================================================
// Tab: Outros (sentidos, imunidades, proficiências)
// ============================================================================
const StringListEditor: React.FC<{
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  hasOverride: boolean;
  onClear: () => void;
}> = ({ label, values, onChange, hasOverride, onClear }) => {
  const [newItem, setNewItem] = useState('');
  return (
    <Stack spacing={1}>
      <Stack direction='row' alignItems='center' justifyContent='space-between'>
        <Typography variant='subtitle2' fontWeight='bold'>
          {label}
        </Typography>
        {hasOverride && (
          <Button size='small' startIcon={<RestartAltIcon />} onClick={onClear}>
            Restaurar auto
          </Button>
        )}
      </Stack>
      <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
        {values.map((v, idx) => (
          <Chip
            // eslint-disable-next-line react/no-array-index-key
            key={`${v}-${idx}`}
            label={v}
            size='small'
            onDelete={() => onChange(values.filter((_, i) => i !== idx))}
          />
        ))}
      </Stack>
      <Stack direction='row' spacing={1}>
        <TextField
          size='small'
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder='Adicionar...'
          fullWidth
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newItem.trim()) {
              onChange([...values, newItem.trim()]);
              setNewItem('');
            }
          }}
        />
        <Button
          size='small'
          variant='outlined'
          onClick={() => {
            if (newItem.trim()) {
              onChange([...values, newItem.trim()]);
              setNewItem('');
            }
          }}
        >
          Adicionar
        </Button>
      </Stack>
    </Stack>
  );
};

const OtherTab: React.FC<{
  previewCompanion: CompanionSheet;
  autoSnapshot?: CompanionSheet['originalAutoState'];
  updateOverride: <K extends keyof CompanionManualOverrides>(
    key: K,
    value: CompanionManualOverrides[K] | undefined
  ) => void;
  clearOverride: (key: keyof CompanionManualOverrides) => void;
}> = ({ previewCompanion, autoSnapshot, updateOverride, clearOverride }) => {
  const senses = previewCompanion.senses || [];
  const immunities = previewCompanion.immunities || [];
  const proficiencies = previewCompanion.proficiencies || [];

  return (
    <Stack spacing={3}>
      <StringListEditor
        label='Sentidos'
        values={senses}
        onChange={(v) => updateOverride('senses', v)}
        hasOverride={previewCompanion.manualOverrides?.senses !== undefined}
        onClear={() => clearOverride('senses')}
      />
      <Divider />
      <StringListEditor
        label='Imunidades'
        values={immunities}
        onChange={(v) => updateOverride('immunities', v)}
        hasOverride={previewCompanion.manualOverrides?.immunities !== undefined}
        onClear={() => clearOverride('immunities')}
      />
      <Divider />
      <StringListEditor
        label='Proficiências'
        values={proficiencies}
        onChange={(v) => updateOverride('proficiencies', v)}
        hasOverride={
          previewCompanion.manualOverrides?.proficiencies !== undefined
        }
        onClear={() => clearOverride('proficiencies')}
      />
      {autoSnapshot && (
        <Box>
          <Typography variant='caption' color='text.secondary'>
            Valores automáticos: sentidos [
            {autoSnapshot.senses?.join(', ') || '—'}
            ]; imunidades [{autoSnapshot.immunities?.join(', ') || '—'}];
            proficiências [{autoSnapshot.proficiencies?.join(', ') || '—'}].
          </Typography>
        </Box>
      )}
    </Stack>
  );
};

export default CompanionEditDialog;
