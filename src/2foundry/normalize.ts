/** Chave de comparação de rótulos: sem acentos, caixa baixa, espaços colapsados. */
export function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
};

function escapeHtml(text: string): string {
  return text.replace(/[&<>"]/g, (char) => HTML_ESCAPES[char]);
}

/** Texto puro da ficha → HTML do campo `description.value` (um `<p>` por linha). */
export function textToHtml(text: string | undefined): string {
  if (!text) return '';
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join('');
}

/**
 * Como `textToHtml`, mas num único `<p>` com `<br>` entre as linhas. Para a
 * descrição de efeito de uso: até a 1.6.5 o diálogo de uso faz
 * `parseHTML(descrição).prepend(...)`, que quebra com mais de um elemento raiz.
 */
export function textToSingleBlockHtml(text: string | undefined): string {
  if (!text) return '';
  const lines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map(escapeHtml);
  return lines.length > 0 ? `<p>${lines.join('<br>')}</p>` : '';
}

const ID_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/** Id no formato do Foundry (16 caracteres alfanuméricos). */
export function foundryId(): string {
  let id = '';
  for (let i = 0; i < 16; i += 1) {
    id += ID_ALPHABET[Math.floor(Math.random() * ID_ALPHABET.length)];
  }
  return id;
}
