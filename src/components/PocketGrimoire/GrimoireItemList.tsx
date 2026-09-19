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
  useTheme,
} from '@mui/material';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import {
  encyclopediaPath,
  itemTitle,
  ResolvedGroup,
} from '../../functions/pocketGrimoire/resolveItems';
import { presentItem, typeLabel } from './cards/itemPresentation';
import { accentFrame } from './cards/accentColor';

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
}) => {
  const theme = useTheme();
  const ellipsis = {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  } as const;

  return (
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
              const view = presentItem(item);
              return (
                <ListItem
                  key={item.id}
                  disableGutters
                  secondaryAction={
                    <Tooltip title='Remover'>
                      <IconButton
                        size='small'
                        aria-label={`Remover ${title}`}
                        onClick={() => onRemove(item.id)}
                      >
                        <DeleteOutlinedIcon fontSize='small' />
                      </IconButton>
                    </Tooltip>
                  }
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      minWidth: 0,
                    }}
                  >
                    {/* Marca do tipo: a mesma cor da moldura da carta. */}
                    <Box
                      title={typeLabel(view)}
                      data-accent={view.accent}
                      sx={{
                        flex: 'none',
                        width: 8,
                        height: 14,
                        borderRadius: 0.5,
                        background: accentFrame(theme, view.accent),
                        outline:
                          view.accent === 'missing'
                            ? `1px dashed ${theme.palette.divider}`
                            : 'none',
                      }}
                    />
                    {item.kind === 'missing' ? (
                      <Typography
                        variant='body2'
                        sx={{
                          ...ellipsis,
                          color: 'text.secondary',
                          fontStyle: 'italic',
                        }}
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
                        title={title}
                        sx={ellipsis}
                      >
                        {title}
                      </Link>
                    )}
                  </Box>
                </ListItem>
              );
            })}
          </Box>
        </Box>
      ))}
    </List>
  );
};

export default GrimoireItemList;
