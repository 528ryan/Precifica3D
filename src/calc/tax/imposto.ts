/**
 * M�dulo de Imposto sobre Faturamento (Revenue Tax)
 *
 * O imposto incide sobre o PRE�O DE VENDA (receita bruta), n�o sobre o lucro.
 * Funciona como mais uma dedu��o do faturamento, an�loga �s comiss�es de marketplace.
 *
 * Regimes suportados:
 *   'isento'     0% (CPF informal, isento)
 *   'mei'        DAS mensal fixo rateado por unidades ou por faturamento
 *   'simples'    al�quota percentual (Simples Nacional)
 *   'presumido'  al�quota percentual (Lucro Presumido)
 *   'custom'     al�quota percentual livre
 */

import type { ImpostoSettings } from '../../types';

/**
 * Calcula o valor do imposto por item para um dado pre�o de venda.
 *
 * F�rmulas:
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
      // Rateio por unidade: custo fixo por item, independente do pre�o
      const vendasMes = Math.max(1, config.meiVendasMes);
      return config.meiDasMensal / vendasMes;
    }

    default:
      return 0;
  }
}

/**
 * Retorna o percentual efetivo do imposto em rela��o ao pre�o de venda.
 * Para MEI rateio por unidade, o percentual varia com o pre�o.
 */
export function impostoPercentEfetivo(preco: number, config: ImpostoSettings): number {
  if (!config.ativo || preco <= 0) return 0;
  return (impostoValor(preco, config) / preco) * 100;
}
