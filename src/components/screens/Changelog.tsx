import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Container,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FavoriteIcon from '@mui/icons-material/Favorite';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSubscription } from '../../hooks/useSubscription';
import { SEO, getPageSEO } from '../SEO';

const Changelog: React.FC = () => {
  const changelogSEO = getPageSEO('changelog');
  const { isSupporter } = useSubscription();
  const [expanded, setExpanded] = useState<string | false>('v4');

  const handleChange =
    (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  return (
    <>
      <SEO
        title={changelogSEO.title}
        description={changelogSEO.description}
        url='/changelog'
      />
      <Container>
        <div style={{ padding: '0 30px' }}>
          <h1 style={{ fontFamily: 'Tfont' }}>Changelog</h1>
          <p>
            Segue a lista de mudanças no projeto. Última atualização em
            05/04/2026.
          </p>

          <p>
            Lembrando que se você <strong>encontrar algum problema</strong>,
            tiver alguma <strong>ideia</strong> ou quiser perguntar alguma
            coisa, você pode fazer isso na página de discussões do GitHub{' '}
            <a
              href='https://github.com/YuriAlessandro/gerador-ficha-tormenta20/discussions'
              target='blank'
            >
              clicando aqui
            </a>
            .
          </p>

          <Accordion
            expanded={expanded === 'v4'}
            onChange={handleChange('v4')}
            sx={{ mt: 2 }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                '& .MuiSvgIcon-root': { color: 'primary.contrastText' },
              }}
            >
              <Typography variant='h6' fontWeight='bold'>
                Versão 4 (Atual)
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <h3>4.9</h3>
              <ul>
                <li>
                  <strong>Melhoria:</strong> Agora é possível editar ataques,
                  habilidades e magias já adicionados no gerador de ameaças. Um
                  botão de editar aparece ao lado de cada item na lista, abrindo
                  um dialog com todos os campos preenchidos para alteração.
                  Antes era necessário excluir e recriar o item do zero para
                  alterar qualquer campo.
                </li>
              </ul>
              <h3>4.9</h3>
              <ul>
                <li>
                  <strong>Correção:</strong> Corrigido o deslocamento do Golem.
                  A habilidade Chassi agora respeita a regra oficial: o
                  deslocamento é fixo em 6m e não é reduzido por uso de armadura
                  ou excesso de carga. Antes, o sobrepeso reduzia o deslocamento
                  indevidamente. A mesma correção foi aplicada ao Golem Desperto
                  para os chassis que possuem essa imunidade (Bronze, Carne,
                  Ferro, Gelo Eterno, Pedra e Sucata).
                </li>
              </ul>
              <h3>4.9</h3>
              <ul>
                <li>
                  <strong>Melhoria:</strong> Quando o mestre ativa o modo de
                  rolagens privadas na mesa virtual, os PVs e PMs dos inimigos
                  no controlador de encontros agora ficam ocultos para os
                  jogadores. Isso permite que o mestre controle quais
                  informações os jogadores podem ver durante o combate.
                </li>
              </ul>
              <h3>4.9</h3>
              <ul>
                <li>
                  <strong>Correção:</strong> A Linhagem Abençoada do suplemento
                  Deuses de Arton agora aparece corretamente na geração
                  aleatória de fichas e no wizard de level-up/multiclasse. Antes
                  ela só estava disponível no wizard de criação passo a passo.
                </li>
              </ul>
              <h3>4.9</h3>
              <ul>
                <li>
                  <strong>Correção:</strong> Editar e salvar uma ficha ou ameaça
                  que estava dentro de uma pasta não a remove mais da pasta.
                  Antes, ao salvar qualquer edição, a ficha voltava para a raiz
                  e era necessário movê-la novamente.
                </li>
                <li>
                  <strong>Melhoria:</strong> Ao visualizar uma ficha ou ameaça
                  que está em uma pasta, os breadcrumbs agora mostram o caminho
                  completo: Home &gt; Meus Personagens &gt; Nome da Pasta &gt;
                  Ficha. Cada segmento é clicável e leva de volta à pasta ou
                  tela correspondente.
                </li>
                <li>
                  <strong>Novo:</strong> Agora é possível arrastar e soltar
                  fichas e ameaças para dentro das pastas! Basta arrastar um
                  card pelo ícone de arrastar e soltá-lo sobre a pasta desejada.
                  Dentro de uma pasta, ao arrastar um card aparece uma zona de
                  soltar para remover a ficha da pasta. O botão de mover
                  continua funcionando como alternativa.
                </li>
              </ul>
              <h3>4.9</h3>
              <ul>
                <li>
                  <strong>Correção:</strong> Corrigido o scroll do drawer de
                  edição de magias. Antes, ao adicionar magias personalizadas, a
                  lista de magias disponíveis era empurrada para fora da tela,
                  impossibilitando a seleção de novas magias. Agora toda a seção
                  (magias personalizadas, selecionadas e círculos) rola em
                  conjunto, mantendo o cabeçalho e os botões fixos.
                </li>
                <li>
                  <strong>Novo:</strong> Ataques de ameaças agora suportam dados
                  de dano bônus com tipo (ex: &quot;mais 2d12 trevas&quot;,
                  &quot;mais 1d6 ácido&quot;). No formulário de ataques, uma
                  nova seção permite adicionar múltiplas entradas de dados bônus
                  com autocomplete de tipo de dano. Os dados bônus são exibidos
                  no formato do livro, rolados separadamente ao clicar no ataque
                  e não são multiplicados em acertos críticos, seguindo as
                  regras do T20. A exportação para Foundry VTT também inclui os
                  dados bônus como partes adicionais de dano tipado.
                </li>
                <li>
                  <strong>Novo:</strong> A habilidade Treino Especializado do
                  Treinador (nível 5) agora oferece a escolha entre
                  &quot;Conquistar pelos Números&quot; e &quot;Treino
                  Intensivo&quot;. Conquistar pelos Números gera um segundo
                  Melhor Amigo e desbloqueia o poder Líder da Matilha. Treino
                  Intensivo aplica +4 PV por nível, redução de dano progressiva
                  (5/10/15) e truques extras ao Melhor Amigo.
                </li>
                <li>
                  <strong>Correção:</strong> Truques do Melhor Amigo que exigem
                  sub-escolhas (como Condicionamento Especial e Deslocamento
                  Especial) agora apresentam campos de seleção tanto na criação
                  do personagem quanto no level-up. Condicionamento Especial
                  permite escolher os atributos (+2 e +1), e Deslocamento
                  Especial permite escolher entre Escalada e Natação.
                </li>
                <li>
                  <strong>Correção:</strong> O bônus de ataque e dano do truque
                  Treinamento Marcial (+2, escalando por patamar) agora é
                  aplicado corretamente nas rolagens e na exibição da ficha do
                  Melhor Amigo.
                </li>
                <li>
                  <strong>Correção:</strong> O truque Veloz agora treina
                  Atletismo automaticamente no Melhor Amigo, conforme descrito
                  na regra.
                </li>
                <li>
                  <strong>Correção:</strong> Corrigida a validação dos Dons do
                  Duende. Antes, era possível escolher o mesmo atributo três
                  vezes sem restrição. Agora os dois atributos dos Dons devem
                  ser diferentes entre si, e apenas o bônus da Natureza Animal
                  pode repetir com um dos Dons, seguindo a regra do livro.
                  Também corrigida uma dupla contagem de atributos que dava +1
                  extra para Duendes com Natureza Animal.
                </li>
                <li>
                  <strong>Novo:</strong> Agora é possível exportar um PDF com
                  múltiplas ameaças de uma só vez! Na aba Ameaças de Meus
                  Personagens, clique em &quot;Selecionar&quot;, marque as
                  ameaças desejadas e clique em &quot;Exportar PDF&quot;. Todas
                  as fichas de ameaça selecionadas serão geradas em um único
                  documento. Recurso disponível para apoiadores.
                </li>
                <li>
                  <strong>Melhoria:</strong> A tabela de magias na ficha agora
                  exibe os nomes das magias com muito mais espaço, facilitando a
                  identificação. Colunas com valores curtos (Escola, Execução,
                  Alvo/Área, Duração) foram reduzidas para dar mais destaque ao
                  nome. Além disso, ao passar o mouse sobre o nome de uma magia,
                  um tooltip exibe o nome completo — útil para magias com nomes
                  longos.
                </li>
                <li>
                  <strong>Correção:</strong> Constituição negativa agora reduz
                  os PVs corretamente. Antes, personagens com CON negativa
                  recebiam PV como se tivessem CON 0. Agora o modificador
                  negativo é aplicado, respeitando o ganho mínimo de 1 PV por
                  nível. A correção vale para fichas normais, multiclasse e
                  poderes como Dom da Esperança.
                </li>
                <li>
                  <strong>Novo:</strong> Agora é possível adicionar uma
                  descrição a qualquer item de equipamento — tanto customizados
                  quanto itens normais já na mochila. Basta editar o item e
                  preencher o campo &quot;Descrição&quot;. Na ficha, um ícone de
                  informação aparece ao lado do nome do item e, ao passar o
                  mouse, exibe a descrição em um tooltip.
                </li>
                <li>
                  <strong>Correção:</strong> Poderes concedidos agora podem ser
                  selecionados livremente, sem limite artificial. Antes, o
                  número de poderes concedidos era limitado por classe
                  (geralmente 1 ou 2). Agora funcionam como qualquer outro poder
                  geral — o único pré-requisito é ter a devoção correta. A
                  mudança vale tanto para a edição de fichas quanto para o
                  wizard de criação.
                </li>
                <li>
                  <strong>Correção:</strong> Ao visualizar a ficha de um Mago
                  compartilhada por outro jogador, agora é possível ver quais
                  magias estão memorizadas e quais estão sempre preparadas.
                  Antes, os indicadores de memorização só apareciam no modo de
                  edição.
                </li>
                <li>
                  <strong>Melhoria:</strong> Agora é possível definir atributos
                  base com valores de até 50 (antes o limite era 10). A mudança
                  vale tanto para a criação de personagem pelo wizard quanto
                  para a edição de fichas existentes.
                </li>
              </ul>
              <h3>4.8</h3>

              <Alert
                severity='success'
                sx={{
                  my: 2,
                  py: 2,
                  border: '2px solid',
                  borderColor: 'success.main',
                  '& .MuiAlert-message': { width: '100%' },
                }}
              >
                <Typography
                  variant='h5'
                  fontWeight='bold'
                  gutterBottom
                  sx={{ color: 'success.dark' }}
                >
                  Wyrt
                </Typography>
                <Typography variant='body1' sx={{ mb: 1 }}>
                  Wyrt é um jogo de cartas e apostas ambientado no mundo de
                  Arton. Cada jogador recebe 3 cartas e 1 dado — o objetivo é
                  somar cartas de uma mesma cor para chegar o mais perto
                  possível do Número da Raposa (a soma de todos os dados
                  rolados). A cada turno você pode rolar o dado, descartar
                  cartas para comprar novas, dobrar a aposta ou blefar até
                  alguém pedir &quot;Mostrem!&quot; e revelar as mãos. Jogue
                  solo contra bots ou online com amigos!
                </Typography>
              </Alert>

              <ul>
                <li>
                  <strong>Novo:</strong> Agora é possível criar pastas para
                  organizar seus personagens e ameaças por campanha/aventura. As
                  pastas são compartilhadas entre as abas de Personagens e
                  Ameaças — uma pasta &quot;Campanha X&quot; agrupa tanto os
                  personagens quanto as ameaças daquela campanha. As pastas
                  aparecem como cards visuais no grid e, ao clicar, abrem para
                  mostrar as fichas dentro. Cada ficha pode ser movida entre
                  pastas pelo botão de ação no card.
                </li>
                <li>
                  <strong>Melhoria:</strong> Todas as buscas do sistema agora
                  ignoram acentos. Pesquisar &quot;essencia de mana&quot;
                  encontra &quot;Essência de Mana&quot;, &quot;barbaro&quot;
                  encontra &quot;Bárbaro&quot;, etc. Isso vale para o Mercado,
                  tabelas do banco de dados (classes, raças, origens, poderes,
                  magias), editores de ficha (poderes, magias, perícias), wizard
                  de criação, enciclopédia, builds e buscas de ameaças.
                </li>
                <li>
                  <strong>Melhoria:</strong> Estabilidade das mesas virtuais
                  significativamente melhorada. Corrigimos problemas que
                  causavam desconexões frequentes durante as sessões. Agora, ao
                  bloquear a tela do celular ou trocar de aplicativo, a
                  reconexão acontece automaticamente em poucos segundos. A tela
                  também não desliga mais sozinha durante uma sessão ativa.
                  Essas melhorias foram pensadas especialmente para quem joga
                  presencialmente usando o celular.
                </li>
                <li>
                  <strong>Correção:</strong> Poderes com restrição por patamar
                  (como Aumento de Atributo) não ficavam disponíveis
                  corretamente ao atingir um novo patamar pelo wizard de
                  level-up. Por exemplo, ao subir do nível 4 para o 5 (início do
                  patamar Veterano), o sistema ainda tratava o personagem como
                  Iniciante, impedindo a re-seleção de atributos já aumentados
                  no patamar anterior. Agora a mudança de patamar é reconhecida
                  corretamente.
                </li>
                <li>
                  <strong>Correção:</strong> O poder &quot;Canalizar
                  Reparos&quot; aparecia como habilidade racial padrão de todos
                  os Golens Despertos, mas ele é exclusivo do Golem do livro
                  básico. Para o Golem Desperto, só está disponível como
                  Maravilha Mecânica do chassi Mashin.
                </li>
                <li>
                  <strong>Correção:</strong> O poder &quot;Armamento
                  Kallyanach&quot; aparecia como habilidade racial padrão de
                  todos os Kallyanach, adicionando automaticamente uma arma
                  natural à ficha. Na verdade, ele é uma Bênção Dracônica
                  opcional, escolhida através da habilidade &quot;Bênção de
                  Kallyadranoch&quot;. Também corrigida a descrição de
                  &quot;Herança Dracônica&quot;, que não mencionava a redução de
                  dano 5 e estava sem &quot;fogo&quot; na lista de tipos de
                  dano.
                </li>
                <li>
                  <strong>Correção:</strong> Fichas históricas de classes
                  conjuradoras (como Arcanista) podiam perder o atributo-chave
                  de magia ao serem carregadas, fazendo o cálculo de PM usar
                  Carisma como fallback ao invés do atributo correto (ex:
                  Inteligência para Magos). Isso causava PM máximo incorreto ao
                  editar e salvar a ficha. Agora o sistema restaura o
                  atributo-chave mesmo para fichas antigas que não tinham essa
                  informação salva.
                </li>
                <li>
                  <strong>Melhoria:</strong> A lista de magias na ficha agora é
                  organizada por círculo. Cada grupo de magias aparece sob uma
                  label (1º Circulo, 2º Circulo, etc.), com as magias em ordem
                  alfabética dentro de cada círculo.
                </li>
              </ul>
              <h3>4.7</h3>
              <ul>
                <li>
                  <strong>Novo:</strong> PV e PM temporários agora são
                  rastreados separadamente dos valores normais. É possível
                  adicionar PV/PM temporários mesmo quando o personagem não está
                  com vida ou mana cheia — ideal para habilidades como
                  Inspiração (Bardo), Canalizar Energia (Paladino) ou a magia
                  Dadivosa. Ao tomar dano ou gastar PM, os valores temporários
                  são consumidos primeiro. O campo &quot;Temp&quot; aparece no
                  popup de controle dos círculos de PV/PM, com botão
                  &quot;Limpar&quot; para remover ao fim de uma cena. Fichas
                  antigas com valores acima do máximo são migradas
                  automaticamente.
                </li>
                <li>
                  <strong>Novo:</strong> Os campos de texto nas Builds
                  (descrição, notas do personagem, notas de perícias e notas por
                  nível) agora usam um editor Markdown com toolbar de
                  formatação. É possível usar negrito, listas, cabeçalhos e
                  outras formatações. Builds existentes com texto puro continuam
                  funcionando normalmente.
                </li>
                <li>
                  <strong>Novo:</strong> Agora é possível adicionar uma URL de
                  imagem para personalizar fichas de personagens e ameaças. A
                  imagem pode ser informada durante a criação (wizard), na
                  edição da ficha, ou no gerador de ameaças. A imagem aparece no
                  resultado da ficha, nos cards de &quot;Meus Personagens&quot;
                  e &quot;Minhas Ameaças&quot;, e é sincronizada com a nuvem.
                </li>
                <li>
                  <strong>Novo:</strong> Magos agora podem marcar magias como
                  &quot;Sempre Preparada&quot; (ícone de pin ao lado da magia).
                  Magias marcadas ficam sempre disponíveis e não contam no
                  limite de magias memorizadas — ideal para magias raciais, de
                  origem ou outras fontes que não sejam a habilidade de classe.
                </li>
                <li>
                  <strong>Correção:</strong> Bônus de perícias ficavam negativos
                  absurdamente após editar e salvar a ficha. O problema era
                  causado por perda dos bônus de sistema ao salvar, e o valor
                  manual ficava cada vez mais negativo a cada salvamento.
                </li>
                <li>
                  <strong>Correção:</strong> Poderes concedidos por habilidades
                  (como Visco Rubro via Linhagem Rubra do Arcanista, Couraça
                  Rúbea do Kaijin, Estandarte Vivo, etc.) não reapareciam mais
                  após serem removidos e a ficha ser salva.
                </li>
                <li>
                  <strong>Correção (Kallyanach):</strong> Escolher &quot;+1 em 2
                  atributos&quot; aplicava +2 em apenas 1 atributo. Agora a
                  variante selecionada é persistida e aplicada corretamente.
                </li>
                <li>
                  <strong>Correção (Kallyanach):</strong> O editor de ficha
                  agora exibe corretamente a variante de atributos escolhida,
                  com a quantidade certa de checkboxes e o modificador correto.
                  Também é possível trocar a variante durante a edição.
                </li>
                <li>
                  <strong>Correção (Kallyanach):</strong> Selecionar
                  &quot;Prática Arcana&quot; na Bênção de Kallyadranoch agora
                  exibe a seleção de magia corretamente, ao invés de pular
                  direto para a tela final.
                </li>
                <li>
                  <strong>Correção:</strong> Crash ao usar o wizard de criação
                  com a origem Herói Camponês.
                </li>
                <li>
                  <strong>Correção:</strong> Dialog de limite de ameaças não
                  aparecia ao salvar fichas na nuvem.
                </li>
                <li>
                  <strong>Correção:</strong> Magia Velocidade estava com duração
                  &quot;Cena&quot; ao invés de &quot;Sustentada&quot; e
                  descrevia ação de movimento ao invés de ação padrão.
                </li>
                <li>
                  <strong>Correção:</strong> Não era possível reduzir a Redução
                  de Dano abaixo do valor automático no editor de ficha (ex:
                  Bárbaro com RD 10 não podia ser reduzido para menos).
                </li>
                <li>
                  <strong>Novo:</strong> Agora é possível criar itens
                  personalizados em todas as categorias de equipamento — não
                  apenas &quot;Item Geral&quot;. O botão
                  &quot;Personalizado&quot; aparece em Armas, Armaduras,
                  Escudos, Esotéricos, Vestuário, Alquimia, Alimentação e
                  Animais. Armas customizadas permitem definir dano, bônus de
                  ataque e crítico; armaduras e escudos permitem definir bônus
                  de defesa e penalidade.
                </li>
                <li>
                  <strong>Novo:</strong> Itens gerais, esotéricos, alquímicos e
                  de alimentação agora possuem botões de quantidade (+/-)
                  diretamente no editor de equipamento. O preço e os espaços
                  exibidos refletem o total de acordo com a quantidade, e ao
                  remover um item com múltiplas unidades, o valor total é
                  reembolsado corretamente.
                </li>
                <li>
                  <strong>Novo:</strong> Poderes repetíveis (como Especialização
                  em Magia, Magia Aprimorada, etc.) agora podem ser adicionados
                  múltiplas vezes no editor de ficha. Um chip
                  &quot;Repetível&quot; identifica esses poderes, e botões de
                  &quot;+&quot; e &quot;-&quot; permitem adicionar ou remover
                  instâncias individualmente.
                </li>
              </ul>
              <h3>4.6</h3>
              <ul>
                <li>
                  <strong>Melhor Amigo (Treinador):</strong> Implementado
                  sistema completo de parceiro para a classe Treinador. Inclui
                  ficha própria com atributos, PV, Defesa, armas naturais,
                  perícias, truques e habilidades especiais por tipo (Animal,
                  Construto, Espírito, Monstro, Morto-Vivo).
                </li>
                <li>
                  <strong>Criação de Parceiro:</strong> Novo passo no wizard de
                  criação de personagem para configurar o Melhor Amigo (tipo,
                  tamanho, arma natural, perícias e truques iniciais). Geração
                  aleatória também inclui parceiro.
                </li>
                <li>
                  <strong>Level Up do Parceiro:</strong> Novos truques podem ser
                  escolhidos nos níveis 4, 7, 10, 13, 16 e 19 do Treinador
                  durante o Subir Nível.
                </li>
                <li>
                  <strong>Ficha do Parceiro:</strong> Ícone clicável ao lado do
                  poder Melhor Amigo abre a ficha completa do parceiro em modal.
                  A ficha permite rolagens de ataque com armas naturais, testes
                  de atributo e testes de perícia.
                </li>
                <li>
                  Corrigido modificador de atributos do Humano na enciclopédia
                  (exibia +2 ao invés de +1).
                </li>
                <li>
                  Corrigido bug do Meio-Elfo onde o poder da Ambição Herdada não
                  podia ser removido ou substituído após a geração da ficha.
                </li>
                <li>
                  Corrigido bug onde os cálculos de PV e PM ficavam incorretos
                  ao usar multiclasse via o editor de ficha (Subir Nível),
                  especialmente com classes variantes de suplementos (ex:
                  Magimarcialista, Usurpador).
                </li>
                <li>
                  Corrigido bug onde as habilidades de raça do Moreau não
                  apareciam na enciclopédia. Agora todas as 12 heranças são
                  exibidas com seus respectivos atributos e habilidades.
                </li>
                <li>
                  Corrigido bug onde armas corpo a corpo com propriedade
                  Arremesso (Lança, Lança de falange, Martelo leve) usavam o
                  bônus de Pontaria ao invés de Luta.
                </li>
                <li>
                  Adicionado campo de bônus manual para o Teste de Resistência
                  de magias no editor de magias. Bônus automáticos de
                  equipamentos (ex: Flauta Mística) agora também são aplicados
                  corretamente.
                </li>
                <li>
                  Corrigido bug onde o Humano Versátil re-adicionava poderes
                  removidos pelo editor durante a recalculação da ficha,
                  impedindo a remoção permanente do poder e mantendo efeitos
                  como Redução de Dano.
                </li>
              </ul>

              <h3>4.5 - Update 2026.2</h3>
              <p>
                A update 2026.2 é a primeira update feita através do sistema de
                apoiadores do Projeto. A feature principal foi decidida mediante{' '}
                <a href='https://fichasdenimb.com.br/blog/as-novas-features-do-fichas-de-nimb-votacao-de-apoiadores'>
                  votação dos apoiadores
                </a>
                .
              </p>

              <Alert
                severity='success'
                sx={{
                  my: 2,
                  py: 2,
                  border: '2px solid',
                  borderColor: 'success.main',
                  '& .MuiAlert-message': { width: '100%' },
                }}
              >
                <Typography
                  variant='h5'
                  fontWeight='bold'
                  gutterBottom
                  sx={{ color: 'success.dark' }}
                >
                  Multiclasse
                </Typography>
                <Typography variant='body1' sx={{ mb: 1 }}>
                  A feature mais votada pelos apoiadores chegou! Agora é
                  possível <strong>multiclassar</strong> seus personagens
                  diretamente pelo wizard de level-up. Ao subir de nível, você
                  pode escolher uma classe diferente para aquele nível,
                  combinando habilidades, poderes e magias de múltiplas classes.
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  O sistema calcula automaticamente PV, PM, perícias e magias
                  para cada classe. Classes conjuradoras como Arcanista, Bardo,
                  Druida e Clérigo possuem configuração completa ao entrar pela
                  primeira vez, incluindo seleção de subtipo, escolas de magia e
                  magias iniciais. A ficha exibe todas as classes com seus
                  respectivos níveis (ex: &quot;Guerreiro 3 / Arcanista
                  2&quot;).
                </Typography>
              </Alert>

              <ul>
                <li>
                  <strong>✨ Novo:</strong> Adicionada sugestão de nomes no
                  wizard de criação de personagem. O campo de nome agora sugere
                  nomes baseados na raça e gênero selecionados, assim como já
                  acontecia na edição de ficha.
                </li>
                <li>
                  <strong>🐛 Correção:</strong> Kallyanach agora permite
                  escolher 2 Bênçãos Dracônicas na criação do personagem,
                  conforme descrito no livro.
                </li>
                <li>
                  <strong>🐛 Correção:</strong> Tatuagem Mística do Qareen agora
                  exibe todas as magias de 1º círculo (arcanas e divinas), e não
                  apenas as arcanas.
                </li>
                <li>
                  <strong>🐛 Correção:</strong> Poderes e perícias de
                  habilidades raciais (Ambição Herdada, Versatilidade,
                  Deformidade, Memória Póstuma, etc.) não são mais inseridos
                  aleatoriamente ao editar ou reabrir fichas.
                </li>
                <li>
                  <strong>🐛 Correção:</strong> Corrigida origem Herói Camponês
                  que impedia a geração de fichas pelo wizard (poderes gerais da
                  origem não eram classificados corretamente).
                </li>
                <li>
                  <strong>🐛 Correção:</strong> Corrigidos pré-requisitos de
                  poderes que não eram reconhecidos por inconsistências nos
                  nomes (Trespassar/Ataque Poderoso, Melodia
                  Restauradora/Melodia Curativa, Armadilheiro/Arataca,
                  Aparar/Esgrimista).
                </li>
                <li>
                  <strong>🐛 Correção:</strong> Itens gerais, vestuário,
                  alquimia e alimentação agora aparecem na loja durante a
                  criação de personagem (ex: Veste de seda).
                </li>
                <li>
                  <strong>🐛 Correção:</strong> Munição (Flechas, Balas,
                  Virotes) agora pode ser adicionada pelo editor de inventário
                  após a criação da ficha.
                </li>
                <li>
                  <strong>🐛 Correção:</strong> Itens padrão (Saco de dormir,
                  Traje de viajante) não voltam mais ao inventário após serem
                  removidos pelo usuário.
                </li>
                <li>
                  <strong>🐛 Correção:</strong> Corrigido erro ao gerar PDF de
                  fichas com muitas armas ou armaduras/escudos no inventário
                  (excedendo os campos disponíveis na ficha).
                </li>
              </ul>
              <h3>4.4</h3>
              <ul>
                <li>
                  <strong>✨ Novo:</strong> Adicionada a possibilidade de criar
                  poderes concedidos personalizados. Útil para poderes de outras
                  fontes como multiclasse, itens ou decisões do mestre. O botão
                  fica dentro da seção &quot;Poderes Concedidos&quot; no editor
                  de poderes.
                </li>
                <li>
                  <strong>✨ Novo:</strong> Adicionada a possibilidade de criar
                  magias personalizadas na ficha. O usuário pode configurar
                  nome, descrição, todas as características (escola, círculo,
                  execução, alcance, duração, alvo, área, resistência),
                  aprimoramentos com custo de PM e rolagens de dados.
                </li>
                <li>
                  <strong>✨ Melhoria:</strong> Agora é possível alternar entre
                  a visualização completa e simplificada de fichas já criadas. O
                  botão de alternância fica na barra de ações acima da ficha,
                  disponível tanto em fichas locais quanto em fichas salvas na
                  nuvem.
                </li>
                <li>
                  <strong>✨ Melhoria:</strong> Adicionados tipos de
                  deslocamento secundários (Escalada, Escavar, Natação, Voo e
                  Pairar). Os valores podem ser editados no drawer de
                  deslocamento e são exibidos abaixo do deslocamento terrestre
                  na ficha e incluídos na exportação PDF.
                </li>
                <li>
                  <strong>✨ Melhoria:</strong> Adicionado indicador visual de
                  sobrecarga no deslocamento. Quando o personagem carrega mais
                  do que sua capacidade, um chip &quot;Sobrecarga&quot; vermelho
                  aparece com tooltip indicando o peso atual e a penalidade de
                  -3m.
                </li>
                <li>
                  <strong>✨ Melhoria:</strong> Ao exportar a ficha para PDF, as
                  descrições das magias agora são incluídas junto com
                  informações de círculo, escola, execução, alcance, duração e
                  custo em PM.
                </li>
                <li>
                  <strong>✨ Melhoria:</strong> Equipamentos consumíveis agora
                  suportam quantidade. Ao adicionar um item repetido, a
                  quantidade é incrementada automaticamente (ex: &quot;3x
                  Essência de Mana&quot;). Remover decrementa a quantidade ao
                  invés de excluir o item. Funciona para itens gerais,
                  esotéricos, alquímicos e alimentação.
                </li>
                <li>
                  <strong>✨ Melhoria:</strong> Animais agora podem ser editados
                  na ficha (nome, espaços e rolagens), assim como os demais
                  itens de equipamento.
                </li>
                <li>
                  <strong>✨ Melhoria:</strong> Golens agora recebem um poder
                  geral como &quot;Propósito de Criação&quot; em substituição à
                  origem. No wizard de criação, um novo passo permite escolher o
                  poder; na geração aleatória, um poder elegível é sorteado
                  automaticamente.
                </li>
                <li>
                  <strong>✨ Melhoria:</strong> A maravilha mecânica Caminho da
                  Perfeição (Mashin) agora permite escolher qual perícia recebe
                  o bônus de +2, em vez de aplicar automaticamente em Atletismo.
                </li>
                <li>
                  <strong>✨ Melhoria:</strong> O passo-a-passo da criação
                  manual de fichas agora registra todas as escolhas do jogador,
                  na ordem em que foram feitas. Inclui personalizações de raça
                  (Golem, Duende, Moreau), variante de atributos, habilidade
                  Suraggel, elemento Qareen, Memória Póstuma, linhagem do
                  Feiticeiro, escolas de magia, origem, equipamentos comprados
                  no mercado, vida máxima (+CON) e todos os bônus de poderes
                  (PV, PM, defesa, perícias, deslocamento).
                </li>
                <li>
                  <strong>🐛 Correção:</strong> Corrigido cálculo de PM para
                  classes com caminho de magia dinâmico (Arcanista, Bardo,
                  Clérigo, Druida, Frade). O bônus do atributo-chave de magia
                  era perdido ao carregar fichas salvas, resultando em PM menor
                  que o correto.
                </li>
                <li>
                  <strong>🐛 Correção:</strong> Corrigido bug em que os PM
                  máximos aumentavam ou diminuíam em 1 ao editar e salvar
                  determinados campos da ficha.
                </li>
                <li>
                  <strong>🐛 Correção:</strong> Magias memorizadas do Mago agora
                  arredondam corretamente para baixo (metade das magias
                  conhecidas). Antes arredondava para cima, permitindo memorizar
                  uma magia a mais do que o correto.
                </li>
                <li>
                  <strong>🐛 Correção:</strong> A seleção de magias no wizard de
                  level-up agora permite escolher magias de qualquer círculo
                  disponível, não apenas do mais alto. Por exemplo, ao ganhar
                  acesso ao 2º círculo, o jogador pode optar por aprender uma
                  magia do 1º círculo.
                </li>
                <li>
                  <strong>🐛 Correção:</strong> A calculadora de CD de magias
                  (Atributo-Chave, Modificador e Teste de Resistência) agora
                  aparece sempre que a ficha possui magias, mesmo que a classe
                  não seja conjuradora. O atributo-chave padrão é Sabedoria,
                  podendo ser alterado pelo usuário.
                </li>
                <li>
                  <strong>🐛 Correção:</strong> Corrigido bug em que o Usurpador
                  ficava travado no passo &quot;Magias Iniciais&quot; do wizard
                  de criação de personagem, sem conseguir avançar.
                </li>
                <li>
                  <strong>🐛 Correção:</strong> Bônus manuais em perícias (campo
                  &quot;Outros&quot;) agora persistem corretamente ao editar
                  outras partes da ficha. Antes, qualquer edição em poderes,
                  equipamentos ou informações do personagem zerava os bônus
                  manuais das perícias.
                </li>
                <li>
                  <strong>🐛 Correção:</strong> Agora é possível editar o nome,
                  espaços e rolagens de itens esotéricos na ficha, assim como já
                  era possível com vestuários, alquímicos e alimentação.
                </li>
                <li>
                  <strong>🐛 Correção:</strong> Corrigido Golem Desperto com
                  chassi Mashin: o wizard agora permite substituir uma das duas
                  perícias por uma maravilha mecânica (antes obrigava escolher
                  ambas). As perícias escolhidas agora aparecem corretamente
                  como treinadas na ficha.
                </li>
                <li>
                  <strong>🐛 Correção:</strong> Corrigido bug em que o bônus de
                  +2 em perícia da habilidade Deformidade (Lefou) não aparecia
                  na ficha final, mesmo após o jogador selecionar as perícias
                  durante a criação.
                </li>
                <li>
                  <strong>🐛 Correção:</strong> Corrigido bug da origem Futura
                  Lenda em que poderes de classe acumulavam a cada recálculo da
                  ficha e não podiam ser removidos pelo editor de poderes.
                </li>
                <li>
                  <strong>🐛 Correção:</strong> Corrigido problema onde convites
                  para mesa virtual não podiam ser aceitos. A notificação de
                  convite agora direciona corretamente para a página de mesas, e
                  os convites pendentes são recarregados ao navegar para a
                  página.
                </li>
                <li>
                  <strong>🐛 Correção:</strong> Corrigidos diversos problemas ao
                  salvar armas e equipamentos durante sessões de mesa virtual.
                  Edições locais não são mais sobrescritas por atualizações do
                  socket, erros de conexão agora mostram feedback ao usuário, e
                  drawers de edição fecham automaticamente ao perder conexão.
                </li>
              </ul>

              <h3>4.3</h3>
              <ul>
                <li>
                  <strong>✨ Anotações na Ficha:</strong> Agora é possível
                  escrever anotações livres na ficha do personagem. Um ícone de
                  diário aparece ao lado do nome — clique para abrir o editor de
                  notas.
                </li>
                <li>
                  <strong>✨ Melhoria:</strong> Moedas agora possuem peso. Para
                  cada 1000 unidades de uma moeda (T$, TC ou TO), 1 espaço é
                  consumido na ficha. O peso das moedas é considerado no cálculo
                  de deslocamento e exibido no PDF.
                </li>
                <li>
                  <strong>✨ Melhoria:</strong> O feed da página inicial agora
                  exibe os 15 itens mais recentes entre posts do fórum, builds e
                  blogs, ordenados por data — ao invés de dividir por blocos de
                  cada tipo.
                </li>
                <li>
                  <strong>✨ Chassi Mashin para Golem Desperto:</strong> Mashin
                  foi reimplementado como tipo de chassi do Golem Desperto,
                  disponível no modal de customização. Concede +1 em dois
                  atributos à escolha, treinamento em duas perícias, acesso a
                  Maravilhas Mecânicas, tamanho fixo Médio e deslocamento 9m.
                </li>
                <li>
                  <strong>✨ Chassi Dourado para Golem Desperto:</strong> Novo
                  chassi com Carisma +2 e Força +1. Permite marcar uma criatura
                  como culpada (1 PM), sempre sabendo sua localização e causando
                  +1d6 de dano de luz uma vez por rodada.
                </li>
                <li>
                  <strong>🔧 Correção:</strong> Druida agora pode ser devoto de
                  Aharadak, Allihanna, Megalokk, Oceano ou Tenebra.
                </li>
                <li>
                  <strong>🔧 Correção:</strong> Raças Golem, Golem Desperto e
                  Mashin agora bloqueiam corretamente a seleção de origem nos
                  formulários de criação.
                </li>
                <li>
                  <strong>🔧 Correção:</strong> Selecionar uma origem antes de
                  trocar para Golem/Golem Desperto não mantém mais a origem
                  selecionada.
                </li>
                <li>
                  <strong>🗃️ Deprecação:</strong> Raça Mashin standalone não
                  aparece mais na criação de novas fichas. Fichas existentes
                  continuam funcionando normalmente.
                </li>
                <li>
                  <strong>🔧 Correção:</strong> Perícias como Jogatina, Vontade,
                  Ofício (Minerador) e Reflexos não aparecem mais com nome e
                  atributo invertidos na criação de ameaças.
                </li>
                <li>
                  <strong>🔧 Correção:</strong> Poderes raciais Chassi Gracioso,
                  Programação de Combate, Programação Holística e Soco Foguete
                  agora aparecem corretamente como disponíveis para Golem
                  Desperto.
                </li>
                <li>
                  <strong>✨ Melhoria:</strong> Agora é possível editar
                  manualmente o tamanho e o deslocamento da ficha após a
                  geração. Valores customizados são indicados com um chip
                  &quot;Manual&quot; e podem ser restaurados ao valor automático
                  a qualquer momento.
                </li>
                <li>
                  <strong>✨ Melhoria:</strong> Perícias treinadas e atributos
                  na ficha de ameaça agora são clicáveis, permitindo rolar
                  1d20+modificador diretamente ao clicar.
                </li>
                <li>
                  <strong>🔧 Correção:</strong> A origem Futura Lenda podia
                  conceder poderes de classe que não cumpriam pré-requisitos
                  (como chassi, proficiência ou classe variante). A validação
                  agora usa a mesma lógica canônica do restante do sistema.
                </li>
                <li>
                  <strong>🔧 Correção:</strong> A habilidade Ambição Herdada do
                  Meio-Elfo não permitia remover o poder concedido — ao tentar
                  removê-lo, o recálculo da ficha re-aplicava a habilidade e
                  sorteava um novo poder aleatório. Agora o poder pode ser
                  removido normalmente.
                </li>
                <li>
                  <strong>🔧 Correção:</strong> A penalidade de armadura extra
                  (de habilidades raciais como Chassi de Ferro do Golem)
                  acumulava a cada recálculo da ficha, resultando em valores
                  absurdos (ex: -28 ao invés de -4).
                </li>
                <li>
                  <strong>✨ Melhoria:</strong> Na mesa virtual, se um usuário
                  se conectar a partir de outro dispositivo ou aba, a conexão
                  anterior é desconectada automaticamente para evitar problemas
                  de duplicação de eventos e estado inconsistente.
                </li>
                <li>
                  <strong>🔧 Correção:</strong> Dano crítico em ameaças e armas
                  agora multiplica corretamente a quantidade de dados ao invés
                  do resultado. Ex: 3d12 com crítico x3 agora rola 9d12 como
                  esperado pelas regras.
                </li>
              </ul>

              {/* Support CTA - only for non-supporters */}
              {!isSupporter && (
                <Alert
                  severity='info'
                  icon={<FavoriteIcon />}
                  sx={{
                    my: 2,
                    '& .MuiAlert-icon': { color: '#FFA500' },
                  }}
                >
                  Essas atualizações são possíveis graças ao apoio da
                  comunidade.{' '}
                  <Link
                    to='/apoiar'
                    style={{ fontWeight: 'bold', color: '#FFA500' }}
                  >
                    Apoie o projeto!
                  </Link>
                </Alert>
              )}

              <h3>4.2.5</h3>
              <ul>
                <li>
                  <strong>🐛 Correção de erro:</strong> Corrigido problema que
                  impedia o funcionamento de funções básicas da mesa virtual
                  (visualizar fichas de criaturas, criar combate, ver fichas de
                  jogadores) quando ameaças importadas possuíam dados
                  incompletos.
                </li>
              </ul>

              <h3>4.2.4</h3>
              <ul>
                <li>
                  <strong>🐛 Correção de erro:</strong> Corrigido crash ao
                  visualizar ou editar ameaças salvas na nuvem. Os dados
                  completos da ameaça agora são carregados corretamente ao abrir
                  a partir de &quot;Meus Personagens&quot;.
                </li>
                <li>
                  <strong>🐛 Correção de erro:</strong> Corrigido crash ao
                  acessar uma mesa com ameaças importadas que possuíam dados
                  incompletos.
                </li>
              </ul>

              <h3>4.2.3</h3>
              <ul>
                <li>
                  <strong>✏️ Edição de Proficiências:</strong> Agora é possível
                  editar as proficiências da ficha, adicionando proficiências
                  customizadas ou removendo existentes.
                </li>
                <li>
                  <strong>🐛 Correção de erro:</strong> Corrigido crash ao
                  carregar fichas do histórico ou da nuvem cujo inventário (bag)
                  estava ausente ou corrompido.
                </li>
                <li>
                  <strong>🐛 Correção de erro:</strong> Corrigido bug que
                  impedia avançar no wizard ao selecionar origens que concedem
                  proficiências já possuídas pela classe (ex: Desertor da
                  Supremacia com classes que já possuem Escudos).
                </li>
              </ul>

              <h3>4.2.2</h3>
              <ul>
                <li>
                  <strong>🧪 Alquimista no Wizard:</strong> A habilidade
                  Laboratório Pessoal agora permite escolher manualmente os
                  itens alquímicos no wizard de criação, em vez de selecionar
                  aleatoriamente.
                </li>
                <li>
                  <strong>🧚 Presentes do Duende:</strong> Os 14 Presentes de
                  Magia e do Caos do Duende agora estão disponíveis como poderes
                  gerais ao subir de nível.
                </li>
                <li>
                  <strong>⚔️ Armas Versáteis:</strong> Armas com dois modos de
                  dano (como a Espada Bastarda) agora permitem escolher qual
                  modo usar ao rolar dano.
                </li>
                <li>
                  <strong>💰 Moedas TC e TO:</strong> Adicionados campos para
                  Tibares de Cobre (TC) e Tibares de Ouro (TO) na ficha,
                  facilitando o controle de diferentes moedas.
                </li>
                <li>
                  <strong>🔧 Correções:</strong>
                  <ul>
                    <li>
                      Rolagem de dano com múltiplos dados (ex: 1d8+1d6) agora
                      funciona corretamente.
                    </li>
                    <li>
                      O poder Couraceiro agora concede corretamente as
                      proficiências em armaduras pesadas e escudos.
                    </li>
                    <li>
                      Corrigido problema onde itens alquímicos podiam duplicar
                      ao recalcular a ficha.
                    </li>
                    <li>
                      Corrigidos os tipos de dano &quot;Cirte&quot; e
                      &quot;Perguração&quot; para &quot;Corte&quot; e
                      &quot;Perfuração&quot;.
                    </li>
                  </ul>
                </li>
              </ul>

              <h3>4.2.1</h3>
              <ul>
                <li>
                  <strong>🏘️ Builds da Comunidade:</strong> A página de builds
                  agora é pública! Qualquer pessoa pode navegar e visualizar as
                  builds compartilhadas pela comunidade, mesmo sem estar logado.
                </li>
                <li>
                  <strong>💝 Metas de Apoio:</strong> Nova seção de metas na
                  página de apoio, com barras de progresso mostrando o avanço em
                  direção aos objetivos do projeto.
                </li>
                <li>
                  <strong>🔧 Correções:</strong>
                  <ul>
                    <li>
                      Corrigido problema no wizard de criação onde o botão
                      &quot;Próximo&quot; ficava desabilitado incorretamente no
                      passo de habilidades de classe, afetando poderes como
                      Memória Póstuma.
                    </li>
                  </ul>
                </li>
              </ul>

              <h3>4.2</h3>
              <ul>
                <li>
                  <strong>💬 Fórum da Comunidade:</strong> Novo sistema de fórum
                  integrado com feed unificado na landing page. Inclui anexos de
                  conteúdo, edição de tópicos, notificações, sistema de
                  moderação e categorias exclusivas para apoiadores. Apoiadores
                  possuem destaque visual no fórum e no feed. Também é possível
                  copiar fichas e ameaças compartilhadas diretamente para sua
                  conta.
                </li>
                <li>
                  <strong>🧙 Wizard de Criação Aprimorado:</strong>
                  <ul>
                    <li>
                      Teurgista Místico: magias de outra tradição agora são
                      selecionadas automaticamente.
                    </li>
                    <li>
                      Poderes de destino Alma Livre e Memória Póstuma
                      (Osteon/Soterrado) integrados ao wizard.
                    </li>
                    <li>
                      Ofício (Qualquer) agora é expandido em variantes
                      específicas na seleção de perícias.
                    </li>
                    <li>
                      Restrições de magias do Necromante aplicadas
                      automaticamente (sem Encantamento, com Necromancia
                      divina).
                    </li>
                    <li>
                      Druida agora pode selecionar Tenebra como divindade.
                    </li>
                    <li>
                      Checkboxes de memorização de magias para personagens
                      Magos.
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>📚 Novo Conteúdo:</strong> 22 novas magias e novos
                  itens de alimentação (bebidas) do suplemento Heróis de Arton.
                  Poder &quot;Presente de Wynlla&quot; adicionado a 14 origens
                  do livro básico e ao suplemento Atlas de Arton.
                </li>
                <li>
                  <strong>📱 Aplicativo e Notificações:</strong> Notificações
                  push (Web Push) para alertas no aplicativo. Nova página
                  dedicada para instalação do app (/instalar). Feedback visual
                  ao adicionar itens no mercado e editor de equipamentos.
                </li>
                <li>
                  <strong>🔧 Correções:</strong>
                  <ul>
                    <li>
                      Edições de ficha agora são salvas corretamente no
                      histórico local.
                    </li>
                    <li>Corrigido PV/PM máximo manual.</li>
                    <li>
                      Passo de seleção de magias não aparece mais para o
                      Usurpador.
                    </li>
                    <li>
                      Fé Guerreira adicionada aos poderes concedidos do Arsenal.
                    </li>
                    <li>
                      Poderes gerais selecionados como benefício de origem
                      tratados corretamente no wizard.
                    </li>
                    <li>
                      Feiticeiro com Linhagem Abençoada agora pode selecionar
                      magias divinas.
                    </li>
                    <li>
                      Golem Desperto: corrigidas habilidades duplicadas e
                      habilitada seleção de magias no wizard.
                    </li>
                    <li>
                      Todos os 20 poderes de destino incluídos na lista de
                      poderes.
                    </li>
                    <li>
                      Perícias de origens regionais agora aparecem na ficha pelo
                      wizard.
                    </li>
                    <li>Corrigido crash em fichas compartilhadas.</li>
                    <li>
                      Scroll automático para o passo ativo no wizard de criação.
                    </li>
                  </ul>
                </li>
              </ul>

              <h3>4.1</h3>
              <ul>
                <li>
                  <strong>🗡️ Classes Variantes:</strong> Adicionadas 14 classes
                  variantes do suplemento Heróis de Arton: Alquimista, Atleta,
                  Burguês, Duelista, Ermitão, Inovador, Machado de Pedra,
                  Magimarcialista, Necromante, Santo, Seteiro, Usurpador,
                  Vassalo e Ventanista. As classes variantes herdam os poderes
                  da classe base e aparecem agrupadas na seleção de classe.
                </li>
                <li>
                  <strong>🛡️ Redução de Dano (RD):</strong> Novo sistema de
                  Redução de Dano com cálculo automático. A RD agora é exibida
                  abaixo da defesa e calculada automaticamente a partir de
                  habilidades de raça, classe, origem, poderes concedidos e
                  poderes de Tormenta. Inclui edição manual para ajustes
                  personalizados.
                </li>
                <li>
                  <strong>🔮 Esotéricos e Animais:</strong> Itens esotéricos e
                  animais agora são categorias independentes de equipamento, com
                  itens de todos os suplementos disponíveis para compra e
                  edição.
                </li>
                <li>
                  <strong>👹 Melhorias no Gerador de Ameaças:</strong>
                  <ul>
                    <li>
                      Ameaças agora podem ter magias com custo em PM e tipo de
                      ação.
                    </li>
                    <li>
                      Adicionado campo de qualidades especiais (visão,
                      imunidades, etc.).
                    </li>
                    <li>
                      Agora é possível sobrescrever manualmente os valores
                      finais das perícias.
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>⬆️ Wizard de Level-Up Aprimorado:</strong>
                  <ul>
                    <li>
                      Novo passo &quot;Ganhos do Nível&quot; mostra
                      automaticamente os benefícios recebidos (PV, PM,
                      habilidades de classe, novas magias) antes das escolhas.
                    </li>
                    <li>
                      Botão &quot;Subir Nível&quot; agora disponível diretamente
                      no drawer de edição da ficha, permitindo subir de nível
                      com escolhas manuais.
                    </li>
                    <li>
                      Magias de suplementos agora aparecem corretamente na
                      seleção de magias.
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>🧙 Wizard de Criação Aprimorado:</strong>
                  <ul>
                    <li>
                      Perícias base da classe agora são exibidas no passo de
                      perícias, com opções &quot;ou&quot; selecionáveis pelo
                      jogador.
                    </li>
                    <li>
                      Seleção manual para Linhagem Rubra, Herança Feérica e
                      Deformidade (Lefou).
                    </li>
                    <li>
                      Atributos excluídos por raça (como &quot;exceto
                      Carisma&quot;) agora são bloqueados na seleção.
                    </li>
                    <li>
                      Adicionada escolha de Égide Sagrada ou Montaria Sagrada
                      para a Bênção da Justiça do Paladino.
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>✏️ Melhorias na Edição de Fichas:</strong>
                  <ul>
                    <li>
                      Agora é possível trocar o atributo base de cada perícia
                      (ex: Intimidação de Carisma para Força).
                    </li>
                    <li>
                      Toggle de desconto automático de Tibares ao
                      adicionar/remover equipamentos no editor.
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>🏘️ Builds da Comunidade:</strong> Suporte a
                  multiclasse nas builds e possibilidade de comentar nas
                  próprias builds.
                </li>
                <li>
                  <strong>🔧 Correções:</strong>
                  <ul>
                    <li>
                      Corrigido o limiar de morte para usar metade do PV máximo
                      (em vez do dobro), seguindo corretamente as regras de
                      Tormenta 20.
                    </li>
                    <li>
                      Poderes concedidos de divindades de suplementos agora são
                      incluídos corretamente na geração.
                    </li>
                  </ul>
                </li>
              </ul>

              <h3>4.0.2</h3>
              <ul>
                <li>
                  <strong>🧙 Classe Frade:</strong> Corrigida a prioridade de
                  atributos e a seleção de magias iniciais para a classe Frade.
                </li>
                <li>
                  <strong>🧚 Raça Duende:</strong> O tamanho e customizações do
                  Duende agora são preservados corretamente ao editar a ficha.
                </li>
                <li>
                  <strong>📖 Enciclopédia:</strong>
                  <ul>
                    <li>
                      Adicionadas opções dos novos suplementos à enciclopédia.
                    </li>
                    <li>
                      Melhorias na exibição de truques de magias nas tabelas.
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>⛪ Devotos:</strong> Agora é possível trocar os
                  Poderes Concedidos ao editar fichas de personagens devotos.
                </li>
                <li>
                  <strong>⬆️ Mudança de Nível:</strong> Habilidades de classe
                  agora são adicionadas corretamente ao mudar o nível pelo
                  drawer de edição.
                </li>
                <li>
                  <strong>🔧 Correções Gerais:</strong>
                  <ul>
                    <li>
                      Bônus manuais de defesa agora aparecem na fórmula de
                      defesa.
                    </li>
                    <li>
                      Poderes agora são filtrados corretamente considerando
                      perícias e proficiências no wizard de criação.
                    </li>
                    <li>
                      Corrigido o cálculo do modificador de Inteligência para
                      raças com atributos selecionáveis.
                    </li>
                    <li>
                      A habilidade Versátil (Humano) não aplica mais benefícios
                      aleatórios durante o recálculo da ficha.
                    </li>
                    <li>
                      Magias e poderes de suplementos agora aparecem
                      corretamente no wizard de criação de personagem.
                    </li>
                    <li>
                      Itens de origens não aparecem mais como objetos em vez do
                      nome correto.
                    </li>
                    <li>
                      Correções nas descrições e aprimoramentos de diversas
                      magias.
                    </li>
                  </ul>
                </li>
              </ul>

              <h3>4.0.1</h3>
              <ul>
                <li>
                  <strong>🐺 Heranças de Moreau:</strong> Adicionadas as 12
                  heranças da raça Moreau (do suplemento Ameaças de Arton) com
                  bônus de perícias, armas naturais e habilidades específicas de
                  cada animal.
                </li>
                <li>
                  <strong>🧙 Wizard de Criação e Level-Up Aprimorado:</strong>
                  <ul>
                    <li>
                      Poderes de suplementos agora aparecem corretamente nas
                      opções de seleção.
                    </li>
                    <li>
                      Poderes repetíveis (como Aumento de Atributo) podem ser
                      selecionados múltiplas vezes.
                    </li>
                    <li>
                      Seleção manual de perícias e poderes para a habilidade
                      Versátil do Humano.
                    </li>
                    <li>
                      Bênçãos dracônicas agora permitem escolher magias
                      corretamente.
                    </li>
                    <li>
                      Kallyanach permite escolher qual atributo aumentar (+1 For
                      ou +1 Des).
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>✨ Novos Efeitos Automáticos:</strong>
                  <ul>
                    <li>
                      Poder &quot;Coração Heroico&quot; agora adiciona +2 PM
                      automaticamente.
                    </li>
                    <li>
                      Poder &quot;Aspirante a Herói&quot; (Atlas de Arton) agora
                      permite escolher o atributo a aumentar.
                    </li>
                    <li>
                      Bênção &quot;Prática Arcana&quot; permite escolher uma
                      magia para aprender.
                    </li>
                    <li>
                      Bônus de perícias de poderes agora são aplicados
                      corretamente no recálculo da ficha.
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>⚔️ Correções de Equipamentos:</strong>
                  <ul>
                    <li>
                      Armaduras pesadas mantêm sua identificação ao editar o
                      nome.
                    </li>
                    <li>
                      Crítico base das armas é preservado ao recalcular a ficha.
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>🎲 Melhorias de Magias:</strong>
                  <ul>
                    <li>
                      Magia &quot;Curar Ferimentos&quot; agora exibe a rolagem
                      de cura corretamente.
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>🔧 Correções Gerais:</strong>
                  <ul>
                    <li>
                      Validação de requisitos de proficiência para poderes de
                      combate corrigida.
                    </li>
                    <li>
                      Aviso de alterações não salvas antes de fazer logout.
                    </li>
                    <li>
                      Atributos negativos agora são permitidos na edição manual.
                    </li>
                    <li>
                      Edições manuais de perícias são preservadas ao recalcular.
                    </li>
                    <li>
                      Escolhas de atributos de raças com opções
                      (&quot;any&quot;) são propagadas corretamente.
                    </li>
                  </ul>
                </li>
              </ul>

              <h3>4.0.0</h3>
              <ul>
                <li>
                  <strong>🔐 Sistema de Contas e Nuvem:</strong> Agora você pode
                  criar uma conta usando Google para salvar suas fichas e
                  ameaças na nuvem. Suas criações ficam sincronizadas entre
                  dispositivos e acessíveis de qualquer lugar.
                </li>
                <li>
                  <strong>📚 Sistema de Suplementos:</strong> Implementamos
                  suporte a 4 suplementos oficiais:
                  <ul>
                    <li>
                      <strong>Ameaças de Arton:</strong> 27 novas raças jogáveis
                      (Bugbear, Centauro, Ceratops, Elfo-do-Mar, Fintroll,
                      Gnoll, Harpia, Hobgoblin, Kallyanach, Kaijin, Kappa,
                      Kobolds, Meio-Orc, Minauro, Moreau, Nagah, Nezumi, Ogro,
                      Orc, Pteros, Soterrado, Tabrachi, Tengu, Trog Anão,
                      Velocis, Voracis, Yidishan), novos equipamentos, magias e
                      poderes.
                    </li>
                    <li>
                      <strong>Atlas de Arton:</strong> 70 novas origens
                      regionais de todo o continente, com poderes e equipamentos
                      únicos.
                    </li>
                    <li>
                      <strong>Deuses de Arton:</strong> Nova classe Frade, 76
                      novos poderes concedidos, magias exclusivas e habilidades
                      de Suraggel.
                    </li>
                    <li>
                      <strong>Heróis de Arton:</strong> Nova classe Treinador,
                      novos poderes gerais e de classe, efeitos adicionais de
                      Golpe Pessoal e novas origens.
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>🎲 Dados 3D:</strong> Novo sistema de rolagem de dados
                  em 3D com física realista! Clique nos valores de ataque, dano,
                  perícias e outros elementos da ficha para rolar dados animados
                  na tela. Personalize as cores dos dados nas configurações.
                </li>
                <li>
                  <strong>🧙 Wizard de Criação de Personagem:</strong> Nova
                  interface guiada passo-a-passo para criar personagens do zero,
                  escolhendo raça, classe, origem, atributos, perícias, poderes
                  e equipamentos de forma intuitiva.
                </li>
                <li>
                  <strong>⬆️ Wizard de Level-Up:</strong> Sistema dedicado para
                  subir de nível seus personagens, permitindo escolher novos
                  poderes, magias e distribuir pontos de vida e mana.
                </li>
                <li>
                  <strong>🎯 Mesas de Jogo:</strong> Crie mesas virtuais para
                  organizar seus personagens e compartilhar com outros jogadores
                  da sua campanha.
                </li>
                <li>
                  <strong>📰 Blog:</strong> Nova seção de blog com artigos,
                  novidades e dicas sobre Tormenta 20.
                </li>
                <li>
                  <strong>🎨 Nova Landing Page:</strong> Página inicial
                  completamente redesenhada com visual moderno e sistema de
                  cores atualizado.
                </li>
                <li>
                  <strong>👹 Edição Completa de Ameaças:</strong> Agora é
                  possível editar todos os aspectos das ameaças geradas,
                  incluindo habilidades, ataques e atributos.
                </li>
                <li>
                  <strong>🔔 Sistema de Notificações:</strong> Receba
                  atualizações em tempo real sobre novidades e avisos
                  importantes.
                </li>
                <li>
                  <strong>💝 Sistema de Apoio:</strong> Agora você pode apoiar o
                  projeto e desbloquear funcionalidades premium como salvamento
                  ilimitado na nuvem.
                </li>
                <li>
                  <strong>🔗 Fichas Compartilháveis:</strong> Gere links únicos
                  para compartilhar suas fichas com outros jogadores, que podem
                  visualizar todos os detalhes.
                </li>
                <li>
                  <strong>👤 Perfis de Usuário:</strong> Páginas de perfil
                  personalizadas onde você pode ver suas criações e as de outros
                  usuários.
                </li>
                <li>
                  <strong>✨ Poderes Customizados:</strong> Adicione poderes
                  homebrew às suas fichas para regras da casa.
                </li>
                <li>
                  <strong>🎭 Modal de Conjuração:</strong> Nova interface para
                  conjurar magias com cálculo automático de custo em PM e
                  seleção de aprimoramentos.
                </li>
                <li>
                  <strong>📊 Ações de Perícias:</strong> Visualize todas as
                  ações possíveis de cada perícia com descrições detalhadas.
                </li>
                <li>
                  <strong>❤️ Sistema de PV Negativo:</strong> Implementado
                  sistema de estados de personagem (inconsciente, morrendo)
                  quando PV fica negativo.
                </li>
                <li>
                  <strong>🔧 Correções e Melhorias:</strong>
                  <ul>
                    <li>
                      Cálculo de PM corrigido para bônus baseados em nível (como
                      Sangue Mágico).
                    </li>
                    <li>
                      Melhor suporte a dispositivos móveis em toda a aplicação.
                    </li>
                    <li>
                      Filtros de suplementos funcionando corretamente na
                      Enciclopédia.
                    </li>
                    <li>
                      Pesquisa por voz melhorada com suporte a português
                      brasileiro.
                    </li>
                    <li>
                      Performance otimizada em buscas e carregamento de páginas.
                    </li>
                    <li>
                      Correção de poderes repetidos agrupados com notação (xN).
                    </li>
                    <li>
                      Tabela de perícias simplificada com exibição de cálculos.
                    </li>
                    <li>Coluna de duração adicionada à tabela de magias.</li>
                    <li>
                      Melhor experiência de edição de ataques, defesa e armas.
                    </li>
                  </ul>
                </li>
              </ul>
            </AccordionDetails>
          </Accordion>

          <Accordion
            expanded={expanded === 'v3'}
            onChange={handleChange('v3')}
            sx={{ mt: 1 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant='h6'>Versão 3</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <h3>3.4.3</h3>
              <ul>
                <li>
                  🔧 Corrigido uma rolagem do rolador de recompensas que estava
                  incorreta. Obrigado{' '}
                  <a
                    href='https://github.com/YuriAlessandro/gerador-ficha-tormenta20/discussions/425'
                    target='_blank'
                    rel='noreferrer'
                  >
                    @maxgameplayeryt-tech
                  </a>
                  .
                </li>
              </ul>

              <h3>3.4.2</h3>
              <ul>
                <li>
                  🔧 Corrigido problema ao salvar algumas divindades: Linn-Wuu,
                  Tannah-Toh e Hynnin. Obrigado{' '}
                  <a
                    href='https://github.com/YuriAlessandro/gerador-ficha-tormenta20/discussions/424'
                    target='_blank'
                    rel='noreferrer'
                  >
                    @Prodigy-tlk
                  </a>
                  .
                </li>
                <li>
                  🔧 Corrigido um problema ao tentar selecionar o subtipo de
                  armas e armaduras nos geradores de itens superiores e itens
                  mágicos.{' '}
                  <a
                    href='https://github.com/YuriAlessandro/gerador-ficha-tormenta20/discussions/423'
                    target='_blank'
                    rel='noreferrer'
                  >
                    @renydev
                  </a>
                  .
                </li>
              </ul>

              <h3>3.4.1</h3>
              <ul>
                <li>
                  <strong>🎨 Interface do Resultado Melhorada:</strong>{' '}
                  Redesenhada a seção de passo-a-passo e relatório de problemas
                  na página de resultado da ficha. O passo-a-passo agora utiliza
                  um accordion expansível (fechado por padrão) para economia de
                  espaço, e o relatório de bugs foi transformado em um alert
                  compacto e discreto.
                </li>
                <li>
                  <strong>📏 Informações de Tamanho e Deslocamento:</strong>{' '}
                  Adicionada exibição de tamanho e deslocamento na ficha de
                  resultado, permitindo visualizar essas informações importantes
                  diretamente.
                </li>
                <li>
                  <strong>🔧 Correções na Edição de Fichas:</strong> Corrigidos
                  diversos problemas na edição manual de fichas, incluindo
                  seleção de divindades, aplicação de bônus de armas ao editar
                  equipamentos, e modificadores de atributos ao trocar raça.
                </li>
                <li>
                  <strong>✏️ Seleção Manual de Atributos:</strong> Implementada
                  interface para seleção manual de atributos ao editar raça,
                  permitindo escolher exatamente quais atributos alterar quando
                  a raça oferece opções (&quot;any&quot;).
                </li>
                <li>
                  <strong>🐛 Melhorias no Passo-a-Passo:</strong> Corrigida
                  formatação de modificadores de atributos no passo-a-passo,
                  garantindo exibição correta de valores positivos, negativos e
                  zero.
                </li>
              </ul>

              <h3>3.4.0</h3>
              <ul>
                <li>
                  <strong>⚔️ Sistema de Equipamentos Expandido:</strong> Agora é
                  possível adicionar qualquer tipo de equipamento (não apenas
                  armas, armaduras e escudos) na edição de fichas. Adicionados
                  97 novos itens incluindo equipamentos de aventureiro,
                  ferramentas, vestuário, itens esotéricos, alquímicos e
                  alimentação.
                </li>
                <li>
                  <strong>🔧 Inventores Aprimorados:</strong> Inventores agora
                  são gerados com maior sinergia entre perícias e poderes. Todo
                  inventor garante ter pelo menos uma especialização
                  (Alquimista, Armeiro ou Engenhoqueiro) e recebe poderes
                  compatíveis com suas perícias.
                </li>
                <li>
                  <strong>🎯 Ofícios Específicos:</strong> Substituído o
                  genérico &quot;Ofício (Qualquer)&quot; por ofícios específicos
                  e temáticos baseados na classe do personagem (ex: Guerreiros
                  recebem Armeiro, Druidas recebem Fazendeiro).
                </li>
                <li>
                  <strong>⚡ Golpe Pessoal do Guerreiro:</strong> Implementado o
                  poder &quot;Golpe Pessoal&quot; para a classe Guerreiro.
                  Sistema completo com 18 efeitos personalizáveis, permitindo
                  criar ataques únicos. Inclui geração aleatória inteligente
                  respeitando limites de PM por nível e interface manual para
                  construção customizada do golpe.
                </li>
              </ul>

              <h3>3.3.0</h3>
              <ul>
                <li>
                  <strong>🎯 Seleção Manual de Poderes:</strong> Agora é
                  possível escolher manualmente os efeitos de poderes que
                  requerem seleção, como escolher qual atributo aumentar no
                  poder &quot;Aumento de Atributo&quot; ou quais perícias
                  treinar. O sistema abre diálogos de seleção quando necessário,
                  permitindo maior controle sobre a personalização da ficha.
                </li>
                <li>
                  <strong>⚔️ Bônus de Armas Específicas:</strong> Implementado
                  sistema de bônus para armas específicas. Poderes como
                  &quot;Especialização em Arma&quot;, &quot;Estilo de Arma
                  Longa&quot; e outros agora aplicam corretamente bônus de
                  ataque, dano ou crítico nas armas apropriadas.
                </li>
                <li>
                  <strong>💖 Dom da Esperança:</strong> O poder &quot;Dom da
                  Esperança&quot; agora funciona corretamente, substituindo
                  Constituição por Sabedoria no cálculo de pontos de vida,
                  inclusive ao subir de nível.
                </li>
                <li>
                  <strong>🐺 Totem Espiritual do Bárbaro:</strong> Implementado
                  sistema completo de seleção de animais totêmicos para o poder
                  &quot;Totem Espiritual&quot; do Bárbaro. Permite escolher
                  entre 8 animais (Coruja, Corvo, Falcão, Grifo, Lobo, Raposa,
                  Tartaruga, Urso), cada um concedendo uma magia específica de
                  1º círculo com Sabedoria como atributo-chave.
                </li>
                <li>
                  <strong>🦉 Familiar do Arcanista:</strong> Adicionado sistema
                  de seleção de familiares para o poder &quot;Familiar&quot; do
                  Arcanista. Permite escolher entre 10 familiares diferentes,
                  com o Gato fornecendo bônus mecânico (+2 Furtividade) e os
                  demais oferecendo benefícios descritivos.
                </li>
                <li>
                  <strong>🔧 Melhorias na Edição:</strong> Sistema de edição de
                  poderes aprimorado com melhor interface e seleções mais
                  intuitivas. Poderes com opções específicas agora permitem
                  escolhas precisas em vez de seleção aleatória.
                </li>
                <li>
                  <strong>📖 Poderes de Origem:</strong> Adicionados poderes de
                  origem ao editor de poderes da ficha. Agora é possível
                  adicionar ou remover poderes de origem durante a edição, com
                  indicação visual dos pré-requisitos necessários.
                </li>
                <li>
                  <strong>🎭 Truque de Mágica:</strong> O poder &quot;Truque de
                  Mágica&quot; agora adiciona corretamente as magias Explosão de
                  Chamas, Hipnotismo e Queda Suave com apenas o aprimoramento
                  Truque disponível.
                </li>
                <li>
                  <strong>🌍 Voz da Civilização:</strong> O poder &quot;Voz da
                  Civilização&quot; adiciona a magia Compreensão marcada como
                  sempre ativa, sem aprimoramentos disponíveis.
                </li>
                <li>
                  <strong>✨ Aprimoramentos de Magias:</strong> Agora as magias
                  exibem seus aprimoramentos disponíveis diretamente na ficha,
                  mostrando o custo em PM de cada um ou indicando quando é um
                  Truque (0 PM).
                </li>
                <li>
                  <strong>🗑️ Remoção do Histórico:</strong> Adicionada opção
                  para remover fichas do histórico com confirmação antes de
                  excluir permanentemente.
                </li>
              </ul>

              <h3>3.2.1</h3>
              <ul>
                <li>
                  <strong>🎲 Export para Foundry VTT:</strong> Adicionado
                  exportador completo para o Foundry VTT nas ameaças geradas,
                  permitindo importar inimigos diretamente para suas mesas
                  virtuais.
                </li>
                <li>
                  <strong>⏳ Indicadores de Carregamento:</strong> Melhorada a
                  experiência do usuário com indicadores visuais durante o
                  processo de exportação de fichas e ameaças.
                </li>
                <li>
                  <strong>🔧 Correções Gerais:</strong> Corrigidos problemas de
                  validação no exportador do Foundry e adicionada ferramenta de
                  itens mágicos ao menu lateral.
                </li>
              </ul>

              <h3>3.2.0</h3>
              <ul>
                <li>
                  <strong>🔮 Novo Gerador de Itens Mágicos:</strong> Adicionada
                  nova ferramenta para criar itens mágicos com encantamentos
                  para armas, armaduras e escudos. Inclui modos aleatório e
                  manual com sistema de custos e validações.
                </li>
                <li>
                  <strong>✨ Melhorias no Gerador de Itens Superiores:</strong>{' '}
                  Aprimorado o gerador de itens superiores com nova interface,
                  melhor experiência do usuário e funcionalidades expandidas.
                </li>
                <li>
                  <strong>🎨 Reorganização das Ferramentas:</strong> Ajustado o
                  layout da página inicial para acomodar 5 ferramentas
                  secundárias em uma linha, otimizando o espaço disponível.
                </li>
              </ul>

              <h3>3.1.1</h3>
              <ul>
                <li>
                  <strong>🎨 Renovação Visual da Enciclopédia:</strong> A
                  Enciclopédia de Tanah-Toh recebeu uma completa reformulação
                  visual com novo design moderno, animações suaves e melhor
                  experiência do usuário.
                </li>
                <li>
                  <strong>🔧 Correções no Gerador de Ameaças:</strong>
                  <ul>
                    <li>
                      Corrigidos os valores das tabelas de combate (Solo,
                      Lacaio, Especial) com base nos dados oficiais.
                    </li>
                    <li>
                      Corrigida a exibição dos valores de resistência (Forte,
                      Média, Fraca) que estavam invertidos.
                    </li>
                    <li>
                      ND S agora é corretamente classificado como patamar
                      &quot;Lenda+&quot;.
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>✨ Melhorias na Interface:</strong>
                  <ul>
                    <li>
                      Passo 2: Redesenhada a interface de seleção de ND com
                      melhor UX - patamares agora são clicáveis para seleção
                      rápida.
                    </li>
                    <li>
                      Passo 8: Adicionada capacidade de editar PV, Defesa e CD
                      diretamente na tela de resumo.
                    </li>
                    <li>
                      Ficha de Resultado: CD agora é exibido na ficha final
                      quando a ameaça possui habilidades.
                    </li>
                    <li>
                      Editor de Poderes: Agora exibe também as habilidades de
                      classe e raça na seção de resumo com chips, proporcionando
                      uma visão completa de todas as capacidades do personagem.
                    </li>
                    <li>
                      Correção do treinamento de perícias: Corrigido problema
                      onde marcar uma perícia como treinada não atualizava o
                      valor corretamente. Agora usa a progressão correta de
                      bônus (+2 nível 1-6, +4 nível 7-14, +6 nível 15+).
                    </li>
                  </ul>
                </li>
              </ul>

              <h3>3.1.0</h3>
              <ul>
                <li>
                  <strong>
                    🎉 Nova funcionalidade: Edição Completa de Fichas!
                  </strong>
                  <ul>
                    <li>
                      Agora é possível editar qualquer aspecto de uma ficha
                      gerada: informações básicas, atributos, perícias,
                      equipamentos, poderes e magias.
                    </li>
                    <li>
                      Todas as edições são automaticamente recalculadas e mantêm
                      a consistência da ficha (defesa, PV, PM, bônus de
                      perícias, etc.).
                    </li>
                    <li>
                      Sistema de histórico de edições: todas as modificações
                      manuais são registradas no passo-a-passo da ficha para
                      auditoria completa.
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>📝 Edição de Informações Básicas:</strong>
                  <ul>
                    <li>
                      Nome com sugestões automáticas baseadas na raça e gênero
                      (usando banco expandido de nomes).
                    </li>
                    <li>
                      Modificação de nível, gênero, raça, classe, origem e
                      divindade.
                    </li>
                    <li>
                      Edição livre de modificadores de atributos com recálculo
                      automático de todos os valores dependentes.
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>⚔️ Edição de Equipamentos:</strong>
                  <ul>
                    <li>
                      Adição/remoção de armas, armaduras, escudos e equipamentos
                      gerais.
                    </li>
                    <li>
                      Controle automático de espaços ocupados e cálculo de
                      penalidades.
                    </li>
                    <li>
                      Recálculo automático de defesa e bônus quando equipamentos
                      são alterados.
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>🎯 Edição de Perícias:</strong>
                  <ul>
                    <li>Treinamento/destreinamento de qualquer perícia.</li>
                    <li>
                      Adição de bônus manuais na coluna &quot;Outros&quot;.
                    </li>
                    <li>Suporte completo a Ofícios customizados.</li>
                    <li>
                      Recálculo automático de totais considerando atributos e
                      níveis.
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>💪 Edição de Poderes:</strong>
                  <ul>
                    <li>
                      Liberdade total: adicione qualquer poder independente de
                      pré-requisitos (para máxima flexibilidade de criação).
                    </li>
                    <li>
                      Sistema visual inteligente: poderes disponíveis em verde,
                      não disponíveis em vermelho.
                    </li>
                    <li>
                      Aplicação automática de efeitos dos poderes (bônus em
                      atributos, defesa, perícias, etc.).
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>✨ Edição de Magias:</strong>
                  <ul>
                    <li>
                      Organização por círculos com indicação visual de
                      disponibilidade.
                    </li>
                    <li>
                      Sistema de busca avançada por nome, descrição e escola de
                      magia.
                    </li>
                    <li>
                      Filtros por círculo e tipo (arcanas/divinas) para
                      navegação fácil.
                    </li>
                    <li>
                      Liberdade total: adicione qualquer magia independente de
                      limitações de nível.
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>📚 Banco de Nomes Massivamente Expandido:</strong>
                  <ul>
                    <li>
                      Adicionados mais de 300 novos nomes para todas as raças,
                      baseados nos padrões linguísticos existentes.
                    </li>
                    <li>
                      Cada raça agora possui 20-40+ nomes adicionais masculinos
                      e femininos para maior variedade.
                    </li>
                    <li>
                      Sistema de sugestões inteligente no editor de nomes com
                      autocomplete.
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>💾 Persistência Automática:</strong>
                  <ul>
                    <li>
                      Todas as edições são automaticamente salvas no histórico
                      local.
                    </li>
                    <li>
                      Consistência total entre ficha exibida e dados salvos no
                      navegador.
                    </li>
                    <li>
                      Histórico de fichas sempre atualizado com as versões mais
                      recentes.
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>📱 Progressive Web App (PWA):</strong>
                  <ul>
                    <li>
                      Agora é possível instalar Fichas de Nimb como um
                      aplicativo no seu dispositivo.
                    </li>
                    <li>
                      Funcionalidade offline completa - use o gerador mesmo sem
                      internet.
                    </li>
                    <li>
                      Notificação de instalação aparece automaticamente no topo
                      da página.
                    </li>
                    <li>
                      Service Worker configurado para cache inteligente de todos
                      os recursos.
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>📱 Melhorias Massivas de Mobile:</strong>
                  <ul>
                    <li>
                      Formulário de geração de fichas redesenhado com foco
                      mobile-first.
                    </li>
                    <li>
                      Layout responsivo com Grid do Material-UI para melhor
                      organização.
                    </li>
                    <li>
                      Controles maiores e mais acessíveis em dispositivos
                      móveis.
                    </li>
                    <li>
                      Correção de dropdowns sendo cortados por containers de
                      cards.
                    </li>
                    <li>
                      Landing page otimizada para mobile com imagens de fundo
                      responsivas.
                    </li>
                    <li>
                      Tamanhos consistentes de cards e melhor adaptação a
                      diferentes telas.
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>⚔️ Gerador de Ameaças:</strong>
                  <ul>
                    <li>
                      Sistema de atributos simplificado: agora utiliza apenas
                      modificadores ao invés de valores completos (ex: +2, -1,
                      ou &quot;-&quot; para não possuir).
                    </li>
                    <li>
                      Suporte completo para ameaças que não possuem determinados
                      atributos usando &quot;-&quot; como valor.
                    </li>
                    <li>
                      Interface mobile otimizada com scroll automático ao topo
                      ao avançar etapas.
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>🐛 Correções de Bugs Importantes:</strong>
                  <ul>
                    <li>
                      Corrigido problema crítico onde habilidades de classe de
                      níveis superiores não apareciam (ex:
                      &ldquo;Eclético&rdquo; do Bardo no nível 2, &ldquo;Artista
                      Completo&rdquo; no nível 20).
                    </li>
                    <li>
                      Aplicação adequada de habilidades de classe durante
                      level-up em fichas aleatórias.
                    </li>
                    <li>
                      Filtragem correta de habilidades por nível em fichas
                      vazias.
                    </li>
                  </ul>
                </li>
              </ul>

              <h3>3.0.1</h3>
              <ul>
                <li>Histórico de fichas geradas voltou a funcionar.</li>
                <li>Adicionado uma nova forma de extrair ficha em PDF.</li>
              </ul>

              <h3>3.0.0</h3>
              <ul>
                <li>
                  Todos os textos foram atualizados para{' '}
                  <strong>Tormenta 20: Edição Jogo do Ano</strong>.
                </li>
                <ul>
                  <li>
                    Os textos da versão inicial do livro não estão mais
                    disponíveis na plataforma.
                  </li>
                </ul>
                <li>
                  O layout da ficha foi atualizado para ficar mais moderno e
                  bonito.
                </li>
                <ul>
                  <li>
                    Devido essa mudança, não está sendo possível exportar a nova
                    ficha para PDF diretamente. Você pode usar a opção
                    &quot;Ficha Detalhada&quot; para fazer isso.
                  </li>
                </ul>
                <li>
                  Mais poderes estão sendo automaticamente adicionados à ficha
                  (por exemplo os Aumentos de Atributo). Acreditamos que
                  alcançamos um estado em que praticamente todos os poderes que
                  devem ser calculados automaticamente na ficha já estão fazendo
                  isso.
                </li>
                <li>
                  O gerador de recompensas agora está utilizando as regras
                  atualizadas da versão JdA e resultando em itens mais
                  detalhados ainda.
                </li>
                <li>
                  O antigo &quot;Database&quot; teve o nome alterado para
                  &quot;Enciclopédia de Tannah-Toh&quot;.
                  <ul>
                    <li>As magias agora estão com todas as descrições.</li>
                    <li>
                      Magias divinas não estavam exibindo os aprimoramentos.
                      Isso foi alterado.
                    </li>
                  </ul>
                </li>
                <li>A página incial foi reorganizada.</li>
              </ul>
            </AccordionDetails>
          </Accordion>

          <Accordion
            expanded={expanded === 'v2'}
            onChange={handleChange('v2')}
            sx={{ mt: 1 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant='h6'>Versão 2</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <h3>2.6.2</h3>
              <ul>
                <li>
                  <a href='mapadearton.fichasdenimb.com.br'>Mapa de Arton</a>{' '}
                  foi atualizado:
                </li>
                <ul>
                  <li>
                    Adicionado mapas de Doherimm, Lamnor, Tamu-ra e Moreania.
                  </li>
                  <li>Novas localizações e descrições.</li>
                  <li>Marcação de reinados.</li>
                  <li>
                    Corrigido a opção de medir distâncias, que estava
                    completamente errada.
                  </li>
                </ul>
                <li>
                  A opção de exportar ficha para o Foundry foi atualizada para
                  levar em conta a versão mais recente do sistema.
                </li>
                <ul>
                  <li>
                    Agora classe e nível estão sendo exportados para a ficha.
                  </li>
                </ul>
                <li>Novas atualizaçãos na Caverna do Saber.</li>
              </ul>

              <h3>2.6.1</h3>
              <ul>
                <li>
                  Melhorias na navegação desktop e mobile do Database. Obrigado{' '}
                  <a
                    href='https://github.com/fabioars'
                    target='_blank'
                    rel='noreferrer'
                  >
                    @fabioars
                  </a>
                  .
                </li>
              </ul>

              <h3>2.6.0</h3>
              <ul>
                <li>
                  <strong>Novo layout!</strong> Demos uma melhorada na nossa
                  página atual, visando atualização futuras do projeto.
                </li>
                <li>Novas atualizaçãos na Caverna do Saber.</li>
              </ul>

              <h3>2.5.4</h3>
              <ul>
                <li>
                  Adicionada a Caverna do Saber - indíce de informações da
                  Revista Dragão Brasil.
                </li>
              </ul>

              <h3>2.5.3</h3>
              <ul>
                <li>Concertado problema no filtro de magias do Database.</li>
                <li>Melhorado um pouco a navegação na Database de Poderes.</li>
                <ul>
                  <li>
                    Agora é possível clicar numa aba que leva diretamente aos
                    tipos de poderes (Combate, Concedido, Destino, Magia
                    eTormenta). Está mais fácil de navegar nesse menu.
                  </li>
                </ul>
              </ul>

              <h3>2.5.2</h3>
              <ul>
                <li>
                  Adicionado todos os aprimoramentos das magias arcanas e
                  divinas.
                </li>
                <ul>
                  <li>
                    Muito obrigado a todos da comunidade que ajudaram a
                    transcrever todos os aprimoramentos
                  </li>
                </ul>
                <li>Adicionado Origens ao Database</li>
                <li>Adicionado links úteis de projetos de Tormenta 20</li>
              </ul>

              <h3>2.5.1</h3>
              <ul>
                <li>
                  Adicionado tabela de magias arcanas e divinas ao Database.
                </li>
                <li>
                  Adicionado a descrição dos poderes divinos na Database de
                  Divindades
                </li>
                <ul>
                  <li>
                    Os poderes concedidos continuam aparecendo na Database de
                    Poderes.
                  </li>
                </ul>
                <li>Adicionado os pré-requisitos dos poderes de classe.</li>
              </ul>

              <h3>2.5.0</h3>
              <ul>
                <li>
                  Adicionado o{' '}
                  <Link to='/database/raças'>Database Tormenta</Link>. Com ele,
                  é possível pesquisar (até mesmo por áudio) as raças, classes,
                  poderes e muito mais para consultar os textos.
                  <ul>
                    <li>
                      Esta sendo lançado nesse momento como uma versão inicial,
                      sujeito a diversas melhorias no futuro.
                    </li>
                    <li>
                      A funcionalidade de pesquisa por áudio está{' '}
                      <strong>disponível apenas no navegador Chrome</strong> e
                      provavelmente só irá funcionar com palavras regulares da
                      língua portuguesa (não espere que vá identificar
                      &quot;Aharadak&quot;, por exemplo).
                    </li>
                    <li>
                      As <strong>origens</strong> e <strong>magias</strong>{' '}
                      ainda não estão disponíveis porque preciso arrumar melhor
                      os dados delas.
                    </li>
                  </ul>
                </li>
                <li>
                  Removido uma repetição de texto quando um usuário gerava
                  várias recompensas ao mesmo tempo. Agora a tela fica mais
                  limpa e melhor de vizualizar tudo que foi gerado.
                </li>
                <li>
                  Dei uma <strong>melhorada básica</strong> no site todo para
                  celulares. Ainda está longe do ideal e utilizar um computador
                  é a melhor forma, mas agora dá para pelo menos navegar
                  direitinho e vizualizar as coisas.
                </li>
              </ul>

              <h3>2.4.2</h3>
              <ul>
                <li>
                  Adicionado uma opção para imprimir a ficha simplificada.
                  (Obrigado{' '}
                  <a href='https://github.com/YuriAlessandro/gerador-ficha-tormenta20/discussions/335'>
                    @EfficientDrink4367
                  </a>
                  ).
                </li>
                <li>
                  Adicionado uma página inicial para organizar melhor o site.
                </li>
              </ul>

              <h3>2.4.1</h3>
              <ul>
                <li>
                  Adicionado gerador de itens superiores. Ainda bem simples, a
                  ideia é evoluir isso para mostrar as stats dos itens no
                  futuro.
                </li>
                <li>Atualização de alguns componentes gráficos das telas.</li>
              </ul>

              <h3>2.4.0</h3>
              <ul>
                <li>
                  Adicionado um gerador de recompensas. Agora você pode gerar
                  recompensas para os combates da sua mesa com um único clique.
                </li>
              </ul>

              <h3>2.3.1</h3>
              <ul>
                <li>
                  Na <strong>Ficha Simplificada</strong>, estavam faltando os
                  poderes de classe e de origem. Esse problema foi corrigido.
                  (Obrigado{' '}
                  <a href='https://www.reddit.com/r/Tormenta/comments/rher2h/atualiza%C3%A7%C3%B5es_do_projeto_fichas_de_nimb_gerador_de/hsg19ol/'>
                    @EfficientDrink4367
                  </a>
                  ).
                </li>
              </ul>

              <h3>2.3.0</h3>
              <ul>
                <li>
                  Agora é possível gerar fichas de{' '}
                  <strong>qualquer nível</strong>. Basta escrever o número e
                  selecionar ele.
                </li>
                <ul>
                  <li>
                    É possível que a geração de fichas de níveis MUITO ALTOS
                    cause bugs. O projeto não dará suporte para bugs na geração
                    de níveis acima de 20.
                  </li>
                </ul>
                <li>
                  Todas as perícias agora estão disponíveis com os valores
                  somados.
                </li>
                <ul>
                  <li>
                    Por causa dessa mudança, o passo-a-passo foi movido para a
                    parte de baixo da tela.
                  </li>
                  <li>
                    A grande maioria dos poderes e habilidades que aumentam
                    perícias já estarão somando automaticamente, na coluna{' '}
                    <strong>Outros</strong>. Se você encontrar algum poder que
                    não está fazendo isso, nos avise.
                  </li>
                </ul>
                <li>
                  Adicionado o bônus de ataque das armas, baseado nas perícias
                  de Luta e Pontaria.
                </li>
                <ul>
                  <li>
                    Para este caso, os poderes que oferecem bônus de ataque{' '}
                    <strong>
                      ainda não estão sendo somados automaticamente
                    </strong>
                    .
                  </li>
                </ul>
                <li>
                  Adicionado uma opção de <strong>Ficha Simplificada.</strong>{' '}
                  Em resumo, ela fica igual as fichas de NPCs padrões do jogo -
                  mas com todas as informações de poderes, para você poder
                  chegar o que ainda falta ser calculado automaticamente.
                </li>
                <ul>
                  <li>
                    É possível alterar uma ficha já gerada entre os modelos
                    padrão e simplificado, basta marcar o checkbox.
                  </li>
                </ul>
                <li>
                  Adicionado a opção de mudar o tema entre claro e escuro na
                  barra superior.
                </li>
              </ul>

              <h3>2.2.0</h3>
              <ul>
                <li>
                  Adicionamos a opção de selecionar a <strong>Origem</strong> e
                  a <strong>Devoção</strong> da ficha. A ideia foi reforçada por{' '}
                  <a href='https://github.com/YuriAlessandro/gerador-ficha-tormenta20/discussions/305'>
                    @sitariom
                  </a>
                </li>
                <ul>
                  <li>
                    Observe que você{' '}
                    <strong>
                      não pode selecionar uma origem para a raça Golem
                    </strong>
                    . Por via de regra, essa raça não possui origem.
                  </li>
                  <li>
                    As divindades serão filtradas de acordo com a classe
                    selecionada. Dessa forma, você não poderá selecionar um
                    Paladinho devoto de Tenebra, por exemplo.
                  </li>
                </ul>
                <li>
                  Corrigido o comportamento do poder <strong>Abençoado</strong>{' '}
                  do Paladino, que agora está somando o modificador de carisma
                  na PM do 1º nível (obrigado{' '}
                  <a href='https://github.com/YuriAlessandro/gerador-ficha-tormenta20/discussions/310'>
                    @PaladinodeValkaria
                  </a>
                  ).
                </li>
                <li>
                  Agora a ficha irá adicionar o mínimo de 1 de PV por nível
                  (obrigado{' '}
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
                  considerando corretamente a divindade selecionada na ficha
                  (obrigado{' '}
                  <a href='https://github.com/YuriAlessandro/gerador-ficha-tormenta20/discussions/298'>
                    @VitZinc
                  </a>
                  ).{' '}
                </li>
              </ul>

              <h3>2.1.1</h3>
              <ul>
                <li>
                  Corrigido um problema em que os poderes concedidos eram
                  aplicados ao subir de nível, mesmo se o personagem não fosse
                  devoto (obrigado{' '}
                  <a href='https://github.com/YuriAlessandro/gerador-ficha-tormenta20/discussions/298'>
                    @VitZinc
                  </a>
                  ).{' '}
                </li>
              </ul>

              <h3>2.1.0</h3>
              <ul>
                <li>
                  Corrigimos o problema em que os poderes selecionados
                  anteriormente continuam na ficha após uma nova geração.
                </li>
                <li>
                  Corrigimos alguns outros problemas com a seleção de poderes de
                  forma geral. As coisas devem estar mais consistentes agora.
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
                    Nessa versão, apenas magias de até 3º círculo estão sendo
                    selecionadas (mesmo que você gere uma ficha com nível alto).
                  </li>
                  <li>
                    Todos os poderes de todas as classes estão adicionados.
                  </li>
                  <li>
                    Alguns poderes ainda não estão sendo aplicados ao subir de
                    nível (como por exemplo o poder{' '}
                    <strong>Aumento de Atributo</strong> das classes. Verifique
                    sua ficha com calma para validar o que ainda precisa ser
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
            </AccordionDetails>
          </Accordion>

          <Accordion
            expanded={expanded === 'v1'}
            onChange={handleChange('v1')}
            sx={{ mt: 1 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant='h6'>Versão 1</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <h3>1.1.2</h3>
              <ul>
                <li>
                  Corrigida a habilidade <strong>Herança Feérica</strong> que
                  não estava adicionando +1 de PM inicial para os elfos
                  (obrigado{' '}
                  <a href='https://github.com/YuriAlessandro/gerador-ficha-tormenta20/discussions/293'>
                    @pedrokoii
                  </a>
                  ).
                </li>
              </ul>

              <h3>1.1.1</h3>
              <ul>
                <li>
                  Estavam sendo selecionadas todas as habilidades, independente
                  de nível, no nível 1. Corrigimos esse problema.
                </li>
              </ul>

              <h3>1.1.0</h3>
              <ul>
                <li>
                  Filtro por Role: agora conseguimos criar personagens com
                  classes apenas vinculadas à role.
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
                  para ver um tutorial de como importar sua ficha dentro do
                  Foundry.
                  <ul>
                    <li>
                      Até o momento, apenas as informações básicas e as perícias
                      estão sendo exportadas (basicamente, tudo que você não
                      precisa arrastar para sua ficha no Foundry).
                    </li>
                  </ul>
                </li>
              </ul>

              <h3>1.0.3</h3>
              <ul>
                <li>
                  Corrigimos os poderes de Lena, que estavam definidos como os
                  poderes de Megalokk (obrigado{' '}
                  <a href='https://github.com/YuriAlessandro/gerador-ficha-tormenta20/discussions/277'>
                    @vnmontanhavn
                  </a>
                  ).
                </li>
              </ul>

              <h3>1.0.2</h3>
              <ul>
                <li>
                  Modificadores do atributo base não estavam sendo aplicados na
                  PM inicial na ficha. Isso foi corrigido (obrigado{' '}
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
                  Corrigimos um problema que estava possibilitando que devotos
                  de Thyatis recebessem Dom da Imortalidade ou Dom da
                  Resurreição sem poderem. Existe uma restrição de classe para
                  esses dois poderes:
                  <ul>
                    <li>
                      Dom da Imortalidade só pode ser utilizado por Paladinos.
                    </li>
                    <li>
                      Dom da Ressureição só pode ser utilizado por Clérigos.
                    </li>
                  </ul>
                </li>
                <li>
                  Agora todas as magias estão mostrando a escola correspondente.
                </li>
                <li>Os poderes na ficha agora estão expandidos por padrão.</li>
                <li>
                  Bardo agora virá com um instrumento aleatório na lista de
                  equipamentos (sinta-se a vontade para sugerir novos
                  instrumentos).
                </li>
              </ul>

              <h3>1.0.1</h3>
              <ul>
                <li>
                  Trocamos o termo &quot;sexo&quot; por &quot;gênero&quot; no
                  passo-a-passo (até para melhor refletir o livro).
                </li>
                <li>
                  Na mobile, algumas magias não estavam com o custo de PM
                  aparecendo (é o valor entre paranteses antes do nome da
                  magia). Isso foi corrigido.
                </li>
                <li>
                  As magias <strong>Trasmissão da Loucura</strong> e{' '}
                  <strong>Augúrio</strong> são de segundo círculo, mas existem
                  poderes divinos que dão elas logo no primeiro nível. Antes,
                  estava um texto temporário no passo-a-passo e as magias não
                  apareciam na lista. Agora, elas aparecem e também está
                  devidamente indicado no passo-a-passo.
                </li>
                <li>
                  O Druida estava sendo devoto de Allihanna, Aharadak ou Oceano,
                  mas o correto seria Megalokk ao invés de Aharadak. A troca foi
                  realizada (obrigado{' '}
                  <a href='https://github.com/YuriAlessandro/gerador-ficha-tormenta20/issues/212'>
                    @RuanOniiKun
                  </a>
                  )
                </li>
                <li>
                  Todos os personagens estavam sendo sempre devotos. Essa não é
                  a ideia do Fichas de Nimb, portanto corrigimos o problema.
                  Existe uma chance do personagem ser devoto, e isso é baseado
                  na raça e na classe, como indicamos no changelog da primeira
                  versão.
                </li>
                <li>
                  O Minotauro estava com textos de Golem no passo-a-passo.
                  Apesar disso, as habilidades estavam sendo selecionadas
                  corretamente e os efeitos bem aplicados. A informação foi
                  corrigida no passo-a-passo (obrigado{' '}
                  <a href='https://github.com/YuriAlessandro/gerador-ficha-tormenta20/issues/214'>
                    @dcatein
                  </a>
                  ).
                </li>
                <li>
                  As habilidades de Trog que modificavam a ficha não estavam
                  aparecendo no passo-a-passo, e adicionamos lá agora (obrigado{' '}
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
                  Habilidades de raça e classe que garantam modificações de
                  atributo e/ou novas perícias já são automaticamente
                  consideradas.
                </li>
                <li>
                  Geração das magias inicias para Arcanista, Druida, Clérigo e
                  Bardo.
                </li>
                <li>
                  Os nomes dos personagens são gerados aleatoriamente com base
                  na raça. Nome de Osteon é baseado em uma raça
                  &quot;anterior&quot; - ou seja, a raça do personagem antes
                  dele morrer.
                </li>
                <li>
                  Filtros de geração permitem que você escolha qual raça/classe
                  deseja gerar.
                </li>
                <li>
                  Gerando aleatoriamente se um personagem é devoto ou não. Caso
                  ele seja, é escolhido aleatoriamente o Deus e os poderes
                  concedidos.
                </li>
                <li>
                  Gerando origem aleatória. Os poderes de origem são escolhidos
                  aleatoriamente junto com as perícias, seguindos as regras
                  determinadas pelo sistema.
                </li>
                <li>
                  Equipamento inicial, com todo os itens oriundos da origem,
                  dinheiro inicial, e as armas aleatórias com base nas
                  proficiências do personagem gerado.
                </li>
              </ul>
            </AccordionDetails>
          </Accordion>

          <p style={{ marginTop: '24px' }}>
            Leve sempre em consideração que esse é um projeto sem fins
            lucrativos e de código aberto, portanto alterações nele são feitas
            por voluntários que trabalham em seu tempo livre.
          </p>
        </div>
      </Container>
    </>
  );
};

export default Changelog;
