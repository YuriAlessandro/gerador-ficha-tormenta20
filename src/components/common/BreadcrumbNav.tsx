import React from 'react';
import { Breadcrumbs, Typography, Link as MuiLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
}

const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({ items }) => {
  return (
    <Breadcrumbs
      aria-label='breadcrumb'
      separator={<NavigateNextIcon fontSize='small' />}
      sx={{ mb: 2, px: 2, pt: 2 }}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        if (isLast) {
          return (
            <Typography
              key={item.label}
              color='text.primary'
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              {item.icon}
              {item.label}
            </Typography>
          );
        }

        return (
          <MuiLink
            key={item.label}
            component={RouterLink}
            to={item.href || '/'}
            underline='hover'
            color='inherit'
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            {item.icon}
            {item.label}
          </MuiLink>
        );
      })}
    </Breadcrumbs>
  );
};

export default BreadcrumbNav;
