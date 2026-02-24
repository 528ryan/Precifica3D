# 🖨️ Precifica3D

Calculadora de Preços para Impressão 3D — Precifique seus produtos para venda em marketplaces (Shopee, Mercado Livre e TikTok Shop).

## 🚀 Funcionalidades

- **Cálculo de Custos Completos**: Filamento, energia, mão de obra, embalagem e depreciação
- **Presets de Impressoras**: Bambu Lab A1 Mini, Creality Ender 3 V2, Prusa MK4S
- **Presets de Materiais**: PLA, PETG, ABS/ASA, TPU, Resina
- **Suporte Multicor/AMS**: Ajuste automático de perdas para impressões multicoloridas
- **Taxas de Plataforma**: Shopee, Mercado Livre e **TikTok Shop Brasil**
- **Preço Alvo por Margem**: Calcule o preço para atingir sua margem desejada
- **Faixa de Anúncio**: Gere uma faixa de preço sugerida para anunciar
- **Arredondamento Psicológico**: Termine preços em ,90, ,99 ou ,50
- **Comparativo Side-by-Side**: Compare Shopee × Mercado Livre × TikTok Shop
- **Breakdown de Taxas por Canal**: Veja comissão percentual + taxa fixa separadamente
- **Persistência Local**: Suas configurações são salvas no localStorage
- **Mobile-First**: Interface responsiva para uso em qualquer dispositivo

## 📋 Requisitos

- Node.js 18+ 
- npm 9+

## 🛠️ Instalação

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd Precifica3D

# Instale as dependências
npm install
```

## 🏃 Como Executar

```bash
# Modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 🧪 Testes

```bash
# Executar testes
npm run test

# Executar testes em modo watch
npm run test:watch
```

## 📁 Estrutura do Projeto

```
src/
├── calc/             # Funções de cálculo (funções puras)
│   ├── index.ts      # Cálculos de custo, taxas e preços
│   └── index.test.ts # Testes unitários
├── components/       # Componentes React
│   ├── PrintSection.tsx
│   ├── MaterialSection.tsx
│   ├── EnergySection.tsx
│   ├── ExtraCostsSection.tsx
│   ├── PlatformSection.tsx
│   ├── PricingGoalsSection.tsx
│   └── ResultsSection.tsx
├── hooks/            # React Hooks
│   └── useSettings.ts
├── presets/          # Presets configuráveis
│   └── index.ts
├── types/            # TypeScript types
│   └── index.ts
└── App.tsx           # Componente principal
```

## 📊 Fórmulas Principais

### Custo de Filamento
```
filamento_total_g = (gramas_usadas + purga_fixa_g) × (1 + perdas_percent/100)
custo_filamento = (filamento_total_g / 1000) × preco_R_por_kg
```

### Custo de Energia
```
potencia_aplicada_W = potencia_W × power_factor
kwh = (potencia_aplicada_W / 1000) × horas
custo_energia = kwh × (preco_kwh + extra_bandeira)
```

### COGS (Custo Total)
```
COGS = custo_filamento + custo_energia + mao_obra + embalagem + depreciacao + outros
```

### Fórmula Geral de Taxas (Unificada)
```
percentualTotal   = comissão% + transação% + extras%         (se houver)
commissionValue   = min(preço × percentualTotal/100, teto)   (teto apenas Shopee)
fixedFeeTotal     = taxa_fixa_unitária × qtd_itens           (se aplicável)
taxasTotal        = commissionValue + fixedFeeTotal
rendaLiquida      = preço − taxasTotal − COGS
```

### Preço Mínimo (Break-Even)
Encontrado via busca binária onde `lucro(preço) >= 0`

### Preço Alvo (Margem Desejada)
Encontrado via busca binária onde `lucro(preço) / preço >= margem_desejada`

---

## 🛒 Regras das Plataformas (2026)

### 🟠 Shopee — Fevereiro 2026
| Componente | Valor padrão | Editável |
|---|---|---|
| Comissão base | 12% | ✅ |
| Taxa de transação | 2% | ✅ |
| Extra frete grátis | 6% (opcional) | ✅ |
| Taxa fixa (CNPJ) | R$ 4,00/item | ✅ |
| Taxa fixa (CPF 0–199 pedidos) | R$ 7,00/item | ✅ |
| Taxa fixa (CPF 200+ pedidos) | R$ 4,00/item | ✅ |
| **Teto da comissão percentual** | R$ 100,00 | ✅ |

