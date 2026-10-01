import { EngenhocaData } from '../../interfaces/Spells';
import {
  APARATOS_BY_ID,
  MAX_APARATOS_PER_ENGENHOCA,
} from '../../data/systems/tormenta20/herois-de-arton/aparatos';

/**
 * Normaliza o campo vindo do banco/localStorage: descarta o que não é objeto,
 * aparatos desconhecidos ou repetidos e o excesso além de 2.
 */
export function sanitizeEngenhoca(raw: unknown): EngenhocaData | undefined {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined;
  const data = raw as Record<string, unknown>;
  const result: EngenhocaData = {};

  if (typeof data.nome === 'string') result.nome = data.nome;
  if (data.forma === 'empunhada' || data.forma === 'vestida') {
    result.forma = data.forma;
  }
  if (Array.isArray(data.aparatos)) {
    const aparatos = Array.from(
      new Set(
        data.aparatos.filter(
          (id): id is string => typeof id === 'string' && !!APARATOS_BY_ID[id]
        )
      )
    ).slice(0, MAX_APARATOS_PER_ENGENHOCA);
    if (aparatos.length > 0) result.aparatos = aparatos;
  }
  if (data.enguicada === true) result.enguicada = true;

  return result;
}

export default sanitizeEngenhoca;
