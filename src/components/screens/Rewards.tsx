import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Link,
  Paper,
  Stack,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
} from '@mui/material';
import Select from 'react-select';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';

import NumberField from '@/components/common/NumberField';
import {
  ItemKind,
  TREASURE_DATASETS,
  TreasureMode,
} from '@/data/treasure/treasureDatasets';
import {
  ND_ORDER,
  TreasureMultiplier,
  TreasureRollResult,
  chooseTwoDice,
  createTreasureContext,
  rollTreasure,
} from '@/functions/treasure/treasureRoller';
import { SEO, getPageSEO } from '../SEO';
import TormentaTitle from '../Database/TormentaTitle';
import getSelectTheme from '../../functions/style';
import TreasureResultCard from '../Rewards/TreasureResultCard';

const nds = ND_ORDER.map((nd) => ({ value: nd, label: `ND ${nd}` }));

type SelectedOption = { value: string; label: string };

type TreasureResultWithId = {
  id: string;
  mode: TreasureMode;
  result: TreasureRollResult;
};

const MODE_STORAGE_KEY = 'rewards.treasureMode';

const readStoredMode = (): TreasureMode => {
  try {
    const stored = window.localStorage.getItem(MODE_STORAGE_KEY);
    return stored === 'supplements' ? 'supplements' : 'basic';
  } catch {
    return 'basic';
  }
};

const SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${TREASURE_DATASETS.supplements.tables.source.spreadsheetId}`;

/** "Se você não possuir o livro de um item rolado, use o próximo item na lista." */
const SPREADSHEET_BOOK_NOTE =
  TREASURE_DATASETS.supplements.tables.introduction?.find((p) =>
    p.includes('Se você não possuir o livro')
  ) ?? '';

const Rewards: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const [results, setResults] = useState<TreasureResultWithId[]>();
  const [numberOfItems, setNumberOfItems] = useState<number | null>(1);
  const [nd, setNd] = useState<string>('1/4');
  const [mode, setMode] = useState<TreasureMode>(readStoredMode);
  const [rewardMult, setRewardMult] = useState<TreasureMultiplier>('Padrão');

  const dataset = TREASURE_DATASETS[mode];

  const onClickGenerate = () => {
    const ctx = createTreasureContext(dataset);
    const newResults: TreasureResultWithId[] = [];
    for (let index = 0; index < (numberOfItems ?? 0); index += 1) {
      newResults.push({
        id: crypto.randomUUID(),
        mode,
        result: rollTreasure(ctx, nd, rewardMult),
      });
    }
    setResults(newResults);
  };

  const onChangeMode = (_: React.MouseEvent, value: TreasureMode | null) => {
    if (!value) return;
    setMode(value);
    try {
      window.localStorage.setItem(MODE_STORAGE_KEY, value);
    } catch {
      // Armazenamento indisponível (aba anônima etc.): só não lembra o modo.
    }
  };

  const onChoose = (resultId: string, itemIndex: number, kind: ItemKind) => {
    setResults((prev) =>
      prev?.map((r) => {
        if (r.id !== resultId) return r;
        const ctx = createTreasureContext(TREASURE_DATASETS[r.mode]);
        const items = r.result.items.map((it, idx) =>
          idx === itemIndex ? chooseTwoDice(ctx, it, kind) : it
        );
        return { ...r, result: { ...r.result, items } };
      })
    );
  };

  const onChangeNd = (newNd: SelectedOption | null) => {
    if (newNd) setNd(newNd.value);
  };

  const onChangeQtd = (qtd: number | null) => {
    if (qtd !== null && qtd <= 0) setNumberOfItems(1);
    else setNumberOfItems(qtd);
  };

  const handleRewardMultChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const val = event.target.value;
    if (val === 'Padrão' || val === 'Metade' || val === 'Dobro')
      setRewardMult(val);
  };

  const formThemeColors = isDarkMode
    ? getSelectTheme('dark')
    : getSelectTheme('default');

  const rewardsSEO = getPageSEO('rewards');

  return (
    <>
      <SEO
        title={rewardsSEO.title}
        description={rewardsSEO.description}
        url='/recompensas'
      />
      <Container maxWidth='lg' sx={{ py: 3 }}>
        <TormentaTitle variant='h4' centered sx={{ mb: 3 }}>
          Gerador de Recompensas
        </TormentaTitle>

        {/* Controls Section */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            backgroundColor: `${theme.palette.primary.main}08`,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Stack
            spacing={1}
            sx={{ alignItems: 'center', mb: 3, textAlign: 'center' }}
          >
            <ToggleButtonGroup
              value={mode}
              exclusive
              onChange={onChangeMode}
              size='small'
              color='primary'
              aria-label='Tabelas usadas na rolagem'
            >
              <ToggleButton value='basic'>Livro básico</ToggleButton>
              <ToggleButton value='supplements'>
                Todos os suplementos
              </ToggleButton>
            </ToggleButtonGroup>
            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
              {mode === 'basic'
                ? 'Tabelas 8-1 a 8-15 do Tormenta20 Jogo do Ano.'
                : 'Tabelas ampliadas com Ameaças, Deuses e Heróis de Arton, da planilha de Guilherme Dei Svaldi.'}
            </Typography>
          </Stack>
          <Stack
            spacing={3}
            direction={{ xs: 'column', md: 'row' }}
            sx={{
              alignItems: { xs: 'stretch', md: 'center' },
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <NumberField
              id='reward-quantity'
              label='Quantidade'
              onValueChange={onChangeQtd}
              sx={{ width: { xs: '100%', sm: '120px' } }}
              size='small'
              value={numberOfItems}
              min={1}
            />

            <Box sx={{ minWidth: 200 }}>
              <Select
                className='filterSelect'
                options={nds}
                value={nds.find((o) => o.value === nd)}
                placeholder='Nível de Dificuldade'
                onChange={onChangeNd}
                theme={(selectTheme) => ({
                  ...selectTheme,
                  colors: {
                    ...formThemeColors,
                  },
                })}
              />
            </Box>

            <FormControl component='fieldset'>
              <FormLabel component='legend' sx={{ fontSize: '0.875rem' }}>
                Multiplicador
              </FormLabel>
              <RadioGroup
                value={rewardMult}
                onChange={handleRewardMultChange}
                row
                sx={{ flexWrap: 'wrap' }}
              >
                <FormControlLabel
                  value='Padrão'
                  control={<Radio size='small' />}
                  label='Padrão'
                />
                <FormControlLabel
                  value='Metade'
                  control={<Radio size='small' />}
                  label='Metade'
                />
                <FormControlLabel
                  value='Dobro'
                  control={<Radio size='small' />}
                  label='Dobro'
                />
              </RadioGroup>
            </FormControl>

            <Button
              onClick={onClickGenerate}
              type='button'
              variant='contained'
              size='large'
              startIcon={<CardGiftcardIcon />}
              sx={{
                px: 4,
                fontFamily: 'Tfont, serif',
                fontWeight: 600,
              }}
            >
              Gerar Recompensa
            </Button>
          </Stack>
        </Paper>

        {/* Multiplier Explanation */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 1,
            borderLeft: `3px solid ${theme.palette.primary.main}`,
            backgroundColor: `${theme.palette.primary.main}08`,
          }}
        >
          <Box component='ul' sx={{ m: 0, pl: 2 }}>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body2' component='span'>
                <Typography
                  component='span'
                  variant='body2'
                  sx={{
                    fontWeight: 600,
                  }}
                >
                  Metade
                </Typography>
                : a criatura tem poucos tesouros; as moedas roladas na coluna
                Dinheiro são divididas pela metade (o valor das riquezas não é
                alterado).
              </Typography>
            </Box>
            <Box component='li'>
              <Typography variant='body2' component='span'>
                <Typography
                  component='span'
                  variant='body2'
                  sx={{
                    fontWeight: 600,
                  }}
                >
                  Dobro
                </Typography>
                : a criatura tem muitos tesouros; role duas vezes em cada coluna
                da tabela.
              </Typography>
            </Box>
          </Box>
        </Paper>

        {mode === 'supplements' && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 3,
              borderRadius: 1,
              borderLeft: `3px solid ${theme.palette.secondary.main}`,
              backgroundColor: `${theme.palette.secondary.main}0D`,
            }}
          >
            <Typography variant='body2' sx={{ mb: 1 }}>
              {SPREADSHEET_BOOK_NOTE}
            </Typography>
            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
              Fonte:{' '}
              <Link href={SPREADSHEET_URL} target='_blank' rel='noopener'>
                Geração de Tesouros em Tormenta20
              </Link>{' '}
              — {TREASURE_DATASETS.supplements.tables.source.credits} Regras que
              a planilha não detalha seguem os livros; quando nenhuma fonte
              decide, o resultado vem com um aviso para o mestre.
            </Typography>
          </Paper>
        )}

        {/* Results Section */}
        {results && results.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography
              variant='h6'
              sx={{
                fontFamily: 'Tfont, serif',
                color: 'primary.main',
                mb: 2,
              }}
            >
              Resultados ({results.length}{' '}
              {results.length === 1 ? 'recompensa' : 'recompensas'})
            </Typography>
            {results.map((r) => (
              <TreasureResultCard
                key={r.id}
                result={r.result}
                showBooks={TREASURE_DATASETS[r.mode].showBooks}
                onChoose={(itemIndex, kind) => onChoose(r.id, itemIndex, kind)}
              />
            ))}
          </Box>
        )}

        {/* Instructions Section */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            backgroundColor: isDarkMode ? 'grey.900' : 'grey.50',
          }}
        >
          <Typography
            variant='h6'
            sx={{
              fontFamily: 'Tfont, serif',
              color: 'primary.main',
              mb: 2,
            }}
          >
            Como gerar o tesouro corretamente?
          </Typography>

          <Stack spacing={2}>
            <Typography variant='body1'>
              Para determinar o tesouro de uma única criatura, use a ND
              equivalente ao nível de desafio da criatura derrotada.
            </Typography>

            <Typography variant='body1'>
              Se o grupo tiver derrotado mais de uma criatura, use a ND
              equivalente ao nível de desafio do combate.
            </Typography>

            <Typography variant='body1'>
              Para criaturas com ND menor do que 1, o nível de desafio do
              combate será igual ao ND da criatura multiplicado pelo número
              delas. Assim, quatro inimigos de ND 1/4 formam um combate de ND 1.
            </Typography>

            <Typography variant='body1'>
              Para criaturas com ND igual ou maior do que 1, o nível de desafio
              do combate será igual ao ND da criatura +2 para cada vez que o
              número delas dobrar. Assim, dois inimigos de ND 5 formam um
              combate de ND 7, quatro inimigos de ND 8 formam um combate de ND
              12 e assim por diante.
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </>
  );
};

export default Rewards;
