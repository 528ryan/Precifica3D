import { describe, it, expect } from 'vitest';
import {
  calculateFilamentGrams,
  calculateFilamentCost,
  calculateEnergyKwh,
  calculateEnergyCost,
  calculateDepreciationPerHour,
  calculateShopeeTaxes,
  calculateMercadoLivreTaxes,
  calculateProfit,
  calculateMargin,
  findBreakEvenPrice,
  findTargetPrice,
  applyPsychologicalRounding,
} from './index';

describe('Cálculos de Filamento', () => {
  it('calcula gramas totais com perdas e purga', () => {
    // 100g base + 5g purga fixa = 105g, com 10% de perda = 115.5g
    expect(calculateFilamentGrams(100, 5, 10)).toBeCloseTo(115.5, 1);
  });

  it('calcula gramas totais sem purga fixa', () => {
    // 100g base com 8% de perda = 108g
    expect(calculateFilamentGrams(100, 0, 8)).toBeCloseTo(108, 1);
  });

  it('calcula custo do filamento', () => {
    // 100g a R$85/kg = R$8.50
    expect(calculateFilamentCost(100, 85)).toBeCloseTo(8.5, 2);
  });

  it('calcula custo do filamento para 1kg', () => {
    expect(calculateFilamentCost(1000, 100)).toBeCloseTo(100, 2);
  });
});

describe('Cálculos de Energia', () => {
  it('calcula kWh corretamente', () => {
    // 100W por 2 horas com power factor 1.0 = 0.2 kWh
    expect(calculateEnergyKwh(100, 1.0, 2)).toBeCloseTo(0.2, 3);
  });

  it('aplica power factor corretamente', () => {
    // 100W com power factor 1.18 por 1 hora = 0.118 kWh
    expect(calculateEnergyKwh(100, 1.18, 1)).toBeCloseTo(0.118, 3);
  });

  it('calcula custo de energia', () => {
    // 1 kWh a R$0.72 sem bandeira extra = R$0.72
    expect(calculateEnergyCost(1, 0.72, 0)).toBeCloseTo(0.72, 2);
  });

  it('calcula custo de energia com bandeira', () => {
    // 1 kWh a R$0.72 + R$0.07 bandeira = R$0.79
    expect(calculateEnergyCost(1, 0.72, 0.07)).toBeCloseTo(0.79, 2);
  });
});

describe('Cálculos de Depreciação', () => {
  it('calcula depreciação por hora', () => {
    // Impressora de R$3000 com vida útil de 5000 horas = R$0.60/h
    expect(calculateDepreciationPerHour(3000, 5000)).toBeCloseTo(0.6, 2);
  });

  it('retorna 0 para vida útil inválida', () => {
    expect(calculateDepreciationPerHour(3000, 0)).toBe(0);
    expect(calculateDepreciationPerHour(3000, -100)).toBe(0);
  });
});

describe('Cálculos de Taxas - Shopee', () => {
  it('calcula taxas básicas da Shopee', () => {
    // Preço R$100, comissão 14%, taxa fixa R$4, sem frete grátis
    // 14% de 100 = R$14 + R$4 = R$18
    expect(calculateShopeeTaxes(100, 14, 4, 100, false, 6, 1)).toBeCloseTo(18, 2);
  });

  it('aplica programa de frete grátis', () => {
    // Preço R$100, comissão 14% + 6% = 20%, taxa fixa R$4
    // 20% de 100 = R$20 + R$4 = R$24
    expect(calculateShopeeTaxes(100, 14, 4, 100, true, 6, 1)).toBeCloseTo(24, 2);
  });

  it('aplica teto de comissão', () => {
    // Preço R$1000, comissão 14% = R$140, mas teto é R$100
    // R$100 + R$4 = R$104
    expect(calculateShopeeTaxes(1000, 14, 4, 100, false, 6, 1)).toBeCloseTo(104, 2);
  });

  it('multiplica taxa fixa por quantidade', () => {
    // Preço R$100, taxa fixa R$4 x 3 itens = R$12
    expect(calculateShopeeTaxes(100, 14, 4, 100, false, 6, 3)).toBeCloseTo(26, 2);
  });
});

