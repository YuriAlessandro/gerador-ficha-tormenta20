import React from 'react';

import roadmap from '../assets/images/roadmap.png';

const Changelog: React.FC = () => (
  <div style={{ padding: '0 30px' }}>
    <h1>Changelog</h1>
    <p>
      Segue a lista de mudanças no projeto. Última atualização em 13/03/2021.
    </p>

    <p>
      Lembrando que se você <strong>encontrar algum problema</strong>, tiver
      alguma <strong>ideia</strong> ou quiser perguntar alguma coisa, você pode
      fazer isso na página de discussões do GitHub{' '}
      <a
        href='https://github.com/YuriAlessandro/gerador-ficha-tormenta20/discussions'
        target='blank'
      >
        clicando aqui
      </a>
      .
    </p>

    <h3>Versão 1.0</h3>
    <ul>
      <li>Suporte a todas as raças.</li>
      <li>Suporte a todas as classes.</li>
      <li>
        Geração aleatório de atributos, considerando os modificadores
        corretamente.
      </li>
      <li>
        Habilidades de raça e classe que garantam modificações de atributo e/ou
        novas perícias já são automaticamente consideradas.
      </li>
      <li>
        Geração das magias inicias para Arcanista, Druida, Clérigo e Bardo.
      </li>
      <li>
        Os nomes dos personagens são gerados aleatoriamente com base na raça.
        Nome de Osteon é baseado em uma raça &quot;anterior&quot; - ou seja, a
        raça do personagem antes dele morrer.
      </li>
      <li>
        Filtros de geração permitem que você escolha qual raça/classe deseja
        gerar.
      </li>
      <li>
        Gerando aleatoriamente se um personagem é devoto ou não. Caso ele seja,
        é escolhido aleatoriamente o Deus e os poderes concedidos.
      </li>
      <li>
        Gerando origem aleatória. Os poderes de origem são escolhidos
        aleatoriamente junto com as perícias, seguindos as regras determinadas
        pelo sistema.
      </li>
      <li>
        Equipamento inicial, com todo os itens oriundos da origem, dinheiro
        inicial, e as armas aleatórias com base nas proficiências do personagem
        gerado.
      </li>
    </ul>

    <p>
      Leve sempre em consideração que esse é um projeto sem fins lucrativos e de
      código aberto, portanto alterações nele são feitas por voluntários que
      trabalham em seu tempo livre.
    </p>

    <p>Segue abaixo o que ainda esperamos implementar nesse projeto.</p>
    <img src={roadmap} alt='roadmap' />
  </div>
);

export default Changelog;
