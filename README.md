# Crypto Pulse

A real-time crypto analytics terminal powered by the CoinGecko API (REST) and Binance WebSocket API. This application provides up-to-the-second market data, interactive candlestick charts, and detailed token information.

## Features

- **Real-time Market Data**: Live price updates via Binance WebSockets.
- **Interactive Charts**: TradingView-style candlestick charts.
- **Token Analytics**: Detailed token metrics including market cap, volume, and supply.
- **Search**: Efficient token search functionality.
- **Responsive Design**: Optimized for both desktop and mobile devices.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: Radix UI, Lucide React
- **Charting**: Lightweight Charts
- **Data Fetching**: Native Fetch API & WebSockets

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd crypto-pulse
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

### Environment Setup

Create a `.env.local` file in the root directory and add the following variables:

```env
# CoinGecko API Configuration
COINGECKO_API_URL=https://api.coingecko.com/api/v3
COINGECKO_API_KEY=your_coingecko_api_key
COINGECKO_API_KEY_HEADER=x-cg-demo-api-key # or x-cg-pro-api-key

# Binance API Configuration
BINANCE_API_URL=https://api.binance.com/api/v3
NEXT_PUBLIC_BINANCE_WS_URL=wss://stream.binance.com:9443
```

> **Note:** `COINGECKO_API_KEY` is required. You can get a free key from the CoinGecko Developer Portal.

### Running the App

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
