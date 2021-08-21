import React from 'react';

import roadmap from '../assets/images/roadmap.png';

const Changelog: React.FC = () => (
  <div style={{ padding: '0 30px' }}>
    <h1>Changelog</h1>
    <p>
      Segue a lista de mudanças no projeto. Última atualização em 21/08/2021.
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

    <h3>Versão 1.1.2</h3>
    <ul>
      <li>
        Corrigida a habilidade <strong>Herança Feérica</strong> que não estava
        adicionando +1 de PM inicial para os elfos (obrigado{' '}
        <a href='https://github.com/YuriAlessandro/gerador-ficha-tormenta20/discussions/293'>
          @pedrokoii
        </a>
        ).
      </li>
    </ul>

    <h3>Versão 1.1.1</h3>
    <ul>
      <li>
        Estavam sendo selecionadas todas as habilidades, independente de nível,
        no nível 1. Corrigimos esse problema.
      </li>
    </ul>

    <h3>Versão 1.1.0</h3>
    <ul>
      <li>
        Filtro por Role: agora conseguimos criar personagens com classes apenas
        vinculadas à role.
        <ul>
          <li>Tank</li>
          <li>Off Tank</li>
          <li>Dano</li>
          <li>Face</li>
          <li>Mago</li>
          <li>Suporte</li>
        </ul>
      </li>
      <li>
        Adicionamos uma opção de exportar a ficha para o{' '}
        <strong>Foundry VTT</strong>.{' '}
        <a
          href="https://github.com/YuriAlessandro/gerador-ficha-tormenta20/wiki/Como-importar-uma-'Ficha-de-Nimb'-no-Foundry-VTT"
          target='blank'
        >
          Clique aqui
        </a>{' '}
        para ver um tutorial de como importar sua ficha dentro do Foundry.
        <ul>
          <li>
            Até o momento, apenas as informações básicas e as perícias estão
            sendo exportadas (basicamente, tudo que você não precisa arrastar
            para sua ficha no Foundry).
          </li>
        </ul>
      </li>
    </ul>

    <h3>Versão 1.0.3</h3>
    <ul>
      <li>
        Corrigimos os poderes de Lena, que estavam definidos como os poderes de
        Megalokk (obrigado{' '}
        <a href='https://github.com/YuriAlessandro/gerador-ficha-tormenta20/discussions/277'>
          @vnmontanhavn
        </a>
        ).
      </li>
    </ul>

    <h3>Versão 1.0.2</h3>
    <ul>
      <li>
        Modificadores do atributo base não estavam sendo aplicados na PM inicial
        na ficha. Isso foi corrigido (obrigado{' '}
        <a href='https://github.com/YuriAlessandro/gerador-ficha-tormenta20/discussions/224'>
          @malkavfelipe
        </a>
        ):
        <ul>
          <li>Modificador de Carisma na PM inicial do Arcanista.</li>
          <li>Modificador de Carisma na PM inicial do Bardo.</li>
          <li>Modificador de Sabedoria na PM inicial do Clérigo.</li>
          <li>Modificador de Sabedoria na PM inicial do Druída.</li>
        </ul>
      </li>
      <li>
        Corrigimos um problema que estava possibilitando que devotos de Thyatis
        recebessem Dom da Imortalidade ou Dom da Resurreição sem poderem. Existe
        uma restrição de classe para esses dois poderes:
        <ul>
          <li>Dom da Imortalidade só pode ser utilizado por Paladinos.</li>
          <li>Dom da Ressureição só pode ser utilizado por Clérigos.</li>
        </ul>
      </li>
      <li>Agora todas as magias estão mostrando a escola correspondente.</li>
      <li>Os poderes na ficha agora estão expandidos por padrão.</li>
      <li>
        Bardo agora virá com um instrumento aleatório na lista de equipamentos
        (sinta-se a vontade para sugerir novos instrumentos).
      </li>
    </ul>

    <h3>Versão 1.0.1</h3>
    <ul>
      <li>
        Trocamos o termo &quot;sexo&quot; por &quot;gênero&quot; no
        passo-a-passo (até para melhor refletir o livro).
      </li>
      <li>
        Na versão mobile, algumas magias não estavam com o custo de PM
        aparecendo (é o valor entre paranteses antes do nome da magia). Isso foi
        corrigido.
      </li>
      <li>
        As magias <strong>Trasmissão da Loucura</strong> e{' '}
        <strong>Augúrio</strong> são de segundo círculo, mas existem poderes
        divinos que dão elas logo no primeiro nível. Antes, estava um texto
        temporário no passo-a-passo e as magias não apareciam na lista. Agora,
        elas aparecem e também está devidamente indicado no passo-a-passo.
      </li>
      <li>
        O Druida estava sendo devoto de Allihanna, Aharadak ou Oceano, mas o
        correto seria Megalokk ao invés de Aharadak. A troca foi realizada
        (obrigado{' '}
        <a href='https://github.com/YuriAlessandro/gerador-ficha-tormenta20/issues/212'>
          @RuanOniiKun
        </a>
        )
      </li>
      <li>
        Todos os personagens estavam sendo sempre devotos. Essa não é a ideia do
        Fichas de Nimb, portanto corrigimos o problema. Existe uma chance do
        personagem ser devoto, e isso é baseado na raça e na classe, como
        indicamos no changelog da primeira versão.
      </li>
      <li>
        O Minotauro estava com textos de Golem no passo-a-passo. Apesar disso,
        as habilidades estavam sendo selecionadas corretamente e os efeitos bem
        aplicados. A informação foi corrigida no passo-a-passo (obrigado{' '}
        <a href='https://github.com/YuriAlessandro/gerador-ficha-tormenta20/issues/214'>
          @dcatein
        </a>
        ).
      </li>
      <li>
        As habilidades de Trog que modificavam a ficha não estavam aparecendo no
        passo-a-passo, e adicionamos lá agora (obrigado{' '}
        <a href='https://github.com/YuriAlessandro/gerador-ficha-tormenta20/issues/214#issuecomment-801424801'>
          @dcatein
        </a>
        ).
      </li>
    </ul>

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
