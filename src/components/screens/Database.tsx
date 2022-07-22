import React, { useState } from 'react';
import { Stack, Button, Container } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import BrowseGalleryIcon from '@mui/icons-material/BrowseGallery';
import FilterDramaIcon from '@mui/icons-material/FilterDrama';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import RacesTable from '../DatabaseTables/RacesTable';
import ClassesTable from '../DatabaseTables/ClassesTable';
import DivindadesTable from '../DatabaseTables/DivindadesTable';

interface IProps {
  isDarkMode: boolean;
}

const DatabaseMenuItem: React.FC<{
  selected: boolean;
  onClick: () => void;
  title: string;
  icon: React.ReactElement;
  disabled?: boolean;
}> = ({ selected, onClick, title, icon, disabled }) => (
  <Button
    sx={{
      border: '1px solid #d13235',
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: 20,
      width: 150,
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

const Database: React.FC<IProps> = ({ isDarkMode }) => {
  const [selectedMenu, setSelectedMenu] = useState<number>(0);

  const onSelectMenu = (menu: number) => {
    setSelectedMenu(menu);
  };

  return (
    <Container>
      <Stack
        direction='row'
        spacing={2}
        justifyContent='center'
        alignItems='start'
        sx={{ mt: 2, mb: 2 }}
      >
        <Stack
          direction='column'
          spacing={2}
          justifyContent='center'
          alignItems='start'
        >
          <DatabaseMenuItem
            selected={selectedMenu === 0}
            onClick={() => onSelectMenu(0)}
            title='Raças'
            icon={<GroupIcon />}
          />
          <DatabaseMenuItem
            selected={selectedMenu === 1}
            onClick={() => onSelectMenu(1)}
            title='Classes'
            icon={<WhatshotIcon />}
          />
          <DatabaseMenuItem
            selected={selectedMenu === 2}
            onClick={() => onSelectMenu(2)}
            title='Origens'
            icon={<BrowseGalleryIcon />}
            disabled
          />
          <DatabaseMenuItem
            selected={selectedMenu === 3}
            onClick={() => onSelectMenu(3)}
            title='Deuses'
            icon={<FilterDramaIcon />}
          />
          <DatabaseMenuItem
            selected={selectedMenu === 4}
            onClick={() => onSelectMenu(4)}
            title='Poderes'
            icon={<LocalFireDepartmentIcon />}
            disabled
          />
          <DatabaseMenuItem
            selected={selectedMenu === 5}
            onClick={() => onSelectMenu(5)}
            title='Magias'
            icon={<AutoFixHighIcon />}
            disabled
          />
        </Stack>

        {selectedMenu === 0 && <RacesTable />}
        {selectedMenu === 1 && <ClassesTable />}
        {selectedMenu === 3 && <DivindadesTable />}
      </Stack>
    </Container>
  );
};

export default Database;
