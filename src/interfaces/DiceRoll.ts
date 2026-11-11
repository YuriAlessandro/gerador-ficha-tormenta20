export interface DiceRoll {
  id?: string; // UUID único (gerado no frontend)
  label: string; // Ex: "Dano", "Cura", "Teste de Resistência"
  dice: string; // Ex: "1d20", "3d6", "2d10+5"
  description?: string; // Descrição opcional do que é rolado
  damageType?: string; // Tipo de dano opcional (ex.: "fogo", "ácido") p/ exibição
  /** Cada resultado 1 é rolado de novo, uma vez (Gelo eterno, Adamante). */
  rerollOnes?: boolean;
}

export interface RollResult {
  rollId?: string;
  label: string;
  dice: string;
  rolls: number[]; // Valores individuais rolados
  modifier: number; // Modificador (+X ou -X)
  total: number; // Soma total
}
