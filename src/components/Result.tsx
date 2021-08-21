/* eslint-disable jsx-a11y/anchor-has-content */
import React, { useEffect } from 'react';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ReactToPrint from 'react-to-print';
import BugReportIcon from '@material-ui/icons/BugReport';
import CharacterSheet from '../interfaces/CharacterSheet';
import Attribute from './Attribute';
import CharacterStat from './CharacterStat';
import Divider from './SheetDivider';
import Weapons from './Weapons';
import DefenseEquipments from './DefenseEquipments';
import Equipment from '../interfaces/Equipment';

import '../assets/css/result.css';
import Spells from './Spells';
import SpellsMobile from './SpellsMobile';
import { convertToFoundry, FoundryJSON } from '../2foundry';

interface ResultProps {
  sheet: CharacterSheet;
  isDarkMode: boolean;
}

const Result: React.FC<ResultProps> = (props) => {
  const { sheet, isDarkMode } = props;

  const {
    nome,
    sexo,
    nivel,
    atributos,
    raca,
    classe,
    skills,
    pv,
    pm,
    defesa,
    bag,
    id,
    devoto,
    origin,
    spells,
    displacement,
    maxWeight,
    generalPowers,
    classPowers,
    steps,
    extraArmorPenalty = 0,
  } = sheet;

  function getKey(elementId: string) {
    return `${id}-${elementId}`;
  }

  function encodeFoundryJSON(json: FoundryJSON | undefined) {
    if (json) {
      return `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(json)
      )}`;
    }

    return '';
  }

  const foundryJSON = convertToFoundry(sheet);
  const encodedJSON = encodeFoundryJSON(foundryJSON);

  const [isRacePowersVisible, setisRacePowersVisible] = React.useState<boolean>(
    true
  );

  const [
    isClassAbilitiesBisible,
    setClassAbilitiesVisible,
  ] = React.useState<boolean>(true);

  const [
    generalPowersVisible,
    setGeneralPowersVisible,
  ] = React.useState<boolean>(true);

  const [classPowersVisible, setClassPowersVisible] = React.useState<boolean>(
    true
  );

  const [showExportButton, setExportButton] = React.useState<boolean>();

  const [
    isOriginPowersVisible,
    setOriginPowersVisible,
  ] = React.useState<boolean>(true);

  const [isGodPowersVisible, setGodPowersVisible] = React.useState<boolean>(
    true
  );

  const atributosDiv = Object.values(atributos).map((atributo) => (
    <Attribute
      name={atributo.name}
      mod={atributo.mod}
      id={id}
      value={atributo.value}
      key={getKey(atributo.name)}
      isDarkMode={isDarkMode}
    />
  ));

  let className = `${classe.name}`;
  if (classe.subname) className = `${className} (${classe.subname})`;

  const periciasSorted = skills.sort();

  const periciasDiv = periciasSorted.map((pericia) => (
    <li key={getKey(pericia)}>{pericia}</li>
  ));
  const habilidadesRacaDiv = raca.abilities.map((hab) => (
    <li key={getKey(hab.name)}>
      <strong>{hab.name}</strong>: {hab.description}
    </li>
  ));

  const habilidadesClasseDiv = classe.abilities.map((hab) => (
    <li key={getKey(hab.name)}>
      <strong>{hab.name}:</strong> {hab.text}
    </li>
  ));

  const proficienciasDiv = classe.proficiencias.map((proe) => (
    <li key={getKey(proe)}>{proe}</li>
  ));

  const bagEquipments = bag.getEquipments();

  const equipsEntriesNoWeapons: Equipment[] = Object.entries(bagEquipments)
    .filter(([key]) => key !== 'Arma' && key !== 'Armadura' && key !== 'Escudo')
    .flatMap((value) => value[1]);

  const equipamentosDiv = equipsEntriesNoWeapons.map((equip) => (
    <li key={getKey(equip.nome)}>
      {equip.nome} {equip.peso && `- ${equip.peso}kg`}
    </li>
  ));

  const weaponsDiv = <Weapons getKey={getKey} weapons={bagEquipments.Arma} />;
  const defenseEquipments = [
    ...bagEquipments.Armadura,
    ...bagEquipments.Escudo,
  ];

  const poderesConcedidos = devoto?.poderes.map((poder) => (
    <li key={getKey(poder?.name)}>
      <strong>{poder?.name}: </strong> {poder?.description}
    </li>
  ));

  const originPowers = origin?.powers
    ? origin?.powers.map((power) => (
        <li key={getKey(power.name)}>
          <strong>{power.name}:</strong> {power.description}
        </li>
      ))
    : '';

  const generalPowersDiv = generalPowers
    ? generalPowers.map((power) => (
        <li key={getKey(power.name)}>
          <strong>{power.name}:</strong> {power.description}
        </li>
      ))
    : '';

  const classPowersDiv = classPowers
    ? classPowers.map((power) => (
        <li key={getKey(power.name)}>
          <strong>{power.name}:</strong> {power.text}
        </li>
      ))
    : '';

  const resultRef = React.createRef<HTMLDivElement>();
  useEffect(() => {
    if (resultRef.current) {
      setExportButton(true);
    }
  }, [resultRef]);

  const preparePrint = async () => {
    setisRacePowersVisible(true);
    setClassAbilitiesVisible(true);
    setOriginPowersVisible(true);
    setGodPowersVisible(true);
    setGeneralPowersVisible(true);
    setClassPowersVisible(true);

    return new Promise((resolve) => setTimeout(resolve, 10));
  };

  const handleExport = () => resultRef.current;

  const keyAttr = classe.spellPath
    ? atributos[classe.spellPath.keyAttribute]
    : null;

  const changesDiv = steps.map((step) => {
    if (step.type === 'Atributos') {
      return (
        <li key={getKey(`${step.label}-${step.value}`)}>
          <strong>{step.label}:</strong>
          <ul className='stepAttrList'>
            {step.value.map((attr) => (
              <li key={getKey(`${attr.name}-${attr.value}`)}>{`${attr.name}${
                attr.value ? ': ' : ''
              }${attr.value}`}</li>
            ))}
          </ul>
        </li>
      );
    }
    if (
      step.type === 'Perícias' ||
      step.type === 'Magias' ||
      step.type === 'Equipamentos'
    ) {
      return (
        <li key={getKey(step.label)}>
          <strong>{step.label}:</strong>
          <ul className='stepAttrList'>
            {step.value.map((attr) => (
              <li key={getKey(`${attr.name}-${attr.value}`)}>{attr.value}</li>
            ))}
          </ul>
        </li>
      );
    }
    if (step.type === 'Poderes' || step.type === 'Nível') {
      return (
        <li key={getKey(step.label)}>
          <strong>{step.label}:</strong>
          <ul>
            {step.value.map((attr) => (
              <li key={getKey(`${attr.name}-${attr.value}`)}>{`${attr.name}${
                attr.value ? ': ' : ''
              }${attr.value}`}</li>
            ))}
          </ul>
        </li>
      );
    }
    return (
      <li
        key={getKey(
          `${step.label}-${step.value[0] ? `: ${step.value[0].value}` : ''}`
        )}
      >
        <strong>{step.label}</strong>
        {`${step.value[0] ? `: ${step.value[0].value}` : ''}`}
      </li>
    );
  });

  return (
    <div className='resultContainer'>
      <div className='resultLeft'>
        <div className='exportButtonsContainer'>
          <div className='export-to-foundry'>
            <a
              href={encodedJSON}
              className='exportBtn'
              download={`${sheet.nome}.json`}
            >
              Exportar para o Foundry
            </a>
          </div>
          <div
            style={{
              display: showExportButton ? 'flex' : 'none',
            }}
          >
            <ReactToPrint
              trigger={() => (
                <button className='exportBtn' type='button'>
                  Exportar ou imprimir PDF
                </button>
              )}
              onBeforeGetContent={preparePrint}
              content={handleExport}
              documentTitle={`${nome} - ${classe.name} ${raca.name}`}
            />
          </div>
        </div>

        <div
          className={`resultMainDiv ${isDarkMode ? 'dark' : ''}`}
          ref={resultRef}
        >
          <div className='characterInfos'>
            <div>
              <div className='resultRow nameArea'>
                <span className='resultItem name'>
                  <strong>{nome}</strong>
                </span>
                {raca.name !== 'Golem' && (
                  <span>({sexo === 'Mulher' ? 'F' : 'M'})</span>
                )}
              </div>
              <div className='resultRow'>
                <span className='resultItem raceName'>
                  <strong>
                    {raca.name} {raca.oldRace && `(${raca.oldRace.name})`}
                  </strong>
                  -
                </span>
                <span className='resultItem className'>{`${className}`}</span>
                <span className='resultItem'>nível {nivel}</span>
              </div>
              <div className='resultRow'>
                {origin && (
                  <span className='resultItem originName'>{origin.name}</span>
                )}
                {devoto && (
                  <span className='resultItem'>
                    {`devoto de ${devoto.divindade.name}`}
                  </span>
                )}
              </div>
            </div>

            <div className='stats'>
              <CharacterStat isDarkMode={isDarkMode} name='PV' value={pv} />
              <CharacterStat isDarkMode={isDarkMode} name='PM' value={pm} />
              <CharacterStat
                isDarkMode={isDarkMode}
                name='Defesa'
                value={defesa}
              />
              <CharacterStat
                isDarkMode={isDarkMode}
                name='Deslocamento'
                value={displacement}
                isMovement
              />
            </div>
          </div>

          <Divider isDarkMode={isDarkMode} direction='down' />

          <div className='attributesRow'>{atributosDiv}</div>

          <Divider isDarkMode={isDarkMode} direction='down' />

          <div className='condense'>
            <div className='resultRow'>
              <div>
                <strong>Proficiências</strong>
                <div>{proficienciasDiv}</div>
              </div>
            </div>

            <div className='resdivtRow'>
              <div>
                <strong>Perícias Treinadas:</strong>
                <ul className='periciasDiv'>{periciasDiv}</ul>
              </div>
            </div>
          </div>

          <Divider isDarkMode={isDarkMode} direction='down' />

          <div className='sectionTitle'>
            <span>Equipamentos</span>
          </div>

          <div className='equipaments'>
            <div className={`tableWrap ${isDarkMode ? 'dark' : ''}`}>
              {weaponsDiv}
            </div>
            <div className={`tableWrap ${isDarkMode ? 'dark' : ''}`}>
              <DefenseEquipments
                getKey={getKey}
                defenseEquipments={defenseEquipments}
              />
            </div>
            <div className='textToRight equipmentsValues'>
              <span>
                <strong>Penalidade de Armadura:</strong>{' '}
                {(bag.getArmorPenalty() + extraArmorPenalty) * -1}
              </span>
            </div>
            <div className={`tableWrap ${isDarkMode ? 'dark' : ''}`}>
              {equipamentosDiv}
            </div>
            <div className='textToRight equipmentsValues'>
              <span>
                <strong>Peso (atual/máximo):</strong> {bag.getWeight()}/
                {maxWeight}kg
              </span>
            </div>
          </div>

          <div className='powersArea'>
            <Divider isDarkMode={isDarkMode} direction='down' />

            <div className='sectionTitle'>
              <span>Habilidades e Poderes</span>
            </div>

            <div className='resultRow powers'>
              <div
                className='powersNameRow'
                onClick={() => setisRacePowersVisible(!isRacePowersVisible)}
                role='button'
                tabIndex={0}
                onKeyDown={() => setisRacePowersVisible(!isRacePowersVisible)}
              >
                <ChevronRightIcon
                  className={`powerIcon ${
                    isRacePowersVisible ? 'down' : 'normal'
                  }`}
                />
                <strong>Habilidades de {raca.name}</strong>
              </div>
              <div
                style={{ display: `${isRacePowersVisible ? 'block' : 'none'}` }}
              >
                <ul>{habilidadesRacaDiv}</ul>
              </div>
            </div>

            <div className='resultRow powers'>
              <div
                className='powersNameRow'
                onClick={() =>
                  setClassAbilitiesVisible(!isClassAbilitiesBisible)
                }
                onKeyDown={() =>
                  setClassAbilitiesVisible(!isClassAbilitiesBisible)
                }
                role='button'
                tabIndex={0}
              >
                <ChevronRightIcon
                  className={`powerIcon ${
                    isClassAbilitiesBisible ? 'down' : 'normal'
                  }`}
                />
                <strong>Habilidades de {classe.name}</strong>
              </div>
              <div
                style={{
                  display: `${isClassAbilitiesBisible ? 'block' : 'none'}`,
                }}
              >
                <ul>{habilidadesClasseDiv}</ul>
              </div>
            </div>

            {origin && origin.powers.length > 0 && (
              <div className='resultRow powers'>
                <div
                  className='powersNameRow'
                  onClick={() => setOriginPowersVisible(!isOriginPowersVisible)}
                  onKeyDown={() =>
                    setOriginPowersVisible(!isOriginPowersVisible)
                  }
                  role='button'
                  tabIndex={0}
                >
                  <ChevronRightIcon
                    className={`powerIcon ${
                      isOriginPowersVisible ? 'down' : 'normal'
                    }`}
                  />
                  <strong>Habilidades de {origin?.name}</strong>
                </div>
                <div
                  style={{
                    display: `${isOriginPowersVisible ? 'block' : 'none'}`,
                  }}
                >
                  <ul>{originPowers}</ul>
                </div>
              </div>
            )}

            {classPowers && classPowers.length > 0 && (
              <div className='resultRow powers'>
                <div
                  className='powersNameRow'
                  onClick={() => setClassPowersVisible(!classPowersVisible)}
                  onKeyDown={() => setClassPowersVisible(!classPowersVisible)}
                  role='button'
                  tabIndex={0}
                >
                  <ChevronRightIcon
                    className={`powerIcon ${
                      classPowersVisible ? 'down' : 'normal'
                    }`}
                  />
                  <strong>Poderes de {className}</strong>
                </div>
                <div
                  style={{
                    display: `${classPowersVisible ? 'block' : 'none'}`,
                  }}
                >
                  <ul>{classPowersDiv}</ul>
                </div>
              </div>
            )}

            {generalPowers.length > 0 && (
              <div className='resultRow powers'>
                <div
                  className='powersNameRow'
                  onClick={() => setGeneralPowersVisible(!generalPowersVisible)}
                  onKeyDown={() =>
                    setGeneralPowersVisible(!generalPowersVisible)
                  }
                  role='button'
                  tabIndex={0}
                >
                  <ChevronRightIcon
                    className={`powerIcon ${
                      generalPowersVisible ? 'down' : 'normal'
                    }`}
                  />
                  <strong>Poderes Gerais</strong>
                </div>
                <div
                  style={{
                    display: `${generalPowersVisible ? 'block' : 'none'}`,
                  }}
                >
                  <ul>{generalPowersDiv}</ul>
                </div>
              </div>
            )}

            {devoto && (
              <div className='resultRow powers'>
                <div
                  className='powersNameRow'
                  onClick={() => setGodPowersVisible(!isGodPowersVisible)}
                  onKeyDown={() => setGodPowersVisible(!isGodPowersVisible)}
                  role='button'
                  tabIndex={0}
                >
                  <ChevronRightIcon
                    className={`powerIcon ${
                      isGodPowersVisible ? 'down' : 'normal'
                    }`}
                  />
                  <strong>Habilidades de {devoto.divindade.name}</strong>
                </div>
                <div
                  style={{
                    display: `${isGodPowersVisible ? 'block' : 'none'}`,
                  }}
                >
                  <ul>{poderesConcedidos}</ul>
                </div>
              </div>
            )}
          </div>

          <div className='spellsArea'>
            <Divider isDarkMode={isDarkMode} direction='down' />
            <div className='sectionTitle'>
              <span>Magias</span>
            </div>

            <div className={`tableWrap tableDesk ${isDarkMode ? 'dark' : ''}`}>
              <Spells
                spells={spells}
                spellPath={classe.spellPath}
                keyAttr={keyAttr}
                nivel={nivel}
              />
            </div>

            <div className='tableMobile'>
              <SpellsMobile
                spells={spells}
                spellPath={classe.spellPath}
                keyAttr={keyAttr}
                nivel={nivel}
              />
            </div>
          </div>
        </div>
      </div>
      <div className='resultRight'>
        <h1>Passo-a-Passo:</h1>
        <ol>{changesDiv}</ol>
        <p>
          <small style={{ display: 'flex', alignItems: 'center' }}>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                marginRight: '5px',
              }}
            >
              <BugReportIcon /> Encontrou algum problema nessa ficha?
            </span>
            <a
              target='blank'
              href='https://github.com/YuriAlessandro/gerador-ficha-tormenta20/discussions/categories/problemas'
            >
              Nos avise!
            </a>
          </small>
        </p>
      </div>
    </div>
  );
};

export default Result;
