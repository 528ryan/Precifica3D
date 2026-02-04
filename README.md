# 🖨️ Precifica3D

Calculadora de Preços para Impressão 3D - Precifique seus produtos para venda em marketplaces (Shopee e Mercado Livre).

## 🚀 Funcionalidades

- **Cálculo de Custos Completos**: Filamento, energia, mão de obra, embalagem e depreciação
- **Presets de Impressoras**: Bambu Lab A1 Mini, Creality Ender 3 V2, Prusa MK4S
- **Presets de Materiais**: PLA, PETG, ABS/ASA, TPU, Resina
- **Suporte Multicor/AMS**: Ajuste automático de perdas para impressões multicoloridas
- **Taxas de Plataforma**: Configurações para Shopee e Mercado Livre
- **Preço Alvo por Margem**: Calcule o preço para atingir sua margem desejada
- **Faixa de Anúncio**: Gere uma faixa de preço sugerida para anunciar
- **Arredondamento Psicológico**: Termine preços em ,90, ,99 ou ,50
- **Comparativo Side-by-Side**: Compare Shopee vs Mercado Livre
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

### Preço Mínimo (Break-Even)
Encontrado via busca binária onde `lucro(preço) >= 0`

### Preço Alvo (Margem Desejada)
Encontrado via busca binária onde `lucro(preço) / preço >= margem_desejada`

## ⚠️ Aviso Importante

As taxas e comissões das plataformas são apenas **presets editáveis** e podem mudar a qualquer momento. Sempre confirme os valores atuais diretamente na Shopee e no Mercado Livre.

## 📄 Licença

MIT
