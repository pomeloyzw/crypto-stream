# 🌊 CryptoStream

> 🚀 **Your Gateway to the Crypto Markets**
> A lightning-fast, real-time cryptocurrency analytics terminal designed for traders and enthusiasts who demand up-to-the-second precision.

## 🌟 The System
Welcome to **CryptoStream**! This isn't just another crypto dashboard. It's a high-performance, real-time analytics terminal that fuses the extensive historical data of **CoinGecko** with the blazing-fast live websocket streams of **Binance**. Dive into interactive TradingView-style candlestick charts, monitor trending tokens, and make informed decisions with detailed market metrics!

**Key Highlights:**
- 📈 **Surgical Precision**: Interactive, lightweight, and responsive candlestick charts for deep asset analysis.
- ⚡ **Zero-Lag Market Data**: Live ticking data piped directly into your browser from Binance WebSockets.
- 🔍 **Omniscient Search**: Effortlessly find any coin using our command palette (`Ctrl+K` or `⌘K`).
- 📱 **Fluid & Responsive**: Designed beautifully across all breakpoints so you can track markets on the go.

## 🛠️ Technical Stack
We built CryptoStream with the modern web in mind. It's robust, type-safe, and blazingly fast.

- **Framework**: [Next.js 16](https://nextjs.org/) (Leveraging the App Router for seamless server-side rendering, streaming, and Suspense)
- **UI Core**: [React 19](https://react.dev/), [Radix UI](https://www.radix-ui.com/), and [CMDK](https://cmdk.paco.me/) for accessible, unstyled primitives.
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (The absolute cutting edge of utility-first CSS)
- **Language**: [TypeScript v5](https://www.typescriptlang.org/) (Strict mode enabled for ultimate type safety and DX)
- **Charts**: [Lightweight Charts](https://tradingview.github.io/lightweight-charts/) (Built by TradingView for crisp canvas rendering)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Integration**: 
  - Rest APIs native `fetch` caching for CoinGecko.
  - Native WebSockets for Binance streams.

## 💻 Project Setup
Ready to feel the pulse? Follow these steps to get running on your local machine.

### Prerequisites
Make sure your development environment includes:
- Node.js (v18+ recommended)
- `npm`, `yarn`, `pnpm`, or `bun`
- A free developer account on the [CoinGecko Developer Dashboard](https://www.coingecko.com/en/api) to generate your API Key.

### 1. Clone the repository
Grab the codebase and navigate into it:
```bash
git clone https://github.com/pomeloyzw/crypto-stream.git
cd crypto-pulse
```

### 2. Install dependencies
Install the necessary packages to power up the terminal:
```bash
npm install
```
*(Or use `yarn install`, `pnpm install`, `bun install`)*

## 🔐 Local Environment Setup
CryptoStream relies on external data sources for its pristine data. You must configure your environment variables for it to work.

1. **Create an Environment File**
   In the root of your project, create a file precisely named `.env.local`.

2. **Configure Variables**
   Copy and paste the following template into your `.env.local`, and replace the `your_coingecko_api_key` with your actual key:

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

3. **Ignite the Engines**
   Start the Next.js development server:
   ```bash
   npm run dev
   ```

4. **Launch the Dashboard**
   Open your browser and navigate to [http://localhost:3000](http://localhost:3000). Boom! 💥 Real-time crypto data is now flowing into your screen.

---

*Made with ❤️, Data, and TypeScript.*
