import React from 'react';

import Typography from '@material-ui/core/Typography';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';

const Sidebar = ({visible, onCloseSidebar}) => {
  const styles = {
    sidebar: {
      position: 'absolute',
      background: 'rgba(0,0,0,0.95)',
      top: '0',
      width: '300px',
      height: '97.9vh',
      zIndex: '1',
      boxShadow: '5px 0px 5px 0px rgba(0,0,0,0.75)',
      color: '#FAFAFA',
      display: visible ? 'block' : 'none',
      paddingTop: '20px',
      transition: 'width 20s',
    },
    closeIcon: {
      textAlign: 'right',
      paddingRight: '15px'
    },
  }
  return (
    <div style={styles.sidebar}>
      <div style={styles.closeIcon}>
        <Typography style={{cursor: 'pointer'}} onClick={onCloseSidebar} variant="inherit">X</Typography>
      </div>
      <MenuList>
        <MenuItem>
          <Typography variant="inherit">Sugestões, Ideias e Feedbacks</Typography>
        </MenuItem>
        <MenuItem>
          <Typography variant="inherit">Contribua com o Projeto</Typography>
        </MenuItem>
      </MenuList>
    </div>
  )
}

export default Sidebar;