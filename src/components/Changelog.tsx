import React from 'react';

const Changelog = () => (
  <div style={{ padding: '0 30px' }}>
    <h1>Changelog</h1>
    <p>
      Segue a lista de mudanças no projeto. Última atualização em 07/03/2021.
    </p>
    <h2>Versão 0.1</h2>
    <ul>
      <li>
        Adicionamos a funcionalidade basica de gerar uma ficha de nível 1.
      </li>
      <li>
        Geração aleatório de atributos, considerando os modificadores
        corretamente.
      </li>
      <li>
        Habilidades de raça ou classe que garantam modificações de atributo e/ou
        novas perícias já são automaticamente consideradas.
      </li>
      <li>Escolha aleatória de perícias (respeitando regras da classe).</li>
      <li>
        Suporte as seguintes classes: Bárbaro, Bucaneiro, Caçador, Cavaleiro,
        Guerreiro, Inventor, Ladino, Lutador, Nobre e Paladino.
      </li>
      <li>
        Suporte as seguintes raças: Anão, Dahllan, Elfo, Goblin, Golem, Humano,
        Hynne, Kliren, Lefeu, Medusa, Minotauro, Osteon, Qareen, Sereia,
        Sílfide, Suraggel e Trog.
      </li>
    </ul>
  </div>
);

export default Changelog;
