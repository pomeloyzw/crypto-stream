# 🌊 CryptoStream

![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Binance](https://img.shields.io/badge/Binance-FCD535?style=for-the-badge&logo=binance&logoColor=black)

> 🚀 **Your Gateway to the Real-Time Crypto Markets**  
> A lightning-fast, real-time cryptocurrency analytics terminal designed for traders, developers, and enthusiasts who demand up-to-the-second precision.

## 🌟 Introduction & Features

Welcome to **CryptoStream**! This isn't just another crypto dashboard. It's a high-performance, real-time analytics terminal that fuses the extensive historical data of **CoinGecko** with the blazing-fast live websocket streams of **Binance**. Dive into interactive TradingView-style candlestick charts, monitor trending tokens, and make informed decisions with detailed market metrics!

**🔥 Key Highlights & Features:**
- 📈 **Surgical Precision**: Interactive, lightweight, and responsive candlestick charts for deep asset analysis.
- ⚡ **Zero-Lag Market Data**: Live ticking data piped directly into your browser from Binance WebSockets.
- 🔍 **Omniscient Search Palette**: Effortlessly find any coin using our command palette (`Ctrl+K` or `⌘K`).
- 📱 **Fluid & Responsive Design**: Designed beautifully across all breakpoints so you can track markets on the go.
- 🎨 **Modern Theming**: Beautifully styled using Tailwind CSS v4 and Radix UI primitives.

## 🛠️ Technical Stack

We built CryptoStream with the modern web in mind. It's robust, type-safe, and blazingly fast.

- **Framework**: [Next.js 16](https://nextjs.org/) (Leveraging the App Router for seamless server-side rendering, streaming, and Suspense)
- **UI Core**: [React 19](https://react.dev/), [Radix UI](https://www.radix-ui.com/), and [CMDK](https://cmdk.paco.me/) for accessible, unstyled primitives.
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (The absolute cutting edge of utility-first CSS)
- **Language**: [TypeScript v5](https://www.typescriptlang.org/) (Strict mode enabled for ultimate type safety and DX)
- **Charts**: [Lightweight Charts](https://tradingview.github.io/lightweight-charts/) (Built by TradingView for crisp canvas rendering)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Integration**:
  - Full REST API integration with `fetch` caching for CoinGecko.
  - Native WebSockets integration for Binance live streams.

## 💻 Project Setup

Ready to feel the pulse? Follow these simple steps to get the project running.

### Prerequisites

Make sure your development environment includes:
- [Node.js](https://nodejs.org/) (v18+ recommended)
- `npm`, `yarn`, `pnpm`, or `bun`
- A free developer account on the [CoinGecko Developer Dashboard](https://www.coingecko.com/en/api) to generate your API Key.

### 1. Clone the repository

Grab the codebase and navigate into it:

```bash
git clone https://github.com/pomeloyzw/crypto-stream.git
cd crypto-stream
```

### 2. Install dependencies

Install the necessary packages to power up the terminal:

```bash
npm install
# Or use: yarn install | pnpm install | bun install
```

## 🔐 Local Environment Setup

CryptoStream relies on external APIs to fetch its pristine data. You must configure your environment variables before running the development server.

### 1. Create an Environment File

In the root of your project, create a file precisely named `.env.local`.

### 2. Configure Variables

Copy and paste the following template into your `.env.local`, and replace `your_coingecko_api_key` with your actual key:

```env
# 🦎 CoinGecko API Configuration
COINGECKO_API_URL=https://api.coingecko.com/api/v3
COINGECKO_API_KEY=your_coingecko_api_key

# Use x-cg-demo-api-key for standard free-tier accounts
# Use x-cg-pro-api-key if you are on a pro tier!
COINGECKO_API_KEY_HEADER=x-cg-demo-api-key

# 🟡 Binance API Configuration
BINANCE_API_URL=https://api.binance.com/api/v3
NEXT_PUBLIC_BINANCE_WS_URL=wss://stream.binance.com:9443
```

### 3. Ignite the Engines

Start the Next.js development server:

```bash
npm run dev
```

### 4. Launch the Dashboard

Open your browser and navigate to [http://localhost:3000](http://localhost:3000). Boom! 💥 Real-time crypto data is now flowing into your screen.

---

*Made with ❤️, Data, and TypeScript.*
