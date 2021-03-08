import React from 'react';
import CharacterSheet from '../interfaces/CharacterSheet';

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
  } = sheet;

  function getKey(elementId: string) {
    return `${id}-${elementId}`;
  }

  const atributosDiv = atributos.map((atributo) => (
    <span key={getKey(atributo.name)} className='resultItem'>
      <strong>{atributo.name}</strong> {atributo.value} (
      {atributo.mod > 0 ? '+' : ''}
      {atributo.mod})
    </span>
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
  const equipamentosDiv = equipamentos.map((equip) => (
    <li key={getKey(equip.nome)}>{equip.nome}</li>
  ));
  const poderesConcedidos = devoto.poderes.map((poder) => (
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
      <div className='resultRow'>
        <span className='resultItem'>
          <strong>Nome</strong> {nome}
        </span>
        <span className='resultItem'>
          <strong>Classe</strong> {classe.name}
        </span>
        <span className='resultItem'>
          <strong>Raça</strong> {raca.name}{' '}
          {raca.oldRace && `(${raca.oldRace.name})`}
        </span>
        <span className='resultItem'>
          <strong>Nível</strong> {nivel}
        </span>
        <span className='resultItem'>
          <strong>Sexo</strong> {sexo}
        </span>
        {devoto.isDevoto && (
          <span className='resultItem'>
            <strong>Divindade</strong> {devoto.divindade.name}
          </span>
        )}
        <span className='resultItem'>
          <strong>Origem</strong> {origin.name}
        </span>
      </div>

      <div className='resultRow'>{atributosDiv}</div>

      <div className='resultRow'>
        <span className='resultItem'>
          <strong>PV</strong> {pv}
        </span>
        <span className='resultItem'>
          <strong>PM</strong> {pm}
        </span>
        <span className='resultItem'>
          <strong>Defesa</strong> {defesa}
        </span>
      </div>

      <div className='resultRow'>
        <div>
          <strong>Perícias Treinadas:</strong>
          <ul>{periciasDiv}</ul>
        </div>
      </div>

      <div className='resultRow'>
        <div>
          <strong>Proeficiências</strong>
          <ul>{proeficienciasDiv}</ul>
        </div>
      </div>

      <div className='resultRow'>
        <div>
          <strong>Equipamento Inicial</strong>
          <ul>{equipamentosDiv}</ul>
        </div>
      </div>

      <div className='resultRow'>
        <div>
          <strong>Habilidades de Raça</strong>
          <ul>{habilidadesRacaDiv}</ul>
        </div>
      </div>

      <div className='resultRow'>
        <div>
          <strong>Habilidades de Classe</strong>
          <ul>{habilidadesClasseDiv}</ul>
        </div>
      </div>

      {origin.powers.length > 0 && (
        <div className='resultRow'>
          <div>
            <strong>Poderes da Origem</strong>
            <ul>{originPowers}</ul>
          </div>
        </div>
      )}

      <div className='resultRow'>
        <div>
          <strong>Magias</strong>
          {classe.magics.length === 0 && (
            <ul>
              <li>Não possui.</li>
            </ul>
          )}
        </div>
      </div>

      {devoto.isDevoto && (
        <div className='resultRow'>
          <div>
            <strong>Poderes Concedidos</strong>
            <ul>{poderesConcedidos}</ul>
          </div>
        </div>
      )}

      <div className='resultRow' />
    </div>
  );
};

export default Result;
