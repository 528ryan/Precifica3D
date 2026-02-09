import { useState } from 'react';
import type { SavedProduct, AllSettings } from '../types';

interface Props {
  products: SavedProduct[];
  currentSettings: AllSettings;
  currentCogs: number;
  onSaveProduct: (name: string, settings: AllSettings, cogs: number) => SavedProduct;
  onDeleteProduct: (id: string) => void;
  onLoadProduct: (product: SavedProduct) => void;
}

export function ProductPresetsSection({
  products,
  currentSettings,
  currentCogs,
  onSaveProduct,
  onDeleteProduct,
  onLoadProduct,
}: Props) {
  const [newName, setNewName] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);

  const handleSave = () => {
    if (newName.trim() && currentCogs > 0) {
      onSaveProduct(newName.trim(), currentSettings, currentCogs);
      setNewName('');
      setShowSaveForm(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    });
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <section className="card">
      <h2>📦 Produtos Salvos</h2>

      {/* Botão para salvar produto atual */}
      {!showSaveForm ? (
        <button
          className="btn btn-primary full-width"
          onClick={() => setShowSaveForm(true)}
          disabled={currentCogs <= 0}
        >
          💾 Salvar Produto Atual
        </button>
      ) : (
        <div className="save-product-form">
          <div className="form-group">
            <label>Nome do Produto</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ex: Vaso Geométrico M"
              autoFocus
            />
          </div>
          <div className="form-row">
            <button className="btn btn-primary" onClick={handleSave}>
              ✓ Salvar
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setShowSaveForm(false);
                setNewName('');
              }}
            >
              ✕ Cancelar
            </button>
          </div>
          <p className="cost-preview">
            Custo atual: <strong>{formatCurrency(currentCogs)}</strong>
          </p>
        </div>
      )}

      {/* Lista de produtos salvos */}
      {products.length > 0 && (
        <div className="products-list">
          <h3>Produtos Salvos ({products.length})</h3>
          {products.map((product) => (
            <div key={product.id} className="product-item">
              <div className="product-info">
                <span className="product-name">{product.name}</span>
                <span className="product-details">
                  {formatCurrency(product.cogs)} • {formatDate(product.createdAt)}
                </span>
              </div>
              <div className="product-actions">
                <button
                  className="btn btn-small btn-primary"
                  onClick={() => onLoadProduct(product)}
                  title="Carregar configurações"
                >
                  📥
                </button>
                <button
                  className="btn btn-small btn-danger"
                  onClick={() => onDeleteProduct(product.id)}
                  title="Excluir produto"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {products.length === 0 && !showSaveForm && (
        <p className="empty-message">
          Nenhum produto salvo. Configure um produto e clique em salvar.
        </p>
      )}
    </section>
  );
}
