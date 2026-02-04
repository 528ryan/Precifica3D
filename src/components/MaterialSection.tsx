import React from 'react';
import type { AllSettings } from '../types';
import { materialPresets } from '../presets';

interface MaterialSectionProps {
  settings: AllSettings['material'];
  onUpdate: (updates: Partial<AllSettings['material']>) => void;
}

export const MaterialSection: React.FC<MaterialSectionProps> = ({
  settings,
  onUpdate,
}) => {
  const handleMaterialChange = (materialId: string) => {
    const preset = materialPresets.find((m) => m.id === materialId);
    if (preset) {
      const baseLoss = preset.suggestedLossPercent;
      const finalLoss = settings.isMulticolor ? baseLoss + 10 : baseLoss;
      
      onUpdate({
        materialId,
        pricePerKg: preset.suggestedPricePerKg,
        lossPercent: finalLoss,
        powerFactor: preset.powerFactor,
      });
    }
  };

  const handleMulticolorChange = (isMulticolor: boolean) => {
    const preset = materialPresets.find((m) => m.id === settings.materialId);
    const baseLoss = preset?.suggestedLossPercent || 10;
    
    onUpdate({
      isMulticolor,
      lossPercent: isMulticolor ? baseLoss + 10 : baseLoss,
    });
  };

  return (
    <div className="card">
      <h2>🧵 Material (Filamento)</h2>
      
      <div className="form-group">
        <label htmlFor="material">Material</label>
        <select
          id="material"
          value={settings.materialId}
          onChange={(e) => handleMaterialChange(e.target.value)}
        >
          {materialPresets.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="pricePerKg">
            Preço (R$/kg)
            <span className="tooltip" title="Preço do filamento por quilograma">ⓘ</span>
          </label>
          <input
            id="pricePerKg"
            type="number"
            min="0"
            step="0.01"
            value={settings.pricePerKg}
            onChange={(e) => onUpdate({ pricePerKg: Math.max(0, Number(e.target.value)) })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="gramsUsed">
            Gramas (g)
            <span className="tooltip" title="Quantidade de filamento indicada no slicer">ⓘ</span>
          </label>
          <input
            id="gramsUsed"
            type="number"
            min="0"
            step="0.1"
            value={settings.gramsUsed || ''}
            onChange={(e) => onUpdate({ gramsUsed: Math.max(0, Number(e.target.value)) })}
            placeholder="Do slicer"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="lossPercent">
            Perdas/Purga (%)
            <span className="tooltip" title="Percentual extra para perdas, skirt, brim, etc.">ⓘ</span>
          </label>
          <input
            id="lossPercent"
            type="number"
            min="0"
            max="100"
            value={settings.lossPercent}
            onChange={(e) => onUpdate({ lossPercent: Math.max(0, Number(e.target.value)) })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="fixedPurge">
            Purga Fixa (g)
            <span className="tooltip" title="Quantidade fixa de purga (opcional)">ⓘ</span>
          </label>
          <input
            id="fixedPurge"
            type="number"
            min="0"
            step="0.1"
            value={settings.fixedPurgeGrams || ''}
            onChange={(e) => onUpdate({ fixedPurgeGrams: Math.max(0, Number(e.target.value)) })}
            placeholder="Opcional"
          />
        </div>
      </div>

      <div className="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={settings.isMulticolor}
            onChange={(e) => handleMulticolorChange(e.target.checked)}
          />
          <span>Multicor / AMS</span>
          <span className="tooltip" title="Adiciona +10% às perdas sugeridas">ⓘ</span>
        </label>
      </div>

      <div className="form-group">
        <label htmlFor="powerFactor">
          Fator de Energia
          <span className="tooltip" title="Multiplicador de consumo de energia do material">ⓘ</span>
        </label>
        <input
          id="powerFactor"
          type="number"
          min="0.5"
          max="2"
          step="0.01"
          value={settings.powerFactor}
          onChange={(e) => onUpdate({ powerFactor: Math.max(0.5, Number(e.target.value)) })}
        />
      </div>
    </div>
  );
};
