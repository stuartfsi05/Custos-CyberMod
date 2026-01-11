# 🖨️ Custos CyberMod

> Ferramenta profissional para precificação de projetos de impressão 3D, com foco em mobilidade e precisão.

**Custos CyberMod** é uma aplicação moderna desenvolvida para transformar a maneira como você precifica seus serviços de impressão 3D. Com uma interface "Mobile-First" premium, ela permite calcular custos exatos, gerenciar margens de lucro dinâmicas e manter um histórico organizado dos seus projetos, tudo na palma da sua mão.

![Badge](https://img.shields.io/badge/Status-Active-emerald?style=for-the-badge)
![Badge](https://img.shields.io/badge/Plataforma-Android%20%7C%20Web-blue?style=for-the-badge)
![Badge](https://img.shields.io/badge/License-Private-purple?style=for-the-badge)

## ✨ Funcionalidades

### 💰 Calculadora Inteligente
- **Precificação Detalhada**: Algoritmo que considera peso (g), tempo de impressão, pós-processamento e custos fixos/variáveis.
- **Endereçamento Automático**: Integração com **ViaCEP** para preenchimento automático de endereços de clientes.
- **Custos Variáveis**: Adicione custos extras como lixa, cola, ou verniz com um toque.
- **Perfis de Preço Dinâmicos**:
  - 🥇 **Custo Base**: Valor puro de materiais e energia.
  - 👥 **Amigos**: Margem reduzida (ex: +10%).
  - 🏭 **Atacado**: Preços competitivos para volume (ex: +25%).
  - 🛍️ **Varejo**: Margem padrão de mercado (ex: +50%).
  - ⚡ **Urgente**: Taxa de prioridade configurável (ex: +80%).
- **Feedback Visual**: Cores e badges indicam claramente o nível de lucro de cada perfil.

### 📦 Gestão de Inventário
- **Histórico Completo**: Salve e organize todos os orçamentos gerados.
- **Edição de Projetos**: Reabra projetos salvos para ajustar parâmetros, alterar custos extras ou atualizar preços.
- **Status de Pedido**:
  - 🟡 **Pendente**: Orçamento enviado.
  - 🟢 **Aprovado**: Pronto para produção.
  - 🔴 **Rejeitado**: Arquivado na lixeira (com recuperação possível).
- **Busca Instantânea**: Encontre projetos pelo nome do cliente ou do modelo.

### ⚙️ Configurações Globais
- **Ajuste Fino**: Defina globalmente o custo do seu filamento (R$/kg), energia (kwh) e hora de trabalho.
- **Perfis Editáveis**: Altere as margens de lucro de cada perfil de venda (Amigos, Varejo, etc.) conforme sua estratégia de negócio.
- **Gestão de Extras**: Cadastre e gerencie a lista de materiais consumíveis (lixas, tintas, parafusos) disponíveis para seleção rápida.
- **Temas**: Interface adaptável com modos Claro ☀️, Escuro 🌙 e Sistema 💻.

## 🛠️ Tecnologias Utilizadas

Construído com o que há de mais moderno no ecossistema React para garantir performance nativa e UX fluida:

- **Core**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Mobile Runtime**: [Capacitor 6](https://capacitorjs.com/) (Geração de APK Nativo)
- **Estilização**: [TailwindCSS](https://tailwindcss.com/)
- **Componentes UI**: [Vaul](https://vaul.emilkowal.ski/) (Drawers Nativos), [Sonner](https://sonner.emilkowal.ski/) (Toasts)
- **Animações**: [Framer Motion](https://www.framer.com/motion/)
- **Gerenciamento de Estado**: React Context API + LocalStorage
- **Formulários**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) (Validação Robusta)
- **ícones**: [Lucide React](https://lucide.dev/)

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
