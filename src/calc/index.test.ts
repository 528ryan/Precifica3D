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
import { getSuggestedFixedFee } from '../presets';

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

describe('Cálculos de Taxas - Shopee (Fevereiro 2026)', () => {
  it('exemplo real: R$15,11 com frete grátis', () => {
    // Preço: 15,11
    // Base: 12% + 2% transação = 14%
    // Frete grátis: +6% = 20% total
    // Comissão: 15,11 * 0.20 = 3,022
    // Taxa fixa: 4,00
    // Total: 3,022 + 4,00 = 7,022 → 7,02
    // Renda líquida esperada: 15,11 - 7,02 = 8,09
    expect(
      calculateShopeeTaxes(
        15.11,
        12, // commissionBasePercent
        2, // transactionTaxPercent
        6, // freteExtraPercent
        true, // freteGratisAtivo
        4, // fixedFeePerItem
        100, // commissionPercentCap
        1 // itemQuantity
      )
    ).toBeCloseTo(7.022, 2); // Deve resultar em 7,02 arredondado
  });

  it('calcula com comissão base + transação (sem frete)', () => {
    // Preço: 50,00
    // Comissão: 12% + 2% = 14%
    // Valor: 50 * 0,14 = 7,00
    // Taxa fixa: 4,00
    // Total: 7 + 4 = 11,00
    expect(
      calculateShopeeTaxes(
        50,
        12,
        2,
        6,
        false, // sem frete grátis
        4,
        100,
        1
      )
    ).toBeCloseTo(11, 2);
  });

  it('calcula com frete grátis ativado', () => {
    // Preço: 100,00
    // Comissão: 12% + 2% + 6% = 20%
    // Valor: 100 * 0,20 = 20,00
    // Taxa fixa: 4,00
    // Total: 20 + 4 = 24,00
    expect(
      calculateShopeeTaxes(100, 12, 2, 6, true, 4, 100, 1)
    ).toBeCloseTo(24, 2);
  });

  it('aplica teto de comissão apenas na parte percentual', () => {
    // Preço: 1000,00
    // Comissão: 12% + 2% = 14%
    // Valor bruto: 1000 * 0,14 = 140,00
    // Teto: 100,00 (comissão limitada a 100)
    // Taxa fixa: 4,00 (não entra no teto)
    // Total: 100 + 4 = 104,00
    expect(
      calculateShopeeTaxes(1000, 12, 2, 6, false, 4, 100, 1)
    ).toBeCloseTo(104, 2);
  });

  it('multiplica taxa fixa por quantidade de itens', () => {
    // Preço: 50,00 por item
    // Comissão: 14%
    // Valor: 50 * 0,14 = 7,00
    // Taxa fixa: 4,00 * 3 itens = 12,00
    // Total: 7 + 12 = 19,00
    expect(
      calculateShopeeTaxes(50, 12, 2, 0, false, 4, 100, 3)
    ).toBeCloseTo(19, 2);
  });

  it('respeita tipo de vendedor CPF (taxa fixa R$7)', () => {
    // Preço: 50,00
    // Comissão: 14%
    // Valor: 50 * 0,14 = 7,00
    // Taxa fixa: 7,00 (CPF baixo volume)
    // Total: 7 + 7 = 14,00
    expect(
      calculateShopeeTaxes(50, 12, 2, 0, false, 7, 100, 1)
    ).toBeCloseTo(14, 2);
  });

  it('não aplica teto se comissão for menor que o teto', () => {
    // Preço: 30,00
    // Comissão: 14%
    // Valor: 30 * 0,14 = 4,20
    // Teto: 100 (não é atingido)
    // Taxa fixa: 4,00
    // Total: 4,20 + 4 = 8,20
    expect(
      calculateShopeeTaxes(30, 12, 2, 0, false, 4, 100, 1)
    ).toBeCloseTo(8.2, 2);
  });

  it('calcula com extra OFF (percentual 14%) => taxas 6.12', () => {
    // Preço: 15,11
    // Base: 12% + 2% transação = 14% (SEM frete)
    // Comissão: 15,11 * 0.14 = 2,1154
    // Taxa fixa: 4,00
    // Total: 2,1154 + 4,00 = 6,1154 → 6,12
    expect(
      calculateShopeeTaxes(
        15.11,
        12, // commissionBasePercent
        2, // transactionTaxPercent
        6, // freteExtraPercent
        false, // freteGratisAtivo OFF
        4, // fixedFeePerItem
        100, // commissionPercentCap
        1 // itemQuantity
      )
    ).toBeCloseTo(6.1154, 2);
  });
});

