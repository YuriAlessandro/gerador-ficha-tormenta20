import React, { useState, useEffect, useMemo } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Button,
  Stack,
  IconButton,
  Divider,
  Alert,
  FormControlLabel,
  Checkbox,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Origin, { OriginSkillChoice } from '@/interfaces/Origin';
import Skill, { isOficioSkill } from '@/interfaces/Skills';
import { OriginBenefit } from '@/interfaces/WizardSelections';
import CharacterSheet from '@/interfaces/CharacterSheet';
import { ORIGIN_POWER_TYPE } from '@/data/systems/tormenta20/powers/originPowers';
import {
  getOriginItemOptionName,
  OriginItemChoices,
} from '@/functions/originItems';
import { OriginSkillChoices } from '@/functions/originSkills';
import SelectableItemGrid from '@/components/CharacterCreationWizard/steps/SelectableItemGrid';
import OficioPicker from '@/components/common/OficioPicker';

interface OriginEditDrawerProps {
  open: boolean;
  onClose: () => void;
  origin: Origin;
  sheet: CharacterSheet;
  onSave: (
    selectedBenefits: OriginBenefit[],
    itemChoices: OriginItemChoices,
    skillChoices: OriginSkillChoices
  ) => void;
}

const OriginEditDrawer: React.FC<OriginEditDrawerProps> = ({
  open,
  onClose,
  origin,
  sheet,
  onSave,
}) => {
  const REQUIRED_SELECTIONS = 2;
  const [selectedBenefits, setSelectedBenefits] = useState<OriginBenefit[]>([]);
  const [itemChoices, setItemChoices] = useState<OriginItemChoices>({});
  const [skillChoices, setSkillChoices] = useState<OriginSkillChoices>({});

  // Get used skills from the character sheet
  const usedSkills: Skill[] = sheet.skills;

  // `getItems()` re-sorteia a cada chamada; congelar por origem estabiliza a
  // lista exibida. As `choice.options` são as mesmas em qualquer sorteio.
  const items = useMemo(() => origin.getItems(), [origin]);
  const choiceItems = useMemo(
    () => items.filter((item) => item.choice),
    [items]
  );

  // Fichas antigas gravaram itens como benefício (`type: 'item'`), o que
  // consumia um dos 2 slots sem conceder nada. Filtrar aqui evita travar o gate
  // de 2 seleções ao reabrir essas fichas.
  const isSelectableBenefit = (benefit: OriginBenefit) =>
    benefit.type !== 'item';

  // Reset selections when drawer opens or origin changes
  useEffect(() => {
    if (open) {
      // If sheet has previously selected benefits for this origin, use them
      if (sheet.origin?.selectedBenefits && sheet.origin.name === origin.name) {
        setSelectedBenefits(
          sheet.origin.selectedBenefits.filter(isSelectableBenefit)
        );
      } else {
        setSelectedBenefits([]);
      }

      setItemChoices(
        sheet.origin?.name === origin.name
          ? sheet.origin?.itemChoices || {}
          : {}
      );

      setSkillChoices(
        sheet.origin?.name === origin.name
          ? sheet.origin?.skillChoices || {}
          : {}
      );
    }
  }, [open, origin.name, sheet.origin]);

  const handleSave = () => {
    onSave(selectedBenefits, itemChoices, skillChoices);
    onClose();
  };

  const handleCancel = () => {
    // Reset to original selections
    if (sheet.origin?.selectedBenefits && sheet.origin.name === origin.name) {
      setSelectedBenefits(
        sheet.origin.selectedBenefits.filter(isSelectableBenefit)
      );
    } else {
      setSelectedBenefits([]);
    }
    onClose();
  };

  const renderItemChoices = () =>
    choiceItems.map((item) => {
      const { choice } = item;
      if (!choice) return null;

      return (
        <Paper key={choice.key} sx={{ p: 2, mb: 3 }}>
          <Typography variant='h6' gutterBottom>
            {choice.label}
          </Typography>
          <SelectableItemGrid
            items={choice.options}
            selectedName={itemChoices[choice.key]}
            onSelect={(option) =>
              setItemChoices((prev) => ({
                ...prev,
                [choice.key]: getOriginItemOptionName(option),
              }))
            }
          />
        </Paper>
      );
    });

  const renderSkillChoices = (skillChoicesList: OriginSkillChoice[]) =>
    skillChoicesList.map((choice) => {
      const selected = skillChoices[choice.key]
        ? [skillChoices[choice.key] as Skill]
        : [];

      return (
        <Paper key={choice.key} sx={{ p: 2, mb: 3 }}>
          <Typography variant='h6' gutterBottom>
            {choice.label}
          </Typography>
          {choice.options.every((option) => isOficioSkill(option)) ? (
            <OficioPicker
              selected={selected}
              options={choice.options}
              multiple={false}
              allowCustom
              onSelect={(skill) =>
                setSkillChoices((prev) => ({ ...prev, [choice.key]: skill }))
              }
              onDeselect={() =>
                setSkillChoices((prev) => {
                  const next = { ...prev };
                  delete next[choice.key];
                  return next;
                })
              }
            />
          ) : (
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              {choice.options.join(', ')}
            </Typography>
          )}
        </Paper>
      );
    });

  // Regional origins grant all benefits automatically
  if (origin.isRegional) {
    const originBenefits = origin.getPowersAndSkills
      ? origin.getPowersAndSkills(usedSkills, origin)
      : { powers: { origin: [], general: [] }, skills: [] };

    return (
      <Drawer
        anchor='right'
        open={open}
        onClose={handleCancel}
        slotProps={{
          paper: {
            sx: { width: { xs: '100%', sm: 600 } },
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Stack
            direction='row'
            sx={{
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant='h6'>Benefícios de Origem</Typography>
            <IconButton onClick={handleCancel} size='small'>
              <CloseIcon />
            </IconButton>
          </Stack>

          <Divider sx={{ mb: 3 }} />

          <Typography
            variant='body1'
            sx={{
              color: 'text.secondary',
              mb: 3,
            }}
          >
            A origem {origin.name} é uma origem regional (Atlas de Arton) e
            concede todos os benefícios automaticamente.
          </Typography>

          <Paper sx={{ p: 2, bgcolor: 'background.default', mb: 3 }}>
            <Typography variant='h6' gutterBottom>
              Benefícios Concedidos Automaticamente:
            </Typography>

            {originBenefits.skills.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant='subtitle2'>Perícias:</Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'text.secondary',
                  }}
                >
                  {originBenefits.skills.join(', ')}
                </Typography>
              </Box>
            )}

            {originBenefits.powers.origin.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant='subtitle2'>Poderes de Origem:</Typography>
                {originBenefits.powers.origin.map((power) => (
                  <Typography
                    key={power.name}
                    variant='body2'
                    sx={{
                      color: 'text.secondary',
                    }}
                  >
                    • {power.name}
                  </Typography>
                ))}
              </Box>
            )}

            {items.length > 0 && (
              <Box>
                <Typography variant='subtitle2'>Itens:</Typography>
                {items.map((item) => {
                  if (item.choice) {
                    return (
                      <Typography
                        key={item.choice.key}
                        variant='body2'
                        sx={{ color: 'text.secondary' }}
                      >
                        • {item.choice.label} (a sua escolha)
                      </Typography>
                    );
                  }

                  const itemName =
                    typeof item.equipment === 'string'
                      ? item.equipment
                      : item.equipment.nome;
                  const itemKey = `${itemName}-${item.qtd || 1}`;

                  return (
                    <Typography
                      key={itemKey}
                      variant='body2'
                      sx={{
                        color: 'text.secondary',
                      }}
                    >
                      • {itemName}
                      {item.qtd && item.qtd > 1 ? ` (x${item.qtd})` : ''}
                    </Typography>
                  );
                })}
              </Box>
            )}
          </Paper>

          {renderSkillChoices(originBenefits.skillChoices || [])}

          {renderItemChoices()}

          <Alert severity='success' sx={{ mb: 3 }}>
            Perícias e poderes são concedidos automaticamente
            {choiceItems.length > 0 ? '; escolha os itens acima' : ''}.
          </Alert>

          <Stack direction='row' spacing={2}>
            <Button fullWidth variant='contained' onClick={handleSave}>
              Confirmar
            </Button>
            <Button fullWidth variant='outlined' onClick={handleCancel}>
              Cancelar
            </Button>
          </Stack>
        </Box>
      </Drawer>
    );
  }

  // Regular origins - user must choose 2 benefits
  // `returnAllOptions = true`: sem isso, origens com getPowersAndSkills
  // (Gladiador, Soldado, Amnésico...) caem no pickFromArray e o drawer exibe um
  // subconjunto aleatório de 2 opções, re-sorteado a cada render.
  const originBenefits = origin.getPowersAndSkills
    ? origin.getPowersAndSkills(usedSkills, origin, true)
    : {
        powers: {
          origin:
            origin.poderes as import('@/interfaces/Poderes').OriginPower[],
          general: [],
        },
        skills: origin.pericias,
      };

  // Build benefit options — apenas perícias e poderes. Itens são concedidos de
  // graça (JDA, "Itens de Origem") e não consomem um dos 2 slots.
  const skillOptions: OriginBenefit[] = originBenefits.skills.map((skill) => ({
    type: 'skill' as const,
    name: skill,
  }));

  // O fallback acima faz cast de todos os `origin.poderes` (inclusive poderes
  // gerais, como Comandar) para OriginPower — por isso o gate de repetição
  // checa o `type` além da flag: um poder geral repetível (Proficiência, Foco
  // em Perícia) teria a 2ª cópia descartada por applyOriginBenefits.
  const powerOptions = originBenefits.powers.origin.map((power) => ({
    benefit: { type: 'power' as const, name: power.name },
    canPickTwice:
      power.type === ORIGIN_POWER_TYPE && power.allowSeveralPicks === true,
  }));

  const countBenefit = (benefit: OriginBenefit) =>
    selectedBenefits.filter(
      (b) => b.type === benefit.type && b.name === benefit.name
    ).length;

  const handleToggle = (benefit: OriginBenefit) => {
    const isSelected = selectedBenefits.some(
      (b) => b.type === benefit.type && b.name === benefit.name
    );

    if (isSelected) {
      // Remove benefit
      setSelectedBenefits(
        selectedBenefits.filter(
          (b) => !(b.type === benefit.type && b.name === benefit.name)
        )
      );
    } else if (selectedBenefits.length < REQUIRED_SELECTIONS) {
      // Add benefit if under limit
      setSelectedBenefits([...selectedBenefits, benefit]);
    }
  };

  // Segunda escolha de um poder repetível: adiciona/remove UMA cópia
  // (o checkbox principal continua removendo as duas de uma vez).
  const handleToggleSecondPick = (benefit: OriginBenefit) => {
    const count = countBenefit(benefit);

    if (count >= 2) {
      const indexToRemove = selectedBenefits.findIndex(
        (b) => b.type === benefit.type && b.name === benefit.name
      );
      setSelectedBenefits(
        selectedBenefits.filter((_, index) => index !== indexToRemove)
      );
      return;
    }

    if (count === 1 && selectedBenefits.length < REQUIRED_SELECTIONS) {
      setSelectedBenefits([...selectedBenefits, { ...benefit }]);
    }
  };

  const isComplete = selectedBenefits.length === REQUIRED_SELECTIONS;

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={handleCancel}
      slotProps={{
        paper: {
          sx: { width: { xs: '100%', sm: 600 } },
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Stack
          direction='row'
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant='h6'>Benefícios de Origem</Typography>
          <IconButton onClick={handleCancel} size='small'>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        <Typography
          variant='body1'
          sx={{
            color: 'text.secondary',
            mb: 2,
          }}
        >
          A origem {origin.name} concede itens automaticamente e permite
          escolher {REQUIRED_SELECTIONS} benefícios entre perícias e poderes.
          Selecione abaixo:
        </Typography>

        <Typography
          variant='caption'
          color={isComplete ? 'success.main' : 'warning.main'}
          sx={{ mb: 3, display: 'block' }}
        >
          Selecionados: {selectedBenefits.length} / {REQUIRED_SELECTIONS}
        </Typography>

        <Box sx={{ maxHeight: '60vh', overflow: 'auto', mb: 3 }}>
          {/* Skills Section */}
          {skillOptions.length > 0 && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant='h6' gutterBottom>
                Perícias
              </Typography>
              {skillOptions.map((benefit) => {
                const isSelected = selectedBenefits.some(
                  (b) => b.type === benefit.type && b.name === benefit.name
                );
                const isDisabled =
                  !isSelected && selectedBenefits.length >= REQUIRED_SELECTIONS;

                return (
                  <FormControlLabel
                    key={`skill-${benefit.name}`}
                    control={
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleToggle(benefit)}
                        disabled={isDisabled}
                      />
                    }
                    label={benefit.name}
                  />
                );
              })}
            </Paper>
          )}

          {/* Perícias com escolha — concedidas de graça, fora dos 2 benefícios */}
          {renderSkillChoices(originBenefits.skillChoices || [])}

          {/* Itens com escolha — concedidos de graça, fora dos 2 benefícios */}
          {renderItemChoices()}

          {/* Powers Section */}
          {powerOptions.length > 0 && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant='h6' gutterBottom>
                Poderes
              </Typography>
              {powerOptions.some((p) => p.canPickTwice) && (
                <Alert severity='info' sx={{ mb: 2 }}>
                  Alguns poderes podem ser escolhidos duas vezes. Marcar as duas
                  vezes usa seus dois benefícios de origem.
                </Alert>
              )}
              {powerOptions.map((powerOpt) => {
                const { benefit } = powerOpt;
                const selectedCount = countBenefit(benefit);
                const isSelected = selectedCount > 0;
                const isDisabled =
                  !isSelected && selectedBenefits.length >= REQUIRED_SELECTIONS;
                const isPickedTwice = selectedCount >= 2;
                const isSecondPickDisabled =
                  !isPickedTwice &&
                  selectedBenefits.length >= REQUIRED_SELECTIONS;

                return (
                  <Box
                    key={`power-${benefit.name}`}
                    sx={{ display: 'flex', flexDirection: 'column' }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleToggle(benefit)}
                          disabled={isDisabled}
                        />
                      }
                      label={
                        <Typography component='span'>
                          {benefit.name}
                          {isPickedTwice && (
                            <Typography
                              component='span'
                              variant='caption'
                              sx={{ ml: 1, fontStyle: 'italic' }}
                            >
                              (escolhido 2×)
                            </Typography>
                          )}
                        </Typography>
                      }
                    />
                    {powerOpt.canPickTwice && isSelected && (
                      <FormControlLabel
                        sx={{ ml: 4 }}
                        control={
                          <Checkbox
                            size='small'
                            checked={isPickedTwice}
                            onChange={() => handleToggleSecondPick(benefit)}
                            disabled={isSecondPickDisabled}
                          />
                        }
                        label={
                          <Typography component='span' variant='body2'>
                            Escolher este poder duas vezes
                            <Typography
                              component='span'
                              variant='caption'
                              sx={{ ml: 1, fontStyle: 'italic' }}
                            >
                              {isSecondPickDisabled
                                ? '(desmarque o outro benefício para escolher duas vezes)'
                                : '(usa seus 2 benefícios)'}
                            </Typography>
                          </Typography>
                        }
                      />
                    )}
                  </Box>
                );
              })}
            </Paper>
          )}
        </Box>

        {!isComplete && selectedBenefits.length > 0 && (
          <Alert severity='warning' sx={{ mb: 2 }}>
            Selecione {REQUIRED_SELECTIONS - selectedBenefits.length} benefício
            {REQUIRED_SELECTIONS - selectedBenefits.length > 1 ? 's' : ''}{' '}
            adicional
            {REQUIRED_SELECTIONS - selectedBenefits.length > 1 ? 'is' : ''} para
            continuar.
          </Alert>
        )}

        {isComplete && (
          <Alert severity='success' sx={{ mb: 2 }}>
            Benefícios selecionados com sucesso!
          </Alert>
        )}

        <Stack direction='row' spacing={2}>
          <Button
            fullWidth
            variant='contained'
            onClick={handleSave}
            disabled={!isComplete}
          >
            Salvar
          </Button>
          <Button fullWidth variant='outlined' onClick={handleCancel}>
            Cancelar
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
};

export default OriginEditDrawer;
