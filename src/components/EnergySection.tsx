import React from 'react';
import type { AllSettings } from '../types';
import { bandeiraExtras } from '../presets';

interface EnergySectionProps {
  settings: AllSettings['energy'];
  onUpdate: (updates: Partial<AllSettings['energy']>) => void;
}

export const EnergySection: React.FC<EnergySectionProps> = ({
  settings,
  onUpdate,
}) => {
  const handleBandeiraChange = (bandeira: 'verde' | 'amarela' | 'vermelha') => {
    onUpdate({
      bandeira,
      bandeiraExtra: bandeiraExtras[bandeira],
    });
  };

  return (
    <div className="card">
      <h2>⚡ Energia</h2>
      
      <div className="form-group">
        <label htmlFor="pricePerKwh">
          Preço kWh (R$)
          <span className="tooltip" title="Preço da energia elétrica por kWh (sem bandeira)">ⓘ</span>
        </label>
        <input
          id="pricePerKwh"
          type="number"
          min="0"
          step="0.01"
          value={settings.pricePerKwh}
          onChange={(e) => onUpdate({ pricePerKwh: Math.max(0, Number(e.target.value)) })}
        />
      </div>

      <div className="form-group">
        <label>Bandeira Tarifária</label>
        <div className="bandeira-options">
          <label className={`bandeira-option verde ${settings.bandeira === 'verde' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="bandeira"
              value="verde"
              checked={settings.bandeira === 'verde'}
              onChange={() => handleBandeiraChange('verde')}
            />
            <span>🟢 Verde</span>
          </label>
          <label className={`bandeira-option amarela ${settings.bandeira === 'amarela' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="bandeira"
              value="amarela"
              checked={settings.bandeira === 'amarela'}
              onChange={() => handleBandeiraChange('amarela')}
            />
            <span>🟡 Amarela</span>
          </label>
          <label className={`bandeira-option vermelha ${settings.bandeira === 'vermelha' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="bandeira"
              value="vermelha"
              checked={settings.bandeira === 'vermelha'}
              onChange={() => handleBandeiraChange('vermelha')}
            />
            <span>🔴 Vermelha</span>
          </label>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="bandeiraExtra">
          Extra Bandeira (R$/kWh)
          <span className="tooltip" title="Adicional por kWh conforme bandeira tarifária">ⓘ</span>
        </label>
        <input
          id="bandeiraExtra"
          type="number"
          min="0"
          step="0.01"
          value={settings.bandeiraExtra}
          onChange={(e) => onUpdate({ bandeiraExtra: Math.max(0, Number(e.target.value)) })}
        />
      </div>
    </div>
  );
};
