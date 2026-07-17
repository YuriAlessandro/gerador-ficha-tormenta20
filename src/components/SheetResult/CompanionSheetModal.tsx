import React, { useMemo, useCallback, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Stack,
  Typography,
  Box,
  Chip,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  Tooltip,
  Button,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import { CompanionSheet, CompanionNaturalWeapon } from '@/interfaces/Companion';
import {
  getCompanionTypeDefinition,
  CompanionTypeDefinition,
} from '@/data/systems/tormenta20/herois-de-arton/companion/companionTypes';
import { getCompanionTrickDefinition } from '@/data/systems/tormenta20/herois-de-arton/companion/companionTricks';
import { getCompanionSkillTrainingBonus } from '@/data/systems/tormenta20/herois-de-arton/companion';
import {
  Atributo,
  ATTR_ABBREVIATIONS,
} from '@/data/systems/tormenta20/atributos';
import { SkillsAttrs } from '@/interfaces/Skills';
import { rollD20 } from '@/functions/diceRoller';
import { useDiceRoll } from '@/premium/hooks/useDiceRoll';
import StatControl from './StatControl';

interface CompanionSheetModalProps {
  open: boolean;
  onClose: () => void;
  companion: CompanionSheet;
  trainerLevel: number;
  trainerName?: string;
  trainerCharismaMod?: number;
  pendingEnsinarTruqueCount?: number;
  onCompanionUpdate?: (updated: CompanionSheet) => void;
  totalCompanions?: number;
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
  onAdd?: () => void;
  onRemove?: (index: number) => void;
  onEdit?: () => void;
}

const CompanionAttributeDisplay: React.FC<{
  label: string;
  value: number;
  onRoll: (label: string, value: number) => void;
}> = ({ label, value, onRoll }) => {
  const theme = useTheme();
  return (
    <Box
      onClick={() => onRoll(label, value)}
      sx={{
        textAlign: 'center',
        minWidth: 45,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        p: 0.5,
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: theme.palette.primary.main,
          backgroundColor: theme.palette.action.hover,
        },
        '&:active': {
          transform: 'scale(0.95)',
        },
      }}
      title={`Rolar teste de ${label}`}
    >
      <Typography
        variant='caption'
        sx={{
          color: 'text.secondary',
        }}
      >
        {label}
      </Typography>
      <Typography
        variant='body1'
        color='primary'
        sx={{
          fontWeight: 'bold',
          textDecoration: 'underline dotted',
        }}
      >
        {value >= 0 ? `+${value}` : value}
      </Typography>
    </Box>
  );
};

const StatRow: React.FC<{
  label: string;
  value: string | number;
}> = ({ label, value }) => (
  <Stack
    direction='row'
    sx={{
      justifyContent: 'space-between',
      alignItems: 'center',
    }}
  >
    <Typography
      variant='body2'
      sx={{
        color: 'text.secondary',
      }}
    >
      {label}
    </Typography>
    <Typography
      variant='body2'
      sx={{
        fontWeight: 'bold',
      }}
    >
      {value}
    </Typography>
  </Stack>
);

