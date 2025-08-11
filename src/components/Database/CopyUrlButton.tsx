import React, { useState } from 'react';
import { IconButton, Snackbar, Alert, Tooltip, Box } from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import CheckIcon from '@mui/icons-material/Check';

interface CopyUrlButtonProps {
  itemName: string;
  itemType: 'raça' | 'classe' | 'origem' | 'divindade' | 'poder' | 'magia';
  size?: 'small' | 'medium';
  color?: 'primary' | 'secondary' | 'inherit';
  variant?: 'floating' | 'integrated' | 'minimal';
}

const CopyUrlButton: React.FC<CopyUrlButtonProps> = ({
  itemName,
  itemType,
  size = 'small',
  color = 'primary',
  variant = 'integrated',
}) => {
  const [copied, setCopied] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);

  const handleCopy = async () => {
    const url = `${window.location.href}/${encodeURIComponent(
      itemName.toLowerCase()
    )}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setShowSnackbar(true);

      // Reset the copied state after animation
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Silently handle copy failure and use fallback
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);

      setCopied(true);
      setShowSnackbar(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
  };

  const getButtonStyles = () => {
    const baseStyles = {
      transition: 'all 0.3s ease',
      ...(copied && {
        color: '#4caf50',
        transform: 'scale(1.1)',
      }),
    };

    switch (variant) {
      case 'floating':
        return {
          ...baseStyles,
          position: 'absolute' as const,
          top: 8,
          right: 8,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(4px)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          opacity: 0,
          transform: 'translateY(-4px)',
          '&:hover': {
            backgroundColor: 'rgba(209, 50, 53, 0.1)',
            transform: 'translateY(-2px) scale(1.05)',
            boxShadow: '0 4px 12px rgba(209, 50, 53, 0.2)',
          },
          '.table-row:hover &': {
            opacity: 1,
            transform: 'translateY(0)',
          },
        };
      case 'minimal':
        return {
          ...baseStyles,
          opacity: 0.6,
          '&:hover': {
            opacity: 1,
            backgroundColor: 'rgba(209, 50, 53, 0.1)',
            transform: 'scale(1.1)',
          },
        };
      default:
        // integrated
        return {
          ...baseStyles,
          ml: 1,
          backgroundColor: 'rgba(209, 50, 53, 0.05)',
          border: '1px solid rgba(209, 50, 53, 0.2)',
          borderRadius: '8px',
          '&:hover': {
            backgroundColor: 'rgba(209, 50, 53, 0.15)',
            transform: 'scale(1.05)',
            borderColor: 'rgba(209, 50, 53, 0.4)',
          },
        };
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Tooltip
        title={`Copiar link para ${itemType} "${itemName}"`}
        arrow
        placement='top'
      >
        <IconButton
          onClick={handleCopy}
          size={size}
          color={color}
          sx={getButtonStyles()}
        >
          {copied ? (
            <CheckIcon
              sx={{
                fontSize: size === 'small' ? '1.2rem' : '1.5rem',
                animation: 'pulse 0.5s ease-in-out',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.2)' },
                  '100%': { transform: 'scale(1)' },
                },
              }}
            />
          ) : (
            <ShareIcon
              sx={{ fontSize: size === 'small' ? '1.2rem' : '1.5rem' }}
            />
          )}
        </IconButton>
      </Tooltip>

      <Snackbar
        open={showSnackbar}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity='success'
          variant='filled'
          sx={{
            fontFamily: 'Tfont, serif',
            '& .MuiAlert-message': {
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            },
          }}
        >
          <Box>
            <Box sx={{ fontWeight: 'bold', mb: 0.5 }}>
              Link copiado com sucesso!
            </Box>
            <Box sx={{ fontSize: '0.85rem', opacity: 0.9 }}>
              {itemType.charAt(0).toUpperCase() + itemType.slice(1)}: {itemName}
            </Box>
          </Box>
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CopyUrlButton;
