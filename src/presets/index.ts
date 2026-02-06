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

// ===== SHOPEE (Março 2026) =====
// Nova política: comissão variável por faixa de preço + taxa fixa por item
// Frete grátis agora sem coparticipação para todos os vendedores
// Fonte: https://seller.shopee.com.br/edu/article/26839
export const defaultShopeeSettings = {
  // Comissão base para CNPJ (varia de 14% a 20% conforme faixa de preço)
  // Usando 20% como padrão conservador para produtos > R$200
  commissionPercent: 20,
  // Taxa fixa por item (varia: R$4 até R$79, R$16 até R$199, R$20 até R$499, R$26 acima)
  fixedFeePadrao: 20, // Para faixa R$200-499 (mais comum em impressões 3D)
  fixedFeeVolume: 26, // Para produtos acima de R$500
  commissionCap: 0, // Sem teto de comissão na nova política
  // Frete grátis agora é subsídio da Shopee (sem coparticipação)
  freightProgramExtraPercent: 0,
};

// ===== MERCADO LIVRE (Março 2026) =====
// Nova política: fim da tarifa fixa para produtos < R$79
// Custo operacional agora baseado em peso/dimensões
// Fonte: https://blog.tecnospeed.com.br/tarifas-do-mercado-livre/
export const defaultMercadoLivreSettings = {
  // Tarifas de venda por categoria: 10-14% (Clássico) / 15-19% (Premium)
  commissionClassico: 14,
  commissionPremium: 19,
  // Custos fixos por faixa de preço (produtos < R$79)
  priceThreshold: 79,
  // Custo fixo escalonado: R$6,25 (R$12,50-29), R$6,50 (R$29-50), R$6,75 (R$50-79)
  // Produtos < R$12,50 pagam metade do preço
  fixedFeeBelowThreshold: 6.75, // Usando o maior como padrão
  fixedFeeAboveThreshold: 0, // Acima de R$79 não há custo fixo adicional
};

export const bandeiraExtras: Record<string, number> = {
  verde: 0,
  amarela: 0.02,
  vermelha: 0.07,
};

export const defaultEnergyPricePerKwh = 0.72;