const CompanionSheetModal: React.FC<CompanionSheetModalProps> = ({
  open,
  onClose,
  companion,
  trainerLevel,
  trainerName,
  trainerCharismaMod,
  pendingEnsinarTruqueCount,
  onCompanionUpdate,
  totalCompanions = 1,
  currentIndex = 0,
  onIndexChange,
  onAdd,
  onRemove,
  onEdit,
}) => {
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
  const isMobile = useMemo(() => window.innerWidth < 720, []);
  const theme = useTheme();
  const { showDiceResult, showAttackRoll } = useDiceRoll();

  const typeDef: CompanionTypeDefinition = useMemo(
    () => getCompanionTypeDefinition(companion.companionType),
    [companion.companionType]
  );

  const displayName = companion.name || 'Melhor Amigo';

  const handlePVDecrement = useCallback(
    (amount: number) => {
      if (onCompanionUpdate) {
        const currentTemp = companion.tempPV ?? 0;
        const currentPVVal = companion.currentPV ?? companion.pv;
        const tempConsumed = Math.min(currentTemp, amount);
        const remaining = amount - tempConsumed;
        const pvMinimo = Math.min(-10, -Math.floor(companion.pv / 2));
        onCompanionUpdate({
          ...companion,
          tempPV: currentTemp - tempConsumed,
          currentPV: Math.max(pvMinimo, currentPVVal - remaining),
        });
      }
    },
    [companion, onCompanionUpdate]
  );

  const handlePVHeal = useCallback(
    (amount: number) => {
      if (onCompanionUpdate) {
        const currentPVVal = companion.currentPV ?? companion.pv;
        const newCurrent = Math.min(companion.pv, currentPVVal + amount);
        onCompanionUpdate({ ...companion, currentPV: newCurrent });
      }
    },
    [companion, onCompanionUpdate]
  );

  const handleAttributeRoll = useCallback(
    (attrLabel: string, modifier: number) => {
      const d20Roll = rollD20();
      const total = Math.max(1, d20Roll + modifier);
      const isCritical = d20Roll === 20;
      const isFumble = d20Roll === 1;

      const modifierStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;
      const diceNotation = `1d20${modifierStr}`;

      showDiceResult(
        `Teste de ${attrLabel}`,
        [
          {
            label: attrLabel,
            diceNotation,
            rolls: [d20Roll],
            modifier,
            total,
            isCritical,
            isFumble,
          },
        ],
        displayName
      );
    },
    [showDiceResult, displayName]
  );

  const halfTrainerLevel = Math.floor(trainerLevel / 2);
  const skillTrainingBonus = getCompanionSkillTrainingBonus(trainerLevel);
  const forMod = companion.attributes[Atributo.FORCA];
  const companionAtkBonus = companion.attackBonus || 0;
  const companionDmgBonus = companion.damageBonus || 0;

  const handleWeaponRoll = useCallback(
    (weapon: CompanionNaturalWeapon, weaponIndex: number) => {
      const atkBonus = forMod + halfTrainerLevel + companionAtkBonus;
      const damageModifier = forMod + companionDmgBonus;

      const damageModStr =
        damageModifier >= 0 ? `+${damageModifier}` : `${damageModifier}`;
      const damageString = `${weapon.damageDice}${damageModStr}`;

      // A resolução (d20 vs margem, multiplicação dos dados em crítico e
      // rótulos) é do pipeline central — ver src/functions/attackRoll.ts.
      showAttackRoll({
        rollLabel: `Arma Natural ${weaponIndex + 1}`,
        characterName: displayName,
        attackBonus: atkBonus,
        crit: {
          threshold: weapon.threatMargin,
          multiplier: weapon.criticalMultiplier,
        },
        damage: { dice: damageString, damageType: weapon.damageType },
      });
    },
    [
      forMod,
      halfTrainerLevel,
      companionAtkBonus,
      companionDmgBonus,
      showAttackRoll,
      displayName,
    ]
  );

  const handleSkillRoll = useCallback(
    (skillName: string) => {
      const skillAttr = SkillsAttrs[skillName];
      const attrMod = skillAttr ? companion.attributes[skillAttr] : 0;
      const skillBonus = attrMod + halfTrainerLevel + skillTrainingBonus;

      const d20Roll = rollD20();
      const total = Math.max(1, d20Roll + skillBonus);
      const isCritical = d20Roll === 20;
      const isFumble = d20Roll === 1;

      const modStr = skillBonus >= 0 ? `+${skillBonus}` : `${skillBonus}`;
      const diceNotation = `1d20${modStr}`;

      showDiceResult(
        skillName,
        [
          {
            label: skillName,
            diceNotation,
            rolls: [d20Roll],
            modifier: skillBonus,
            total,
            isCritical,
            isFumble,
          },
        ],
        displayName
      );
    },
    [
      companion.attributes,
      halfTrainerLevel,
      skillTrainingBonus,
      showDiceResult,
      displayName,
    ]
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle>
        <Stack
          direction='row'
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Stack
            direction='row'
            spacing={1}
            sx={{
              alignItems: 'center',
            }}
          >
            <Typography
              variant='h6'
              sx={{
                fontWeight: 'bold',
              }}
            >
              {displayName}
            </Typography>
          </Stack>
          <Stack
            direction='row'
            spacing={0.5}
            sx={{
              alignItems: 'center',
            }}
          >
            {onEdit && (
              <Tooltip title='Editar ficha'>
                <IconButton size='small' onClick={onEdit} color='primary'>
                  <EditIcon />
                </IconButton>
              </Tooltip>
            )}
            {onAdd && (
              <Tooltip title='Adicionar Melhor Amigo'>
                <IconButton size='small' onClick={onAdd} color='primary'>
                  <AddIcon />
                </IconButton>
              </Tooltip>
            )}
            {onRemove && totalCompanions > 0 && (
              <Tooltip title='Remover este parceiro'>
                <IconButton
                  size='small'
                  onClick={() => setConfirmRemoveOpen(true)}
                  color='error'
                >
                  <DeleteOutlineIcon />
                </IconButton>
              </Tooltip>
            )}
            <IconButton size='small' onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </Stack>
        <Stack
          direction='row'
          spacing={1}
          sx={{
            flexWrap: 'wrap',
            mt: 0.5,
          }}
        >
          <Chip
            label={companion.companionType}
            size='small'
            color='primary'
            variant='outlined'
          />
          <Chip label={companion.size} size='small' variant='outlined' />
          {companion.spiritEnergyType && (
            <Chip
              label={`Energia ${companion.spiritEnergyType}`}
              size='small'
              variant='outlined'
            />
          )}
          {trainerName && (
            <Chip
              label={`Treinador: ${trainerName}`}
              size='small'
              variant='outlined'
              color='secondary'
            />
          )}
          {companion.manualOverrides &&
            Object.keys(companion.manualOverrides).length > 0 && (
              <Chip
                label='Editado manualmente'
                size='small'
                color='warning'
                variant='outlined'
              />
            )}
        </Stack>
        {totalCompanions > 1 && onIndexChange && (
          <Tabs
            value={currentIndex}
            onChange={(_, idx) => onIndexChange(idx)}
            variant='scrollable'
            scrollButtons='auto'
            sx={{ mt: 1, minHeight: 32 }}
          >
            {Array.from({ length: totalCompanions }).map((_, idx) => (
              <Tab
                // eslint-disable-next-line react/no-array-index-key
                key={idx}
                label={`Parceiro ${idx + 1}`}
                sx={{ minHeight: 32, py: 0 }}
              />
            ))}
          </Tabs>
        )}
      </DialogTitle>
      <DialogContent dividers>
        {pendingEnsinarTruqueCount && pendingEnsinarTruqueCount > 0 ? (
          <Box
            sx={{
              mb: 2,
              p: 1.5,
              border: '1px solid',
              borderColor: 'warning.main',
              borderRadius: 1,
              bgcolor: 'warning.light',
              color: 'warning.contrastText',
            }}
          >
            <Typography variant='body2' sx={{ fontWeight: 'bold' }}>
              Truque pendente
            </Typography>
            <Typography variant='caption'>
              {pendingEnsinarTruqueCount === 1
                ? 'O treinador possui o poder "Ensinar Truque" sem truque alocado. Reabra "Editar Poderes" e re-selecione o poder para escolher o truque adicional.'
                : `O treinador possui ${pendingEnsinarTruqueCount} instâncias do poder "Ensinar Truque" sem truques alocados. Reabra "Editar Poderes" e re-selecione cada poder para escolher os truques adicionais.`}
            </Typography>
          </Box>
        ) : null}

        {/* Atributos */}
        <Typography
          variant='subtitle2'
          color='primary'
          sx={{
            fontWeight: 'bold',
            mb: 1,
          }}
        >
          Atributos
        </Typography>
        <Stack
          direction='row'
          spacing={1}
          sx={{
            justifyContent: 'center',
            flexWrap: 'wrap',
            mb: 2,
          }}
        >
          {Object.values(Atributo).map((attr) => (
            <CompanionAttributeDisplay
              key={attr}
              label={ATTR_ABBREVIATIONS[attr]}
              value={companion.attributes[attr]}
              onRoll={handleAttributeRoll}
            />
          ))}
        </Stack>

        <Divider sx={{ my: 1.5 }} />

        {/* PV Control */}
        <Stack
          direction='row'
          sx={{
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <StatControl
            type='PV'
            current={companion.currentPV ?? companion.pv}
            max={companion.pv}
            calculatedMax={companion.pv}
            temp={companion.tempPV ?? 0}
            onDecrement={handlePVDecrement}
            onHeal={handlePVHeal}
            disabled={!onCompanionUpdate}
          />
        </Stack>

        {/* Stats de Combate */}
        <Typography
          variant='subtitle2'
          color='primary'
          sx={{
            fontWeight: 'bold',
            mb: 1,
          }}
        >
          Combate
        </Typography>
        <Stack spacing={0.5} sx={{ mb: 2 }}>
          <StatRow label='Defesa' value={companion.defesa} />
          <StatRow label='Deslocamento' value={`${companion.displacement}m`} />
          {companion.movementTypes?.voo && (
            <StatRow label='Voo' value={`${companion.movementTypes.voo}m`} />
          )}
          {companion.movementTypes?.escalada && (
            <StatRow
              label='Escalada'
              value={`${companion.movementTypes.escalada}m`}
            />
          )}
          {companion.movementTypes?.natacao && (
            <StatRow
              label='Natação'
              value={`${companion.movementTypes.natacao}m`}
            />
          )}
          {companion.reducaoDeDano && (
            <StatRow label='Redução de Dano' value={companion.reducaoDeDano} />
          )}
        </Stack>

        {/* Sentidos e Imunidades */}
        {((companion.senses && companion.senses.length > 0) ||
          (companion.immunities && companion.immunities.length > 0)) && (
          <>
            <Divider sx={{ my: 1.5 }} />
            {companion.senses && companion.senses.length > 0 && (
              <Box sx={{ mb: 1 }}>
                <Typography
                  variant='subtitle2'
                  color='primary'
                  sx={{
                    fontWeight: 'bold',
                  }}
                >
                  Sentidos
                </Typography>
                <Stack
                  direction='row'
                  spacing={0.5}
                  sx={{
                    flexWrap: 'wrap',
                  }}
                >
                  {companion.senses.map((sense) => (
                    <Chip key={sense} label={sense} size='small' />
                  ))}
                </Stack>
              </Box>
            )}
            {companion.immunities && companion.immunities.length > 0 && (
              <Box sx={{ mb: 1 }}>
                <Typography
                  variant='subtitle2'
                  color='primary'
                  sx={{
                    fontWeight: 'bold',
                  }}
                >
                  Imunidades
                </Typography>
                <Stack
                  direction='row'
                  spacing={0.5}
                  sx={{
                    flexWrap: 'wrap',
                  }}
                >
                  {companion.immunities.map((imm) => (
                    <Chip key={imm} label={imm} size='small' color='warning' />
                  ))}
                </Stack>
              </Box>
            )}
          </>
        )}

        {/* Armas Naturais */}
        {companion.naturalWeapons.length > 0 && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Typography
              variant='subtitle2'
              color='primary'
              sx={{
                fontWeight: 'bold',
                mb: 1,
              }}
            >
              Armas Naturais
            </Typography>
            {companion.naturalWeapons.map((weapon, idx) => {
              const atkBonus = forMod + halfTrainerLevel + companionAtkBonus;
              const atkStr = atkBonus >= 0 ? `+${atkBonus}` : `${atkBonus}`;
              const totalDmgMod = forMod + companionDmgBonus;
              const dmgModStr =
                totalDmgMod >= 0 ? `+${totalDmgMod}` : `${totalDmgMod}`;

              return (
                <Box
                  key={`weapon-${weapon.damageType}-${weapon.damageDice}-${weapon.threatMargin}`}
                  onClick={() => handleWeaponRoll(weapon, idx)}
                  sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    p: 1,
                    mb: 0.5,
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                      borderColor: theme.palette.primary.main,
                    },
                    '&:active': {
                      transform: 'scale(0.99)',
                    },
                  }}
                  title={`Rolar ataque com Arma Natural ${idx + 1}`}
                >
                  <Typography variant='body2'>
                    <strong>Arma Natural {idx + 1}:</strong> {atkStr} •{' '}
                    {weapon.damageDice}
                    {dmgModStr} • ({weapon.threatMargin}/x
                    {weapon.criticalMultiplier}) • {weapon.damageType}
                  </Typography>
                </Box>
              );
            })}
          </>
        )}

        {/* Proficiências (Anatomia Humanoide) */}
        {companion.proficiencies && companion.proficiencies.length > 0 && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Typography
              variant='subtitle2'
              color='primary'
              sx={{
                fontWeight: 'bold',
                mb: 1,
              }}
            >
              Proficiências
            </Typography>
            <Stack
              direction='row'
              spacing={0.5}
              sx={{
                flexWrap: 'wrap',
              }}
            >
              {companion.proficiencies.map((prof) => (
                <Chip key={prof} label={prof} size='small' />
              ))}
            </Stack>
          </>
        )}

        {/* Perícias */}
        <Divider sx={{ my: 1.5 }} />
        <Typography
          variant='subtitle2'
          color='primary'
          sx={{
            fontWeight: 'bold',
            mb: 1,
          }}
        >
          Perícias Treinadas
        </Typography>
        <Stack spacing={0.5} sx={{ mb: 2 }}>
          {companion.skills.map((skill) => {
            const skillAttr = SkillsAttrs[skill];
            const attrMod = skillAttr ? companion.attributes[skillAttr] : 0;
            const skillBonus = attrMod + halfTrainerLevel + skillTrainingBonus;
            const bonusStr =
              skillBonus >= 0 ? `+${skillBonus}` : `${skillBonus}`;

            return (
              <Box
                key={skill}
                onClick={() => handleSkillRoll(skill)}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  py: 0.5,
                  px: 1,
                  cursor: 'pointer',
                  userSelect: 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                  '&:active': {
                    transform: 'scale(0.99)',
                  },
                }}
                title={`Rolar ${skill}`}
              >
                <Typography variant='body2'>{skill}</Typography>
                <Typography
                  variant='body2'
                  color='primary'
                  sx={{
                    fontWeight: 'bold',
                    textDecoration: 'underline dotted',
                  }}
                >
                  {bonusStr}
                </Typography>
              </Box>
            );
          })}
        </Stack>

        {/* Habilidades Especiais do Tipo */}
        {typeDef.specialAbilities && typeDef.specialAbilities.length > 0 && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Typography
              variant='subtitle2'
              color='primary'
              sx={{
                fontWeight: 'bold',
                mb: 1,
              }}
            >
              Habilidades Especiais ({companion.companionType})
            </Typography>
            {typeDef.specialAbilities.map((ability) => (
              <Typography key={ability} variant='body2' sx={{ mb: 0.5 }}>
                • {ability}
              </Typography>
            ))}
          </>
        )}

        {/* Truques */}
        {companion.tricks.length > 0 && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Typography
              variant='subtitle2'
              color='primary'
              sx={{
                fontWeight: 'bold',
                mb: 1,
              }}
            >
              Truques ({companion.tricks.length})
            </Typography>
            {companion.tricks.map((trick) => {
              const trickDef = getCompanionTrickDefinition(trick.name);
              return (
                <Accordion key={trick.name} disableGutters>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography
                      color='primary'
                      sx={{
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                      }}
                    >
                      {trick.name}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant='body2'>
                      {trickDef?.text || 'Descrição não disponível.'}
                    </Typography>
                    {trick.choices &&
                      Object.entries(trick.choices).length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <Typography
                            variant='caption'
                            sx={{
                              color: 'text.secondary',
                            }}
                          >
                            Escolhas:{' '}
                            {Object.entries(trick.choices)
                              .map(([key, val]) => `${key}: ${val}`)
                              .join(', ')}
                          </Typography>
                        </Box>
                      )}
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </>
        )}

        {/* Magias (Magia Inata) */}
        {companion.spells && companion.spells.length > 0 && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Typography
              variant='subtitle2'
              color='primary'
              sx={{
                fontWeight: 'bold',
                mb: 1,
              }}
            >
              Magias ({companion.spells.length})
            </Typography>
            {companion.spells.map((spell) => {
              const circleNumber = parseInt(spell.spellCircle, 10) || 1;
              const cd =
                trainerCharismaMod !== undefined
                  ? 10 + trainerCharismaMod + circleNumber
                  : null;
              return (
                <Accordion key={spell.nome} disableGutters>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 1,
                        width: '100%',
                        pr: 1,
                      }}
                    >
                      <Typography
                        color='primary'
                        sx={{
                          fontWeight: 'bold',
                          fontSize: '0.9rem',
                        }}
                      >
                        {spell.nome}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Chip
                          label={spell.school}
                          size='small'
                          variant='outlined'
                        />
                        {cd !== null && (
                          <Chip
                            label={`CD ${cd}`}
                            size='small'
                            color='primary'
                            variant='outlined'
                          />
                        )}
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography
                      variant='caption'
                      sx={{
                        color: 'text.secondary',
                        display: 'block',
                        mb: 1,
                      }}
                    >
                      {spell.spellCircle} • {spell.execucao} • {spell.alcance}
                      {spell.alvo && ` • ${spell.alvo}`}
                      {' • '}Duração: {spell.duracao}
                    </Typography>
                    <Typography variant='body2' sx={{ whiteSpace: 'pre-wrap' }}>
                      {spell.description}
                    </Typography>
                    <Typography
                      variant='caption'
                      sx={{
                        color: 'text.secondary',
                        display: 'block',
                        mt: 1,
                      }}
                    >
                      Atributo-chave: Carisma do treinador
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </>
        )}

        {/* Info do nível do treinador */}
        <Divider sx={{ my: 1.5 }} />
        <Typography
          variant='caption'
          sx={{
            color: 'text.secondary',
          }}
        >
          Nível do Treinador: {trainerLevel}
        </Typography>
      </DialogContent>
      <Dialog
        open={confirmRemoveOpen}
        onClose={() => setConfirmRemoveOpen(false)}
        maxWidth='xs'
      >
        <DialogTitle>Remover Melhor Amigo?</DialogTitle>
        <DialogContent>
          <Typography variant='body2'>
            Tem certeza que deseja remover <strong>{displayName}</strong> da sua
            ficha? Essa ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, p: 2 }}>
          <Button onClick={() => setConfirmRemoveOpen(false)}>Cancelar</Button>
          <Button
            color='error'
            variant='contained'
            onClick={() => {
              if (onRemove) onRemove(currentIndex);
              setConfirmRemoveOpen(false);
            }}
          >
            Remover
          </Button>
        </Box>
      </Dialog>
    </Dialog>
  );
};

export default CompanionSheetModal;
