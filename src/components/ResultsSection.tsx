import React from 'react';
import type { CostBreakdown, PlatformResult } from '../types';

interface ResultsSectionProps {
  costs: CostBreakdown;
  shopee: PlatformResult;
  mercadoLivre: PlatformResult;
  tikTokShop: PlatformResult;
  isValid: boolean;
}

const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

const formatPercent = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

const PlatformResultCard: React.FC<{ result: PlatformResult; color: string }> = ({
  result,
  color,
}) => {
  const bd = result.taxBreakdownAtTarget;

  return (
    <div className={`platform-result ${color}`}>
      <h4>{result.platformName}</h4>
      
      <div className="result-row highlight">
        <span className="label">💰 Preço Mínimo (break-even)</span>
        <span className="value">{formatCurrency(result.breakEvenPrice)}</span>
      </div>
      
      <div className="result-row target">
        <span className="label">🎯 Preço Alvo</span>
        <span className="value">{formatCurrency(result.targetPrice)}</span>
      </div>
      
      <div className="result-row range">
        <span className="label">📢 Faixa de Anúncio</span>
        <span className="value range-value">
          {formatCurrency(result.rangeMin)} — {formatCurrency(result.rangeMax)}
        </span>
      </div>
      
      <div className="divider" />

      {/* Breakdown de taxas no preço alvo */}
      <div className="result-row sub">
        <span className="label">Comissão % ({formatPercent(bd.percentualTotal)})</span>
        <span className="value">
          {formatCurrency(bd.commissionValue)}
          {bd.commissionCapped && <span className="badge">teto</span>}
        </span>
      </div>
      {bd.fixedFeeTotal > 0 && (
        <div className="result-row sub">
          <span className="label">Taxa fixa</span>
          <span className="value">{formatCurrency(bd.fixedFeeTotal)}</span>
        </div>
      )}
      {result.impostoBreakdownAtTarget.impostoValor > 0 && (
        <div className="result-row sub">
          <span className="label">
            Imposto s/ faturamento ({result.impostoBreakdownAtTarget.impostoPercentEfetivo.toFixed(2)}%)
          </span>
          <span className="value">{formatCurrency(result.impostoBreakdownAtTarget.impostoValor)}</span>
        </div>
      )}
      {result.adsBreakdownAtTarget.adsValor > 0 && (
        <div className="result-row sub">
          <span className="label">
            {result.platformName === 'Shopee'
              ? 'Shopee Ads'
              : result.platformName === 'Mercado Livre'
              ? 'Mercado Ads'
              : 'TikTok Ads'}{' '}
            ({result.adsBreakdownAtTarget.adsPercentEfetivo.toFixed(2)}%)
          </span>
          <span className="value">{formatCurrency(result.adsBreakdownAtTarget.adsValor)}</span>
        </div>
      )}
      <div className="result-row">
        <span className="label">Taxas marketplace (R$)</span>
        <span className="value">{formatCurrency(bd.total)}</span>
      </div>
      {(result.impostoBreakdownAtTarget.impostoValor > 0 || result.adsBreakdownAtTarget.adsValor > 0) && (
        <div className="result-row">
          <span className="label"><strong>Total deduções</strong></span>
          <span className="value">{formatCurrency(result.taxesAtTarget)}</span>
        </div>
      )}

      <div className="result-row">
        <span className="label">Lucro no preço alvo</span>
        <span className="value profit">{formatCurrency(result.profitAtTarget)}</span>
      </div>
      
      <div className="result-row">
        <span className="label">Margem real</span>
        <span className="value">{formatPercent(result.actualMarginAtTarget)}</span>
      </div>
      
      <div className="divider" />
      
      <div className="result-row">
        <span className="label">Lucro no topo da faixa</span>
        <span className="value profit">{formatCurrency(result.profitAtRangeMax)}</span>
      </div>
    </div>
  );
};

export const ResultsSection: React.FC<ResultsSectionProps> = ({
  costs,
  shopee,
  mercadoLivre,
  tikTokShop,
  isValid,
}) => {
  if (!isValid) {
    return (
      <div className="card results-card">
        <h2>📊 Resultados</h2>
        <div className="warning-box">
          ⚠️ Preencha o tempo de impressão e as gramas de filamento para calcular.
        </div>
      </div>
    );
  }

  return (
    <div className="card results-card">
      <h2>📊 Resultados</h2>
      
      {/* Breakdown de Custos */}
      <div className="costs-breakdown">
        <h3>Breakdown de Custos</h3>
        
        <div className="cost-grid">
          <div className="cost-item">
            <span className="cost-label">🧵 Filamento</span>
            <span className="cost-detail">{costs.filamentTotalGrams.toFixed(1)}g</span>
            <span className="cost-value">{formatCurrency(costs.filamentCost)}</span>
          </div>
          
          <div className="cost-item">
            <span className="cost-label">⚡ Energia</span>
            <span className="cost-detail">{costs.energyKwh.toFixed(3)} kWh</span>
            <span className="cost-value">{formatCurrency(costs.energyCost)}</span>
          </div>
          
          <div className="cost-item">
            <span className="cost-label">👷 Mão de obra</span>
            <span className="cost-detail"></span>
            <span className="cost-value">{formatCurrency(costs.laborCost)}</span>
          </div>
          
          <div className="cost-item">
            <span className="cost-label">📦 Embalagem</span>
            <span className="cost-detail"></span>
            <span className="cost-value">{formatCurrency(costs.packagingCost)}</span>
          </div>
          
          <div className="cost-item">
            <span className="cost-label">🔧 Depreciação</span>
            <span className="cost-detail"></span>
            <span className="cost-value">{formatCurrency(costs.depreciationCost)}</span>
          </div>
          
          <div className="cost-item">
            <span className="cost-label">📎 Outros</span>
            <span className="cost-detail"></span>
            <span className="cost-value">{formatCurrency(costs.otherCosts)}</span>
          </div>
        </div>
        
        <div className="cost-total">
          <span className="cost-label">💵 CUSTO TOTAL (COGS)</span>
          <span className="cost-value">{formatCurrency(costs.cogs)}</span>
        </div>
      </div>
      
      {/* Comparativo de Plataformas */}
      <div className="platforms-comparison">
        <h3>Comparativo Shopee × Mercado Livre × TikTok Shop</h3>
        
        <div className="platforms-grid">
          <PlatformResultCard result={shopee} color="orange" />
          <PlatformResultCard result={mercadoLivre} color="blue" />
          <PlatformResultCard result={tikTokShop} color="tiktok" />
        </div>
      </div>
    </div>
  );
};
