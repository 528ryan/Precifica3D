import type {
  AllSettings,
  CostBreakdown,
  PlatformResult,
  CalculationResult,
} from '../types';

// ===== FUNÇÕES DE CUSTO =====

/**
 * Calcula o total de gramas de filamento considerando perdas e purga
 */
export function calculateFilamentGrams(
  gramsUsed: number,
  fixedPurgeGrams: number,
  lossPercent: number
): number {
  return (gramsUsed + fixedPurgeGrams) * (1 + lossPercent / 100);
}

/**
 * Calcula o custo do filamento em R$
 */
export function calculateFilamentCost(
  totalGrams: number,
  pricePerKg: number
): number {
  return (totalGrams / 1000) * pricePerKg;
}

/**
 * Calcula o consumo de energia em kWh
 */
export function calculateEnergyKwh(
  printingWatts: number,
  powerFactor: number,
  printTimeHours: number,
  idleWatts: number = 0,
  idleHours: number = 0
): number {
  const appliedWatts = printingWatts * powerFactor;
  return (appliedWatts / 1000) * printTimeHours + (idleWatts / 1000) * idleHours;
}

/**
 * Calcula o custo de energia em R$
 */
export function calculateEnergyCost(
  kwh: number,
  pricePerKwh: number,
  bandeiraExtra: number
): number {
  return kwh * (pricePerKwh + bandeiraExtra);
}

/**
 * Calcula o custo de depreciação por hora de uso
 */
export function calculateDepreciationPerHour(
  printerPrice: number,
  lifeHours: number
): number {
  if (lifeHours <= 0) return 0;
  return printerPrice / lifeHours;
}

/**
 * Calcula todos os custos extras
 */
export function calculateExtraCosts(
  laborRatePerHour: number,
  laborHours: number,
  packagingCost: number,
  depreciationPerHour: number,
  printTimeHours: number,
  otherFixedCosts: number
): {
  laborCost: number;
  packagingCost: number;
  depreciationCost: number;
  otherCosts: number;
  total: number;
} {
  const laborCost = laborRatePerHour * laborHours;
  const depreciationCost = depreciationPerHour * printTimeHours;
  const total = laborCost + packagingCost + depreciationCost + otherFixedCosts;
  
  return {
    laborCost,
    packagingCost,
    depreciationCost,
    otherCosts: otherFixedCosts,
    total,
  };
}

/**
 * Calcula o breakdown completo de custos (COGS)
 */
export function calculateCostBreakdown(settings: AllSettings): CostBreakdown {
  const printTimeHours = settings.print.printTimeHours + settings.print.printTimeMinutes / 60;
  
  // Filamento
  const filamentTotalGrams = calculateFilamentGrams(
    settings.material.gramsUsed,
    settings.material.fixedPurgeGrams,
    settings.material.lossPercent
  );
  const filamentCost = calculateFilamentCost(
    filamentTotalGrams,
    settings.material.pricePerKg
  );
  
  // Energia
  const energyKwh = calculateEnergyKwh(
    settings.print.printingWatts,
    settings.material.powerFactor,
    printTimeHours,
    settings.print.idleWatts
  );
  const energyCost = calculateEnergyCost(
    energyKwh,
    settings.energy.pricePerKwh,
    settings.energy.bandeiraExtra
  );
  
  // Depreciação
  let depreciationPerHour = settings.extraCosts.depreciationPerHour;
  if (settings.extraCosts.depreciationMode === 'calculated') {
    depreciationPerHour = calculateDepreciationPerHour(
      settings.extraCosts.printerPrice,
      settings.extraCosts.printerLifeHours
    );
  }
  
  // Custos extras
  const extraCosts = calculateExtraCosts(
    settings.extraCosts.laborRatePerHour,
    settings.extraCosts.laborHours,
    settings.extraCosts.packagingCost,
    depreciationPerHour,
    printTimeHours,
    settings.extraCosts.otherFixedCosts
  );
  
  const cogs = filamentCost + energyCost + extraCosts.total;
  
  return {
    filamentTotalGrams,
    filamentCost,
    energyKwh,
    energyCost,
    laborCost: extraCosts.laborCost,
    packagingCost: extraCosts.packagingCost,
    depreciationCost: extraCosts.depreciationCost,
    otherCosts: extraCosts.otherCosts,
    totalExtraCosts: extraCosts.total,
    cogs,
  };
}

