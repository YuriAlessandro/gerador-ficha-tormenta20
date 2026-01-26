import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Button,
  Card,
  CardContent,
  CardActions,
  Stack,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import FavoriteIcon from '@mui/icons-material/Favorite';
import StarIcon from '@mui/icons-material/Star';
import DiamondIcon from '@mui/icons-material/Diamond';
import { useSubscription } from '../../hooks/useSubscription';
import { useAuth } from '../../hooks/useAuth';
import { useAuthContext } from '../../contexts/AuthContext';
import {
  SupportLevel,
  SupportLevelInfo,
  SUPPORT_LEVEL_CONFIG,
} from '../../types/subscription.types';
import SupporterBadge from './SupporterBadge';

/**
 * Support page to display support levels and encourage contributions
 */
const SupportPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated } = useAuth();
  const { openLoginModal } = useAuthContext();
  const {
    tier: currentTier,
    loading,
    error,
    upgradeToTier,
    clearError,
    isSupporter: hasActiveSubscription,
  } = useSubscription();

  const [supportLevels, setSupportLevels] = useState<SupportLevelInfo[]>([]);
  const [levelsLoading, setLevelsLoading] = useState(true);
  const [levelsError, setLevelsError] = useState<string | null>(null);

  // Load support levels from API
  useEffect(() => {
    const loadSupportLevels = async () => {
      try {
        setLevelsLoading(true);
        setLevelsError(null);
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL || 'http://localhost:3001'
          }/api/subscriptions/support-levels`
        );
        const data = await response.json();
        if (data.success) {
          setSupportLevels(data.data);
        } else {
          setLevelsError('Erro ao carregar níveis de apoio.');
        }
      } catch {
        setLevelsError('Erro ao carregar níveis de apoio. Tente novamente.');
      } finally {
        setLevelsLoading(false);
      }
    };

    loadSupportLevels();
  }, []);

  const handleSelectLevel = (level: SupportLevel) => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    upgradeToTier(level);
  };

  const isCurrentLevel = (level: SupportLevel) => currentTier === level;

  // Left side content (fixed)
  const LeftContent = () => (
    <Box
      sx={{
        position: isMobile ? 'relative' : 'sticky',
        top: isMobile ? 0 : 100,
        alignSelf: 'flex-start',
      }}
    >
      <Typography
        variant='h3'
        component='h1'
        sx={{
          fontWeight: 'bold',
          fontFamily: 'Tfont',
          mb: 3,
        }}
      >
        Apoie o Projeto
      </Typography>

      {/* Explanation text */}
      <Box
        sx={{
          p: 3,
          bgcolor: 'background.paper',
          borderRadius: 2,
          border: 1,
          borderColor: 'divider',
        }}
      >
        <Typography
          variant='body1'
          color='text.secondary'
          sx={{ textAlign: 'left', lineHeight: 1.8 }}
        >
          O <strong>Fichas de Nimb</strong> é um projeto criado com muito
          carinho para a comunidade de Tormenta 20. Desenvolvemos esta
          ferramenta de forma gratuita e open-source para ajudar jogadores e
          mestres a criarem suas fichas de personagem de maneira rápida e fácil.
        </Typography>
        <Typography
          variant='body1'
          color='text.secondary'
          sx={{ textAlign: 'left', lineHeight: 1.8, mt: 2 }}
        >
          Por muito tempo, o Fichas de Nimb foi um projeto feito completamente
          no tempo livre, por vontade própria, com custos mínimos de operação.
          Um verdadeiro projeto de fans para fans.
        </Typography>
        <Typography
          variant='body1'
          color='text.secondary'
          sx={{ textAlign: 'left', lineHeight: 1.8, mt: 2 }}
        >
          Agora, estamos dando um passo adiante e expandindo ainda mais nossa
          plataforma. Porém, com tudo isso, vieram vários custos. Agora
          precisamos manter servidores, banco de dados e mais infraestrutura no
          geral.
        </Typography>
        <Typography
          variant='body1'
          color='text.secondary'
          sx={{ textAlign: 'left', lineHeight: 1.8, mt: 2 }}
        >
          É importante salientar: o Fichas de Nimb é um projeto sem fins
          lucrativos. Todos os desenvolvedores trabalham no projeto no tempo
          livre, por vontade própria, quando podem e se estiverem dispostos.
          Isso quer dizer que nem sempre temos desenvolvedores disponíveis para
          o projeto o tempo todo, e por isso as coisas andam bem devagar por
          aqui.
        </Typography>
        <Typography
          variant='body1'
          color='text.secondary'
          sx={{ textAlign: 'left', lineHeight: 1.8, mt: 2 }}
        >
          Com o seu apoio, você ajuda a manter o projeto de pé, com atualizações
          constantes, crescimento para novos sistemas, novos suplementos, e cada
          vez mais features. Com mais e mais apoio, conseguiremos dedicar mais
          tempo para o projeto e contratar pessoas que possam nós ajudar a tocar
          diversos dos planos que temos para esse projeto - que não está nem
          perto do fim. Além disso, conseguimos pagar por ferramentas que nos
          ajudem a acelar o desenvolvimento do projeto.
        </Typography>
        <Typography
          variant='body1'
          color='text.secondary'
          sx={{ textAlign: 'left', lineHeight: 1.8, mt: 2 }}
        >
          Fichas de Nimb é de graça e sempre será de graça. Todas as regras de
          livro básico e dos suplementos continuam open-source. Estamos
          trabalhando em novas features para melhorar ainda mais sua experiência
          jogando Tormenta - e no futuro, diversos outros sistemas. O que era
          open-source, continua open-source, como sempre. Qualquer pessoa pode
          usar nosso código de base para criar um projeto similar - e nós nos
          orgulhamos bastante disso.
        </Typography>
        <Typography
          variant='body1'
          color='text.secondary'
          sx={{ textAlign: 'left', lineHeight: 1.8, mt: 2 }}
        >
          Queremos crescer uma comunidade, aumentar o repertório de ferramentas,
          de sistemas e de suplementos. E para isso, precisamos do seu apoio.
          Contamos com você para ajudar o Fichas de Nimb nessa jornada.
        </Typography>
      </Box>

      {/* Footer info - only on desktop */}
      {!isMobile && (
        <Box sx={{ mt: 4 }}>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
            Os pagamentos são processados de forma segura através do{' '}
            <a
              href='https://docs.stripe.com/security'
              target='_blank'
              rel='noreferrer'
            >
              Stripe
            </a>
            .
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Você pode cancelar seu apoio a qualquer momento.
          </Typography>
        </Box>
      )}
    </Box>
  );

  // Right side content (scrollable cards)
  const RightContent = () => (
    <Box>
      {/* Active subscription message */}
      {hasActiveSubscription && (
        <Alert severity='info' sx={{ mb: 3 }}>
          Você já possui um apoio ativo. Para fazer upgrade ou downgrade do seu
          nível de apoio, entre em contato com o suporte através do email{' '}
          <strong>yuri.alessandro@hotmail.com</strong>.
        </Alert>
      )}

      {/* Error messages */}
      {error && (
        <Alert severity='error' onClose={clearError} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {levelsError && (
        <Alert severity='error' sx={{ mb: 3 }}>
          {levelsError}
        </Alert>
      )}

      {/* Loading state */}
      {levelsLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Support level cards - stacked vertically */}
      {!levelsLoading && supportLevels.length > 0 && (
        <Stack spacing={3}>
          {supportLevels.map((levelInfo) => {
            const config = SUPPORT_LEVEL_CONFIG[levelInfo.level];
            const isLevel2 =
              levelInfo.level === SupportLevel.NIVEL_2 ||
              levelInfo.level === SupportLevel.NIVEL_2_ANUAL;
            const isLevel3 =
              levelInfo.level === SupportLevel.NIVEL_3 ||
              levelInfo.level === SupportLevel.NIVEL_3_ANUAL;
            const isHighLevel = isLevel2 || isLevel3;
            const isCurrent = isCurrentLevel(levelInfo.level);

            return (
              <Card
                key={levelInfo.level}
                elevation={isHighLevel ? 8 : 2}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'visible',
                  border: isHighLevel
                    ? `2px solid ${config.badgeColor}`
                    : '1px solid',
                  borderColor: isHighLevel ? config.badgeColor : 'divider',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: isHighLevel
                      ? `0 12px 40px ${config.badgeColor}40`
                      : 8,
                  },
                }}
              >
                {/* Recommended badge */}
                {levelInfo.recommended && (
                  <Chip
                    label='Recomendado'
                    size='small'
                    color='primary'
                    sx={{
                      position: 'absolute',
                      top: -12,
                      right: 16,
                      fontWeight: 'bold',
                    }}
                  />
                )}

                <CardContent sx={{ pt: 4 }}>
                  {/* Level badge and icon */}
                  <Stack
                    direction='row'
                    alignItems='center'
                    spacing={1}
                    sx={{ mb: 2 }}
                  >
                    {(() => {
                      if (isLevel3)
                        return (
                          <DiamondIcon sx={{ color: config.badgeColor }} />
                        );
                      if (isLevel2)
                        return <StarIcon sx={{ color: config.badgeColor }} />;
                      return <FavoriteIcon sx={{ color: config.badgeColor }} />;
                    })()}
                    <Typography variant='h5' fontWeight='bold'>
                      {levelInfo.name}
                    </Typography>
                  </Stack>

                  {/* Price */}
                  <Box sx={{ mb: 2 }}>
                    {levelInfo.originalPrice && (
                      <Box sx={{ mb: 1 }}>
                        <Chip
                          label={`${Math.round(
                            (1 - levelInfo.price / levelInfo.originalPrice) *
                              100
                          )}% OFF`}
                          size='small'
                          sx={{
                            bgcolor: 'success.main',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.875rem',
                            mr: 1,
                          }}
                        />
                        <Typography
                          variant='body2'
                          component='span'
                          sx={{
                            textDecoration: 'line-through',
                            color: 'text.disabled',
                          }}
                        >
                          R${' '}
                          {levelInfo.originalPrice.toFixed(2).replace('.', ',')}
                        </Typography>
                      </Box>
                    )}
                    <Typography
                      variant='h3'
                      component='span'
                      fontWeight='bold'
                      sx={{
                        background: config.badgeGradient,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      R$ {levelInfo.price.toFixed(2).replace('.', ',')}
                    </Typography>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      component='span'
                    >
                      {levelInfo.billingPeriod === 'yearly' ? '/ano' : '/mês'}
                    </Typography>
                  </Box>

                  {/* Description */}
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ mb: 2 }}
                  >
                    {levelInfo.description}
                  </Typography>

                  {/* Badge preview */}
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      display='block'
                      sx={{ mb: 1 }}
                    >
                      Seu badge:
                    </Typography>
                    <SupporterBadge
                      level={levelInfo.level}
                      showTooltip={false}
                    />
                  </Box>

                  {/* Features */}
                  <Stack spacing={1}>
                    {levelInfo.features.map((feature) => (
                      <Stack
                        key={feature}
                        direction='row'
                        spacing={1}
                        alignItems='center'
                      >
                        <CheckIcon
                          sx={{ color: 'success.main', fontSize: 18 }}
                        />
                        <Typography variant='body2'>{feature}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>

                <CardActions sx={{ p: 3, pt: 0 }}>
                  <Button
                    fullWidth
                    variant={isHighLevel ? 'contained' : 'outlined'}
                    size='large'
                    onClick={() => handleSelectLevel(levelInfo.level)}
                    disabled={loading || isCurrent || hasActiveSubscription}
                    sx={
                      isHighLevel
                        ? {
                            background: config.badgeGradient,
                            color: '#000',
                            fontWeight: 'bold',
                            '&:hover': {
                              background: config.badgeGradient,
                              filter: 'brightness(1.1)',
                            },
                          }
                        : {
                            borderColor: config.badgeColor,
                            color: config.badgeColor,
                            fontWeight: 'bold',
                            '&:hover': {
                              borderColor: config.badgeColor,
                              bgcolor: `${config.badgeColor}10`,
                            },
                          }
                    }
                  >
                    {(() => {
                      if (loading)
                        return <CircularProgress size={24} color='inherit' />;
                      if (isCurrent) return 'Nível Atual';
                      if (hasActiveSubscription) return 'Apoio Ativo';
                      if (!isAuthenticated) return 'Entrar para Apoiar';
                      return 'Apoiar';
                    })()}
                  </Button>
                </CardActions>
              </Card>
            );
          })}
        </Stack>
      )}

      {/* Footer info - only on mobile */}
      {isMobile && (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
            Os pagamentos são processados de forma segura através do Stripe.
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Você pode cancelar seu apoio a qualquer momento.
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      {isMobile ? (
        // Mobile: Stack vertically
        <Box>
          <LeftContent />
          <Box sx={{ mt: 4 }}>
            <RightContent />
          </Box>
        </Box>
      ) : (
        // Desktop: Two columns side by side
        <Box
          sx={{
            display: 'flex',
            gap: 6,
          }}
        >
          {/* Left column - Fixed */}
          <Box sx={{ flex: '0 0 45%', maxWidth: '45%' }}>
            <LeftContent />
          </Box>

          {/* Right column - Scrollable */}
          <Box sx={{ flex: '1 1 55%', maxWidth: '55%' }}>
            <RightContent />
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default SupportPage;
