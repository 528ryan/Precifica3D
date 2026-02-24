import type { Marketplace, AdsConfig } from '../types';

/**
 * Calcula o custo de anúncio (Ads) para um determinado marketplace e preço.
 *
 * Regras:
 * - Seleciona a config conforme o marketplace.
 * - Se !enabled => 0
 * - Switch model:
 *   - percent_sales => preco * (percentSales / 100)
 *   - per_order     => splitPerItem ? perOrder / max(itensNoPedido, 1) : perOrder
 *   - per_item      => perItem
 * - Retorna 0 para NaN / valores negativos.
 */
export function adsValor(
  preco: number,
  marketplace: Marketplace,
  itensNoPedido: number,
  adsShopee: AdsConfig,
  adsMercado: AdsConfig,
  adsTikTok: AdsConfig
): number {
  const config: AdsConfig =
    marketplace === 'shopee'
      ? adsShopee
      : marketplace === 'mercado_livre'
      ? adsMercado
      : adsTikTok;

  if (!config.enabled) return 0;

  let valor: number;

  switch (config.model) {
    case 'percent_sales':
      valor = preco * (config.percentSales / 100);
      break;
    case 'per_order': {
      const itens = Math.max(itensNoPedido, 1);
      valor = config.splitPerItem ? config.perOrder / itens : config.perOrder;
      break;
    }
    case 'per_item':
      valor = config.perItem;
      break;
    default:
      valor = 0;
  }

  if (isNaN(valor) || valor < 0) return 0;
  return valor;
}

/**
 * Percentual efetivo do anúncio em relação ao preço.
 */
export function adsPercentEfetivo(
  preco: number,
  marketplace: Marketplace,
  itensNoPedido: number,
  adsShopee: AdsConfig,
  adsMercado: AdsConfig,
  adsTikTok: AdsConfig
): number {
  if (preco <= 0) return 0;
  const valor = adsValor(preco, marketplace, itensNoPedido, adsShopee, adsMercado, adsTikTok);
  return (valor / preco) * 100;
}

/** Configuração de anúncios vazia (todos os campos no default OFF / zero). */
export const defaultAdsConfig: AdsConfig = {
  enabled: false,
  model: 'percent_sales',
  percentSales: 0,
  perOrder: 0,
  perItem: 0,
  splitPerItem: true,
};
