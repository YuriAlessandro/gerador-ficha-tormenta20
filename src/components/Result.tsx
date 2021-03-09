import React from 'react';
import CharacterSheet from '../interfaces/CharacterSheet';
import Attribute from './Attribute';

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
      key={getKey(atributo.name)}
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
  const equipsEntriesNoWeapons = Object.entries(equipamentos).filter(
    ([key]) => key !== 'Arma'
  );

  const equipamentosDiv = equipsEntriesNoWeapons
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .map(([_, equips]) =>
      equips.map((equip) => <li key={getKey(equip.nome)}>{equip.nome}</li>)
    )
    .flat();

  const armasDiv = equipamentos.Arma.map((equip) => (
    <li key={getKey(equip.nome)}>{equip.nome}</li>
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

  return (
    <div className='resultMainDiv'>
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

      <div className='attributesRow'>{atributosDiv}</div>

      <div className='resultRow bordered'>
        <span className='resultItem'>
          <strong>PV</strong> {pv}
        </span>
        <span className='resultItem'>
          <strong>PM</strong> {pm}
        </span>
        <span className='resultItem'>
          <strong>Defesa</strong> {defesa}
        </span>
        <span className='resultItem'>
          <strong>Penalidade de Armadura</strong> {armorPenalty * -1}
        </span>
      </div>

      <div className='condense'>
        <div className='resultRow bordered'>
          <div>
            <strong>Perícias Treinadas:</strong>
            <ul>{periciasDiv}</ul>
          </div>
        </div>

        <div className='resultRow bordered'>
          <div>
            <strong>Proficiências</strong>
            <ul>{proeficienciasDiv}</ul>
          </div>
        </div>

        <div className='resultRow bordered'>
          <div>
            <strong>Equipamento</strong>
            <ul>{equipamentosDiv}</ul>
          </div>
        </div>
        <div className='resultRow bordered'>
          <div>
            <strong>Armas</strong>
            <ul>{armasDiv}</ul>
          </div>
        </div>
      </div>

      <div className='resultRow bordered'>
        <div>
          <strong>Habilidades de Raça</strong>
          <ul>{habilidadesRacaDiv}</ul>
        </div>
      </div>

      <div className='resultRow bordered'>
        <div>
          <strong>Habilidades de Classe</strong>
          <ul>{habilidadesClasseDiv}</ul>
        </div>
      </div>

      {origin.powers.length > 0 && (
        <div className='resultRow bordered'>
          <div>
            <strong>Poderes da Origem</strong>
            <ul>{originPowers}</ul>
          </div>
        </div>
      )}

      {devoto && (
        <div className='resultRow bordered'>
          <div>
            <strong>Poderes Concedidos</strong>
            <ul>{poderesConcedidos}</ul>
          </div>
        </div>
      )}

      <div className='resultRow bordered'>
        <div>
          <strong>Magias</strong>
          {classe.magics.length === 0 && (
            <ul>
              <li>Não possui.</li>
            </ul>
          )}
        </div>
      </div>

      <div className='resultRow bordered' />
    </div>
  );
};

export default Result;
