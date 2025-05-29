import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Box, useTheme } from '@mui/material';
import styled from '@emotion/styled';
import { CompleteSkill, SkillsAttrs } from '../../interfaces/Skills';
import BookTitle from './common/BookTitle';

interface IProps {
  skills?: CompleteSkill[];
}

const SkillTable: React.FC<IProps> = ({ skills }) => {
  const theme = useTheme();

  const DefaultTbCell = styled(TableCell)`
    border: none;
  `;

  const TableCellSkillTotal = styled(TableCell)`
    border: 1px solid ${theme.palette.primary.dark};
  `;

  const CellFgText = styled.span`
    z-index: 1;
  `;
  const CellBgText = styled.span`
    margin: 8px 0 0 5px;
    color: #c4c4c4;
    font-size: 10px;
    font-align: center;
  `;

  const StyledTableRow = styled(TableRow)(() => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
  }));

  const fmtSkillName = (skillName: string) =>
    // Return first 3 letters in capital case inside parentheses
    `(${skillName.substring(0, 3).toUpperCase()})`;

  return (
    <Box>
      <BookTitle>Perícias</BookTitle>
      <TableContainer component={Paper}>
        <Table aria-label='Perícias' size='small'>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Perícias</strong>
              </TableCell>
              <TableCell align='center'>
                <strong>Total</strong>
              </TableCell>
              <TableCell align='center'>
                <strong>1/2 do Nível</strong>
              </TableCell>
              <TableCell align='center'>
                <strong>Atributo</strong>
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
            {skills?.map((skill) => {
              const skillTotal =
                (skill.halfLevel ?? 0) +
                (skill.modAttr ?? 0) +
                (skill.others ?? 0) +
                (skill.training ?? 0);

              return (
                <StyledTableRow key={skill.name}>
                  <DefaultTbCell component='th' scope='row'>
                    {(skill.training ?? 0) > 0 ? (
                      <strong>• {skill.name}</strong>
                    ) : (
                      <span>{skill.name} </span>
                    )}
                  </DefaultTbCell>
                  <TableCellSkillTotal align='center'>
                    {skillTotal}
                  </TableCellSkillTotal>
                  <DefaultTbCell align='center'>
                    {skill.halfLevel ?? 0}
                  </DefaultTbCell>
                  <DefaultTbCell align='center'>
                    <CellFgText>{skill.modAttr ?? 0}</CellFgText>
                    <CellBgText>
                      {fmtSkillName(SkillsAttrs[skill.name])}
                    </CellBgText>
                  </DefaultTbCell>
                  <DefaultTbCell align='center'>
                    {skill.training ?? 0}
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
    </Box>
  );
};
export default SkillTable;
