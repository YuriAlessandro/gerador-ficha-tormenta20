/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import CharacterSheet from '../interfaces/CharacterSheet';
import Attribute from './Attribute';
import CharacterStat from './CharacterStat';
import Divider from './SheetDivider';
import Weapons from './Weapons';
import DefenseEquipments from './DefenseEquipments';
import Equipment from '../interfaces/Equipment';

import '../assets/css/result.css';

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
    pericias,
    pv,
    pm,
    defesa,
    bag,
    id,
    devoto,
    origin,
    spells,
    displacement,
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

  const periciasSorted = pericias.sort();

  const periciasDiv = periciasSorted.map((pericia) => (
    <li key={getKey(pericia)}>{pericia}</li>
  ));
  const habilidadesRacaDiv = raca.habilites.texts.map((hab) => (
    <li key={getKey(hab)}>{hab}</li>
  ));

  const habilidadesClasseDiv = classe.habilities.map((hab) => (
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
    <li key={getKey(equip.nome)}>{equip.nome}</li>
  ));

  const weaponsDiv = <Weapons getKey={getKey} weapons={bag.equipments.Arma} />;
  const defenseEquipments = [
    ...bag.equipments.Armadura,
    ...bag.equipments.Escudo,
  ];
  const defenseDiv = (
    <DefenseEquipments getKey={getKey} defenseEquipments={defenseEquipments} />
  );

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

  return (
    <div className='resultMainDiv'>
      <Divider direction='up' />
      <div className='characterInfos'>
        <div>
          <div className='resultRow nameArea'>
            <span className='resultItem name'>
              <strong>{nome}</strong>
            </span>
            <span>({sexo === 'Mulher' ? 'F' : 'M'})</span>
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
          <CharacterStat name='Deslocamento' value={displacement} isMovement />
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
        <div className='tableWrap'>{defenseDiv}</div>
        <div className='textToRight equipmentsValues'>
          <span>
            <strong>Penalidade de Armadura</strong> {bag.armorPenalty * -1}
          </span>
          <span>
            <strong>Peso</strong> {bag.weight}kg
          </span>
        </div>
        <div className='tableWrap'>{equipamentosDiv}</div>
        <span className='resultItem' />
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
        >
          <ChevronRightIcon />
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
          role='button'
          tabIndex={0}
        >
          <ChevronRightIcon />
          <strong>Habilidades de {classe.name}</strong>
        </div>
        <div style={{ display: `${isClassPowersVisible ? 'block' : 'none'}` }}>
          <ul>{habilidadesClasseDiv}</ul>
        </div>
      </div>

      {origin.powers.length > 0 && (
        <div className='resultRow powers'>
          <div
            className='powersNameRow'
            onClick={() => setOriginPowersVisible(!isOriginPowersVisible)}
            role='button'
            tabIndex={0}
          >
            <ChevronRightIcon />
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
            role='button'
            tabIndex={0}
          >
            <ChevronRightIcon />
            <strong>Habilidades de {devoto.divindade.name}</strong>
          </div>
          <div style={{ display: `${isGodPowersVisible ? 'block' : 'none'}` }}>
            <ul>{poderesConcedidos}</ul>
          </div>
        </div>
      )}

      <Divider direction='down' />

      <div className='sectionTitle'>
        <span>Magias</span>
      </div>

      <div className='resultRow'>
        <div>
          <ul>
            {classe.spellPath?.schools && (
              <li>
                Escolas:{' '}
                {classe.spellPath?.schools?.map((school) => (
                  <span key={school}>{school}, </span>
                ))}
              </li>
            )}
            {spells.length === 0 ? (
              <li>Não possui.</li>
            ) : (
              spells.map((spell) => (
                <li key={spell.nome}>
                  <strong>{spell.nome}</strong>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
      <Divider direction='up' />
    </div>
  );
};

export default Result;
