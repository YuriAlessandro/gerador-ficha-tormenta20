import React from 'react';
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
    equipamentos,
    id,
    devoto,
    origin,
    armorPenalty,
    spells,
  } = sheet;

  function getKey(elementId: string) {
    return `${id}-${elementId}`;
  }

  const atributosDiv = atributos.map((atributo) => (
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

  const equipsEntriesNoWeapons: Equipment[] = Object.entries(equipamentos)
    .filter(([key]) => key !== 'Arma' && key !== 'Armadura' && key !== 'Escudo')
    .flatMap((value) => value[1]);

  const equipamentosDiv = equipsEntriesNoWeapons.map((equip) => (
    <li key={getKey(equip.nome)}>{equip.nome}</li>
  ));

  const weaponsDiv = <Weapons getKey={getKey} weapons={equipamentos.Arma} />;
  const defenseEquipments = [...equipamentos.Armadura, ...equipamentos.Escudo];
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
          <CharacterStat name='PV' value={pv} isMovement={false} />
          <CharacterStat name='PM' value={pm} isMovement={false} />
          <CharacterStat name='Defesa' value={defesa} isMovement={false} />
          <CharacterStat name='Deslocamento' value={9} isMovement />
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
        <div className='textToRight'>
          <strong>Penalidade de Armadura</strong> {armorPenalty * -1}
        </div>
        <div className='tableWrap'>{equipamentosDiv}</div>
        <span className='resultItem' />
      </div>

      <Divider direction='down' />

      <div className='sectionTitle'>
        <span>Habilidades e Poderes</span>
      </div>

      <div className='resultRow'>
        <div>
          <strong>Habilidades de {raca.name}</strong>
          <ul>{habilidadesRacaDiv}</ul>
        </div>
      </div>

      <div className='resultRow'>
        <div>
          <strong>Habilidades de {classe.name}</strong>
          <ul>{habilidadesClasseDiv}</ul>
        </div>
      </div>

      {origin.powers.length > 0 && (
        <div className='resultRow'>
          <div>
            <strong>Poderes de {origin.name}</strong>
            <ul>{originPowers}</ul>
          </div>
        </div>
      )}

      {devoto && (
        <div className='resultRow'>
          <div>
            <strong>Poderes de {devoto.divindade.name}</strong>
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
