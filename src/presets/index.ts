import type { PrinterPreset, MaterialPreset } from '../types';

export const printerPresets: PrinterPreset[] = [
  {
    id: 'bambu-a1-mini',
    name: 'Bambu Lab A1 Mini',
    printingWatts: 57,
    idleWatts: 6,
  },
  {
    id: 'creality-ender3-v2',
    name: 'Creality Ender 3 V2',
    printingWatts: 110,
    idleWatts: 0,
  },
  {
    id: 'prusa-mk4s',
    name: 'Prusa MK4S',
    printingWatts: 80,
    idleWatts: 0,
    hasMaterialVariant: true,
    materialVariants: {
      'PLA': 80,
      'ABS': 120,
    },
  },
  {
    id: 'custom',
    name: 'Custom (Personalizado)',
    printingWatts: 100,
    idleWatts: 0,
  },
];

export const materialPresets: MaterialPreset[] = [
  {
    id: 'pla',
    name: 'PLA',
    suggestedLossPercent: 8,
    powerFactor: 1.0,
    suggestedPricePerKg: 85,
  },
  {
    id: 'petg',
    name: 'PETG',
    suggestedLossPercent: 10,
    powerFactor: 1.08,
    suggestedPricePerKg: 100,
  },
  {
    id: 'abs-asa',
    name: 'ABS/ASA',
    suggestedLossPercent: 12,
    powerFactor: 1.18,
    suggestedPricePerKg: 120,
  },
  {
    id: 'tpu',
    name: 'TPU',
    suggestedLossPercent: 15,
    powerFactor: 1.05,
    suggestedPricePerKg: 140,
  },
  {
    id: 'resina',
    name: 'Resina',
    suggestedLossPercent: 10,
    powerFactor: 1.0,
    suggestedPricePerKg: 150,
  },
  {
    id: 'custom',
    name: 'Custom (Personalizado)',
    suggestedLossPercent: 10,
    powerFactor: 1.0,
    suggestedPricePerKg: 100,
  },
];

export const defaultShopeeSettings = {
  commissionPercent: 14,
  fixedFeePadrao: 4,
  fixedFeeVolume: 7,
  commissionCap: 100,
  freightProgramExtraPercent: 6,
};

export const defaultMercadoLivreSettings = {
  commissionClassico: 14,
  commissionPremium: 17,
  priceThreshold: 79,
  fixedFeeBelowThreshold: 6.75,
  fixedFeeAboveThreshold: 0,
};

export const bandeiraExtras: Record<string, number> = {
  verde: 0,
  amarela: 0.02,
  vermelha: 0.07,
};

export const defaultEnergyPricePerKwh = 0.72;
