import React from 'react';
import type { AllSettings } from '../types';

interface ExtraCostsSectionProps {
  settings: AllSettings['extraCosts'];
  onUpdate: (updates: Partial<AllSettings['extraCosts']>) => void;
}

export const ExtraCostsSection: React.FC<ExtraCostsSectionProps> = ({
  settings,
  onUpdate,
}) => {
  const calculatedDepreciation = settings.printerLifeHours > 0
    ? settings.printerPrice / settings.printerLifeHours
    : 0;

  return (
    <div className="card">
      <h2>💰 Custos Extras</h2>
      
      <div className="subsection">
        <h3>Mão de Obra</h3>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="laborRate">
              Valor/hora (R$)
              <span className="tooltip" title="Seu custo por hora de trabalho">ⓘ</span>
            </label>
            <input
              id="laborRate"
              type="number"
              min="0"
              step="0.01"
              value={settings.laborRatePerHour || ''}
              onChange={(e) => onUpdate({ laborRatePerHour: Math.max(0, Number(e.target.value)) })}
              placeholder="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="laborHours">
              Horas (h)
              <span className="tooltip" title="Tempo gasto com preparo, pós-processamento, etc.">ⓘ</span>
            </label>
            <input
              id="laborHours"
              type="number"
              min="0"
              step="0.25"
              value={settings.laborHours}
              onChange={(e) => onUpdate({ laborHours: Math.max(0, Number(e.target.value)) })}
            />
          </div>
        </div>
      </div>

      <div className="subsection">
        <h3>Embalagem</h3>
        <div className="form-group">
          <label htmlFor="packaging">
            Custo (R$)
            <span className="tooltip" title="Custo de embalagem por item">ⓘ</span>
          </label>
          <input
            id="packaging"
            type="number"
            min="0"
            step="0.01"
            value={settings.packagingCost || ''}
            onChange={(e) => onUpdate({ packagingCost: Math.max(0, Number(e.target.value)) })}
            placeholder="0"
          />
        </div>
      </div>

      <div className="subsection">
        <h3>Depreciação / Manutenção</h3>
        <div className="form-group">
          <label>Modo de Cálculo</label>
          <div className="toggle-buttons">
            <button
              type="button"
              className={settings.depreciationMode === 'perHour' ? 'active' : ''}
              onClick={() => onUpdate({ depreciationMode: 'perHour' })}
            >
              R$/hora direto
            </button>
            <button
              type="button"
              className={settings.depreciationMode === 'calculated' ? 'active' : ''}
              onClick={() => onUpdate({ depreciationMode: 'calculated' })}
            >
              Calcular
            </button>
          </div>
        </div>

        {settings.depreciationMode === 'perHour' ? (
          <div className="form-group">
            <label htmlFor="deprecPerHour">
              Custo/hora (R$)
              <span className="tooltip" title="Custo de desgaste da impressora por hora de uso">ⓘ</span>
            </label>
            <input
              id="deprecPerHour"
              type="number"
              min="0"
              step="0.01"
              value={settings.depreciationPerHour || ''}
              onChange={(e) => onUpdate({ depreciationPerHour: Math.max(0, Number(e.target.value)) })}
              placeholder="0"
            />
          </div>
        ) : (
          <>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="printerPrice">
                  Preço Impressora (R$)
                  <span className="tooltip" title="Valor pago na impressora">ⓘ</span>
                </label>
                <input
                  id="printerPrice"
                  type="number"
                  min="0"
                  step="1"
                  value={settings.printerPrice || ''}
                  onChange={(e) => onUpdate({ printerPrice: Math.max(0, Number(e.target.value)) })}
                  placeholder="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="lifeHours">
                  Vida útil (h)
                  <span className="tooltip" title="Estimativa de horas totais de uso">ⓘ</span>
                </label>
                <input
                  id="lifeHours"
                  type="number"
                  min="0"
                  step="100"
                  value={settings.printerLifeHours}
                  onChange={(e) => onUpdate({ printerLifeHours: Math.max(0, Number(e.target.value)) })}
                />
              </div>
            </div>
            <div className="info-box">
              💡 Custo calculado: R$ {calculatedDepreciation.toFixed(2)}/hora
            </div>
          </>
        )}
      </div>

      <div className="subsection">
        <h3>Outros Custos</h3>
        <div className="form-group">
          <label htmlFor="otherCosts">
            Custos Fixos (R$)
            <span className="tooltip" title="Outros custos fixos por item (ex: cola, fita, etc.)">ⓘ</span>
          </label>
          <input
            id="otherCosts"
            type="number"
            min="0"
            step="0.01"
            value={settings.otherFixedCosts || ''}
            onChange={(e) => onUpdate({ otherFixedCosts: Math.max(0, Number(e.target.value)) })}
            placeholder="0"
          />
        </div>
      </div>
    </div>
  );
};
