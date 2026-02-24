import React from 'react';
import type { AllSettings, Regime } from '../types';
import { impostoValor, impostoPercentEfetivo } from '../calc/tax/imposto';

interface ImpostoSectionProps {
  settings: AllSettings['imposto'];
  onUpdate: (updates: Partial<AllSettings['imposto']>) => void;
}

const REGIME_LABELS: Record<Regime, string> = {
  isento: 'Isento / CPF (0%)',
  mei: 'MEI (DAS mensal rateado)',
  simples: 'Simples Nacional (%)',
  presumido: 'Lucro Presumido (%)',
  custom: 'Custom (%)',
};

export const ImpostoSection: React.FC<ImpostoSectionProps> = ({ settings, onUpdate }) => {
  // Calcula valores de prévia para exibição ao usuário
  const PRECO_EXEMPLO = 100;
  const valorExemplo = settings.ativo ? impostoValor(PRECO_EXEMPLO, settings) : 0;
  const pctExemplo = settings.ativo ? impostoPercentEfetivo(PRECO_EXEMPLO, settings) : 0;

  const showPercentInput =
    settings.regime === 'simples' ||
    settings.regime === 'presumido' ||
    settings.regime === 'custom';

  const showMeiFields = settings.regime === 'mei';

  return (
    <div className="card">
      <h2>🧾 Impostos sobre Faturamento</h2>

      <div className="info-box">
        ℹ️ Imposto sobre faturamento é calculado sobre o preço de venda (receita).
        Impacta lucro, margem, break-even e preço alvo.
      </div>

      {/* Toggle ativo/inativo */}
      <div className="form-group checkbox-group">
        <label htmlFor="impostoAtivo">
          <input
            id="impostoAtivo"
            type="checkbox"
            checked={settings.ativo}
            onChange={(e) => onUpdate({ ativo: e.target.checked })}
          />
          Aplicar imposto sobre faturamento
        </label>
      </div>

      {settings.ativo && (
        <>
          {/* Regime */}
          <div className="form-group">
            <label htmlFor="impostoRegime">
              Regime Tributário
              <span
                className="tooltip"
                title="Selecione o regime que determina como o imposto é calculado"
              >
                ⓘ
              </span>
            </label>
            <select
              id="impostoRegime"
              value={settings.regime}
              onChange={(e) => onUpdate({ regime: e.target.value as Regime })}
            >
              {(Object.entries(REGIME_LABELS) as [Regime, string][]).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Percentual (Simples / Presumido / Custom) */}
          {showPercentInput && (
            <div className="form-group">
              <label htmlFor="impostoPercentual">
                Alíquota (%)
                <span
                  className="tooltip"
                  title="Percentual de imposto incidente sobre o faturamento (preço de venda)"
                >
                  ⓘ
                </span>
              </label>
              <input
                id="impostoPercentual"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={settings.percentual}
                onChange={(e) =>
                  onUpdate({ percentual: Math.max(0, Number(e.target.value)) })
                }
              />
            </div>
          )}

          {/* MEI */}
          {showMeiFields && (
            <>
              <div className="info-box">
                💡 Rateio do DAS por item. Ajuste vendas/mês para refletir seu volume.
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="meiDas">
                    DAS Mensal (R$)
                    <span className="tooltip" title="Valor da guia DAS do MEI por mês">
                      ⓘ
                    </span>
                  </label>
                  <input
                    id="meiDas"
                    type="number"
                    min="0"
                    step="0.01"
                    value={settings.meiDasMensal}
                    onChange={(e) =>
                      onUpdate({ meiDasMensal: Math.max(0, Number(e.target.value)) })
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="meiVendas">
                    Vendas / mês (unid.)
                    <span className="tooltip" title="Quantidade de itens vendidos por mês">
                      ⓘ
                    </span>
                  </label>
                  <input
                    id="meiVendas"
                    type="number"
                    min="1"
                    step="1"
                    value={settings.meiVendasMes}
                    onChange={(e) =>
                      onUpdate({ meiVendasMes: Math.max(1, Number(e.target.value)) })
                    }
                  />
                </div>
              </div>

              {/* Toggle rateio alternativo */}
              <div className="form-group checkbox-group">
                <label htmlFor="meiRatear">
                  <input
                    id="meiRatear"
                    type="checkbox"
                    checked={settings.meiRatearPorFaturamento}
                    onChange={(e) =>
                      onUpdate({ meiRatearPorFaturamento: e.target.checked })
                    }
                  />
                  Ratear por faturamento mensal (alternativo)
                </label>
              </div>

              {settings.meiRatearPorFaturamento && (
                <div className="form-group">
                  <label htmlFor="meiFaturamento">
                    Faturamento / mês (R$)
                    <span
                      className="tooltip"
                      title="Se 0, usa o rateio por unidade como fallback"
                    >
                      ⓘ
                    </span>
                  </label>
                  <input
                    id="meiFaturamento"
                    type="number"
                    min="0"
                    step="10"
                    value={settings.meiFaturamentoMes}
                    onChange={(e) =>
                      onUpdate({ meiFaturamentoMes: Math.max(0, Number(e.target.value)) })
                    }
                  />
                </div>
              )}
            </>
          )}

          {/* Prévia de imposto */}
          {settings.regime !== 'isento' && (
            <div className="info-box highlight-box">
              <strong>Prévia (base R${PRECO_EXEMPLO},00):</strong>
              <span style={{ marginLeft: '0.75rem' }}>
                Imposto por item:{' '}
                <strong>
                  R${valorExemplo.toFixed(2)} ({pctExemplo.toFixed(2)}% efetivo)
                </strong>
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};
