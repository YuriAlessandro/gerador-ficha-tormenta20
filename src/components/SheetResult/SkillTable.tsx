import React, { useState, useCallback, useMemo, useEffect } from 'react';
import debounce from 'lodash/debounce';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import {
  Box,
  useTheme,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CheckIcon from '@mui/icons-material/Check';
import styled from '@emotion/styled';
import CharacterSheet from '@/interfaces/CharacterSheet';
import { CompleteSkill, TrainedOnlySkills } from '../../interfaces/Skills';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import BookTitle from './common/BookTitle';
import { rollD20 } from '../../functions/diceRoller';
import { useDiceRoll } from '../../premium/hooks/useDiceRoll';
import SkillActionsDialog from './SkillActionsDialog';

const ATTR_ABBREVIATIONS: Record<Atributo, string> = {
  [Atributo.FORCA]: 'For',
  [Atributo.DESTREZA]: 'Des',
  [Atributo.CONSTITUICAO]: 'Con',
  [Atributo.INTELIGENCIA]: 'Int',
  [Atributo.SABEDORIA]: 'Sab',
  [Atributo.CARISMA]: 'Car',
};

interface IProps {
  sheet: CharacterSheet;
  skills?: CompleteSkill[];
}

const SkillTable: React.FC<IProps> = ({ sheet, skills }) => {
  const theme = useTheme();
  const { showDiceResult } = useDiceRoll();
  const [actionsDialogOpen, setActionsDialogOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<CompleteSkill | null>(
    null
  );
  const [selectedSkillTotal, setSelectedSkillTotal] = useState(0);
  const [selectedAttrValue, setSelectedAttrValue] = useState(0);
  const [selectedAttrName, setSelectedAttrName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [localSearchQuery, setLocalSearchQuery] = useState('');

  // Debounced search update
  const debouncedSetSearchQuery = useMemo(
    () =>
      debounce((value: string) => {
        setSearchQuery(value);
      }, 300),
    []
  );

  // Cleanup debounce on unmount
  useEffect(
    () => () => {
      debouncedSetSearchQuery.cancel();
    },
    [debouncedSetSearchQuery]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setLocalSearchQuery(value);
      debouncedSetSearchQuery(value);
    },
    [debouncedSetSearchQuery]
  );

  const handleClearSearch = useCallback(() => {
    setLocalSearchQuery('');
    setSearchQuery('');
    debouncedSetSearchQuery.cancel();
  }, [debouncedSetSearchQuery]);

  const filteredSkills = useMemo(() => {
    if (!skills) return [];
    if (!searchQuery) return skills;
    return skills.filter((skill) =>
      skill.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [skills, searchQuery]);

  const DefaultTbCell = styled(TableCell)`
    border: none;
    font-size: 12px;
  `;

  const ClickableSkillName = styled.span`
    cursor: pointer;
    user-select: none;
    text-decoration: underline dotted;
    transition: all 0.2s ease;
    font-size: 14px;

    &:hover {
      color: ${theme.palette.primary.main};
      text-decoration: underline solid;
    }

    &:active {
      transform: scale(0.98);
    }
  `;

  const TableCellSkillTotal = styled(TableCell)`
    border: 1px solid ${theme.palette.primary.dark};
    cursor: pointer;
    user-select: none;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: ${theme.palette.action.hover};
    }

    &:active {
      transform: scale(0.98);
    }
  `;

  const StyledTableRow = styled(TableRow)(() => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
  }));

  const handleSkillRoll = useCallback(
    (skill: CompleteSkill, skillTotal: number, actionName?: string) => {
      const d20Roll = rollD20();
      const total = Math.max(1, d20Roll + skillTotal);
      const isCritical = d20Roll === 20;
      const isFumble = d20Roll === 1;

      // Format dice notation with sign
      const modifierStr = skillTotal >= 0 ? `+${skillTotal}` : `${skillTotal}`;
      const diceNotation = `1d20${modifierStr}`;

      const label = actionName
        ? `${skill.name} (${actionName})`
        : `Teste de ${skill.name}`;

      showDiceResult(
        label,
        [
          {
            label: actionName || skill.name,
            diceNotation,
            rolls: [d20Roll],
            modifier: skillTotal,
            total,
            isCritical,
            isFumble,
          },
        ],
        sheet.nome
      );
    },
    [showDiceResult, sheet.nome]
  );

  const handleSkillNameClick = (
    skill: CompleteSkill,
    skillTotal: number,
    attrValue: number,
    attrName: string
  ) => {
    setSelectedSkill(skill);
    setSelectedSkillTotal(skillTotal);
    setSelectedAttrValue(attrValue);
    setSelectedAttrName(attrName);
    setActionsDialogOpen(true);
  };

  const handleSkillTotalClick = (skill: CompleteSkill, skillTotal: number) => {
    handleSkillRoll(skill, skillTotal);
  };

  const handleActionRoll = (actionName: string) => {
    if (selectedSkill) {
      handleSkillRoll(selectedSkill, selectedSkillTotal, actionName);
    }
  };

  const handleCloseActionsDialog = () => {
    setActionsDialogOpen(false);
    setSelectedSkill(null);
  };

  return (
    <Box>
      <BookTitle>Perícias</BookTitle>
      <TextField
        fullWidth
        size='small'
        placeholder='Buscar perícia...'
        value={localSearchQuery}
        onChange={handleSearchChange}
        sx={{ p: 1.5, width: '95%' }}
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <SearchIcon color='action' fontSize='small' />
            </InputAdornment>
          ),
          endAdornment: localSearchQuery && (
            <InputAdornment position='end'>
              <IconButton size='small' onClick={handleClearSearch} edge='end'>
                <ClearIcon fontSize='small' />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 3,
          py: 1,
          px: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <strong>½ Nível:</strong> {skills?.[0]?.halfLevel ?? 0}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <strong>Treino:</strong>{' '}
          {skills?.find((s) => (s.training ?? 0) > 0)?.training ?? 0}
        </Box>
      </Box>
      <TableContainer component={Paper}>
        <Table
          aria-label='Perícias'
          size='small'
          sx={{ borderCollapse: 'separate', borderSpacing: 0 }}
        >
          <TableHead>
            <TableRow>
              <TableCell align='center'>
                <strong>Total</strong>
              </TableCell>
              <TableCell>
                <strong>Perícias</strong>
              </TableCell>
              <TableCell align='center'>
                <strong>Treino</strong>
              </TableCell>
              <TableCell align='center'>
                <strong>Outros</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody sx={{ border: 'none' }}>
            {filteredSkills.map((skill) => {
              const attrValue = skill.modAttr
                ? sheet.atributos[skill.modAttr].value
                : 0;

              const skillTotal =
                (skill.halfLevel ?? 0) +
                (attrValue ?? 0) +
                (skill.others ?? 0) +
                (skill.training ?? 0);

              const isTrained = (skill.training ?? 0) > 0;
              const attrName = skill.modAttr ?? '';
              const isTrainedOnly = TrainedOnlySkills.includes(skill.name);
              const attrAbbr = skill.modAttr
                ? ATTR_ABBREVIATIONS[skill.modAttr]
                : '';

              return (
                <StyledTableRow key={skill.name}>
                  <TableCellSkillTotal
                    align='center'
                    onClick={() => handleSkillTotalClick(skill, skillTotal)}
                    title={`Rolar ${skill.name}`}
                  >
                    {skillTotal}
                  </TableCellSkillTotal>
                  <DefaultTbCell component='th' scope='row'>
                    <ClickableSkillName
                      onClick={() =>
                        handleSkillNameClick(
                          skill,
                          skillTotal,
                          attrValue,
                          attrName
                        )
                      }
                      title={`Ver ações de ${skill.name}`}
                    >
                      {isTrained ? <strong>{skill.name}</strong> : skill.name}
                      {isTrainedOnly && '*'}
                      {attrAbbr && (
                        <span style={{ opacity: 0.6, marginLeft: 4 }}>
                          ({attrAbbr})
                        </span>
                      )}
                    </ClickableSkillName>
                  </DefaultTbCell>
                  <DefaultTbCell align='center'>
                    {isTrained && (
                      <CheckIcon fontSize='small' color='success' />
                    )}
                  </DefaultTbCell>
                  <DefaultTbCell align='center'>
                    {skill.others ?? 0}
                  </DefaultTbCell>
                </StyledTableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ display: 'block', mt: 1, px: 1.5 }}
      >
        * Somente treinada
      </Typography>
      <SkillActionsDialog
        open={actionsDialogOpen}
        onClose={handleCloseActionsDialog}
        skill={selectedSkill}
        skillTotal={selectedSkillTotal}
        attrValue={selectedAttrValue}
        attrName={selectedAttrName}
        onRoll={handleActionRoll}
      />
    </Box>
  );
};
export default SkillTable;