// ===== FUNÇÕES DE TAXAS =====

/**
 * Calcula taxas da Shopee (Março 2026)
 * Nova política: comissão e taxa fixa variam por faixa de preço
 * Faixas CNPJ: 
 *   - Até R$79: 14% + R$4
 *   - R$80-199: 16% + R$16
 *   - R$200-499: 20% + R$20
 *   - R$500+: 20% + R$26
 */
export function calculateShopeeTaxes(
  price: number,
  commissionPercent: number,
  fixedFee: number,
  commissionCap: number,
  useFreightProgram: boolean,
  freightProgramExtraPercent: number,
  itemQuantity: number
): number {
  // Determinar comissão e taxa fixa pela faixa de preço (nova política março 2026)
  let effectiveCommission: number;
  let effectiveFixedFee: number;
  
  if (price < 8) {
    // Produtos < R$8: taxa fixa é metade do preço
    effectiveCommission = 14;
    effectiveFixedFee = price / 2;
  } else if (price <= 79) {
    effectiveCommission = 14;
    effectiveFixedFee = 4;
  } else if (price <= 199) {
    effectiveCommission = 16;
    effectiveFixedFee = 16;
  } else if (price <= 499) {
    effectiveCommission = 20;
    effectiveFixedFee = 20;
  } else {
    effectiveCommission = 20;
    effectiveFixedFee = 26;
  }
  
  // Usar valores customizados se diferentes dos automáticos
  if (commissionPercent !== 20 && commissionPercent !== 0) {
    effectiveCommission = commissionPercent;
  }
  if (fixedFee !== 20 && fixedFee !== 26 && fixedFee !== 0) {
    effectiveFixedFee = fixedFee;
  }
  
  // Frete grátis agora é subsidiado pela Shopee (sem coparticipação)
  // useFreightProgram mantido para compatibilidade, mas freightProgramExtraPercent deve ser 0
  effectiveCommission += (useFreightProgram ? freightProgramExtraPercent : 0);
  
  const percentTax = commissionCap > 0 
    ? Math.min(price * (effectiveCommission / 100), commissionCap)
    : price * (effectiveCommission / 100);
  const fixedTax = effectiveFixedFee * itemQuantity;
  return percentTax + fixedTax;
}

/**
 * Calcula taxas do Mercado Livre (Março 2026)
 * Nova política: custo fixo baseado em peso/dimensões para produtos < R$79
 * Custos fixos escalonados: R$6,25 (R$12,50-29), R$6,50 (R$29-50), R$6,75 (R$50-79)
 * Produtos < R$12,50 pagam metade do preço como custo fixo
 */
export function calculateMercadoLivreTaxes(
  price: number,
  commissionPercent: number,
  priceThreshold: number,
  fixedFeeBelowThreshold: number,
  fixedFeeAboveThreshold: number,
  itemQuantity: number
): number {
  const percentTax = price * (commissionPercent / 100);
  
  let fixedFee: number;
  if (price > priceThreshold) {
    fixedFee = fixedFeeAboveThreshold;
  } else if (price < 12.50) {
    // Produtos < R$12,50 pagam metade do preço
    fixedFee = price / 2;
  } else if (price <= 29) {
    fixedFee = 6.25;
  } else if (price <= 50) {
    fixedFee = 6.50;
  } else {
    fixedFee = fixedFeeBelowThreshold; // 6.75 para R$50-79
  }
  
  const fixedTax = fixedFee * itemQuantity;
  return percentTax + fixedTax;
}

/**
 * Calcula o lucro líquido dado um preço
 */
