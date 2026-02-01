import React, { useEffect, useRef, useCallback } from 'react';
import { Box, CircularProgress } from '@mui/material';

interface FullScreenDiceCanvasProps {
  visible: boolean;
  loading: boolean;
  onContainerReady?: () => void;
}

export const FullScreenDiceCanvas: React.FC<FullScreenDiceCanvasProps> = ({
  visible,
  loading,
  onContainerReady,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);

  const createDiceContainer = useCallback(() => {
    if (!containerRef.current) return;

    // Remove any existing container first
    const existing = document.getElementById('dice-box-container');
    if (existing) {
      existing.remove();
    }

    // Get viewport dimensions
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Create new container inside our ref with full-screen dimensions
    const diceContainer = document.createElement('div');
    diceContainer.id = 'dice-box-container';
    diceContainer.style.width = `${width}px`;
    diceContainer.style.height = `${height}px`;
    diceContainer.style.position = 'absolute';
    diceContainer.style.top = '0';
    diceContainer.style.left = '0';
    diceContainer.style.zIndex = '1';
    diceContainer.style.overflow = 'visible';
    containerRef.current.appendChild(diceContainer);

    isInitializedRef.current = true;
    onContainerReady?.();
  }, [onContainerReady]);

  // Handle resize events - update both container and canvas dimensions
  const handleResize = useCallback(() => {
    const diceContainer = document.getElementById('dice-box-container');
    if (diceContainer) {
      const width = window.innerWidth;
      const height = window.innerHeight;
      diceContainer.style.width = `${width}px`;
      diceContainer.style.height = `${height}px`;

      // Also update canvas dimensions to match
      const canvas = diceContainer.querySelector(
        'canvas.dice-box-canvas'
      ) as HTMLCanvasElement;
      if (canvas) {
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }
    }
  }, []);

  // Create container on mount (not waiting for visible)
  useEffect(() => {
    if (containerRef.current && !isInitializedRef.current) {
      createDiceContainer();
    }

    // Add resize listener
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [createDiceContainer, handleResize]);

  // Update dimensions when visibility changes
  useEffect(() => {
    if (visible) {
      // Ensure dimensions are correct when becoming visible
      handleResize();
    }
  }, [visible, handleResize]);

  // Cleanup on unmount
  useEffect(() => {
    const cleanup = () => {
      const diceContainer = document.getElementById('dice-box-container');
      if (diceContainer) {
        diceContainer.remove();
      }
      isInitializedRef.current = false;
    };

    return cleanup;
  }, []);

  // Always render, but use CSS to hide when not visible
  // This ensures the container is always in the DOM for DiceBox initialization
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        zIndex: visible ? 99999 : -1,
        overflow: 'hidden',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 0.3s ease-in-out',
      }}
    >
      {/* Container for the 3D canvas */}
      <Box
        ref={containerRef}
        sx={{
          width: '100%',
          height: '100%',
          position: 'relative',
          // Ensure the DiceBox canvas fills the entire container
          '& canvas.dice-box-canvas': {
            width: '100% !important',
            height: '100% !important',
            display: 'block',
          },
        }}
      />

      {/* Loading overlay */}
      {loading && visible && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 100000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <CircularProgress sx={{ color: 'white' }} />
        </Box>
      )}
    </Box>
  );
};

export default FullScreenDiceCanvas;
