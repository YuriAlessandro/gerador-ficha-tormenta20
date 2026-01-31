/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import React from 'react';
import ReactToPrint from 'react-to-print';
import {
  Button,
  Card,
  Container,
  CircularProgress,
  Stack,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Extension as ExtensionIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  History as HistoryIcon,
  Home as HomeIcon,
  Dangerous as ThreatIcon,
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useConfirm } from '../../hooks/useDialog';
import { useAuth } from '../../hooks/useAuth';
import { convertThreatToFoundry } from '../../2foundry';
import {
  ThreatSheet,
  ThreatAttack,
  AbilityRoll,
} from '../../interfaces/ThreatSheet';
import {
  getTierDisplayName,
  getTierByChallengeLevel,
} from '../../functions/threatGenerator';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import { deleteThreat } from '../../store/slices/threatStorage';
import BreadcrumbNav, { BreadcrumbItem } from '../common/BreadcrumbNav';
import { rollD20, rollDamage } from '../../functions/diceRoller';
import { useDiceRoll } from '../../premium/hooks/useDiceRoll';

interface ThreatResultProps {
  threat: ThreatSheet;
  onEdit?: () => void;
  isFromHistory?: boolean;
  isSavedToCloud?: boolean;
  onSaveToCloud?: () => Promise<void>;
  viewOnly?: boolean;
}

