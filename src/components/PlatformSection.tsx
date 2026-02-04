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
  const handleShopeeAccountChange = (accountType: 'padrao' | 'volume') => {
    const fixedFee = accountType === 'padrao' 
      ? defaultShopeeSettings.fixedFeePadrao 
      : defaultShopeeSettings.fixedFeeVolume;
    onUpdateShopee({ accountType, fixedFee });
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
        <h3>🟠 Shopee</h3>
        
        <div className="form-group">
          <label>Tipo de Conta</label>
          <div className="toggle-buttons">
            <button
              type="button"
              className={settings.shopee.accountType === 'padrao' ? 'active' : ''}
              onClick={() => handleShopeeAccountChange('padrao')}
            >
              Padrão
            </button>
            <button
              type="button"
              className={settings.shopee.accountType === 'volume' ? 'active' : ''}
              onClick={() => handleShopeeAccountChange('volume')}
            >
              Volume
            </button>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="shopeeCommission">
              Comissão (%)
              <span className="tooltip" title="Percentual de comissão da Shopee">ⓘ</span>
            </label>
            <input
              id="shopeeCommission"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={settings.shopee.commissionPercent}
              onChange={(e) => onUpdateShopee({ commissionPercent: Math.max(0, Number(e.target.value)) })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="shopeeFixedFee">
              Taxa Fixa (R$)
              <span className="tooltip" title="Taxa fixa por item">ⓘ</span>
            </label>
            <input
              id="shopeeFixedFee"
              type="number"
              min="0"
              step="0.01"
              value={settings.shopee.fixedFee}
              onChange={(e) => onUpdateShopee({ fixedFee: Math.max(0, Number(e.target.value)) })}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="shopeeCap">
            Teto Comissão (R$)
            <span className="tooltip" title="Valor máximo de comissão">ⓘ</span>
          </label>
          <input
            id="shopeeCap"
            type="number"
            min="0"
            step="1"
            value={settings.shopee.commissionCap}
            onChange={(e) => onUpdateShopee({ commissionCap: Math.max(0, Number(e.target.value)) })}
          />
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={settings.shopee.useFreightProgram}
              onChange={(e) => onUpdateShopee({ useFreightProgram: e.target.checked })}
            />
            <span>Programa Frete Grátis (+{settings.shopee.freightProgramExtraPercent}%)</span>
            <span className="tooltip" title="Adiciona taxa extra para programa de frete grátis">ⓘ</span>
          </label>
        </div>

        {settings.shopee.useFreightProgram && (
          <div className="form-group">
            <label htmlFor="shopeeFreightExtra">
              Extra Frete Grátis (%)
            </label>
            <input
              id="shopeeFreightExtra"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={settings.shopee.freightProgramExtraPercent}
              onChange={(e) => onUpdateShopee({ freightProgramExtraPercent: Math.max(0, Number(e.target.value)) })}
            />
          </div>
        )}
      </div>

      {/* Mercado Livre */}
      <div className="subsection platform-ml">
        <h3>🔵 Mercado Livre</h3>
        
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
