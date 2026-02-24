import { useState, useEffect, useCallback } from 'react';
import type { AllSettings } from '../types';
import {
  printerPresets,
  materialPresets,
  defaultEnergyPricePerKwh,
  defaultShopeeSettings,
  defaultMercadoLivreSettings,
  defaultTikTokShopSettings,
  bandeiraExtras,
  getSuggestedFixedFee,
} from '../presets';

const STORAGE_KEY = 'precifica3d-settings';

const defaultSettings: AllSettings = {
  print: {
    printerId: 'bambu-a1-mini',
    printingWatts: printerPresets[0].printingWatts,
    idleWatts: printerPresets[0].idleWatts,
    printTimeHours: 0,
    printTimeMinutes: 0,
  },
  material: {
    materialId: 'pla',
    pricePerKg: materialPresets[0].suggestedPricePerKg,
    gramsUsed: 0,
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
    laborHours: 0.25,
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
      freteGratisAtivo: defaultShopeeSettings.freteGratisAtivo,
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
};

export function useSettings() {
  const [settings, setSettings] = useState<AllSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultSettings, ...parsed };
      }
    } catch (e) {
      console.error('Erro ao carregar configurações:', e);
    }
    return defaultSettings;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Erro ao salvar configurações:', e);
    }
  }, [settings]);

  const updatePrint = useCallback((updates: Partial<AllSettings['print']>) => {
    setSettings((prev) => ({
      ...prev,
      print: { ...prev.print, ...updates },
    }));
  }, []);

  const updateMaterial = useCallback((updates: Partial<AllSettings['material']>) => {
    setSettings((prev) => ({
      ...prev,
      material: { ...prev.material, ...updates },
    }));
  }, []);

  const updateEnergy = useCallback((updates: Partial<AllSettings['energy']>) => {
    setSettings((prev) => ({
      ...prev,
      energy: { ...prev.energy, ...updates },
    }));
  }, []);

  const updateExtraCosts = useCallback((updates: Partial<AllSettings['extraCosts']>) => {
    setSettings((prev) => ({
      ...prev,
      extraCosts: { ...prev.extraCosts, ...updates },
    }));
  }, []);

  const updatePlatform = useCallback((updates: Partial<AllSettings['platform']>) => {
    setSettings((prev) => ({
      ...prev,
      platform: { ...prev.platform, ...updates },
    }));
  }, []);

  const updateShopee = useCallback((updates: Partial<AllSettings['platform']['shopee']>) => {
    setSettings((prev) => ({
      ...prev,
      platform: {
        ...prev.platform,
        shopee: { ...prev.platform.shopee, ...updates },
      },
    }));
  }, []);

  const updateMercadoLivre = useCallback((updates: Partial<AllSettings['platform']['mercadoLivre']>) => {
    setSettings((prev) => ({
      ...prev,
      platform: {
        ...prev.platform,
        mercadoLivre: { ...prev.platform.mercadoLivre, ...updates },
      },
    }));
  }, []);

  const updateTikTokShop = useCallback((updates: Partial<AllSettings['platform']['tikTokShop']>) => {
    setSettings((prev) => ({
      ...prev,
      platform: {
        ...prev.platform,
        tikTokShop: { ...prev.platform.tikTokShop, ...updates },
      },
    }));
  }, []);

  const updatePricingGoals = useCallback((updates: Partial<AllSettings['pricingGoals']>) => {
    setSettings((prev) => ({
      ...prev,
      pricingGoals: { ...prev.pricingGoals, ...updates },
    }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  return {
    settings,
    setSettings,
    updatePrint,
    updateMaterial,
    updateEnergy,
    updateExtraCosts,
    updatePlatform,
    updateShopee,
    updateMercadoLivre,
    updateTikTokShop,
    updatePricingGoals,
    resetSettings,
  };
}
