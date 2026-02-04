import { useMemo } from 'react';
import { useSettings } from './hooks/useSettings';
import { calculateAllResults } from './calc';
import {
  PrintSection,
  MaterialSection,
  EnergySection,
  ExtraCostsSection,
  PlatformSection,
  PricingGoalsSection,
  ResultsSection,
} from './components';
import './App.css';

function App() {
  const {
    settings,
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

  const results = useMemo(() => {
    return calculateAllResults(settings);
  }, [settings]);

  const isValid =
    (settings.print.printTimeHours > 0 || settings.print.printTimeMinutes > 0) &&
    settings.material.gramsUsed > 0;

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
