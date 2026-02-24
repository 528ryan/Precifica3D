import { describe, it, expect } from 'vitest';
import { adsValor } from './ads';
import { calculateAllResults } from './index';
import type { AdsConfig, AllSettings } from '../types';
import {
  printerPresets,
  materialPresets,
  defaultEnergyPricePerKwh,
  defaultShopeeSettings,
  defaultMercadoLivreSettings,
  defaultTikTokShopSettings,
  defaultImpostoSettings,
  bandeiraExtras,
  getSuggestedFixedFee,
} from '../presets';
import { defaultAdsConfig } from './ads';

// ───── helpers ─────

const OFF: AdsConfig = { ...defaultAdsConfig };
const makeAds = (overrides: Partial<AdsConfig>): AdsConfig => ({
  ...defaultAdsConfig,
  enabled: true,
  ...overrides,
});

// Configurações mínimas válidas para rodar o solver
const baseSettings: AllSettings = {
  print: {
    printerId: 'bambu-a1-mini',
    printingWatts: printerPresets[0].printingWatts,
    idleWatts: printerPresets[0].idleWatts,
    printTimeHours: 2,
    printTimeMinutes: 0,
    materialVariant: undefined,
  },
  material: {
    materialId: 'pla',
    pricePerKg: materialPresets[0].suggestedPricePerKg,
    gramsUsed: 50,
    lossPercent: materialPresets[0].suggestedLossPercent,
    isMulticolor: false,
    fixedPurgeGrams: 0,
    powerFactor: materialPresets[0].powerFactor,
  },
  energy: {
    pricePerKwh: defaultEnergyPricePerKwh,
    bandeira: 'verde',
    bandeiraExtra: bandeiraExtras['verde'],
  },
  extraCosts: {
    laborRatePerHour: 0,
    laborHours: 0,
    packagingCost: 0,
    depreciationMode: 'perHour',
    depreciationPerHour: 0,
    printerPrice: 0,
    printerLifeHours: 5000,
    otherFixedCosts: 0,
  },
  platform: {
    shopee: {
      commissionBasePercent: defaultShopeeSettings.commissionBasePercent,
      transactionTaxPercent: defaultShopeeSettings.transactionTaxPercent,
      freteExtraPercent: defaultShopeeSettings.freteExtraPercent,
      freteGratisAtivo: false,
      fixedFeePerItem: getSuggestedFixedFee(
        defaultShopeeSettings.sellerType,
        defaultShopeeSettings.orderVolume
      ),
      commissionPercentCap: defaultShopeeSettings.commissionPercentCap,
      sellerType: defaultShopeeSettings.sellerType,
      orderVolume: defaultShopeeSettings.orderVolume,
    },
    mercadoLivre: {
      adType: 'classico',
      commissionPercent: defaultMercadoLivreSettings.commissionClassico,
      priceThreshold: defaultMercadoLivreSettings.priceThreshold,
      fixedFeeBelowThreshold: defaultMercadoLivreSettings.fixedFeeBelowThreshold,
      fixedFeeAboveThreshold: defaultMercadoLivreSettings.fixedFeeAboveThreshold,
    },
    tikTokShop: {
      commissionPercent: defaultTikTokShopSettings.commissionPercent,
      fixedFeePerItem: defaultTikTokShopSettings.fixedFeePerItem,
      fixedFeeThreshold: defaultTikTokShopSettings.fixedFeeThreshold,
      promoZeroCommission: defaultTikTokShopSettings.promoZeroCommission,
    },
    itemQuantity: 1,
  },
  pricingGoals: {
    targetMarginPercent: 30,
    rangePaddingPercent: 8,
    rounding: 'none',
  },
  imposto: {
    ativo: defaultImpostoSettings.ativo,
    regime: defaultImpostoSettings.regime,
    percentual: defaultImpostoSettings.percentual,
    meiDasMensal: defaultImpostoSettings.meiDasMensal,
    meiVendasMes: defaultImpostoSettings.meiVendasMes,
    meiRatearPorFaturamento: defaultImpostoSettings.meiRatearPorFaturamento,
    meiFaturamentoMes: defaultImpostoSettings.meiFaturamentoMes,
  },
  adsShopee: { ...defaultAdsConfig },
  adsMercado: { ...defaultAdsConfig },
  adsTikTok: { ...defaultAdsConfig },
};

// ───── Testes unitários de adsValor ─────

describe('adsValor — percent_sales (Shopee Ads)', () => {
  const shopeeAds = makeAds({ model: 'percent_sales', percentSales: 10 });

  it('retorna 10% do preço para Shopee', () => {
    expect(adsValor(100, 'shopee', 1, shopeeAds, OFF, OFF)).toBeCloseTo(10, 5);
  });

  it('não aplica em mercado_livre', () => {
    expect(adsValor(100, 'mercado_livre', 1, shopeeAds, OFF, OFF)).toBe(0);
  });

  it('não aplica em tiktok', () => {
    expect(adsValor(100, 'tiktok', 1, shopeeAds, OFF, OFF)).toBe(0);
  });

  it('retorna 0 quando disabled', () => {
    expect(adsValor(100, 'shopee', 1, OFF, OFF, OFF)).toBe(0);
  });
});

