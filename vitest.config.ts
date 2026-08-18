import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import {
  isPremiumAvailable,
  premiumStubPlugin,
} from './scripts/premiumStubPlugin';

// Espelha o `define` de vite.config.ts — o vitest não herda a config do Vite.
const APP_VERSION: string = JSON.parse(
  fs.readFileSync(
    fileURLToPath(new URL('./package.json', import.meta.url)),
    'utf-8'
  )
).version;

const ROOT_DIR = fileURLToPath(new URL('.', import.meta.url));
const premiumAvailable = isPremiumAvailable(ROOT_DIR);

// Suítes do core que exercitam lógica que MORA no submódulo premium (homebrews,
// complicações, forma selvagem, efeitos ativos...). Em modo stub elas caem no
// `_inert` e falham por ausência de código, não por defeito — então só rodam
// quando o submódulo está presente. Consequência assumida: um PR de fork tem
// cobertura menor (130 de 187 suítes); o CI interno, com o submódulo, continua
// rodando as 187. A lista só pode causar cobertura a MENOS no fork, nunca um
// verde falso na main.
const PREMIUM_DEPENDENT_TESTS = [
  'src/functions/__tests__/homebrewChoiceBonus.spec.ts',
  'src/functions/__tests__/homebrewClass.spec.ts',
  'src/functions/__tests__/homebrewCollection.spec.ts',
  'src/functions/__tests__/homebrewDeity.spec.ts',
  'src/functions/__tests__/homebrewItemEnhancements.spec.ts',
  'src/functions/__tests__/homebrewItemPackage.spec.ts',
  'src/functions/__tests__/homebrewNaturalWeaponAttributes.spec.ts',
  'src/functions/__tests__/homebrewOrigin.spec.ts',
  'src/functions/__tests__/homebrewPowerPack.spec.ts',
  'src/functions/__tests__/homebrewRolls.spec.ts',
  'src/functions/__tests__/homebrewSpellPack.spec.ts',
  'src/functions/__tests__/homebrewTrainSkill.spec.ts',
  'src/functions/__tests__/homebrewVariantClass.spec.ts',
  'src/__tests__/functions/applyEffectOffer.test.ts',
  'src/__tests__/functions/encouracadoFamily.test.ts',
  'src/__tests__/functions/rollEnvelope.test.ts',
  'src/components/SheetResult/SpellsTab/__tests__/spellActiveEffect.test.ts',
  'src/functions/__tests__/age.spec.ts',
  'src/functions/__tests__/animalCompanion.spec.ts',
  'src/functions/__tests__/complications.spec.ts',
  'src/functions/__tests__/coragemAguerrida.spec.ts',
  'src/functions/__tests__/effectiveAttributes.spec.ts',
  'src/functions/__tests__/openRaceAttributes.spec.ts',
  'src/functions/__tests__/procuradoVivoOuMorto.spec.ts',
  'src/functions/__tests__/randomSheetWeaponBonuses.spec.ts',
  'src/functions/__tests__/safeFormulaEval.spec.ts',
  'src/functions/__tests__/sizeDamageStep.spec.ts',
  'src/functions/__tests__/weaponBonusScope.spec.ts',
  'src/functions/__tests__/wildShape.spec.ts',
];

export default defineConfig({
  // O submódulo src/premium é privado: um PR de fork não consegue cloná-lo e o
  // diretório chega vazio. Sem este plugin (que o vite.config.ts já usava) a
  // suíte inteira quebra na coleta com "Failed to resolve import ../premium/",
  // porque o código core importa premium em ~173 pontos. Com ele, os imports
  // caem no stub público de src/premium-stub e os testes core rodam.
  plugins: premiumAvailable ? [] : [premiumStubPlugin(ROOT_DIR)],
  define: {
    __APP_VERSION__: JSON.stringify(APP_VERSION),
  },
  test: {
    globals: true,
    exclude: [
      '**/node_modules/**',
      '**/build/**',
      ...(premiumAvailable ? [] : PREMIUM_DEPENDENT_TESTS),
    ],
    setupFiles: ['./src/setupTests.ts'],
    environment: 'jsdom',
    server: {
      deps: {
        // Inlina @base-ui e @mui (ESM-only) para que seus imports passem pelo
        // pipeline do Vite — o resolver ESM nativo do Node quebra em
        // 'react/jsx-runtime' sem extensão (React 17 não tem "exports" map)
        inline: [/@base-ui\//, /@mui\//],
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'react/jsx-runtime': 'react/jsx-runtime.js',
      'react/jsx-dev-runtime': 'react/jsx-dev-runtime.js',
    },
  },
});
