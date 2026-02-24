import { describe, it, expect } from 'vitest';
import { impostoValor, impostoPercentEfetivo } from '../../calc/tax/imposto';
import type { ImpostoSettings } from '../../types';
import {
  calculateTikTokShopTaxes,
  findTargetPrice,
} from '../../calc';

// ── Helpers de fixture ──────────────────────────────────────────
function makeSettings(overrides: Partial<ImpostoSettings> = {}): ImpostoSettings {
  return {
    ativo: true,
    regime: 'isento',
    percentual: 0,
    meiDasMensal: 75.90,
    meiVendasMes: 100,
    meiRatearPorFaturamento: false,
    meiFaturamentoMes: 0,
    ...overrides,
  };
}

// ================================================================
// 1) impostoValor — regimes percentuais
// ================================================================
describe('impostoValor — regimes percentuais', () => {
  it('isento: sempre 0', () => {
    const cfg = makeSettings({ regime: 'isento' });
    expect(impostoValor(100, cfg)).toBe(0);
    expect(impostoValor(0, cfg)).toBe(0);
  });

  it('ativo=false: sempre 0 independente do regime', () => {
    const cfg = makeSettings({ ativo: false, regime: 'simples', percentual: 6 });
    expect(impostoValor(100, cfg)).toBe(0);
  });

  // Caso 1 da tarefa: preco=100, imposto%=6 => imposto=6
  it('1) simples: preco=100, percentual=6 → imposto=6', () => {
    const cfg = makeSettings({ regime: 'simples', percentual: 6 });
    expect(impostoValor(100, cfg)).toBeCloseTo(6, 4);
  });

  it('presumido: preco=200, percentual=8 → imposto=16', () => {
    const cfg = makeSettings({ regime: 'presumido', percentual: 8 });
    expect(impostoValor(200, cfg)).toBeCloseTo(16, 4);
  });

  it('custom: preco=50, percentual=3.5 → imposto=1.75', () => {
    const cfg = makeSettings({ regime: 'custom', percentual: 3.5 });
    expect(impostoValor(50, cfg)).toBeCloseTo(1.75, 4);
  });

  it('custom: percentual=0 → imposto=0', () => {
    const cfg = makeSettings({ regime: 'custom', percentual: 0 });
    expect(impostoValor(500, cfg)).toBe(0);
  });
});

// ================================================================
// 2) impostoValor — MEI rateio por unidade
// ================================================================
describe('impostoValor — MEI rateio por unidade', () => {
  // Caso 2 da tarefa: DAS=75,90; vendas_mes=100 => imposto_item=0,759
  it('2) MEI rateio unidade: DAS=75.90, vendas=100 → 0.759 por item', () => {
    const cfg = makeSettings({
      regime: 'mei',
      meiDasMensal: 75.90,
      meiVendasMes: 100,
      meiRatearPorFaturamento: false,
    });
    expect(impostoValor(50, cfg)).toBeCloseTo(0.759, 4);
    // Não depende do preço
    expect(impostoValor(200, cfg)).toBeCloseTo(0.759, 4);
  });

  it('MEI rateio unidade: DAS=75.90, vendas=50 → 1.518 por item', () => {
    const cfg = makeSettings({
      regime: 'mei',
      meiDasMensal: 75.90,
      meiVendasMes: 50,
      meiRatearPorFaturamento: false,
    });
    expect(impostoValor(100, cfg)).toBeCloseTo(1.518, 4);
  });

  it('MEI rateio unidade: vendas=1 (mínimo) → imposto = DAS inteiro', () => {
    const cfg = makeSettings({
      regime: 'mei',
      meiDasMensal: 75.90,
      meiVendasMes: 1,
      meiRatearPorFaturamento: false,
    });
    expect(impostoValor(100, cfg)).toBeCloseTo(75.90, 4);
  });

  it('MEI rateio unidade: vendas=0 faz fallback para 1 (evita divisão por zero)', () => {
    const cfg = makeSettings({
      regime: 'mei',
      meiDasMensal: 75.90,
      meiVendasMes: 0,
      meiRatearPorFaturamento: false,
    });
    expect(impostoValor(100, cfg)).toBeCloseTo(75.90, 4);
  });
});

// ================================================================
// 3) impostoValor — MEI rateio por faturamento
// ================================================================
describe('impostoValor — MEI rateio por faturamento', () => {
  it('MEI por faturamento: DAS=75.90, fat=5000, preco=100 → 1.518', () => {
    // pct = 75.90/5000 = 0.01518; 100 * 0.01518 = 1.518
    const cfg = makeSettings({
      regime: 'mei',
      meiDasMensal: 75.90,
      meiRatearPorFaturamento: true,
      meiFaturamentoMes: 5000,
    });
    expect(impostoValor(100, cfg)).toBeCloseTo(1.518, 4);
  });

  it('MEI por faturamento: fallback para por unidade se meiFaturamentoMes=0', () => {
    const cfg = makeSettings({
      regime: 'mei',
      meiDasMensal: 75.90,
      meiVendasMes: 100,
      meiRatearPorFaturamento: true,
      meiFaturamentoMes: 0, // fallback
    });
    expect(impostoValor(100, cfg)).toBeCloseTo(0.759, 4);
  });
});