describe('adsValor — per_order rateado (Mercado Ads)', () => {
  const mercadoAds = makeAds({ model: 'per_order', perOrder: 12, splitPerItem: true });

  it('retorna 4 para perOrder=12, itens=3, rateado', () => {
    expect(adsValor(100, 'mercado_livre', 3, OFF, mercadoAds, OFF)).toBeCloseTo(4, 5);
  });

  it('retorna 12 sem ratear', () => {
    const ads = makeAds({ model: 'per_order', perOrder: 12, splitPerItem: false });
    expect(adsValor(100, 'mercado_livre', 3, OFF, ads, OFF)).toBeCloseTo(12, 5);
  });

  it('não aplica em shopee', () => {
    expect(adsValor(100, 'shopee', 3, OFF, mercadoAds, OFF)).toBe(0);
  });

  it('não aplica em tiktok', () => {
    expect(adsValor(100, 'tiktok', 3, OFF, mercadoAds, OFF)).toBe(0);
  });
});

describe('adsValor — per_item (TikTok Ads)', () => {
  const tiktokAds = makeAds({ model: 'per_item', perItem: 2 });

  it('retorna 2 por item para TikTok', () => {
    expect(adsValor(100, 'tiktok', 1, OFF, OFF, tiktokAds)).toBeCloseTo(2, 5);
  });

  it('não aplica em shopee', () => {
    expect(adsValor(100, 'shopee', 1, OFF, OFF, tiktokAds)).toBe(0);
  });

  it('não aplica em mercado_livre', () => {
    expect(adsValor(100, 'mercado_livre', 1, OFF, OFF, tiktokAds)).toBe(0);
  });
});

describe('adsValor — validações', () => {
  it('retorna 0 para percentSales negativo (guardado como 0 pelo input)', () => {
    const ads = makeAds({ model: 'percent_sales', percentSales: 0 });
    expect(adsValor(100, 'shopee', 1, ads, OFF, OFF)).toBe(0);
  });

  it('retorna 0 com perOrder=0', () => {
    const ads = makeAds({ model: 'per_order', perOrder: 0, splitPerItem: true });
    expect(adsValor(100, 'shopee', 1, ads, OFF, OFF)).toBe(0);
  });
});

// ───── Integração com solver ─────

describe('integração: preço alvo deve ser maior com Ads ON', () => {
  it('Shopee — adsON eleva o preço alvo', () => {
    const settingsOff = { ...baseSettings };
    const settingsOn = {
      ...baseSettings,
      adsShopee: makeAds({ model: 'percent_sales' as const, percentSales: 10 }),
    };

    const resultOff = calculateAllResults(settingsOff);
    const resultOn = calculateAllResults(settingsOn);

    expect(resultOn.shopee.targetPrice).toBeGreaterThan(resultOff.shopee.targetPrice);
    // Ads do Shopee não deve afetar ML nem TikTok
    expect(resultOn.mercadoLivre.targetPrice).toBeCloseTo(resultOff.mercadoLivre.targetPrice, 2);
    expect(resultOn.tikTokShop.targetPrice).toBeCloseTo(resultOff.tikTokShop.targetPrice, 2);
  });

  it('Mercado Livre — adsON eleva o preço alvo', () => {
    const settingsOn = {
      ...baseSettings,
      adsMercado: makeAds({ model: 'percent_sales' as const, percentSales: 10 }),
    };

    const resultOff = calculateAllResults(baseSettings);
    const resultOn = calculateAllResults(settingsOn);

    expect(resultOn.mercadoLivre.targetPrice).toBeGreaterThan(resultOff.mercadoLivre.targetPrice);
    expect(resultOn.shopee.targetPrice).toBeCloseTo(resultOff.shopee.targetPrice, 2);
    expect(resultOn.tikTokShop.targetPrice).toBeCloseTo(resultOff.tikTokShop.targetPrice, 2);
  });

  it('TikTok — adsON eleva o preço alvo', () => {
    const settingsOn = {
      ...baseSettings,
      adsTikTok: makeAds({ model: 'percent_sales' as const, percentSales: 10 }),
    };

    const resultOff = calculateAllResults(baseSettings);
    const resultOn = calculateAllResults(settingsOn);

    expect(resultOn.tikTokShop.targetPrice).toBeGreaterThan(resultOff.tikTokShop.targetPrice);
    expect(resultOn.shopee.targetPrice).toBeCloseTo(resultOff.shopee.targetPrice, 2);
    expect(resultOn.mercadoLivre.targetPrice).toBeCloseTo(resultOff.mercadoLivre.targetPrice, 2);
  });

  it('adsBreakdownAtTarget.adsValor é positivo quando Ads ON', () => {
    const settingsOn = {
      ...baseSettings,
      adsShopee: makeAds({ model: 'percent_sales' as const, percentSales: 10 }),
    };
    const result = calculateAllResults(settingsOn);
    expect(result.shopee.adsBreakdownAtTarget.adsValor).toBeGreaterThan(0);
    expect(result.mercadoLivre.adsBreakdownAtTarget.adsValor).toBe(0);
    expect(result.tikTokShop.adsBreakdownAtTarget.adsValor).toBe(0);
  });
});
