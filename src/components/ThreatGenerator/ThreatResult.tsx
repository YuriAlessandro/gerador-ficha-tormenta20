import React from 'react';
import ReactToPrint from 'react-to-print';
import { Card, Container } from '@mui/material';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useAlert, useConfirm } from '../../hooks/useDialog';
import { convertThreatToFoundry } from '../../2foundry';
import { ThreatSheet } from '../../interfaces/ThreatSheet';
import {
  getTierDisplayName,
  getTierByChallengeLevel,
} from '../../functions/threatGenerator';
import { Atributo } from '../../data/atributos';
import { saveThreat, deleteThreat } from '../../store/slices/threatStorage';

interface ThreatResultProps {
  threat: ThreatSheet;
  onEdit?: () => void;
  isFromHistory?: boolean;
}

const ThreatResult: React.FC<ThreatResultProps> = ({
  threat,
  onEdit,
  isFromHistory = false,
}) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { showAlert, AlertDialog } = useAlert();
  const { showConfirm, ConfirmDialog } = useConfirm();
  const [showExportButton, setExportButton] = React.useState<boolean>();
  const [loadingFoundry, setLoadingFoundry] = React.useState(false);

  const resultRef = React.createRef<HTMLDivElement>();

  React.useEffect(() => {
    if (resultRef.current) {
      setExportButton(true);
    }
  }, [resultRef]);

  function getKey(elementId: string) {
    return `${threat.id}-${elementId}`;
  }

  const handleSave = () => {
    dispatch(saveThreat(threat));
    showAlert('Ameaça salva no histórico!', 'Sucesso');
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
      history.push('/threat-generator');
    }
  };

  const handleBack = () => {
    if (isFromHistory) {
      history.push('/threat-history');
    } else {
      history.push('/threat-generator');
    }
  };

  const handleViewHistory = () => {
    history.push('/threat-history');
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

  return (
    <>
      <AlertDialog />
      <ConfirmDialog />
      <Container maxWidth='xl'>
        <div className='exportButtonsContainer'>
          <div
            style={{
              display: showExportButton ? 'flex' : 'none',
              gap: '10px',
              marginBottom: '10px',
            }}
          >
            <ReactToPrint
              trigger={() => (
                <button className='exportBtn' type='button'>
                  📄 Exportar ou imprimir PDF
                </button>
              )}
              content={handleExport}
              documentTitle={`${threat.name} - ${threat.type} ND ${threat.challengeLevel}`}
            />

            <button
              className='exportBtn'
              type='button'
              onClick={handleFoundryExport}
              disabled={loadingFoundry}
              style={{
                backgroundColor: loadingFoundry ? '#6c757d' : '#9c27b0',
                opacity: loadingFoundry ? 0.7 : 1,
              }}
            >
              {loadingFoundry ? '⏳ Exportando...' : '🎲 Exportar para Foundry'}
            </button>

            <button
              className='exportBtn'
              type='button'
              onClick={handleBack}
              style={{ backgroundColor: '#6c757d' }}
            >
              Voltar
            </button>

            {!isFromHistory && (
              <button
                className='exportBtn'
                type='button'
                onClick={handleSave}
                style={{ backgroundColor: '#28a745' }}
              >
                Salvar no Histórico
              </button>
            )}

            <button
              className='exportBtn'
              type='button'
              onClick={handleViewHistory}
              style={{ backgroundColor: '#17a2b8' }}
            >
              Ver Histórico
            </button>

            {onEdit && (
              <button
                className='exportBtn'
                type='button'
                onClick={onEdit}
                style={{ backgroundColor: '#007bff' }}
              >
                Editar
              </button>
            )}

            {isFromHistory && (
              <button
                className='exportBtn'
                type='button'
                onClick={handleDelete}
                style={{ backgroundColor: '#dc3545' }}
              >
                Excluir
              </button>
            )}
          </div>
        </div>

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
