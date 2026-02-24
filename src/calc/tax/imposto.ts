/**
 * Módulo de Imposto sobre Faturamento (Revenue Tax)
 *
 * O imposto incide sobre o PREÇO DE VENDA (receita bruta), não sobre o lucro.
 * Funciona como mais uma dedução do faturamento, análoga às comissões de marketplace.
 *
 * Regimes suportados:
 *   'isento'     0% (CPF informal, isento)
 *   'mei'        DAS mensal fixo rateado por unidades ou por faturamento
 *   'simples'    alíquota percentual (Simples Nacional)
 *   'presumido'  alíquota percentual (Lucro Presumido)
 *   'custom'     alíquota percentual livre
 */

import type { ImpostoSettings } from '../../types';

/**
 * Calcula o valor do imposto por item para um dado preço de venda.
 *
 * Fórmulas:
 *  - Isento:  0
 *  - Percentual (simples/presumido/custom): preco * (percentual/100)
 *  - MEI rateio por faturamento: preco * (DAS_mensal / faturamento_mes)
 *    (fallback para rateio por unidade se meiFaturamentoMes <= 0)
 *  - MEI rateio por unidade: DAS_mensal / max(1, vendas_mes)
 */
export function impostoValor(preco: number, config: ImpostoSettings): number {
  if (!config.ativo) return 0;

  switch (config.regime) {
    case 'isento':
      return 0;

    case 'simples':
    case 'presumido':
    case 'custom':
      return preco * (config.percentual / 100);

    case 'mei': {
      if (config.meiRatearPorFaturamento && config.meiFaturamentoMes > 0) {
        const pct = config.meiDasMensal / config.meiFaturamentoMes;
        return preco * pct;
      }
      // Rateio por unidade: custo fixo por item, independente do preço
      const vendasMes = Math.max(1, config.meiVendasMes);
      return config.meiDasMensal / vendasMes;
    }

    default:
      return 0;
  }
}

/**
 * Retorna o percentual efetivo do imposto em relação ao preço de venda.
 * Para MEI rateio por unidade, o percentual varia com o preço.
 */
export function impostoPercentEfetivo(preco: number, config: ImpostoSettings): number {
  if (!config.ativo || preco <= 0) return 0;
  return (impostoValor(preco, config) / preco) * 100;
}
