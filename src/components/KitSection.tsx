import { useState, useMemo } from 'react';
import type { SavedProduct, Kit, PlatformSettings, PricingGoals } from '../types';
import {
  calculateShopeeTaxes,
  calculateMercadoLivreTaxes,
  findBreakEvenPrice,
  findTargetPrice,
  applyPsychologicalRounding,
} from '../calc';

interface Props {
  products: SavedProduct[];
  kits: Kit[];
  onSaveKit: (name: string, items: { productId: string; quantity: number }[]) => Kit;
  onDeleteKit: (id: string) => void;
  platformSettings: PlatformSettings;
  pricingGoals: PricingGoals;
}

export function KitSection({
  products,
  kits,
  onSaveKit,
  onDeleteKit,
  platformSettings,
  pricingGoals,
}: Props) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [kitName, setKitName] = useState('');
  const [selectedItems, setSelectedItems] = useState<{ productId: string; quantity: number }[]>([]);
  const [expandedKit, setExpandedKit] = useState<string | null>(null);

  const handleAddItem = (productId: string) => {
    const existing = selectedItems.find((item) => item.productId === productId);
    if (existing) {
      setSelectedItems(
        selectedItems.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setSelectedItems([...selectedItems, { productId, quantity: 1 }]);
    }
  };

  const handleRemoveItem = (productId: string) => {
    const existing = selectedItems.find((item) => item.productId === productId);
    if (existing && existing.quantity > 1) {
      setSelectedItems(
        selectedItems.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      );
    } else {
      setSelectedItems(selectedItems.filter((item) => item.productId !== productId));
    }
  };

  const handleSaveKit = () => {
    if (kitName.trim() && selectedItems.length > 0) {
      onSaveKit(kitName.trim(), selectedItems);
      setKitName('');
      setSelectedItems([]);
      setShowCreateForm(false);
    }
  };

  const calculateKitCogs = (items: { productId: string; quantity: number }[]): number => {
    return items.reduce((total, item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return total;
      return total + product.cogs * item.quantity;
    }, 0);
  };

  const kitCogs = useMemo(() => calculateKitCogs(selectedItems), [selectedItems, products]);

  const calculateKitPricing = (cogs: number) => {
    const { shopee, mercadoLivre, itemQuantity } = platformSettings;
    const { targetMarginPercent, rangePaddingPercent, rounding } = pricingGoals;

    // Shopee
    const shopeeBreakEven = findBreakEvenPrice(
      cogs,
      (price) =>
        calculateShopeeTaxes(
          price,
          shopee.commissionPercent,
          shopee.fixedFee,
          shopee.commissionCap,
          shopee.useFreightProgram,
          shopee.freightProgramExtraPercent,
          itemQuantity
        )
    );

    const shopeeTarget = findTargetPrice(
      cogs,
      targetMarginPercent,
      (price) =>
        calculateShopeeTaxes(
          price,
          shopee.commissionPercent,
          shopee.fixedFee,
          shopee.commissionCap,
          shopee.useFreightProgram,
          shopee.freightProgramExtraPercent,
          itemQuantity
        )
    );

    // Mercado Livre
    const mlBreakEven = findBreakEvenPrice(
      cogs,
      (price) =>
        calculateMercadoLivreTaxes(
          price,
          mercadoLivre.commissionPercent,
          mercadoLivre.priceThreshold,
          mercadoLivre.fixedFeeBelowThreshold,
          mercadoLivre.fixedFeeAboveThreshold,
          itemQuantity
        )
    );

    const mlTarget = findTargetPrice(
      cogs,
      targetMarginPercent,
      (price) =>
        calculateMercadoLivreTaxes(
          price,
          mercadoLivre.commissionPercent,
          mercadoLivre.priceThreshold,
          mercadoLivre.fixedFeeBelowThreshold,
          mercadoLivre.fixedFeeAboveThreshold,
          itemQuantity
        )
    );

    return {
      shopee: {
        breakEven: shopeeBreakEven,
        target: applyPsychologicalRounding(shopeeTarget, rounding),
        rangeMin: applyPsychologicalRounding(shopeeTarget * (1 - rangePaddingPercent / 100), rounding),
        rangeMax: applyPsychologicalRounding(shopeeTarget * (1 + rangePaddingPercent / 100), rounding),
      },
      mercadoLivre: {
        breakEven: mlBreakEven,
        target: applyPsychologicalRounding(mlTarget, rounding),
        rangeMin: applyPsychologicalRounding(mlTarget * (1 - rangePaddingPercent / 100), rounding),
        rangeMax: applyPsychologicalRounding(mlTarget * (1 + rangePaddingPercent / 100), rounding),
      },
    };
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (products.length === 0) {
    return (
      <section className="card">
        <h2>🎁 Kits</h2>
        <p className="empty-message">
          Salve alguns produtos primeiro para criar kits.
        </p>
      </section>
    );
  }

  return (
    <section className="card">
      <h2>🎁 Kits</h2>

      {!showCreateForm ? (
        <button
          className="btn btn-primary full-width"
          onClick={() => setShowCreateForm(true)}
        >
          ➕ Criar Novo Kit
        </button>
      ) : (
        <div className="kit-form">
          <div className="form-group">
            <label>Nome do Kit</label>
            <input
              type="text"
              value={kitName}
              onChange={(e) => setKitName(e.target.value)}
              placeholder="Ex: Kit Decoração Sala"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Adicionar Produtos</label>
            <div className="product-selector">
              {products.map((product) => {
                const selected = selectedItems.find((i) => i.productId === product.id);
                return (
                  <div key={product.id} className="selectable-product">
                    <span className="product-name">{product.name}</span>
                    <span className="product-cost">{formatCurrency(product.cogs)}</span>
                    <div className="quantity-controls">
                      <button
                        className="btn btn-small"
                        onClick={() => handleRemoveItem(product.id)}
                        disabled={!selected}
                      >
                        −
                      </button>
                      <span className="quantity">{selected?.quantity || 0}</span>
                      <button
                        className="btn btn-small"
                        onClick={() => handleAddItem(product.id)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedItems.length > 0 && (
            <div className="kit-summary">
              <p>
                <strong>Custo Total do Kit:</strong> {formatCurrency(kitCogs)}
              </p>
              <p className="kit-items-count">
                {selectedItems.reduce((sum, i) => sum + i.quantity, 0)} itens selecionados
              </p>
            </div>
          )}

          <div className="form-row">
            <button
              className="btn btn-primary"
              onClick={handleSaveKit}
              disabled={!kitName.trim() || selectedItems.length === 0}
            >
              ✓ Salvar Kit
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setShowCreateForm(false);
                setKitName('');
                setSelectedItems([]);
              }}
            >
              ✕ Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de kits salvos */}
      {kits.length > 0 && (
        <div className="kits-list">
          <h3>Kits Salvos ({kits.length})</h3>
          {kits.map((kit) => {
            const cogs = calculateKitCogs(kit.items);
            const pricing = calculateKitPricing(cogs);
            const isExpanded = expandedKit === kit.id;

            return (
              <div key={kit.id} className="kit-item">
                <div
                  className="kit-header"
                  onClick={() => setExpandedKit(isExpanded ? null : kit.id)}
                >
                  <div className="kit-info">
                    <span className="kit-name">{kit.name}</span>
                    <span className="kit-details">
                      {kit.items.reduce((sum, i) => sum + i.quantity, 0)} itens •{' '}
                      {formatCurrency(cogs)}
                    </span>
                  </div>
                  <div className="kit-actions">
                    <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
                    <button
                      className="btn btn-small btn-danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteKit(kit.id);
                      }}
                      title="Excluir kit"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="kit-expanded">
                    <div className="kit-products">
                      <strong>Produtos:</strong>
                      <ul>
                        {kit.items.map((item) => {
                          const product = products.find((p) => p.id === item.productId);
                          return (
                            <li key={item.productId}>
                              {item.quantity}x {product?.name || 'Produto removido'}{' '}
                              {product && (
                                <span className="item-cost">
                                  ({formatCurrency(product.cogs * item.quantity)})
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    <div className="kit-pricing">
                      <div className="platform-pricing shopee">
                        <strong>🛒 Shopee</strong>
                        <p>Break-even: {formatCurrency(pricing.shopee.breakEven)}</p>
                        <p>Preço sugerido: {formatCurrency(pricing.shopee.target)}</p>
                        <p className="range">
                          Faixa: {formatCurrency(pricing.shopee.rangeMin)} -{' '}
                          {formatCurrency(pricing.shopee.rangeMax)}
                        </p>
                      </div>
                      <div className="platform-pricing ml">
                        <strong>🏪 Mercado Livre</strong>
                        <p>Break-even: {formatCurrency(pricing.mercadoLivre.breakEven)}</p>
                        <p>Preço sugerido: {formatCurrency(pricing.mercadoLivre.target)}</p>
                        <p className="range">
                          Faixa: {formatCurrency(pricing.mercadoLivre.rangeMin)} -{' '}
                          {formatCurrency(pricing.mercadoLivre.rangeMax)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
