import styled from '@emotion/styled';
import {
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React, { useEffect, useState } from 'react';

import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';

interface Heads {
  id: string;
  title: string;
  items?: Heads[];
}

interface HInterface {
  headings: Heads[];
}

const getNestedHeadings = (headingElements: HTMLElement[]) => {
  const nestedHeadings: Heads[] = [];

  headingElements.forEach((heading) => {
    const { innerText: title, id } = heading;

    if (heading.nodeName === 'H2') {
      nestedHeadings.push({ id, title, items: [] });
    } else if (heading.nodeName === 'H3' && nestedHeadings.length > 0) {
      nestedHeadings[nestedHeadings.length - 1].items?.push({
        id,
        title,
      });
    }
  });

  return nestedHeadings;
};

const useHeadingsData = () => {
  const [nestedHeadings, setNestedHeadings] = useState<Heads[]>([]);

  useEffect(() => {
    const headingElements = Array.from(
      document.querySelectorAll('h2, h3')
    ) as HTMLElement[];

    const newNestedHeadings = getNestedHeadings(headingElements);
    setNestedHeadings(newNestedHeadings);
  }, []);

  return { nestedHeadings };
};

const Headings: React.FC<HInterface> = ({ headings }) => (
  <Paper sx={{ mt: 2, ml: 2, p: 3 }}>
    <List
      sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
      component='nav'
      aria-labelledby='nested-list-subheader'
      subheader={
        <ListSubheader component='div' id='nested-list-subheader'>
          Caverna do Saber
        </ListSubheader>
      }
    >
      {headings.map((heading) => (
        <>
          <ListItemButton>
            <ListItemText
              primary={heading.title}
              onClick={(e) => {
                e.preventDefault();
                document.querySelector(`#${heading.id}`)?.scrollIntoView({
                  behavior: 'smooth',
                });
              }}
            />
          </ListItemButton>
          {heading.items && heading.items.length > 0 && (
            <List component='div' disablePadding>
              {heading.items?.map((child) => (
                <ListItemButton sx={{ pl: 4 }}>
                  <ListItemIcon>
                    <SubdirectoryArrowRightIcon fontSize='small' />
                  </ListItemIcon>
                  <ListItemText
                    primary={child.title}
                    onClick={(e) => {
                      e.preventDefault();
                      document.querySelector(`#${child.id}`)?.scrollIntoView({
                        behavior: 'smooth',
                      });
                    }}
                  />
                </ListItemButton>
              ))}
            </List>
          )}
        </>
      ))}
    </List>
  </Paper>
);

const TableOfContents: React.FC = () => {
  const { nestedHeadings } = useHeadingsData();

  const Nav = styled.nav`
    position: sticky;
    position: -webkit-sticky;
    top: 1%;

    max-height: calc(100vh - 40px);
    overflow: auto;
    width: 30%;
  `;

  return (
    <Nav aria-label='Sumário'>
      <Headings headings={nestedHeadings} />
    </Nav>
  );
};

const CavernaDoSaber: React.FC = () => {
  const theme = useTheme();

  const isMobile = useMediaQuery('(max-width:720px)');

  const MainDiv = styled.div`
    margin: 0 50px;
  `;

  const StyledPaper = styled(Paper)`
    padding: 16px;
    margin: 20px 0;
  `;

  const Title = styled.h2`
    font-family: 'Tfont';
    color: ${theme.palette.primary.main};
  `;

  const SubTitle = styled.h3`
    font-family: 'Tfont';
    color: ${theme.palette.primary.light};
  `;

  const Db = styled.strong`
    color: ${theme.palette.primary.main};
  `;

  return (
    <MainDiv>
      <Typography
        fontFamily='Tfont'
        fontSize={50}
        color={theme.palette.primary.main}
        align='center'
      >
        Caverna do Saber
      </Typography>
      <Stack direction='row' alignItems='flex-start'>
        <div style={{ maxWidth: isMobile ? '100%' : '70%' }}>
          <StyledPaper sx={{ mt: 3, p: 2 }}>
            <p>
              Boas-vindas à{' '}
              <strong
                style={{
                  color: theme.palette.primary.main,
                  fontSize: '20px',
                  fontFamily: 'Tfont',
                }}
              >
                Caverna do Saber
              </strong>
              . Esse índice vai apresentar material de jogo em fase de teste,
              que está sendo trabalhado pela equipe de game design e pode{' '}
              <strong>(ou não)</strong> ser inserido em futuros suplementos da
              franquia, disponíveis na revista Dragão Brasil. Todas as regras
              indexadas aqui são opcionais e podem apresentar mudanças caso
              publicadas oficialmente.
            </p>
            <p>
              <small>
                Com o lançamento de diversos suplementos, muitos dos conteúdos
                apresentados em fase de testes na revista foram adicionados
                oficialmente ao sistema através de livros como{' '}
                <strong>Ameaças de Arton</strong>. Sempre que possível, um
                conteúdo já adicionado oficialmente aos suplementos estará
                marcado com este símbolo: 📖. Dessa forma você sabe que existe
                uma versão atualizada e oficial deste conteúdo.
              </small>
            </p>
            <p>
              Para ler o conteúdo, você precisará ser assinante da revista
              Dragão Brasil. Você pode fazer isso legalmente apoiando o projeto{' '}
              <a
                href='https://apoia.se/dragaobrasil'
                target='_blank'
                rel='noreferrer'
              >
                clicando aqui
              </a>
              .
            </p>
            <p>
              <small>
                <strong>Revistas analisadas: DB #156 até #205.</strong>
              </small>
            </p>
            <p>
              <small>
                Se acredita que está faltando alguma coisa interessante das
                revistas já analisadas, crie um tópico{' '}
                <a href='https://github.com/YuriAlessandro/gerador-ficha-tormenta20/discussions'>
                  aqui
                </a>
                .
              </small>
            </p>
          </StyledPaper>
          <StyledPaper>
            <Title id='atributos'>Atributos</Title>
            <p>
              Novos usos de perícias relacionadas aos atributos foram
              adicionados na
              <Db> DB #177</Db>.
            </p>
            <ul>
              <li>Dedução (Inteligência)</li>
              <li>Prudência (Sabedoria)</li>
              <li>Sedução (Carisma)</li>
            </ul>
            <Divider />
            <Title id='perfis-de-personagem'>Perfis de Personagem</Title>
            <p>
              Perfis de personagem foram discutidos na <Db>DB #176</Db>.
            </p>
            <ul>
              <li>Diplomático</li>
              <li>Empático</li>
              <li>Genial</li>
              <li>Impulsivo</li>
              <li>Indiferente</li>
              <li>Perspicaz</li>
              <li>Prudente</li>
              <li>Racional</li>
            </ul>
            <Divider />
            <Title id='traços-do-personagem'>Traços do personagem</Title>
            <p>
              Traços do personagens são aspectos interpretativos do personagem,
              definidos com boas regras na <Db>DB #158</Db>.
            </p>
            <ul>
              <li>Traços Racionais (Inteligência)</li>
              <li>Traços Emocionais (Sabedoria)</li>
              <li>Traços Sociais (Carisma)</li>
            </ul>
            <Divider />
            <Title id='indole'>Índole</Title>
            <p>
              Sistema de pontos especiais que podem ser usados para aprimorar
              testes mal-sucedidos, recuperar pontos de mana e até mesmo evitar
              a morte disponível na <Db>DB #193</Db>.
            </p>
            <ul>
              <li>
                <strong>Akzath</strong>, dos povos goblinoides de Lamnor.
              </li>
              <li>
                <strong>Bravura</strong>, o norte para a maior parte dos
                aventureiros de Arton, em especial os que vivem no Reinado e nas
                terras vizinhas.
              </li>
              <li>
                <strong>Honra</strong>, valorizada na terra dos samurais de
                Lin-Wu, o Império de Jade.
              </li>
              <li>
                <strong>Instinto</strong>, a índole da distante Moreania, onde
                os povos descendem milagrosamente da natureza.
              </li>
              <li>
                <strong>Lamento</strong>, a melancolia de muitos elfos da antiga
                Lenórienn.
              </li>
              <li>
                <strong>Liberdade</strong>, a índole de todos aqueles que
                tiveram seus gritos calados por tanto tempo no Império de Tauron
                — e em qualquer outro lugar.
              </li>
              <li>
                <strong>Teimosia</strong>, dos persistentes anões de Doherimm.
              </li>
            </ul>
            <Divider />
            {/* Raças */}
            <Title id='racas'>Raças</Title>
            <p>
              Aqui estarão listadas novas raças que foram sugeridas nas revistas
              - raças adicionadas no Ameaças de Arton não estarão inclusas nessa
              lista.
            </p>
            <SubTitle id='golem-reformulado'>Golem (Reformulado) 📖</SubTitle>
            <p>
              Não é propriamente uma raça nova, mas a <Db>DB #180</Db> apresenta
              uma reformulação para a raça Golem, que muda bastante a forma como
              a raça funciona. Vale a pena conferir.
            </p>
            <p>
              📖 Golem Desperto é uma nova raça disponível no suplemento{' '}
              <Db>Ameaças de Arton</Db>.
            </p>
            <SubTitle id='kally'>Kallyanach 📖</SubTitle>
            <p>
              Uma espécie de meio-dragão, provavelmente estará incluso e melhor
              descrito do Ameaças de Arton. Disponível na <Db>DB #181</Db>.
            </p>
            <p>
              📖 Essa raça está disponível no suplemento{' '}
              <Db>Ameaças de Arton</Db>.
            </p>
            <SubTitle id='moreau'>Moreau 📖</SubTitle>
            <p>
              A raça dos Moreau foi adicionada na <Db>DB #172</Db>. É muito
              provável que esse conteúdo esteja disponível no Ameaças de Arton
              (talvez repaginado, ou não).
            </p>
            <SubTitle id='povo-trovao'>Povo-Trovão 📖</SubTitle>
            <p>
              Uma raça oriunda dos dinossauros (também referida como
              povo-dinossauro). Disponível na <Db>DB #174</Db>.
            </p>
            <p>
              📖 Essa raça está disponível no suplemento{' '}
              <Db>Ameaças de Arton</Db> com o nome <strong>Ceratops</strong>.
            </p>
            <Divider />
            {/* Classes */}
            <Title id='classes'>Classes</Title>
            <p>
              Aqui estarão listadas novas classes que foram sugeridas nas
              revistas.
            </p>
            <SubTitle id='druida'>Druída</SubTitle>
            <p>
              A <Db>DB #204</Db> apresentou novas possibilidades para a classe
              de Druída, com a possibilidade de druídas de outras divindades:
            </p>
            <ul>
              <li>Druida de Aharadak</li>
              <li>Druida de Tenebra</li>
              <li>Druida de Arton</li>
            </ul>
            <SubTitle id='miragem'>Miragem</SubTitle>
            <p>
              Uma classe lutadora, de guerreiros da areia do deserto de
              Halak-Tûr, com golpes envolvendo danças e uso do terreno a favor
              do jogador. Disponivel na <Db>DB #199</Db>.
            </p>
            <SubTitle id='mistico'>Místico</SubTitle>
            <p>
              Uma classe conjuradora, meio inspirada pelos dobradores de Avatar,
              permite que você manipule os elementos em forma de magias e
              habilidades. Disponível na <Db>DB #191</Db>.
            </p>
            <p>
              A <Db>DB #199</Db> trouxe o místico de volta, com algumas
              atualizações.
            </p>
            <SubTitle id='samurai'>Samurai</SubTitle>
            <p>
              Diretamente do Império de Tamu-ra, a classe Samurai foi
              introduzida na <Db>DB #199</Db>. A <Db>DB #201</Db> apresenta
              novos poderes de Samurai.
            </p>
            <Divider />
            {/* Habilidades/Poderes de Classes */}
            <Title id='poderes-de-classe'>Habilidades/Poderes de classes</Title>
            <p>
              Novos poderes que podem ser escolhidos por classes específicas.
            </p>
            <SubTitle id='barbaro'>Barbáro</SubTitle>
            <p>
              Todos os seguintes poderes de barbáro foram adicionados na{' '}
              <Db>DB #198</Db>:
            </p>
            <ul>
              <li>Brado Amplo</li>
              <li>Brado Assombroso</li>
              <li>Brado Revigorante</li>
              <li>Brado Vitorioso</li>
              <li>Fúria Rodopiante</li>
              <li>Instinto Feral</li>
              <li>Instinto Furioso</li>
              <li>Instinto Indomável</li>
              <li>Instinto Sábio</li>
              <li>Instinto Robusto</li>
              <li>Sem Piedade</li>
            </ul>
            <SubTitle id='bardo'>Bardo</SubTitle>
            <p>
              Todos os seguintes poderes de bardo foram adicionados na{' '}
              <Db>DB #179</Db>:
            </p>
            <ul>
              <li>Apresentação Avassaladora</li>
              <li>Desarranjo</li>
              <li>Harmonizar</li>
              <li>Ressoar</li>
              <li>Performance: Allegro</li>
              <li>Performance: Crescendo</li>
              <li>Performance: Fortíssimo</li>
              <li>Performance: Prestissimo</li>
              <li>Performance: Vivace</li>
              <li>Performance: Virtuoso</li>
            </ul>
            <SubTitle id='bucaneiro'>Bucaneiro</SubTitle>
            <p>
              Todos os seguintes poderes de bucaneiro foram adicionados na{' '}
              <Db>DB #189</Db>:
            </p>
            <ul>
              <li>Ainda Tenho uma Bala</li>
              <li>Bravura Indômita</li>
              <li>Pego no Chapéu</li>
              <li>Vou, Vejo e Disparo</li>
            </ul>
            <p>
              Mais poderes de bucaneiro foram adicionados na <Db>DB #195</Db>:
            </p>
            <ul>
              <li>Ardil Afiado</li>
              <li>Bravata Heróica</li>
              <li>Caneca Cheia</li>
              <li>Defesa Desconcertante</li>
              <li>Main Gauche</li>
              <li>Passo das Ondas</li>
              <li>Pirquette</li>
              <li>Remise</li>
              <li>Todos por Um</li>
              <li>Um por Todos</li>
            </ul>
            <SubTitle id='cacador'>Caçador</SubTitle>
            <p>
              Todos os seguintes poderes de caçador foram adicionados na{' '}
              <Db>DB #192</Db>:
            </p>
            <ul>
              <li>Armadilha Alquímica</li>
              <li>Armadilha Oportunista</li>
              <li>Avanço do Predador</li>
              <li>Carnificina</li>
              <li>Corte Arterial</li>
              <li>Defesa Hostil</li>
              <li>Disparo Distrator</li>
              <li>Disparo Retentor</li>
              <li>Elo com a Natureza Maior</li>
              <li>Encurralar Presa</li>
              <li>Explorador Marcial</li>
              <li>Flecheiro</li>
              <li>Improvisar Munição</li>
              <li>Lâminas Guardiãs</li>
              <li>Lanceiro</li>
              <li>Matador de Gigantes</li>
              <li>Olhar Vigilante</li>
              <li>Predador Solidário</li>
              <li>Mãos de Curandeiro</li>
              <li>Sede de Sangue</li>
              <li>Sempre Alerta</li>
              <li>Tiro em Linha</li>
              <li>Último Sangue</li>
            </ul>
            <SubTitle id='druida-2'>Druída</SubTitle>
            <p>
              Novos poderes de Druída foram apresentados na <Db>DB #204</Db>:
            </p>
            <ul>
              <li>Arma Tradicional</li>
              <li>Auspício da Lua Cheia</li>
              <li>Auspício da Lua Crescente</li>
              <li>Auspício da Lua Minguante</li>
              <li>Auspício da Lua Nova</li>
              <li>Companheiro Aberrante</li>
              <li>Companheiro Elemental</li>
              <li>Confluência Elemental</li>
              <li>Ermos Rubros</li>
              <li>Forma Aberrante</li>
              <li>Forma Elemental</li>
              <ul>
                <li>Forma Aquosa</li>
                <li>Forma Eólica</li>
                <li>Forma Ígnea</li>
                <li>Forma Rochosa</li>
              </ul>
              <li>Poder Tumular</li>
              <li>Proteção Fúngica</li>
              <li>Transformação Repugnante</li>
            </ul>
            <SubTitle id='guerreiro'>Guerreiro</SubTitle>
            <p>
              Novas opções para o <strong>Golpe Pessoal</strong> do guerreiro
              foram detalhadas na <Db>DB #159</Db>:
            </p>
            <ul>
              <li>Anunciado (–1 PM)</li>
              <li>Desconcertante (–1 PM)</li>
              <li>Desgastante (–1 PM)</li>
              <li>Paralisante (–1 PM)</li>
            </ul>
            <SubTitle id='inventor'>Inventor</SubTitle>
            <p>
              Novos poderes de inventor foram adicionados na <Db>DB #198</Db>:
            </p>
            <ul>
              <li>Autômato Alquímico</li>
              <li>Catalisador Composto</li>
              <li>Catalisador Químico</li>
              <li>Compartimento de Carga</li>
              <li>Estilista</li>
              <li>Explicação Científica</li>
              <li>Explorar Fraqueza</li>
              <li>Luthier</li>
              <li>Saraivada</li>
              <li>Traje de Batalha</li>
            </ul>
            <SubTitle id='ladino'>Ladino</SubTitle>
            <p>
              Todos os seguintes poderes de ladino foram adicionados na{' '}
              <Db>DB #185</Db>:
            </p>
            <ul>
              <li>Ataque Furtivo Duplo</li>
              <li>Conhecimento Anatômico</li>
              <li>Criatividade Técnica</li>
              <li>Dança da Capa</li>
              <li>Disfarce Perfeito</li>
              <li>Esquema: Ameaça Brutal</li>
              <li>Esquema: Alvo Elusivo</li>
              <li>Esquema: Enganar os Olhos</li>
              <li>Esquema: Finta Desconcertante</li>
              <li>Esquema: Investida Rasteira</li>
              <li>Esquema: Papo Furado</li>
              <li>Ferramenta Corrosiva</li>
              <li>Finta Acrobática</li>
              <li>Precisão Furtiva</li>
              <li>Travar Armadura</li>
              <li>Truque de Palco</li>
              <li>Truque Mágico Aprimorado</li>
              <li>Truque Mágico Versátil</li>
              <li>Veja Bem</li>
              <li>Vestido Para a Ocasião</li>
            </ul>
            <p>
              Todos os seguintes poderes de ladino foram adicionados na{' '}
              <Db>DB #189</Db>:
            </p>
            <ul>
              <li>Bomba Improvisada</li>
              <li>Matar ou Morrer</li>
              <li>Situação de Barril</li>
            </ul>
            <SubTitle id='lutador'>Lutador</SubTitle>
            <p>
              Todos os seguintes poderes de lutador foram adicionados na{' '}
              <Db>DB #190</Db>:
            </p>
            <ul>
              <li>Caminho Suave</li>
              <li>Corpo Fechado</li>
              <li>Dança de Batalha</li>
              <li>Escudo de Punhos</li>
              <li>Mahoujutsu</li>
              <li>Mahoujutsu Rápido</li>
              <li>Mahoujutsu Superior</li>
              <li>Meditação de Ataque</li>
              <li>Mente Sã em Corpo São</li>
              <li>Onda de Choque</li>
              <li>Passo Leve</li>
              <li>Pontos de Pressão (Poder de Lutador)</li>
              <li>Segredo da Essência</li>
              <li>Sexto Sentido</li>
              <li>Terceira Mão</li>
              <li>Terceira Mão: Adaga</li>
              <li>Terceira Mão: Bordão</li>
              <li>Terceira Mão: Espada Curta</li>
              <li>Terceira Mão: Lança</li>
              <li>Toque Cegante</li>
            </ul>
            <SubTitle id='nobre'>Nobre</SubTitle>
            <p>
              Os seguintes poderes de nobre foram adicionados na{' '}
              <Db>DB #195</Db>:
            </p>
            <ul>
              <li>Antecipar Ataque</li>
              <li>Apontar Fraqueza</li>
              <li>Aproveitar Brecha</li>
              <li>Comitiva</li>
              <li>Em Formação</li>
              <li>Liderar o Ataque</li>
              <li>Ordens Marciais</li>
              <li>Palavras Rápidas</li>
              <li>Siga o Líder</li>
            </ul>
            <SubTitle id='samurai'>Samurai</SubTitle>
            <p>
              Os seguintes poderes de Samurai fora adicionados na{' '}
              <Db>DB #201</Db>:
            </p>
            <Divider />
            {/* Poderes Gerais */}
            <Title id='poderes-gerais'>Poderes Gerais</Title>
            <p>
              Novos poderes que podem ser escolhidos por qualquer personagem.
            </p>
            <SubTitle id='de-combate'>De Combate</SubTitle>
            <p>
              Os seguintes poderes foram adicionados na <Db>DB #178</Db>:
            </p>
            <ul>
              <li>Combate Montado</li>
              <li>Esquiva Montada</li>
            </ul>
            <p>
              Os seguintes poderes forem adicionados na <Db>DB #180</Db>:
            </p>
            <ul>
              <li>Alcance Ampliado</li>
              <li>Arremesso Múltiplo</li>
              <li>Ataque com Escudo</li>
              <li>Brecha na Guarda</li>
              <li>Combatente Veterano</li>
              <li>Contraguarda</li>
              <li>Corte Lacerante</li>
              <li>Estudar o Adversário</li>
              <li>Estocada Debilitante</li>
              <li>Matador de Gigantes</li>
              <li>Pancada Estonteante</li>
              <li>Piqueiro</li>
            </ul>
            <SubTitle id='de-destino'>De Destino</SubTitle>
            <p>
              Os seguintes poderes foram adicionados na <Db>DB #175</Db>:
            </p>
            <ul>
              <li>Afinidade com Magia</li>
              <li>Maestria em Itens Mágicos</li>
              <li>Especialista em Itens Mágicos</li>
            </ul>
            <p>
              Os seguintes poderes foram adicionados na <Db>DB #178</Db>:
            </p>
            <ul>
              <li>Adestrar Montaria</li>
            </ul>
            <SubTitle id='de-magia'>De Magia</SubTitle>
            <p>
              Os seguintes poderes forem adicionados na <Db>DB #182</Db>:
            </p>
            <ul>
              <li>Carga Elemental: Combustão de Mana</li>
              <li>Carga Elemental: Corrosão Concentrada</li>
              <li>Carga Elemental: Dínamo Mágico</li>
              <li>Carga Elemental: Véu do Inverno</li>
              <li>Confluência Elemental</li>
              <li>Explosão Fulgente</li>
              <li>Frio Penetrante</li>
              <li>Gênese Elemental</li>
              <li>Raios e Trovões</li>
              <li>Vapores Tóxicos</li>
            </ul>
            <Divider />
            {/* Escolas de Combate */}
            <Title id='escolas-de-combate'>Escolas de Combate</Title>
            <p>
              As escolas de combate foram introduzidas na <Db>DB #180</Db>{' '}
              começando por:
            </p>
            <ul>
              <li>Arquearia de Lariandhas</li>
              <li>Centurião de Tauron</li>
              <li>Quebra-Montanhas</li>
              <li>Relâmpago de Aço</li>
            </ul>
            <p>
              Novas escolas de combate foram adicionadas na <Db>DB #190</Db>:
            </p>
            <ul>
              <li>Caminho Pacificador</li>
              <li>Cheiro do Medo</li>
              <li>Coração da Montanha</li>
              <li>Escudo da Luz</li>
              <li>Folha no Vento </li>
              <li>Garra do Dragão</li>
              <li>Gladiador Imperial</li>
              <li>Lâmina da Lua</li>
              <li>Siroco Eterno</li>
              <li>Tigre Branco Devora o Céu</li>
            </ul>
            <Divider />
            <Title id='desvantagens'>Desvantagens</Title>
            <p>
              As desvantagens são apresentadas na <Db>DB #156</Db>:
            </p>
            <ul>
              <li>Amaldiçoado</li>
              <li>Assombrado</li>
              <li>Cabeça Quente</li>
              <li>Caolho</li>
              <li>Chato</li>
              <li>Código de Conduta</li>
              <li>Combalido</li>
              <li>Covarde</li>
              <li>Distraído</li>
              <li>Duro de Ouvido</li>
              <li>Expurgo de Allihanna</li>
              <li>Expurgo de Wynna</li>
              <li>Filho(a) de Nimb</li>
              <li>Fracote</li>
              <li>Franzino</li>
              <li>Hedonista</li>
              <li>Impulsivo</li>
              <li>Inculto</li>
              <li>Indefeso</li>
              <li>Ingênuo</li>
              <li>Maneta</li>
              <li>Matugo</li>
              <li>Melancólico</li>
              <li>Míope</li>
              <li>Vagaroso</li>
              <li>Temeroso</li>
              <li>Tolo</li>
            </ul>
            <Divider />
            {/* Distinções */}
            <Title id='distincoes'>Distinções</Title>
            <p>
              Distinções já sofreram diversas iterações ao longo da revista e em
              breve estarão oficialmente disponíveis como suplemento através da
              campanha{' '}
              <a
                href='https://www.catarse.me/tormenta25'
                target='_blank'
                rel='noreferrer'
              >
                Tormenta 25
              </a>
              . Quando os livros forem oficialmente lançados, as distinções
              oficialmente adicionadas neles serão sinalizadas nesse índice.
            </p>
            <p>
              As distinções foram introduzidas na <Db>DB #181</Db>. A revista{' '}
              <Db>DB #202</Db> fala novamente sobre as regras de distinção, de
              forma atualizada. Novas distinções foram adicionadas ao longo de
              várias revistas e estão indicadas abaixo.
            </p>
            <ul>
              <li>
                Aeronauta Goblin (apresentado em <Db>DB #181</Db>)
              </li>
              <li>
                Arqueiro Arcano (revisitado em <Db>DB #202</Db>)
              </li>
              <li>
                Caçador de Dragões (apresentado em <Db>DB #201</Db>)
              </li>
              <li>
                Cavaleiro da Redenção (apresentado em <Db>DB #194</Db>)
              </li>
              <li>
                Cavaleiro Silvestre (apresentado em <Db>DB #186</Db>)
              </li>
              <li>
                Cavaleiro do Corvo (revisitado em <Db>DB #202</Db>)
              </li>
              <li>
                Chapéu-Preto (apresentado em <Db>DB #203</Db>)
              </li>
              <li>
                Gigante Furioso (revisitado em <Db>DB #203</Db>)
              </li>
              <li>
                Guardião da Realidade (apresentado em <Db>DB #204</Db>)
              </li>
              <li>
                Irmão Inseparável (apresentado em <Db>DB #187</Db>)
              </li>
              <li>
                Lobo Lunar (apresentado em <Db>DB #196</Db> com regras de{' '}
                <strong>Licantropo</strong>)
              </li>
              <li>
                Mago de Batalha (apresentado em <Db>DB #205</Db>)
              </li>
              <li>
                Médico de Salistik (apresentado em <Db>DB #204</Db>)
              </li>
              <li>
                Mestre da Fúria Fria (apresentado em <Db>DB #188</Db>)
              </li>
              <li>
                Xerife de Azgher (apresentado em <Db>DB #205</Db>)
              </li>
            </ul>
            <Divider />
            {/* Equipamentos */}
            <Title id='equipamentos'>Equipamentos</Title>
            <SubTitle id='armas-de-fogo'>Armas de Fogo</SubTitle>
            <p>
              Novos itens de pólvora foram adicionados na <Db>DB #189</Db>:
            </p>
            <ul>
              <li>Bacamarte</li>
              <li>Bazuca</li>
              <li>Colete à prova de balas</li>
              <li>Manopla Explosiva</li>
              <li>Pistola Punhal</li>
            </ul>
            <p>
              Junto com as armas de fogo novas, apareceram também novas{' '}
              <strong>modificações</strong> para essas armas:
            </p>
            <ul>
              <li>Cano Duplo</li>
              <li>Cartucho de Papel</li>
              <li>Engraxado</li>
              <li>Munição Expansiva</li>
              <li>Tambor</li>
            </ul>

            <SubTitle id='armas-magicas'>Armas Mágicas</SubTitle>
            <p>
              Novas armas mágicas foram adicionadas na <Db>DB #183</Db>:
            </p>
            <ul>
              <li>Valete de Nimb</li>
              <li>At’mokhet</li>
              <li>Guarda Esquelética</li>
              <li>Gwurthun</li>
              <li>Pilar Primordial</li>
              <li>Kiri</li>
              <li>Espada da Herança Heróica</li>
              <li>Lâmina de Espinhos</li>
            </ul>
            <p>
              Algumas novas modificações e materiais especiais também foram
              adicionadas nesta edição da revista:
            </p>
            <ul>
              <li>Quelícera (modificação)</li>
              <li>Chifre de monstro (material especial)</li>
              <li>Lanajuste (material especial)</li>
              <li>Lâmina Rúnica (modificação)</li>
              <li>MPP (ferramenta)</li>
              <li>Semente-espada (equipamento de aventura)</li>
              <li>Luminosa (modificação)</li>
              <li>Hajalbar (material especial)</li>
            </ul>
            <p>
              Novas armas mágicas foram adicionadas na <Db>DB #184</Db>:
            </p>
            <ul>
              <li>Pequena Cobra</li>
              <li>Glória de Mustaraf</li>
              <li>Atigili</li>
              <li>Florete Floral</li>
              <li>Talho de Azgher</li>
              <li>Yasidi</li>
            </ul>
            <p>
              Algumas novas modificações e materiais especiais também foram
              adicionadas nesta edição da revista:
            </p>
            <ul>
              <li>Lâmina-Bruxa (encatamento de arma)</li>
              <li>Gorádio (material especial)</li>
              <li>Estampada (melhoria para armas e escudos)</li>
              <li>Fio-de-aço (material especial)</li>
              <li>Veia de Espadas (costume goblin)</li>
              <li>Vela (aprimoramento para Arma Mágica)</li>
            </ul>
            <SubTitle id='armas-de-arsenal'>
              Armas de Arsenal (Lendárias)
            </SubTitle>
            <p>
              Várias armas lendárias do Mestre Arsenal foram descritas na{' '}
              <Db>DB #188</Db>:
            </p>
            <ul>
              <li>Alabarda de Sirrannamena</li>
              <li>Algoz de Allihanna</li>
              <li>Algoz de Kally</li>
              <li>Anel da Barreira</li>
              <li>Anel do Tempo</li>
              <li>Botas de Alward</li>
              <li>Broquel de Nordman</li>
              <li>Canhão Final</li>
              <li>Centelha Solar</li>
              <li>Coroa de Chamas</li>
              <li>Escudo Impérvio</li>
              <li>Espaldar dos Intocáveis</li>
              <li>Espada de Asloth</li>
              <li>Espada de Yugraz</li>
              <li>Lua Minguante</li>
              <li>Luz das Estrelas</li>
              <li>Martelos dos Relâmpagos e dos Trovões</li>
              <li>Medalha do Deicida</li>
              <li>Monóculo da Verdade</li>
              <li>Montante Uivante</li>
              <li>Pelego do Descanso</li>
              <li>Picareta de Marmaduk</li>
              <li>Ruína da Civilização</li>
              <li>Slash Calliber</li>
              <li>Símbolo Sagrado Primordial</li>
              <li>Tridente Sibilante</li>
            </ul>
            <SubTitle id='exotericos'>Exótericos</SubTitle>
            <p>
              A <Db>DB #163</Db> faz a introdução dos itens exótericos - a
              maioria já foi adicionado ao JdA, mas vou deixar listado aqui os
              que estão apenas na revista:
            </p>
            <ul>
              <li>Catalisadores de Magia</li>
              <ul>
                <li>Elo de Ferro</li>
                <li>Frasco de Amônia</li>
                <li>Pena de Thyatis (flor)</li>
              </ul>
              <li>Amplificadores Arcanos</li>
              <ul>
                <li>Ampulheta de Areia da Perdição</li>
                <li>Anel de Adamante</li>
                <li>Bastão de Mitral</li>
              </ul>
              <li>Itens Litúrgicos</li>
              <ul>
                <li>Cálice Sagrado</li>
                <li>Carrilhão Consagrado</li>
                <li>Estola Clerical</li>
                <li>Ostensório Santificado</li>
                <li>Sacrário Portátil</li>
                <li>Turíbulo Ungido</li>
                <li>Vela Eclesiástica</li>
                <li>Véu Ritualístico</li>
              </ul>
            </ul>
            <SubTitle id='municoes'>Munições</SubTitle>
            <p>
              Novas melhorias para munições foram apresentadas na{' '}
              <Db>DB #192</Db>:
            </p>
            <ul>
              <li>Agulha</li>
              <li>Assobiadora</li>
              <li>Cauda-de-Andorinha</li>
              <li>Crescente de Lena</li>
              <li>Fósforo</li>
              <li>Incendiária</li>
              <li>Punhal</li>
              <li>Rombuda</li>
            </ul>
            <SubTitle id='instrumentos'>Instrumentos</SubTitle>
            <p>
              Na <Db>DB #179</Db> uma ampliação nas regras de instrumentos
              musicais, além de mostrar algumas melhorias para eles.
            </p>
            <SubTitle id='almadiçoados'>Itens amaldiçoados</SubTitle>
            <p>
              A <Db>DB #196</Db> adicionou uma série de itens amaldiçoados, com
              detalhamento das regras para utilizá-los:
            </p>
            <ul>
              <li>Cetro da Permuta Funesta</li>
              <li>Coroa de Milghazan</li>
              <li>Lâmina do Sono Eterno</li>
              <li>Maça de Geltor</li>
              <li>Medalhão dos Povos</li>
              <li>O Incrível Mapa de Alastar</li>
            </ul>
            <SubTitle id='recompensas'>Tabela de Recompensas Extras</SubTitle>
            <p>
              A <Db>DB #199</Db> adicionou mais opções de itens mundanos para
              serem sorteados como recompensas de aventuras. A tabela inclui um
              valor médio e uma lista de itens como exemplos - como joias,
              louças, móveis, mapas, etc.
            </p>
            <Divider />
            {/* Magias */}
            <Title id='magias'>Magias</Title>
            <SubTitle id='arcanas'>Arcanas</SubTitle>
            <p>
              As seguintes magias arcanas foram adicionadas na <Db>DB #181</Db>:
            </p>
            <ul>
              <li>Disparo Gélido</li>
            </ul>
            <p>
              As seguintes magias arcanas foram adicionadas na <Db>DB #182</Db>:
            </p>
            <ul>
              <li>Açoite Flamejante</li>
              <li>Detonação Congelante</li>
              <li>Geiser Cáustico</li>
              <li>Impacto Fulminante</li>
              <li>Nuvem Tempestuosa</li>
              <li>Pântano Vitriólico</li>
              <li>Raio de Plasma</li>
              <li>Toque Álgido</li>
              <li>Velocidade do Relâmpago</li>
            </ul>
            <SubTitle id='divinas'>Divinas</SubTitle>
            <p>
              As seguintes masgias divinas foram adicionadas na <Db>DB #181</Db>
              :
            </p>
            <ul>
              <li>Jato Corrosivo</li>
            </ul>
            <SubTitle id='Universais'>Universais</SubTitle>
            <p>
              As seguintes magias universais (divinas e arcanas) foram
              adicionadas na <Db>DB #182</Db>:
            </p>
            <ul>
              <li>Bênção da Dragoa Rainha</li>
              <li>Hálito Peçonhento</li>
            </ul>
            <Divider />
            {/* Ameaças */}
            <Title id='ameacas'>Ameaças</Title>
            <p>
              Algumas das ameaças adicionadas nas revistas. Tenha em mente que
              muitas delas podem estar incluídas oficialmente e modificadas no{' '}
              <strong>Ameaças de Arton</strong>, um suplemento da Jambô com
              centenas de novas ameaças.
            </p>
            <SubTitle id='aberracoes-da-tormenta'>
              Aberrações da Tormenta
            </SubTitle>
            <p>
              Lista de aberrações da Tormenta adicionada na <Db>DB #193</Db>:
            </p>
            <ul>
              <li>Anomalocaris</li>
              <li>Falcão Fatídico</li>
              <li>Glop Sangrento</li>
              <li>Incubador</li>
              <li>Lursh-lyin</li>
              <li>Trilobita</li>
              <li>Nautilon</li>
            </ul>
            <SubTitle id='aslothia'>De Aslothia</SubTitle>
            <p>
              Novas ameaças de Aslothia na <Db>DB #179</Db>.
            </p>
            <SubTitle id='capangas'>Capagangas e Lacaios</SubTitle>
            <p>
              A <Db>DB #170</Db> discute como criar capangas
            </p>
            <SubTitle id='mercenarios'>Companhia de Mercenários</SubTitle>
            <p>
              A <Db>DB #157</Db> apresenta uma lista de inimigos mercenários, em
              vários NDs diferentes.
            </p>
            <SubTitle id='dragoes'>Dragões</SubTitle>
            <p>
              A <Db>DB #201</Db> apresentou alguns dragões da cultura pop como
              ameaças disponíveis.
            </p>
            <ul>
              <li>Banguela (Como Treinar o Seu Dragão)</li>
              <li>Dragão Branco de Olhos Azuis (Yu-Gi-Oh!)</li>
              <li>Dragonite (Pokémon)</li>
              <li>Falkor (A História Sem Fim)</li>
              <li>Haku (A Viagem de Chihiro)</li>
              <li>Harle (Chrono Cross)</li>
              <li>Jaguadarte (Alice no País dos Espelhos)</li>
              <li>Lockheed (X-Men)</li>
              <li>Shou Lao (Punho de Ferro)</li>
              <li>Spyro (Spyro The Dragon)</li>
            </ul>
            <SubTitle id='viloes'>Vilões</SubTitle>
            <p>
              Vilões desprezíveis para dificultar a vida dos seus jogadores em
              Tormenta20, adicionados na <Db>DB #198</Db>:
            </p>
            <ul>
              <li>Karmen Roth</li>
              <li>Mesmerizador</li>
              <li>Lady Isoldine, Baronesa Sangrenta</li>
              <li>Rovert Naidr, Taverneiro Traiçoeiro</li>
              <li>Doutora Stella e Ellyn, a Criatura</li>
            </ul>
            <p>
              Ozai, o Senhor do Fogo da série Avatar a Lenda de Aang foi
              adicionado na <Db>DB #201</Db>.
            </p>
            <ul>
              <li>Ozai, o Senhor do Fogo</li>
            </ul>
            <Divider />
            {/* Aliados */}
            <Title id='aliados'>Aliados</Title>
            <SubTitle id='montarias'>Montarias</SubTitle>
            <p>
              Novas regras de Montarias como aliados na <Db>DB #178</Db>.
            </p>
            <SubTitle id='elementais'>Elementais</SubTitle>
            <p>
              Aliados elementais de água, fogo, ar e terra, na <Db>DB #181</Db>
            </p>
            <SubTitle id='genios'>Gênios</SubTitle>
            <p>
              Aliados do tipo gênio (de vários elementos como luz, trevas, ar,
              água, fogo, etc), na <Db>DB #181</Db>.
            </p>
            <Divider />
            <Title id='historia-de-arton'>A história de Arton</Title>
            <p>
              A <Db>DB #159</Db> possui a linha do tempo completa de Arton,
              comentada por sábios e goblins.
            </p>
            <Divider />
            {/* Outros */}
            <Title id='outros'>Outros</Title>
            <SubTitle id='culinaria'>Culinária</SubTitle>
            <p>
              Regras de culinária, pratos especiais e um poder novo:
              &apos;Comilão&apos;, na <Db>DB #145</Db>
            </p>
            <SubTitle id='perigos-complexos'>Perigos Complexos</SubTitle>
            <p>
              Como criar perigos complexos, <Db>DB #169</Db>.
            </p>
            <SubTitle id='engenhocas'>Engenhocas</SubTitle>
            <p>
              A <Db>DB #172</Db> fala das engenhocas.
            </p>
            <SubTitle id='regras-rigidas'>
              Regras mais rígidas para controlar os players
            </SubTitle>
            <p>
              A <Db>DB #174</Db> traz regras mais rígidas para o mestre
              conseguir controlar os jogadores. Boa leitura.
            </p>
            <SubTitle id='idade'>Idades variadas para personagens</SubTitle>
            <p>
              Regras para personagens de idades variadas nas <Db>DB #153</Db> e{' '}
              <Db>DB #154</Db>
            </p>
            <SubTitle id='aposentadoria'>Aposentadoria</SubTitle>
            <p>
              Regras de Aposentadoria para personagens, <Db>DB #161</Db>
            </p>
          </StyledPaper>
        </div>
        {!isMobile && <TableOfContents />}
      </Stack>
    </MainDiv>
  );
};

export default CavernaDoSaber;
