import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Fade,
  Tabs,
  Tab,
  Paper,
  Grid,
  Card,
  CardContent,
  Typography,
} from '@mui/material';
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
import TormentaTitle from '../Database/TormentaTitle';

interface IProps {
  isDarkMode?: boolean;
}

// Menu items configuration
const menuItems = [
  {
    id: 0,
    title: 'Raças',
    icon: <GroupIcon />,
    route: 'raças',
  },
  {
    id: 1,
    title: 'Classes',
    icon: <WhatshotIcon />,
    route: 'classes',
  },
  {
    id: 2,
    title: 'Origens',
    icon: <BrowseGalleryIcon />,
    route: 'origens',
  },
  {
    id: 3,
    title: 'Divindades',
    icon: <FilterDramaIcon />,
    route: 'divindades',
  },
  {
    id: 4,
    title: 'Poderes',
    icon: <LocalFireDepartmentIcon />,
    route: 'poderes',
  },
  {
    id: 5,
    title: 'Magias',
    icon: <AutoFixHighIcon />,
    route: 'magias',
  },
];

const Database: React.FC<IProps> = () => {
  const [selectedMenu, setSelectedMenu] = useState<number>(-1);
  const [isLoaded, setIsLoaded] = useState(false);
  const { path, url } = useRouteMatch();
  const history = useHistory();
  const isMobile = useMediaQuery('(max-width: 720px)');

  const onSelectMenu = (menu: number, route: string) => {
    setSelectedMenu(menu);
    history.push(`${url}/${route}`);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    if (newValue === -1) {
      history.push(url);
      setSelectedMenu(-1);
    } else {
      const selectedItem = menuItems[newValue];
      onSelectMenu(selectedItem.id, selectedItem.route);
    }
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

  useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Container className='database-container' maxWidth='xl'>
      <Fade in={isLoaded} timeout={800}>
        <Box>
          <TormentaTitle
            variant='h3'
            centered
            gradient
            glow
            sx={{ mb: 4, mt: 2 }}
          >
            Enciclópedia de Tanah-Toh
          </TormentaTitle>

          {/* Modern Navigation */}
          <Box sx={{ mb: 3 }}>
            {selectedMenu === -1 ? (
              // Welcome screen with beautiful card grid
              <Grid container spacing={3} sx={{ mt: 2 }}>
                {menuItems.map((item, index) => (
                  <Grid item xs={12} sm={6} md={4} key={item.id}>
                    <Card
                      onClick={() => onSelectMenu(item.id, item.route)}
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        background:
                          'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                        border: '1px solid rgba(209, 50, 53, 0.1)',
                        '&:hover': {
                          transform: 'translateY(-8px) scale(1.02)',
                          boxShadow: '0 12px 24px rgba(209, 50, 53, 0.2)',
                          background:
                            'linear-gradient(135deg, #d13235 0%, #922325 100%)',
                          color: 'white',
                          '& .MuiCardContent-root': {
                            color: 'white',
                          },
                          '& .card-icon': {
                            color: 'white',
                            transform: 'scale(1.2)',
                          },
                        },
                        animation: `fadeInUp 0.6s ease-out ${
                          index * 0.1
                        }s both`,
                        '@keyframes fadeInUp': {
                          from: {
                            opacity: 0,
                            transform: 'translateY(30px)',
                          },
                          to: {
                            opacity: 1,
                            transform: 'translateY(0)',
                          },
                        },
                      }}
                    >
                      <CardContent
                        sx={{
                          textAlign: 'center',
                          py: 4,
                          transition: 'color 0.3s ease',
                        }}
                      >
                        <Box
                          className='card-icon'
                          sx={{
                            mb: 2,
                            color: '#d13235',
                            fontSize: '3rem',
                            transition: 'all 0.3s ease',
                          }}
                        >
                          {item.icon}
                        </Box>
                        <Typography
                          variant='h5'
                          sx={{
                            fontFamily: 'Tfont, serif',
                            fontWeight: 600,
                            mb: 1,
                          }}
                        >
                          {item.title}
                        </Typography>
                        <Typography
                          variant='body2'
                          color='text.secondary'
                          sx={{ fontSize: '0.9rem' }}
                        >
                          Explorar {item.title.toLowerCase()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              // Tab navigation when content is selected
              <Paper
                elevation={0}
                sx={{
                  mb: 3,
                  background:
                    'linear-gradient(135deg, #d13235 0%, #922325 100%)',
                  borderRadius: 2,
                }}
              >
                <Tabs
                  value={selectedMenu}
                  onChange={handleTabChange}
                  variant={isMobile ? 'scrollable' : 'fullWidth'}
                  scrollButtons={isMobile ? 'auto' : false}
                  sx={{
                    '& .MuiTab-root': {
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontFamily: 'Tfont, serif',
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '1rem',
                      minHeight: 60,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        color: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                      '&.Mui-selected': {
                        color: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      },
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: 'white',
                      height: 3,
                    },
                  }}
                >
                  {menuItems.map((item) => (
                    <Tab
                      key={item.id}
                      label={item.title}
                      icon={item.icon}
                      iconPosition='start'
                      sx={{ gap: 1 }}
                    />
                  ))}
                </Tabs>
              </Paper>
            )}
          </Box>

          {/* Content Section */}
          <Box
            className='database-content'
            sx={{ minHeight: selectedMenu === -1 ? 'auto' : '500px' }}
          >
            {selectedMenu !== -1 && (
              <Switch>
                <Route path={`${path}/raças/:selectedRace?`}>
                  <Box className='table-container'>
                    <RacesTable />
                  </Box>
                </Route>
                <Route path={`${path}/classes/:selectedClass?`}>
                  <Box className='table-container'>
                    <ClassesTable />
                  </Box>
                </Route>
                <Route path={`${path}/origens/:selectedOrigin?`}>
                  <Box className='table-container'>
                    <OriginsTable />
                  </Box>
                </Route>
                <Route path={`${path}/divindades/:selectedGod?`}>
                  <Box className='table-container'>
                    <DivindadesTable />
                  </Box>
                </Route>
                <Route path={`${path}/poderes/:selectedPower?`}>
                  <Box className='table-container'>
                    <PowersTable />
                  </Box>
                </Route>
                <Route path={`${path}/magias/:selectedSpell?`}>
                  <Box className='table-container'>
                    <SpellsTable />
                  </Box>
                </Route>
              </Switch>
            )}
          </Box>
        </Box>
      </Fade>
    </Container>
  );
};

export default Database;