describe('Sugestão de Taxa Fixa - Shopee', () => {
  it('sugere R$4 para CNPJ (qualquer volume)', () => {
    expect(getSuggestedFixedFee('cnpj', '0-199')).toBe(4);
    expect(getSuggestedFixedFee('cnpj', '200-499')).toBe(4);
    expect(getSuggestedFixedFee('cnpj', '500+')).toBe(4);
  });

  it('sugere R$7 para CPF com volume 0-199', () => {
    expect(getSuggestedFixedFee('cpf', '0-199')).toBe(7);
  });

  it('sugere R$4 para CPF com volume 200-499', () => {
    expect(getSuggestedFixedFee('cpf', '200-499')).toBe(4);
  });

  it('sugere R$4 para CPF com volume 500+', () => {
    expect(getSuggestedFixedFee('cpf', '500+')).toBe(4);
  });
});

describe('Cálculos de Taxas - Mercado Livre (Março 2026)', () => {
  it('calcula taxas para R$50-79', () => {
    // Preço R$60 (faixa R$50-79), comissão 14%, taxa fixa R$6.75
    // 14% de 60 = R$8.40 + R$6.75 = R$15.15
    expect(calculateMercadoLivreTaxes(60, 14, 79, 6.75, 0, 1)).toBeCloseTo(15.15, 2);
  });

  it('calcula taxas para R$29-50', () => {
    // Preço R$40 (faixa R$29-50), comissão 14%, taxa fixa R$6.50
    // 14% de 40 = R$5.60 + R$6.50 = R$12.10
    expect(calculateMercadoLivreTaxes(40, 14, 79, 6.75, 0, 1)).toBeCloseTo(12.10, 2);
  });

  it('calcula taxas para R$12.50-29', () => {
    // Preço R$20 (faixa R$12.50-29), comissão 14%, taxa fixa R$6.25
    // 14% de 20 = R$2.80 + R$6.25 = R$9.05
    expect(calculateMercadoLivreTaxes(20, 14, 79, 6.75, 0, 1)).toBeCloseTo(9.05, 2);
  });

  it('calcula taxas para produtos abaixo de R$12.50', () => {
    // Preço R$10 (< R$12.50): taxa fixa = metade do preço = R$5
    // 14% de 10 = R$1.40 + R$5 = R$6.40
    expect(calculateMercadoLivreTaxes(10, 14, 79, 6.75, 0, 1)).toBeCloseTo(6.40, 2);
  });

  it('calcula taxas acima de R$79', () => {
    // Preço R$100 (acima de R$79), comissão 14%, sem taxa fixa escalonada
    // 14% de 100 = R$14
    expect(calculateMercadoLivreTaxes(100, 14, 79, 6.75, 0, 1)).toBeCloseTo(14, 2);
  });

  it('aplica comissão premium', () => {
    // Preço R$100, comissão 19% (Premium março 2026)
    expect(calculateMercadoLivreTaxes(100, 19, 79, 6.75, 0, 1)).toBeCloseTo(19, 2);
  });

  it('multiplica taxa fixa por quantidade', () => {
    // Preço R$60 (faixa R$50-79), taxa fixa R$6.75, 2 itens
    // 14% de 60 = R$8.40 + R$6.75*2 = R$8.40 + R$13.50 = R$21.90
    expect(calculateMercadoLivreTaxes(60, 14, 79, 6.75, 0, 2)).toBeCloseTo(21.90, 2);
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
