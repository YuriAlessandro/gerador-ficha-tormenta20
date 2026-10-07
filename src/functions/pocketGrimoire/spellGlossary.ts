/**
 * Explicações curtas dos termos padronizados das magias (execução, alcance,
 * duração, resistência), para as dicas ⓘ do grimório. Texto próprio,
 * resumindo as regras dos capítulos 4 e 5 do livro básico — não é cópia.
 */
export type GlossaryKind =
  | 'execution'
  | 'range'
  | 'duration'
  | 'target'
  | 'area'
  | 'resistance'
  | 'requirement';

const EXECUTION: Record<string, string> = {
  padrão:
    'Gasta a ação padrão do turno — a mesma usada para atacar. Ainda sobra a ação de movimento.',
  movimento:
    'Gasta a ação de movimento do turno (a usada para andar, sacar uma arma, levantar-se). Ainda sobra a ação padrão.',
  completa:
    'Ocupa a rodada inteira: você abre mão das ações padrão e de movimento. Se levar mais que uma rodada, você fica desprevenido enquanto conjura.',
  livre:
    'Quase não gasta tempo, mas só dá para lançar uma magia como ação livre por rodada.',
  reação:
    'Lançada em resposta ao que ela protege ou afeta (por exemplo, a um ataque), inclusive fora do seu turno.',
};

const RANGE: Record<string, string> = {
  pessoal:
    'Afeta só o próprio conjurador e o que ele carrega — ou uma área que parte dele.',
  toque:
    'É preciso tocar o alvo, mas o toque faz parte da conjuração: não gasta ação nem exige teste.',
  curto: 'Até 9m de distância (6 quadrados no mapa).',
  médio: 'Até 30m de distância (20 quadrados no mapa).',
  longo: 'Até 90m de distância (60 quadrados no mapa).',
  ilimitado:
    'Qualquer lugar no mesmo mundo; normalmente é preciso conhecer o alvo ou o lugar.',
};

const DURATION: Record<string, string> = {
  instantânea:
    'O efeito acontece e acaba na hora, mas as consequências ficam (ferimentos curados continuam curados).',
  cena: 'Dura até o fim da cena — um combate, uma conversa, uma travessia. Não tem medida fixa de tempo.',
  sustentada:
    'Para manter, gaste 1 PM como ação livre no início de cada turno seu. Só dá para sustentar uma magia por vez.',
  permanente:
    'Fica ativa para sempre, a menos que seja encerrada de outra forma (como Dissipar Magia).',
};

const DISCHARGE =
  'Até ser descarregada: fica "dormente" até o evento que a dispara; então é usada e acaba. Se o tempo acabar antes, termina sem efeito.';

const DEFINED =
  'Dura um tempo definido (rodadas, horas, dias…). Você pode encerrar a magia antes, como ação livre.';

const RESISTANCE_EFFECT: [RegExp, string][] = [
  [/reduz à metade/, 'se o alvo passar, o efeito é reduzido à metade.'],
  [/anula|evita/, 'se o alvo passar, a magia não tem efeito sobre ele.'],
  [
    /parcial/,
    'se o alvo passar, sofre um efeito menor (a magia explica qual).',
  ],
  [
    /desacredita/,
    'ao interagir com a ilusão (tocar, examinar de perto), a criatura pode perceber que ela não é real — e avisar os aliados.',
  ],
];

const RESISTANCE_TEST: [RegExp, string][] = [
  [/fortitude/, 'Fortitude'],
  [/reflexos/, 'Reflexos'],
  [/vontade/, 'Vontade'],
];

const firstWord = (value: string) =>
  value
    .trim()
    .toLocaleLowerCase('pt-BR')
    .split(/[\s(,]/)[0];

function explainDuration(value: string): string | undefined {
  const lower = value.toLocaleLowerCase('pt-BR');
  const parts: string[] = [];
  const base = DURATION[firstWord(value)];
  if (base) parts.push(base);
  else if (
    /\b(rodadas?|turnos?|minutos?|horas?|dias?|semanas?)\b/.test(lower)
  ) {
    parts.push(DEFINED);
  }
  if (/descarregad/.test(lower)) parts.push(DISCHARGE);
  return parts.length > 0 ? parts.join(' ') : undefined;
}

function explainResistance(value: string): string | undefined {
  const lower = value.toLocaleLowerCase('pt-BR');
  const effect = RESISTANCE_EFFECT.find(([pattern]) => pattern.test(lower));
  if (!effect) return undefined;
  const test = RESISTANCE_TEST.find(([pattern]) => pattern.test(lower));
  const prefix = test
    ? `O alvo faz um teste de ${test[1]}: `
    : 'Com o teste de resistência, ';
  return `${prefix}${effect[1]}`;
}

/** Explicação do termo, ou `undefined` quando o valor foge do padrão. */
export function explainTerm(
  kind: GlossaryKind,
  value: string
): string | undefined {
  switch (kind) {
    case 'execution':
      return EXECUTION[firstWord(value)];
    case 'range':
      return RANGE[firstWord(value)];
    case 'duration':
      return explainDuration(value);
    case 'resistance':
      return explainResistance(value);
    default:
      return undefined;
  }
}
