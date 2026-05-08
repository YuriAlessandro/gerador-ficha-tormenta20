import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Casino as RollsIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  RestartAlt as ResetIcon,
} from '@mui/icons-material';

import Equipment, {
  AppliedEnchantment,
  AppliedModification,
  DamageAttribute,
  DAMAGE_TYPES,
  DamageType,
  DefenseEquipment,
  ExtraDamage,
  WeaponAction,
} from '../../../interfaces/Equipment';
import { resolveDamageAttribute } from '../../../functions/weaponSkill';
import { Atributo } from '../../../data/systems/tormenta20/atributos';
import Skill from '../../../interfaces/Skills';
import { DiceRoll } from '../../../interfaces/DiceRoll';
import { ItemE, ItemMod } from '../../../interfaces/Rewards';
import { useAuth } from '../../../hooks/useAuth';
import { SupplementId } from '../../../types/supplement.types';
import { applyItemEnhancements } from '../../../functions/itemEnhancements/applyEnhancements';
import {
  armorEnchantments,
  weaponsEnchantments,
} from '../../../data/rewards/items';
import RollsEditDialog from '../../RollsEditDialog';
import ItemModificationsEditor, {
  ModificationItemType,
} from './ItemModificationsEditor';
import ItemEnchantmentsEditor, {
  EnchantmentItemType,
} from './ItemEnchantmentsEditor';
import { isDefenseGroup } from './equipmentCatalog';

const DAMAGE_ATTRIBUTE_OPTIONS: DamageAttribute[] = [
  Atributo.FORCA,
  Atributo.DESTREZA,
  Atributo.CONSTITUICAO,
  Atributo.INTELIGENCIA,
  Atributo.SABEDORIA,
  Atributo.CARISMA,
  'Nenhum',
];

export interface ItemEditorDialogProps {
  open: boolean;
  onClose: () => void;
  item: Equipment | null;
  onSave: (next: Equipment) => void;
}

type TabKey = 'geral' | 'stats' | 'modificacoes' | 'encantamentos';

const ALL_SKILLS = Object.values(Skill);

function modItemTypeFor(item: Equipment): ModificationItemType | null {
  if (item.group === 'Arma') return 'weapon';
  if (item.group === 'Armadura') return 'armor';
  if (item.group === 'Escudo') return 'shield';
  return null;
}

function enchItemTypeFor(item: Equipment): EnchantmentItemType | null {
  if (item.group === 'Arma') return 'weapon';
  if (item.group === 'Armadura') return 'armor';
  if (item.group === 'Escudo') return 'shield';
  return null;
}

function findEnchantmentByName(name: string): ItemE | undefined {
  return (
    weaponsEnchantments.find((e) => e.enchantment === name) ||
    armorEnchantments.find((e) => e.enchantment === name)
  );
}

function buildInitial(item: Equipment | null) {
  const initialMods: ItemMod[] = (item?.modifications ?? []).map((m) => ({
    min: 0,
    max: 0,
    mod: m.mod,
  }));
  const initialEnchantments: ItemE[] = (item?.enchantments ?? [])
    .map((e) => findEnchantmentByName(e.enchantment))
    .filter((e): e is ItemE => e !== undefined);
  const materialEntry = item?.modifications?.find(
    (m) => m.mod === 'Material especial'
  );
  const conjuradoraEntry = item?.enchantments?.find(
    (e) => e.enchantment === 'Conjuradora'
  );
  const baseDamageAttribute: DamageAttribute = item
    ? resolveDamageAttribute(item)
    : 'Nenhum';
  const actionDamageAttributes: Record<string, DamageAttribute> = {};
  (item?.specialActions ?? []).forEach((action) => {
    actionDamageAttributes[action.id] = resolveDamageAttribute(
      item as Equipment,
      action
    );
  });
  return {
    customDisplayName: item?.customDisplayName ?? '',
    quantityText: String(item?.quantity ?? 1),
    spacesText: item?.spaces !== undefined ? String(item.spaces) : '',
    descricao: item?.descricao ?? '',
    rolls: (item?.rolls as DiceRoll[]) ?? [],
    danoText: item?.dano ?? '',
    atkBonusText: item?.atkBonus !== undefined ? String(item.atkBonus) : '0',
    criticoText: item?.critico ?? 'x2',
    customSkill: (item?.customSkill ?? '') as Skill | '',
    damageAttribute: baseDamageAttribute,
    actionDamageAttributes,
    defenseBonusText:
      item && isDefenseGroup(item.group)
        ? String((item as DefenseEquipment).defenseBonus)
        : '0',
    armorPenaltyText:
      item && isDefenseGroup(item.group)
        ? String((item as DefenseEquipment).armorPenalty)
        : '0',
    isHeavyArmor:
      item && item.group === 'Armadura'
        ? (item as DefenseEquipment).isHeavyArmor ?? false
        : false,
    selectedModifications: initialMods,
    selectedMaterial: materialEntry?.specialMaterial ?? '',
    selectedEnchantments: initialEnchantments,
    selectedConjuradoraSpell: conjuradoraEntry?.selectedSpell ?? '',
    userExtraDamage: (item?.extraDamage ?? [])
      .filter((e) => e.source === 'user')
      .map((e) => ({
        id: e.id ?? crypto.randomUUID(),
        dice: e.dice,
        damageType: e.damageType,
        source: 'user' as const,
      })),
  };
}

