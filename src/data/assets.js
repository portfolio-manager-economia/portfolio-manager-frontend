/**
 * Catálogo de activos predefinidos válidos con sus tickers oficiales para Yahoo Finance.
 */

export const ASSET_CATALOG = [
  // CEDEARs (Mercado Argentino en Pesos/CCL)
  { ticker: "AAPL.BA", name: "Apple Inc. (CEDEAR)", type: "cedear", category: "CEDEARs" },
  { ticker: "MSFT.BA", name: "Microsoft (CEDEAR)", type: "cedear", category: "CEDEARs" },
  { ticker: "GOOGL.BA", name: "Alphabet / Google (CEDEAR)", type: "cedear", category: "CEDEARs" },
  { ticker: "AMZN.BA", name: "Amazon (CEDEAR)", type: "cedear", category: "CEDEARs" },
  { ticker: "TSLA.BA", name: "Tesla (CEDEAR)", type: "cedear", category: "CEDEARs" },
  { ticker: "NVDA.BA", name: "Nvidia (CEDEAR)", type: "cedear", category: "CEDEARs" },
  { ticker: "MELI.BA", name: "Mercado Libre (CEDEAR)", type: "cedear", category: "CEDEARs" },
  { ticker: "KO.BA", name: "Coca-Cola (CEDEAR)", type: "cedear", category: "CEDEARs" },
  { ticker: "SPY.BA", name: "S&P 500 ETF (CEDEAR)", type: "cedear", category: "CEDEARs" },
  { ticker: "QQQ.BA", name: "Nasdaq 100 ETF (CEDEAR)", type: "cedear", category: "CEDEARs" },
  { ticker: "VIST.BA", name: "Vista Energy (CEDEAR)", type: "cedear", category: "CEDEARs" },

  // Acciones Argentinas (Merval / BYMA)
  { ticker: "GGAL.BA", name: "Grupo Financiero Galicia", type: "stock", category: "Acciones Arg (Merval)" },
  { ticker: "YPFD.BA", name: "YPF S.A.", type: "stock", category: "Acciones Arg (Merval)" },
  { ticker: "PAMP.BA", name: "Pampa Energía", type: "stock", category: "Acciones Arg (Merval)" },
  { ticker: "BMA.BA", name: "Banco Macro", type: "stock", category: "Acciones Arg (Merval)" },
  { ticker: "ALUA.BA", name: "Aluar Aluminio Argentino", type: "stock", category: "Acciones Arg (Merval)" },
  { ticker: "TXAR.BA", name: "Ternium Argentina", type: "stock", category: "Acciones Arg (Merval)" },

  // Acciones Internacionales (EE.UU.)
  { ticker: "AAPL", name: "Apple Inc. (NASDAQ)", type: "stock", category: "Acciones USA" },
  { ticker: "MSFT", name: "Microsoft Corp (NASDAQ)", type: "stock", category: "Acciones USA" },
  { ticker: "GOOGL", name: "Alphabet Class A (NASDAQ)", type: "stock", category: "Acciones USA" },
  { ticker: "AMZN", name: "Amazon.com Inc (NASDAQ)", type: "stock", category: "Acciones USA" },
  { ticker: "TSLA", name: "Tesla Inc (NASDAQ)", type: "stock", category: "Acciones USA" },
  { ticker: "NVDA", name: "NVIDIA Corp (NASDAQ)", type: "stock", category: "Acciones USA" },
  { ticker: "SPY", name: "SPDR S&P 500 ETF", type: "stock", category: "Acciones USA" },
  { ticker: "QQQ", name: "Invesco QQQ ETF", type: "stock", category: "Acciones USA" },

  // Bonos Soberanos Argentinos
  { ticker: "AL30D.BA", name: "Bono Bonar 2030 (AL30 USD)", type: "bond", category: "Bonos Soberanos" },
  { ticker: "GD30D.BA", name: "Bono Global 2030 (GD30 USD)", type: "bond", category: "Bonos Soberanos" },

  // Criptomonedas
  { ticker: "BTC-USD", name: "Bitcoin (BTC)", type: "crypto", category: "Criptomonedas" },
  { ticker: "ETH-USD", name: "Ethereum (ETH)", type: "crypto", category: "Criptomonedas" },
  { ticker: "SOL-USD", name: "Solana (SOL)", type: "crypto", category: "Criptomonedas" },
];

export const PRESET_PORTFOLIOS = [
  {
    name: "Cartera Tecnológica USA",
    tickers: ["AAPL", "MSFT", "GOOGL", "NVDA"],
  },
  {
    name: "CEDEARs Diversificados (Argentina)",
    tickers: ["SPY.BA", "AAPL.BA", "MELI.BA", "KO.BA"],
  },
  {
    name: "Merval Argentina Líderes",
    tickers: ["GGAL.BA", "YPFD.BA", "PAMP.BA", "BMA.BA"],
  },
  {
    name: "Mixta Conservadora (Acciones + Bonos)",
    tickers: ["SPY.BA", "KO.BA", "AL30D.BA"],
  },
  {
    name: "Cripto & Tech Crecimiento",
    tickers: ["BTC-USD", "ETH-USD", "NVDA", "AAPL"],
  },
];

