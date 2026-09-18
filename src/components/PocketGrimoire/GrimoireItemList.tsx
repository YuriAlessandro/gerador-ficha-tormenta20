import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  IconButton,
  Link,
  List,
  ListItem,
  ListSubheader,
  Tooltip,
  Typography,
} from '@mui/material';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import {
  encyclopediaPath,
  itemTitle,
  ResolvedGroup,
} from '../../functions/pocketGrimoire/resolveItems';

interface Props {
  groups: ResolvedGroup[];
  onRemove: (itemId: string) => void;
  /** Chamado ao seguir um link (o balão fecha no celular). */
  onItemClick?: () => void;
}

/** Lista só de nomes, agrupada — o resumo que cabe no balão. */
const GrimoireItemList: React.FC<Props> = ({
  groups,
  onRemove,
  onItemClick,
}) => (
  <List dense disablePadding>
    {groups.map((group) => (
      <Box component='li' key={group.key} sx={{ listStyle: 'none' }}>
        <ListSubheader
          component='div'
          disableSticky
          sx={{
            lineHeight: '28px',
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: 'primary.main',
            bgcolor: 'transparent',
            px: 0,
          }}
        >
          {group.label} ({group.items.length})
        </ListSubheader>
        <Box component='ul' sx={{ p: 0, m: 0 }}>
          {group.items.map((item) => {
            const title = itemTitle(item);
            return (
              <ListItem
                key={item.id}
                disableGutters
                secondaryAction={
                  <Tooltip title='Remover'>
                    <IconButton
                      edge='end'
                      size='small'
                      aria-label={`Remover ${title}`}
                      onClick={() => onRemove(item.id)}
                    >
                      <DeleteOutlinedIcon fontSize='small' />
                    </IconButton>
                  </Tooltip>
                }
              >
                {item.kind === 'missing' ? (
                  <Typography
                    variant='body2'
                    sx={{ color: 'text.secondary', fontStyle: 'italic' }}
                  >
                    {title}
                  </Typography>
                ) : (
                  <Link
                    component={RouterLink}
                    to={encyclopediaPath(item.entry)}
                    variant='body2'
                    underline='hover'
                    onClick={onItemClick}
                  >
                    {title}
                  </Link>
                )}
              </ListItem>
            );
          })}
        </Box>
      </Box>
    ))}
  </List>
);

export default GrimoireItemList;