const ItemEditorDialog: React.FC<ItemEditorDialogProps> = ({
  open,
  onClose,
  item,
  onSave,
}) => {
  const [tab, setTab] = useState<TabKey>('geral');
  const [form, setForm] = useState(buildInitial(item));
  const [rollsOpen, setRollsOpen] = useState(false);
  const [modError, setModError] = useState('');
  const [enchError, setEnchError] = useState('');
  const { user } = useAuth();
  const userSupplements: SupplementId[] = user?.enabledSupplements ?? [
    SupplementId.TORMENTA20_CORE,
  ];

  useEffect(() => {
    if (open) {
      setForm(buildInitial(item));
      setTab('geral');
      setModError('');
      setEnchError('');
    }
  }, [open, item]);

  const isWeapon = item?.group === 'Arma';
  const isDefense = item ? isDefenseGroup(item.group) : false;
  const hasStatsTab = isWeapon || isDefense;
  const modItemType = item ? modItemTypeFor(item) : null;
  const hasModificationsTab = modItemType !== null;
  const enchItemType = item ? enchItemTypeFor(item) : null;
  const hasEnchantmentsTab = enchItemType !== null;

  const baseSnapshot = useMemo(() => {
    if (!item) return null;
    return {
      dano: item.baseDano ?? item.dano ?? '',
      atkBonus: item.baseAtkBonus ?? item.atkBonus ?? 0,
      critico: item.baseCritico ?? item.critico ?? 'x2',
      defenseBonus: isDefense
        ? (item as DefenseEquipment).baseDefenseBonus ??
          (item as DefenseEquipment).defenseBonus
        : 0,
      armorPenalty: isDefense
        ? (item as DefenseEquipment).baseArmorPenalty ??
          (item as DefenseEquipment).armorPenalty
        : 0,
    };
  }, [item, isDefense]);

  if (!item) return null;

  const handleResetToBase = () => {
    if (!baseSnapshot) return;
    setForm((f) => ({
      ...f,
      danoText: baseSnapshot.dano,
      atkBonusText: String(baseSnapshot.atkBonus),
      criticoText: baseSnapshot.critico,
      defenseBonusText: String(baseSnapshot.defenseBonus),
      armorPenaltyText: String(baseSnapshot.armorPenalty),
    }));
  };

  const handleSave = () => {
    const quantity = Math.max(1, parseInt(form.quantityText, 10) || 1);
    const spaces =
      form.spacesText === ''
        ? item.spaces
        : parseFloat(form.spacesText.replace(',', '.'));

    const persistedMods: AppliedModification[] = form.selectedModifications.map(
      (m) => ({
        mod: m.mod,
        specialMaterial:
          m.mod === 'Material especial' ? form.selectedMaterial : undefined,
      })
    );

    const persistedEnchantments: AppliedEnchantment[] =
      form.selectedEnchantments.map((e) => ({
        enchantment: e.enchantment,
        selectedSpell:
          e.enchantment === 'Conjuradora' && form.selectedConjuradoraSpell
            ? form.selectedConjuradoraSpell
            : undefined,
      }));

    const persistedUserExtraDamage: ExtraDamage[] = form.userExtraDamage
      .filter((e) => e.dice.trim().length > 0)
      .map((e) => ({
        id: e.id,
        dice: e.dice.trim(),
        damageType: e.damageType,
        source: 'user' as const,
      }));

    const next: Equipment = {
      ...item,
      customDisplayName: form.customDisplayName.trim() || undefined,
      quantity,
      spaces,
      descricao: form.descricao.trim() || undefined,
      rolls: form.rolls.length > 0 ? form.rolls : undefined,
      modifications: persistedMods.length > 0 ? persistedMods : undefined,
      enchantments:
        persistedEnchantments.length > 0 ? persistedEnchantments : undefined,
      // Replace user extra damage; derived entries are regenerated by
      // applyItemEnhancements below.
      extraDamage:
        persistedUserExtraDamage.length > 0
          ? persistedUserExtraDamage
          : undefined,
    };

    if (isWeapon) {
      const atkBonus = parseInt(form.atkBonusText, 10);
      next.dano = form.danoText.trim() || item.dano;
      next.atkBonus = Number.isNaN(atkBonus) ? item.atkBonus : atkBonus;
      next.critico = form.criticoText.trim() || item.critico;
      next.customSkill = (form.customSkill || undefined) as Skill | undefined;
      next.damageAttribute = form.damageAttribute;
      if (item.specialActions && item.specialActions.length > 0) {
        next.specialActions = item.specialActions.map((action) => {
          const overridden = form.actionDamageAttributes[action.id];
          if (!overridden) return action;
          // Strip from the action when it matches the resolved-from-weapon
          // default — keeps the saved object clean.
          return { ...action, damageAttribute: overridden } as WeaponAction;
        });
      }
      const divergedFromBase =
        next.dano !== item.baseDano ||
        next.atkBonus !== item.baseAtkBonus ||
        next.critico !== item.baseCritico;
      if (divergedFromBase) next.hasManualEdits = true;
    }

    let finalItem: Equipment = next;

    if (isDefense) {
      const defenseBonus = parseInt(form.defenseBonusText, 10);
      const armorPenalty = parseInt(form.armorPenaltyText, 10);
      const defenseNext: DefenseEquipment = {
        ...(next as DefenseEquipment),
        defenseBonus: Number.isNaN(defenseBonus)
          ? (item as DefenseEquipment).defenseBonus
          : defenseBonus,
        armorPenalty: Number.isNaN(armorPenalty)
          ? (item as DefenseEquipment).armorPenalty
          : armorPenalty,
        isHeavyArmor: item.group === 'Armadura' ? form.isHeavyArmor : undefined,
      };
      const baseDef = item as DefenseEquipment;
      const divergedFromBase =
        defenseNext.defenseBonus !== baseDef.baseDefenseBonus ||
        defenseNext.armorPenalty !== baseDef.baseArmorPenalty;
      if (divergedFromBase) defenseNext.hasManualEdits = true;
      finalItem = defenseNext;
    }

    // Apply enhancement effects (numeric bonuses from mods + enchantments,
    // plus rebuilding extraDamage / specialActions / arremesso) on top of
    // manual edits. Pipeline is idempotent — when all enhancements are cleared
    // it restores stats from `base*` snapshots automatically.
    finalItem = applyItemEnhancements(finalItem);

    onSave(finalItem);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle sx={{ pr: 6 }}>
        Editar item
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
          aria-label='Fechar'
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant='scrollable'
          scrollButtons='auto'
          allowScrollButtonsMobile
          sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab value='geral' label='Geral' />
          {hasStatsTab && <Tab value='stats' label='Estatísticas' />}
          {hasModificationsTab && (
            <Tab value='modificacoes' label='Modificações' />
          )}
          {hasEnchantmentsTab && (
            <Tab value='encantamentos' label='Encantamentos' />
          )}
        </Tabs>

        {tab === 'geral' && (
          <Stack spacing={2}>
            <Typography variant='caption' color='text.secondary'>
              {item.group} · {item.nome}
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 8 }}>
                <TextField
                  label='Apelido (display name)'
                  fullWidth
                  value={form.customDisplayName}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      customDisplayName: e.target.value,
                    }))
                  }
                  helperText='Substitui o nome padrão na ficha quando preenchido.'
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 2 }}>
                <TextField
                  label='Quantidade'
                  fullWidth
                  value={form.quantityText}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      quantityText: e.target.value.replace(/[^0-9]/g, ''),
                    }))
                  }
                  inputProps={{ inputMode: 'numeric' }}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 2 }}>
                <TextField
                  label='Espaços'
                  fullWidth
                  value={form.spacesText}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, spacesText: e.target.value }))
                  }
                  inputProps={{ inputMode: 'decimal' }}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  label='Descrição'
                  fullWidth
                  multiline
                  minRows={2}
                  value={form.descricao}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, descricao: e.target.value }))
                  }
                />
              </Grid>
            </Grid>

            <Box>
              <Stack direction='row' alignItems='center' spacing={1}>
                <Typography variant='subtitle2'>
                  Rolagens ({form.rolls.length})
                </Typography>
                <Button
                  size='small'
                  startIcon={<RollsIcon />}
                  onClick={() => setRollsOpen(true)}
                >
                  Editar rolagens
                </Button>
              </Stack>
            </Box>
          </Stack>
        )}

        {tab === 'stats' && hasStatsTab && (
          <Stack spacing={2}>
            <Stack
              direction='row'
              justifyContent='space-between'
              alignItems='center'
            >
              <Typography variant='caption' color='text.secondary'>
                Edições manuais sobrescrevem os valores base do item.
              </Typography>
              <Tooltip title='Resetar para os valores base do item'>
                <Button
                  size='small'
                  startIcon={<ResetIcon />}
                  onClick={handleResetToBase}
                >
                  Resetar
                </Button>
              </Tooltip>
            </Stack>

            {isWeapon && (
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <TextField
                    label='Dano'
                    fullWidth
                    value={form.danoText}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, danoText: e.target.value }))
                    }
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <TextField
                    label='Bônus de Ataque'
                    fullWidth
                    value={form.atkBonusText}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, atkBonusText: e.target.value }))
                    }
                    inputProps={{ inputMode: 'numeric' }}
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <TextField
                    label='Crítico'
                    fullWidth
                    value={form.criticoText}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, criticoText: e.target.value }))
                    }
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>Perícia</InputLabel>
                    <Select
                      label='Perícia'
                      value={form.customSkill}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          customSkill: e.target.value as Skill,
                        }))
                      }
                    >
                      <MenuItem value=''>
                        <em>Padrão (Luta / Pontaria)</em>
                      </MenuItem>
                      {ALL_SKILLS.map((s) => (
                        <MenuItem key={s} value={s}>
                          {s}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>Atributo no dano</InputLabel>
                    <Select
                      label='Atributo no dano'
                      value={form.damageAttribute}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          damageAttribute: e.target.value as DamageAttribute,
                        }))
                      }
                    >
                      {DAMAGE_ATTRIBUTE_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                {item.specialActions && item.specialActions.length > 0 && (
                  <Grid size={{ xs: 12 }}>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{ display: 'block', mb: 0.5 }}
                    >
                      Atributo no dano por modo de ataque:
                    </Typography>
                    <Stack spacing={1}>
                      {item.specialActions.map((action) => (
                        <Stack
                          key={action.id}
                          direction='row'
                          spacing={1}
                          alignItems='center'
                        >
                          <Typography
                            variant='body2'
                            sx={{ flex: 1, minWidth: 0 }}
                          >
                            {action.label}
                          </Typography>
                          <FormControl size='small' sx={{ minWidth: 140 }}>
                            <Select
                              value={
                                form.actionDamageAttributes[action.id] ??
                                'Nenhum'
                              }
                              onChange={(e) =>
                                setForm((f) => ({
                                  ...f,
                                  actionDamageAttributes: {
                                    ...f.actionDamageAttributes,
                                    [action.id]: e.target
                                      .value as DamageAttribute,
                                  },
                                }))
                              }
                            >
                              {DAMAGE_ATTRIBUTE_OPTIONS.map((opt) => (
                                <MenuItem key={opt} value={opt}>
                                  {opt}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Stack>
                      ))}
                    </Stack>
                  </Grid>
                )}
              </Grid>
            )}

            {isWeapon && (
              <Box>
                <Stack
                  direction='row'
                  alignItems='center'
                  justifyContent='space-between'
                  sx={{ mb: 1 }}
                >
                  <Typography variant='subtitle2'>
                    Danos extras ({form.userExtraDamage.length})
                  </Typography>
                  <Button
                    size='small'
                    startIcon={<AddIcon />}
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        userExtraDamage: [
                          ...f.userExtraDamage,
                          {
                            id: crypto.randomUUID(),
                            dice: '1d6',
                            damageType: 'Fogo',
                            source: 'user',
                          },
                        ],
                      }))
                    }
                  >
                    Adicionar
                  </Button>
                </Stack>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ display: 'block', mb: 1 }}
                >
                  Cada entrada rola junto com o dano base no ataque (não crita).
                  Encantamentos como Flamejante adicionam linhas automaticamente
                  e não aparecem aqui.
                </Typography>
                <Stack spacing={1}>
                  {form.userExtraDamage.map((entry, idx) => (
                    <Stack
                      key={entry.id}
                      direction='row'
                      spacing={1}
                      alignItems='center'
                    >
                      <TextField
                        size='small'
                        label='Dado'
                        value={entry.dice}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            userExtraDamage: f.userExtraDamage.map((x, i) =>
                              i === idx ? { ...x, dice: e.target.value } : x
                            ),
                          }))
                        }
                        sx={{ width: 120 }}
                        placeholder='1d6'
                      />
                      <FormControl size='small' sx={{ flex: 1, minWidth: 120 }}>
                        <InputLabel>Tipo</InputLabel>
                        <Select
                          label='Tipo'
                          value={entry.damageType}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              userExtraDamage: f.userExtraDamage.map((x, i) =>
                                i === idx
                                  ? {
                                      ...x,
                                      damageType: e.target.value as DamageType,
                                    }
                                  : x
                              ),
                            }))
                          }
                        >
                          {DAMAGE_TYPES.map((t) => (
                            <MenuItem key={t} value={t}>
                              {t}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <IconButton
                        size='small'
                        aria-label='Remover dano extra'
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            userExtraDamage: f.userExtraDamage.filter(
                              (_, i) => i !== idx
                            ),
                          }))
                        }
                      >
                        <DeleteIcon fontSize='small' />
                      </IconButton>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            )}

            {isDefense && (
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <TextField
                    label='Bônus de Defesa'
                    fullWidth
                    value={form.defenseBonusText}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        defenseBonusText: e.target.value,
                      }))
                    }
                    inputProps={{ inputMode: 'numeric' }}
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <TextField
                    label='Penalidade de Armadura'
                    fullWidth
                    value={form.armorPenaltyText}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        armorPenaltyText: e.target.value,
                      }))
                    }
                    inputProps={{ inputMode: 'numeric' }}
                  />
                </Grid>
                {item.group === 'Armadura' && (
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={form.isHeavyArmor}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              isHeavyArmor: e.target.checked,
                            }))
                          }
                        />
                      }
                      label='Pesada'
                    />
                  </Grid>
                )}
              </Grid>
            )}
          </Stack>
        )}

        {tab === 'modificacoes' && hasModificationsTab && modItemType && (
          <Stack spacing={2}>
            <Typography variant='caption' color='text.secondary'>
              Modificações de item superior aplicam bônus numéricos
              automaticamente sobre os valores base do item. Custo máximo: 5
              pontos.
            </Typography>
            {modError && (
              <Typography variant='caption' color='error.main'>
                {modError}
              </Typography>
            )}
            <ItemModificationsEditor
              itemType={modItemType}
              selectedModifications={form.selectedModifications}
              onChange={(mods) =>
                setForm((f) => ({ ...f, selectedModifications: mods }))
              }
              selectedMaterial={form.selectedMaterial}
              onSelectedMaterialChange={(m) =>
                setForm((f) => ({ ...f, selectedMaterial: m }))
              }
              userSupplements={userSupplements}
              onError={setModError}
            />
          </Stack>
        )}

        {tab === 'encantamentos' && hasEnchantmentsTab && enchItemType && (
          <Stack spacing={2}>
            <Typography variant='caption' color='text.secondary'>
              Encantamentos mágicos aplicam bônus numéricos automaticamente
              sobre os valores base do item. Encantamentos descritivos (efeitos
              condicionais, dano elemental, resistências) ficam registrados no
              item mas não modificam stats. Custo máximo: 5 pontos.
            </Typography>
            {enchError && (
              <Typography variant='caption' color='error.main'>
                {enchError}
              </Typography>
            )}
            <ItemEnchantmentsEditor
              itemType={enchItemType}
              selectedEnchantments={form.selectedEnchantments}
              onChange={(ench) =>
                setForm((f) => ({ ...f, selectedEnchantments: ench }))
              }
              userSupplements={userSupplements}
              onError={setEnchError}
              selectedSpell={form.selectedConjuradoraSpell}
              onSelectedSpellChange={(spell) =>
                setForm((f) => ({ ...f, selectedConjuradoraSpell: spell }))
              }
            />
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant='contained' onClick={handleSave}>
          Salvar
        </Button>
      </DialogActions>

      <RollsEditDialog
        open={rollsOpen}
        onClose={() => setRollsOpen(false)}
        rolls={form.rolls}
        onSave={(rolls) => {
          setForm((f) => ({ ...f, rolls }));
          setRollsOpen(false);
        }}
        title={`Rolagens de ${item.nome}`}
      />
    </Dialog>
  );
};

export default ItemEditorDialog;
