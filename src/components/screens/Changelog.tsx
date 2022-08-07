import React from 'react';
import { Link } from 'react-router-dom';

const Changelog: React.FC = () => (
  <div style={{ padding: '0 30px' }}>
    <h1>Changelog</h1>
    <p>
      Segue a lista de mudanças no projeto. Última atualização em 07/08/2022.
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

    <h2>Versão 2.0</h2>

    <h3>2.5.2</h3>
    <ul>
      <li>Adicionado todos os aprimoramentos das magias arcanas e divinas.</li>
      <ul>
        <li>
          Muito obrigado a todos da comunidade que ajudaram a transcrever todos
          os aprimoramentos
        </li>
      </ul>
      <li>Adicionado Origens ao Database</li>
      <li>Adicionado links úteis de projetos de Tormenta 20</li>
    </ul>

    <h3>2.5.1</h3>
    <ul>
      <li>Adicionado tabela de magias arcanas e divinas ao Database.</li>
      <li>
        Adicionado a descrição dos poderes divinos na Database de Divindades
      </li>
      <ul>
        <li>
          Os poderes concedidos continuam aparecendo na Database de Poderes.
        </li>
      </ul>
      <li>Adicionado os pré-requisitos dos poderes de classe.</li>
    </ul>

    <h3>2.5.0</h3>
    <ul>
      <li>
        Adicionado o <Link to='/database/raças'>Database Tormenta</Link>. Com
        ele, é possível pesquisar (até mesmo por áudio) as raças, classes,
        poderes e muito mais para consultar os textos.
        <ul>
          <li>
            Esta sendo lançado nesse momento como uma versão inicial, sujeito a
            diversas melhorias no futuro.
          </li>
          <li>
            A funcionalidade de pesquisa por áudio está{' '}
            <strong>disponível apenas no navegador Chrome</strong> e
            provavelmente só irá funcionar com palavras regulares da língua
            portuguesa (não espere que vá identificar &quot;Aharadak&quot;, por
            exemplo).
          </li>
          <li>
            As <strong>origens</strong> e <strong>magias</strong> ainda não
            estão disponíveis porque preciso arrumar melhor os dados delas.
          </li>
        </ul>
      </li>
      <li>
        Removido uma repetição de texto quando um usuário gerava várias
        recompensas ao mesmo tempo. Agora a tela fica mais limpa e melhor de
        vizualizar tudo que foi gerado.
      </li>
      <li>
        Dei uma <strong>melhorada básica</strong> no site todo para celulares.
        Ainda está longe do ideal e utilizar um computador é a melhor forma, mas
        agora dá para pelo menos navegar direitinho e vizualizar as coisas.
      </li>
    </ul>

    <h3>2.4.2</h3>
    <ul>
      <li>
        Adicionado uma opção para imprimir a ficha simplificada. (Obrigado{' '}
        <a href='https://github.com/YuriAlessandro/gerador-ficha-tormenta20/discussions/335'>
          @EfficientDrink4367
        </a>
        ).
      </li>
      <li>Adicionado uma página inicial para organizar melhor o site.</li>
    </ul>

    <h3>2.4.1</h3>
    <ul>
      <li>
        Adicionado gerador de itens superiores. Ainda bem simples, a ideia é
        evoluir isso para mostrar as stats dos itens no futuro.
      </li>
      <li>Atualização de alguns componentes gráficos das telas.</li>
    </ul>

    <h3>2.4.0</h3>
    <ul>
      <li>
        Adicionado um gerador de recompensas. Agora você pode gerar recompensas
        para os combates da sua mesa com um único clique.
      </li>
    </ul>

    <h3>2.3.1</h3>
    <ul>
      <li>
        Na <strong>Ficha Simplificada</strong>, estavam faltando os poderes de
        classe e de origem. Esse problema foi corrigido. (Obrigado{' '}
        <a href='https://www.reddit.com/r/Tormenta/comments/rher2h/atualiza%C3%A7%C3%B5es_do_projeto_fichas_de_nimb_gerador_de/hsg19ol/'>
          @EfficientDrink4367
        </a>
        ).
      </li>
    </ul>

    <h3>2.3.0</h3>
    <ul>
      <li>
        Agora é possível gerar fichas de <strong>qualquer nível</strong>. Basta
        escrever o número e selecionar ele.
      </li>
      <ul>
        <li>
          É possível que a geração de fichas de níveis MUITO ALTOS cause bugs. O
          projeto não dará suporte para bugs na geração de níveis acima de 20.
        </li>
      </ul>
      <li>Todas as perícias agora estão disponíveis com os valores somados.</li>
      <ul>
        <li>
          Por causa dessa mudança, o passo-a-passo foi movido para a parte de
          baixo da tela.
        </li>
        <li>
          A grande maioria dos poderes e habilidades que aumentam perícias já
          estarão somando automaticamente, na coluna <strong>Outros</strong>. Se
          você encontrar algum poder que não está fazendo isso, nos avise.
        </li>
      </ul>
      <li>
        Adicionado o bônus de ataque das armas, baseado nas perícias de Luta e
        Pontaria.
      </li>
      <ul>
        <li>
          Para este caso, os poderes que oferecem bônus de ataque{' '}
          <strong>ainda não estão sendo somados automaticamente</strong>.
        </li>
      </ul>
      <li>
        Adicionado uma opção de <strong>Ficha Simplificada.</strong> Em resumo,
        ela fica igual as fichas de NPCs padrões do jogo - mas com todas as
        informações de poderes, para você poder chegar o que ainda falta ser
        calculado automaticamente.
      </li>
      <ul>
        <li>
          É possível alterar uma ficha já gerada entre os modelos padrão e
          simplificado, basta marcar o checkbox.
        </li>
      </ul>
      <li>
        Adicionado a opção de mudar o tema entre claro e escuro na barra
        superior.
      </li>
    </ul>

    <h3>2.2.0</h3>
    <ul>
      <li>
        Adicionamos a opção de selecionar a <strong>Origem</strong> e a{' '}
        <strong>Devoção</strong> da ficha. A ideia foi reforçada por{' '}
        <a href='https://github.com/YuriAlessandro/gerador-ficha-tormenta20/discussions/305'>
          @sitariom
        </a>
      </li>
      <ul>
        <li>
          Observe que você{' '}
          <strong>não pode selecionar uma origem para a raça Golem</strong>. Por
          via de regra, essa raça não possui origem.
        </li>
        <li>
          As divindades serão filtradas de acordo com a classe selecionada.
          Dessa forma, você não poderá selecionar um Paladinho devoto de
          Tenebra, por exemplo.
        </li>
      </ul>
      <li>
        Corrigido o comportamento do poder <strong>Abençoado</strong> do
        Paladino, que agora está somando o modificador de carisma na PM do 1º
        nível (obrigado{' '}
        <a href='https://github.com/YuriAlessandro/gerador-ficha-tormenta20/discussions/310'>
          @PaladinodeValkaria
        </a>
        ).
      </li>
      <li>
        Agora a ficha irá adicionar o mínimo de 1 de PV por nível (obrigado{' '}
        <a href='https://github.com/YuriAlessandro/gerador-ficha-tormenta20/discussions/303'>
          @PauloHenriqueOC
        </a>
        ).
      </li>
    </ul>

    <h3>2.1.2</h3>
    <ul>
      <li>
        Mais uma correção sobre os poderes concedidos, que não estavam
        considerando corretamente a divindade selecionada na ficha (obrigado{' '}
        <a href='https://github.com/YuriAlessandro/gerador-ficha-tormenta20/discussions/298'>
          @VitZinc
        </a>
        ).{' '}
      </li>
    </ul>

    <h3>2.1.1</h3>
    <ul>
      <li>
        Corrigido um problema em que os poderes concedidos eram aplicados ao
        subir de nível, mesmo se o personagem não fosse devoto (obrigado{' '}
        <a href='https://github.com/YuriAlessandro/gerador-ficha-tormenta20/discussions/298'>
          @VitZinc
        </a>
        ).{' '}
      </li>
    </ul>

    <h3>2.1.0</h3>
    <ul>
      <li>
        Corrigimos o problema em que os poderes selecionados anteriormente
        continuam na ficha após uma nova geração.
      </li>
      <li>
        Corrigimos alguns outros problemas com a seleção de poderes de forma
        geral. As coisas devem estar mais consistentes agora.
      </li>
    </ul>

    <h3>2.0.1</h3>
    <ul>
      <li>Todas as magias restantes foram adicionadas.</li>
      <li>Melhorias na visualização mobile das magias.</li>
    </ul>

    <h3>2.0.0</h3>

    <ul>
      <li>Agora é possível gerar fichas em qualquer nível.</li>
      <ul>
        <li>
          Nessa versão, apenas magias de até 3º círculo estão sendo selecionadas
          (mesmo que você gere uma ficha com nível alto).
        </li>
        <li>Todos os poderes de todas as classes estão adicionados.</li>
        <li>
          Alguns poderes ainda não estão sendo aplicados ao subir de nível (como
          por exemplo o poder <strong>Aumento de Atributo</strong> das classes.
          Verifique sua ficha com calma para validar o que ainda precisa ser
          feito.
        </li>
      </ul>
      <li>
        Foi adicionado um histórico de fichas, onde ficará salvo em{' '}
        <strong>seu navegador</strong> as últimas 100 fichas geradas.
      </li>
      <li>
        O modo escuro vai parar de resetar de tempo em tempo, e a sua
        configuração ficará salva em definitivo.
      </li>
    </ul>

    <h2>Versão 1.0</h2>

    <h3>1.1.2</h3>
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

    <h3>1.1.1</h3>
    <ul>
      <li>
        Estavam sendo selecionadas todas as habilidades, independente de nível,
        no nível 1. Corrigimos esse problema.
      </li>
    </ul>

    <h3>1.1.0</h3>
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

    <h3>1.0.3</h3>
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

    <h3>1.0.2</h3>
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

    <h3>1.0.1</h3>
    <ul>
      <li>
        Trocamos o termo &quot;sexo&quot; por &quot;gênero&quot; no
        passo-a-passo (até para melhor refletir o livro).
      </li>
      <li>
        Na mobile, algumas magias não estavam com o custo de PM aparecendo (é o
        valor entre paranteses antes do nome da magia). Isso foi corrigido.
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

    <h3>1.0.0</h3>
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
  </div>
);

export default Changelog;