export function calculateProfit(
  price: number,
  cogs: number,
  taxes: number
): number {
  return price - cogs - taxes;
}

/**
 * Calcula a margem líquida dado um preço
 */
export function calculateMargin(
  price: number,
  profit: number
): number {
  if (price <= 0) return 0;
  return (profit / price) * 100;
}

// ===== BUSCA BINÁRIA PARA PREÇOS =====

type TaxCalculator = (price: number) => number;

/**
 * Encontra o preço de break-even (lucro = 0) usando busca binária
 */
export function findBreakEvenPrice(
  cogs: number,
  calculateTaxes: TaxCalculator,
  maxIterations: number = 50
): number {
  let lower = 0;
  let upper = cogs * 10 + 200;
  
  // Garantir que upper é suficiente
  while (calculateProfit(upper, cogs, calculateTaxes(upper)) < 0 && upper < 100000) {
    upper *= 2;
  }
  
  for (let i = 0; i < maxIterations; i++) {
    const mid = (lower + upper) / 2;
    const taxes = calculateTaxes(mid);
    const profit = calculateProfit(mid, cogs, taxes);
    
    if (Math.abs(profit) < 0.01) {
      return mid;
    }
    
    if (profit < 0) {
      lower = mid;
    } else {
      upper = mid;
    }
  }
  
  return (lower + upper) / 2;
}

/**
 * Encontra o preço alvo para atingir uma margem desejada usando busca binária
 */
export function findTargetPrice(
  cogs: number,
  targetMarginPercent: number,
  calculateTaxes: TaxCalculator,
  maxIterations: number = 50
): number {
  let lower = 0;
  let upper = cogs * 10 + 500;
  
  const targetMarginDecimal = targetMarginPercent / 100;
  
  // Garantir que upper é suficiente
  const checkMargin = (price: number) => {
    const taxes = calculateTaxes(price);
    const profit = calculateProfit(price, cogs, taxes);
    return profit / price;
  };
  
  while (checkMargin(upper) < targetMarginDecimal && upper < 100000) {
    upper *= 2;
  }
  
  for (let i = 0; i < maxIterations; i++) {
    const mid = (lower + upper) / 2;
    const taxes = calculateTaxes(mid);
    const profit = calculateProfit(mid, cogs, taxes);
    const margin = profit / mid;
    
    if (Math.abs(margin - targetMarginDecimal) < 0.0001) {
      return mid;
    }
    
    if (margin < targetMarginDecimal) {
      lower = mid;
    } else {
      upper = mid;
    }
  }
  
  return (lower + upper) / 2;
}

// ===== ARREDONDAMENTO PSICOLÓGICO =====

/**
 * Aplica arredondamento psicológico ao preço
 */
export function applyPsychologicalRounding(
  price: number,
  rounding: 'none' | '90' | '99' | '50'
): number {
  if (rounding === 'none') return Math.round(price * 100) / 100;
  
  const intPart = Math.floor(price);
  
  switch (rounding) {
    case '90':
      return intPart + 0.90;
    case '99':
      return intPart + 0.99;
    case '50':
      return intPart + 0.50;
    default:
      return price;
  }
}

/**
 * Aplica arredondamento para cima (usado em faixa máxima)
 */
export function applyPsychologicalRoundingUp(
  price: number,
  rounding: 'none' | '90' | '99' | '50'
): number {
  if (rounding === 'none') return Math.round(price * 100) / 100;
  
  const intPart = Math.ceil(price);
  
  switch (rounding) {
    case '90':
      return intPart - 0.10;
    case '99':
      return intPart - 0.01;
    case '50':
      return price < intPart - 0.50 ? intPart - 0.50 : intPart + 0.50;
    default:
      return price;
  }
}

// ===== CÁLCULO COMPLETO POR PLATAFORMA =====

/**
 * Calcula resultados para Shopee
 */