// ================================================================
// 4) impostoPercentEfetivo
// ================================================================
describe('impostoPercentEfetivo', () => {
  it('simples 6%: percentual efetivo = 6 para qualquer preço', () => {
    const cfg = makeSettings({ regime: 'simples', percentual: 6 });
    expect(impostoPercentEfetivo(100, cfg)).toBeCloseTo(6, 4);
    expect(impostoPercentEfetivo(200, cfg)).toBeCloseTo(6, 4);
  });

  it('MEI por unidade: percentual cai à medida que preço cresce', () => {
    const cfg = makeSettings({
      regime: 'mei',
      meiDasMensal: 75.90,
      meiVendasMes: 100,
    });
    const pct100 = impostoPercentEfetivo(100, cfg); // 0.759/100 = 0.759%
    const pct200 = impostoPercentEfetivo(200, cfg); // 0.759/200 = 0.3795%
    expect(pct100).toBeCloseTo(0.759, 3);
    expect(pct200).toBeCloseTo(0.3795, 3);
    expect(pct100).toBeGreaterThan(pct200);
  });

  it('preco=0: retorna 0 sem divisão por zero', () => {
    const cfg = makeSettings({ regime: 'simples', percentual: 6 });
    expect(impostoPercentEfetivo(0, cfg)).toBe(0);
  });

  it('ativo=false: retorna 0', () => {
    const cfg = makeSettings({ ativo: false, regime: 'simples', percentual: 6 });
    expect(impostoPercentEfetivo(100, cfg)).toBe(0);
  });
});

// ================================================================
// 5) Integração com TikTok Shop (caso 3 da tarefa):
//    COGS=6.49, TikTok 6%+R$2 (para preco<79)
//    Com imposto 6% Simples → preço alvo para 30% margem sobe
// ================================================================
describe('Integração imposto + TikTok Shop — monotonicidade', () => {
  const COGS = 6.49;
  const MARGEM = 30;

  function makeImpostoIsento(): ImpostoSettings {
    return makeSettings({ ativo: false, regime: 'isento' });
  }

  function makeImpostoSimples6(): ImpostoSettings {
    return makeSettings({ ativo: true, regime: 'simples', percentual: 6 });
  }

  it('3) Com imposto 6%, preço alvo para 30% margem > preço sem imposto', () => {
    // Dedução sem imposto: apenas TikTok (6% + R$2 se < 79)
    const calcSemImposto = (price: number) =>
      calculateTikTokShopTaxes(price, 6, 2, 79, false, 1) +
      impostoValor(price, makeImpostoIsento());

    // Dedução com imposto Simples 6%
    const calcComImposto = (price: number) =>
      calculateTikTokShopTaxes(price, 6, 2, 79, false, 1) +
      impostoValor(price, makeImpostoSimples6());

    const precoSemImposto = findTargetPrice(COGS, MARGEM, calcSemImposto);
    const precoComImposto = findTargetPrice(COGS, MARGEM, calcComImposto);

    expect(precoComImposto).toBeGreaterThan(precoSemImposto);
  });

  it('3b) Margem real ≥ 30% é atingida nos preços calculados (sem e com imposto)', () => {
    const calcSemImposto = (price: number) =>
      calculateTikTokShopTaxes(price, 6, 2, 79, false, 1) +
      impostoValor(price, makeImpostoIsento());

    const calcComImposto = (price: number) =>
      calculateTikTokShopTaxes(price, 6, 2, 79, false, 1) +
      impostoValor(price, makeImpostoSimples6());

    const precoSem = findTargetPrice(COGS, MARGEM, calcSemImposto);
    const margSem = (precoSem - COGS - calcSemImposto(precoSem)) / precoSem * 100;
    expect(margSem).toBeGreaterThanOrEqual(MARGEM - 0.1);

    const precoCom = findTargetPrice(COGS, MARGEM, calcComImposto);
    const margCom = (precoCom - COGS - calcComImposto(precoCom)) / precoCom * 100;
    expect(margCom).toBeGreaterThanOrEqual(MARGEM - 0.1);
  });

  it('3c) MEI rateio unidade com TikTok também exige preço maior que sem imposto', () => {
    const cfgMei = makeSettings({
      ativo: true,
      regime: 'mei',
      meiDasMensal: 75.90,
      meiVendasMes: 100,
    });

    const calcSemImposto = (price: number) =>
      calculateTikTokShopTaxes(price, 6, 2, 79, false, 1) +
      impostoValor(price, makeImpostoIsento());

    const calcComMei = (price: number) =>
      calculateTikTokShopTaxes(price, 6, 2, 79, false, 1) +
      impostoValor(price, cfgMei);

    const precoSem = findTargetPrice(COGS, MARGEM, calcSemImposto);
    const precoMei = findTargetPrice(COGS, MARGEM, calcComMei);
    expect(precoMei).toBeGreaterThan(precoSem);
  });
});
