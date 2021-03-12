import React, { useEffect } from 'react';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ReactToPrint from 'react-to-print';
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

interface ResultProps {
  sheet: CharacterSheet;
}

const Result: React.FC<ResultProps> = (props) => {
  const { sheet } = props;

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
  } = sheet;

  function getKey(elementId: string) {
    return `${id}-${elementId}`;
  }

  const [isRacePowersVisible, setisRacePowersVisible] = React.useState<boolean>(
    false
  );

  const [isClassPowersVisible, setClassPowersVisible] = React.useState<boolean>(
    false
  );

  const [showExportButton, setExportButton] = React.useState<boolean>();

  const [
    isOriginPowersVisible,
    setOriginPowersVisible,
  ] = React.useState<boolean>(false);

  const [isGodPowersVisible, setGodPowersVisible] = React.useState<boolean>(
    false
  );

  const atributosDiv = Object.values(atributos).map((atributo) => (
    <Attribute
      name={atributo.name}
      mod={atributo.mod}
      id={id}
      value={atributo.value}
      key={getKey(atributo.name)}
    />
  ));

  let className = `${classe.name}`;
  if (classe.subname) className = `${className} (${classe.subname})`;

  const periciasSorted = skills.sort();

  const periciasDiv = periciasSorted.map((pericia) => (
    <li key={getKey(pericia)}>{pericia}</li>
  ));
  const habilidadesRacaDiv = raca.attributes.texts.map((hab) => (
    <li key={getKey(hab)}>{hab}</li>
  ));

  const habilidadesClasseDiv = classe.abilities.map((hab) => (
    <li key={getKey(hab.name)}>
      <strong>{hab.name}:</strong> {hab.text}
    </li>
  ));

  const proeficienciasDiv = classe.proeficiencias.map((proe) => (
    <li key={getKey(proe)}>{proe}</li>
  ));

  const equipsEntriesNoWeapons: Equipment[] = Object.entries(bag.equipments)
    .filter(([key]) => key !== 'Arma' && key !== 'Armadura' && key !== 'Escudo')
    .flatMap((value) => value[1]);

  const equipamentosDiv = equipsEntriesNoWeapons.map((equip) => (
    <li key={getKey(equip.nome)}>
      {equip.nome} {equip.peso && `- ${equip.peso}kg`}
    </li>
  ));

  const weaponsDiv = <Weapons getKey={getKey} weapons={bag.equipments.Arma} />;
  const defenseEquipments = [
    ...bag.equipments.Armadura,
    ...bag.equipments.Escudo,
  ];

  const poderesConcedidos = devoto?.poderes.map((poder) => (
    <li key={getKey(poder?.name)}>
      <strong>{poder?.name}: </strong> {poder?.description}
    </li>
  ));

  const originPowers = origin.powers
    ? origin.powers.map((power) => (
        <li key={getKey(power.name)}>
          <strong>{power.name}:</strong> {power.description}
        </li>
      ))
    : '';

  const resultRef = React.createRef<HTMLDivElement>();
  useEffect(() => {
    if (resultRef.current) {
      setExportButton(true);
    }
  }, [resultRef]);

  const handleExport = () => {
    setisRacePowersVisible(true);
    setClassPowersVisible(true);
    setOriginPowersVisible(true);
    setGodPowersVisible(true);

    return resultRef.current;
  };

  const keyAttr = classe.spellPath
    ? atributos[classe.spellPath.keyAttribute]
    : null;

  return (
    <div className='resultContainer'>
      <div
        style={{
          display: showExportButton ? 'flex' : 'none',
          marginLeft: '30px',
        }}
      >
        <ReactToPrint
          trigger={() => (
            <button className='exportBtn' type='button'>
              Exportar ou imprimir essa ficha
            </button>
          )}
          content={handleExport}
          documentTitle={`${nome} - ${classe.name} ${raca.name}`}
        />
      </div>

      <div className='resultMainDiv' ref={resultRef}>
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
              <span className='resultItem originName'>{origin.name}</span>
              {devoto && (
                <span className='resultItem'>
                  {`devoto de ${devoto.divindade.name}`}
                </span>
              )}
            </div>
          </div>

          <div className='stats'>
            <CharacterStat name='PV' value={pv} />
            <CharacterStat name='PM' value={pm} />
            <CharacterStat name='Defesa' value={defesa} />
            <CharacterStat
              name='Deslocamento'
              value={displacement}
              isMovement
            />
          </div>
        </div>

        <Divider direction='down' />

        <div className='attributesRow'>{atributosDiv}</div>

        <Divider direction='down' />

        <div className='condense'>
          <div className='resultRow'>
            <div>
              <strong>Proficiências</strong>
              <div>{proeficienciasDiv}</div>
            </div>
          </div>

          <div className='resdivtRow'>
            <div>
              <strong>Perícias Treinadas:</strong>
              <div>{periciasDiv}</div>
            </div>
          </div>
        </div>

        <Divider direction='down' />

        <div className='sectionTitle'>
          <span>Equipamentos</span>
        </div>

        <div className='equipaments'>
          <div className='tableWrap'>{weaponsDiv}</div>
          <div className='tableWrap'>
            <DefenseEquipments
              getKey={getKey}
              defenseEquipments={defenseEquipments}
            />
          </div>
          <div className='textToRight equipmentsValues'>
            <span>
              <strong>Penalidade de Armadura:</strong> {bag.armorPenalty * -1}
            </span>
          </div>
          <div className='tableWrap'>{equipamentosDiv}</div>
          <div className='textToRight equipmentsValues'>
            <span>
              <strong>Peso (atual/máximo):</strong> {bag.weight}/{maxWeight}kg
            </span>
          </div>
        </div>

        <Divider direction='down' />

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
              className={`powerIcon ${isRacePowersVisible ? 'down' : 'normal'}`}
            />
            <strong>Habilidades de {raca.name}</strong>
          </div>
          <div style={{ display: `${isRacePowersVisible ? 'block' : 'none'}` }}>
            <ul>{habilidadesRacaDiv}</ul>
          </div>
        </div>

        <div className='resultRow powers'>
          <div
            className='powersNameRow'
            onClick={() => setClassPowersVisible(!isClassPowersVisible)}
            onKeyDown={() => setClassPowersVisible(!isClassPowersVisible)}
            role='button'
            tabIndex={0}
          >
            <ChevronRightIcon
              className={`powerIcon ${
                isClassPowersVisible ? 'down' : 'normal'
              }`}
            />
            <strong>Habilidades de {classe.name}</strong>
          </div>
          <div
            style={{ display: `${isClassPowersVisible ? 'block' : 'none'}` }}
          >
            <ul>{habilidadesClasseDiv}</ul>
          </div>
        </div>

        {origin.powers.length > 0 && (
          <div className='resultRow powers'>
            <div
              className='powersNameRow'
              onClick={() => setOriginPowersVisible(!isOriginPowersVisible)}
              onKeyDown={() => setOriginPowersVisible(!isOriginPowersVisible)}
              role='button'
              tabIndex={0}
            >
              <ChevronRightIcon
                className={`powerIcon ${
                  isOriginPowersVisible ? 'down' : 'normal'
                }`}
              />
              <strong>Habilidades de {origin.name}</strong>
            </div>
            <div
              style={{ display: `${isOriginPowersVisible ? 'block' : 'none'}` }}
            >
              <ul>{originPowers}</ul>
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
              style={{ display: `${isGodPowersVisible ? 'block' : 'none'}` }}
            >
              <ul>{poderesConcedidos}</ul>
            </div>
          </div>
        )}

        <Divider direction='down' />

        <div className='sectionTitle'>
          <span>Magias</span>
        </div>

        <div className='tableWrap tableDesk'>
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
  );
};

export default Result;