describe('Cálculos de Taxas - Mercado Livre', () => {
  it('calcula taxas abaixo do threshold', () => {
    // Preço R$50 (abaixo de R$79), comissão 14%, taxa fixa R$6.75
    // 14% de 50 = R$7 + R$6.75 = R$13.75
    expect(calculateMercadoLivreTaxes(50, 14, 79, 6.75, 0, 1)).toBeCloseTo(13.75, 2);
  });

  it('calcula taxas acima do threshold', () => {
    // Preço R$100 (acima de R$79), comissão 14%, taxa fixa R$0
    // 14% de 100 = R$14
    expect(calculateMercadoLivreTaxes(100, 14, 79, 6.75, 0, 1)).toBeCloseTo(14, 2);
  });

  it('aplica comissão premium', () => {
    // Preço R$100, comissão 17%
    expect(calculateMercadoLivreTaxes(100, 17, 79, 6.75, 0, 1)).toBeCloseTo(17, 2);
  });
});

describe('Cálculos de Lucro e Margem', () => {
  it('calcula lucro corretamente', () => {
    // Preço R$100, COGS R$30, taxas R$20 = lucro R$50
    expect(calculateProfit(100, 30, 20)).toBe(50);
  });

  it('calcula margem corretamente', () => {
    // Lucro R$50 em preço R$100 = 50%
    expect(calculateMargin(100, 50)).toBe(50);
  });

  it('retorna 0 para preço inválido', () => {
    expect(calculateMargin(0, 50)).toBe(0);
    expect(calculateMargin(-10, 50)).toBe(0);
  });
});

describe('Busca Binária - Break-Even', () => {
  it('encontra preço de break-even simples', () => {
    // COGS = R$10, taxa fixa de 10%
    // Break-even: preço - 10 - preço*0.1 = 0
    // 0.9*preço = 10 => preço = 11.11
    const calculateTaxes = (price: number) => price * 0.1;
    const breakEven = findBreakEvenPrice(10, calculateTaxes);
    expect(breakEven).toBeCloseTo(11.11, 1);
  });

  it('encontra preço de break-even com taxa fixa', () => {
    // COGS = R$10, taxa = 10% + R$5
    // preço - 10 - preço*0.1 - 5 = 0
    // 0.9*preço = 15 => preço = 16.67
    const calculateTaxes = (price: number) => price * 0.1 + 5;
    const breakEven = findBreakEvenPrice(10, calculateTaxes);
    expect(breakEven).toBeCloseTo(16.67, 1);
  });
});

describe('Busca Binária - Preço Alvo', () => {
  it('encontra preço para margem desejada', () => {
    // COGS = R$10, taxa = 10%, margem desejada = 20%
    // lucro = preço - 10 - preço*0.1 = 0.9*preço - 10
    // margem = lucro/preço = (0.9*preço - 10)/preço = 0.2
    // 0.9 - 10/preço = 0.2 => 10/preço = 0.7 => preço = 14.29
    const calculateTaxes = (price: number) => price * 0.1;
    const targetPrice = findTargetPrice(10, 20, calculateTaxes);
    expect(targetPrice).toBeCloseTo(14.29, 1);
  });
});

describe('Arredondamento Psicológico', () => {
  it('não arredonda quando none', () => {
    expect(applyPsychologicalRounding(45.67, 'none')).toBeCloseTo(45.67, 2);
  });

  it('arredonda para ,90', () => {
    expect(applyPsychologicalRounding(45.67, '90')).toBe(45.90);
  });

  it('arredonda para ,99', () => {
    expect(applyPsychologicalRounding(45.67, '99')).toBe(45.99);
  });

  it('arredonda para ,50', () => {
    expect(applyPsychologicalRounding(45.67, '50')).toBe(45.50);
  });
});
