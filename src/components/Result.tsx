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
  } = sheet;

  const atributosDiv = atributos.map((atributo) => (
    <span key={atributo.name} className='resultItem'>
      <strong>{atributo.name}</strong> {atributo.value} (
      {atributo.mod > 0 ? '+' : ''}
      {atributo.mod})
    </span>
  ));

  const periciasSorted = pericias.sort();
  const periciasDiv = periciasSorted.map((pericia) => (
    <li key={pericia}>{pericia}</li>
  ));
  const habilidadesRacaDiv = raca.habilites.texts.map((hab) => (
    <li key={hab}>{hab}</li>
  ));
  const habilidadesClasseDiv = classe.habilities.map((hab) => (
    <li key={hab.name}>
      <strong>{hab.name}:</strong> {hab.text}
    </li>
  ));
  const proeficienciasDiv = classe.proeficiencias.map((proe) => (
    <li key={proe}>{proe}</li>
  ));
  // const equipamentosDiv = equipamentos.map(() => (
  //   <li key={}></li>
  // ));

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
        <span>
          <strong>Sexo</strong> {sexo}
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
          <ul>
            <li>A FAZER</li>
          </ul>
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

      <div className='resultRow' />
    </div>
  );
};

export default Result;
