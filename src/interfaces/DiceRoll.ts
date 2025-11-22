export interface DiceRoll {
  id?: string; // UUID único (gerado no frontend)
  label: string; // Ex: "Dano", "Cura", "Teste de Resistência"
  dice: string; // Ex: "1d20", "3d6", "2d10+5"
  description?: string; // Descrição opcional do que é rolado
}

export interface RollResult {
  rollId?: string;
  label: string;
  dice: string;
  rolls: number[]; // Valores individuais rolados
  modifier: number; // Modificador (+X ou -X)
  total: number; // Soma total
}
