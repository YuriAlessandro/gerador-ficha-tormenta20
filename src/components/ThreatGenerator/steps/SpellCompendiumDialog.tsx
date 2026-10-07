import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useAuth } from '@/hooks/useAuth';
import { normalizeSearch } from '@/functions/stringUtils';
import SpellAdvancedFilters from '@/components/SpellPicker/SpellAdvancedFilters';
import {
  SpellFilterState,
  EMPTY_SPELL_FILTERS,
  deriveSpellFilterOptions,
  applySpellFilters,
  getCircleNumber,
} from '@/components/SpellPicker/spellFilters';
import { getSchoolLabel } from '@/components/SpellPicker/schoolLabels';
import { manaExpenseByCircle } from '@/data/systems/tormenta20/magias/generalSpells';
import { SupplementId, SUPPLEMENT_METADATA } from '@/types/supplement.types';
import {
  AprimoramentoCounts,
  CompendiumSpell,
  getCompendiumSpells,
  RollInclusion,
} from '../utils/spellCompendium';
import SpellAprimoramentoPicker from './SpellAprimoramentoPicker';

const PAGE_SIZE = 60;

const ALL_SPELL_SUPPLEMENTS: SupplementId[] = [
  SupplementId.TORMENTA20_CORE,
  SupplementId.TORMENTA20_AMEACAS_ARTON,
  SupplementId.TORMENTA20_DEUSES_ARTON,
  SupplementId.TORMENTA20_HEROIS_ARTON,
];

const spellKey = (spell: CompendiumSpell) =>
  `${spell.nome}-${spell.spellCircle}`;

/** Magia escolhida no compêndio + aprimoramentos da versão a gravar. */
export interface CompendiumSpellChoice {
  spell: CompendiumSpell;
  counts: AprimoramentoCounts;
  rollInclusion: RollInclusion;
}

interface SpellCompendiumDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (choices: CompendiumSpellChoice[]) => void;
  /** Nomes das magias que a ameaça já tem (marcadas como adicionadas). */
  existingSpellNames: string[];
}

/**
 * Compêndio de magias oficiais para a ficha de ameaça, em duas etapas:
 * 1) busca, filtros e seleção múltipla; 2) aprimoramentos de cada magia, que
 * ficam embutidos na versão gravada (na mesa a magia é usada com um clique,
 * sem escolher aprimoramento na hora). Quem chama converte as escolhas.
 */
