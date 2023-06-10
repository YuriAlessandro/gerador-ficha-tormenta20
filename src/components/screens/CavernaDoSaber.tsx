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
            {/* <ListItemIcon>
              <ChevronRight />
            </ListItemIcon> */}
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
        <div style={{ maxWidth: '70%' }}>
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
                <strong>Revistas analisadas: DB #169 até #191</strong>
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
            {/* Raças */}
            <Title id='racas'>Raças</Title>
            <p>
              Aqui estarão listadas novas raças que foram sugeridas nas revistas
              - até o momento, raças adicionadas no Ameaças de Arton não estarão
              inclusas.
            </p>
            <SubTitle id='kally'>Kallyanach</SubTitle>
            <p>
              Uma espécie de meio-dragão, provavelmente estará incluso e melhor
              descrito do Ameaças de Arton. Disponível na <Db>DB #181</Db>.
            </p>
            <Divider />
            {/* Classes */}
            <Title id='classes'>Classes</Title>
            <p>
              Aqui estarão listadas novas classes que foram sugeridas nas
              revistas.
            </p>
            <SubTitle id='mistico'>Místico</SubTitle>
            <p>
              Adicionado na <Db>DB #191</Db>.
            </p>
            <Divider />
            {/* Habilidades/Poderes de Classes */}
            <Title id='poderes-de-classe'>Habilidades/Poderes de classes</Title>
            <p>
              Novos poderes que podem ser escolhidos por classes específicas.
            </p>
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
            {/* Distinções */}
            <Title id='distincoes'>Distinções</Title>
            <p>
              As distinções forem introduzidas na <Db>DB #181</Db>:
            </p>
            <ul>
              <li>Aeronauta Goblin</li>
              <li>Arqueiro Arcano</li>
              <li>Cavaleiro do Corvo</li>
              <li>Gigante Furioso</li>
            </ul>
            <p>
              Mais uma distinção foi adicionada na <Db>DB #186</Db>:
            </p>
            <ul>
              <li>Cavaleiro Silvestre</li>
            </ul>
            <p>
              Mais uma foi adicionada na <Db>DB #187</Db>:
            </p>
            <ul>
              <li>Irmão Inseparável</li>
            </ul>
            <p>
              Mais uma na <Db>DB #188</Db>:
            </p>
            <ul>
              <li>Mestre da Fúria Fria</li>
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
            <SubTitle id='instrumentos'>Instrumentos</SubTitle>
            <p>
              Na <Db>DB #179</Db> uma ampliação nas regras de instrumentos
              musicais, além de mostrar algumas melhorias para eles.
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
            <SubTitle id='aslothia'>De Aslothia</SubTitle>
            <p>
              Novas ameaças de Aslothia na <Db>DB #179</Db> (isso já vai deve
              estar incluído no Ameaças de Artons).
            </p>
            <SubTitle id='capangas'>Capagangas e Lacaios</SubTitle>
            <p>
              A <Db>DB #170</Db> discute como criar capangas
            </p>
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
            {/* Outros */}
            <Title id='outros'>Outros</Title>
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
          </StyledPaper>
        </div>
        <TableOfContents />
      </Stack>
    </MainDiv>
  );
};

export default CavernaDoSaber;
