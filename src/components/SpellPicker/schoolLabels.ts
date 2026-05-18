import { SpellSchool } from '@/interfaces/Spells';

/**
 * Maps the abbreviated spell school stored on `Spell.school`
 * (e.g. "Abjur") to the full Portuguese label shown in the UI
 * (e.g. "Abjuração"). Shared by the custom spell dialog and the
 * advanced spell filters.
 */
export const SCHOOL_LABELS: Record<SpellSchool, string> = {
  Abjur: 'Abjuração',
  Adiv: 'Adivinhação',
  Conv: 'Convocação',
  Encan: 'Encantamento',
  Evoc: 'Evocação',
  Ilusão: 'Ilusão',
  Necro: 'Necromancia',
  Trans: 'Transmutação',
};

/** Friendly school label with a safe fallback for unknown values. */
export const getSchoolLabel = (school: string): string =>
  SCHOOL_LABELS[school as SpellSchool] ?? school;
