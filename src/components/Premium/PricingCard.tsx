import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Chip,
  useTheme,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { PricingPlan } from '../../types/subscription.types';
import PremiumBadge from './PremiumBadge';

interface PricingCardProps {
  plan: PricingPlan;
  currentTier?: string;
  onSelect: () => void;
  loading?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({
  plan,
  currentTier,
  onSelect,
  loading = false,
}) => {
  const theme = useTheme();
  const isCurrent = currentTier === plan.tier;
  const isPremiumPlan = plan.tier !== 'free';

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        border: plan.recommended
          ? '3px solid #FFD700'
          : `1px solid ${theme.palette.divider}`,
        boxShadow: plan.recommended
          ? '0 8px 32px rgba(255, 215, 0, 0.3)'
          : theme.shadows[2],
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: plan.recommended
            ? '0 12px 40px rgba(255, 215, 0, 0.4)'
            : theme.shadows[8],
        },
      }}
    >
      {/* Recommended badge */}
      {plan.recommended && (
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 1,
          }}
        >
          <Chip
            label='Recomendado'
            size='small'
            sx={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              color: '#000',
              fontWeight: 'bold',
              fontSize: '0.75rem',
              boxShadow: '0 2px 8px rgba(255, 215, 0, 0.3)',
            }}
          />
        </Box>
      )}

      <CardContent sx={{ flexGrow: 1, pt: 3 }}>
        {/* Plan name with premium badge */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            mb: 2,
          }}
        >
          <Typography
            variant='h5'
            component='h2'
            sx={{
              fontWeight: 'bold',
              fontFamily: 'Tfont',
            }}
          >
            {plan.name}
          </Typography>
          {isPremiumPlan && <PremiumBadge variant='icon-only' size='small' />}
        </Box>

        {/* Price */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography
            variant='h3'
            component='div'
            sx={{
              fontWeight: 'bold',
              fontFamily: 'Tfont',
              color: isPremiumPlan ? '#FFD700' : theme.palette.text.primary,
            }}
          >
            R$ {plan.price.toFixed(2)}
          </Typography>
          {plan.originalPrice && (
            <Typography
              variant='body2'
              sx={{
                textDecoration: 'line-through',
                color: theme.palette.text.secondary,
              }}
            >
              R$ {plan.originalPrice.toFixed(2)}
            </Typography>
          )}
          <Typography variant='caption' color='text.secondary'>
            /mês
          </Typography>
        </Box>

        {/* Features list */}
        <List dense sx={{ mb: 2 }}>
          {plan.features.map((feature) => (
            <ListItem key={feature} disableGutters>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckCircleIcon
                  fontSize='small'
                  sx={{
                    color: isPremiumPlan
                      ? '#FFD700'
                      : theme.palette.success.main,
                  }}
                />
              </ListItemIcon>
              <ListItemText
                primary={feature}
                primaryTypographyProps={{
                  variant: 'body2',
                  color: 'text.primary',
                }}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant={plan.recommended ? 'contained' : 'outlined'}
          size='large'
          onClick={onSelect}
          disabled={isCurrent || loading}
          sx={{
            py: 1.5,
            fontWeight: 'bold',
            ...(plan.recommended && {
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              color: '#000',
              '&:hover': {
                background: 'linear-gradient(135deg, #FFA500 0%, #FF8C00 100%)',
              },
            }),
          }}
        >
          {(() => {
            if (isCurrent) return 'Plano Atual';
            if (isPremiumPlan) return 'Assinar';
            return 'Grátis';
          })()}
        </Button>
      </CardActions>
    </Card>
  );
};

export default PricingCard;