export function calculateShopeeResult(
  cogs: number,
  settings: AllSettings
): PlatformResult {
  const { shopee, itemQuantity } = settings.platform;
  const { targetMarginPercent, rangePaddingPercent, rounding } = settings.pricingGoals;
  
  const fixedFee = shopee.accountType === 'padrao' ? 4 : 7;
  
  const calculateTaxes = (price: number) =>
    calculateShopeeTaxes(
      price,
      shopee.commissionPercent,
      fixedFee,
      shopee.commissionCap,
      shopee.useFreightProgram,
      shopee.freightProgramExtraPercent,
      itemQuantity
    );
  
  const breakEvenPrice = findBreakEvenPrice(cogs, calculateTaxes);
  const targetPrice = findTargetPrice(cogs, targetMarginPercent, calculateTaxes);
  
  const rangeMin = applyPsychologicalRounding(Math.max(targetPrice, breakEvenPrice), rounding);
  const rangeMaxRaw = targetPrice * (1 + rangePaddingPercent / 100);
  const rangeMax = applyPsychologicalRoundingUp(rangeMaxRaw, rounding);
  
  const taxesAtTarget = calculateTaxes(rangeMin);
  const profitAtTarget = calculateProfit(rangeMin, cogs, taxesAtTarget);
  const actualMarginAtTarget = calculateMargin(rangeMin, profitAtTarget);
  
  const taxesAtRangeMax = calculateTaxes(rangeMax);
  const profitAtRangeMax = calculateProfit(rangeMax, cogs, taxesAtRangeMax);
  
  return {
    platformName: 'Shopee',
    breakEvenPrice,
    targetPrice,
    rangeMin,
    rangeMax,
    profitAtTarget,
    profitAtRangeMax,
    actualMarginAtTarget,
    taxesAtTarget,
    taxesAtRangeMax,
  };
}

/**
 * Calcula resultados para Mercado Livre
 */
export function calculateMercadoLivreResult(
  cogs: number,
  settings: AllSettings
): PlatformResult {
  const { mercadoLivre, itemQuantity } = settings.platform;
  const { targetMarginPercent, rangePaddingPercent, rounding } = settings.pricingGoals;
  
  const calculateTaxes = (price: number) =>
    calculateMercadoLivreTaxes(
      price,
      mercadoLivre.commissionPercent,
      mercadoLivre.priceThreshold,
      mercadoLivre.fixedFeeBelowThreshold,
      mercadoLivre.fixedFeeAboveThreshold,
      itemQuantity
    );
  
  const breakEvenPrice = findBreakEvenPrice(cogs, calculateTaxes);
  const targetPrice = findTargetPrice(cogs, targetMarginPercent, calculateTaxes);
  
  const rangeMin = applyPsychologicalRounding(Math.max(targetPrice, breakEvenPrice), rounding);
  const rangeMaxRaw = targetPrice * (1 + rangePaddingPercent / 100);
  const rangeMax = applyPsychologicalRoundingUp(rangeMaxRaw, rounding);
  
  const taxesAtTarget = calculateTaxes(rangeMin);
  const profitAtTarget = calculateProfit(rangeMin, cogs, taxesAtTarget);
  const actualMarginAtTarget = calculateMargin(rangeMin, profitAtTarget);
  
  const taxesAtRangeMax = calculateTaxes(rangeMax);
  const profitAtRangeMax = calculateProfit(rangeMax, cogs, taxesAtRangeMax);
  
  return {
    platformName: 'Mercado Livre',
    breakEvenPrice,
    targetPrice,
    rangeMin,
    rangeMax,
    profitAtTarget,
    profitAtRangeMax,
    actualMarginAtTarget,
    taxesAtTarget,
    taxesAtRangeMax,
  };
}

/**
 * Calcula todos os resultados
 */
export function calculateAllResults(settings: AllSettings): CalculationResult {
  const costs = calculateCostBreakdown(settings);
  const shopee = calculateShopeeResult(costs.cogs, settings);
  const mercadoLivre = calculateMercadoLivreResult(costs.cogs, settings);
  
  return {
    costs,
    shopee,
    mercadoLivre,
  };
}