const ThreatResult: React.FC<ThreatResultProps> = ({
  threat,
  onEdit,
  isFromHistory = false,
  isSavedToCloud = false,
  onSaveToCloud,
  viewOnly = false,
}) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { showConfirm, ConfirmDialog } = useConfirm();
  const { isAuthenticated } = useAuth();
  const { showDiceResult } = useDiceRoll();
  const [showExportButton, setExportButton] = React.useState<boolean>();
  const [loadingFoundry, setLoadingFoundry] = React.useState(false);
  const [loadingPDF, setLoadingPDF] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const resultRef = React.createRef<HTMLDivElement>();

  React.useEffect(() => {
    if (resultRef.current) {
      setExportButton(true);
    }
  }, [resultRef]);

  function getKey(elementId: string) {
    return `${threat.id}-${elementId}`;
  }

  const handleSkillRoll = (skillName: string, modifier: number) => {
    const roll = rollD20();
    const total = roll + modifier;
    const isCritical = roll === 20;
    const isFumble = roll === 1;

    const modifierStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;
    const diceNotation = `1d20${modifierStr}`;

    showDiceResult(
      `${threat.name}: ${skillName}`,
      [
        {
          label: skillName,
          diceNotation,
          rolls: [roll],
          modifier,
          total,
          isCritical,
          isFumble,
        },
      ],
      threat.name
    );
  };

  const handleAbilityRoll = (abilityName: string, roll: AbilityRoll) => {
    // Build damage string with bonus
    const damageString = `${roll.dice}${roll.bonus >= 0 ? '+' : ''}${
      roll.bonus
    }`;
    const damageRollResult = rollDamage(damageString);

    if (!damageRollResult) {
      return;
    }

    showDiceResult(
      `${threat.name}: ${abilityName}`,
      [
        {
          label: roll.name,
          diceNotation: damageRollResult.diceString,
          rolls: damageRollResult.diceRolls,
          modifier: damageRollResult.modifier,
          total: Math.max(1, damageRollResult.total),
        },
      ],
      threat.name
    );
  };

  const handleAbilityNameClick = (
    abilityName: string,
    rolls: AbilityRoll[]
  ) => {
    if (!rolls || rolls.length === 0) return;

    const rollResults = rolls
      .map((roll) => {
        const damageString = `${roll.dice}${roll.bonus >= 0 ? '+' : ''}${
          roll.bonus
        }`;
        const damageRollResult = rollDamage(damageString);

        if (!damageRollResult) return null;

        return {
          label: roll.name,
          diceNotation: damageRollResult.diceString,
          rolls: damageRollResult.diceRolls,
          modifier: damageRollResult.modifier,
          total: Math.max(1, damageRollResult.total),
        };
      })
      .filter((result) => result !== null);

    if (rollResults.length === 0) return;

    showDiceResult(`${threat.name}: ${abilityName}`, rollResults, threat.name);
  };

  const handleAttackClick = (attack: ThreatAttack) => {
    const attackRoll = rollD20();
    const attackTotal = Math.max(1, attackRoll + attack.attackBonus);
    const criticalThreshold = attack.criticalThreshold || 20;
    const criticalMultiplier = attack.criticalMultiplier || 2;
    const isCritical = attackRoll >= criticalThreshold;
    const isFumble = attackRoll === 1;

    // Build damage string with bonus
    const damageString = `${attack.damageDice}${
      attack.bonusDamage >= 0 ? '+' : ''
    }${attack.bonusDamage}`;
    const damageRollResult = rollDamage(damageString);

    if (!damageRollResult) {
      return;
    }

    // Separar dados do bônus para aplicar multiplicador corretamente
    // Fórmula: (dados × multiplicador) + bônus
    const diceTotal = damageRollResult.diceRolls.reduce((sum, r) => sum + r, 0);
    const normalDamage = Math.max(1, diceTotal + damageRollResult.modifier);
    const criticalDamage = Math.max(
      1,
      diceTotal * criticalMultiplier + damageRollResult.modifier
    );
    const finalDamage = isCritical ? criticalDamage : normalDamage;

    // Format attack dice notation
    const atkModifierStr =
      attack.attackBonus >= 0
        ? `+${attack.attackBonus}`
        : `${attack.attackBonus}`;
    const attackDiceNotation = `1d20${atkModifierStr}`;

    // Label mostrando dano normal entre parênteses (para criaturas imunes a crítico)
    const damageLabel = isCritical
      ? `Dano x${criticalMultiplier} (normal: ${normalDamage})`
      : 'Dano';

    showDiceResult(
      `${threat.name}: ${attack.name}`,
      [
        {
          label: 'Ataque',
          diceNotation: attackDiceNotation,
          rolls: [attackRoll],
          modifier: attack.attackBonus,
          total: attackTotal,
          isCritical,
          isFumble,
        },
        {
          label: damageLabel,
          diceNotation: damageRollResult.diceString,
          rolls: damageRollResult.diceRolls,
          modifier: damageRollResult.modifier,
          total: finalDamage,
        },
      ],
      threat.name
    );
  };

  const handleSaveToCloud = async () => {
    if (!onSaveToCloud || isSaving) return;

    setIsSaving(true);
    try {
      await onSaveToCloud();
    } catch (error) {
      console.error('Error saving to cloud:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = await showConfirm(
      'Tem certeza que deseja excluir esta ameaça?',
      'Confirmar Exclusão',
      'Excluir',
      'Cancelar'
    );
    if (confirmDelete) {
      dispatch(deleteThreat(threat.id));
      history.push('/meus-personagens');
    }
  };

  const handleViewMyCharacters = () => {
    history.push('/meus-personagens?tab=ameacas');
  };

  const handleExport = () => resultRef.current;

  function encodeFoundryJSON(json: unknown) {
    return `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(json)
    )}`;
  }

  const handleFoundryExport = () => {
    setLoadingFoundry(true);

    // Simulate a small delay for better UX
    setTimeout(() => {
      const foundryJSON = convertThreatToFoundry(threat);
      const encodedJSON = encodeFoundryJSON(foundryJSON);

      const link = document.createElement('a');
      link.href = encodedJSON;
      link.download = `${threat.name}.json`;
      link.click();
      setLoadingFoundry(false);
    }, 300);
  };

  // Get tier name
  const tier = getTierDisplayName(
    getTierByChallengeLevel(threat.challengeLevel)
  );

  // Get numeric resistance value
  const getResistanceNumeric = (type: string) => {
    if (type === 'strong') {
      return threat.combatStats.strongSave;
    }
    if (type === 'medium') {
      return threat.combatStats.mediumSave;
    }
    return threat.combatStats.weakSave;
  };

  // Format resistance values
  const getResistanceValue = (type: string) => {
    const resistanceValue = getResistanceNumeric(type);
    return resistanceValue > 0 ? `+${resistanceValue}` : `${resistanceValue}`;
  };

  // Get resistance assignments (numeric and formatted)
  const fortResistNum = getResistanceNumeric(
    threat.resistanceAssignments.Fortitude
  );
  const refResistNum = getResistanceNumeric(
    threat.resistanceAssignments.Reflexos
  );
  const vonResistNum = getResistanceNumeric(
    threat.resistanceAssignments.Vontade
  );
  const fortResist = getResistanceValue(threat.resistanceAssignments.Fortitude);
  const refResist = getResistanceValue(threat.resistanceAssignments.Reflexos);
  const wonResist = getResistanceValue(threat.resistanceAssignments.Vontade);

  // Get initiative and perception values
  const initiativeSkill = threat.skills.find((s) => s.name === 'Iniciativa');
  const initiativeValue = initiativeSkill?.total || 0;
  const perceptionSkill = threat.skills.find((s) => s.name === 'Percepção');
  const perceptionValue = perceptionSkill?.total || 0;

  // Format attributes
  const formatAttribute = (attr: Atributo) => {
    const value = threat.attributes[attr];
    return `${attr.substring(0, 3).toUpperCase()} ${value}`;
  };

  // Breadcrumb items
  const breadcrumbItems: BreadcrumbItem[] = isSavedToCloud
    ? [
        { label: 'Home', href: '/', icon: <HomeIcon fontSize='small' /> },
        {
          label: 'Meus Personagens',
          href: '/meus-personagens?tab=ameacas',
        },
        { label: threat.name, icon: <ThreatIcon fontSize='small' /> },
      ]
    : [
        { label: 'Home', href: '/', icon: <HomeIcon fontSize='small' /> },
        { label: 'Gerador de Ameaças', href: '/gerador-ameacas' },
        { label: 'Resultado' },
      ];

  return (
    <>
      {!viewOnly && <ConfirmDialog />}
      <Container maxWidth='xl' sx={{ py: 2 }}>
        {/* Breadcrumb Navigation */}
        {!viewOnly && <BreadcrumbNav items={breadcrumbItems} />}

        {/* Action Buttons */}
        {showExportButton && !viewOnly && (
          <Card sx={{ p: 2, mb: 2 }}>
            <Stack
              spacing={1}
              direction={isMobile ? 'column' : 'row'}
              sx={{
                '& button': {
                  minHeight: isMobile ? '44px' : 'auto',
                  fontSize: isMobile ? '16px' : '14px',
                },
              }}
            >
              {/* Save to Cloud Button */}
              {isAuthenticated && onSaveToCloud && (
                <Button
                  variant={isSavedToCloud ? 'contained' : 'outlined'}
                  color={isSavedToCloud ? 'success' : 'warning'}
                  onClick={handleSaveToCloud}
                  fullWidth={isMobile}
                  disabled={isSaving || isSavedToCloud}
                  sx={{
                    justifyContent: 'flex-start',
                    borderWidth: isSavedToCloud ? 1 : 2,
                    fontWeight: isSavedToCloud ? 'normal' : 'bold',
                  }}
                  startIcon={
                    // eslint-disable-next-line no-nested-ternary
                    isSaving ? (
                      <CircularProgress size={20} />
                    ) : isSavedToCloud ? (
                      <CheckCircleIcon />
                    ) : (
                      <WarningIcon />
                    )
                  }
                >
                  {/* eslint-disable-next-line no-nested-ternary */}
                  {isSaving
                    ? 'Salvando...'
                    : isSavedToCloud
                    ? 'Salvo na Nuvem'
                    : 'Não Salvo - Clique para Salvar'}
                </Button>
              )}

              {/* PDF Export Button */}
              <ReactToPrint
                trigger={() => (
                  <Button
                    variant='outlined'
                    fullWidth={isMobile}
                    disabled={loadingPDF}
                    sx={{ justifyContent: 'flex-start' }}
                    startIcon={
                      loadingPDF ? <CircularProgress size={20} /> : <PdfIcon />
                    }
                  >
                    {loadingPDF ? 'Gerando PDF...' : 'Gerar PDF'}
                  </Button>
                )}
                content={handleExport}
                documentTitle={`${threat.name} - ${threat.type} ND ${threat.challengeLevel}`}
              />

              {/* Foundry Export Button */}
              <Button
                variant='outlined'
                onClick={handleFoundryExport}
                fullWidth={isMobile}
                disabled={loadingFoundry}
                sx={{ justifyContent: 'flex-start' }}
                startIcon={
                  loadingFoundry ? (
                    <CircularProgress size={20} />
                  ) : (
                    <ExtensionIcon />
                  )
                }
              >
                {loadingFoundry ? 'Exportando...' : 'Exportar para Foundry'}
              </Button>

              {/* Edit Button */}
              {onEdit && (
                <Button
                  variant='outlined'
                  onClick={onEdit}
                  fullWidth={isMobile}
                  sx={{ justifyContent: 'flex-start' }}
                  startIcon={<EditIcon />}
                >
                  Editar
                </Button>
              )}

              {/* View My Characters Button */}
              <Button
                variant='outlined'
                onClick={handleViewMyCharacters}
                fullWidth={isMobile}
                sx={{ justifyContent: 'flex-start' }}
                startIcon={<HistoryIcon />}
              >
                Meus Personagens
              </Button>

              {/* Delete Button */}
              {isFromHistory && (
                <Button
                  variant='outlined'
                  color='error'
                  onClick={handleDelete}
                  fullWidth={isMobile}
                  sx={{ justifyContent: 'flex-start' }}
                  startIcon={<DeleteIcon />}
                >
                  Excluir
                </Button>
              )}
            </Stack>
          </Card>
        )}

        <Card ref={resultRef} sx={{ p: 2, mt: viewOnly ? 0 : 2 }}>
          <div className='simpleSeetName'>{threat.name}</div>
          {threat.type} {threat.size} {threat.role}, ND {threat.challengeLevel}{' '}
          ({tier})
          <div className='simpleSheetDivisor' />
          <Box display='inline'>
            <Box
              component='span'
              onClick={() => handleSkillRoll('Iniciativa', initiativeValue)}
              sx={{
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'all 0.2s ease',
                borderRadius: 1,
                px: 0.5,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                  color: theme.palette.primary.main,
                },
              }}
              title='Rolar Iniciativa'
            >
              <span className='simpleSheetText'>Iniciativa</span>{' '}
              {initiativeValue > 0
                ? `+${initiativeValue}`
                : `${initiativeValue}`}
            </Box>
            ,{' '}
            <Box
              component='span'
              onClick={() => handleSkillRoll('Percepção', perceptionValue)}
              sx={{
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'all 0.2s ease',
                borderRadius: 1,
                px: 0.5,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                  color: theme.palette.primary.main,
                },
              }}
              title='Rolar Percepção'
            >
              <span className='simpleSheetText'>Percepção</span>{' '}
              {perceptionValue > 0
                ? `+${perceptionValue}`
                : `${perceptionValue}`}
            </Box>
          </Box>
          <Box display='inline'>
            <span className='simpleSheetText'>Defesa</span>{' '}
            {threat.combatStats.defense},{' '}
            <Box
              component='span'
              onClick={() => handleSkillRoll('Fortitude', fortResistNum)}
              sx={{
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'all 0.2s ease',
                borderRadius: 1,
                px: 0.5,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                  color: theme.palette.primary.main,
                },
              }}
              title='Rolar Fortitude'
            >
              <span className='simpleSheetText'>Fort</span> {fortResist}
            </Box>
            ,{' '}
            <Box
              component='span'
              onClick={() => handleSkillRoll('Reflexos', refResistNum)}
              sx={{
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'all 0.2s ease',
                borderRadius: 1,
                px: 0.5,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                  color: theme.palette.primary.main,
                },
              }}
              title='Rolar Reflexos'
            >
              <span className='simpleSheetText'>Ref</span> {refResist}
            </Box>
            ,{' '}
            <Box
              component='span'
              onClick={() => handleSkillRoll('Vontade', vonResistNum)}
              sx={{
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'all 0.2s ease',
                borderRadius: 1,
                px: 0.5,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                  color: theme.palette.primary.main,
                },
              }}
              title='Rolar Vontade'
            >
              <span className='simpleSheetText'>Von</span> {wonResist}
            </Box>
            {threat.abilities && threat.abilities.length > 0 && (
              <>
                , <span className='simpleSheetText'>CD</span>{' '}
                {threat.combatStats.standardEffectDC}
              </>
            )}
          </Box>
          <div>
            <span className='simpleSheetText'>Pontos de Vida</span>{' '}
            {threat.combatStats.hitPoints}
          </div>
          <div>
            <span className='simpleSheetText'>Deslocamento</span>{' '}
            {threat.displacement}
          </div>
          <div className='simpleSheetDivisor' />
          {threat.combatStats.manaPoints &&
            threat.combatStats.manaPoints > 0 && (
              <div>
                <span className='simpleSheetText'>Pontos de Mana</span>{' '}
                {threat.combatStats.manaPoints}
              </div>
            )}
          <div>
            <span className='simpleSheetText'>Ataques</span>
          </div>
          {threat.attacks.length === 0 ? (
            <div>Nenhum ataque configurado</div>
          ) : (
            threat.attacks.map((attack) => (
              <Box
                key={getKey(attack.name)}
                onClick={() => handleAttackClick(attack)}
                sx={{
                  cursor: 'pointer',
                  userSelect: 'none',
                  transition: 'all 0.2s ease',
                  borderRadius: 1,
                  px: 0.5,
                  mx: -0.5,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                    color: theme.palette.primary.main,
                  },
                  '&:active': {
                    transform: 'scale(0.99)',
                  },
                }}
                title={`Rolar ataque: ${attack.name}`}
              >
                {attack.name} +{attack.attackBonus} ({attack.damageDice}
                {attack.bonusDamage > 0 ? `+${attack.bonusDamage}` : ''},{' '}
                {attack.criticalThreshold || 20}/x
                {attack.criticalMultiplier || 2})
              </Box>
            ))
          )}
          <div className='simpleSheetDivisor' />
          <div>
            <span className='simpleSheetText'>
              {formatAttribute(Atributo.FORCA)},{' '}
              {formatAttribute(Atributo.DESTREZA)},{' '}
              {formatAttribute(Atributo.CONSTITUICAO)},{' '}
              {formatAttribute(Atributo.INTELIGENCIA)},{' '}
              {formatAttribute(Atributo.SABEDORIA)},{' '}
              {formatAttribute(Atributo.CARISMA)}
            </span>
          </div>
          <div className='simpleSheetDivisor' />
          <div>
            <span className='simpleSheetText'>Equipamento</span>{' '}
            {threat.equipment || 'Nenhum equipamento especificado.'}
          </div>
          <div className='simpleSheetDivisor' />
          <div>
            <span className='simpleSheetText'>Tesouro</span>{' '}
            {threat.treasureLevel}
          </div>
          {threat.abilities.length > 0 && (
            <>
              <div className='simpleSheetDivisor' />

              {threat.abilities.map((ability) => (
                <div key={getKey(ability.name)}>
                  {ability.rolls && ability.rolls.length > 0 ? (
                    <Box
                      component='span'
                      onClick={() =>
                        handleAbilityNameClick(
                          ability.name,
                          ability.rolls || []
                        )
                      }
                      sx={{
                        cursor: 'pointer',
                        userSelect: 'none',
                        transition: 'all 0.2s ease',
                        borderRadius: 1,
                        px: 0.5,
                        mx: -0.5,
                        '&:hover': {
                          backgroundColor: theme.palette.action.hover,
                          color: theme.palette.primary.main,
                        },
                      }}
                      title={`Rolar ${ability.name}`}
                    >
                      <span className='simpleSheetText'>{ability.name}:</span>
                    </Box>
                  ) : (
                    <span className='simpleSheetText'>{ability.name}: </span>
                  )}{' '}
                  {ability.description}
                  {ability.rolls && ability.rolls.length > 0 && (
                    <Box component='span' sx={{ ml: 1 }}>
                      {ability.rolls.map((roll) => (
                        <Box
                          key={roll.id}
                          component='span'
                          onClick={() => handleAbilityRoll(ability.name, roll)}
                          sx={{
                            cursor: 'pointer',
                            userSelect: 'none',
                            transition: 'all 0.2s ease',
                            borderRadius: 1,
                            px: 0.5,
                            mx: 0.25,
                            backgroundColor: theme.palette.action.selected,
                            '&:hover': {
                              backgroundColor: theme.palette.primary.main,
                              color: theme.palette.primary.contrastText,
                            },
                          }}
                          title={`Rolar ${roll.name}: ${roll.dice}${
                            roll.bonus >= 0 ? `+${roll.bonus}` : roll.bonus
                          }`}
                        >
                          🎲 {roll.name}: {roll.dice}
                          {roll.bonus !== 0 &&
                            (roll.bonus >= 0
                              ? `+${roll.bonus}`
                              : `${roll.bonus}`)}
                        </Box>
                      ))}
                    </Box>
                  )}
                </div>
              ))}
            </>
          )}
          {/* Show only trained skills (excluding resistance tests) */}
          {threat.skills.filter(
            (skill) =>
              skill.trained &&
              !['Vontade', 'Fortitude', 'Reflexos'].includes(skill.name)
          ).length > 0 && (
            <>
              <div className='simpleSheetDivisor' />

              <div>
                <span className='simpleSheetText'>Perícias</span>{' '}
                {threat.skills
                  .filter(
                    (skill) =>
                      skill.trained &&
                      !['Vontade', 'Fortitude', 'Reflexos'].includes(skill.name)
                  )
                  .map((skill, idx, arr) => (
                    <span key={getKey(skill.name)}>
                      {skill.name}{' '}
                      {skill.total > 0 ? `+${skill.total}` : `${skill.total}`}
                      {idx + 1 < arr.length ? ', ' : '.'}
                    </span>
                  ))}
              </div>
            </>
          )}
        </Card>
      </Container>
    </>
  );
};

export default ThreatResult;
