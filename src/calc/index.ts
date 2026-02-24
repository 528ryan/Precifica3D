import type {
  AllSettings,
  CostBreakdown,
  PlatformResult,
  TaxBreakdown,
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
 * Calcula taxas da Shopee (Fevereiro 2026)
 * 
 * Estrutura real:
 * - Comissão: 12% base + 2% transação + 6% frete (opcional) = 14-20%
 * - Taxa fixa: R$4 (CNPJ) ou R$7 (CPF baixo volume) por item
 * - Teto de comissão: R$100,00 (aplicado APENAS à parte percentual, não à taxa fixa)
 * 
 * Fórmula:
 * percentual_total = commissionBasePercent + transactionTaxPercent + (useFreightProgram ? freightProgramPercent : 0)
 * comissao_percentual = price * percentual_total / 100
 * if (comissao_percentual > commissionPercentCap) comissao_percentual = commissionPercentCap
 * taxa_fixa = fixedFeePerItem * itemQuantity
 * total_taxas = comissao_percentual + taxa_fixa
 */
export function calculateShopeeTaxes(
  price: number,
  commissionBasePercent: number,
  transactionTaxPercent: number,
  freteExtraPercent: number,
  freteGratisAtivo: boolean,
  fixedFeePerItem: number,
  commissionPercentCap: number,
  itemQuantity: number
): number {
  return calculateShopeeTaxBreakdown(
    price, commissionBasePercent, transactionTaxPercent, freteExtraPercent,
    freteGratisAtivo, fixedFeePerItem, commissionPercentCap, itemQuantity
  ).total;
}

/**
 * Versão com breakdown completo das taxas da Shopee
 */
export function calculateShopeeTaxBreakdown(
  price: number,
  commissionBasePercent: number,
  transactionTaxPercent: number,
  freteExtraPercent: number,
  freteGratisAtivo: boolean,
  fixedFeePerItem: number,
  commissionPercentCap: number,
  itemQuantity: number
): TaxBreakdown {
  const percentualTotal =
    commissionBasePercent + transactionTaxPercent + (freteGratisAtivo ? freteExtraPercent : 0);

  let commissionValue = (price * percentualTotal) / 100;
  const commissionCapped = commissionValue > commissionPercentCap;
  if (commissionCapped) {
    commissionValue = commissionPercentCap;
  }

  const fixedFeeTotal = fixedFeePerItem * itemQuantity;

  return {
    percentualTotal,
    commissionValue,
    commissionCapped,
    fixedFeeTotal,
    total: commissionValue + fixedFeeTotal,
  };
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
  return calculateMercadoLivreTaxBreakdown(
    price, commissionPercent, priceThreshold,
    fixedFeeBelowThreshold, fixedFeeAboveThreshold, itemQuantity
  ).total;
}

/**
 * Versão com breakdown completo das taxas do Mercado Livre
 */
export function calculateMercadoLivreTaxBreakdown(
  price: number,
  commissionPercent: number,
  priceThreshold: number,
  fixedFeeBelowThreshold: number,
  fixedFeeAboveThreshold: number,
  itemQuantity: number
): TaxBreakdown {
  const commissionValue = price * (commissionPercent / 100);

  let fixedFeeUnit: number;
  if (price > priceThreshold) {
    fixedFeeUnit = fixedFeeAboveThreshold;
  } else if (price < 12.50) {
    // Produtos < R$12,50 pagam metade do preço
    fixedFeeUnit = price / 2;
  } else if (price <= 29) {
    fixedFeeUnit = 6.25;
  } else if (price <= 50) {
    fixedFeeUnit = 6.50;
  } else {
    fixedFeeUnit = fixedFeeBelowThreshold; // 6.75 para R$50-79
  }

  const fixedFeeTotal = fixedFeeUnit * itemQuantity;

  return {
    percentualTotal: commissionPercent,
    commissionValue,
    commissionCapped: false,
    fixedFeeTotal,
    total: commissionValue + fixedFeeTotal,
  };
}

/**
 * Calcula taxas do TikTok Shop Brasil (2026)
 *
 * Regras:
 * - Comissão percentual fixa: commissionPercent% (padrão 6%) sobre o valor do produto.
 * - Taxa fixa: fixedFeePerItem por item quando preço < fixedFeeThreshold (padrão R$79).
 * - Não há teto de comissão.
 * - Incentivo: se promoZeroCommission=true, comissão percentual = 0%.
 *
 * Exemplos:
 *   preco=50  → 6% de 50 + R$2 taxa fixa = 3 + 2 = R$5,00
 *   preco=120 → 6% de 120, sem taxa fixa   = R$7,20
 *
 * Fonte: https://seller-br.tiktok.com/university/essay?knowledge_id=10000785
 */
export function calculateTikTokShopTaxes(
  price: number,
  commissionPercent: number,
  fixedFeePerItem: number,
  fixedFeeThreshold: number,
  promoZeroCommission: boolean,
  itemQuantity: number
): number {
  return calculateTikTokShopTaxBreakdown(
    price, commissionPercent, fixedFeePerItem,
    fixedFeeThreshold, promoZeroCommission, itemQuantity
  ).total;
}

/**
 * Versão com breakdown completo das taxas do TikTok Shop
 */
export function calculateTikTokShopTaxBreakdown(
  price: number,
  commissionPercent: number,
  fixedFeePerItem: number,
  fixedFeeThreshold: number,
  promoZeroCommission: boolean,
  itemQuantity: number
): TaxBreakdown {
  const effectivePercent = promoZeroCommission ? 0 : commissionPercent;
  const commissionValue = price * (effectivePercent / 100);

  // Taxa fixa só se preço < threshold
  const fixedFeeTotal = price < fixedFeeThreshold ? fixedFeePerItem * itemQuantity : 0;

  return {
    percentualTotal: effectivePercent,
    commissionValue,
    commissionCapped: false,
    fixedFeeTotal,
    total: commissionValue + fixedFeeTotal,
  };
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
  
  const calculateTaxes = (price: number) =>
    calculateShopeeTaxes(
      price,
      shopee.commissionBasePercent,
      shopee.transactionTaxPercent,
      shopee.freteExtraPercent,
      shopee.freteGratisAtivo,
      shopee.fixedFeePerItem,
      shopee.commissionPercentCap,
      itemQuantity
    );
  
  const breakEvenPrice = findBreakEvenPrice(cogs, calculateTaxes);
  const targetPrice = findTargetPrice(cogs, targetMarginPercent, calculateTaxes);
  
  const rangeMin = applyPsychologicalRounding(Math.max(targetPrice, breakEvenPrice), rounding);
  const rangeMaxRaw = targetPrice * (1 + rangePaddingPercent / 100);
  const rangeMax = applyPsychologicalRoundingUp(rangeMaxRaw, rounding);
  
  const taxBreakdownAtTarget = calculateShopeeTaxBreakdown(
    rangeMin,
    shopee.commissionBasePercent,
    shopee.transactionTaxPercent,
    shopee.freteExtraPercent,
    shopee.freteGratisAtivo,
    shopee.fixedFeePerItem,
    shopee.commissionPercentCap,
    itemQuantity
  );
  const profitAtTarget = calculateProfit(rangeMin, cogs, taxBreakdownAtTarget.total);
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
    taxesAtTarget: taxBreakdownAtTarget.total,
    taxesAtRangeMax,
    taxBreakdownAtTarget,
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
  
  const taxBreakdownAtTarget = calculateMercadoLivreTaxBreakdown(
    rangeMin,
    mercadoLivre.commissionPercent,
    mercadoLivre.priceThreshold,
    mercadoLivre.fixedFeeBelowThreshold,
    mercadoLivre.fixedFeeAboveThreshold,
    itemQuantity
  );
  const profitAtTarget = calculateProfit(rangeMin, cogs, taxBreakdownAtTarget.total);
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
    taxesAtTarget: taxBreakdownAtTarget.total,
    taxesAtRangeMax,
    taxBreakdownAtTarget,
  };
}

