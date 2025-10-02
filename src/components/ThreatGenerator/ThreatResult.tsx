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
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Casino as CasinoIcon,
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
import { ThreatSheet } from '../../interfaces/ThreatSheet';
import {
  getTierDisplayName,
  getTierByChallengeLevel,
} from '../../functions/threatGenerator';
import { Atributo } from '../../data/atributos';
import { deleteThreat } from '../../store/slices/threatStorage';
import BreadcrumbNav, { BreadcrumbItem } from '../common/BreadcrumbNav';

interface ThreatResultProps {
  threat: ThreatSheet;
  onEdit?: () => void;
  isFromHistory?: boolean;
  isSavedToCloud?: boolean;
  onSaveToCloud?: () => Promise<void>;
}

const ThreatResult: React.FC<ThreatResultProps> = ({
  threat,
  onEdit,
  isFromHistory = false,
  isSavedToCloud = false,
  onSaveToCloud,
}) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { showConfirm, ConfirmDialog } = useConfirm();
  const { isAuthenticated } = useAuth();
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

  // Format resistance values
  const getResistanceValue = (type: string) => {
    let resistanceValue = threat.combatStats.weakSave;
    if (type === 'strong') {
      resistanceValue = threat.combatStats.strongSave;
    } else if (type === 'medium') {
      resistanceValue = threat.combatStats.mediumSave;
    }
    return resistanceValue > 0 ? `+${resistanceValue}` : `${resistanceValue}`;
  };

  // Get resistance assignments
  const fortResist = getResistanceValue(threat.resistanceAssignments.Fortitude);
  const refResist = getResistanceValue(threat.resistanceAssignments.Reflexos);
  const wonResist = getResistanceValue(threat.resistanceAssignments.Vontade);

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
      <ConfirmDialog />
      <Container maxWidth='xl' sx={{ py: 2 }}>
        {/* Breadcrumb Navigation */}
        <BreadcrumbNav items={breadcrumbItems} />

        {/* Action Buttons */}
        {showExportButton && (
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
                    <CasinoIcon />
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

        <Card ref={resultRef} sx={{ p: 2, mt: 2 }}>
          <div className='simpleSeetName'>{threat.name}</div>
          {threat.type} {threat.size} {threat.role}, ND {threat.challengeLevel}{' '}
          ({tier})
          <div className='simpleSheetDivisor' />
          <div>
            <span className='simpleSheetText'>Iniciativa</span>{' '}
            {(() => {
              const initiative = threat.skills.find(
                (s) => s.name === 'Iniciativa'
              );
              const value = initiative?.total || 0;
              return value > 0 ? `+${value}` : `${value}`;
            })()}
            , <span className='simpleSheetText'>Percepção</span>{' '}
            {(() => {
              const perception = threat.skills.find(
                (s) => s.name === 'Percepção'
              );
              const value = perception?.total || 0;
              return value > 0 ? `+${value}` : `${value}`;
            })()}
          </div>
          <div>
            <span className='simpleSheetText'>Defesa</span>{' '}
            {threat.combatStats.defense},{' '}
            <span className='simpleSheetText'>Fort</span> {fortResist},{' '}
            <span className='simpleSheetText'>Ref</span> {refResist},{' '}
            <span className='simpleSheetText'>Von</span> {wonResist}
            {threat.abilities && threat.abilities.length > 0 && (
              <>
                , <span className='simpleSheetText'>CD</span>{' '}
                {threat.combatStats.standardEffectDC}
              </>
            )}
          </div>
          <div>
            <span className='simpleSheetText'>Pontos de Vida</span>{' '}
            {threat.combatStats.hitPoints}
          </div>
          <div>
            <span className='simpleSheetText'>Deslocamento</span>{' '}
            {threat.displacement}
          </div>
          <div className='simpleSheetDivisor' />
          {threat.combatStats.manaPoints && threat.combatStats.manaPoints > 0 && (
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
              <div key={getKey(attack.name)}>
                {attack.name} +{attack.attackBonus} ({attack.damageDice}
                {attack.bonusDamage > 0 ? `+${attack.bonusDamage}` : ''})
              </div>
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
                  <span className='simpleSheetText'>{ability.name}: </span>
                  {ability.description}
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
