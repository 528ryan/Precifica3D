import React from 'react';
import type { AllSettings } from '../types';

interface PricingGoalsSectionProps {
  settings: AllSettings['pricingGoals'];
  onUpdate: (updates: Partial<AllSettings['pricingGoals']>) => void;
}

export const PricingGoalsSection: React.FC<PricingGoalsSectionProps> = ({
  settings,
  onUpdate,
}) => {
  return (
    <div className="card">
      <h2>🎯 Meta de Precificação</h2>
      
      <div className="form-group">
        <label htmlFor="targetMargin">
          Margem Desejada (%)
          <span className="tooltip" title="Margem líquida desejada sobre o preço final (após taxas)">ⓘ</span>
        </label>
        <input
          id="targetMargin"
          type="number"
          min="0"
          max="100"
          step="1"
          value={settings.targetMarginPercent}
          onChange={(e) => onUpdate({ targetMarginPercent: Math.max(0, Number(e.target.value)) })}
        />
      </div>

      <div className="form-group">
        <label htmlFor="rangePadding">
          Faixa de Anúncio (%)
          <span className="tooltip" title="Amplitude da faixa de preço sugerida (ex: 8% = até 8% acima do preço alvo)">ⓘ</span>
        </label>
        <input
          id="rangePadding"
          type="number"
          min="0"
          max="50"
          step="1"
          value={settings.rangePaddingPercent}
          onChange={(e) => onUpdate({ rangePaddingPercent: Math.max(0, Number(e.target.value)) })}
        />
      </div>

      <div className="form-group">
        <label>Arredondamento Psicológico</label>
        <div className="rounding-options">
          <label className={`rounding-option ${settings.rounding === 'none' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="rounding"
              value="none"
              checked={settings.rounding === 'none'}
              onChange={() => onUpdate({ rounding: 'none' })}
            />
            <span>Nenhum</span>
          </label>
          <label className={`rounding-option ${settings.rounding === '90' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="rounding"
              value="90"
              checked={settings.rounding === '90'}
              onChange={() => onUpdate({ rounding: '90' })}
            />
            <span>,90</span>
          </label>
          <label className={`rounding-option ${settings.rounding === '99' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="rounding"
              value="99"
              checked={settings.rounding === '99'}
              onChange={() => onUpdate({ rounding: '99' })}
            />
            <span>,99</span>
          </label>
          <label className={`rounding-option ${settings.rounding === '50' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="rounding"
              value="50"
              checked={settings.rounding === '50'}
              onChange={() => onUpdate({ rounding: '50' })}
            />
            <span>,50</span>
          </label>
        </div>
      </div>
    </div>
  );
};
