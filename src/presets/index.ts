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

// ===== SHOPEE (Fevereiro 2026) =====
// Estrutura real: Comissão 12% + 2% taxa transação + opcional 6% frete = base 14% até 20%
// Taxa fixa sugerida baseada em tipo de vendedor e volume
// Teto de comissão percentual: R$100,00 por item (não inclui taxa fixa)
// Fonte: https://seller.shopee.com.br/edu/article/26839
export const defaultShopeeSettings = {
  // Componentes da comissão percentual
  commissionBasePercent: 12, // Comissão base
  transactionTaxPercent: 2, // Taxa de transação/pagamento
  freightProgramPercent: 6, // Adicional se frete grátis ativado
  useFreightProgram: false, // Padrão: desativado
  // Teto da comissão percentual
  commissionPercentCap: 100, // R$100,00
  // Taxa fixa por item (sempre editável)
  fixedFeePerItem: 4, // Padrão: R$4
  // Tipo de vendedor
  sellerType: 'cnpj' as const, // 'cnpj' ou 'cpf'
  // Volume de pedidos (últimos 90 dias)
  orderVolume: '0-199' as const, // '0-199', '200-499', '500+'
};

/**
 * Retorna a taxa fixa sugerida baseada no tipo de vendedor e volume
 * CPF: R$7 (0-199), R$4 (200-499), R$4 (500+)
 * CNPJ: R$4 (sempre)
 */
export function getSuggestedFixedFee(
  sellerType: 'cpf' | 'cnpj',
  orderVolume: '0-199' | '200-499' | '500+'
): number {
  if (sellerType === 'cnpj') {
    return 4;
  }
  // CPF
  if (orderVolume === '0-199') {
    return 7;
  }
  // 200-499 e 500+
  return 4;
}

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
