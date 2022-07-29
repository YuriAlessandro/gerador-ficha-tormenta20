import React, { useEffect, useState } from 'react';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import { Route, useHistory, useRouteMatch } from 'react-router';
import ArcaneTable from './ArcaneTable';
import DivineTable from './DivineTable';

const SpellsTable: React.FC = () => {
  const [value, setValue] = useState(0);
  const { path, url } = useRouteMatch();
  const history = useHistory();

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  useEffect(() => {
    const name = value === 0 ? 'arcanas' : 'divinas';
    history.push(`${url}/${name}`);
  }, [value]);

  return (
    <Box sx={{ bgcolor: 'background.paper', width: '100%' }}>
      <AppBar position='static' sx={{ width: '100%' }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label='basic tabs example'
          variant='fullWidth'
        >
          <Tab label='Arcanas' id='tab1' />
          <Tab label='Divinas' id='tab2' />
        </Tabs>
      </AppBar>
      <Route path={`${path}/arcanas/:selectedSpell?`}>
        <ArcaneTable />
      </Route>
      <Route path={`${path}/divinas/:selectedSpell?`}>
        <DivineTable />
      </Route>
    </Box>
  );
};

export default SpellsTable;
