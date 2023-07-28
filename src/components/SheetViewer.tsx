import {
  Box,
  Button,
  Card,
  Stack,
  Tab,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React from 'react';
import EditIcon from '@mui/icons-material/Edit';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import LabelDisplay from './SheetBuilder/common/LabelDisplay';

import SheetPreviewStats from './SheetBuilder/SheetPreview/SheetPreviewStats';
import SheetPreviewPowers from './SheetBuilder/SheetPreview/SheetPreviewPowers';
import SheetPreviewSpells from './SheetBuilder/SheetPreview/SheetPreviewSpells';
import SheetPreviewInventory from './SheetBuilder/SheetPreview/SheetPreviewInventory';
import SheetPreviewSkills from './SheetBuilder/SheetPreview/SheetPreviewSkills';
import SheetPreviewDefense from './SheetBuilder/SheetPreview/SheetPreviewDefense';
import SheetPreviewPoints from './SheetBuilder/SheetPreview/SheetPreviewPoints';
import SheetPreviewAtacks from './SheetBuilder/SheetPreview/SheetPreviewAtacks';

interface Props {
  handleChange: (idx: number) => void;
  allowEdition: boolean;
  title: string;
  level: number;
  displacement: number;
}

const SheetViewer: React.FC<Props> = ({
  handleChange,
  allowEdition,
  title,
  level,
  displacement,
}) => {
  const theme = useTheme();
  const isScreen = useMediaQuery('(min-width: 720px)');

  const [value, setValue] = React.useState('1');

  const onChangeTab = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', flexDirection: isScreen ? 'row' : 'column' }}>
        {/* LADO ESQUERDO (MAYBE 60%) */}
        <Box sx={{ width: isScreen ? '60%' : '100%', pr: 5 }}>
          {/* PARTE DE CIMA: Nome, Raça, Origem, Classe, Nível, Divindade, PM, PM e Defesa */}
          <Card sx={{ p: 3, pb: 10, mb: 2 }}>
            <Stack
              direction={isScreen ? 'row' : 'column'}
              justifyContent='space-between'
            >
              <Stack
                direction={isScreen ? 'row' : 'column'}
                spacing={2}
                alignItems={isScreen ? 'flex-start' : 'center'}
              >
                <Box
                  sx={{
                    width: '150px',
                    height: '200px',
                    backgroundColor: 'lightgray',
                    border: `2px solid ${theme.palette.primary.main}`,
                    cursor: 'pointer',
                  }}
                />
                <Stack direction='column'>
                  <LabelDisplay text='NOME_PERSONAGEM' size='large' />
                  <Box sx={{ mt: 1 }}>
                    <LabelDisplay text={title} size='medium' />
                    <Stack direction='row' spacing={1} alignItems='center'>
                      <LabelDisplay
                        title='Level'
                        text={`${level}`}
                        size='small'
                      />
                      <Button
                        disabled
                        variant='contained'
                        size='small'
                        title='Subir de nível'
                      >
                        <UpgradeIcon /> Subir de nível
                      </Button>
                    </Stack>
                    <LabelDisplay
                      title='Deslocamento'
                      text={`${displacement}m`}
                      size='small'
                    />
                  </Box>
                </Stack>
                {allowEdition && (
                  <Button
                    variant='outlined'
                    onClick={() => handleChange(1)}
                    startIcon={<EditIcon />}
                  >
                    Editar Ficha
                  </Button>
                )}
              </Stack>
              <Stack
                direction='row'
                justifyContent='center'
                alignItems='center'
                spacing={2}
              >
                <SheetPreviewPoints />
                <SheetPreviewDefense />
              </Stack>
            </Stack>
          </Card>

          {/* Atributos */}
          <Box sx={{ mt: '-90px' }}>
            <SheetPreviewStats />
          </Box>

          <Stack direction='column' spacing={2}>
            {/* Ataques, Poderes, Magias e Notas */}
            <Card sx={{ minHeight: '510px' }}>
              <TabContext value={value}>
                <TabList
                  onChange={onChangeTab}
                  sx={{
                    backgroundColor: theme.palette.primary.dark,
                  }}
                >
                  <Tab label='Ataques' value='1' />
                  <Tab label='Poderes' value='2' />
                  <Tab label='Magias' value='3' />
                  <Tab label='Inventário' value='4' />
                </TabList>
                <TabPanel value='1'>
                  <SheetPreviewAtacks />
                </TabPanel>
                <TabPanel value='2'>
                  <SheetPreviewPowers />
                </TabPanel>
                <TabPanel value='3'>
                  <SheetPreviewSpells />
                </TabPanel>
                <TabPanel value='4'>
                  <SheetPreviewInventory />
                </TabPanel>
              </TabContext>
            </Card>
          </Stack>
        </Box>
        {/* LADO DIREITO (MAYBE 40%) */}
        {/* Perícias */}
        <Card>
          <SheetPreviewSkills />
        </Card>
      </Box>
    </Box>
  );
};

export default SheetViewer;
