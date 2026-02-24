import React from 'react';
import type { AdsConfig, AdsModel, AllSettings } from '../types';

interface AdsPlatformCardProps {
  label: string;
  settings: AdsConfig;
  onUpdate: (updates: Partial<AdsConfig>) => void;
}

const ADS_MODEL_LABELS: Record<AdsModel, string> = {
  percent_sales: '% das Vendas',
  per_order: 'Custo por Pedido (R$)',
  per_item: 'Custo por Item (R$)',
};

const AdsPlatformCard: React.FC<AdsPlatformCardProps> = ({ label, settings, onUpdate }) => {
  return (
    <div className="ads-platform-card" style={{ border: '1px solid #e0e0e0', borderRadius: 8, padding: 16, marginBottom: 12 }}>
      {/* Toggle */}
      <div className="form-group checkbox-group">
        <label style={{ fontWeight: 600, fontSize: 15 }}>
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => onUpdate({ enabled: e.target.checked })}
            style={{ marginRight: 8 }}
          />
          Ativar {label}
        </label>
      </div>

      {settings.enabled && (
        <>
          {/* Modelo de custo */}
          <div className="form-group">
            <label htmlFor={`${label}-model`}>
              Modelo de cobrança
              <span
                className="tooltip"
                title="Escolha como o custo do anúncio é calculado"
              >
                ⓘ
              </span>
            </label>
            <select
              id={`${label}-model`}
              value={settings.model}
              onChange={(e) => onUpdate({ model: e.target.value as AdsModel })}
            >
              {(Object.entries(ADS_MODEL_LABELS) as [AdsModel, string][]).map(([key, lbl]) => (
                <option key={key} value={key}>
                  {lbl}
                </option>
              ))}
            </select>
          </div>

          {/* Inputs por modelo */}
          {settings.model === 'percent_sales' && (
            <div className="form-group">
              <label htmlFor={`${label}-percent`}>
                % das Vendas
                <span className="tooltip" title="Percentual do preço de venda destinado ao anúncio">
                  ⓘ
                </span>
              </label>
              <input
                id={`${label}-percent`}
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={settings.percentSales}
                onChange={(e) =>
                  onUpdate({ percentSales: Math.max(0, Number(e.target.value)) })
                }
              />
            </div>
          )}

          {settings.model === 'per_order' && (
            <>
              <div className="form-group">
                <label htmlFor={`${label}-per-order`}>
                  Custo por Pedido (R$)
                  <span className="tooltip" title="Valor fixo gasto em anúncio por pedido">
                    ⓘ
                  </span>
                </label>
                <input
                  id={`${label}-per-order`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={settings.perOrder}
                  onChange={(e) =>
                    onUpdate({ perOrder: Math.max(0, Number(e.target.value)) })
                  }
                />
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.splitPerItem}
                    onChange={(e) => onUpdate({ splitPerItem: e.target.checked })}
                    style={{ marginRight: 8 }}
                  />
                  Ratear por item
                  <span
                    className="tooltip"
                    title="Divide o custo do pedido pela quantidade de itens (reutiliza 'Qtd. de Itens' da seção de plataformas)"
                  >
                    ⓘ
                  </span>
                </label>
              </div>
            </>
          )}

          {settings.model === 'per_item' && (
            <div className="form-group">
              <label htmlFor={`${label}-per-item`}>
                Custo por Item (R$)
                <span className="tooltip" title="Valor fixo gasto em anúncio por item vendido">
                  ⓘ
                </span>
              </label>
              <input
                id={`${label}-per-item`}
                type="number"
                min="0"
                step="0.01"
                value={settings.perItem}
                onChange={(e) =>
                  onUpdate({ perItem: Math.max(0, Number(e.target.value)) })
                }
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

interface AdsSectionProps {
  adsShopee: AllSettings['adsShopee'];
  adsMercado: AllSettings['adsMercado'];
  adsTikTok: AllSettings['adsTikTok'];
  onUpdateAdsShopee: (updates: Partial<AllSettings['adsShopee']>) => void;
  onUpdateAdsMercado: (updates: Partial<AllSettings['adsMercado']>) => void;
  onUpdateAdsTikTok: (updates: Partial<AllSettings['adsTikTok']>) => void;
}

export const AdsSection: React.FC<AdsSectionProps> = ({
  adsShopee,
  adsMercado,
  adsTikTok,
  onUpdateAdsShopee,
  onUpdateAdsMercado,
  onUpdateAdsTikTok,
}) => {
  return (
    <div className="card">
      <h2>📣 Anúncios</h2>

      <div className="info-box">
        ℹ️ O custo de anúncios é descontado do lucro <strong>por plataforma</strong>, afetando
        break-even, preço alvo e faixa de anúncio. Cada canal cobra de forma independente.
      </div>

      <AdsPlatformCard
        label="Shopee Ads"
        settings={adsShopee}
        onUpdate={onUpdateAdsShopee}
      />

      <AdsPlatformCard
        label="Mercado Ads"
        settings={adsMercado}
        onUpdate={onUpdateAdsMercado}
      />

      <AdsPlatformCard
        label="TikTok Ads"
        settings={adsTikTok}
        onUpdate={onUpdateAdsTikTok}
      />
    </div>
  );
};
