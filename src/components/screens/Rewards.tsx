import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  useTheme,
  Chip,
} from '@mui/material';
import Select from 'react-select';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';

import { SEO, getPageSEO } from '../SEO';
import TormentaTitle from '../Database/TormentaTitle';
import getSelectTheme from '../../functions/style';
import { ITEM_TYPE, LEVELS } from '../../interfaces/Rewards';
import {
  rewardGenerator,
  applyMoneyReward,
  applyItemReward,
  RewardGenerated,
} from '../../functions/rewards/rewardsGenerator';

const nds = Object.keys(LEVELS).map((nd) => ({
  value: nd,
  label: `ND ${nd.replace('F', '').replace('S', '1/')}`,
}));

type SelectedOption = { value: string; label: string };

type RewardWithId = RewardGenerated & { id: string };

const Rewards: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const [items, setItems] = useState<RewardWithId[]>();
  const [numberOfItems, setNumberOfItems] = useState<number>(1);
  const [nd, setNd] = useState<LEVELS>(LEVELS.S4);
  const [rewardMult, setRewardMult] = useState<'Padrão' | 'Metade' | 'Dobro'>(
    'Padrão'
  );

  const onClickGenerate = () => {
    const newItems: RewardWithId[] = [];
    const isDouble = rewardMult === 'Dobro';
    const isHalf = rewardMult === 'Metade';

    let itemsToRoll = numberOfItems;

    if (isDouble) itemsToRoll *= 2;

    for (let index = 0; index < itemsToRoll; index += 1) {
      const newItem = rewardGenerator(nd);
      if (newItem.money)
        newItem.moneyApplied = applyMoneyReward(newItem.money, isHalf);
      if (newItem.item)
        newItem.itemApplied = applyItemReward(newItem.item, isDouble);
      newItems.push({ ...newItem, id: crypto.randomUUID() });
    }
    setItems(newItems);
  };

  const onChangeNd = (newNd: SelectedOption | null) => {
    if (newNd) setNd(newNd.value as LEVELS);
  };

  const onChangeQtd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const qtd = e.target.value as unknown as number;

    if (qtd && qtd <= 0) setNumberOfItems(1);
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

  const headerCellSx = {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontFamily: 'Tfont, serif',
    fontWeight: 600,
  };

  const ResultDiv = items?.map((item) => {
    const moneyStr = item?.money?.reward
      ? `${item.money?.reward?.qty}${
          item.money?.reward?.dice > 1 ? `d${item.money?.reward?.dice}` : ''
        }${
          item.money?.reward?.mult > 1 ? `x${item.money?.reward?.mult} ` : ' '
        }${item.money?.reward?.som ? `+${item.money?.reward?.som} ` : ' '}${
          item.money?.reward?.money
        }`
      : '--';

    const itemStr = item?.item?.reward
      ? `${
          item.item.reward.type === ITEM_TYPE.POCAO
            ? `${item.item?.reward?.qty}d${item.item?.reward?.dice}${
                item.item?.reward?.som ? `+${item.item?.reward?.som} ` : ' '
              }`
            : ''
        }${item.item.reward.type}${
          item.item.reward.type === ITEM_TYPE.SUPERIOR
            ? ` (${item.item.reward.mods} modificações) `
            : ''
        }`
      : '--';

    return (
      <Paper
        key={item.id}
        elevation={1}
        sx={{
          mb: 2,
          overflow: 'hidden',
          borderRadius: 1,
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: 3,
          },
        }}
      >
        <TableContainer>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell width='10%' sx={headerCellSx}>
                  ND
                </TableCell>
                <TableCell colSpan={2} sx={headerCellSx}>
                  Dinheiro
                </TableCell>
                <TableCell colSpan={2} sx={headerCellSx}>
                  Itens
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow
                sx={{
                  '&:hover': {
                    backgroundColor: `${theme.palette.primary.main}08`,
                  },
                  transition: 'background-color 0.2s ease',
                }}
              >
                <TableCell>
                  <Chip
                    label={nd.replace('S', '1/').replace('F', '')}
                    size='small'
                    color='primary'
                    sx={{ fontFamily: 'Tfont, serif' }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant='body2' color='text.secondary'>
                    D% = {item?.moneyRoll}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='body2'>{moneyStr}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='body2' color='text.secondary'>
                    D% = {item?.itemRoll}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='body2'>{itemStr}</Typography>
                </TableCell>
              </TableRow>
              {(item.itemApplied || item.moneyApplied) && (
                <TableRow
                  sx={{
                    backgroundColor: `${theme.palette.primary.main}0D`,
                  }}
                >
                  <TableCell />
                  <TableCell />
                  <TableCell>
                    <Typography variant='body2' fontWeight={500}>
                      {item?.money?.reward?.applyRollBonus ? '+% ' : ''}
                      {item.moneyApplied}
                    </Typography>
                  </TableCell>
                  <TableCell />
                  <TableCell sx={{ whiteSpace: 'pre-wrap' }}>
                    <Typography variant='body2' fontWeight={500}>
                      {item?.item?.reward?.applyRollBonus ? '+% ' : ''}
                      {item.itemApplied}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  });

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
            spacing={3}
            direction={{ xs: 'column', md: 'row' }}
            alignItems={{ xs: 'stretch', md: 'center' }}
            justifyContent='center'
            flexWrap='wrap'
          >
            <TextField
              id='reward-quantity'
              label='Quantidade'
              type='number'
              variant='outlined'
              onChange={onChangeQtd}
              sx={{ width: { xs: '100%', sm: '120px' } }}
              size='small'
              value={numberOfItems}
              inputProps={{ min: 1 }}
            />

            <Box sx={{ minWidth: 200 }}>
              <Select
                className='filterSelect'
                options={nds}
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
                <Typography component='span' fontWeight={600} variant='body2'>
                  Metade
                </Typography>
                : A criatura tem poucos tesouros; quaisquer resultados rolados
                para dinheiro é dividido pela metade.
              </Typography>
            </Box>
            <Box component='li'>
              <Typography variant='body2' component='span'>
                <Typography component='span' fontWeight={600} variant='body2'>
                  Dobro
                </Typography>
                : Será rolado normalmente, duas vezes para dinheiro e duas vezes
                para itens.
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Results Section */}
        {items && items.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography
              variant='h6'
              sx={{
                fontFamily: 'Tfont, serif',
                color: 'primary.main',
                mb: 2,
              }}
            >
              Resultados ({items.length}{' '}
              {items.length === 1 ? 'recompensa' : 'recompensas'})
            </Typography>
            {ResultDiv}
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
