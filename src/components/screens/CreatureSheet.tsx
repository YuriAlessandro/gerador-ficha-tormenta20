import React from 'react';
import Select from 'react-select';
import getSelectTheme from '../../functions/style';

interface IProps {
  isDarkMode: boolean;
}

const CreatureSheet: React.FC<IProps> = ({ isDarkMode }) => {
  const formThemeColors = isDarkMode
    ? getSelectTheme('dark')
    : getSelectTheme('default');

  return (
    <div id='main-screen'>
      <div className='filterArea'>
        <div className='filtersRow'>
          <Select
            className='filterSelect'
            // options={[{ value: '', label: 'Todas as raças' }, ...racas]}
            placeholder='Todos os tipos'
            // onChange={onSelectRaca}
            style={{ background: 'blue' }}
            theme={(theme) => ({
              ...theme,
              colors: {
                ...formThemeColors,
              },
            })}
          />
        </div>
      </div>
    </div>
  );
};

export default CreatureSheet;
