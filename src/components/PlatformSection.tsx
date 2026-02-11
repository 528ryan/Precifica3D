import React from 'react';
import type { AllSettings } from '../types';
import { defaultShopeeSettings, defaultMercadoLivreSettings } from '../presets';

interface PlatformSectionProps {
  settings: AllSettings['platform'];
  onUpdate: (updates: Partial<AllSettings['platform']>) => void;
  onUpdateShopee: (updates: Partial<AllSettings['platform']['shopee']>) => void;
  onUpdateMercadoLivre: (updates: Partial<AllSettings['platform']['mercadoLivre']>) => void;
}

export const PlatformSection: React.FC<PlatformSectionProps> = ({
  settings,
  onUpdate,
  onUpdateShopee,
  onUpdateMercadoLivre,
}) => {
  const handleSellerTypeChange = (sellerType: 'cpf_low_volume' | 'cnpj') => {
    const fixedFeePerItem = sellerType === 'cpf_low_volume' ? 7 : 4;
    onUpdateShopee({ sellerType, fixedFeePerItem });
  };

  const handleMLAdTypeChange = (adType: 'classico' | 'premium') => {
    const commissionPercent = adType === 'classico'
      ? defaultMercadoLivreSettings.commissionClassico
      : defaultMercadoLivreSettings.commissionPremium;
    onUpdateMercadoLivre({ adType, commissionPercent });
  };

  return (
    <div className="card">
      <h2>🛒 Plataformas</h2>

      <div className="form-group">
        <label htmlFor="itemQuantity">
          Quantidade de Itens
          <span className="tooltip" title="Número de itens por pedido">ⓘ</span>
        </label>
        <input
          id="itemQuantity"
          type="number"
          min="1"
          value={settings.itemQuantity}
          onChange={(e) => onUpdate({ itemQuantity: Math.max(1, Number(e.target.value)) })}
        />
      </div>
      
      {/* Shopee */}
      <div className="subsection platform-shopee">
        <h3>🟠 Shopee (Fevereiro 2026)</h3>
        
        <div className="info-box">
          ⚠️ Estrutura real: Comissão 12% base + 2% transação + 6% frete (opcional). Taxa fixa R$4-7 por item. Teto de comissão: R$100,00.
        </div>
        
        <div className="form-group">
          <label>Tipo de Vendedor</label>
          <div className="toggle-buttons">
            <button
              type="button"
              className={settings.shopee.sellerType === 'cnpj' ? 'active' : ''}
              onClick={() => handleSellerTypeChange('cnpj')}
            >
              CNPJ (R$4)
            </button>
            <button
              type="button"
              className={settings.shopee.sellerType === 'cpf_low_volume' ? 'active' : ''}
              onClick={() => handleSellerTypeChange('cpf_low_volume')}
            >
              CPF Baixo Vol (R$7)
            </button>
          </div>
        </div>

        <div className="shopee-breakdown">
          <strong>Componentes da Comissão:</strong>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="shopeeCommBase">
                Comissão Base (%)
                <span className="tooltip" title="12% padrão">ⓘ</span>
              </label>
              <input
                id="shopeeCommBase"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={settings.shopee.commissionBasePercent}
                onChange={(e) => onUpdateShopee({ commissionBasePercent: Math.max(0, Number(e.target.value)) })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="shopeeTransTax">
                Taxa Transação (%)
                <span className="tooltip" title="2% padrão para pagamento">ⓘ</span>
              </label>
              <input
                id="shopeeTransTax"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={settings.shopee.transactionTaxPercent}
                onChange={(e) => onUpdateShopee({ transactionTaxPercent: Math.max(0, Number(e.target.value)) })}
              />
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label htmlFor="shopeeFreight">
              <input
                id="shopeeFreight"
                type="checkbox"
                checked={settings.shopee.useFreightProgram}
                onChange={(e) => onUpdateShopee({ useFreightProgram: e.target.checked })}
              />
              Programa Frete Grátis (+{settings.shopee.freightProgramPercent}%)
            </label>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="shopeeFixedFee">
            Taxa Fixa por Item (R$)
            <span className="tooltip" title="R$4 CNPJ, R$7 CPF baixo volume">ⓘ</span>
          </label>
          <input
            id="shopeeFixedFee"
            type="number"
            min="0"
            step="0.01"
            value={settings.shopee.fixedFeePerItem}
            onChange={(e) => onUpdateShopee({ fixedFeePerItem: Math.max(0, Number(e.target.value)) })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="shopeeCap">
            Teto Comissão % (R$)
            <span className="tooltip" title="Máximo da parte percentual (R$100)">ⓘ</span>
          </label>
          <input
            id="shopeeCap"
            type="number"
            min="0"
            step="1"
            value={settings.shopee.commissionPercentCap}
            onChange={(e) => onUpdateShopee({ commissionPercentCap: Math.max(0, Number(e.target.value)) })}
          />
        </div>
      </div>

      {/* Mercado Livre */}
      <div className="subsection platform-ml">
        <h3>🔵 Mercado Livre (Março 2026)</h3>
        
        <div className="info-box">
          ⚠️ Nova política: custo operacional baseado em peso/dimensões para produtos &lt; R$79.
        </div>
        
        <div className="form-group">
          <label>Tipo de Anúncio</label>
          <div className="toggle-buttons">
            <button
              type="button"
              className={settings.mercadoLivre.adType === 'classico' ? 'active' : ''}
              onClick={() => handleMLAdTypeChange('classico')}
            >
              Clássico
            </button>
            <button
              type="button"
              className={settings.mercadoLivre.adType === 'premium' ? 'active' : ''}
              onClick={() => handleMLAdTypeChange('premium')}
            >
              Premium
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="mlCommission">
            Comissão (%)
            <span className="tooltip" title="Percentual de comissão do ML">ⓘ</span>
          </label>
          <input
            id="mlCommission"
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={settings.mercadoLivre.commissionPercent}
            onChange={(e) => onUpdateMercadoLivre({ commissionPercent: Math.max(0, Number(e.target.value)) })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="mlThreshold">
            Limite de Preço (R$)
            <span className="tooltip" title="Abaixo deste valor, aplica taxa fixa extra">ⓘ</span>
          </label>
          <input
            id="mlThreshold"
            type="number"
            min="0"
            step="1"
            value={settings.mercadoLivre.priceThreshold}
            onChange={(e) => onUpdateMercadoLivre({ priceThreshold: Math.max(0, Number(e.target.value)) })}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="mlFeeBelow">
              Taxa ≤ {settings.mercadoLivre.priceThreshold} (R$)
              <span className="tooltip" title="Taxa fixa para preços até o limite">ⓘ</span>
            </label>
            <input
              id="mlFeeBelow"
              type="number"
              min="0"
              step="0.01"
              value={settings.mercadoLivre.fixedFeeBelowThreshold}
              onChange={(e) => onUpdateMercadoLivre({ fixedFeeBelowThreshold: Math.max(0, Number(e.target.value)) })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="mlFeeAbove">
              Taxa &gt; {settings.mercadoLivre.priceThreshold} (R$)
              <span className="tooltip" title="Taxa fixa para preços acima do limite">ⓘ</span>
            </label>
            <input
              id="mlFeeAbove"
              type="number"
              min="0"
              step="0.01"
              value={settings.mercadoLivre.fixedFeeAboveThreshold}
              onChange={(e) => onUpdateMercadoLivre({ fixedFeeAboveThreshold: Math.max(0, Number(e.target.value)) })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
