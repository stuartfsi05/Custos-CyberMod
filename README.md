# 🖨️ Custos CyberMod

> Ferramenta profissional para precificação de projetos de impressão 3D.

**Custos CyberMod** é uma aplicação moderna e responsiva desenvolvida para auxiliar entusiastas e profissionais de impressão 3D a calcular custos de projetos com precisão, gerenciar um histórico de orçamentos e personalizar parâmetros de precificação.

![Badge](https://img.shields.io/badge/Status-Active-emerald?style=for-the-badge)
![Badge](https://img.shields.io/badge/License-Private-blue?style=for-the-badge)

## ✨ Funcionalidades

### 💰 Calculadora de Custos
- **Cálculo Preciso**: Baseado em peso (g), tempo de impressão e tempo de pós-processamento.
- **Perfis de Preço**:
  - 🥇 **Custo**: Valor base (apenas materiais e energia).
  - 👥 **Amigos**: Margem reduzida para conhecidos.
  - 🏭 **Atacado**: Preços especiais para grandes volumes.
  - 🛍️ **Varejo**: Margem padrão de mercado.
  - ⚡ **Urgente**: Taxa de prioridade para entregas rápidas.
- **Resultado em Tempo Real**: Visualize o preço final instantaneamente enquanto edita os parâmetros.
- **Copiar Oçamento**: Copie o valor formatado para a área de transferência com um clique.

### 📦 Inventário (Histórico)
- **Histórico de Projetos**: Salve todos os seus cálculos para referência futura.
- **Status do Projeto**:
  - 🟡 Pendente
  - 🟢 Aprovado
  - 🔴 Rejeitado (Lixeira)
- **Gestão de Lixeira**: Recupere ou exclua permanentemente itens rejeitados.
- **Busca Rápida**: Filtre projetos pelo nome instantaneamente.

### ⚙️ Configurações
- **Parâmetros Personalizáveis**:
  - Custo do Filamento (R$/kg)
  - Custo de Energia (R$/h)
  - Custo de Mão de Obra (R$/h)
  - Margem de Falha (ex: 1.10 para 10% de segurança)
- **Temas**: Suporte a modo Claro ☀️, Escuro 🌙 e Sistema 💻.

## 🛠️ Tecnologias Utilizadas

O projeto foi construído com uma stack moderna focada em performance e experiência do usuário:

- **Core**: [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Estilização**: [TailwindCSS](https://tailwindcss.com/)
- **Animações**: [Framer Motion](https://www.framer.com/motion/)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Validação**: [Zod](https://zod.dev/) + [React Hook Form](https://react-hook-form.com/)
- **Mobile**: [Capacitor](https://capacitorjs.com/) (Suporte para Android)

## 🚀 Como Executar

### Pré-requisitos
- Node.js (v18 ou superior)
- npm ou yarn

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/stuartfsi05/Custos-CyberMod.git
cd Custos-CyberMod
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:5173`.

## 🏗️ Build e Deploy

Para gerar a versão de produção:

```bash
npm run build
```

Para gerar o APK Android (requer ambiente Android configurado):

```bash
npx cap sync
npx cap open android
# No Android Studio, execute o build/run
```

## 📱 Estrutura do Projeto

```
src/
├── components/      # Componentes de UI reutilizáveis (Botões, Cards, Inputs)
├── context/         # Gerenciamento de estado global (Settings, Inventory)
├── hooks/           # Hooks personalizados (PricingEngine, LocalStorage)
├── pages/           # Telas principais (Calculadora, Inventário, Configurações)
├── types/           # Definições de tipos TypeScript
└── utils/           # Funções utilitárias e formatadores
```

---
Desenvolvido com ❤️ por Stuart.
