import { useMemo, useCallback } from 'react';
import { useSettings } from './hooks/useSettings';
import { useProducts } from './hooks/useProducts';
import { calculateAllResults } from './calc';
import type { SavedProduct } from './types';
import {
  PrintSection,
  MaterialSection,
  EnergySection,
  ExtraCostsSection,
  PlatformSection,
  PricingGoalsSection,
  ResultsSection,
  ProductPresetsSection,
  KitSection,
} from './components';
import './App.css';

function App() {
  const {
    settings,
    setSettings,
    updatePrint,
    updateMaterial,
    updateEnergy,
    updateExtraCosts,
    updatePlatform,
    updateShopee,
    updateMercadoLivre,
    updatePricingGoals,
    resetSettings,
  } = useSettings();

  const {
    products,
    kits,
    saveProduct,
    deleteProduct,
    saveKit,
    deleteKit,
  } = useProducts();

  const results = useMemo(() => {
    return calculateAllResults(settings);
  }, [settings]);

  const isValid =
    (settings.print.printTimeHours > 0 || settings.print.printTimeMinutes > 0) &&
    settings.material.gramsUsed > 0;

  const handleLoadProduct = useCallback((product: SavedProduct) => {
    setSettings((prev) => ({
      ...prev,
      print: { ...product.print },
      material: { ...product.material },
      extraCosts: { ...product.extraCosts },
    }));
  }, [setSettings]);

  return (
    <div className="app">
      <header className="header">
        <h1>🖨️ Precifica3D</h1>
        <p className="subtitle">Calculadora de Preços para Impressão 3D</p>
        <button className="reset-btn" onClick={resetSettings} title="Resetar configurações">
          🔄 Resetar
        </button>
      </header>

      <main className="main">
        <div className="input-sections">
          <PrintSection
            settings={settings.print}
            materialId={settings.material.materialId}
            onUpdate={updatePrint}
          />

          <MaterialSection
            settings={settings.material}
            onUpdate={updateMaterial}
          />

          <EnergySection
            settings={settings.energy}
            onUpdate={updateEnergy}
          />

          <ExtraCostsSection
            settings={settings.extraCosts}
            onUpdate={updateExtraCosts}
          />

          <PlatformSection
            settings={settings.platform}
            onUpdate={updatePlatform}
            onUpdateShopee={updateShopee}
            onUpdateMercadoLivre={updateMercadoLivre}
          />

          <PricingGoalsSection
            settings={settings.pricingGoals}
            onUpdate={updatePricingGoals}
          />

          <ProductPresetsSection
            products={products}
            currentSettings={settings}
            currentCogs={results.costs.cogs}
            onSaveProduct={saveProduct}
            onDeleteProduct={deleteProduct}
            onLoadProduct={handleLoadProduct}
          />

          <KitSection
            products={products}
            kits={kits}
            onSaveKit={saveKit}
            onDeleteKit={deleteKit}
            platformSettings={settings.platform}
            pricingGoals={settings.pricingGoals}
          />
        </div>

        <div className="results-section">
          <ResultsSection
            costs={results.costs}
            shopee={results.shopee}
            mercadoLivre={results.mercadoLivre}
            isValid={isValid}
          />
        </div>
      </main>

      <footer className="footer">
        <p>
          Precifica3D © {new Date().getFullYear()} — Calculadora para precificação de impressões 3D
        </p>
        <p className="disclaimer">
          ⚠️ Taxas e comissões são apenas presets editáveis. Sempre confirme os valores atuais nas plataformas.
        </p>
      </footer>
    </div>
  );
}

export default App;