const SpellCompendiumDialog: React.FC<SpellCompendiumDialogProps> = ({
  open,
  onClose,
  onConfirm,
  existingSpellNames,
}) => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [filters, setFilters] = useState<SpellFilterState>(EMPTY_SPELL_FILTERS);
  const [selected, setSelected] = useState<Map<string, CompendiumSpell>>(
    new Map()
  );
  const [expanded, setExpanded] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [step, setStep] = useState<'select' | 'aprimoramentos'>('select');
  const [aprimoramentoCounts, setAprimoramentoCounts] = useState<
    Map<string, AprimoramentoCounts>
  >(new Map());
  const [rollInclusions, setRollInclusions] = useState<
    Map<string, RollInclusion>
  >(new Map());

  const supplementIds = useMemo(() => {
    const enabled = user?.enabledSupplements;
    if (!enabled || enabled.length === 0) return ALL_SPELL_SUPPLEMENTS;
    return [SupplementId.TORMENTA20_CORE, ...enabled];
  }, [user?.enabledSupplements]);

  const allSpells = useMemo(
    () => getCompendiumSpells(supplementIds),
    [supplementIds]
  );
  const filterOptions = useMemo(
    () => deriveSpellFilterOptions(allSpells),
    [allSpells]
  );
  const filteredSpells = useMemo(() => {
    const result = applySpellFilters(allSpells, filters) as CompendiumSpell[];
    if (filters.spellType === 'all') return result;
    const { spellType } = filters;
    return result.filter((spell) => spell.traditions.includes(spellType));
  }, [allSpells, filters]);

  const existing = useMemo(
    () => new Set(existingSpellNames.map((name) => normalizeSearch(name))),
    [existingSpellNames]
  );

  const handleFilterChange = (patch: Partial<SpellFilterState>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setVisibleCount(PAGE_SIZE);
  };

  const toggle = (spell: CompendiumSpell) => {
    setSelected((prev) => {
      const next = new Map(prev);
      const key = spellKey(spell);
      if (next.has(key)) next.delete(key);
      else next.set(key, spell);
      return next;
    });
  };

  const handleClose = () => {
    setSelected(new Map());
    setFilters(EMPTY_SPELL_FILTERS);
    setExpanded(null);
    setVisibleCount(PAGE_SIZE);
    setStep('select');
    setAprimoramentoCounts(new Map());
    setRollInclusions(new Map());
    onClose();
  };

  const selectedSpells = Array.from(selected.values());
  const hasAprimoramentos = selectedSpells.some(
    (spell) => (spell.aprimoramentos?.length ?? 0) > 0
  );

  const handleConfirm = () => {
    onConfirm(
      selectedSpells.map((spell) => ({
        spell,
        counts: aprimoramentoCounts.get(spellKey(spell)) ?? new Map(),
        rollInclusion: rollInclusions.get(spellKey(spell)) ?? new Map(),
      }))
    );
    handleClose();
  };

  // Mudar aprimoramento muda as rolagens (e o padrão do truque): a escolha
  // manual de rolagens daquela magia volta ao padrão.
  const setCountsFor = (
    spell: CompendiumSpell,
    counts: AprimoramentoCounts
  ) => {
    setAprimoramentoCounts((prev) =>
      new Map(prev).set(spellKey(spell), counts)
    );
    setRollInclusions((prev) => {
      const next = new Map(prev);
      next.delete(spellKey(spell));
      return next;
    });
  };

  const setRollInclusionFor = (
    spell: CompendiumSpell,
    inclusion: RollInclusion
  ) =>
    setRollInclusions((prev) => new Map(prev).set(spellKey(spell), inclusion));

  const addLabel = `Adicionar ${selected.size} magia${
    selected.size === 1 ? '' : 's'
  }`;

  const visibleSpells = filteredSpells.slice(0, visibleCount);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='md'
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle>
        {step === 'select' ? 'Compêndio de Magias' : 'Aprimoramentos'}
      </DialogTitle>
      <DialogContent dividers>
        {step === 'aprimoramentos' ? (
          <Stack spacing={2}>
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              Escolha com quais aprimoramentos a ameaça usa cada magia. O custo
              em PM e as rolagens ficam gravados nessa versão: na mesa, um
              clique no nome gasta esse PM e rola esses dados.
            </Typography>
            {selectedSpells.map((spell) => (
              <SpellAprimoramentoPicker
                key={spellKey(spell)}
                spell={spell}
                counts={aprimoramentoCounts.get(spellKey(spell)) ?? new Map()}
                onChange={(counts) => setCountsFor(spell, counts)}
                rollInclusion={rollInclusions.get(spellKey(spell)) ?? new Map()}
                onRollInclusionChange={(inclusion) =>
                  setRollInclusionFor(spell, inclusion)
                }
              />
            ))}
          </Stack>
        ) : (
          <>
            <Typography variant='body2' sx={{ color: 'text.secondary', mb: 2 }}>
              Escolha magias oficiais para a ameaça. O texto, o custo em PM, a
              execução e as rolagens são preenchidos automaticamente e podem ser
              editados depois.
            </Typography>
            <SpellAdvancedFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              options={filterOptions}
              visibleFilters={{
                circle: true,
                school: true,
                execution: true,
                spellType: true,
              }}
              searchPlaceholder='Buscar magias por nome, escola ou descrição...'
            />
            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
              {filteredSpells.length} magia
              {filteredSpells.length === 1 ? '' : 's'}
            </Typography>
            {filteredSpells.length === 0 ? (
              <Typography
                variant='body2'
                sx={{ color: 'text.secondary', py: 3 }}
              >
                Nenhuma magia encontrada com esses filtros.
              </Typography>
            ) : (
              <List dense disablePadding>
                {visibleSpells.map((spell) => {
                  const key = spellKey(spell);
                  const isSelected = selected.has(key);
                  const alreadyAdded = existing.has(
                    normalizeSearch(spell.nome)
                  );
                  const isExpanded = expanded === key;
                  const pm =
                    spell.manaExpense ?? manaExpenseByCircle[spell.spellCircle];
                  const traditions = spell.traditions
                    .map((t) => (t === 'arcane' ? 'Arcana' : 'Divina'))
                    .join('/');
                  const supplementAbbr =
                    spell.supplementId !== SupplementId.TORMENTA20_CORE
                      ? SUPPLEMENT_METADATA[spell.supplementId]?.abbreviation
                      : undefined;
                  return (
                    <React.Fragment key={key}>
                      <ListItem
                        disablePadding
                        secondaryAction={
                          <IconButton
                            edge='end'
                            size='small'
                            aria-label={
                              isExpanded ? 'Ocultar descrição' : 'Ver descrição'
                            }
                            onClick={() => setExpanded(isExpanded ? null : key)}
                          >
                            {isExpanded ? (
                              <ExpandLessIcon />
                            ) : (
                              <ExpandMoreIcon />
                            )}
                          </IconButton>
                        }
                      >
                        <ListItemButton onClick={() => toggle(spell)} dense>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <Checkbox
                              edge='start'
                              checked={isSelected}
                              tabIndex={-1}
                              disableRipple
                              size='small'
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box
                                component='span'
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  flexWrap: 'wrap',
                                  gap: 0.5,
                                }}
                              >
                                {spell.nome}
                                {supplementAbbr && (
                                  <Chip
                                    label={supplementAbbr}
                                    size='small'
                                    variant='outlined'
                                    component='span'
                                  />
                                )}
                                {alreadyAdded && (
                                  <Chip
                                    label='Já na ficha'
                                    size='small'
                                    color='info'
                                    component='span'
                                  />
                                )}
                              </Box>
                            }
                            secondary={`${traditions} ${getCircleNumber(
                              spell.spellCircle
                            )} · ${getSchoolLabel(spell.school)} · ${
                              spell.execucao
                            } · ${pm} PM`}
                          />
                        </ListItemButton>
                      </ListItem>
                      <Collapse in={isExpanded} unmountOnExit>
                        <Box sx={{ pl: { xs: 2, sm: 7 }, pr: 2, pb: 1.5 }}>
                          <Typography
                            variant='caption'
                            sx={{ color: 'text.secondary', display: 'block' }}
                          >
                            Alcance: {spell.alcance}
                            {spell.alvo ? ` · Alvo: ${spell.alvo}` : ''}
                            {spell.area ? ` · Área: ${spell.area}` : ''}
                            {` · Duração: ${spell.duracao}`}
                            {spell.resistencia
                              ? ` · Resistência: ${spell.resistencia}`
                              : ''}
                          </Typography>
                          <Typography
                            variant='body2'
                            sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}
                          >
                            {spell.description}
                          </Typography>
                        </Box>
                      </Collapse>
                    </React.Fragment>
                  );
                })}
              </List>
            )}
            {visibleCount < filteredSpells.length && (
              <Box sx={{ textAlign: 'center', mt: 1 }}>
                <Button onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}>
                  Mostrar mais ({filteredSpells.length - visibleCount}{' '}
                  restantes)
                </Button>
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        {step === 'aprimoramentos' ? (
          <>
            <Button onClick={() => setStep('select')} sx={{ mr: 'auto' }}>
              Voltar
            </Button>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button variant='contained' onClick={handleConfirm}>
              {addLabel}
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleClose}>Cancelar</Button>
            {hasAprimoramentos ? (
              <Button
                variant='contained'
                onClick={() => setStep('aprimoramentos')}
              >
                Escolher aprimoramentos
              </Button>
            ) : (
              <Button
                variant='contained'
                onClick={handleConfirm}
                disabled={selected.size === 0}
              >
                {selected.size === 0 ? 'Adicionar' : addLabel}
              </Button>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SpellCompendiumDialog;
