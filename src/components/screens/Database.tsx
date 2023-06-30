import React, { useEffect, useState } from 'react';
import { Stack, Button, Container, Paper } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import BrowseGalleryIcon from '@mui/icons-material/BrowseGallery';
import FilterDramaIcon from '@mui/icons-material/FilterDrama';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { Switch, Route, useRouteMatch, useHistory } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import RacesTable from '../DatabaseTables/RacesTable';
import ClassesTable from '../DatabaseTables/ClassesTable';
import DivindadesTable from '../DatabaseTables/DivindadesTable';
import PowersTable from '../DatabaseTables/PowersTable';
import SpellsTable from '../DatabaseTables/SpellsTable';
import OriginsTable from '../DatabaseTables/OriginsTable';

interface IProps {
  isDarkMode?: boolean;
}

const DatabaseMenuItem: React.FC<{
  selected: boolean;
  onClick: () => void;
  title: string;
  icon: React.ReactElement;
  disabled?: boolean;
}> = ({ selected, onClick, title, icon, disabled }) => {
  const isMobile = useMediaQuery('(max-width: 720px)');
  return (
    <Button
      sx={{
        border: '1px solid #d13235',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: isMobile ? 14 : 20,
        width: isMobile ? 100 : 150,
        cursor: 'pointer',
        background: selected ? '#d13235' : 'white',
        color: selected ? 'white' : '#d13235',
      }}
      onClick={onClick}
      disabled={disabled}
    >
      {icon}
      {title}
    </Button>
  );
};

const Database: React.FC<IProps> = () => {
  const [selectedMenu, setSelectedMenu] = useState<number>(-1);
  const { path, url } = useRouteMatch();
  const history = useHistory();
  const isMobile = useMediaQuery('(max-width: 720px)');

  const onSelectMenu = (menu: number, name: string) => {
    setSelectedMenu(menu);
    history.push(`${url}/${name}`);
  };

  useEffect(() => {
    const { pathname } = history.location;

    if (pathname.includes('raças')) setSelectedMenu(0);
    else if (pathname.includes('classes')) setSelectedMenu(1);
    else if (pathname.includes('origens')) setSelectedMenu(2);
    else if (pathname.includes('divindades')) setSelectedMenu(3);
    else if (pathname.includes('poderes')) setSelectedMenu(4);
    else if (pathname.includes('magias')) setSelectedMenu(5);
    else setSelectedMenu(-1);
  }, [history.location]);

  return (
    <Container>
      <Stack
        direction={isMobile ? 'column' : 'row'}
        spacing={2}
        justifyContent='start'
        alignItems='start'
        sx={{ mt: 2, mb: 2 }}
      >
        <Stack
          direction={isMobile ? 'row' : 'column'}
          spacing={2}
          justifyContent='center'
          alignItems='start'
          sx={{
            flexWrap: isMobile ? 'wrap' : 'nowrap',
          }}
        >
          <DatabaseMenuItem
            selected={selectedMenu === 0}
            onClick={() => onSelectMenu(0, 'raças')}
            title='Raças'
            icon={<GroupIcon />}
          />
          <DatabaseMenuItem
            selected={selectedMenu === 1}
            onClick={() => onSelectMenu(1, 'classes')}
            title='Classes'
            icon={<WhatshotIcon />}
          />
          <DatabaseMenuItem
            selected={selectedMenu === 2}
            onClick={() => onSelectMenu(2, 'origens')}
            title='Origens'
            icon={<BrowseGalleryIcon />}
          />
          <DatabaseMenuItem
            selected={selectedMenu === 3}
            onClick={() => onSelectMenu(3, 'divindades')}
            title='Divindades'
            icon={<FilterDramaIcon />}
          />
          <DatabaseMenuItem
            selected={selectedMenu === 4}
            onClick={() => onSelectMenu(4, 'poderes')}
            title='Poderes'
            icon={<LocalFireDepartmentIcon />}
          />
          <DatabaseMenuItem
            selected={selectedMenu === 5}
            onClick={() => onSelectMenu(5, 'magias')}
            title='Magias'
            icon={<AutoFixHighIcon />}
          />
        </Stack>

        <Switch>
          <Route exact path={path}>
            <Paper sx={{ width: '100%', height: '40vh', p: 2 }}>
              <p>Selecione uma das categorias ao lado.</p>
            </Paper>
          </Route>
          <Route path={`${path}/raças/:selectedRace?`}>
            <RacesTable />
          </Route>
          <Route path={`${path}/classes/:selectedClass?`}>
            <ClassesTable />
          </Route>
          <Route path={`${path}/origens/:selectedOrigin?`}>
            <OriginsTable />
          </Route>
          <Route path={`${path}/divindades/:selectedGod?`}>
            <DivindadesTable />
          </Route>
          <Route path={`${path}/poderes/:selectedPower?`}>
            <PowersTable />
          </Route>
          <Route path={`${path}/magias`}>
            <SpellsTable />
          </Route>
        </Switch>
      </Stack>
    </Container>
  );
};

export default Database;
