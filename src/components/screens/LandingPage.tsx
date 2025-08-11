import background from '@/assets/images/fantasybg.png';
// import magical from '@/assets/images/options/magical.png';
import adventure from '@/assets/images/adventure.jpg';
import dice from '@/assets/images/dice.jpg';
import {
  Box,
  Card,
  Container,
  Grid,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import React from 'react';
import ferramentas from '../../assets/images/ferramentas.jpg';
import library from '../../assets/images/library.jpg';
import others from '../../assets/images/others.jpg';
import LandingOption from '../LandingOption';

const LandingPage: React.FC<{
  onClickButton: (link: string) => void;
}> = ({ onClickButton }) => {
  const theme = useTheme();
  const isDarkTheme = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const onOpenLink = (link: string) => {
    window.open(link);
  };

  return (
    <>
      <Box
        sx={{
          backgroundImage: `linear-gradient(
          to bottom,
          rgba(255, 255, 255, 0) 20%,
          ${isDarkTheme ? '#212121' : '#f3f2f1'}
        ), url(${background})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: { xs: 'center top', sm: 'center center' },
          position: 'absolute',
          top: 0,
          width: '100%',
          height: { xs: '60vh', sm: '70vh', md: '75vh' },
          zIndex: 0,
        }}
      />

      <Container sx={{ position: 'relative', mb: 2, px: { xs: 1, sm: 2 } }}>
        <Box
          sx={{
            textAlign: 'center',
            mb: { xs: 3, sm: 4, md: 5 },
            fontFamily: 'Tfont',
            color: '#FFFFFF',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
            px: { xs: 1, sm: 2 },
          }}
        >
          <h1
            style={{
              fontSize: isMobile ? '24px' : '32px',
              lineHeight: 1.2,
              margin: 0,
              padding: '16px 0',
            }}
          >
            &ldquo;Khalmyr tem o tabuleiro, mas quem move as peças é Nimb&rdquo;
          </h1>
        </Box>

        <Grid container spacing={2}>
          {/* Main Feature - Random Sheet */}
          <Grid item xs={12} md={6}>
            <LandingOption
              title='Ficha aleatória'
              text='Uma ficha totalmente aleatória gerada a partir das suas opções selecionadas.'
              image={dice}
              onClick={() => onClickButton('ficha-aleatoria')}
              full
            />
          </Grid>

          {/* Secondary Features */}
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={12}>
                <LandingOption
                  title='Mapa de Arton'
                  text='Um mapa interativo de Arton, com pins de cidades, pontos de interesse e mais.'
                  image={adventure}
                  onClick={() =>
                    onOpenLink('https://mapadearton.fichasdenimb.com.br/')
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6} md={12}>
                <LandingOption
                  title='Caverna do Saber'
                  text='Compilado com conteúdos de Tormenta 20 na revista Dragão Brasil.'
                  image={library}
                  onClick={() => onClickButton('caverna-do-saber')}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Tools Section */}
          <Grid item xs={12} sm={6}>
            <LandingOption
              title='Enciclopédia de Tanah-Toh'
              text='Um compilado com todos as raças, classes, divindades, poderes, magias, etc.'
              image={others}
              onClick={() => onClickButton('database/raças')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <LandingOption
              title='Rolador de recompensas'
              text='Gere as recompensas da sua mesa de forma muito rápida.'
              image={ferramentas}
              onClick={() => onClickButton('recompensas')}
            />
          </Grid>
          <Grid item xs={12}>
            <Card>
              <div id='presentation'>
                <p>
                  <strong>Fichas de Nimb</strong> é uma plataforma com diversas
                  ferramentas para mestres e jogadores do sistema Tormenta 20.
                  Com ele, é possível gerar fichas de quaisquer raças e classes,
                  e ter sua ficha montada facilmente, de forma aleatória ou
                  dinâmica. Todos as características de uma ficha de Tormenta 20
                  serão criadas: atributos, perícias, origem, divindades,
                  magias, etc. Tudo respeitando as regras oficiais do jogo.
                </p>
                <p>
                  O gerador aleatório é uma ótima pedida para jogadores que
                  queiram experimentar um pouco de aleatoriedade ou não gastar
                  muito tempo criando a ficha, e principalmente para mestres que
                  queriam gerar seus NPCs de forma rápida e prática.
                </p>
                <p>
                  O criador de fichas é uma forma prática e rápida de criar
                  personagens sem se preocupar com a aplicação das regras. Tudo
                  está sendo validado pelo código. Você só precisa escolher as
                  opções e usar a ficha.
                </p>
                <p>
                  Se você encontrou algum problema, tem alguma sugestão ou quer
                  discutir e entender como é o funcionamento do Fichas de Nimb,{' '}
                  <a
                    href='https://github.com/YuriAlessandro/gerador-ficha-tormenta20/discussions'
                    target='blank'
                  >
                    clique aqui.
                  </a>
                </p>

                <p>
                  Se você é um desenvolvedor que queira contribuir com o
                  projeto, utilize o nosso{' '}
                  <a
                    href='https://github.com/YuriAlessandro/gerador-ficha-tormenta20/discussions'
                    target='blank'
                  >
                    GitHub
                  </a>
                  .
                </p>
              </div>
            </Card>
          </Grid>

          {/* Additional Tools */}
          <Grid item xs={12} sm={6}>
            <LandingOption
              title='Compre Tormenta 20'
              text='O maior sistema de RPG do Brasil.'
              onClick={() =>
                onOpenLink(
                  'https://jamboeditora.com.br/categoria/rpg/tormenta20-rpg/'
                )
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <LandingOption
              title='Changelog'
              text='Acompanhe o progresso do nosso projeto.'
              onClick={() => onClickButton('changelog')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <LandingOption
              title='Criar item superior'
              text='Gerar itens com modificações.'
              onClick={() => onClickButton('itens-superiores')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <LandingOption
              title='Gerador de Ameaças'
              text='Crie inimigos e NPCs seguindo as regras oficiais do Tormenta 20.'
              image={ferramentas}
              onClick={() => onClickButton('gerador-ameacas')}
            />
          </Grid>

          {/* Community Projects */}
          <Grid item xs={12} sm={6}>
            <LandingOption
              title='Grimório T20'
              text='Projeto da comunidade. Não possui vínculo com Fichas de Nimb.'
              onClick={() =>
                onOpenLink('https://eduardomarques.pythonanywhere.com/')
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <LandingOption
              title='Calculadora ND'
              text='Projeto da comunidade. Não possui vínculo com Fichas de Nimb.'
              onClick={() =>
                onOpenLink('https://mclemente.github.io/Calculadora-ND/')
              }
            />
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default LandingPage;
