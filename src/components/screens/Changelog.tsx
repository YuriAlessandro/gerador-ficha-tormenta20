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
            21/07/2026 (v4.26.1).
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
              <Typography
                variant='h6'
                sx={{
                  fontWeight: 'bold',
                }}
              >
                Versão 4 (Atual)
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <h3>4.26.1</h3>
              <ul>
                <li>
                  <strong>Melhoria:</strong> Todos os links da página inicial e
                  da lista de posts do blog agora são links de verdade: dá para
                  abrir qualquer um em uma nova aba (Ctrl/Cmd + clique, clique
                  com o botão do meio ou &quot;abrir em nova guia&quot;) e ver o
                  endereço de destino ao passar o mouse.
                </li>
                <li>
                  <strong>Melhoria:</strong> Ao usar o botão voltar do
                  navegador, a página agora volta para a posição de rolagem em
                  que você estava, em vez de recomeçar do topo.
                </li>
                <li>
                  <strong>Correção:</strong> No celular, tocar no chip{' '}
                  <strong>Ofício</strong> durante a criação de personagem
                  quebrava a tela e exibia a mensagem de erro do aplicativo.
                  Agora a lista de ofícios abre normalmente.
                </li>
              </ul>

              <h3>4.26</h3>

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
                  gutterBottom
                  sx={{
                    fontWeight: 'bold',
                    color: 'success.dark',
                  }}
                >
                  Complicações — regra opcional de Heróis de Arton
                </Typography>
                <Typography variant='body1' sx={{ mb: 1 }}>
                  Chegou a primeira das{' '}
                  <strong>regras opcionais de Heróis de Arton</strong>: as{' '}
                  <strong>Complicações</strong>. Na criação de personagem (com o
                  suplemento Heróis de Arton ativo), você pode escolher{' '}
                  <strong>uma complicação</strong> para o seu herói — uma
                  restrição ou penalidade que faz parte da história dele — e, em
                  troca, ganha um <strong>poder geral adicional</strong>{' '}
                  (respeitando os pré-requisitos).
                </Typography>
                <Typography
                  variant='body2'
                  sx={{ color: 'text.secondary', mb: 1 }}
                >
                  São <strong>54 complicações oficiais</strong> (gerais e
                  específicas de classe). As penalidades numéricas — em
                  perícias, Defesa, PV, PM e deslocamento — são{' '}
                  <strong>aplicadas automaticamente na ficha</strong>; as de
                  interpretação ficam descritas para você e seu mestre
                  conduzirem em jogo.
                </Typography>
                <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                  Complicações de classe têm uma regra extra: você só usa o
                  poder concedido enquanto{' '}
                  <strong>metade dos seus níveis</strong> forem daquela classe —
                  se deixar de cumprir isso (em uma multiclasse, por exemplo), o
                  poder aparece <strong>marcado como indisponível</strong> na
                  ficha, com um aviso, mas nunca é removido. Você pode{' '}
                  <strong>adicionar, trocar ou remover</strong> a complicação
                  depois, direto pela ficha.
                </Typography>
              </Alert>

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
                  gutterBottom
                  sx={{
                    fontWeight: 'bold',
                    color: 'success.dark',
                  }}
                >
                  Guia de Deuses Menores — novo suplemento
                </Typography>
                <Typography variant='body1' sx={{ mb: 1 }}>
                  Chegou o <strong>Guia de Deuses Menores</strong>, com{' '}
                  <strong>63 novas divindades</strong> para o seu personagem
                  cultuar. Cada deus menor concede{' '}
                  <strong>um poder concedido</strong> e tem um{' '}
                  <strong>status divino de 1 a 5</strong>, que mostra o quanto
                  ele já se firmou entre os fiéis de Arton.
                </Typography>
                <Typography
                  variant='body2'
                  sx={{ color: 'text.secondary', mb: 1 }}
                >
                  Como todo suplemento, é preciso{' '}
                  <strong>ativá-lo no seu perfil</strong> para que os deuses
                  apareçam. Depois disso eles entram na{' '}
                  <strong>escolha de devoção</strong> na criação de personagem,
                  no <strong>editor da ficha</strong>, na{' '}
                  <strong>tabela de Divindades</strong> e na busca da
                  enciclopédia — e também podem sair em{' '}
                  <strong>fichas aleatórias</strong>, com menos frequência que
                  os vinte deuses maiores.
                </Typography>
                <Typography
                  variant='body2'
                  sx={{ color: 'text.secondary', mb: 1 }}
                >
                  O status divino não é só enfeite — ele vale pontos. Como o
                  deus menor concede <strong>um único poder</strong>, as classes
                  divinas que normalmente ganhariam dois (Clérigo, Paladino,
                  Druida e Frade) recebem, no lugar do segundo,{' '}
                  <strong>PM adicionais iguais a 1 + o status divino</strong> do
                  deus, limitados pelo seu nível. Tudo aplicado automaticamente
                  na ficha, e o valor aparece no passo a passo creditado à
                  divindade.
                </Typography>
                <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                  Em compensação, um deus menor só ensina até onde alcança:{' '}
                  <strong>
                    conjuradores divinos lançam magias até o círculo igual ao
                    status divino
                  </strong>{' '}
                  do seu deus, mesmo que o nível já permitisse círculos
                  superiores. Magias fora desse alcance aparecem marcadas como{' '}
                  <strong>indisponíveis</strong>, com a explicação — nada é
                  apagado da sua ficha, e o aviso some sozinho se você trocar de
                  divindade.
                </Typography>
              </Alert>

              <ul>
                <li>
                  <strong>Novo:</strong> <strong>Guia de acerto</strong>: ao
                  lançar uma magia com área de efeito, o diálogo de conjuração
                  passa a mostrar um <strong>grid de batalha</strong> com os
                  quadrados atingidos pintados e{' '}
                  <strong>numerados de 1 a N</strong> — é só conferir no
                  dispositivo contra o grid da mesa para saber exatamente o que
                  a magia pega. Esferas, cubos, quadrados, cilindros, linhas e
                  cones são desenhados seguindo as regras de{' '}
                  <strong>Alvos &amp; Áreas</strong> do livro básico, com{' '}
                  <strong>1 quadrado = 1,5m</strong>. Cones e linhas podem ser{' '}
                  <strong>girados nas oito direções</strong>, e magias com mais
                  de uma opção de área deixam você escolher qual conferir.
                </li>
                <li>
                  <strong>Novo:</strong>{' '}
                  <strong>
                    Aprimoramentos de magia conectados às rolagens
                  </strong>
                  : ao lançar uma magia e ativar um aprimoramento que aumenta o
                  dano, a rolagem de dados agora{' '}
                  <strong>cresce automaticamente</strong>. Antes de rolar, uma
                  tela de confirmação mostra o dano que será jogado — e você
                  ainda pode ajustá-lo manualmente naquele lançamento.
                </li>
                <li>
                  <strong>Novo:</strong> no editor da ficha, conjuradores agora
                  podem escolher o <strong>atributo-chave</strong> usado tanto
                  na <strong>CD das magias</strong> (qualquer um dos seis
                  atributos) quanto no cálculo dos <strong>PM</strong> — este
                  com o limite por patamar previsto na regra.
                </li>
                <li>
                  <strong>Novo:</strong> Na loja da criação de personagem, itens
                  que fazem sentido comprar aos montes —{' '}
                  <strong>munição</strong>, <strong>itens alquímicos</strong> e{' '}
                  <strong>alimentação</strong> — ganharam um{' '}
                  <strong>seletor de quantidade</strong>. Comprar 20 flechas
                  virou um clique, e na mochila elas aparecem agrupadas como
                  &quot;×20&quot; em vez de vinte linhas repetidas.
                </li>
                <li>
                  <strong>Novo:</strong> Agora dá para criar um{' '}
                  <strong>Ofício personalizado</strong>. Se a profissão do seu
                  herói não está entre as dezesseis do livro, basta digitar o
                  nome dela — Ofício (Ferreiro anão), Ofício (Cervejeiro) — e
                  ela vira uma perícia normal da ficha: aparece na tabela com
                  Inteligência, conta como treinada, acompanha o seu nível, sai
                  no <strong>PDF</strong> e satisfaz pré-requisitos de poderes
                  que pedem Ofício (Qualquer).
                </li>
                <li>
                  <strong>Melhoria:</strong> Os poderes{' '}
                  <strong>Tradição Perdida</strong> e{' '}
                  <strong>Tradição Perdida Aprimorada</strong> (Heróis de Arton)
                  agora perguntam o <strong>atributo-chave</strong> no momento
                  em que você seleciona o poder — a escolha é aplicada
                  automaticamente ao <strong>total de PM</strong> (Tradição
                  Perdida) e à <strong>CD das magias</strong> (Tradição Perdida
                  Aprimorada). Você ainda pode ajustar depois pelo editor da
                  ficha.
                </li>
                <li>
                  <strong>Melhoria:</strong> A{' '}
                  <strong>loja da criação de personagem</strong> foi refeita.
                  Ela <strong>travava celulares e computadores</strong> por
                  carregar todos os quase 400 itens de uma vez; agora abre e
                  responde na hora. Além disso, a lista virou uma{' '}
                  <strong>
                    tabela que muda de colunas conforme a categoria
                  </strong>{' '}
                  — armas mostram{' '}
                  <strong>dano, crítico, tipo de dano, alcance</strong> e se são
                  simples, marciais, exóticas ou de fogo; armaduras e escudos
                  mostram <strong>defesa e penalidade</strong>. Itens que seu
                  personagem <strong>não tem proficiência</strong> para usar vêm
                  marcados, o <strong>dinheiro e os espaços</strong> ficam
                  sempre visíveis no topo, e a busca encontra o item{' '}
                  <strong>em qualquer categoria</strong>, sem você precisar
                  adivinhar onde ele está.
                </li>
                <li>
                  <strong>Melhoria:</strong> Na <strong>mochila</strong> da
                  ficha, o botão de <strong>adicionar item</strong> agora abre
                  direto na aba da categoria que você está filtrando. Se você
                  filtrou por &quot;Armadura&quot; e clica em &quot;+&quot;, a
                  janela já abre em Armadura.
                </li>
                <li>
                  <strong>Melhoria:</strong> A <strong>ficha completa</strong>{' '}
                  ficou menos poluída: <strong>Defesa</strong>,{' '}
                  <strong>Ataques</strong>, <strong>Perícias</strong>,{' '}
                  <strong>Poderes</strong>, <strong>Magias</strong> e{' '}
                  <strong>Equipamentos</strong> agora ficam organizados em{' '}
                  <strong>abas</strong>, em vez de um bloco único e comprido. No
                  celular as abas rolam para o lado; no computador as Perícias
                  ganham espaço próprio à direita.
                </li>
                <li>
                  <strong>Melhoria:</strong> Os{' '}
                  <strong>equipamentos na ficha</strong> deixaram de ser uma
                  lista solta de etiquetas e viraram uma{' '}
                  <strong>tabela agrupada por categoria</strong>, com as colunas
                  que importam em cada uma — armas mostram{' '}
                  <strong>dano e crítico</strong>; armaduras e escudos mostram{' '}
                  <strong>defesa e penalidade</strong>. Uma{' '}
                  <strong>barra de carga</strong> indica quantos espaços você
                  está ocupando e avisa quando o personagem entra em{' '}
                  <strong>sobrecarga</strong>.
                </li>
                <li>
                  <strong>Melhoria:</strong> No assistente de criação, os passos
                  de escolha de <strong>perícias</strong> ganharam um{' '}
                  <strong>campo de busca</strong> — digitar &quot;Ofício&quot;
                  ou &quot;Atletismo&quot; filtra a lista na hora, em vez de
                  você procurar entre dezenas de opções.
                </li>
                <li>
                  <strong>Melhoria:</strong> Ainda nos passos de perícia, os{' '}
                  <strong>
                    dezesseis Ofícios deixaram de ocupar um chip cada
                  </strong>
                  : agora existe um único chip <strong>Ofício</strong>, que abre
                  uma lista com busca. Para quem não usa Ofício — a maioria — a
                  lista de perícias encolheu bastante; para quem usa, os ofícios
                  escolhidos aparecem como chips próprios ao lado, com um × para
                  remover. O mesmo seletor substituiu o antigo campo de seleção
                  no <strong>editor de perícias da ficha</strong>.
                </li>
                <li>
                  <strong>Melhoria:</strong> A{' '}
                  <strong>aba de Poderes da ficha foi repensada</strong>,
                  principalmente no celular. Os poderes agora aparecem{' '}
                  <strong>agrupados pela origem</strong> — poderes de classe,
                  habilidades de raça, poderes de origem, divinos e gerais —,
                  cada grupo com seu cabeçalho e a quantidade de poderes. Assim
                  a origem é dita <strong>uma vez por grupo</strong>, em vez de
                  repetida em toda linha espremendo o nome do poder. No celular,
                  tocar num poder abre o texto num{' '}
                  <strong>painel que sobe pela base da tela</strong>, então a
                  lista não muda de altura embaixo do seu dedo; no computador os
                  poderes continuam abrindo no lugar, e você pode deixar vários
                  abertos ao mesmo tempo para comparar.
                </li>
                <li>
                  <strong>Melhoria:</strong> A aba de Poderes ganhou{' '}
                  <strong>busca e filtros</strong>. A busca considera o nome{' '}
                  <strong>e a descrição</strong> do poder — dá para procurar
                  &quot;fogo&quot; e achar todos os seus poderes que falam de
                  fogo — e ignora acentos e maiúsculas. Ao lado dela, chips
                  filtram por origem mostrando quantos poderes existem em cada
                  uma. Os <strong>poderes gerais</strong> também passaram a
                  aparecer separados por tipo (Combate, Destino, Magia, Tormenta
                  e Raça). Reordenar os poderes manualmente continua funcionando
                  como antes.
                </li>
                <li>
                  <strong>Correção:</strong> As{' '}
                  <strong>
                    proficiências concedidas por origens e poderes
                  </strong>{' '}
                  sumiam da ficha ao salvar e recarregar. Quem pegava{' '}
                  <strong>Procurado: Vivo ou Morto</strong>, por exemplo,
                  recebia a proficiência com <strong>armas de fogo</strong> na
                  criação, mas ela desaparecia na próxima vez que a ficha era
                  aberta — e não voltava mais. Agora ela é preservada, e as{' '}
                  <strong>fichas já afetadas se corrigem sozinhas</strong> ao
                  serem abertas. Se você tinha removido alguma proficiência de
                  propósito, ela continua removida.
                </li>
                <li>
                  <strong>Correção:</strong> As{' '}
                  <strong>armas entregues por origens</strong> entravam na
                  mochila como item comum e não apareciam na{' '}
                  <strong>lista de ataques</strong> nem no <strong>PDF</strong>.
                  Era o caso da <strong>Pistola</strong> de Procurado: Vivo ou
                  Morto, do <strong>Gládio</strong> do Legionário, da{' '}
                  <strong>Adaga</strong> do Bandoleiro da Fortaleza, da{' '}
                  <strong>Clava</strong> do Caçador de Ratos, do{' '}
                  <strong>Martelo leve</strong> do Ferreiro Militar, do{' '}
                  <strong>Arco curto</strong> do Náufrago e do{' '}
                  <strong>Gibão de peles</strong> do Iniciado dos Caça-Monstros.
                  Agora todas chegam como equipamento de verdade, com dano e
                  crítico — e as munições vêm rastreadas, então a Pistola já
                  nasce com suas balas contabilizadas.
                </li>
                <li>
                  <strong>Correção:</strong> O dano desarmado da habilidade{' '}
                  <strong>Briga</strong> (Lutador) ficava fixo em{' '}
                  <strong>1d6</strong> em qualquer nível. Agora ele sobe
                  conforme a tabela oficial da classe — 1d8 no 5º, 1d10 no 9º,
                  1d12 no 13º, 2d8 no 17º e 2d10 no 20º —, valendo também para a
                  variante <strong>Atleta</strong>. Em multiclasse, conta o
                  nível na classe que concede a Briga, não o nível do
                  personagem.
                </li>
                <li>
                  <strong>Correção:</strong> Corrigida a{' '}
                  <strong>multiclasse com Necromante</strong>: ao escolher a
                  variante no assistente de subir de nível, o passo
                  &quot;Configuração da Classe&quot; aparecia em branco e
                  travava a evolução. Como o Necromante já tem caminho de magias
                  próprio (necromancia divina, sem encantamento), a escolha
                  agora segue direto para os ganhos do nível.
                </li>
                <li>
                  <strong>Correção:</strong> Corrigido um problema grave em que{' '}
                  <strong>
                    editar uma ficha por &quot;Meus Personagens&quot; podia
                    zerá-la
                  </strong>{' '}
                  — atributos, perícias e itens eram apagados no próximo
                  salvamento (por exemplo, ao subir de nível). A edição agora
                  carrega a ficha completa da nuvem, e tanto o app quanto o
                  servidor passam a bloquear qualquer salvamento que apagaria
                  dados críticos da ficha, exibindo um aviso para recarregar a
                  página.
                </li>
                <li>
                  <strong>Correção:</strong> A página da ficha compartilhada
                  mostrava &quot;Ficha atualizada com sucesso!&quot; mesmo
                  quando o salvamento na nuvem falhava; agora o erro é informado
                  corretamente.
                </li>
                <li>
                  <strong>Correção:</strong> na <strong>Mesa Virtual</strong>, a
                  sincronização automática dos <strong>parceiros</strong>{' '}
                  (Melhor Amigo) podia disparar o salvamento da ficha inteira;
                  agora ela envia apenas os <strong>efeitos ativos</strong>,
                  evitando sobrescritas indevidas.
                </li>
                <li>
                  <strong>Correção:</strong> na <strong>Mesa Virtual</strong>,{' '}
                  <strong>editar um parceiro personalizado</strong> falhava com
                  erro de servidor e as mudanças não eram salvas — ao adicionar
                  um módulo, renomear ou trocar a cor. Agora a edição funciona e
                  o parceiro mantém seus dados originais.
                </li>
                <li>
                  <strong>Correção:</strong> Na loja da criação de personagem,{' '}
                  <strong>
                    remover um item devolvia dinheiro que nunca saiu
                  </strong>
                  : itens adicionados de graça e os que vêm da sua origem
                  reembolsavam o preço ao serem removidos, criando dinheiro do
                  nada. Agora só é devolvido o valor do que foi realmente
                  comprado.
                </li>
                <li>
                  <strong>Correção:</strong> Na loja da criação de personagem, o{' '}
                  <strong>dinheiro já gasto voltava</strong> ao sair e retornar
                  ao passo do mercado. O saldo agora é preservado.
                </li>
                <li>
                  <strong>Correção:</strong> Itens comprados na criação de
                  personagem podiam acabar{' '}
                  <strong>compartilhados entre fichas diferentes</strong>,
                  fazendo com que editar o item de um personagem afetasse o de
                  outro. Cada ficha agora recebe a sua própria cópia.
                </li>
                <li>
                  <strong>Correção:</strong> A habilidade{' '}
                  <strong>Tanga de Peles</strong> (Bárbaro{' '}
                  <strong>Machado de Pedra</strong>) não era aplicada
                  automaticamente — era preciso somar tudo à mão no campo de
                  bônus manual da Defesa. Agora a{' '}
                  <strong>Constituição entra na Defesa</strong> enquanto você
                  não estiver usando armadura, e o{' '}
                  <strong>+1 do 3º nível</strong> (e a cada quatro níveis
                  seguintes) é contado sozinho. Assim o campo de bônus manual
                  volta a servir só para os buffs temporários da sua mesa.
                </li>
                <li>
                  <strong>Correção:</strong> Poderes e habilidades que o livro
                  condiciona a <strong>não estar usando armadura</strong> agora
                  respeitam essa restrição na ficha — antes o bônus era aplicado
                  sempre. Vale para <strong>Pele de Ferro</strong> (Bárbaro),{' '}
                  <strong>Insolência</strong> e <strong>Esquiva Sagaz</strong>{' '}
                  (Bucaneiro), <strong>Casca Grossa</strong> e{' '}
                  <strong>Braços Calejados</strong> (Lutador). Se o seu
                  personagem usa armadura pesada, a Defesa dele pode diminuir —
                  é a regra sendo aplicada corretamente.
                </li>
                <li>
                  <strong>Correção:</strong> A{' '}
                  <strong>explicação do cálculo da Defesa</strong> só listava
                  bônus de valor fixo, então bônus vindos de atributos ou que
                  crescem com o nível entravam no total sem aparecer na conta —
                  as parcelas não fechavam com o número exibido. Agora a fórmula
                  mostra todas as parcelas, tanto na ficha quanto na janela de
                  edição de Defesa.
                </li>
                <li>
                  <strong>Correção:</strong> A habilidade{' '}
                  <strong>Instinto Selvagem</strong> (Bárbaro) não somava o
                  bônus no <strong>dano</strong> das fichas criadas pelo gerador
                  aleatório — Percepção e Reflexos vinham certos, só o dano
                  ficava de fora. O problema valia para qualquer bônus de arma
                  vindo de habilidade ou poder, e não aparecia em fichas feitas
                  pelo assistente de criação nem depois de subir de nível. Se
                  você tem uma ficha antiga afetada, o valor se corrige sozinho
                  na primeira edição.
                </li>
                <li>
                  <strong>Correção:</strong> No detalhe ao lado da arma, o bônus
                  de <strong>Instinto Selvagem</strong> aparecia como{' '}
                  <strong>+0 no dano</strong> em vez do valor real. Em
                  personagens <strong>multiclasse</strong>, o bônus agora usa
                  corretamente o seu <strong>nível de Bárbaro</strong>, e não o
                  nível total.
                </li>
              </ul>
              <h3>4.25.1</h3>
              <ul>
                <li>
                  <strong>Novo:</strong> O editor de item da Mochila ganhou o
                  campo <strong>Categoria de proficiência</strong> (aba
                  Estatísticas): dá para mudar a categoria de qualquer arma —
                  ex.: tornar um Tridente &quot;Simples&quot; para o seu
                  personagem — e a opção &quot;Padrão&quot; mostra e restaura a
                  categoria original do catálogo.
                </li>
                <li>
                  <strong>Novo:</strong>{' '}
                  <strong>Proficiência em arma específica</strong>: adicionar o
                  nome exato de uma arma no editor de proficiências (ex.:
                  &quot;Katana&quot;) agora concede proficiência apenas com ela,
                  sem precisar da categoria inteira — o –5 não é aplicado. O
                  editor mostra uma dica explicando o recurso.
                </li>
                <li>
                  <strong>Correção:</strong> Poderes e habilidades que tornam
                  armas específicas <strong>armas simples para você</strong>{' '}
                  agora concedem as proficiências correspondentes (nada de –5
                  indevido): <strong>Mestre do Tridente</strong> (Sereia),{' '}
                  <strong>Tradição de Heredrimm</strong> (Anão),{' '}
                  <strong>Arquearia Élfica</strong>,{' '}
                  <strong>Tradição de Lin-Wu</strong> e{' '}
                  <strong>Pirata Oceânico</strong>. As proficiências aparecem
                  como chips na ficha e podem ser removidas manualmente. O{' '}
                  <strong>Arsenal Oceano</strong> (Elfo-do-Mar), que já concedia
                  proficiência em arpão, rede e tridente, agora é reconhecido
                  pela checagem.
                </li>
                <li>
                  <strong>Correção:</strong> O +2 em ataques da{' '}
                  <strong>Tradição de Heredrimm</strong> agora cobre a{' '}
                  <strong>Marreta</strong> e os martelos/machados do Heróis de
                  Arton (Martelo leve, Martelo longo, Malho, Bico de corvo,
                  Marrão e Machado de haste) — a marcação de arma anã faltava
                  nesses itens.
                </li>
                <li>
                  <strong>Correção:</strong> O +2 nas rolagens de dano com arcos
                  da <strong>Arquearia Élfica</strong> agora é aplicado
                  automaticamente (antes o poder era apenas descritivo).
                </li>
              </ul>
              <h3>4.25</h3>
              <ul>
                <li>
                  <strong>Novo:</strong> Classes conjuradoras de{' '}
                  <strong>homebrew</strong> agora podem configurar o{' '}
                  <strong>acesso às escolas de magia</strong>. No editor de
                  classe, escolha entre três modos: <strong>todas</strong> as
                  escolas, um conjunto de <strong>escolas fixas</strong>, ou{' '}
                  <strong>escolha do jogador</strong> (como o Bardo) — definindo
                  quantas escolas podem ser escolhidas e quais estão
                  disponíveis. A escolha aparece no assistente de criação de
                  ficha e ao multiclassear na evolução de nível; fichas geradas
                  aleatoriamente sorteiam as escolas automaticamente.
                </li>
                <li>
                  <strong>Novo:</strong> <strong>Rotas no Mapa de Arton</strong>
                  , para todo mundo: trace rotas entre cidades, locais
                  customizados e a posição do grupo, com distância em km e{' '}
                  <strong>tempo de viagem</strong> calculado pela tabela de
                  deslocamento do Tormenta 20 (escolhendo o deslocamento do
                  membro mais lento do grupo, levando montarias em conta).
                  Disponível na página pública do mapa e na mesa virtual, para
                  Mestres e jogadores.
                </li>
                <li>
                  <strong>Novo:</strong> As rotas oferecem{' '}
                  <strong>caminhos alternativos</strong> — incluindo, quando
                  possível, uma opção <strong>pelo mar</strong> para grupos que
                  preferem navegar — sempre indicando se o trajeto é todo por
                  terra ou inclui embarcação (Barcaça, Biga de Guerra, Jangada
                  ou Veleiro, cada uma com sua velocidade).
                </li>
                <li>
                  <strong>Novo:</strong> Estradas podem ter{' '}
                  <strong>condições especiais</strong>, destacadas na rota e
                  explicadas no painel: <strong>terreno difícil</strong>{' '}
                  (amarelo, metade da distância por dia),{' '}
                  <strong>zona de Tormenta</strong> (vermelho) e{' '}
                  <strong>estrada em guerra</strong> (laranja).
                </li>
                <li>
                  <strong>Novo:</strong> Ajustes do Mestre em tempo real na
                  rota: ative <strong>terreno difícil/clima hostil</strong> para
                  a viagem inteira ou marque trechos específicos clicando sobre
                  a rota (inclusive os trechos fora das estradas), reduzindo a
                  distância diária pela metade nos pedaços afetados.
                </li>
                <li>
                  <strong>Novo:</strong> Botão <strong>Rotas</strong> na busca
                  de cidades e nos cards dos locais do Mapa de Arton, e{' '}
                  <strong>Rotas daqui</strong> na posição do grupo e nos
                  pins/marcadores customizados.
                </li>
                <li>
                  <strong>Novo:</strong> Passo{' '}
                  <strong>Equipamento Inicial</strong> na criação customizada de
                  ficha: escolha a arma simples, a arma marcial (se a classe for
                  proficiente), a armadura leve e o instrumento do Bardo, em vez
                  de partir de uma mochila vazia. Itens automáticos (como Brunea
                  e Escudo Leve) são exibidos no passo.
                </li>
                <li>
                  <strong>Novo:</strong>{' '}
                  <strong>Penalidade por não proficiência</strong> em armas:
                  atacar com uma arma marcial, exótica ou de fogo sem a
                  proficiência correspondente agora aplica automaticamente o{' '}
                  <strong>–5 nos testes de ataque</strong> (regra do livro
                  básico) — no bônus exibido na ficha, nas rolagens, no preview
                  dos modos de ataque e no PDF exportado. A arma fica{' '}
                  <strong>destacada em âmbar</strong> na ficha, com uma legenda
                  explicando a penalidade. Armas simples nunca penalizam, e{' '}
                  <strong>Armas Marciais de Distância</strong> cobre as marciais
                  com alcance ou arremesso. Itens customizados podem definir a
                  categoria de proficiência no formulário (sem categoria, não há
                  penalidade).
                </li>
                <li>
                  <strong>Novo:</strong> Vestir uma <strong>armadura</strong> ou
                  empunhar um <strong>escudo</strong> sem proficiência agora
                  estende a <strong>penalidade de armadura</strong> a todas as
                  perícias baseadas em <strong>Força e Destreza</strong>{' '}
                  (incluindo Luta e Pontaria), como manda a regra — o item fica{' '}
                  <strong>destacado em âmbar</strong> na ficha, com uma legenda
                  explicando a penalidade. Editar as proficiências da ficha
                  atualiza as penalidades na hora.
                </li>
                <li>
                  <strong>Novo:</strong> <strong>Materiais especiais</strong> do
                  Bazar Monstruoso (<strong>Ameaças de Arton</strong>, cap. 3)
                  no editor de modificações de itens — como casco de monstro e
                  couraça de kaiju — além da melhoria de arma{' '}
                  <strong>Penetrante</strong>. Disponíveis com o suplemento
                  ativo; efeitos numéricos são aplicados automaticamente na
                  ficha.
                </li>
                <li>
                  <strong>Novo:</strong> Nos encontros da mesa virtual, ameaças
                  agora podem ter <strong>PV e PM temporários</strong> acima do
                  total, como as fichas de jogadores: o mestre edita os valores
                  pelo novo botão de lápis no card do combatente, e o dano
                  consome os pontos temporários primeiro. O valor aparece em
                  laranja (<strong>+N</strong>) ao lado do PV/PM, sem inflar a
                  barra — e uma ameaça com 0 PV mas com PV temporário continua
                  em combate.
                </li>
                <li>
                  <strong>Melhoria:</strong> A busca de cidades do Mapa de Arton
                  foi reposicionada para o canto superior esquerdo, ao lado do
                  seletor de mapa, com um card do local selecionado.
                </li>
                <li>
                  <strong>Melhoria:</strong> Tempos de viagem longos são
                  exibidos em <strong>meses e dias</strong> (a partir de 60
                  dias).
                </li>
                <li>
                  <strong>Melhoria:</strong> A camada de reinos é ocultada
                  automaticamente ao traçar rotas no Mapa de Arton, voltando ao
                  normal ao fechar a rota.
                </li>
                <li>
                  <strong>Melhoria:</strong> A seleção de{' '}
                  <strong>truques do melhor amigo</strong> do{' '}
                  <strong>Treinador</strong> agora mostra a lista completa de
                  truques: os que não atendem aos pré-requisitos aparecem
                  desabilitados com o motivo indicado (ex.:{' '}
                  <strong>Amigão</strong> exige melhor amigo Grande e Treinador
                  nível 7), em vez de ficarem ocultos como se não existissem.
                </li>
                <li>
                  <strong>Melhoria:</strong> Ao escolher{' '}
                  <strong>Conquistar pelos Números</strong> no 5º nível de
                  Treinador, o assistente de evolução agora abre o passo{' '}
                  <strong>Segundo Melhor Amigo</strong> para você personalizar o
                  novo parceiro (nome, tipo, tamanho, perícias e truques), como
                  manda a regra — antes ele era gerado aleatoriamente. Truques
                  de nível 5 (como Amigo Veterano) já podem ser escolhidos como
                  iniciais do novo amigo.
                </li>
                <li>
                  <strong>Melhoria:</strong> Ao escolher{' '}
                  <strong>Treino Intensivo</strong> no 5º nível de Treinador, os
                  truques bônus dos níveis 5 e 11 agora aparecem na própria
                  sessão de evolução — antes só apareciam evoluindo os níveis
                  separadamente.
                </li>
                <li>
                  <strong>Melhoria:</strong> Acertos críticos ficaram mais
                  visíveis: o <strong>histórico de rolagens</strong> da mesa
                  agora mostra um selo <strong>CRÍTICO</strong> (ou{' '}
                  <strong>FALHA</strong>) em cada rolagem — inclusive nas
                  rolagens dos outros jogadores — e, na tela de resultado, o
                  dado que critou dentro da margem de ameaça (ex.: um 19 com
                  Espada Longa) fica destacado em verde, não apenas o 20
                  natural.
                </li>
                <li>
                  <strong>Melhoria:</strong> Com <strong>dados 3D</strong>{' '}
                  ativados, ao sair um crítico os dados de dano adicionais agora{' '}
                  <strong>caem na mesa</strong> em seguida, e o resultado é
                  sempre calculado com os valores dos dados que você viu rolar.
                </li>
                <li>
                  <strong>Melhoria:</strong> Os poderes{' '}
                  <strong>Arqueiro</strong>, <strong>Esgrimista</strong> e{' '}
                  <strong>Estilo de Disparo</strong> agora somam o atributo no{' '}
                  <strong>dano</strong> automaticamente na ficha e nas rolagens:
                  Arqueiro soma <strong>Sabedoria</strong> com armas à
                  distância, Esgrimista soma <strong>Inteligência</strong> com
                  armas corpo a corpo leves ou ágeis (ambos limitados pelo seu
                  nível), e Estilo de Disparo soma <strong>Destreza</strong> com
                  armas de disparo. Em armas de arremesso (como a adaga), o
                  bônus é aplicado no modo correto — Arqueiro ao arremessar,
                  Esgrimista no corpo a corpo. Fichas existentes recebem a
                  automação ao serem carregadas.
                </li>
                <li>
                  <strong>Melhoria:</strong> Os{' '}
                  <strong>PV/PM temporários dos personagens</strong> agora
                  aparecem no rastreador de combate da mesa virtual (em laranja,
                  ao lado do valor atual), para o mestre e para os jogadores —
                  respeitando as configurações de exibição de PV/PM da mesa.
                </li>
                <li>
                  <strong>Correção:</strong> O poder concedido{' '}
                  <strong>Armas da Ambição</strong> (Valkaria) agora exibe o +1
                  em testes de ataque nas perícias <strong>Luta</strong> e{' '}
                  <strong>Pontaria</strong> — antes o bônus era somado
                  silenciosamente ao ataque de cada arma, sem indicação de
                  origem. O +1 na margem de ameaça continua aplicado nas armas e
                  agora aparece no ícone de efeitos ao lado da arma. Fichas
                  existentes são corrigidas automaticamente ao serem carregadas.
                </li>
                <li>
                  <strong>Correção:</strong> A escolha de{' '}
                  <strong>Treino Especializado</strong> (5º nível de Treinador)
                  não pode mais ser pulada sem querer no assistente de evolução
                  — antes, avançar sem escolher sorteava silenciosamente entre
                  Conquistar pelos Números e Treino Intensivo.
                </li>
                <li>
                  <strong>Correção:</strong> Truques do melhor amigo que só
                  podem ser escolhidos uma vez não podem mais ser{' '}
                  <strong>repetidos</strong> na evolução de nível — nem ao subir
                  vários níveis de uma vez, nem ao combinar o truque automático
                  do nível com o poder <strong>Ensinar Truque</strong>. Fichas
                  já afetadas são corrigidas automaticamente ao serem
                  carregadas.
                </li>
                <li>
                  <strong>Correção:</strong> O truque <strong>Bote</strong> não
                  fica mais indevidamente bloqueado para parceiros com duas ou
                  mais armas naturais (como Monstros) na edição do melhor amigo.
                </li>
                <li>
                  <strong>Correção:</strong> Com{' '}
                  <strong>Conquistar pelos Números</strong>, o seletor de
                  companheiro na escolha de truques não volta mais sozinho para
                  o primeiro melhor amigo.
                </li>
                <li>
                  <strong>Correção:</strong> Ao multiclassear para uma classe
                  conjuradora de <strong>homebrew</strong> na evolução de nível,
                  a conjuração da classe secundária agora é salva e restaurada
                  corretamente ao recarregar a ficha.
                </li>
                <li>
                  <strong>Correção:</strong> As sugestões de preenchimento
                  automático do navegador não aparecem mais por cima da busca de
                  cidades e dos campos de origem/destino do Mapa de Arton.
                </li>
                <li>
                  <strong>Correção:</strong> Fichas criadas pela{' '}
                  <strong>criação customizada</strong> agora recebem o{' '}
                  <strong>equipamento inicial da classe</strong> e os{' '}
                  <strong>itens e dinheiro extra da origem</strong> (incluindo
                  origens regionais e o benefício de item das origens do
                  básico), mesmo quando o passo do Mercado é atravessado sem
                  nenhuma compra.
                </li>
                <li>
                  <strong>Correção:</strong> Agora é possível criar um{' '}
                  <strong>Osteon</strong> (ou <strong>Yidishan</strong>) com{' '}
                  <strong>Moreau</strong> como raça anterior: a escolha da
                  habilidade de Memória Póstuma / Natureza Orgânica lista as
                  habilidades de todas as heranças do Moreau identificadas pelo
                  animal (ex.: <strong>Faro (Lobo)</strong>), em vez de travar o
                  assistente com uma lista vazia. A geração aleatória também não
                  quebra mais quando Moreau é sorteado como vida passada.
                </li>
                <li>
                  <strong>Correção:</strong> Os atributos raciais de{' '}
                  <strong>dimorfismo sexual</strong> da <strong>Nagah</strong>{' '}
                  agora respeitam o gênero escolhido na criação customizada:
                  fichas femininas recebem Inteligência, Sabedoria e Carisma +1
                  (antes sempre recebiam o conjunto masculino de Força, Destreza
                  e Constituição). O gênero <strong>Outro</strong> agora permite
                  escolher qual dos dois conjuntos usar, e as pré-visualizações
                  de bônus e requisitos do assistente refletem o conjunto
                  correto.
                </li>
                <li>
                  <strong>Correção:</strong> Poderes concedidos por escolhas de
                  habilidades raciais — <strong>Natureza Orgânica</strong>{' '}
                  (Yidishan), <strong>Deformidade</strong> (Lefou),{' '}
                  <strong>Memória Póstuma</strong> (Osteon) e{' '}
                  <strong>Chassi</strong> (Mashin) — agora podem ser removidos
                  da ficha pelo editor de poderes. Antes, a escolha armazenada
                  era reaplicada a cada salvamento e o poder &quot;voltava&quot;
                  sozinho (ex.: Membros Estendidos recebido via Natureza
                  Orgânica). As perícias e demais benefícios da habilidade são
                  preservados ao remover apenas o poder.
                </li>
                <li>
                  <strong>Correção:</strong> Bônus de poderes que{' '}
                  <strong>exigem proficiência</strong> com a arma agora só se
                  aplicam quando o personagem realmente sabe usá-la, e bônus com
                  escopo por <strong>categoria de arma</strong> (ex.: de
                  homebrews) passam a valer também para as armas do livro básico
                  em fichas salvas antigas.
                </li>
                <li>
                  <strong>Correção:</strong> <strong>Acertos críticos</strong>{' '}
                  nas rolagens da plataforma voltaram a funcionar corretamente,
                  para fichas de jogadores, ameaças e aliados. Com dados 3D
                  ativados, armas com margem de ameaça ampliada (ex.: 19 ou 18)
                  nunca exibiam o crítico, e o d20 mostrado na tela podia
                  discordar do dano multiplicado (dano dobrado sem crítico
                  aparente, ou um 20 natural sem dano dobrado). Agora o crítico
                  é decidido pelo dado que aparece na tela, respeitando a margem
                  de ameaça e o multiplicador da arma — e apenas os dados de
                  dano da arma são multiplicados, nunca os bônus numéricos e
                  dados extras (como manda a regra).
                </li>
                <li>
                  <strong>Correção:</strong> Armas sem valor de crítico
                  cadastrado (ex.: itens customizados) agora acertam crítico no{' '}
                  <strong>20 natural</strong> (20/x2), em vez de nunca critarem.
                </li>
                <li>
                  <strong>Correção:</strong> A modificação{' '}
                  <strong>Reforçada</strong> aplicava <strong>+2</strong> na
                  Defesa e <strong>+2</strong> na penalidade de armadura na
                  primeira vez em que era adicionada a um item; agora aplica
                  corretamente <strong>+1 / +1</strong>. O mesmo problema
                  afetava outras modificações numéricas de arma (como Certeira)
                  na primeira aplicação.
                </li>
                <li>
                  <strong>Correção:</strong> A modificação{' '}
                  <strong>Cravejada de gemas</strong> agora concede o{' '}
                  <strong>+2 em Enganação</strong> na ficha ao ser aplicada a
                  uma arma ou armadura pela mochila — antes o bônus era
                  calculado mas não aparecia nas perícias até um recálculo
                  posterior.
                </li>
                <li>
                  <strong>Correção:</strong> Adicionar ou remover o encantamento{' '}
                  <strong>Conjuradora</strong> por um item da mochila agora
                  salva imediatamente a magia concedida na ficha.
                </li>
              </ul>
              <h3>4.24</h3>
              <ul>
                <li>
                  <strong>Novo:</strong> Adicionada a modificação{' '}
                  <strong>Macabro</strong> (+2 em Intimidação, -2 em Diplomacia)
                  para itens superiores. Agora ela pode ser aplicada a armas,
                  armaduras e escudos.
                </li>
                <li>
                  <strong>Novo:</strong> No <strong>Escudo do Mestre</strong> da
                  mesa virtual, agora é possível{' '}
                  <strong>arrastar e soltar</strong> os painéis para
                  reorganizá-los (no computador): arraste pela alça no cabeçalho
                  do painel e solte em um espaço vazio para movê-lo, ou solte
                  sobre outro painel para trocar os conteúdos de lugar — cada
                  espaço mantém seu tamanho. Antes era preciso remover e recriar
                  o painel para mudá-lo de posição.
                </li>
                <li>
                  <strong>Melhoria:</strong> Em{' '}
                  <strong>Meus Personagens</strong>, criar uma nova ficha ou
                  ameaça estando dentro de uma <strong>pasta</strong> agora
                  salva a criação automaticamente nessa pasta — antes ela sempre
                  ia para a raiz. Um aviso <strong>Salvando em</strong> indica a
                  pasta de destino durante a criação.
                </li>
                <li>
                  <strong>Melhoria:</strong> Ao evoluir de nível, o poder{' '}
                  <strong>Golpe Pessoal</strong> agora abre o construtor para
                  você escolher a arma e os efeitos do ataque, em vez de gerar
                  uma combinação aleatória automaticamente.
                </li>
                <li>
                  <strong>Melhoria:</strong> As páginas do{' '}
                  <strong>fórum</strong> agora têm SEO próprio: ao abrir um
                  tópico, a aba do navegador mostra o título do tópico e os
                  links compartilhados exibem título, descrição e imagem
                  adequados, melhorando também a indexação em buscadores.
                </li>
                <li>
                  <strong>Melhoria:</strong> No <strong>Golpe Pessoal</strong>,
                  o custo em PM do efeito <strong>Conjurador</strong> agora
                  reflete o círculo da magia escolhida (2 PM para 1º círculo e 4
                  PM para 2º círculo).
                </li>
                <li>
                  <strong>Melhoria:</strong> A página de{' '}
                  <strong>Criar Nova Ficha</strong> foi redesenhada: os dois
                  modos, <strong>Nova Ficha</strong> (passo a passo) e{' '}
                  <strong>Ficha Aleatória</strong>, agora têm identidade visual
                  própria, com um resumo do que esperar de cada um, e as
                  transições ao escolher um modo ficaram mais suaves.
                </li>
                <li>
                  <strong>Melhoria:</strong> Os{' '}
                  <strong>suplementos ativos</strong> e os{' '}
                  <strong>homebrews ativos</strong> agora ficam reunidos em um
                  único painel recolhível de <strong>Conteúdo ativo</strong> no
                  topo da criação de ficha, em vez de espalhados pela tela, com
                  layout ajustado para telas de celular.
                </li>
                <li>
                  <strong>Correção:</strong> Fichas recém-geradas agora já saem
                  com a <strong>arma e o escudo empunhados</strong> e a armadura
                  vestida. Antes as mãos ficavam vazias, e o{' '}
                  <strong>bônus de Defesa do escudo</strong> só era somado
                  depois que você abria a mochila e o empunhava manualmente.
                </li>
                <li>
                  <strong>Correção:</strong> Os poderes de origem{' '}
                  <strong>Legionário</strong> e{' '}
                  <strong>Desertor da Supremacia</strong> agora aplicam seus
                  bônus condicionais de combate. Empunhando{' '}
                  <strong>Gládio + Escudo Pesado</strong>, o Legionário recebe
                  +1 na margem de ameaça do gládio e +1 na Defesa; empunhando{' '}
                  <strong>Espada Bastarda + Escudo Pesado</strong>, o Desertor
                  recebe +2 nos ataques com a espada bastarda. Antes o efeito
                  não ativava mesmo com o equipamento correto.
                </li>
                <li>
                  <strong>Correção:</strong> A classe{' '}
                  <strong>Magimarcialista</strong> (variante do Bardo) agora
                  permite escolher as <strong>escolas de magia</strong> na
                  criação de personagem, na evolução de nível e na multiclasse,
                  assim como o Bardo — antes o passo de escolha das escolas não
                  aparecia.
                </li>
                <li>
                  <strong>Correção:</strong> A origem{' '}
                  <strong>Futura Lenda</strong> agora deixa você{' '}
                  <strong>escolher</strong> qual poder de classe deseja receber,
                  em vez de atribuir um poder aleatório automaticamente.
                </li>
                <li>
                  <strong>Correção:</strong> Fichas da raça{' '}
                  <strong>Duende</strong> voltaram a ser editáveis: em{' '}
                  <strong>Editar informações da ficha</strong>, o botão{' '}
                  <strong>Salvar</strong> não fica mais permanentemente
                  desabilitado (cinza), permitindo alterar atributos, raça,
                  classe e demais informações normalmente.
                </li>
                <li>
                  <strong>Correção:</strong> A lista de magias do efeito{' '}
                  <strong>Conjurador</strong> do Golpe Pessoal agora mostra as
                  magias corretas de 1º e 2º círculo (a{' '}
                  <strong>Bola de Fogo</strong> voltou a aparecer), sem opções
                  sem sentido, e com nomes que correspondem às magias reais do
                  jogo.
                </li>
                <li>
                  <strong>Correção:</strong> O construtor de Golpe Pessoal não
                  fica mais travado quando o personagem ainda não tem armas no
                  inventário (por exemplo, durante a criação): a lista de armas
                  fica disponível e o botão de confirmar habilita normalmente.
                </li>
                <li>
                  <strong>Correção:</strong> Efeitos de Golpe Pessoal vindos de
                  suplementos (como <strong>Sequencial</strong> e{' '}
                  <strong>Sifão</strong>, de Heróis de Arton) não são mais
                  considerados inválidos ao montar o golpe.
                </li>
                <li>
                  <strong>Correção:</strong> Corrigido um erro que impedia
                  salvar conteúdos <strong>homebrew</strong> (como raças) com
                  habilidades que treinam perícias — a criação falhava com o
                  erro <em>Request failed with status code 400</em>.
                </li>
                <li>
                  <strong>Correção:</strong> Os <strong>poderes de raça</strong>{' '}
                  (como <strong>Glamour</strong>) agora aparecem na lista de
                  Poderes Gerais ao subir de nível, para personagens que atendem
                  ao requisito de raça (por exemplo, um Eiradaan, Duende ou
                  Sílfide). Antes eles eram omitidos do assistente de evolução.
                </li>
                <li>
                  <strong>Correção:</strong> As{' '}
                  <strong>perícias treinadas do melhor amigo</strong> do{' '}
                  <strong>Treinador</strong> agora somam o bônus de treinamento
                  (+2, +4 ou +6 conforme o nível), que antes ficava de fora — o
                  parceiro exibia um total menor do que o correto.
                </li>
                <li>
                  <strong>Correção:</strong> Ao baixar a ficha em{' '}
                  <strong>PDF</strong>, o <strong>dano</strong> das armas corpo
                  a corpo agora inclui o modificador de atributo (por exemplo,{' '}
                  <strong>2d6+4</strong>), exatamente como aparece na tela.
                  Antes o PDF mostrava apenas os dados de dano sem o bônus (por
                  exemplo, <strong>2d6</strong>).
                </li>
                <li>
                  <strong>Correção:</strong> Em{' '}
                  <strong>Meus Personagens</strong>, ao criar uma ficha ou
                  ameaça estando dentro de uma pasta, a criação agora aparece na
                  pasta imediatamente — antes era preciso recarregar a página
                  para vê-la.
                </li>
              </ul>
              <h3>4.23</h3>
              <ul>
                <li>
                  <strong>Novo:</strong> A página de um homebrew que faz parte
                  de uma <strong>coleção</strong> agora exibe um aviso com o
                  nome da coleção e um link para abri-la inteira.
                </li>
                <li>
                  <strong>Novo:</strong> A criação de homebrews ganhou a ação{' '}
                  <strong>Conceder poder</strong> em habilidades e poderes:
                  conceda um ou mais poderes específicos, ou defina uma lista da
                  qual o jogador escolhe (poderes gerais, de classe ou de outros
                  homebrews ativos).
                </li>
                <li>
                  <strong>Novo:</strong> Os <strong>poderes</strong> de homebrew
                  (de classe e de Pacote de Poderes) agora também oferecem{' '}
                  <strong>Opções de escolha (pick)</strong>, e o{' '}
                  <strong>Pacote de Poderes</strong> ganhou o editor{' '}
                  <strong>Avançado</strong> (alternância Básico/Avançado), como
                  Raças e Classes.
                </li>
                <li>
                  <strong>Novo:</strong> Novo tipo de bônus{' '}
                  <strong>Treinar perícia</strong> em habilidades e poderes de
                  homebrew: treina uma ou mais perícias específicas, ou uma
                  lista da qual o jogador escolhe quantas você definir.
                </li>
                <li>
                  <strong>Novo:</strong> A listagem de Homebrews ganhou um
                  filtro rápido <strong>Coleções</strong>, para encontrar apenas
                  coleções publicadas pela comunidade.
                </li>
                <li>
                  <strong>Novo:</strong> Integração com o{' '}
                  <strong>Owlbear Rodeo</strong> — agora é possível conectar
                  suas fichas e ameaças à extensão do Owlbear Rodeo, com uma
                  nova página de login (<strong>/owlbear-auth</strong>) para
                  autorizar a extensão.
                </li>
                <li>
                  <strong>Novo:</strong> Mesa Virtual — novo formato de exibição
                  de PV das ameaças: <strong>&quot;Status de vida&quot;</strong>
                  . Em vez de barra ou números, o mestre mostra um rótulo
                  qualitativo colorido (ex.: Saudável, Ferido, Quase morto). As
                  faixas de porcentagem, os rótulos e as cores são totalmente
                  configuráveis nas Configurações da Mesa.
                </li>
                <li>
                  <strong>Novo:</strong> Mesa Virtual — o tracker de combate
                  agora exibe <strong>avatares</strong> de todos os jogadores e
                  ameaças (foto da ficha/ameaça ou, na ausência dela, as
                  iniciais do nome). A borda do avatar reflete o status de vida
                  da ameaça (no desktop, o rótulo aparece ao passar o mouse; no
                  celular, fica sempre visível abaixo da foto).
                </li>
                <li>
                  <strong>Novo:</strong> Poder concedido{' '}
                  <strong>Poder Oculto</strong> agora pode ser ativado como
                  efeito de cena (2 PM para +2 em Força, Destreza ou
                  Constituição).
                </li>
                <li>
                  <strong>Melhoria:</strong> Cada opção de uma escolha (pick)
                  virou um <strong>&quot;sub-poder&quot; completo</strong>, com
                  os mesmos campos do item pai: custo de PM, bônus, efeitos
                  ativos, rolagens, conceder magias e conceder poder.
                </li>
                <li>
                  <strong>Melhoria:</strong> Na listagem de{' '}
                  <strong>Homebrews</strong>, os cards agora são links — dá para{' '}
                  <strong>abrir em nova aba</strong> (clique do meio ou
                  Ctrl/Cmd+clique), mantendo a navegação normal no clique
                  simples.
                </li>
                <li>
                  <strong>Melhoria:</strong> As telas de criação de homebrew
                  passaram a exibir um aviso recomendando a leitura dos{' '}
                  <strong>tutoriais de homebrew</strong> antes de criar o
                  primeiro conteúdo.
                </li>
                <li>
                  <strong>Melhoria:</strong> O{' '}
                  <strong>Gerador de Ameaças</strong> foi reorganizado e
                  modernizado. O fluxo agora segue a ordem em que você costuma
                  montar uma ameaça a partir de uma ficha:{' '}
                  <strong>Informações Gerais</strong> (nome, imagem, tipo,
                  tamanho, papel e ND) → <strong>Atributos e Perícias</strong> →{' '}
                  <strong>Ataques</strong> → <strong>Habilidades</strong> →{' '}
                  <strong>Magias</strong> →{' '}
                  <strong>Tesouro e Equipamentos</strong> →{' '}
                  <strong>Resumo</strong>. As estatísticas de combate (Defesa,
                  PV, PM e qualidades especiais) agora podem ser editadas
                  diretamente na etapa de atributos, e a tabela de perícias
                  passa a mostrar Iniciativa, Percepção e as resistências no
                  topo. As telas ganharam ícones, cartões organizados por seção
                  e transições mais suaves.
                </li>
                <li>
                  <strong>Melhoria:</strong> No resultado da ficha, os campos de
                  dano/cura de <strong>PV e PM</strong> agora vêm com o valor{' '}
                  <strong>1</strong> como padrão — basta clicar em Dano ou Curar
                  para aplicar rapidamente. Ao clicar no campo, o valor padrão
                  some para você digitar outro, e ele volta para 1 depois de
                  aplicar.
                </li>
                <li>
                  <strong>Correção:</strong> Os itens padrão da mochila (
                  <strong>Mochila</strong>, <strong>Saco de dormir</strong> e{' '}
                  <strong>Traje de viajante</strong>) não voltam mais sozinhos
                  ao inventário. Antes, se você os apagasse, eles reapareciam
                  toda vez que a ficha era salva e a página recarregada — agora
                  a remoção é respeitada ao recarregar a ficha, inclusive em
                  fichas na nuvem e na Mesa Virtual.
                </li>
                <li>
                  <strong>Correção:</strong> A listagem pública de{' '}
                  <strong>Homebrews</strong> (/homebrews) agora carrega{' '}
                  <strong>todos os itens</strong> conforme você rola a página
                  (antes mostrava apenas os primeiros) e os exibe sempre dos{' '}
                  <strong>mais recentes</strong> para os mais antigos.
                </li>
                <li>
                  <strong>Correção:</strong> Mesa Virtual — a{' '}
                  <strong>Defesa</strong> (e os atributos e perícias) dos
                  jogadores no tracker de iniciativa do mestre agora atualizam{' '}
                  <strong>em tempo real</strong>. Antes, esses valores ficavam
                  congelados no que foi capturado ao iniciar o combate; quando
                  um efeito ativo, parceiro ou edição alterava a Defesa de um
                  jogador, o mestre continuava vendo o valor antigo.
                </li>
                <li>
                  <strong>Correção:</strong> Efeitos ativos que{' '}
                  <strong>aumentam um atributo</strong> agora de fato aplicam o
                  bônus — nas perícias do atributo, no dano de armas corpo a
                  corpo (Força) e na Defesa (Destreza). Antes o efeito era
                  registrado mas não alterava nada na ficha.
                </li>
                <li>
                  <strong>Correção:</strong> Efeitos ativos de{' '}
                  <strong>ataque e dano</strong> agora aplicam também o dano em{' '}
                  <strong>armas mágicas ou aprimoradas</strong>. Antes, nessas
                  armas, só o bônus de ataque era aplicado e o de dano se
                  perdia.
                </li>
                <li>
                  <strong>Correção:</strong> Mesa Virtual — magias{' '}
                  <strong>homebrew</strong> com efeito ativo configurado agora
                  oferecem a ativação do efeito ao serem lançadas (para você e
                  para os outros jogadores da mesa), igual às magias oficiais.
                </li>
              </ul>

              <h3>4.22</h3>
              <p>
                Esta atualização traz a maior novidade do projeto até hoje — os{' '}
                <strong>Homebrews</strong> — e, junto, o{' '}
                <strong>Mapa de Arton</strong>. Duas{' '}
                <strong>super features</strong> num ciclo só.
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
                  gutterBottom
                  sx={{
                    fontWeight: 'bold',
                    color: 'success.dark',
                  }}
                >
                  Homebrews — crie o seu próprio conteúdo
                </Typography>
                <Typography variant='body1' sx={{ mb: 1 }}>
                  Usuários agora podem criar <strong>conteúdo próprio</strong>{' '}
                  de jogo por meio de um editor visual, sem programar:{' '}
                  <strong>Raças</strong>, <strong>Classes</strong>,{' '}
                  <strong>Pacotes de Magias</strong>,{' '}
                  <strong>Pacotes de Poderes</strong> e{' '}
                  <strong>Coleções</strong>. O que você cria entra na ficha como
                  se fosse oficial — calcula os números, aparece nas rolagens e
                  na geração de personagens.
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'text.secondary',
                    mb: 1,
                  }}
                >
                  <strong>Editor Básico e Avançado:</strong> bônus passivos
                  cobrindo atributos, perícias, PV/PM, defesa, deslocamento,
                  redução de dano, <strong>dano de armas</strong>,{' '}
                  <strong>margem de ameaça</strong>,{' '}
                  <strong>multiplicador de crítico</strong>, proficiências e até
                  escolhas feitas pelo próprio jogador. No modo Avançado, entram
                  bônus por <strong>fórmula</strong>, bônus condicionais, opções
                  de escolha e concessão de magias.
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'text.secondary',
                    mb: 1,
                  }}
                >
                  <strong>Classes completas:</strong> PV/PM, perícias,
                  habilidades automáticas por nível, poderes de classe com
                  pré-requisitos, conjuração (círculos plenos ou personalizados)
                  e <strong>importação de poderes</strong> de classes existentes
                  para montar variantes sem reescrever nada. Magias e poderes
                  também podem ser publicados em pacotes, com aprimoramentos,
                  rolagens de dados e efeitos ativos.
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'text.secondary',
                    mb: 1,
                  }}
                >
                  <strong>Teste antes de publicar:</strong> a{' '}
                  <strong>ficha de teste</strong> gera um personagem aleatório
                  efêmero (que não é salvo) forçando o seu homebrew, para você
                  conferir os números na prática. Cada homebrew publicado tem{' '}
                  <strong>fórum próprio</strong> e{' '}
                  <strong>histórico de versões</strong>.
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'text.secondary',
                  }}
                >
                  <strong>Criar é grátis para qualquer pessoa</strong> com
                  conta: monte, teste e publique seus homebrews sem custo. O{' '}
                  <strong>nível de apoio</strong> define apenas{' '}
                  <strong>quantos você mantém ativos ao mesmo tempo</strong>{' '}
                  (grátis: 3; Nível 1: 5; Nível 2: 10; Nível 3: ilimitado). Uma{' '}
                  <strong>série completa de tutoriais</strong> no blog ensina,
                  passo a passo, a criar cada tipo — e lembre-se: você é
                  responsável pelo suporte e manutenção do conteúdo que publica.
                </Typography>
              </Alert>

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
                  gutterBottom
                  sx={{
                    fontWeight: 'bold',
                    color: 'success.dark',
                  }}
                >
                  Mapa de Arton
                </Typography>
                <Typography variant='body1' sx={{ mb: 1 }}>
                  Um <strong>mapa interativo de Arton</strong> chegou ao
                  sistema. Há uma página pública (
                  <Link to='/mapadearton'>/mapadearton</Link>) para explorar o
                  continente, e cada <strong>mesa virtual</strong> ganha o seu
                  próprio mapa.
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'text.secondary',
                  }}
                >
                  Na mesa, mestre e jogadores podem marcar{' '}
                  <strong>pontos de interesse</strong> no mapa, com controle de
                  visibilidade — pins visíveis a <strong>todos</strong> ou{' '}
                  <strong>apenas ao mestre</strong> —, além de menus de contexto
                  e marcação rápida de locais.
                </Typography>
              </Alert>

              <ul>
                <li>
                  <strong>Novo:</strong> nos <strong>posts do blog</strong>, o
                  nome do <strong>autor</strong> agora é{' '}
                  <strong>clicável</strong> — tanto nos cards da listagem quanto
                  no topo do post — e leva direto ao{' '}
                  <strong>perfil do autor</strong>.
                </li>
                <li>
                  <strong>Novo:</strong> agora você pode{' '}
                  <strong>ativar qualquer efeito manualmente</strong> na ficha,
                  a qualquer momento. Na janela de{' '}
                  <strong>Efeitos Ativos</strong>, a aba{' '}
                  <strong>Adicionar</strong> deixa aplicar qualquer poder ou
                  magia <strong>independentemente dos pré-requisitos</strong>{' '}
                  (classe, nível, poder ou atributo) — útil quando o mestre cria
                  uma situação de jogo que obriga o efeito a existir. Efeitos de
                  outras classes oferecem a <strong>faixa completa</strong> de
                  intensidades. As sugestões automáticas (botão ✨) continuam
                  mostrando apenas o que o personagem realmente possui.
                </li>
                <li>
                  <strong>Novo:</strong> o poder{' '}
                  <strong>Estilo de Duas Mãos</strong> agora pode ser
                  ligado/desligado como efeito de combate, concedendo{' '}
                  <strong>+5 no dano</strong> com armas corpo a corpo empunhadas
                  com as duas mãos (não se aplica a armas leves).
                </li>
                <li>
                  <strong>Melhoria:</strong> na página de um{' '}
                  <strong>Homebrew</strong>, os{' '}
                  <strong>poderes de classe e os pacotes de poderes</strong>{' '}
                  agora exibem seus <strong>pré-requisitos</strong> em linguagem
                  natural (nível, atributo, perícia, proficiência ou outro
                  poder), facilitando entender o que é preciso para usá-los.
                </li>
                <li>
                  <strong>Melhoria:</strong> na página inicial, os{' '}
                  <strong>tópicos do fórum</strong> agora aparecem sempre em{' '}
                  <strong>ordem do mais recente para o mais antigo</strong>, sem
                  os três primeiros lugares reservados para apoiadores. O
                  destaque visual dos apoiadores continua.
                </li>
                <li>
                  <strong>Melhoria:</strong> o modal de{' '}
                  <strong>aplicar condições</strong> na ficha ficou mais limpo:
                  agora as condições aparecem <strong>uma por linha</strong> e
                  em <strong>ordem alfabética</strong>, com o nome em destaque e
                  o efeito resumido mais discreto. Cada condição tem um botão
                  para <strong>expandir e ler a descrição completa</strong>,
                  funcionando bem também no celular.
                </li>
                <li>
                  <strong>Correção:</strong> a seção{' '}
                  <strong>Posts no blog</strong> no perfil deixava os cards{' '}
                  <strong>cortados na borda direita</strong> quando o título do
                  post era longo; agora a listagem se ajusta corretamente e os
                  títulos longos são truncados dentro do card.
                </li>
                <li>
                  <strong>Correção:</strong> ao subir de nível um{' '}
                  <strong>Feiticeiro</strong> com a{' '}
                  <strong>Linhagem Abençoada</strong>, o{' '}
                  <strong>poder concedido</strong> da divindade no nível 2 era
                  adicionado automaticamente <strong>sem você escolher</strong>.
                  Agora o assistente de evolução pede para você{' '}
                  <strong>escolher qual poder concedido</strong> receber.
                </li>
                <li>
                  <strong>Correção:</strong> o poder de combate{' '}
                  <strong>Finta Aprimorada</strong> não aparece mais como
                  indisponível ao subir de nível para personagens treinados em{' '}
                  <strong>Enganação</strong>.
                </li>
                <li>
                  <strong>Correção:</strong> as <strong>magias</strong> dos
                  suplementos (como <strong>Ameaças de Arton</strong>,{' '}
                  <strong>Deuses de Arton</strong> e{' '}
                  <strong>Heróis de Arton</strong>) não apareciam na geração de
                  personagens. Agora os conjuradores podem aprender as magias
                  desses livros, conforme os{' '}
                  <strong>suplementos ativos no seu perfil</strong> — tanto na
                  ficha aleatória quanto ao editar os poderes da ficha.
                </li>
                <li>
                  <strong>Correção:</strong> as origens regionais (Atlas de
                  Arton) <strong>Aristocrata Dai&apos;zenshi (Tamu-ra)</strong>{' '}
                  e <strong>Bandoleiro da Fortaleza (Khalifor)</strong>{' '}
                  apareciam com o poder, a perícia e os itens de outra origem.
                  Agora cada uma concede o{' '}
                  <strong>benefício e os itens corretos</strong>.
                </li>
                <li>
                  <strong>Correção:</strong> na <strong>Mesa Virtual</strong>,
                  abrir a ficha de um jogador podia, em alguns casos, carregar a
                  ficha de <strong>outro jogador</strong> da mesma mesa. As
                  fichas dos membros agora ficam sempre vinculadas corretamente,
                  mesmo quando vários jogadores alteram suas fichas ao mesmo
                  tempo.
                </li>
                <li>
                  <strong>Correção:</strong> armas com{' '}
                  <strong>dano duplo</strong> (como o Bordão) passaram a receber
                  o bônus de dano em <strong>ambos os modos</strong> — antes o
                  bônus ficava só em um deles e a rolagem podia sair sem ele.
                </li>
                <li>
                  <strong>Correção:</strong> os <strong>modos de ataque</strong>{' '}
                  alternativos de algumas armas (por exemplo armas de fogo)
                  agora incluem o bônus de dano de poderes e encantos tanto na{' '}
                  <strong>prévia</strong> quanto na <strong>rolagem</strong>,
                  ficando iguais ao que a ficha exibe.
                </li>
                <li>
                  <strong>Correção:</strong> a{' '}
                  <strong>Mochila de Aventureiro</strong> agora aumenta de fato
                  a <strong>capacidade de carga</strong> em 2 espaços. Antes o
                  limite até subia na ficha e no PDF, mas a verificação de
                  sobrecarga continuava usando o limite antigo — então o
                  personagem aparecia <strong>sobrecarregado</strong> e com o{' '}
                  <strong>deslocamento reduzido</strong> sem motivo, inclusive
                  no PDF.
                </li>
              </ul>

              <h3>4.21</h3>

              <ul>
                <li>
                  <strong>
                    Novo: Automação dos poderes Estilo de Arremesso e Arremesso
                    Potente.
                  </strong>{' '}
                  Com <strong>Estilo de Arremesso</strong>, suas armas de
                  arremesso recebem <strong>+2 no dano</strong> (apenas no modo
                  de arremesso, nunca no corpo a corpo). Com{' '}
                  <strong>Arremesso Potente</strong>, o ataque de arremesso
                  passa a usar <strong>Força</strong> quando for mais vantajoso
                  que Destreza. Os bônus aparecem direto na ficha e nas
                  rolagens.
                </li>
                <li>
                  <strong>
                    Novo: Familiar Rato usa o atributo-chave na Fortitude.
                  </strong>{' '}
                  Quem escolhe o familiar <strong>Rato</strong> passa a usar o{' '}
                  <strong>atributo-chave</strong> nos testes de{' '}
                  <strong>Fortitude</strong> no lugar de Constituição, quando
                  for mais vantajoso.
                </li>
                <li>
                  <strong>
                    Novo: limites semanais de publicação no Bestiário.
                  </strong>{' '}
                  A quantidade de criaturas que cada apoiador pode publicar por
                  semana no <strong>Bestiário</strong> agora varia conforme o
                  nível de apoio (Nível 1: 15, Nível 2: 50, Nível 3: ilimitado).
                </li>
                <li>
                  <strong>
                    Correção: Armas de arremesso agora somam Força ao dano.
                  </strong>{' '}
                  Ao atacar arremessando uma arma (Adaga, Lança, Azagaia,
                  Machadinha, Tridente, Martelo Leve, entre outras), o
                  modificador de <strong>Força</strong> passa a ser somado à
                  rolagem de dano, conforme a regra. O modo corpo a corpo dessas
                  armas continua funcionando normalmente.
                </li>
                <li>
                  <strong>
                    Correção: Ameaças importadas não trocam mais de ficha na
                    Mesa Virtual.
                  </strong>{' '}
                  Durante o combate, clicar em uma ameaça importada podia abrir
                  a ficha de outra criatura — problema que aparecia após usar o
                  botão <strong>Atualizar dados</strong>. A gravação dos dados
                  das ameaças ficou mais segura, o botão{' '}
                  <strong>Atualizar dados</strong> agora pede confirmação quando
                  a ficha de origem tem nome diferente do snapshot, e as
                  alterações passam a sincronizar entre mestre e jogadores em
                  tempo real.
                </li>
                <li>
                  <strong>
                    Correção: Adicionado aprimoramento faltante da magia Dardo
                    Gélido.
                  </strong>{' '}
                  A magia <strong>Dardo Gélido</strong> (Ameaças de Arton) agora
                  exibe o aprimoramento que aumenta o número de alvos em +1 por
                  1 PM, conforme o livro.
                </li>
                <li>
                  <strong>
                    Correção: Feiticeiro com Linhagem Abençoada agora aprende 4
                    magias no 1º nível.
                  </strong>{' '}
                  Pela <strong>Linhagem Abençoada</strong>, o{' '}
                  <strong>Feiticeiro</strong> aprende magias divinas de 1º
                  círculo como magias de feiticeiro e ainda recebe uma magia
                  divina extra — totalizando <strong>4 magias</strong> no 1º
                  nível. Antes a ficha só permitia escolher 3.
                </li>
                <li>
                  <strong>
                    Correção: Anão não tem mais o deslocamento reduzido por
                    armadura pesada ou sobrecarga.
                  </strong>{' '}
                  Conforme a habilidade <strong>Devagar e Sempre</strong>, o
                  deslocamento do <strong>Anão</strong> (e do{' '}
                  <strong>Trog Anão</strong>) permanece em 6m mesmo usando
                  armadura pesada ou excesso de carga. Antes a penalidade de -3m
                  era aplicada indevidamente.
                </li>
                <li>
                  <strong>
                    Correção: Virtudes Paladinescas agora somam pontos de mana.
                  </strong>{' '}
                  Os poderes <strong>Virtude Paladinesca</strong> do{' '}
                  <strong>Paladino</strong> concedem um bônus progressivo ao
                  total de <strong>PM</strong> conforme a quantidade que você
                  possui (+1, +3, +6, +10 e +15 para 1 a 5 Virtudes), como manda
                  a regra. Antes o total de PM não era ajustado.
                </li>
                <li>
                  <strong>
                    Correção: multiclasse não infla mais o nível da classe
                    original.
                  </strong>{' '}
                  Ao subir de nível pegando o primeiro nível de uma nova classe
                  (multiclasse), em alguns casos a{' '}
                  <strong>classe original</strong> também ganhava um nível
                  indevido (ex.: Druida 3 → Druida 4 · Guerreiro 1), inflando{' '}
                  <strong>PV</strong> e <strong>PM</strong>. Agora a
                  distribuição de níveis entre as classes é mantida
                  corretamente.
                </li>
                <li>
                  <strong>
                    Correção: Familiar Sapo agora soma o atributo-chave aos
                    pontos de vida.
                  </strong>{' '}
                  Ao escolher o familiar <strong>Sapo</strong> (poder{' '}
                  <strong>Familiar</strong> do Arcanista), o seu{' '}
                  <strong>atributo-chave</strong> não estava sendo somado ao
                  total de <strong>PV</strong>. Agora o bônus é aplicado
                  automaticamente na ficha.
                </li>
                <li>
                  <strong>
                    Correção: rolagem infinita da lista do Bestiário.
                  </strong>{' '}
                  A lista do <strong>Bestiário</strong> não carregava mais itens
                  corretamente ao rolar até o fim. Agora a rolagem infinita
                  funciona como esperado.
                </li>
              </ul>

              <h3>4.20</h3>

              <ul>
                <li>
                  <strong>Novo: Escudo do Mestre na mesa virtual.</strong> O
                  mestre agora tem uma aba própria para montar seu escudo: um{' '}
                  <strong>grid configurável</strong> (ajuste linhas e colunas, e
                  faça cada painel ocupar mais de um espaço). Clique em qualquer
                  célula vazia para adicionar um painel.
                </li>
                <ul>
                  <li>
                    <strong>Painéis do Escudo do Mestre.</strong> Estão
                    disponíveis: <strong>bloco de anotações</strong> em
                    Markdown, <strong>referência de condições</strong> (lista
                    completa com busca), <strong>ficha de ameaça</strong>{' '}
                    fixada, <strong>ficha de jogador</strong>,{' '}
                    <strong>tracker de combate</strong> e{' '}
                    <strong>lista de iniciativa</strong> (aparecem durante o
                    combate), <strong>imagem</strong>,{' '}
                    <strong>vídeo do YouTube</strong>,{' '}
                    <strong>dados e tabelas aleatórias</strong>,{' '}
                    <strong>relógio/cronômetro</strong> e{' '}
                    <strong>links e contadores</strong>.
                  </li>
                  <li>
                    <strong>Projetar imagem para os jogadores.</strong> No
                    painel de imagem do escudo, o mestre pode{' '}
                    <strong>exibir a imagem em tela cheia</strong> para toda a
                    mesa em tempo real — ótimo para revelar mapas, retratos de
                    NPCs ou pistas — e encerrar a exibição quando quiser.
                  </li>
                </ul>
                <li>
                  <strong>Novo: perfis de usuário customizáveis.</strong> No
                  estilo do perfil da Steam, agora você monta sua página de
                  perfil com <strong>seções</strong>: blocos de texto, imagens
                  (fan-arts) e <strong>fichas, ameaças e builds fixadas</strong>
                  . É possível organizar tudo em uma ou em duas colunas
                  (principal e lateral). Acesse seu perfil e clique em{' '}
                  <strong>Editar perfil</strong> para começar.
                </li>
                <ul>
                  <li>
                    <strong>Nível de perfil.</strong> Você acumula pontos por
                    ações dentro da plataforma — especialmente as que ajudam a
                    comunidade (publicar builds e ameaças, postar e comentar no
                    fórum, receber curtidas e avaliações, e apoiar o projeto).
                    Seu nível aparece num <strong>selo circular</strong> ao lado
                    do seu nome, que evolui de cor conforme você sobe.
                  </li>
                  <li>
                    <strong>Badges colecionáveis da comunidade.</strong> Os
                    maiores contribuidores ganham badges por ranking —{' '}
                    <strong>Voz da Comunidade</strong> (fórum),{' '}
                    <strong>Mestre das Builds</strong> e{' '}
                    <strong>Arquiteto de Ameaças</strong> (bestiário) — em tiers
                    bronze, prata, ouro e diamante. Elas aparecem no seu perfil.
                  </li>
                  <li>
                    <strong>Cartão de usuário ao passar o mouse.</strong> Em
                    qualquer lugar da plataforma (fórum, comentários, builds,
                    ameaças), passar o mouse sobre o nome de uma pessoa mostra
                    um <strong>cartão</strong> com a foto, o nível e as badges
                    dela — estilizado conforme a personalização do perfil.
                    Clique para ir ao perfil completo.
                  </li>
                  <li>
                    <strong>Personalização de aparência (apoiadores).</strong>{' '}
                    Apoiadores podem mudar <strong>cores</strong>,{' '}
                    <strong>fonte</strong> e o <strong>fundo</strong> do perfil
                    (cor sólida ou imagem), com{' '}
                    <strong>pré-visualização ao vivo</strong> enquanto edita.
                    Também é possível definir a{' '}
                    <strong>foto de perfil por URL</strong> — preservando a sua
                    foto do Google como padrão.
                  </li>
                </ul>
                <li>
                  <strong>Novo: habilidade Arremessador do Hynne.</strong>{' '}
                  Personagens Hynne agora recebem{' '}
                  <strong>+1 passo de dano</strong> automaticamente ao atacar à
                  distância com uma <strong>funda</strong> ou ao{' '}
                  <strong>arremessar</strong> uma arma de arremesso. O bônus
                  aparece ao escolher o tipo de ataque (no modal de Arremessar)
                  e no resultado da rolagem — ataques corpo a corpo e armas como
                  arcos e bestas não são afetados.
                </li>
                <li>
                  <strong>
                    Melhoria: resultado de rolagem em tela cheia não interrompe
                    mais todo mundo.
                  </strong>{' '}
                  Por padrão, o <strong>resultado em tela cheia</strong> agora
                  aparece só para quem rolou — as rolagens dos outros continuam
                  no <strong>histórico</strong>. Quem preferir pode{' '}
                  <strong>ativar</strong> o recebimento do resultado das
                  rolagens de todos no botão (sino) da barra superior da mesa.
                </li>
                <li>
                  <strong>Correção: subir de nível com Alquimista.</strong> O
                  Alquimista (variante do Inventor) agora sobe de nível
                  normalmente: os poderes concedidos automaticamente nos níveis
                  2 (Alquimista Iniciado) e 10 (Mestre Alquimista) são aplicados
                  corretamente, a progressão não cancela mais sem contabilizar o
                  nível e a lista de poderes de classe não exibe mais opções
                  duplicadas. Caso algo dê errado ao subir de nível, agora
                  aparece um aviso em vez de a ficha fechar silenciosamente.
                </li>
                <li>
                  <strong>
                    Correção: privacidade das rolagens só afeta o mestre.
                  </strong>{' '}
                  A configuração <strong>Modo padrão das rolagens</strong> da
                  mesa virtual deixava as rolagens de <strong>todos</strong>{' '}
                  privadas quando definida como privada. Agora ela afeta apenas
                  as rolagens do mestre — as{' '}
                  <strong>rolagens dos jogadores são sempre públicas</strong>.
                </li>
                <li>
                  <strong>
                    Correção: origens de combate não concedem mais dois poderes
                    de combate.
                  </strong>{' '}
                  Origens como <strong>Gladiador</strong> e{' '}
                  <strong>Soldado</strong>, que concedem{' '}
                  <strong>um único poder de combate</strong> à sua escolha,
                  permitiam selecionar dois poderes de combate na criação de
                  personagem. Agora a seleção fica limitada a um (o mesmo vale
                  para o poder da Tormenta do{' '}
                  <strong>Assistente de Laboratório</strong>).
                </li>
                <li>
                  <strong>
                    Correção: habilidades raciais do Centauro liberam Carga de
                    Cavalaria na criação.
                  </strong>{' '}
                  As habilidades <strong>Cascos</strong> e{' '}
                  <strong>Ginete Natural</strong> do Centauro, que cumprem os
                  pré-requisitos de <strong>Carga de Cavalaria</strong>, eram
                  ignoradas no assistente de criação — o poder aparecia
                  bloqueado, mesmo sendo possível adicioná-lo manualmente
                  depois. Agora ele fica disponível durante a criação.
                </li>
                <li>
                  <strong>
                    Correção: perícias trocadas no PDF da ficha editável.
                  </strong>{' '}
                  Ao baixar o <strong>PDF editável</strong>, personagens
                  treinados em <strong>Sobrevivência</strong> e{' '}
                  <strong>Vontade</strong> apareciam (treino e bônus) nas linhas
                  de <strong>Reflexos</strong> e <strong>Religião</strong>. As
                  perícias a partir de <strong>Percepção</strong> ficavam
                  deslocadas quando o personagem não tinha nenhum{' '}
                  <strong>Ofício</strong> treinado. Agora cada perícia é
                  preenchida na linha correta.
                </li>
                <li>
                  <strong>
                    Correção: poder Artesão Criativo e perícia Ofício (Artesão).
                  </strong>{' '}
                  Ter <strong>Ofício (Artesão)</strong> não liberava o poder{' '}
                  <strong>Artesão Criativo</strong>, porque o nome da perícia
                  não batia com o pedido pelos poderes. A perícia foi renomeada
                  para <strong>Ofício (Artesão)</strong> (como no livro) e
                  agora, tendo o poder, ela{' '}
                  <strong>substitui qualquer outro Ofício</strong> como
                  pré-requisito de outros poderes. Também foram corrigidos os
                  pré-requisitos de <strong>Estilista</strong>,{' '}
                  <strong>Bombardeiro Furtivo</strong> e{' '}
                  <strong>Preparar Poção</strong>.
                </li>
                <li>
                  <strong>
                    Correção: Fúria Aterrorizante liberada para quem tem Fúria.
                  </strong>{' '}
                  O poder <strong>Fúria Aterrorizante</strong> não ficava
                  disponível para personagens <strong>Galokk</strong> (e Ogro){' '}
                  <strong>bárbaros</strong>, mesmo tendo a habilidade{' '}
                  <strong>Fúria</strong>, por uma divergência no nome da
                  habilidade. Agora o pré-requisito é reconhecido corretamente
                  (e a habilidade aparece grafada como <strong>Fúria</strong> na
                  ficha).
                </li>
                <li>
                  <strong>
                    Correção: Estilo de Arma e Escudo aumenta a Defesa ao ser
                    adicionado manualmente.
                  </strong>{' '}
                  Ao adicionar o poder <strong>Estilo de Arma e Escudo</strong>{' '}
                  manualmente (fora do nível), o <strong>+2 na Defesa</strong>{' '}
                  do escudo empunhado não era aplicado. Agora o bônus é
                  calculado automaticamente sempre que há um escudo equipado em
                  uma das mãos.
                </li>
              </ul>

              <h3>4.19</h3>

              <ul>
                <li>
                  <strong>
                    Novo: métodos de geração de atributos no assistente de
                    criação.
                  </strong>{' '}
                  Até agora a definição de atributos no assistente era só{' '}
                  <strong>Livre</strong> (você digitava o modificador de cada
                  atributo). Agora você escolhe entre{' '}
                  <strong>três métodos</strong> sugeridos pelo livro:{' '}
                  <strong>Livre</strong>, <strong>Dados</strong> (role 4d6
                  descartando o menor seis vezes e <strong>distribua</strong> os
                  modificadores entre os atributos como quiser — com rerrolagem
                  automática caso a soma não atinja o mínimo) e{' '}
                  <strong>Pontos</strong> (compre os atributos gastando 10
                  pontos, com a tabela de custos do livro e contador de pontos
                  restantes).
                </li>
                <li>
                  <strong>
                    Novo: cards de dano e cura no histórico de rolagens também
                    no celular.
                  </strong>{' '}
                  Os botões inline pra aplicar dano (½ / ×2 / valor) e cura
                  (valor / ×2 / ½) direto da rolagem, que já existiam no
                  desktop, agora aparecem na visão <strong>mobile</strong> da
                  Mesa Virtual.
                </li>
                <li>
                  <strong>
                    Novo: equipe gerencia rascunhos de qualquer pessoa.
                  </strong>{' '}
                  No painel administrativo a equipe agora consegue gerenciar os{' '}
                  <strong>rascunhos de todos os usuários</strong>, e a contagem
                  de visualizações (<strong>viewCount</strong>) passou a ser
                  visível apenas para a equipe.
                </li>
                <li>
                  <strong>
                    Novo: itens de suplementos nos geradores de itens superiores
                    e mágicos.
                  </strong>{' '}
                  Com um suplemento ativo no seu perfil, as{' '}
                  <strong>armas, armaduras e escudos</strong> de{' '}
                  <strong>Ameaças de Arton</strong> e{' '}
                  <strong>Heróis de Arton</strong> agora podem ser usados como{' '}
                  <strong>item base</strong> ao gerar itens superiores e
                  mágicos. As opções aparecem agrupadas por suplemento e
                  classificadas nos filtros de categoria (
                  <strong>Simples</strong>, <strong>Marciais</strong>,{' '}
                  <strong>Exóticas</strong>, <strong>De Fogo</strong> e{' '}
                  <strong>Leves</strong>/<strong>Pesadas</strong>).
                </li>
                <li>
                  <strong>
                    Melhoria: aviso de suplementos disponíveis na criação de
                    ficha.
                  </strong>{' '}
                  A tela de <strong>criação de ficha</strong> agora mostra quais{' '}
                  <strong>suplementos</strong> (Ameaças de Arton, Atlas de
                  Arton, Deuses de Arton, Heróis de Arton) estão{' '}
                  <strong>disponíveis e desativados</strong>, com um botão que
                  leva <strong>direto à configuração</strong> (com rolagem
                  automática até a opção) para quem está logado, ou ao{' '}
                  <strong>login</strong> para quem ainda não tem conta. O aviso
                  pode ser <strong>dispensado</strong> e volta a aparecer caso
                  surjam novos suplementos.
                </li>
                <li>
                  <strong>
                    Melhoria: rolagem infinita no Bestiário da Comunidade.
                  </strong>{' '}
                  A página do <strong>Bestiário da Comunidade</strong> agora
                  carrega novas ameaças automaticamente conforme você{' '}
                  <strong>rola até o fim</strong>, no lugar dos botões de
                  páginas. As ameaças aparecem por{' '}
                  <strong>mais recentes primeiro</strong>, priorizando o
                  conteúdo — os atalhos de <strong>Melhores de hoje/mês</strong>{' '}
                  continuam disponíveis, mas só são aplicados quando você clica
                  neles.
                </li>
                <li>
                  <strong>Melhoria: Caverna do Saber atualizada.</strong> O
                  banco de dados de conteúdo foi atualizado até a revisão{' '}
                  <strong>#227</strong>.
                </li>
                <li>
                  <strong>
                    Correção: habilidades do Centauro não liberavam poderes de
                    cavalaria na criação.
                  </strong>{' '}
                  A habilidade <strong>Ginete Natural</strong> agora conta como
                  ter o poder <strong>Ginete</strong>, e <strong>Cascos</strong>{' '}
                  permite escolher poderes de <strong>Carga</strong> ou{' '}
                  <strong>Investida</strong> sem cumprir os pré-requisitos.
                  Assim, poderes como <strong>Carga de Cavalaria</strong> passam
                  a aparecer normalmente durante a{' '}
                  <strong>criação do personagem</strong> (antes só era possível
                  adicioná-los manualmente).
                </li>
                <li>
                  <strong>
                    Correção: Estilo de Uma Arma não aplicava seus bônus.
                  </strong>{' '}
                  O poder <strong>Estilo de Uma Arma</strong> agora concede{' '}
                  <strong>+2 na Defesa</strong> e <strong>+2 no ataque</strong>{' '}
                  com a arma empunhada quando você está com uma{' '}
                  <strong>
                    arma corpo a corpo em uma das mãos e a outra vazia
                  </strong>
                  . Os bônus aparecem e somem automaticamente conforme a
                  empunhadura (não valem para armas de duas mãos, à distância ou
                  com a outra mão ocupada).
                </li>
                <li>
                  <strong>
                    Correção: não dava pra escolher o tipo e o tamanho do Melhor
                    Amigo ao multiclassar Treinador.
                  </strong>{' '}
                  Ao pegar <strong>Treinador</strong> como classe ao{' '}
                  <strong>subir de nível</strong> (multiclasse), os botões de{' '}
                  <strong>Tipo</strong> e <strong>Tamanho</strong> do parceiro
                  não respondiam ao clique. Agora a seleção funciona
                  normalmente.
                </li>
                <li>
                  <strong>
                    Correção: armaduras pesadas de suplementos não eram tratadas
                    como pesadas.
                  </strong>{' '}
                  A <strong>Armadura de quitina</strong> (Ameaças de Arton) e as
                  armaduras pesadas de <strong>Heróis de Arton</strong>{' '}
                  (Brigantina, Armadura de chumbo, de justa, de hussardo alado e
                  de pedra) passaram a ser reconhecidas como{' '}
                  <strong>armadura pesada</strong>, aplicando corretamente as
                  regras que dependem disso.
                </li>
                <li>
                  <strong>
                    Correção: redução de dano de material especial não aplicava
                    sozinha.
                  </strong>{' '}
                  A <strong>RD</strong> concedida por materiais especiais (como
                  o <strong>Adamante</strong>) agora é aplicada automaticamente,
                  sem precisar ajustar na mão.
                </li>
                <li>
                  <strong>
                    Correção: Defesa contava armadura/escudo que não estavam em
                    uso.
                  </strong>{' '}
                  A <strong>Defesa</strong> deixou de somar o bônus de uma
                  armadura que você <strong>tirou</strong> ou de um escudo que
                  você <strong>guardou</strong> — agora só conta o que está
                  efetivamente equipado.
                </li>
                <li>
                  <strong>
                    Correção: não dava pra tirar a armadura quando ela era a
                    única na mochila.
                  </strong>{' '}
                  Agora é possível <strong>desequipar a armadura</strong> mesmo
                  quando ela é o único item desse tipo na mochila.
                </li>
              </ul>

              <h3>4.18</h3>

              <ul>
                <li>
                  <strong>
                    Novo: histórico de rolagens persistente na Mesa Virtual.
                  </strong>{' '}
                  Até agora o histórico vivia só na memória do navegador:
                  qualquer <strong>refresh apagava tudo</strong> e quem entrava
                  no meio da sessão não enxergava o que tinha rolado antes.
                  Agora cada rolagem é{' '}
                  <strong>persistida no banco de dados</strong> e sincronizada
                  entre todos os jogadores em tempo real — o histórico volta
                  intacto após F5, late-joiners recebem as últimas{' '}
                  <strong>200 rolagens</strong> ao entrar, e o botão{' '}
                  <strong>&quot;Limpar histórico&quot;</strong> do mestre agora
                  zera o histórico de <strong>todos os clientes</strong>{' '}
                  simultaneamente (antes cada cliente limpava só a própria
                  tela).
                </li>
                <li>
                  <strong>
                    Novo: histórico de rolagens em cards com aplicação direta de
                    PV.
                  </strong>{' '}
                  O painel <strong>&quot;Rolagens recentes&quot;</strong> foi
                  redesenhado: cada rolagem agora é um <strong>card</strong> com
                  a <strong>imagem da ficha</strong> em círculo e uma{' '}
                  <strong>faixa lateral colorida</strong> (mesma cor definida
                  pelo mestre na ordem de turno). Cada valor final rolado tem{' '}
                  <strong>botões inline</strong> à esquerda pra aplicar dano (½
                  / ×2 / valor) e à direita pra aplicar cura (valor / ×2 / ½) —
                  clica e o PV da ficha é alterado na hora, com o dano
                  consumindo <strong>PV temporário primeiro</strong>. O painel
                  inteiro também ganhou um botão pra{' '}
                  <strong>recolher/expandir</strong> (igual à ordem de turno),
                  com a preferência salva.
                </li>
                <li>
                  <strong>
                    Novo: rail lateral também na visão do mestre, com seletor de
                    alvo.
                  </strong>{' '}
                  O mestre agora tem o mesmo painel lateral à direita com{' '}
                  <strong>histórico de rolagens</strong> e{' '}
                  <strong>rolagem rápida</strong>. Como o mestre opera em nome
                  de qualquer um, ao clicar nos botões de aplicar dano ou cura
                  abre um <strong>popover</strong> pra escolher o alvo entre os{' '}
                  <strong>participantes do encontro</strong> (jogadores e
                  ameaças), com um atalho de{' '}
                  <strong>&quot;Recentes&quot;</strong> no topo pra repetir
                  alvos comuns (útil em ataques em área). Dano em PJ atualiza a
                  ficha e o encontro juntos; dano em ameaça mexe direto no
                  participante. O rail se <strong>recolhe sozinho</strong>{' '}
                  sempre que o mestre troca de aba pra não competir por atenção.
                </li>
                <li>
                  <strong>Novo: Parceiros na Mesa Virtual.</strong> O mestre
                  agora pode anexar <strong>Parceiros</strong> a jogadores
                  durante um encontro ativo — guerreiros, curandeiros,
                  conjuradores e outros, cada um com seu pacote de bônus. A
                  feature traz uma <strong>biblioteca built-in</strong> com{' '}
                  <strong>12 arquétipos × 3 tiers</strong> (Iniciante, Veterano,
                  Mestre): Adepto, Ajudante, Assassino, Atirador, Combatente,
                  Destruidor, Fortão, Guardião, Magivocador, Médico, Perseguidor
                  e Vigilante. O mestre também pode criar{' '}
                  <strong>parceiros customizados</strong> em um editor livre,
                  combinando bônus passivos, ações ativadas (com PM, limite por
                  rodada e rolagem de dado) e habilidades narrativas. Ao anexar,
                  o mestre dá um <strong>nome ao Parceiro</strong> (ex.:
                  &quot;Sir Galahad&quot;) para narrativa. Jogadores ganham um{' '}
                  <strong>painel &quot;Parceiros&quot;</strong> na ficha
                  listando o que está aplicado automaticamente, as ações
                  disponíveis para usar no turno (com botão{' '}
                  <strong>Usar</strong>) e os efeitos informativos. Rolagens de
                  parceiro aparecem com o overlay fullscreen e são broadcast pra
                  mesa toda, como uma rolagem normal. O dialog &quot;É O SEU
                  TURNO!&quot; lembra o jogador de que tem parceiros
                  disponíveis.
                </li>
                <li>
                  <strong>
                    Novo: botão de <em>subir nível</em> direto no topo da ficha.
                  </strong>{' '}
                  Antes era preciso abrir o drawer de edição de informações da
                  ficha para subir de nível. Agora, ao lado do botão de{' '}
                  <strong>editar</strong> no card de informações do personagem,
                  apareceu um novo botão (ícone de seta com linha apontando pra
                  cima) que abre o <strong>assistente de progressão</strong>{' '}
                  direto — um clique a menos pra avançar seu personagem. O botão
                  fica desabilitado quando você já está no{' '}
                  <strong>nível 20</strong>.
                </li>
                <li>
                  <strong>
                    Novo: mestre pode abrir a ficha de qualquer jogador direto
                    da tela da mesa.
                  </strong>{' '}
                  Na tela de configurações da <strong>Mesa Virtual</strong>, o
                  mestre agora pode clicar no <strong>nome do jogador</strong>{' '}
                  (ou no nome da ficha vinculada logo abaixo) para abrir a ficha
                  completa em um <strong>modal em tela cheia</strong>, somente
                  leitura — sem precisar iniciar a sessão. Funciona tanto para
                  fichas dos jogadores quanto para os personagens do próprio
                  mestre.
                </li>
                <li>
                  <strong>
                    Novo: botão <em>@</em> embutido nas caixas de comentário
                    para mencionar a enciclopédia.
                  </strong>{' '}
                  Você sempre pôde digitar <strong>@nome</strong> para mencionar
                  classes, raças, poderes e outros itens da enciclopédia em
                  comentários do fórum, mas quase ninguém sabia. Agora um botão{' '}
                  <strong>@</strong> está embutido na própria caixa de
                  comentário (estilo Slack) — basta clicar para inserir o{' '}
                  <strong>@</strong> e começar a procurar o que você quer citar.
                  Um lembrete discreto abaixo da caixa reforça o atalho.
                </li>
                <li>
                  <strong>
                    Melhoria: notificações agora levam direto ao comentário, com
                    destaque visual.
                  </strong>{' '}
                  Clicar numa notificação de comentário no fórum, blog, build ou
                  bestiário não abre mais só a página — agora a tela{' '}
                  <strong>rola automaticamente</strong> até o comentário e ele
                  ganha um <strong>pulse laranja</strong> de destaque por uns
                  segundos pra você localizar de imediato. Vale tanto pra
                  notificações abertas dentro do app quanto pelas{' '}
                  <strong>push notifications do PWA</strong>. (Funciona pra
                  notificações novas — as antigas continuam levando só pra
                  página.)
                </li>
                <li>
                  <strong>
                    Melhoria: PV e PM repensados pra desktop e mobile.
                  </strong>{' '}
                  Antes, pra alterar PV ou PM era preciso passar o mouse por
                  cima do círculo — o que <strong>não funciona no touch</strong>
                  , então usuários de celular ficavam sem como editar valores.
                  Agora cada círculo tem controles{' '}
                  <strong>sempre visíveis</strong> logo abaixo: um par de{' '}
                  <strong>− / +</strong> com incremento ajustável (clica e o
                  valor cai/sobe pelo passo), um campo onde você{' '}
                  <strong>digita o valor</strong> e aplica como{' '}
                  <strong>Dano</strong> (que consome temp primeiro, depois PV)
                  ou <strong>Curar</strong> (não toca em temp). O círculo também
                  ficou <strong>clicável</strong> e abre um{' '}
                  <strong>painel de edição completa</strong> — entra pela
                  direita no desktop e <strong>por baixo no celular</strong>{' '}
                  (mantendo a ficha visível atrás). Lá dentro você ajusta atual,
                  temporário, incremento, define um{' '}
                  <strong>máximo manual</strong> que sobrescreve o cálculo, e
                  agora tem botões dedicados de <strong>Cura total</strong> (que
                  zera o temp também, como descanso) e{' '}
                  <strong>Limpar temp</strong>.
                </li>
                <li>
                  <strong>
                    Melhoria: card de PV/PM mais limpo, sem botões duplicados.
                  </strong>{' '}
                  Os controles de <strong>− / +</strong> e o campo de{' '}
                  <strong>incremento</strong> que apareciam no card de PV/PM
                  ficavam redundantes com tudo que o painel de edição completa
                  já oferece. Foram removidos do card; pra ajustar valores finos
                  basta abrir o painel de edição pelo círculo de PV/PM (mesmo
                  fluxo de antes).
                </li>
                <li>
                  <strong>
                    Melhoria: bloco de atributos com layout estável e indicador
                    do que mudou.
                  </strong>{' '}
                  No desktop os atributos eram empurrados pra cima com um truque
                  de margem negativa pra criar aquela faixa decorativa
                  sobreposta ao card do herói — mas o layout ficava{' '}
                  <strong>frágil</strong> e quebrava sempre que algo mudava
                  acima. Agora os atributos têm <strong>seção própria</strong>{' '}
                  no desktop também (com título{' '}
                  <strong>&quot;Atributos&quot;</strong>, igual ao mobile), sem
                  truques de margem. Além disso, quando uma{' '}
                  <strong>condição ativa</strong> afeta um atributo (ex.:
                  Esmorecido dá −2 em Carisma), aparece um{' '}
                  <strong>chip colorido embaixo</strong> da caixa mostrando
                  exatamente a magnitude da mudança — vermelho pra penalidade,
                  verde pra bônus — e o tooltip explica{' '}
                  <strong>Base → Modificado</strong>. Dá pra ver em 1 segundo o
                  que está afetando o personagem.
                </li>
                <li>
                  <strong>
                    Melhoria: combate inicia com só o combatente da vez
                    expandido (visão do mestre).
                  </strong>{' '}
                  Ao iniciar um encontro, todos os cards de combatente abriam
                  expandidos, enchendo a tela do mestre de ruído logo de cara.
                  Agora <strong>apenas o card do combatente atual</strong>{' '}
                  começa expandido — os demais ficam recolhidos pra você focar
                  em quem está agindo.
                </li>
                <li>
                  <strong>
                    Melhoria: &quot;Parceiros&quot; agora aparece no menu pra
                    todos, com CTA de apoio.
                  </strong>{' '}
                  O item <strong>Parceiros</strong> ficava escondido pra quem
                  não era apoiador, então ninguém descobria o recurso. Agora ele
                  aparece no menu pra todos os usuários: quem não é apoiador vê
                  um <strong>CTA convidando a apoiar</strong> pra liberar o uso
                  na mesa virtual.
                </li>
                <li>
                  <strong>
                    Melhoria: aninhamento de comentários do fórum no celular.
                  </strong>{' '}
                  No celular, respostas profundas comprimiam tanto o espaço de
                  leitura que o texto saía da tela. A indentação agora é leve e
                  com limite de 3 níveis no celular (4 no desktop), e uma linha
                  vertical sutil à esquerda continua mostrando claramente que o
                  comentário é uma resposta aninhada — sem comer espaço útil.
                </li>
                <li>
                  <strong>
                    Melhoria: caixas de comentário do fórum crescem com o texto.
                  </strong>{' '}
                  Os campos de <strong>comentar</strong>,{' '}
                  <strong>responder</strong> e <strong>editar</strong> no fórum
                  começavam pequenos e ficavam apertados em textos longos. Agora
                  a caixa <strong>se expande automaticamente</strong> conforme
                  você digita (até 15 linhas) e só depois vira scroll interno.
                </li>
                <li>
                  <strong>
                    Melhoria: home destaca apenas a mesa mais recente.
                  </strong>{' '}
                  O bloco <strong>Suas mesas</strong> agora mostra somente{' '}
                  <strong>1 mesa</strong> (a mais recente da qual você
                  participa) lado a lado com o botão{' '}
                  <strong>+ Nova mesa</strong>. Os nomes deixam de aparecer
                  truncados e a lista completa continua acessível pelo atalho{' '}
                  <strong>Ver todas</strong>.
                </li>
                <li>
                  <strong>
                    Correção: abrir o app pela push notification não marcava o
                    aviso como lido.
                  </strong>{' '}
                  Quem usa o app instalado no celular e abria a notificação pela{' '}
                  <strong>push</strong> chegava à página, mas o ícone do sino
                  continuava com o número não-lido até clicar na lista —
                  experiência ruim. Agora a notificação é{' '}
                  <strong>marcada como lida automaticamente</strong> ao abrir
                  pela push, sem necessidade de tocar no sino.
                </li>
                <li>
                  <strong>
                    Correção: notificações de comentário em <em>build</em>{' '}
                    abriam a listagem em vez da build.
                  </strong>{' '}
                  O link interno enviava o usuário pra{' '}
                  <code>/builds/&lt;id&gt;</code> (rota inexistente — caía na
                  listagem geral) em vez da página da build em si. Agora vai
                  direto pra <code>/build/&lt;id&gt;</code>.
                </li>
                <li>
                  <strong>
                    Correção: botão &quot;Salvar&quot; travado ao criar efeito
                    customizado com escopo &quot;Qualquer arma&quot;.
                  </strong>{' '}
                  Ao criar um <strong>efeito customizado</strong> e escolher{' '}
                  <strong>Dano de arma</strong> ou{' '}
                  <strong>Ataque (corpo a corpo / distância)</strong>, o escopo
                  já aparecia como <strong>Qualquer arma</strong>, mas o botão{' '}
                  <strong>Salvar</strong> só destravava se você trocasse o
                  escopo para outra opção e voltasse. Agora o estado inicial do
                  escopo é sincronizado com a UI — o Salvar fica liberado
                  imediatamente assim que os campos obrigatórios são
                  preenchidos.
                </li>
                <li>
                  <strong>
                    Correção: app forçava modo retrato mesmo com a tela
                    desbloqueada.
                  </strong>{' '}
                  Mesmo com a rotação do celular liberada, o app instalado abria
                  sempre em <strong>retrato</strong> — péssimo pra quem está
                  deitado segurando o telefone deitado. Agora o app respeita o{' '}
                  <strong>lock de orientação</strong> do próprio aparelho: se
                  você travou em landscape, fica em landscape; se está livre,
                  gira normalmente.
                </li>
                <li>
                  <strong>
                    Correção: &quot;Passo-a-passo da Criação&quot; aparecia
                    vazio em fichas salvas na nuvem.
                  </strong>{' '}
                  Fichas geradas pelo Wizard manual (e também aleatórias) que
                  passavam pela nuvem voltavam com a seção{' '}
                  <strong>Passo-a-passo da Criação</strong> em branco, mesmo
                  estando completas. O passo-a-passo era descartado no envio
                  para o servidor e não tinha como ser reconstruído ao carregar
                  de volta. Agora ele é preservado integralmente. Fichas novas
                  (ou re-salvas após esta atualização) voltam a exibir todas as
                  decisões da criação; fichas antigas que já estavam na nuvem
                  com o passo-a-passo vazio continuam assim — basta recriá-las
                  para recuperar o histórico.
                </li>
                <li>
                  <strong>
                    Correção: bloco &quot;Suas mesas&quot; na home não mostrava
                    suas mesas no primeiro carregamento.
                  </strong>{' '}
                  Mesmo participando de mesas, a home exibia o convite{' '}
                  <strong>&quot;Crie sua primeira mesa&quot;</strong> e só
                  passava a listar as mesas depois que você visitava{' '}
                  <strong>Mesas Virtuais</strong> e voltava. Agora a home busca
                  suas mesas automaticamente assim que você abre a página.
                </li>
              </ul>

              <h3>4.17</h3>

              <ul>
                <li>
                  <li>
                    <strong>
                      Novo: efeitos customizados em poderes (Apoiador).
                    </strong>{' '}
                    Cada poder expandido na sua ficha tem um botão de{' '}
                    <strong>Configurações</strong> (ícone de engrenagem) que
                    agora abre um diálogo com duas abas:{' '}
                    <strong>Rolagens</strong> (como antes) e{' '}
                    <strong>Efeitos</strong>. Na nova aba você cria{' '}
                    <strong>efeitos com múltiplos tiers</strong> — cada tier com
                    seu próprio custo de PM e seus bônus mecânicos. Os bônus
                    cobrem praticamente tudo: atributos, ataque (geral, corpo a
                    corpo ou à distância), dano de arma, defesa, deslocamento,
                    perícias, PV/PM, iniciativa, testes de resistência
                    (Fortitude/Reflexos/Vontade ou todos), CD de magias, redução
                    de dano por tipo e margem/multiplicador de crítico. Os
                    efeitos criados aparecem no gerenciador de{' '}
                    <strong>Efeitos Ativos</strong> com a etiqueta{' '}
                    <strong>Customizado</strong> e podem ser
                    ativados/desativados como qualquer outro efeito. Poderes que
                    já têm efeito ativo pronto no sistema (como Inspiração do
                    Bardo) mostram o efeito embutido em modo somente-leitura na
                    aba.
                  </li>
                  <strong>Efeitos de poderes e magias.</strong> Esta versão
                  trouxe um pacote de novidades e ajustes no motor de efeitos
                  ativos:
                  <ul>
                    <li>
                      <strong>
                        Novo: Encouraçado vira efeito ativo togável na ficha.
                      </strong>{' '}
                      O poder geral <strong>Encouraçado</strong> agora pode ser
                      ativado direto pelo cabeçalho, aplicando o bônus na Defesa{' '}
                      <strong>com escala dinâmica</strong>: +2 de base e +2
                      adicional para cada poder dependente que você possua
                      (Inexpugnável, Fanático, Catafractário, Encastelado). Se
                      você não estiver com armadura pesada equipada, um aviso
                      discreto aparece no diálogo — sem bloquear a ativação.
                    </li>
                    <li>
                      <strong>
                        Novo: tier &quot;Customizado&quot; em magias com
                        aprimoramento escalável.
                      </strong>{' '}
                      Magias como <strong>Armadura Arcana</strong> agora
                      oferecem, além dos valores comuns, um tier{' '}
                      <strong>Customizado</strong> com botões +/- para você
                      ajustar o bônus quando aprimorou além do teto modelado
                      (por exemplo, +13 na Defesa com 8 aprimoramentos).
                    </li>
                    <li>
                      <strong>
                        Novo: três magias passam a oferecer efeito ativo.
                      </strong>{' '}
                      <strong>Aviso</strong> (+5 no próximo teste de Iniciativa
                      e em Percepção, opção &quot;Alerta&quot;),{' '}
                      <strong>Maaais Klunc</strong> (+10 em Força com cascata
                      para perícias de Força e dano corpo a corpo) e{' '}
                      <strong>Mente Divina</strong> (8 tiers cobrindo a base e
                      todos os aprimoramentos para +2/+4 em um atributo mental
                      escolhido ou nos três).
                    </li>
                    <li>
                      <strong>
                        Novo: aba &quot;Adicionar&quot; no gerenciador de
                        efeitos ativos.
                      </strong>{' '}
                      Agora dá para incluir manualmente qualquer efeito de poder
                      ou magia do compêndio na sua ficha — sem pagar PM e sem
                      notificar aliados da mesa. Útil para narrar buffs do
                      mestre ou para jogo solo. Há uma busca embutida e um aviso
                      esclarecendo que pré-requisitos não são validados nesse
                      modo.
                    </li>
                    <li>
                      <strong>
                        Melhoria: bônus de atributo em efeitos ativos finalmente
                        aplicam de verdade.
                      </strong>{' '}
                      Boosts como o <strong>+2 Força</strong> do Banquete
                      Selvagem do Druida, o <strong>+4 em atributo</strong> da
                      Força da Natureza, o <strong>+1/+2 Força</strong> do
                      Crescimento Feérico (qareen) e o{' '}
                      <strong>+2 Carisma</strong> da Aparência Perfeita — antes
                      silenciosamente ignorados pelo motor — agora cascateiam
                      corretamente para todas as <strong>perícias</strong>{' '}
                      derivadas do atributo (incluindo Luta/Pontaria, Iniciativa
                      e resistências). Boosts de Força também somam no dano
                      corpo a corpo; boosts de Destreza, na Defesa.
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>Novo: página inicial redesenhada.</strong> A gente
                  estará continuamente tentando melhorar a qualidade da home
                  para refletir novas ferramentas, os conteúdos dinâmicos da
                  comunidade e muito mais. Para isso, vamos tentar algums
                  soluções um pouco. Nada é permanente, vamos nos adaptando e
                  melhorando.
                </li>
                <li>
                  <strong>Novo: lembrete dos cosméticos de apoiador.</strong>{' '}
                  Apoiadores que ainda não experimentaram a{' '}
                  <strong>cor de destaque personalizada</strong> ou os{' '}
                  <strong>dados 3D</strong> agora recebem um lembrete discreto,
                  no máximo uma vez por semana, com um atalho que abre direto a
                  aba <strong>Sistema</strong> do perfil. Quem já personalizou
                  tudo nunca vê o aviso, e há um botão{' '}
                  <strong>&quot;Não mostrar mais&quot;</strong> para desativar
                  permanentemente.
                </li>
                <li>
                  <strong>
                    Novo: publicação anônima por padrão no Bestiário da
                    Comunidade.
                  </strong>{' '}
                  Suas ameaças publicadas agora aparecem como{' '}
                  <strong>&quot;por Anônimo&quot;</strong> para outros usuários,
                  protegendo mestres que não querem revelar a autoria e spoilear
                  os próprios jogadores. Quem preferir aparecer pode desativar a
                  opção em <strong>Perfil → Sistema</strong>, na nova seção{' '}
                  <strong>Privacidade</strong>. A página de publicação também
                  avisa quando você está publicando anonimamente, com atalho
                  para as configurações.
                </li>
                <li>
                  <strong>
                    Correção: Fortitude, Reflexos e Vontade agora podem ser
                    editadas no Gerador de Ameaças.
                  </strong>{' '}
                  Antes, essas três perícias ficavam travadas com o valor
                  derivado da atribuição <strong>Forte/Média/Fraca</strong> e
                  não dava para sobrescrever. Agora elas aparecem na mesma
                  tabela das demais perícias em{' '}
                  <strong>Configurar Perícias</strong>, já pré-preenchidas com o
                  valor calculado da tabela de combate — basta digitar um novo
                  número no campo <strong>Total</strong> para sobrescrever. O
                  valor editado se reflete no statblock, na rolagem de dados e
                  no export para o Foundry VTT. A checkbox{' '}
                  <strong>Treinada</strong> fica desabilitada nessas três
                  (treinamento não se aplica a resistências).
                </li>
                <li>
                  <strong>
                    Correção: aba &quot;Sistema&quot; do Perfil voltava sozinha
                    para &quot;Perfil&quot;.
                  </strong>{' '}
                  Toda vez que você alterava uma configuração na aba{' '}
                  <strong>Sistema</strong> (tema, cor de destaque, dados 3D,
                  privacidade do Bestiário, suplementos), a página piscava o
                  loader de carregamento e voltava para a aba{' '}
                  <strong>Perfil</strong>. Agora cada alteração salva sem
                  remontar a página — você fica exatamente onde estava.
                </li>
                <li>
                  <strong>
                    Correção: resistências infladas de ameaças na mesa virtual.
                  </strong>{' '}
                  Em algumas ameaças importadas para a mesa virtual, valores de
                  Fortitude/Reflexos/Vontade apareciam somados em duplicado.
                  Cálculo corrigido.
                </li>
              </ul>

              <h3>4.16</h3>

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
                  gutterBottom
                  sx={{
                    fontWeight: 'bold',
                    color: 'success.dark',
                  }}
                >
                  Bestiário da Comunidade
                </Typography>
                <Typography variant='body1' sx={{ mb: 1 }}>
                  Um acervo compartilhado de criaturas, alimentado pela
                  comunidade. Agora você pode{' '}
                  <strong>publicar suas ameaças</strong> direto de{' '}
                  <strong>Minhas Ameaças</strong> ou da tela da ameaça (botão{' '}
                  <strong>Publicar no Bestiário</strong>), escrevendo a
                  descrição. Há uma seção <strong>Bestiário</strong> no menu
                  lateral para explorar tudo e uma página{' '}
                  <strong>Meu Bestiário</strong> com as suas publicações.
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'text.secondary',
                    mb: 1,
                  }}
                >
                  <strong>Copiar para usar:</strong> gostou de uma criatura?
                  Copie a ameaça para a sua conta com um clique e use nas suas
                  mesas.
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'text.secondary',
                    mb: 1,
                  }}
                >
                  <strong>Comunidade e curadoria:</strong> avalie e comente as
                  ameaças.
                </Typography>
              </Alert>

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
                  gutterBottom
                  sx={{
                    fontWeight: 'bold',
                    color: 'success.dark',
                  }}
                >
                  Efeitos Ativos de Poderes e Magias
                </Typography>
                <Typography variant='body1' sx={{ mb: 1 }}>
                  Um motor de <strong>bônus temporários</strong>: poderes com
                  efeito contínuo — como a <strong>Inspiração</strong> do Bardo
                  ou a <strong>Fúria</strong> do Bárbaro — agora podem ser{' '}
                  <strong>ativados direto pela ficha</strong>, no cabeçalho do
                  próprio poder. Enquanto ativos, a ficha{' '}
                  <strong>recalcula sozinha</strong> os valores afetados e
                  destaca as <strong>perícias</strong> e a{' '}
                  <strong>Defesa</strong> alteradas, com um painel para
                  gerenciar tudo que está em uso.
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'text.secondary',
                    mb: 1,
                  }}
                >
                  <strong>Cobertura ampla:</strong> os poderes ativos das{' '}
                  <strong>13 classes</strong>, além de poderes{' '}
                  <strong>gerais</strong> (combate, destino, concedidos,
                  tormenta e magia) e <strong>raciais</strong> (como Camuflagem
                  Mimética e Coro Sibilante).
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'text.secondary',
                    mb: 1,
                  }}
                >
                  <strong>Também em magias:</strong> magias que alteram a ficha
                  temporariamente — como <strong>Armadura Arcana</strong>,{' '}
                  <strong>Bênção</strong>, <strong>Pele de Pedra</strong> ou a{' '}
                  <strong>Aura Divina</strong> — passam a oferecer o efeito{' '}
                  <strong>ao confirmar o lançamento</strong>. A tela de lançar
                  magia exibe um aviso de <strong>efeito ativo</strong> e, ao
                  usar a magia, você decide se aplica o bônus na ficha (também{' '}
                  <strong>ofertado aos aliados</strong> da mesa, como nos
                  poderes). Cobertura: <strong>33 magias</strong> arcanas e
                  divinas revisadas, de todos os círculos.
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'text.secondary',
                    mb: 1,
                  }}
                >
                  <strong>Integração com a mesa virtual:</strong> ao ativar um
                  efeito, ele é <strong>oferecido em tempo real</strong> aos
                  envolvidos na mesa, e o combate termina com um{' '}
                  <strong>relatório dos efeitos</strong> usados. O ícone de
                  efeitos da ficha fica <strong>dourado</strong> com um contador
                  quando há algo ativo.
                </Typography>
              </Alert>

              <ul>
                <li>
                  <strong>
                    Novo: busca unificada na Enciclopédia de Tanah-Toh.
                  </strong>{' '}
                  Uma barra de pesquisa única, sempre visível no topo da
                  Enciclopédia, que vasculha <strong>todo o compêndio</strong>{' '}
                  de uma vez — raças, classes, <strong>habilidades</strong> e{' '}
                  <strong>poderes de classe</strong>, origens, divindades,
                  poderes gerais e magias. Não precisa mais lembrar a qual
                  classe ou tipo um poder pertence: os resultados são{' '}
                  <strong>ordenados por relevância</strong> (acerto no nome pesa
                  mais, mas a busca também encontra pelo texto do efeito), com o
                  termo destacado, e um clique leva direto à aba certa.
                </li>
                <li>
                  <strong>Novo: filtros avançados de magia</strong> em todos os
                  lugares onde você escolhe magias — no assistente de criação de
                  ficha, no assistente de subir de nível e no painel de{' '}
                  <strong>Editar Magias</strong>. Além da busca por texto, agora
                  há um botão <strong>Filtros avançados</strong> que permite
                  filtrar por <strong>escola</strong>, <strong>círculo</strong>,{' '}
                  <strong>execução</strong> e <strong>tipo</strong>{' '}
                  (arcanas/divinas), combinando vários critérios ao mesmo tempo.
                </li>
                <li>
                  <strong>
                    Novo: Enciclopédia (compêndio de regras) dentro da mesa
                    virtual.
                  </strong>{' '}
                  O mestre agora tem um item <strong>Enciclopédia</strong> na
                  barra lateral da mesa (e uma aba no menu inferior no celular)
                  para consultar raças, classes, origens, divindades, poderes e
                  magias <strong>sem sair da sessão</strong>. No computador, ao
                  passar o mouse para expandir a barra, aparecem atalhos
                  discretos para cada aba do compêndio.
                </li>
                <li>
                  <strong>
                    Melhoria: cálculo de deslocamento mais robusto.
                  </strong>{' '}
                  Bônus de deslocamento vindos de poderes, condições e efeitos
                  ativos passam a somar corretamente por cima de penalidades de
                  armadura pesada/sobrecarga e do deslocamento ajustado
                  manualmente.
                </li>
                <li>
                  <strong>
                    Melhoria: na mesa virtual, ficou muito mais claro de quem é
                    a vez no combate.
                  </strong>{' '}
                  Na tela do mestre, ao passar de turno os cards dos combatentes
                  recolhem automaticamente e{' '}
                  <strong>só o do combatente da vez</strong> fica expandido, e
                  esse card ganha um <strong>destaque pulsante</strong> para
                  identificar de relance quem está jogando.
                </li>
                <li>
                  <strong>Melhoria:</strong> o botão{' '}
                  <strong>Publicar no Bestiário</strong> foi realinhado à
                  largura do conteúdo da ameaça.
                </li>
                <li>
                  <strong>Melhoria:</strong> a Biblioteca (compêndio de regras)
                  pode ser exibida embutida em outros contextos, como dentro da
                  mesa virtual, sem interferir no título da aba nem exibir
                  chamadas que não funcionariam ali.
                </li>
                <li>
                  <strong>Melhoria:</strong> o carrossel de destaques da página
                  inicial passou a ser configurado pelo servidor, permitindo
                  atualizar os destaques sem precisar de uma nova versão do app.
                </li>
                <li>
                  <strong>Correção:</strong> ao remover um{' '}
                  <strong>Poder Geral</strong> pelo painel de{' '}
                  <strong>Editar Poderes</strong> e salvar, o poder não é mais
                  readicionado à ficha. O problema afetava poderes concedidos
                  por habilidades (como a <strong>Memória Póstuma</strong> do
                  Osteon e a <strong>Linhagem Rubra</strong> do Arcanista
                  Feiticeiro), que voltavam a aparecer na lista de poderes.
                </li>
              </ul>
              <h3>4.15</h3>
              <ul>
                <li>
                  <strong>
                    Novo: card expansível de combatente no encontro ativo (visão
                    do mestre).
                  </strong>{' '}
                  Antes o mestre via apenas uma linha com nome, PV/PM e
                  iniciativa de cada combatente. Agora cada combatente aparece
                  como um <strong>card</strong> que pode ser expandido ou
                  retraído. Nas configurações da mesa, em{' '}
                  <em>Card do combatente (visão do mestre)</em>, você escolhe
                  quais informações da ficha quer ver durante o combate: PV, PM,
                  Defesa (ligados por padrão), e qualquer combinação de{' '}
                  <em>atributos</em> (Força, Destreza, Constituição,
                  Inteligência, Sabedoria, Carisma) e <em>perícias</em> (lista
                  completa). Uma <strong>pré-visualização ao vivo</strong> na
                  própria tela de configurações mostra como o card vai ficar
                  enquanto você mexe. Quando o card está retraído, um resumo
                  compacto em chips ainda exibe os campos configurados; ao
                  expandir, PV/PM ganham controles +/- (para ameaças), atributos
                  e perícias aparecem em chips com bônus. A tela do jogador
                  continua exatamente como antes.
                </li>
                <li>
                  <strong>
                    Novo: cor pessoal por participante na mesa virtual.
                  </strong>{' '}
                  Cada jogador (e o mestre) pode ter uma cor pessoal que serve
                  como identificador visual em todos os lugares da mesa. Na
                  lista de <em>Jogadores</em> da página da mesa, um{' '}
                  <strong>seletor de cor</strong> (RGB completo) aparece ao lado
                  de cada membro — o mestre pode mudar a cor de qualquer um,
                  jogadores só a própria. A cor é aplicada como{' '}
                  <strong>fundo do card</strong> e faixa lateral do combatente
                  no encontro ativo do mestre, como{' '}
                  <strong>bolinha colorida</strong> ao lado do nome na ordem de
                  turno do jogador e na lista de jogadores conectados, e como{' '}
                  <strong>borda do avatar</strong> no painel de fichas.
                  Atualização em tempo real para todos que estão na sessão.
                </li>
                <li>
                  <strong>
                    Novo: subpastas aninhadas em Meus Personagens e Minhas
                    Ameaças.
                  </strong>{' '}
                  Para quem organiza muitas fichas (campanhas com vários arcos,
                  NPCs por sessão, ameaças por bioma), agora as pastas podem
                  conter outras pastas <em>sem limite de profundidade</em>. Ao
                  entrar em uma pasta, um <strong>caminho navegável</strong>{' '}
                  (breadcrumb) aparece no topo — clique em qualquer segmento
                  para voltar àquele nível, ou em <em>Raiz</em> para sair de
                  tudo. Criar uma pasta enquanto está dentro de outra cria
                  automaticamente uma <strong>subpasta</strong> ali. Você pode{' '}
                  <strong>arrastar uma pasta para dentro de outra</strong> para
                  reorganizar, ou usar a opção <em>Mover para…</em> no menu de
                  contexto da pasta (clique direito). O menu <em>Mover</em> das
                  fichas agora mostra o <strong>caminho completo</strong> de
                  cada destino (ex.: <em>Campanhas › Volume 1 › Sessão 3</em>),
                  evitando confusão entre pastas de mesmo nome. Ao{' '}
                  <strong>excluir</strong> uma pasta, as subpastas e fichas
                  dentro dela <strong>não são apagadas</strong> — sobem
                  automaticamente para a pasta pai (ou para a raiz, se era de
                  nível mais alto). A contagem mostrada em cada pasta agora é{' '}
                  <strong>recursiva</strong> (inclui fichas em todas as
                  subpastas).
                </li>
                <li>
                  <strong>
                    Novo: editar manualmente a ficha do Melhor Amigo.
                  </strong>{' '}
                  Atendendo a pedidos frequentes de usuários, agora a ficha do
                  Melhor Amigo (parceiro do Treinador) é totalmente editável.
                  Abra a ficha do parceiro e clique no ícone de{' '}
                  <strong>lápis</strong> no topo — um novo modal abre com abas
                  para <em>Geral</em>, <em>Combate</em>, <em>Armas Naturais</em>
                  , <em>Perícias</em>, <em>Truques</em>, <em>Magias</em> e{' '}
                  <em>Outros</em>, permitindo alterar nome, tipo, tamanho,
                  atributos, PV, Defesa, RD, deslocamento, lista de truques,
                  perícias, armas naturais, sentidos, imunidades e
                  proficiências. Edições manuais sobrescrevem os valores
                  auto-calculados e a ficha exibe um chip{' '}
                  <em>Editado manualmente</em>. Use o botão{' '}
                  <strong>Restaurar valores originais</strong> no header do
                  modal para voltar tudo ao estado auto-gerado — o tracking de
                  PV de combate (PV atual, temporário e incremento) é
                  preservado.
                </li>
                <li>
                  <strong>
                    Novo: reordenar manualmente os poderes na ficha.
                  </strong>{' '}
                  Antes os poderes apareciam sempre em ordem alfabética — agora
                  você pode definir a sua própria ordem (ex.: agrupar poderes de
                  combate no topo, deixar passivos no fim). Na seção{' '}
                  <strong>Poderes</strong> da ficha, clique em{' '}
                  <strong>Reordenar</strong>, arraste os poderes para a posição
                  desejada e clique em <strong>Concluído</strong>. A ordem fica
                  salva naquela ficha (incluindo no PDF gerado) e sobrevive a
                  recarregamentos. Se quiser voltar ao padrão, basta clicar em{' '}
                  <em>Restaurar ordem alfabética</em>.
                </li>
                <li>
                  <strong>Novo: convite via link para Mesas Virtuais.</strong> O
                  mestre agora pode gerar{' '}
                  <strong>um único link de convite</strong> para a mesa e
                  compartilhar em qualquer canal (Discord, WhatsApp, etc.) —
                  antes era necessário pedir o email de cada jogador e enviar
                  convites individuais. O modal de <em>Convidar Jogador</em>{' '}
                  ganhou uma nova aba <strong>Por link</strong> com botões para
                  gerar, copiar, revogar e regenerar o link. O link expira em 7
                  dias e pode ser usado por vários jogadores até atingir o
                  limite da mesa. Quem clica no link vê um preview da mesa
                  (nome, mestre, jogadores) antes de confirmar a entrada; se
                  estiver deslogado, é convidado a fazer login pelo modal usual
                  antes de prosseguir. O convite por email continua disponível
                  na outra aba.
                </li>
                <li>
                  <strong>
                    Novo: materiais especiais agora aplicam efeitos numéricos.
                  </strong>{' '}
                  Mitral em arma melhora a margem de ameaça em 1 (ex.: 20/x2 →
                  19/x2) e em armadura reduz a penalidade em 2. Adamante em arma
                  aumenta o dado de dano em um passo (1d8 → 1d10) e em armadura
                  concede RD geral (2 para leves/escudos, 5 para pesadas). Gelo
                  Eterno em arma adiciona +2 de dano por frio; em armadura
                  concede RD contra fogo (5/10). Matéria Vermelha em arma
                  adiciona +1d6 de dano de essência. Aço-rubi e Madeira Tollon
                  seguem descritivos pois seus efeitos são condicionais.
                </li>
                <li>
                  <strong>
                    Melhoria: sugestões de deslocamento no Gerador de Ameaças.
                  </strong>{' '}
                  Antes era preciso digitar o deslocamento manualmente toda vez.
                  Agora, ao escolher o <em>Tamanho</em> da ameaça, o campo é
                  preenchido automaticamente com o valor padrão da tabela
                  oficial (coluna <em>Bípede / Normal</em>: 6m para Pequeno, 9m
                  para Médio, 12m para Grande, 15m para Enorme/Colossal) e logo
                  abaixo aparecem <strong>chips</strong> com todas as
                  combinações aplicáveis (Bípede e Quadrúpede × <em>Lento</em>,{' '}
                  <em>Normal</em>, <em>Rápido</em>) para clique rápido. Cada
                  sugestão já vem no formato <em>Nm (Mq)</em>, mostrando também
                  a quantidade de quadrados equivalentes (cada quadrado = 1,5m)
                  para uso em mesas de batalha — ex.: <em>9m (6q)</em>. Você
                  ainda pode digitar um valor customizado se preferir.
                </li>
                <li>
                  <strong>
                    Correção: Defesa e notas dos combatentes não eram
                    persistidas no encontro.
                  </strong>{' '}
                  Quando o encontro ativo era salvo e recarregado, os valores de
                  Defesa e as anotações privadas do mestre somem silenciosamente
                  — o chip de Defesa desaparecia do combatente depois de
                  qualquer refresh da página. Agora ambos persistem corretamente
                  entre sessões.
                </li>
                <li>
                  <strong>
                    Correção: classes conjuradoras não ganhavam magia ao subir
                    de nível.
                  </strong>{' '}
                  Desde a versão que adicionou multiclasse, o passo de escolha
                  de magia era silenciosamente pulado no level up de Clérigo,
                  Frade, Bardo, Druida e Arcanista quando jogados como classe
                  única. O wizard agora oferece corretamente a magia nova a cada
                  nível (3 magias iniciais no 1º + 1 magia por nível para o
                  Clérigo, conforme regras oficiais).
                </li>
                <li>
                  <strong>
                    Correção: opções da raça Yidishan não apareciam no wizard
                    manual.
                  </strong>{' '}
                  Ao criar uma ficha de Yidishan pelo wizard, a habilidade{' '}
                  <strong>Natureza Orgânica</strong> era resolvida
                  aleatoriamente sem dar escolha ao jogador. Agora aparece um
                  novo card no passo <strong>Efeitos de Poderes</strong> onde
                  você escolhe a <em>raça anterior</em> (padrão Humano, com as
                  demais raças humanoides do livro disponíveis) e o benefício
                  entre <em>perícia treinada</em>, <em>poder geral</em> ou (se a
                  raça anterior não for humano){' '}
                  <em>uma habilidade dessa raça</em>.
                </li>
                <li>
                  <strong>
                    Correção: Couraça Rúbea e Disforme da raça Kaijin pediam
                    clique em uma opção única.
                  </strong>{' '}
                  Após começarem a contar como poderes da Tormenta na 4.15
                  anterior, essas habilidades passaram a exibir um radio
                  obrigatório com apenas a opção pré-determinada. O wizard agora
                  seleciona automaticamente a única opção disponível quando um
                  poder oferece uma escolha única — vale também para outras
                  raças/poderes com a mesma estrutura.
                </li>
                <li>
                  <strong>
                    Correção: edição manual de Dano, Bônus de Ataque e Crítico
                    em armas com modificadores.
                  </strong>{' '}
                  Quando uma arma já tinha modificações ou encantamentos
                  aplicados, ajustar manualmente os campos da aba Estatísticas
                  do editor de item não persistia — o valor digitado voltava
                  para o cálculo automático após salvar. Agora a edição manual é
                  preservada e ganha prioridade sobre o recálculo. Para voltar
                  ao automático, use o botão <strong>Resetar</strong> na própria
                  aba.
                </li>
                <li>
                  <strong>Correção: layout mobile da Mesa Virtual.</strong> Em
                  celulares, a página da mesa abria com um zoom estranho e
                  deixava uma faixa em branco lateral. A barra do topo agora
                  trunca nomes longos da mesa e agrupa as ações secundárias
                  (modo privado, histórico de rolagens, jogadores conectados,
                  encerrar sessão) em um menu de três pontos. Os campos do
                  painel de combate (PV, PM, iniciativa) também ficaram menores
                  em telas pequenas para evitar overflow.
                </li>
                <li>
                  <strong>
                    Correção: perícias destreinadas voltavam a aparecer como
                    treinadas.
                  </strong>{' '}
                  Quando você destreinava uma perícia base da classe/origem,
                  salvava e em seguida fazia qualquer outra edição na ficha
                  (defesa, poderes, mochila, condições, etc.), a perícia voltava
                  automaticamente a ficar treinada — e o estado errado era
                  persistido. Agora a intenção de destreinar é preservada
                  através das recalculações subsequentes.
                </li>
                <li>
                  <strong>Correção: abas de Editar Item no mobile.</strong> No
                  editor de item da mochila, as abas (Geral, Estatísticas,
                  Modificações, Encantamentos) agora têm scroll horizontal no
                  mobile, evitando que ficassem cortadas em telas pequenas.
                </li>
              </ul>

              <h3>4.14</h3>
              <ul>
                <li>
                  <strong>
                    Novo: Layouts da Mesa Virtual repensados no desktop.
                  </strong>{' '}
                  No desktop e em tablets em landscape, jogador e mestre agora
                  têm telas dedicadas no lugar do scroll vertical único. O
                  jogador vê a ficha como conteúdo principal e ganha um rail
                  direito colapsável com a ordem de turno (quando há combate),
                  log de rolagens recentes e a Rolagem Rápida no rodapé. O
                  mestre passa a ter um menu lateral flutuante com os contextos{' '}
                  <strong>Encontros</strong> (Ativo / Preparados),{' '}
                  <strong>Fichas</strong> (Jogadores / Ameaças) e{' '}
                  <strong>Configurações</strong>. O menu mostra só ícones por
                  padrão e se expande no hover. Mobile portrait segue com a
                  navegação inferior atual.
                </li>
                <li>
                  <strong>
                    Novo: Configurações da Mesa Virtual para o mestre.
                  </strong>{' '}
                  Nova seção <strong>Configurações da Mesa</strong> na página da
                  mesa permite ao mestre escolher o{' '}
                  <strong>modo padrão das rolagens</strong> (público ou privado)
                  e como <strong>PV e PM</strong> aparecem aos jogadores durante
                  encontros ativos: aplicar a personagens dos jogadores, ameaças
                  ou ambos; mostrar apenas PV, apenas PM ou os dois; e exibir só
                  a barra, só o valor atual, só o total ou tudo junto. As
                  mudanças refletem em tempo real para todos os clientes
                  conectados à sessão. Antes essa configuração estava colada no
                  toggle de rolagens privadas e só dava pra esconder a barra de
                  inimigos — agora cada coisa é independente.
                </li>
                <li>
                  <strong>
                    Novo: PV e PM dos personagens dos jogadores no encontro.
                  </strong>{' '}
                  Os participantes-jogadores agora carregam um snapshot de PV/PM
                  tirado da ficha quando o encontro começa, e qualquer mudança
                  que o jogador fizer na própria ficha (dano, gasto de PM,
                  edição de PV/PM Máximo Manual) sincroniza automaticamente para
                  a linha do participante no encontro. Combinado com a nova
                  configuração de exibição, o mestre escolhe se essa informação
                  fica visível para os outros jogadores da mesa e em qual nível
                  de detalhe.
                </li>
                <li>
                  <strong>
                    Novo: Iniciar / Entrar / Encerrar sessão a partir da página
                    da mesa.
                  </strong>{' '}
                  A página de detalhe da mesa ganhou ações de sessão visíveis
                  para qualquer membro: <strong>Entrar na Sessão</strong>{' '}
                  aparece sempre que a sessão está ativa,{' '}
                  <strong>Iniciar Sessão</strong> e{' '}
                  <strong>Encerrar Sessão</strong> ficam visíveis para o
                  Mestre/dono. Antes, ao cair nessa página durante uma sessão
                  ativa, o jogador não tinha como entrar e o mestre não tinha
                  como encerrar sem voltar para a sessão.
                </li>
                <li>
                  <strong>Novo: Encantamentos mágicos</strong> em armas,
                  armaduras e escudos. Nova aba <strong>Encantamentos</strong>{' '}
                  no editor de item da mochila com seleção múltipla, custo
                  máximo de 5 pontos, suporte a encantamentos exclusivos de
                  escudo (Animado, Esmagador) e{' '}
                  <strong>aplicação automática de bônus numéricos</strong>:
                  Defensora (+2 Defesa do empunhador), Formidável (+2 atk/+2
                  dano), Magnífica (+4 atk/+4 dano), Defensor (+2 Defesa),
                  Guardião (+4 Defesa), Acrobático/Sombrio/Escorregadio (+2
                  perícia). Encantamentos com efeito descritivo (resistências,
                  efeitos condicionais, magias guardadas) salvam no item e
                  aparecem no tooltip mas não modificam stats automaticamente.
                </li>
                <li>
                  <strong>Novo: Tipos de dano e dano extra em armas.</strong>{' '}
                  Cada arma agora pode ter{' '}
                  <strong>múltiplos danos extras</strong> tipados (ex.: 1d6
                  Fogo, 1d4 Luz) que rolam junto com o dano base no ataque. Os
                  11 tipos disponíveis são{' '}
                  <strong>
                    Impacto, Corte, Perfuração, Ácido, Eletricidade, Essência,
                    Fogo, Frio, Luz, Psíquico
                  </strong>{' '}
                  e <strong>Trevas</strong>. Encantamentos elementais{' '}
                  <strong>
                    Flamejante, Congelante, Corrosiva, Elétrica e Tumular
                  </strong>{' '}
                  agora adicionam automaticamente seus danos extras à arma
                  quando aplicados. Linhas de dano extra rolam uma vez no acerto
                  e <strong>não criticam</strong> (regra T20). Edição manual via
                  seção &quot;Danos extras&quot; na aba Estatísticas.
                </li>
                <li>
                  <strong>Novo: Indicador visual</strong> na linha de cada
                  ataque para itens com modificação superior ou encantamento,
                  com tooltip listando os dois grupos. O sufixo do nome do item
                  na mochila também passa a incluir encantamentos junto às
                  modificações.
                </li>
                <li>
                  <strong>Novo: Modificações de Heróis de Arton.</strong>{' '}
                  Catálogo do suplemento Heróis de Arton integrado ao editor de
                  modificações: Banhada a ouro, Cravejada de gemas, Luxuosa,
                  Guarda, Farpada, Fósforo, Incendiária, Pressurizada,
                  Balístico, Deslumbrante, Injetora, Prudente. Suporte a{' '}
                  <strong>pré-requisitos OR</strong> — modificações como Luxuosa
                  que requerem &quot;Banhada a ouro <em>ou</em> Cravejada de
                  gemas&quot;. Modificação Guarda aplica +1 de Defesa
                  automaticamente via SheetBonus.
                </li>
                <li>
                  <strong>
                    Melhoria: Identificação de suplemento nas melhorias e
                    encantamentos.
                  </strong>{' '}
                  As abas <strong>Melhorias</strong> e{' '}
                  <strong>Encantamentos</strong> do editor de armas, armaduras e
                  escudos agora exibem um badge com a abreviação do suplemento
                  (ex.: <strong>DA</strong>, <strong>HA</strong>) ao lado de
                  cada opção que não vem do livro básico. Antes, era impossível
                  saber de qual suplemento uma opção vinha — só o nome aparecia.
                  A aba de Encantamentos também passou a carregar encantos
                  específicos de suplementos ativos, em paralelo ao que já
                  funcionava para Melhorias.
                </li>
                <li>
                  <strong>Melhoria: Conexão da Mesa Virtual.</strong>{' '}
                  Reidratação completa do estado do encontro ao reconectar
                  (snapshot canônico vindo do servidor) elimina divergência
                  entre jogadores depois de qualquer instabilidade de rede.
                  Detecção de zombie connection via ACK de heartbeat: se o
                  servidor para de responder, o cliente percebe em ≤16s e
                  reconecta automaticamente. Novo indicador{' '}
                  <strong>amarelo</strong> de &quot;Conexão instável&quot; no
                  ícone de Wi-Fi do topo aparece antes de cair de vez,
                  permitindo ação preventiva.
                </li>
                <li>
                  <strong>Melhoria: Mochila pré-filtrada por contexto.</strong>{' '}
                  Ao abrir a Mochila de Aventureiro pelo botão de editar dos
                  cards de <strong>Ataques</strong> ou <strong>Defesa</strong>,
                  o filtro de categorias já vem pré-selecionado (<em>Arma</em>{' '}
                  para Ataques; <em>Armadura</em> e <em>Escudo</em> para
                  Defesa). O botão de <strong>Equipamentos</strong> segue
                  abrindo sem filtro. Os chips do toolbar continuam editáveis
                  para alterar ou limpar a seleção.
                </li>
                <li>
                  <strong>Melhoria: Card de Defesa.</strong> Configurações do
                  card de Defesa separadas do acesso à mochila, permitindo
                  ajustar bônus específicos sem abrir a mochila inteira.
                </li>
                <li>
                  <strong>
                    Correção: Habilidades de Tormenta da raça Kaijin.
                  </strong>{' '}
                  As habilidades <strong>Disforme</strong> e{' '}
                  <strong>Terror Vivo</strong> da raça <strong>Kaijin</strong>{' '}
                  agora contam corretamente como poderes da Tormenta. Disforme
                  passa a adicionar automaticamente um poder da Tormenta à ficha
                  (como já acontecia com Couraça Rúbea), e Terror Vivo abre um
                  seletor para escolher um poder real da Tormenta entre os
                  disponíveis. Antes, apenas Couraça Rúbea era contabilizada,
                  impedindo builds Kaijin de cumprir o pré-requisito de poderes
                  que exigem 4 outros poderes da Tormenta — como{' '}
                  <strong>Membros Extras</strong>.
                </li>
                <li>
                  <strong>
                    Correção: Poderes e truques do Treinador (Ensinar Truque e
                    Magia Inata).
                  </strong>{' '}
                  Dois bugs reportados por jogadores foram corrigidos. O poder{' '}
                  <strong>Ensinar Truque</strong> agora abre, ao ser escolhido
                  no level up ou no editor de poderes, um passo dedicado para
                  escolher o truque adicional do melhor amigo — antes o poder
                  ficava registrado mas não tinha efeito. O truque{' '}
                  <strong>Magia Inata</strong> (Espíritos) agora tem seletor de
                  magia: o jogador escolhe uma magia arcana ou divina de 1º
                  círculo e ela é atribuída ao melhor amigo com{' '}
                  <strong>Carisma do treinador</strong> como atributo-chave,
                  exibida em uma nova seção <strong>Magias</strong> na ficha do
                  parceiro. Treinadores com mais de um melhor amigo (Conquistar
                  pelos Números) agora podem escolher qual companheiro recebe
                  cada truque novo, em vez de o sistema sempre alocar no
                  primeiro.
                </li>
                <li>
                  <strong>
                    Correção: Limite de Poderes da Divindade no wizard.
                  </strong>{' '}
                  No passo <strong>Poderes da Divindade</strong> do wizard de
                  criação manual, era possível marcar todos os poderes da
                  divindade sem qualquer limite. Agora a seleção respeita o
                  campo da classe: Clérigo, Paladino, Druida e Frade escolhem
                  até <strong>2</strong> poderes, e classes que recebem
                  divindade via &quot;Devoto&quot; escolhem até{' '}
                  <strong>1</strong>. Os checkboxes excedentes ficam
                  desabilitados ao atingir o limite, e o passo continua opcional
                  (pode-se avançar com 0 selecionados).
                </li>
                <li>
                  <strong>
                    Correção: Edição de Tabu, Presentes e Dons do Duende.
                  </strong>{' '}
                  O editor de ficha agora permite alterar todas as escolhas de
                  customização do Duende em personagens já criados — antes, só
                  Natureza e Tamanho ficavam editáveis e o restante congelava
                  com o valor inicial. Trocar um Presente recalcula corretamente
                  sentidos e bônus (some o do antigo, entra o do novo); mudar a
                  perícia do Tabu redireciona o −5; e os Dons podem ser
                  realocados entre atributos. Habilidades fixas (Aversão a
                  Ferro/Sinos, Tipo de Criatura) seguem fixas conforme as
                  regras. Salvar fica bloqueado se os atributos dos Dons forem
                  iguais ou se não houver exatamente 3 Presentes selecionados.
                </li>
                <li>
                  <strong>
                    Correção: Iniciativa travada quando o mestre usava fichas
                    próprias.
                  </strong>{' '}
                  Quando o mestre adicionava ao encontro fichas-jogador que ele
                  mesmo controla, o overlay de rolagem de iniciativa abria mas
                  nunca conseguia concluir — a rolagem era ignorada e o mestre
                  ficava preso na tela. Agora o overlay deixa de aparecer para
                  fichas controladas pelo mestre, e ele rola a iniciativa dessas
                  fichas pela própria lista do encontro, no mesmo fluxo das
                  ameaças.
                </li>
                <li>
                  <strong>
                    Correção: Remoção de jogadores travada na Mesa Virtual.
                  </strong>{' '}
                  Em mesas mais antigas, mestres podiam ver um erro ao tentar
                  remover um jogador da lista de membros — o sistema não
                  conseguia localizar o registro mesmo com o jogador visível na
                  tela. A identificação interna dos membros foi normalizada e a
                  remoção agora funciona em todas as mesas. Quando algum estado
                  divergente acontecer no futuro, o frontend atualiza a lista
                  automaticamente e mostra uma mensagem clara em vez do erro
                  genérico.
                </li>
                <li>
                  <strong>
                    Correção: Limite de jogadores da mesa para Apoiadores.
                  </strong>{' '}
                  Mesas criadas antes do upgrade para{' '}
                  <strong>Apoiador Nível 2 ou 3</strong> continuavam exibindo o
                  limite antigo de jogadores na tela de detalhe da mesa, mesmo
                  com a assinatura ativa garantindo número ilimitado. O limite
                  agora é calculado em tempo real a partir do nível de apoio
                  atual do criador da mesa — qualquer mudança de plano (upgrade
                  ou cancelamento) é refletida imediatamente em todas as mesas
                  já existentes.
                </li>
                <li>
                  <strong>
                    Correção: Sincronização de condições entre ficha e encontro.
                  </strong>{' '}
                  Condições aplicadas pelo Mestre via gerenciador do
                  participante agora aparecem imediatamente na ficha do jogador,
                  e condições adicionadas pelo jogador na própria ficha agora
                  aparecem imediatamente no badge do participante para o Mestre
                  e demais jogadores. Antes, cada ponta só via a edição feita no
                  seu próprio lado. Condições do participante também passam a
                  ser persistidas — sobrevivem a restart do servidor e
                  recarregamento da sessão.
                </li>
                <li>
                  <strong>
                    Correção: PV/PM Máximo Manual ressuscitando após apagar.
                  </strong>{' '}
                  Em mesas virtuais, quando o jogador definia um valor de PV ou
                  PM Máximo Manual e depois apagava o campo, o valor antigo
                  voltava ao recarregar a página. A sincronização agora envia
                  explicitamente a deleção do campo para o servidor, e o retorno
                  ao cálculo automático passa a persistir corretamente entre
                  sessões.
                </li>
                <li>
                  <strong>
                    Correção: Nome customizado de armas na aba de Ataques.
                  </strong>{' '}
                  Ao renomear uma arma na mochila (campo{' '}
                  <em>Nome customizado</em> no editor do item), o novo nome
                  agora aparece imediatamente no card de ataque, no log de
                  rolagem de dados, no diálogo de modos de ataque e no aviso de
                  arma não empunhada. Antes, a renomeação só refletia no
                  inventário — útil, por exemplo, para sinalizar &quot;Adaga
                  (Marca da Presa)&quot; e lembrar de aplicar o dano extra a
                  cada acerto.
                </li>
                <li>
                  <strong>Correção:</strong> Aplicar remoção em cascata ao tirar
                  uma modificação no editor — modificações dependentes são
                  removidas respeitando pré-requisitos OR (não removem
                  injustamente quando ainda há outra opção válida).
                </li>
              </ul>
              <h3>4.13</h3>
              <ul>
                <li>
                  <strong>
                    Novo: Dado percentual (d100) no rolador rápido.
                  </strong>{' '}
                  Adicionado ao QuickDiceRoller das mesas de jogo. Mostra
                  valores 00, 10, 20, …, 90 (faces dezenas), seguindo a
                  convenção de dado percentual sem ser clampeado para 1.
                </li>
                <li>
                  <strong>Novo:</strong> <strong>Mochila de Aventureiro</strong>{' '}
                  substitui o drawer monolítico de edição de equipamentos por um{' '}
                  <strong>modal full-screen</strong> com grade visual de cards,
                  ícones e cores por tipo, contagem de quantidade (xN),{' '}
                  <strong>reordenamento por drag-and-drop</strong>,{' '}
                  <strong>busca</strong>, filtros por categoria,{' '}
                  <strong>toggle de agrupamento por categoria</strong> e edição
                  completa de itens em abas (Geral / Estatísticas /
                  Modificações). Itens superiores podem ser aplicados
                  diretamente em armas, armaduras e escudos da mochila com{' '}
                  <strong>aplicação automática dos bônus numéricos</strong>{' '}
                  (Cruel, Atroz, Certeira, Pungente, Maciça, Precisa,
                  Equilibrada, Discreta, Banhada a ouro, Luxuosa, Ajustada e
                  outras). Capacidade de carga (10 + 2×Força) é informada — o
                  jogador <strong>nunca é bloqueado</strong> de adicionar itens,
                  mas vê banner e cards destacados quando sobrecarregado. Cada
                  1.000 moedas conta como 1 espaço.
                </li>
                <li>
                  <strong>Novo: Sistema de empunhadura.</strong> O jogador
                  decide qual item está em cada mão (
                  <strong>Principal / Secundária</strong>). Apenas o{' '}
                  <strong>escudo empunhado</strong> aplica bônus de defesa, e{' '}
                  <strong>armas de duas mãos</strong> ocupam ambos os slots. O
                  controle aparece tanto na Mochila quanto na lista de Ataques
                  (troca rápida sem abrir a mochila). Fichas antigas com 1
                  escudo continuam aplicando bônus automaticamente
                  (compatibilidade retroativa).
                </li>
                <li>
                  <strong>Novo: Múltiplas armaduras e escudos.</strong> A
                  mochila pode guardar várias armaduras e escudos
                  simultaneamente. Apenas a <strong>armadura vestida</strong>{' '}
                  aplica bônus de defesa, penalidade e flag de armadura pesada.
                  Banner de aviso aparece quando há ≥2 armaduras sem nenhuma
                  marcada como vestida.
                </li>
                <li>
                  <strong>Novo: Sistema de munição.</strong> Flechas, Virotes,
                  Balas, Pedras e Bolas de Ferro são rastreadas individualmente
                  na ficha. Ao atacar com uma arma à distância, um diálogo
                  pergunta se o jogador quer{' '}
                  <strong>rolar consumindo munição</strong> ou rolar sem
                  consumir; ao confirmar, a contagem é decrementada. Cada arma
                  com munição mostra uma sub-linha 🎯 com a contagem atual em
                  Ataques. Adicionar 1 stack de munição soma o pack-size correto
                  (20 unidades para Flechas/Virotes/Balas/Pedras, 1 unidade para
                  Bola de Ferro). Pedras (T$ 0) e Bola de Ferro foram
                  adicionadas ao catálogo. Fichas antigas com Flechas/Virotes/
                  Balas migram automaticamente.
                </li>
                <li>
                  <strong>Novo: Modos de ataque alternativos.</strong> Armas com
                  comportamentos diferentes apresentam um{' '}
                  <strong>diálogo de seleção de modo</strong> antes da rolagem,
                  com preview de atk/dano/crítico/atributo de cada modo:
                  <ul>
                    <li>
                      <strong>
                        Adaga, Lança, Machadinha, Tridente, Martelo Leve
                      </strong>{' '}
                      — corpo a corpo (Luta) ou arremessar (Pontaria).
                    </li>
                    <li>
                      <strong>Azagaia</strong> — arremessar como padrão; corpo a
                      corpo com penalidade de -5 no ataque.
                    </li>
                    <li>
                      <strong>Funda</strong> — disparar Pedras (consome munição)
                      ou pedra improvisada com -1 passo de dano (sem munição
                      adequada).
                    </li>
                    <li>
                      <strong>Lança de Fogo</strong> e{' '}
                      <strong>Pistola-Punhal</strong> — corpo a corpo com opção
                      de <strong>acionar mecanismo</strong> (consome 1 Bala,
                      +2d8 / +2d6 se acertar) ou tiro à distância.
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>Novo: Atributo no dano configurável por arma.</strong>{' '}
                  O jogador pode escolher qualquer um dos 6 atributos (Força,
                  Destreza, Constituição, Inteligência, Sabedoria, Carisma) ou{' '}
                  <strong>Nenhum</strong> como atributo somado ao dano, no nível
                  da arma e por modo de ataque (corpo a corpo vs. arremesso).
                  Por padrão, armas corpo a corpo somam <strong>Força</strong> e
                  armas a distância somam <strong>Nenhum</strong>; algumas armas
                  a distância seguem a regra oficial e somam Força (
                  <strong>Funda</strong>, <strong>Arco Longo</strong>,{' '}
                  <strong>Arco de Guerra</strong>, <strong>Balestra</strong>).
                </li>
                <li>
                  <strong>Novo: Aviso ao atacar com arma não empunhada.</strong>{' '}
                  Se a arma clicada não está em nenhuma mão (e a ficha já usa
                  rastreamento de empunhadura), um diálogo oferece{' '}
                  <strong>Empunhar e atacar</strong>,{' '}
                  <strong>Atacar mesmo assim</strong> ou{' '}
                  <strong>Cancelar</strong>.
                </li>
                <li>
                  <strong>Melhoria: Card de Defesa com dois botões.</strong> O
                  botão de <strong>lápis</strong> no card de Defesa agora abre
                  diretamente a <strong>Mochila de Aventureiro</strong> (igual
                  aos cards de Ataques e Equipamentos), facilitando a troca de
                  armadura/escudo empunhado. As configurações finas de defesa
                  (base, atributo usado, bônus manual) ficaram em um novo botão
                  de <strong>engrenagem</strong> ao lado.
                </li>
                <li>
                  <strong>
                    Correção: Requisito do poder Sentidos Aguçados ajustado.
                  </strong>
                </li>
                <li>
                  <strong>
                    Correção: Total das rolagens 3D não duplica mais os dados.
                  </strong>{' '}
                  Grupos &quot;Total&quot; agregados (que repetiam a notação dos
                  grupos anteriores) eram contados em dobro ao processar
                  resultados 3D — agora são identificados como <em>summary</em>{' '}
                  e recalculados a partir dos grupos individuais.
                </li>
              </ul>

              <h3>4.12</h3>
              <ul>
                <li>
                  <strong>Novo:</strong> Campo de{' '}
                  <strong>busca de equipamentos</strong> dentro de cada
                  categoria do drawer de editar itens (Armas, Armadura, Escudo,
                  Itens Gerais, Esotéricos, Vestuário, Alquimia, Alimentação e
                  Animais). A busca filtra por nome com{' '}
                  <strong>debounce de 300ms</strong>, é insensível a acentos
                  (digitar &quot;espada&quot; encontra &quot;Espada Longa&quot;
                  e similares) e esconde subcategorias vazias para evitar
                  scrolls longos — útil principalmente em mobile, onde a maioria
                  dos jogadores usa o app na mesa.
                </li>
                <li>
                  <strong>Novo:</strong> <strong>Foco em Arma</strong>,{' '}
                  <strong>Especialização em Arma</strong>,{' '}
                  <strong>Mestre em Arma</strong> e <strong>Arma Amada</strong>{' '}
                  agora aplicam seus bônus mecânicos automaticamente na arma
                  escolhida — +2 em ataque para Foco em Arma, +2 em dano para
                  Especialização em Arma e Arma Amada, e{' '}
                  <strong>aumento de um passo no dado de dano</strong> (1d8 →
                  1d10, 1d12 → 3d6, etc.) para Mestre em Arma. Foco em Arma e
                  Especialização em Arma podem ser pegos várias vezes para armas
                  diferentes; cada instância tem sua própria seleção. A escolha
                  é <strong>opcional</strong> no momento de pegar o poder e pode
                  ser feita ou trocada <strong>a qualquer momento</strong>{' '}
                  através do botão de mira no accordion do poder na ficha. Só é
                  possível escolher armas já presentes na ficha. Armas com bônus
                  aplicado mostram um ícone com tooltip listando os efeitos
                  ativos. Fichas antigas recebem a feature automaticamente sem
                  precisar regerar.
                </li>
                <li>
                  <strong>Correção:</strong> Ao editar uma{' '}
                  <strong>armadura ou escudo</strong> pela edição de
                  equipamentos, a <strong>defesa total</strong> deixava cair
                  silenciosamente o <strong>bônus manual</strong> e os{' '}
                  <strong>bônus vindos de poderes</strong> (como{' '}
                  <strong>Carapaça</strong>, <strong>Encouraçado</strong> e{' '}
                  <strong>Defesa Armada</strong>), passando a mostrar apenas
                  base + armadura + escudo + atributo. Agora o recálculo após
                  salvar preserva todos os bônus.
                </li>
                <li>
                  <strong>Correção:</strong> O poder <strong>Familiar</strong>{' '}
                  (Arcanista) agora <strong>persiste a escolha</strong> entre
                  acessos e edições da ficha. Antes, o familiar selecionado era
                  trocado por outro aleatório a cada edição (aplicar uma
                  condição, alterar equipamento, defesa etc.), o que também
                  fazia o <strong>+2 em Furtividade do Gato</strong> sumir
                  silenciosamente. A mesma correção foi aplicada à{' '}
                  <strong>Especialização em Arma</strong> (Guerreiro) e ao{' '}
                  <strong>Animal Totêmico</strong> (Bárbaro), que tinham o mesmo
                  bug estrutural. Fichas antigas recuperam a escolha
                  automaticamente a partir do texto do poder.
                </li>
                <li>
                  <strong>Correção:</strong> Estabilidade da{' '}
                  <strong>Mesa Virtual no iOS Safari</strong> — afrouxado o
                  ping/pong de WebSocket para tolerar jitter móvel, adicionados
                  handlers de pageshow/pagehide para restaurar a sessão saindo
                  do BFCache (bloqueio/troca de app), watchdog para detectar
                  polling preso e logs com User-Agent para diagnóstico. Agora a
                  conexão se recupera sozinha quando o jogador volta ao app
                  depois de bloquear o celular ou trocar de aba.
                </li>
                <li>
                  <strong>Correção:</strong> Várias habilidades passivas de
                  classe que eram apenas descritivas agora aplicam seus bônus
                  mecânicos automaticamente na ficha:
                  <ul>
                    <li>
                      <strong>Casca Grossa</strong> (Lutador / Atleta): soma{' '}
                      <strong>Constituição</strong> (limitada pelo nível da
                      classe) na Defesa quando sem armadura pesada, com{' '}
                      <strong>+1 cumulativo</strong> a cada 4 níveis a partir do
                      7º.
                    </li>
                    <li>
                      <strong>Insolência</strong> (Bucaneiro 1): soma{' '}
                      <strong>Carisma</strong> (limitado pelo nível de
                      Bucaneiro) na Defesa.
                    </li>
                    <li>
                      <strong>Braços Calejados</strong> (Lutador, poder): soma{' '}
                      <strong>Força</strong> (limitada pelo nível de Lutador) na
                      Defesa.
                    </li>
                    <li>
                      <strong>Defesa Estratégica</strong> (Guerreiro de Heróis
                      de Arton): soma <strong>Inteligência</strong> (limitada
                      pelo nível de Guerreiro) na Defesa.
                    </li>
                    <li>
                      <strong>Resistência a Dano</strong> (Bárbaro 5): aplica
                      Redução de Dano Geral, escalonando até <strong>10</strong>{' '}
                      no 19º nível.
                    </li>
                    <li>
                      <strong>Pele de Ferro</strong> (poder de Bárbaro): aplica{' '}
                      <strong>+4 Defesa</strong>.
                    </li>
                    <li>
                      <strong>Discrição Divina</strong> (Usurpador 3): aplica{' '}
                      <strong>+1</strong> em Furtividade, Fortitude, Reflexos e
                      Vontade, escalonando com o nível.
                    </li>
                    <li>
                      <strong>Resiliência Primal</strong> (Machado de Pedra 5):
                      aplica Redução de Dano Geral, escalonando até{' '}
                      <strong>15</strong>.
                    </li>
                    <li>
                      <strong>Esquiva Sagaz</strong> (Bucaneiro 3) e{' '}
                      <strong>Instinto Selvagem</strong> (Bárbaro 3) agora
                      respeitam o <strong>nível da classe</strong> em
                      multiclasse, em vez do nível total do personagem.
                    </li>
                  </ul>
                </li>
              </ul>

              <h3>4.11.1</h3>
              <ul>
                <li>
                  <strong>Correção:</strong> Condições como{' '}
                  <strong>Esmorecido</strong>, <strong>Frustrado</strong>,{' '}
                  <strong>Fraco</strong> e <strong>Debilitado</strong> não
                  alteram mais permanentemente os atributos da ficha. Antes, a
                  penalidade era gravada no valor base do atributo, o que vazava
                  para <strong>PM máximo</strong>, <strong>Defesa</strong>,{' '}
                  <strong>PV</strong> e capacidade de carga, podendo deixar a
                  ficha corrompida (atributos &quot;dobrando&quot; ao
                  remover/reaplicar a condição). Agora a penalidade é puramente
                  temporária: aparece apenas no rótulo do atributo e nas
                  rolagens (testes de atributo e perícias derivadas),
                  desaparecendo imediatamente ao remover a condição. Fichas que
                  já estavam corrompidas são saneadas automaticamente no
                  primeiro carregamento — atributos manualmente inflados podem
                  precisar de um ajuste pontual.
                </li>
                <li>
                  <strong>Correção:</strong> Corrigida a descrição do poder{' '}
                  <strong>Ataque com Escudo</strong>, que estava exibindo o
                  texto de outro poder (relacionado a armas de arremesso). Agora
                  mostra o efeito correto do RAW: ataque corpo a corpo extra com
                  o escudo gastando 1 PM ao usar a ação agredir, sem perder o
                  bônus de Defesa do escudo.
                </li>
              </ul>

              <h3>4.11</h3>
              <ul>
                <li>
                  <strong>Correção:</strong> Corrigida a{' '}
                  <strong>exportação de PDF</strong> que falhava silenciosamente
                  em fichas com emojis ou caracteres especiais nos textos de
                  poderes (caso típico: poder <strong>Golpe Pessoal</strong> com
                  o ícone 💠 no resumo de custo). A geração agora sanitiza o
                  texto antes de gravar nos campos do PDF, e erros eventuais
                  passam a ser logados no console do navegador para facilitar o
                  diagnóstico.
                </li>
                <li>
                  <strong>Novo:</strong> No editor de ameaças, cada{' '}
                  <strong>habilidade</strong>, <strong>ataque</strong> e{' '}
                  <strong>magia</strong> agora pode declarar uma ou mais{' '}
                  <strong>condições concedidas</strong> (abalado, desprevenido,
                  atordoado, agarrado etc.). A ficha da ameaça mostra as
                  condições anotadas como chips no fim da linha (&quot;Concede:
                  ...&quot;), e na <strong>Mesa Virtual</strong> aparece um
                  botão <strong>&quot;Aplicar condição&quot;</strong> ao lado
                  apenas dos itens anotados. O mestre clica → abre um modal já
                  com as condições pré-selecionadas → marca quais jogadores
                  recebem (ou cancela) → aplica direto na ficha de cada um, com
                  cascata automática de implicações (ex.: <em>cego</em> também
                  aplica <em>desprevenido</em> e <em>lento</em>). Disponível
                  apenas para o mestre durante encontros ativos.
                </li>
                <li>
                  <strong>Correção:</strong> Adicionado um botão{' '}
                  <strong>&quot;Atualizar dados&quot;</strong> no diálogo da
                  ameaça na <strong>Mesa Virtual</strong>. Ao importar uma
                  ameaça, a mesa guarda um snapshot estático — edições
                  posteriores na ameaça original não eram refletidas. O novo
                  botão re-sincroniza o snapshot com a versão atual da nuvem
                  (corrigindo também dois bugs no backend: a resposta do
                  endpoint de update vinha com formato errado e mutações no
                  campo Mongoose Mixed não eram persistidas sem{' '}
                  <code>markModified</code>).
                </li>
                <li>
                  <strong>Novo:</strong> O poder <strong>Paródia</strong>{' '}
                  (Bardo) agora tem um ícone de busca ao lado do nome no
                  accordion: ao clicar, abre um modal para pesquisar entre todas
                  as magias do sistema (filtros por círculo e por tipo
                  arcana/divina), ver os detalhes da magia escolhida e lançá-la
                  diretamente — com seleção de aprimoramentos e gasto de PM
                  igual às magias da ficha.
                </li>
                <li>
                  <strong>Melhoria:</strong> Nas páginas{' '}
                  <strong>Meus Personagens</strong> e{' '}
                  <strong>Minhas Ameaças</strong>, os cards de fichas/ameaças
                  agora aparecem antes das pastas, deixando o acesso aos itens
                  mais imediato (as pastas e o card &quot;Nova pasta&quot; ficam
                  logo abaixo).
                </li>
                <li>
                  <strong>Novo:</strong> Adicionado seletor de{' '}
                  <strong>Perícia de Ataque</strong> no editor de armas. Por
                  padrão, armas corpo a corpo continuam usando{' '}
                  <strong>Luta</strong> e armas à distância usam{' '}
                  <strong>Pontaria</strong>, mas agora é possível escolher
                  qualquer outra perícia para o teste de ataque de uma arma
                  específica &mdash; útil para poderes/magias como{' '}
                  <strong>Esgrima Mágica</strong> (Atuação no lugar de Luta) e
                  efeitos similares. O bônus de dano continua seguindo a regra
                  padrão (corpo a corpo soma Força).
                </li>
                <li>
                  <strong>Correção:</strong> Estendida a migração que remove{' '}
                  <strong>Canalizar Reparos</strong> de fichas antigas de{' '}
                  <strong>Golem Desperto</strong> (criadas antes do fix do
                  chassi). Agora, além de limpar a habilidade da raça, também
                  remove o registro residual no histórico da ficha, evitando que
                  o poder reapareça em painéis e validações que consultam o
                  histórico de ações.
                </li>
                <li>
                  <strong>Correção:</strong> Corrigido o pré-requisito do poder{' '}
                  <strong>Magia Acelerada</strong>, que aceitava qualquer
                  conjurador (inclusive de 1º círculo). Agora exige{' '}
                  <strong>lançar magias de 2º círculo</strong>, conforme a regra
                  oficial.
                </li>
                <li>
                  <strong>Correção:</strong> Corrigido o cálculo do bônus de{' '}
                  <strong>iniciativa de ameaças</strong> na{' '}
                  <strong>Mesa Virtual</strong>, que estava saindo sempre
                  negativo (independentemente do modificador da ameaça). Agora o
                  sistema usa a perícia <strong>Iniciativa</strong> da ficha da
                  ameaça, considerando treino, bônus customizados e overrides
                  manuais &mdash; igual ao comportamento das fichas de
                  jogadores.
                </li>
                <li>
                  <strong>Correção:</strong> Permitido salvar armas com{' '}
                  <strong>Espaço 0</strong> ao editar pelo drawer de
                  equipamentos. O valor estava sendo convertido silenciosamente
                  para 1, impedindo cadastrar itens muito pequenos/leves.
                </li>
                <li>
                  <strong>Correção:</strong> Corrigida a área de{' '}
                  <strong>Condições</strong> no cabeçalho da ficha: em
                  personagens com <strong>Divindade</strong>, o botão de
                  adicionar condição e os chips ativos ficavam atrás dos
                  atributos e não respondiam aos cliques.
                </li>
                <li>
                  <strong>Correção:</strong> Corrigido o background do título{' '}
                  <strong>&quot;Defesa&quot;</strong> na ficha, que aparecia
                  quebrado/encolhido em telas de baixa resolução (mobile). Agora
                  o layout segue o mesmo padrão dos demais títulos como
                  &quot;Ataques&quot; e &quot;Proficiências&quot;.
                </li>
                <li>
                  <strong>Melhoria:</strong> O título{' '}
                  <strong>&quot;Condições&quot;</strong> no cabeçalho da ficha
                  agora usa a mesma fonte e cor dos demais labels (Nível,
                  Origem, Divindade), integrando-se visualmente ao bloco de
                  informações do personagem.
                </li>
                <li>
                  <strong>Correção:</strong> A habilidade{' '}
                  <strong>Sapiência</strong> do <strong>Moreau Coruja</strong>{' '}
                  agora permite escolher a magia de 1º círculo de Adivinhação,
                  tanto na criação (novo passo no wizard) quanto em fichas já
                  geradas (seletor adicionado à customização do Moreau e ao
                  drawer de informações). Antes a magia era sorteada
                  automaticamente (e voltava sozinha após cada edição). A magia
                  agora também é tratada como fixa no drawer de magias: não pode
                  ser removida diretamente — para trocá-la, basta editar a
                  customização do Moreau.
                </li>
                <li>
                  <strong>Correção:</strong> Seleções manuais em poderes
                  repetíveis escolhidos durante o <strong>level-up</strong> não
                  eram salvas na ficha a partir da segunda escolha. Afetava{' '}
                  <strong>Aumentar Repertório</strong> (Bardo) — as 2 magias
                  selecionadas eram ignoradas — e{' '}
                  <strong>Aumento de Atributo</strong> — o atributo escolhido
                  não recebia o +1. Cada nova escolha agora aplica corretamente
                  os efeitos.
                </li>
              </ul>

              <h3>4.10</h3>
              <p>
                A segunda feature mais votada pelos apoiadores chegou! Como no
                ciclo anterior da Multiclasse, essa é a{' '}
                <strong>super feature</strong> desta update.
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
                  gutterBottom
                  sx={{
                    fontWeight: 'bold',
                    color: 'success.dark',
                  }}
                >
                  Condições (Status Effects)
                </Typography>
                <Typography variant='body1' sx={{ mb: 1 }}>
                  O catálogo completo das <strong>33 condições oficiais</strong>{' '}
                  do Tormenta 20 (Abalado, Cego, Caído, Debilitado,
                  Desprevenido, Paralisado, Petrificado, Envenenado…) agora está
                  integrado às fichas e à mesa virtual. Ao aplicar uma condição,
                  a ficha reflete automaticamente as penalidades — Defesa,
                  perícias, atributos, ataques e deslocamento são recalculados,
                  e os valores afetados ganham destaque visual (ícone + cor da
                  categoria + tooltip explicativo).
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'text.secondary',
                    mb: 1,
                  }}
                >
                  <strong>Cascata inteligente:</strong> condições que
                  &quot;contêm&quot; outras aplicam as derivadas automaticamente
                  (aplicar Cego já ativa Desprevenido e Lento; Paralisado já
                  ativa Imóvel e Indefeso; Petrificado já ativa Inconsciente).
                  As derivadas aparecem marcadas como implícitas e são removidas
                  junto com a raiz.
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'text.secondary',
                    mb: 1,
                  }}
                >
                  <strong>Regra oficial de não-acúmulo:</strong> condições com
                  mesmo efeito não empilham — Desprevenido (−5 Defesa) +
                  Vulnerável (−2 Defesa) resulta em −5, não −7. O sistema aplica
                  automaticamente a penalidade mais severa por alvo.
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'text.secondary',
                  }}
                >
                  <strong>Integração total com mesa virtual:</strong> o mestre
                  pode aplicar condições em qualquer combatente direto da tela
                  de combate (jogadores, ameaças ou combatentes manuais). Para
                  jogadores, a edição propaga à ficha via socket. No início de
                  cada turno, um popup lembra o mestre e o dono da ficha das
                  condições ativas do combatente, com nome e texto integral de
                  cada uma. Badges por combatente na lista de iniciativa dão
                  visibilidade constante. É uma feature exclusiva para
                  apoiadores.
                </Typography>
              </Alert>

              <ul>
                <li>
                  <strong>Novo:</strong> Usuários agora podem{' '}
                  <strong>editar os próprios posts e comentários</strong> no
                  fórum. Comentários têm edição inline direto no card (com
                  suporte a menções da enciclopédia), e posts continuam sendo
                  editados pela página dedicada. Um indicador discreto &quot;·
                  editado&quot; aparece ao lado da data, com tooltip mostrando
                  quando o conteúdo foi alterado. Threads travadas bloqueiam
                  edição para usuários comuns, e moderadores também podem editar
                  conteúdo alheio.
                </li>
                <li>
                  <strong>Novo:</strong> Na mesa virtual, o mestre agora pode{' '}
                  <strong>adicionar fichas da própria conta</strong> como
                  personagens da mesa — útil para rodar a ferramenta solo, sem
                  depender de jogadores reais usarem o sistema. As fichas
                  adicionadas funcionam como jogadores normais (aparecem nos
                  encontros, rolam iniciativa, tomam dano), ficam ocultas para
                  os jogadores reais da mesa e, como qualquer ficha vinculada,
                  ficam exclusivas a uma mesa por vez (para usar em outra,
                  duplique).
                </li>
                <li>
                  <strong>Novo:</strong> Personagens que multclassam em{' '}
                  <strong>Treinador</strong> pelo Level Up agora recebem um
                  passo dedicado para criar o Melhor Amigo — antes, a criação só
                  acontecia quando Treinador era a classe principal na criação
                  da ficha, e quem pegava a classe via multiclasse ficava sem
                  parceiro.
                </li>
                <li>
                  <strong>Novo:</strong> A ficha agora permite{' '}
                  <strong>adicionar e remover Melhor Amigos</strong> a qualquer
                  momento. No modal do parceiro, um botão &quot;+&quot; abre o
                  fluxo de criação e uma lixeira remove o companheiro atual (com
                  confirmação). Quando há mais de um parceiro, o topo do modal
                  mostra abas para alternar entre eles — útil pra Treinadores
                  com Treino Especializado ou cenários especiais do mestre.
                </li>
                <li>
                  <strong>Novo:</strong> Nas mesas virtuais, ao adicionar um
                  novo combatente a um encontro ativo, o mestre agora pode
                  escolher entre <strong>Importar Ameaça</strong> (selecionando
                  direto entre as ameaças já vinculadas à mesa, com stats
                  preenchidos automaticamente e numeração de instâncias como
                  &quot;Bandido 2&quot;) ou <strong>Personalizado</strong>. No
                  modo Personalizado, é possível marcar o combatente como{' '}
                  <strong>Ameaça ou Jogador</strong> — útil para recepcionar um
                  jogador que entrou no meio do combate ou adicionar um NPC
                  aliado sem controle de PV.
                </li>
                <li>
                  <strong>Melhoria:</strong> No <strong>Wyrt</strong> online, ao
                  fim de cada rodada as{' '}
                  <strong>cartas de todos os jogadores</strong> são reveladas no
                  resumo — antes só aparecia o total por cor, e agora dá pra ver
                  exatamente quais cartas compuseram a soma de cada oponente.
                </li>
                <li>
                  <strong>Melhoria:</strong> Fichas antigas que multclassaram em
                  Treinador antes dessa atualização agora podem criar o Melhor
                  Amigo diretamente da ficha, clicando na habilidade
                  &quot;Melhor Amigo&quot; na lista de poderes.
                </li>
                <li>
                  <strong>Correção:</strong> No <strong>Wyrt</strong>, quando o
                  último jogador aceitava ou recusava o dobro, a notificação
                  podia ficar presa na tela e travar a partida — bots paravam de
                  jogar e a tela ficava escurecida com o overlay no meio. O
                  problema era de ciclo de vida do timer da notificação, que era
                  cancelado quando a fase mudava enquanto o aviso ainda estava
                  visível.
                </li>
                <li>
                  <strong>Correção:</strong> O poder de destino{' '}
                  <strong>Impostor</strong> exigia &quot;Foco em Perícia
                  (Enganação)&quot; como pré-requisito, o que impedia a seleção
                  mesmo quando o personagem já possuía Foco em Perícia em outra
                  perícia. O pré-requisito foi corrigido para &quot;Foco em
                  Perícia&quot; (qualquer).
                </li>
                <li>
                  <strong>Correção:</strong> Os poderes de classe{' '}
                  <strong>Precisão Furtiva</strong> (Ladino),{' '}
                  <strong>Cavaleiro Bandido</strong> (Cavaleiro) e{' '}
                  <strong>Explorar Fraqueza</strong> (Inventor) não apareciam
                  como selecionáveis mesmo quando o personagem cumpria todos os
                  requisitos. O tipo dos pré-requisitos estava marcado como
                  &quot;poder&quot; em vez de &quot;habilidade&quot;, e a
                  validação procurava as habilidades de classe (Ataque Furtivo,
                  Código de Honra, Duelo, Encontrar Fraqueza) no lugar errado.
                </li>
                <li>
                  <strong>Correção:</strong> A descrição da magia{' '}
                  <strong>Ligação Telepática</strong> exibia o requisito de
                  Inteligência como &quot;3 ou maior&quot;, quando o valor
                  correto no livro é &quot;–4 ou maior&quot;.
                </li>
                <li>
                  <strong>Correção:</strong> No editor de poderes de personagens
                  multiclasse, as <strong>habilidades de classe</strong> das
                  classes secundárias não apareciam — apenas as da classe
                  inicial. Cada classe agora ganha sua própria seção, e as
                  habilidades são filtradas pelo nível específico daquela classe
                  (não pelo nível total do personagem).
                </li>
                <li>
                  <strong>Correção:</strong> O poder concedido{' '}
                  <strong>Armas da Ambição</strong> (Valkaria) aplicava o +1 no
                  multiplicador de crítico (ex.: x2 → x3) em vez da margem de
                  ameaça (ex.: 19-20 → 18-20). Os poderes{' '}
                  <strong>Tradição de Lin-Wu</strong>,{' '}
                  <strong>Arsenal das profundezas</strong> e{' '}
                  <strong>Armas da Destruição</strong> também foram revisados
                  para garantir que cada um modifique a parte correta do crítico
                  da arma.
                </li>
                <li>
                  <strong>Correção:</strong> O <strong>Golem Desperto</strong>{' '}
                  (Inventor) tinha seu deslocamento fixado em 6m na ficha,
                  ignorando as reduções por sobrepeso e armadura pesada. Além
                  disso, a habilidade <strong>Canalizar Reparos</strong>{' '}
                  aparecia residualmente após o Golem Desperto ser escolhido,
                  mesmo não existindo mais como opção nesse caminho.
                </li>
              </ul>

              <h3>4.9</h3>
              <ul>
                <li>
                  <strong>Novo:</strong> Comentários no fórum, nas builds e nos
                  posts do blog agora estão disponíveis para todos os usuários
                  logados. Apoiadores (Aventureiros, Paladinos e Nimbianos) têm
                  prioridade visual com badges e destaques em seus comentários.
                </li>
                <li>
                  <strong>Novo:</strong> Agora é possível arrastar e soltar
                  fichas e ameaças para dentro das pastas! Basta arrastar um
                  card pelo ícone de arrastar e soltá-lo sobre a pasta desejada.
                  Dentro de uma pasta, ao arrastar um card aparece uma zona de
                  soltar para remover a ficha da pasta. O botão de mover
                  continua funcionando como alternativa.
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
                  <strong>Novo:</strong> Agora é possível exportar um PDF com
                  múltiplas ameaças de uma só vez! Na aba Ameaças de Meus
                  Personagens, clique em &quot;Selecionar&quot;, marque as
                  ameaças desejadas e clique em &quot;Exportar PDF&quot;. Todas
                  as fichas de ameaça selecionadas serão geradas em um único
                  documento. Recurso disponível para apoiadores.
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
                  <strong>Melhoria:</strong> Comentários no fórum agora podem
                  ser aninhados sem limite de profundidade. Antes, o máximo era
                  3 níveis. A partir do quinto nível, a indentação visual para
                  de aumentar e os comentários ficam alinhados, evitando que
                  fiquem espremidos na tela.
                </li>
                <li>
                  <strong>Melhoria:</strong> Agora é possível editar ataques,
                  habilidades e magias já adicionados no gerador de ameaças. Um
                  botão de editar aparece ao lado de cada item na lista, abrindo
                  um dialog com todos os campos preenchidos para alteração.
                  Antes era necessário excluir e recriar o item do zero para
                  alterar qualquer campo.
                </li>
                <li>
                  <strong>Melhoria:</strong> Quando o mestre ativa o modo de
                  rolagens privadas na mesa virtual, os PVs e PMs dos inimigos
                  no controlador de encontros agora ficam ocultos para os
                  jogadores. Isso permite que o mestre controle quais
                  informações os jogadores podem ver durante o combate.
                </li>
                <li>
                  <strong>Melhoria:</strong> Ao visualizar uma ficha ou ameaça
                  que está em uma pasta, os breadcrumbs agora mostram o caminho
                  completo: Home &gt; Meus Personagens &gt; Nome da Pasta &gt;
                  Ficha. Cada segmento é clicável e leva de volta à pasta ou
                  tela correspondente.
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
                  <strong>Melhoria:</strong> Agora é possível definir atributos
                  base com valores de até 50 (antes o limite era 10). A mudança
                  vale tanto para a criação de personagem pelo wizard quanto
                  para a edição de fichas existentes.
                </li>
                <li>
                  <strong>Correção:</strong> Corrigido o drawer de edição de
                  poderes para personagens com multiclasse. Antes, apenas os
                  poderes da classe primária apareciam no accordion. Agora, cada
                  classe do multiclasse tem seu próprio accordion de poderes
                  (ex: &quot;Poderes de Lutador&quot; e &quot;Poderes de
                  Ladino&quot;), permitindo adicionar e remover poderes de todas
                  as classes.
                </li>
                <li>
                  <strong>Correção:</strong> Corrigido o deslocamento do Golem.
                  A habilidade Chassi agora respeita a regra oficial: o
                  deslocamento é fixo em 6m e não é reduzido por uso de armadura
                  ou excesso de carga. Antes, o sobrepeso reduzia o deslocamento
                  indevidamente. A mesma correção foi aplicada ao Golem Desperto
                  para os chassis que possuem essa imunidade (Bronze, Carne,
                  Ferro, Gelo Eterno, Pedra e Sucata).
                </li>
                <li>
                  <strong>Correção:</strong> A Linhagem Abençoada do suplemento
                  Deuses de Arton agora aparece corretamente na geração
                  aleatória de fichas e no wizard de level-up/multiclasse. Antes
                  ela só estava disponível no wizard de criação passo a passo.
                </li>
                <li>
                  <strong>Correção:</strong> Editar e salvar uma ficha ou ameaça
                  que estava dentro de uma pasta não a remove mais da pasta.
                  Antes, ao salvar qualquer edição, a ficha voltava para a raiz
                  e era necessário movê-la novamente.
                </li>
                <li>
                  <strong>Correção:</strong> Corrigido o scroll do drawer de
                  edição de magias. Antes, ao adicionar magias personalizadas, a
                  lista de magias disponíveis era empurrada para fora da tela,
                  impossibilitando a seleção de novas magias. Agora toda a seção
                  (magias personalizadas, selecionadas e círculos) rola em
                  conjunto, mantendo o cabeçalho e os botões fixos.
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
                  <strong>Correção:</strong> Constituição negativa agora reduz
                  os PVs corretamente. Antes, personagens com CON negativa
                  recebiam PV como se tivessem CON 0. Agora o modificador
                  negativo é aplicado, respeitando o ganho mínimo de 1 PV por
                  nível. A correção vale para fichas normais, multiclasse e
                  poderes como Dom da Esperança.
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
                  gutterBottom
                  sx={{
                    fontWeight: 'bold',
                    color: 'success.dark',
                  }}
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
                  gutterBottom
                  sx={{
                    fontWeight: 'bold',
                    color: 'success.dark',
                  }}
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
                <Typography
                  variant='body2'
                  sx={{
                    color: 'text.secondary',
                  }}
                >
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
