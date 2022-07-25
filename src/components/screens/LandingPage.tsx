import { Box, Card, Button } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import StorageIcon from '@mui/icons-material/Storage';

import ficha from '../../assets/images/ficha.png';

const LandingPage: React.FC<{
  isDarkMode: boolean;
  onClickButton: (tab: number, link: string) => void;
}> = ({ onClickButton }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: ['column-reverse', 'column-reverse', 'row'],
    }}
  >
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        m: 2,
        width: '90vw',
        flexDirection: ['column', 'column', 'row'],
      }}
    >
      <div id='presentation'>
        <p>
          <u>“Khalmyr tem o tabuleiro, mas quem move as peças é Nimb”</u>. Deixe
          que Nimb decida o seu personagem.
        </p>
        <p>
          <strong>Fichas de Nimb</strong> é um gerador de fichas para o sistema
          Tormenta 20. Com ele, é possível gerar fichas de quaisquer raças e
          classes, e ter sua ficha montada facilmente. Todos as características
          de uma ficha de Tormenta 20 serão gerados: atributos, perícias,
          origem, divindades, magias, etc. Tudo respeitando as regras oficiais
          do jogo.
        </p>
        <p>
          Esse gerador é uma ótima pedida para jogadores que queiram
          experimentar um pouco de aleatoriedade ou não gastar muito tempo
          criando a ficha, e principalmente para mestres que queriam gerar seus
          NPCs de forma rápida e prática.
        </p>
        <p>
          Você pode ver as últimas alterações e o que planejamos para o futuro
          no <Link to='/changelog'>changelog</Link>.
        </p>

        <p>
          Se você encontrou algum problema, tem alguma sugestão ou quer discutir
          e entender como é o funcionamento do Fichas de Nimb,{' '}
          <a
            href='https://github.com/YuriAlessandro/gerador-ficha-tormenta20/discussions'
            target='blank'
          >
            clique aqui.
          </a>
        </p>

        <p>
          Se você é um desenvolvedor que queira contribuir com o projeto,
          utilize o nosso{' '}
          <a
            href='https://github.com/YuriAlessandro/gerador-ficha-tormenta20/discussions'
            target='blank'
          >
            GitHub
          </a>
          .
        </p>
      </div>
      <div>
        <img src={ficha} width={800} alt='Ficha' />
      </div>
    </Box>
    <Card
      variant='outlined'
      sx={{
        p: 3,
        width: 300,
        position: ['initial', 'initial', 'absolute'],
        top: 100,
        right: ['0', '10%', '40%'],
        m: [3, 0, 0],
      }}
    >
      <h1>Começar agora mesmo</h1>
      <p>
        Você pode gerar fichas de qualquer nível para jogadores e salvar como
        PDF como ficha complexa ou simplificada. Também é possível gerar
        recompensas e itens de forma aleatória.
      </p>
      <Button
        sx={{ mb: 1 }}
        variant='contained'
        startIcon={<PersonAddIcon />}
        onClick={() => onClickButton(1, 'ficha-aleatoria')}
      >
        Gerar ficha de jogador
      </Button>
      <Button
        sx={{ mb: 1 }}
        variant='contained'
        startIcon={<LocalAtmIcon />}
        onClick={() => onClickButton(2, 'recompensas')}
      >
        Gerar recompensa
      </Button>
      <Button
        variant='contained'
        startIcon={<StorageIcon />}
        onClick={() => onClickButton(4, 'database/raças')}
      >
        Database
      </Button>
    </Card>
  </Box>
);

export default LandingPage;
