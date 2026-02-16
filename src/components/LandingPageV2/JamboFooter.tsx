import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Link,
  Grid,
  Divider,
  Container,
  Tooltip,
} from '@mui/material';
import { useHistory } from 'react-router-dom';

const APP_VERSION = '4.2.1';

// Image credits - add more as needed
const imageCredits = [
  {
    description: 'Lança de Galrasia',
    author: 'Mateus Freitas, pintura de Pedro Arthur',
  },
  {
    description: 'P16',
    author: 'Luan Moura, pintura de Pedro Arthur',
  },
  {
    description: 'RPG background',
    author: 'freepik',
    url: 'https://www.freepik.com/free-photo/still-life-objects-with-role-playing-game-sheet_24749855.htm',
  },
  {
    description: 'Dungeon',
    author: 'Adi Mukherjee',
    url: 'https://unsplash.com/pt-br/fotografias/um-homem-esta-limpando-o-chao-em-um-tunel-escuro-tzjHpFw_qQk',
  },
  {
    description: 'Tabletop',
    author: 'Poul Cariov',
    url: 'https://unsplash.com/pt-br/fotografias/uma-mesa-com-um-mapa-em-um-quarto-escuro-F55DenU3jlE',
  },
  {
    description: 'Dragon',
    author: 'Jonathan Kemper',
    url: 'https://unsplash.com/pt-br/fotografias/decoracao-da-parede-da-cabeca-do-dragao-preto-zQMN9fLJehM',
  },
];

interface FooterLink {
  label: string;
  link: string;
  isExternal?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const footerSections: FooterSection[] = [
  {
    title: 'Ferramentas',
    links: [
      { label: 'Criar Ficha', link: '/criar-ficha' },
      { label: 'Gerador de Ameaças', link: '/gerador-ameacas' },
      { label: 'Item Superior', link: '/itens-superiores' },
      { label: 'Item Mágico', link: '/itens-magicos' },
      { label: 'Recompensas', link: '/recompensas' },
    ],
  },
  {
    title: 'Enciclopédia',
    links: [
      { label: 'Raças', link: '/database/raças' },
      { label: 'Classes', link: '/database/classes' },
      { label: 'Origens', link: '/database/origens' },
      { label: 'Divindades', link: '/database/divindades' },
      { label: 'Poderes', link: '/database/poderes' },
      { label: 'Magias', link: '/database/magias' },
    ],
  },
  {
    title: 'Comunidade',
    links: [
      { label: 'Mesas Virtuais', link: '/mesas' },
      { label: 'Explorar Builds', link: '/builds' },
      { label: 'Caverna do Saber', link: '/caverna-do-saber' },
      {
        label: 'Mapa de Arton',
        link: 'https://mapadearton.fichasdenimb.com.br/',
        isExternal: true,
      },
    ],
  },
  {
    title: 'Conta',
    links: [
      { label: 'Meus Personagens', link: '/meus-personagens' },
      { label: 'Minhas Ameaças', link: '/meus-personagens?tab=ameacas' },
      { label: 'Meu Perfil', link: '/profile' },
      { label: 'Apoiar o Projeto', link: '/apoiar' },
    ],
  },
  {
    title: 'Legal',
    links: [{ label: 'Termos de Uso', link: '/termos-de-uso' }],
  },
];

const JamboFooter: React.FC = () => {
  const history = useHistory();
  const currentYear = new Date().getFullYear();

  const handleLinkClick = (
    e: React.MouseEvent,
    link: string,
    isExternal?: boolean
  ) => {
    if (isExternal) {
      return; // Let the browser handle it
    }

    // Check for middle-click or Ctrl+click
    if (e.ctrlKey || e.metaKey || e.button === 1) {
      return; // Let the browser handle opening in new tab
    }

    e.preventDefault();
    history.push(link);
  };

  return (
    <Box
      component='footer'
      sx={{
        mt: 6,
        pt: 4,
        pb: 3,
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth='lg' sx={{ px: { xs: 2, sm: 3 } }}>
        {/* Site Map */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          {footerSections.map((section) => (
            <Grid size={{ xs: 6, sm: 3 }} key={section.title}>
              <Typography
                variant='subtitle2'
                fontWeight='bold'
                color='text.primary'
                sx={{ mb: 1.5 }}
              >
                {section.title}
              </Typography>
              <Stack spacing={0.75}>
                {section.links.map((item) => (
                  <Link
                    key={item.label}
                    href={item.link}
                    target={item.isExternal ? '_blank' : undefined}
                    rel={item.isExternal ? 'noopener noreferrer' : undefined}
                    onClick={(e) =>
                      handleLinkClick(e, item.link, item.isExternal)
                    }
                    underline='hover'
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.85rem',
                      '&:hover': {
                        color: 'primary.main',
                      },
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </Stack>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ mb: 3 }} />

        {/* Bottom Section */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent='space-between'
          alignItems={{ xs: 'center', sm: 'flex-start' }}
          spacing={2}
        >
          {/* Left side - Copyright and year */}
          <Stack spacing={0.5} alignItems={{ xs: 'center', sm: 'flex-start' }}>
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{ fontFamily: 'Tfont, serif' }}
            >
              &copy; {currentYear} &middot; (v{APP_VERSION})
            </Typography>
          </Stack>

          {/* Center - Stripe */}
          <Typography
            variant='caption'
            color='text.disabled'
            sx={{ textAlign: 'center' }}
          >
            Pagamentos processados via{' '}
            <Link
              href='https://stripe.com'
              target='_blank'
              rel='noopener noreferrer'
              sx={{
                color: 'text.disabled',
                '&:hover': { color: 'text.secondary' },
              }}
            >
              Stripe
            </Link>
          </Typography>

          {/* Right side - Jambô */}
          <Stack spacing={0.5} alignItems={{ xs: 'center', sm: 'flex-end' }}>
            <Link
              href='https://jamboeditora.com.br/categoria/rpg/tormenta20-rpg/'
              target='_blank'
              rel='noopener noreferrer'
              underline='hover'
              sx={{
                color: 'text.secondary',
                fontSize: '0.75rem',
                '&:hover': { color: 'primary.main' },
              }}
            >
              Compre Tormenta 20 Oficial
            </Link>
            <Typography
              variant='caption'
              color='text.disabled'
              sx={{
                fontSize: '0.7rem',
                textAlign: { xs: 'center', sm: 'right' },
              }}
            >
              Tormenta 20 &copy; Jambô Editora. Todos os direitos reservados.
            </Typography>
            {/* Image Credits - Very discreet, below Jambô rights */}
            <Tooltip
              title={
                <Stack spacing={0.5} sx={{ p: 0.5 }}>
                  <Typography variant='caption' fontWeight='bold'>
                    Créditos de Imagens
                  </Typography>
                  {imageCredits.map((credit) => (
                    <Link
                      key={credit.description}
                      href={credit.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      sx={{
                        color: 'inherit',
                        fontSize: '0.7rem',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      {credit.description} by {credit.author}
                    </Link>
                  ))}
                </Stack>
              }
              arrow
              placement='top'
            >
              <Typography
                variant='caption'
                sx={{
                  color: 'text.disabled',
                  fontSize: '0.575rem', // 2px smaller than 0.7rem (≈11.2px → ≈9.2px)
                  cursor: 'help',
                  opacity: 0.6,
                  '&:hover': { opacity: 1 },
                  transition: 'opacity 0.2s',
                  textAlign: { xs: 'center', sm: 'right' },
                }}
              >
                Créditos de imagens
              </Typography>
            </Tooltip>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default JamboFooter;
