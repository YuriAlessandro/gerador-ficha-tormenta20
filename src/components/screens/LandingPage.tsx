import background from '@/assets/images/fantasybg.png';
import random from '@/assets/images/options/random.png';
import characters from '@/assets/images/options/characters.png';
import builder from '@/assets/images/options/builder.png';
import treasure from '@/assets/images/options/treasure.png';
import items from '@/assets/images/options/items.png';
import books from '@/assets/images/options/books.png';
import database from '@/assets/images/options/database.png';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Container,
  Grid,
  Stack,
  useTheme,
} from '@mui/material';
import React from 'react';
import ferramentas from '../../assets/images/ferramentas.jpg';
import ficha from '../../assets/images/ficha2.jpg';
import library from '../../assets/images/library.jpg';
import others from '../../assets/images/others.jpg';
import LandingOption from '../LandingOption';

const LandingPage: React.FC<{
  onClickButton: (link: string) => void;
}> = ({ onClickButton }) => {
  const theme = useTheme();
  const isDarkTheme = theme.palette.mode === 'dark';

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
          backgroundPosition: 'center',
          position: 'absolute',
          top: 0,
          width: '100%',
          height: '75vh',
          zIndex: 0,
        }}
      />

      <Container sx={{ position: 'relative' }}>
        <Box
          sx={{
            textAlign: 'center',
            mb: 5,
            fontFamily: 'Tfont',
            color: '#d13235',
            WebkitTextStroke: '0.5px black',
          }}
        >
          <h1>“Khalmyr tem o tabuleiro, mas quem move as peças é Nimb”</h1>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardMedia sx={{ height: 140 }} image={ficha} title='Fichas' />
              <CardContent>
                <Stack spacing={2}>
                  <LandingOption
                    title='Meus personagens'
                    text='Fichas criadas por você. Use e gerencie suas fichas.'
                    image={characters}
                    onClick={() => onClickButton('sheets')}
                  />
                  <LandingOption
                    title='Nova ficha'
                    text='Uma ficha totalmente aleatória gerada a partir das suas opções selecionadas.'
                    image={builder}
                    onClick={() => onClickButton('sheet-builder')}
                  />
                  <LandingOption
                    title='Ficha aleatória'
                    text='Uma ficha totalmente aleatória gerada a partir das suas opções selecionadas.'
                    image={random}
                    onClick={() => onClickButton('ficha-aleatoria')}
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardMedia
                sx={{ height: 140 }}
                image={ferramentas}
                title='Ferramentas'
              />
              <CardContent>
                <Stack spacing={2}>
                  <LandingOption
                    title='Rolador de recompensas'
                    text='Gere as recompensas da sua mesa de forma muito rápida.'
                    image={treasure}
                    onClick={() => onClickButton('recompensas')}
                  />
                  <LandingOption
                    title='Criar item superior'
                    text='Gerar itens com modificações.'
                    image={items}
                    onClick={() => onClickButton('itens-superiores')}
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardMedia
                sx={{ height: 140 }}
                image={library}
                title='Conhecimento'
              />
              <CardContent>
                <Stack spacing={2}>
                  <LandingOption
                    title='Caverna do Saber'
                    text='Compilado com conteúdos de Tormenta 20 na revista Dragão Brasil.'
                    image={books}
                    onClick={() => onClickButton('recompensas')}
                  />
                  <LandingOption
                    title='Database'
                    text='Diretamente do livro, um compilado com todos as raças, classes, divindades, poderes, magias, etc.'
                    image={database}
                    onClick={() => onClickButton('itens-superiores')}
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardMedia
                sx={{ height: 140 }}
                image={others}
                title='Comunidade'
              />
              <CardContent>
                <Stack spacing={2}>
                  <LandingOption
                    title='Grimório T20'
                    text='Projeto da comunidade. Não possui vínculo com Fichas de Nimb.'
                    onClick={() =>
                      onOpenLink('https://eduardomarques.pythonanywhere.com/')
                    }
                  />
                  <LandingOption
                    title='Calculadora ND'
                    text='Projeto da comunidade. Não possui vínculo com Fichas de Nimb.'
                    onClick={() =>
                      onOpenLink('https://mclemente.github.io/Calculadora-ND/')
                    }
                  />
                </Stack>
              </CardContent>
            </Card>
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
        </Grid>
      </Container>
    </>
  );
};

export default LandingPage;
