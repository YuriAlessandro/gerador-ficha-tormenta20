import React from 'react';
import CharacterSheet from '../interfaces/CharacterSheet';
import Attribute from './Attribute';
import CharacterStat from './CharacterStat';
import Divider from './SheetDivider';
import Weapon from './Weapon';

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
    />
  ));

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

  const weapons = equipamentos.filter(
    (equipament) => equipament.group === 'Arma'
  );

  const equipamentosDiv = weapons.map((equip) => <Weapon equipment={equip} />);

  return (
    <div className='resultMainDiv'>
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
            <span className='resultItem className'>{` ${classe.name}`}</span>
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

        <div className='resultRow'>
          <CharacterStat name='Defesa' value={defesa} isMovement={false} />
          <CharacterStat name='PV' value={pv} isMovement={false} />
          <CharacterStat name='PM' value={pm} isMovement={false} />
          <CharacterStat name='Deslocamento' value={9} isMovement />
        </div>
      </div>

      <Divider />

      <div className='attributesRow'>{atributosDiv}</div>

      <Divider />

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

      <Divider />

      <div className='sectionTitle'>
        <span>Equipamentos</span>
      </div>

      <div className='equipaments'>
        <div>{equipamentosDiv}</div>
        <span className='resultItem'>
          <strong>Penalidade de Armadura</strong> {armorPenalty * -1}
        </span>
      </div>

      <Divider />

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

      <Divider />
      <div className='sectionTitle'>
        <span>Magias</span>
      </div>

      <div className='resultRow'>
        <div>
          {classe.magics.length === 0 && (
            <ul>
              <li>Não possui.</li>
            </ul>
          )}
        </div>
      </div>

      <div className='resultRow' />
    </div>
  );
};

export default Result;
