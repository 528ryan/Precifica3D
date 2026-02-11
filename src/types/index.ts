// ===== TIPOS PRINCIPAIS =====

export interface SavedProduct {
  id: string;
  name: string;
  print: PrintSettings;
  material: MaterialSettings;
  extraCosts: ExtraCostsSettings;
  cogs: number;
  createdAt: number;
}

export interface KitItem {
  productId: string;
  quantity: number;
}

export interface Kit {
  id: string;
  name: string;
  items: KitItem[];
  createdAt: number;
}

export interface PrinterPreset {
  id: string;
  name: string;
  printingWatts: number;
  idleWatts: number;
  hasMaterialVariant?: boolean;
  materialVariants?: Record<string, number>;
}

export interface MaterialPreset {
  id: string;
  name: string;
  suggestedLossPercent: number;
  powerFactor: number;
  suggestedPricePerKg: number;
}

export interface PlatformPreset {
  id: string;
  name: string;
  commissionPercent: number;
  fixedFee: number;
  commissionCap?: number;
  hasFreightProgram?: boolean;
  freightProgramExtraPercent?: number;
  hasAdType?: boolean;
  adTypes?: Record<string, number>;
  priceThreshold?: number;
  fixedFeeBelowThreshold?: number;
  fixedFeeAboveThreshold?: number;
}

export interface PrintSettings {
  printerId: string;
  printingWatts: number;
  idleWatts: number;
  printTimeHours: number;
  printTimeMinutes: number;
  materialVariant?: string;
}

export interface MaterialSettings {
  materialId: string;
  pricePerKg: number;
  gramsUsed: number;
  lossPercent: number;
  isMulticolor: boolean;
  fixedPurgeGrams: number;
  powerFactor: number;
}

export interface EnergySettings {
  pricePerKwh: number;
  bandeira: 'verde' | 'amarela' | 'vermelha';
  bandeiraExtra: number;
}

export interface ExtraCostsSettings {
  laborRatePerHour: number;
  laborHours: number;
  packagingCost: number;
  depreciationMode: 'perHour' | 'calculated';
  depreciationPerHour: number;
  printerPrice: number;
  printerLifeHours: number;
  otherFixedCosts: number;
}

export interface ShopeeSettings {
  // Componentes da comissão percentual (sempre editáveis)
  commissionBasePercent: number; // Padrão 12%
  transactionTaxPercent: number; // Padrão 2%
  freightProgramPercent: number; // Padrão 6% (adicional, ligado/desligado)
  useFreightProgram: boolean;
  // Teto de comissão percentual
  commissionPercentCap: number; // Padrão R$100
  // Taxa fixa por item (sempre editável)
  fixedFeePerItem: number;
  // Tipo de vendedor (afeta sugestão de taxa fixa)
  sellerType: 'cpf' | 'cnpj';
  // Volume de pedidos nos últimos 90 dias (afeta sugestão de taxa fixa para CPF)
  orderVolume: '0-199' | '200-499' | '500+';
}

export interface MercadoLivreSettings {
  adType: 'classico' | 'premium';
  commissionPercent: number;
  priceThreshold: number;
  fixedFeeBelowThreshold: number;
  fixedFeeAboveThreshold: number;
}

export interface PlatformSettings {
  shopee: ShopeeSettings;
  mercadoLivre: MercadoLivreSettings;
  itemQuantity: number;
}

export interface PricingGoals {
  targetMarginPercent: number;
  rangePaddingPercent: number;
  rounding: 'none' | '90' | '99' | '50';
}

export interface AllSettings {
  print: PrintSettings;
  material: MaterialSettings;
  energy: EnergySettings;
  extraCosts: ExtraCostsSettings;
  platform: PlatformSettings;
  pricingGoals: PricingGoals;
}

export interface CostBreakdown {
  filamentTotalGrams: number;
  filamentCost: number;
  energyKwh: number;
  energyCost: number;
  laborCost: number;
  packagingCost: number;
  depreciationCost: number;
  otherCosts: number;
  totalExtraCosts: number;
  cogs: number;
}

export interface PlatformResult {
  platformName: string;
  breakEvenPrice: number;
  targetPrice: number;
  rangeMin: number;
  rangeMax: number;
  profitAtTarget: number;
  profitAtRangeMax: number;
  actualMarginAtTarget: number;
  taxesAtTarget: number;
  taxesAtRangeMax: number;
}

export interface CalculationResult {
  costs: CostBreakdown;
  shopee: PlatformResult;
  mercadoLivre: PlatformResult;
}