> O teto de R$100 se aplica **apenas** à parte percentual; a taxa fixa por item é sempre cobrada.  
> Fonte oficial: <https://seller.shopee.com.br/edu/article/26839>

---

### 🔵 Mercado Livre — Março 2026
| Tipo de anúncio | Comissão |
|---|---|
| Clássico | 14% (padrão, editável) |
| Premium  | 19% (padrão, editável) |

**Custos operacionais escalonados para produtos < R$ 79:**

| Faixa de preço | Custo fixo / item |
|---|---|
| < R$ 12,50 | 50% do preço |
| R$ 12,50 – R$ 29,00 | R$ 6,25 |
| R$ 29,00 – R$ 50,00 | R$ 6,50 |
| R$ 50,00 – R$ 79,00 | R$ 6,75 |
| > R$ 79,00 | R$ 0,00 |

> Fonte oficial: <https://www.mercadolivre.com.br/ajuda/custos-de-vender_1338>  
> Referência complementar: <https://blog.tecnospeed.com.br/tarifas-do-mercado-livre/>

---

### 🎵 TikTok Shop Brasil — 2026
| Componente | Valor padrão | Editável |
|---|---|---|
| Comissão percentual | 6% | ✅ |
| Taxa fixa por item (preço < R$ 79) | R$ 2,00 | ✅ |
| Limite para taxa fixa | R$ 79,00 | ✅ |
| Teto de comissão | Não há | — |
| Incentivo comissão 0% (promo) | Desativado | ✅ |

**Exemplos reais:**
- Preço **R$ 50** → `6% × 50 + R$2 (taxa fixa)` = **R$ 5,00** de taxas
- Preço **R$ 120** → `6% × 120` (sem taxa fixa, pois 120 ≥ 79) = **R$ 7,20** de taxas
- Com promoção 0%: comissão = R$0; taxa fixa ainda pode incidir se preço < R$79

> Os campos de comissão e taxa fixa são editáveis para acomodar mudanças futuras da política.  
> Fonte oficial: <https://seller-br.tiktok.com/university/essay?knowledge_id=10000785>

---

## ⚠️ Aviso Importante

As taxas e comissões das plataformas são apenas **presets editáveis** e podem mudar a qualquer momento. Sempre confirme os valores atuais diretamente na Shopee, Mercado Livre e TikTok Shop.

## 📄 Licença

MIT


## 📋 Requisitos

- Node.js 18+ 
- npm 9+

## 🛠️ Instalação

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd Precifica3D

# Instale as dependências
npm install
```

## 🏃 Como Executar

```bash
# Modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 🧪 Testes

```bash
# Executar testes
npm run test

# Executar testes em modo watch
npm run test:watch
```

## 📁 Estrutura do Projeto

```
src/
├── calc/             # Funções de cálculo (funções puras)
│   ├── index.ts      # Cálculos de custo, taxas e preços
│   └── index.test.ts # Testes unitários
├── components/       # Componentes React
│   ├── PrintSection.tsx
│   ├── MaterialSection.tsx
│   ├── EnergySection.tsx
│   ├── ExtraCostsSection.tsx
│   ├── PlatformSection.tsx
│   ├── PricingGoalsSection.tsx
│   └── ResultsSection.tsx
├── hooks/            # React Hooks
│   └── useSettings.ts
├── presets/          # Presets configuráveis
│   └── index.ts
├── types/            # TypeScript types
│   └── index.ts
└── App.tsx           # Componente principal
```

## 📊 Fórmulas Principais

### Custo de Filamento
```
filamento_total_g = (gramas_usadas + purga_fixa_g) × (1 + perdas_percent/100)
custo_filamento = (filamento_total_g / 1000) × preco_R_por_kg
```

### Custo de Energia
```
potencia_aplicada_W = potencia_W × power_factor
kwh = (potencia_aplicada_W / 1000) × horas
custo_energia = kwh × (preco_kwh + extra_bandeira)
```

### COGS (Custo Total)
```
COGS = custo_filamento + custo_energia + mao_obra + embalagem + depreciacao + outros
```

### Preço Mínimo (Break-Even)
Encontrado via busca binária onde `lucro(preço) >= 0`

### Preço Alvo (Margem Desejada)
Encontrado via busca binária onde `lucro(preço) / preço >= margem_desejada`

## ⚠️ Aviso Importante

As taxas e comissões das plataformas são apenas **presets editáveis** e podem mudar a qualquer momento. Sempre confirme os valores atuais diretamente na Shopee e no Mercado Livre.

## 📄 Licença

MIT
