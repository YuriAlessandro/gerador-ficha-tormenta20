import { useCallback, useEffect, useRef } from 'react';

// Sound imports
import bellSfx from '../../../assets/images/wyrt/sounds/bell.mp3';
import spellSfx from '../../../assets/images/wyrt/sounds/buffer-spell.mp3';
import cardSfx from '../../../assets/images/wyrt/sounds/card-sounds.mp3';
import coinSfx from '../../../assets/images/wyrt/sounds/spinning-coin-on-table.mp3';
import shuffleSfx from '../../../assets/images/wyrt/sounds/riffle-card-shuffle.mp3';
import doorSlamSfx from '../../../assets/images/wyrt/sounds/wood-door-slam.mp3';
import tavernSfx from '../../../assets/images/wyrt/sounds/medieval_tavern.mp3';
import victorySfx from '../../../assets/images/wyrt/sounds/victory.mp3';

import diceRoll1 from '../../../assets/images/wyrt/sounds/dice-roll/dice-roll_1.mp3';
import diceRoll2 from '../../../assets/images/wyrt/sounds/dice-roll/dice-roll_2.mp3';
import diceRoll3 from '../../../assets/images/wyrt/sounds/dice-roll/dice_roll_3.mp3';
import diceRoll4 from '../../../assets/images/wyrt/sounds/dice-roll/dice-roll_4.mp3';
import diceRoll5 from '../../../assets/images/wyrt/sounds/dice-roll/dice-roll_5.mp3';
import diceRoll6 from '../../../assets/images/wyrt/sounds/dice-roll/dice-roll_6.mp3';
import diceRoll7 from '../../../assets/images/wyrt/sounds/dice-roll/dice-roll_7.mp3';
import diceRoll8 from '../../../assets/images/wyrt/sounds/dice-roll/dice-roll_8.mp3';
import diceRoll9 from '../../../assets/images/wyrt/sounds/dice-roll/dice-roll_9.mp3';

const DICE_ROLLS = [
  diceRoll1,
  diceRoll2,
  diceRoll3,
  diceRoll4,
  diceRoll5,
  diceRoll6,
  diceRoll7,
  diceRoll8,
  diceRoll9,
];

function playSound(src: string, volume = 0.5): void {
  const audio = new Audio(src);
  audio.volume = volume;
  audio.play().catch(() => {
    // Browser may block autoplay before user interaction — safe to ignore
  });
}

let ambienceAudio: HTMLAudioElement | null = null;

function startAmbience(volume = 0.15): void {
  if (ambienceAudio) return;
  ambienceAudio = new Audio(tavernSfx);
  ambienceAudio.loop = true;
  ambienceAudio.volume = volume;
  ambienceAudio.play().catch(() => {
    // Autoplay blocked — will start on next user interaction
  });
}

function stopAmbience(): void {
  if (!ambienceAudio) return;
  ambienceAudio.pause();
  ambienceAudio.currentTime = 0;
  ambienceAudio = null;
}

export type WyrtSoundEvent =
  | 'diceRoll'
  | 'cardDiscard'
  | 'shuffle'
  | 'doubleBet'
  | 'bell'
  | 'foxReveal'
  | 'doorSlam'
  | 'coin'
  | 'victory';

export function useWyrtSounds() {
  const play = useCallback((event: WyrtSoundEvent, volume?: number) => {
    switch (event) {
      case 'diceRoll': {
        const randomIndex = Math.floor(Math.random() * DICE_ROLLS.length);
        playSound(DICE_ROLLS[randomIndex], volume ?? 0.5);
        break;
      }
      case 'cardDiscard':
        playSound(cardSfx, volume ?? 0.4);
        break;
      case 'shuffle':
        playSound(shuffleSfx, volume ?? 0.4);
        break;
      case 'doubleBet':
        playSound(coinSfx, volume ?? 0.5);
        break;
      case 'bell':
        playSound(bellSfx, volume ?? 0.3);
        break;
      case 'foxReveal':
        playSound(spellSfx, volume ?? 0.4);
        break;
      case 'doorSlam':
        playSound(doorSlamSfx, volume ?? 0.4);
        break;
      case 'coin':
        playSound(coinSfx, volume ?? 0.4);
        break;
      case 'victory':
        playSound(victorySfx, volume ?? 0.5);
        break;
      default:
        break;
    }
  }, []);

  return { play, startAmbience, stopAmbience };
}

/**
 * Hook that plays tavern ambience while the component is mounted.
 * Starts on first user click if autoplay is blocked.
 */
export function useWyrtAmbience() {
  const startedRef = useRef(false);

  useEffect(() => {
    const tryStart = () => {
      if (!startedRef.current) {
        startAmbience(0.15);
        startedRef.current = true;
      }
    };

    // Try immediately
    tryStart();

    // Fallback: start on first user interaction if autoplay was blocked
    document.addEventListener('click', tryStart, { once: true });

    return () => {
      document.removeEventListener('click', tryStart);
      stopAmbience();
      startedRef.current = false;
    };
  }, []);
}
