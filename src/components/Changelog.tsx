import React from 'react';

const Changelog: React.FC = () => (
  <div style={{ padding: '0 30px' }}>
    <h1>Changelog</h1>
    <p>
      Segue a lista de mudanças no projeto. Última atualização em 07/03/2021.
    </p>
    <h2>Versão 0.2</h2>
    <ul>
      <li>
        Gerando origem aleatória. Os poderes de origem são escolhidos
        aleatoriamente junto com as perícias, seguindos as regras determinadas
        pelo sistema.
      </li>
      <li>
        Estamos gerando aleatoriamente se um personagem é devoto ou não. Caso
        ele seja, é escolhido aleatoriamente o Deus e o poder concedidos (ainda
        faltam aplicar regras mais concretas, como por exemplo o druida que só
        pode ser devoto de três deuses específicos).
      </li>
      <li>
        Filtros de geração permitem que você escolha qual raça/classe deseja
        gerar (por enquanto ainda só funcionando para nível 1).
      </li>
      <li>
        Os nomes dos personagens são gerados aleatoriamente com base na raça (os
        nomes usados foram os do escudo do mestre). Nome de Osteon é baseado em
        uma raça &quot;anterior&quot;, ou seja, a raça do personagem antes dele
        morrer.
      </li>
      <li>
        Adicionamos um gerador aleatório de itens iniciais com base nas
        proficiências (mas ainda não estão todos os itens cadastrados).
      </li>
      <li>Suporte as seguintes classes: Arcanista, Bardo, Druida e Clérigo.</li>
    </ul>
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