/**
 * Calcula resultados para TikTok Shop Brasil
 */
export function calculateTikTokShopResult(
  cogs: number,
  settings: AllSettings
): PlatformResult {
  const { tikTokShop, itemQuantity } = settings.platform;
  const { targetMarginPercent, rangePaddingPercent, rounding } = settings.pricingGoals;

  const calculateTaxes = (price: number) =>
    calculateTikTokShopTaxes(
      price,
      tikTokShop.commissionPercent,
      tikTokShop.fixedFeePerItem,
      tikTokShop.fixedFeeThreshold,
      tikTokShop.promoZeroCommission,
      itemQuantity
    );

  const breakEvenPrice = findBreakEvenPrice(cogs, calculateTaxes);
  const targetPrice = findTargetPrice(cogs, targetMarginPercent, calculateTaxes);

  const rangeMin = applyPsychologicalRounding(Math.max(targetPrice, breakEvenPrice), rounding);
  const rangeMaxRaw = targetPrice * (1 + rangePaddingPercent / 100);
  const rangeMax = applyPsychologicalRoundingUp(rangeMaxRaw, rounding);

  const taxBreakdownAtTarget = calculateTikTokShopTaxBreakdown(
    rangeMin,
    tikTokShop.commissionPercent,
    tikTokShop.fixedFeePerItem,
    tikTokShop.fixedFeeThreshold,
    tikTokShop.promoZeroCommission,
    itemQuantity
  );
  const profitAtTarget = calculateProfit(rangeMin, cogs, taxBreakdownAtTarget.total);
  const actualMarginAtTarget = calculateMargin(rangeMin, profitAtTarget);

  const taxesAtRangeMax = calculateTaxes(rangeMax);
  const profitAtRangeMax = calculateProfit(rangeMax, cogs, taxesAtRangeMax);

  return {
    platformName: 'TikTok Shop',
    breakEvenPrice,
    targetPrice,
    rangeMin,
    rangeMax,
    profitAtTarget,
    profitAtRangeMax,
    actualMarginAtTarget,
    taxesAtTarget: taxBreakdownAtTarget.total,
    taxesAtRangeMax,
    taxBreakdownAtTarget,
  };
}

/**
 * Calcula todos os resultados
 */
export function calculateAllResults(settings: AllSettings): CalculationResult {
  const costs = calculateCostBreakdown(settings);
  const shopee = calculateShopeeResult(costs.cogs, settings);
  const mercadoLivre = calculateMercadoLivreResult(costs.cogs, settings);
  const tikTokShop = calculateTikTokShopResult(costs.cogs, settings);

  return {
    costs,
    shopee,
    mercadoLivre,
    tikTokShop,
  };
}
