// CoinPaprika API integration for real cryptocurrency data
import fetch from 'cross-fetch'

const BASE_URL = 'https://api.coinpaprika.com/v1'

export interface CoinData {
  id: string
  name: string
  symbol: string
  rank: number
  total_supply: number
  max_supply: number
  beta_value: number
  first_data_at: string
  last_updated: string
  quotes: {
    USD: {
      price: number
      volume_24h: number
      volume_24h_change_24h: number
      market_cap: number
      market_cap_change_24h: number
      percent_change_15m: number
      percent_change_30m: number
      percent_change_1h: number
      percent_change_6h: number
      percent_change_12h: number
      percent_change_24h: number
      percent_change_7d: number
      percent_change_30d: number
      percent_change_1y: number
      ath_price: number
      ath_date: string
      percent_from_price_ath: number
    }
  }
}

export interface GlobalStats {
  market_cap_usd: number
  volume_24h_usd: number
  bitcoin_dominance_percentage: number
  cryptocurrencies_number: number
  market_cap_ath_value: number
  market_cap_ath_date: string
  volume_24h_ath_value: number
  volume_24h_ath_date: string
  market_cap_change_24h: number
  volume_24h_change_24h: number
  last_updated: number
}

export interface SimpleCoin {
  id: string
  name: string
  symbol: string
}

export interface ChartDataPoint {
  time: string
  value: number
  timestamp?: number
}

export interface PriceHistoryData {
  prices: [number, number][] // [timestamp, price]
}

export interface PortfolioChartData {
  time: string
  value: number
  btc: number
  eth: number
  usdt: number
}

// Get all coins (simplified)
export async function getAllCoins(): Promise<SimpleCoin[]> {
  try {
    const response = await fetch(`${BASE_URL}/coins`)
    if (!response.ok) {
      throw new Error(`Failed to fetch coins: ${response.status} ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching coins:', error)
    console.error('URL:', `${BASE_URL}/coins`)
    return []
  }
}

// Get specific coin data by ID
export async function getCoinById(coinId: string): Promise<CoinData | null> {
  try {
    const response = await fetch(`${BASE_URL}/tickers/${coinId}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch coin ${coinId}: ${response.status} ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error(`Error fetching coin ${coinId}:`, error)
    return null
  }
}

// Get multiple coins data with better error handling
export async function getCoinsData(coinIds: string[]): Promise<CoinData[]> {
  try {
    const promises = coinIds.map(async (id) => {
      try {
        const coin = await getCoinById(id)
        return coin
      } catch (error) {
        console.warn(`Failed to fetch coin ${id}, using fallback data`)
        // Return fallback data for known coins to prevent loading issues
        return getFallbackCoinData(id)
      }
    })
    const results = await Promise.all(promises)
    return results.filter(coin => coin !== null) as CoinData[]
  } catch (error) {
    console.error('Error fetching coins data:', error)
    // Return fallback data for all requested coins
    return coinIds.map(id => getFallbackCoinData(id)).filter(coin => coin !== null) as CoinData[]
  }
}

// Fallback data to prevent loading issues
function getFallbackCoinData(coinId: string): CoinData | null {
  const fallbackData: { [key: string]: Partial<CoinData> } = {
    'btc-bitcoin': {
      id: 'btc-bitcoin',
      name: 'Bitcoin',
      symbol: 'BTC',
      rank: 1,
      quotes: {
        USD: {
          price: 43247.89,
          volume_24h: 28456789123,
          volume_24h_change_24h: -1.2,
          market_cap: 847123456789,
          market_cap_change_24h: 2.4,
          percent_change_15m: 0.1,
          percent_change_30m: 0.2,
          percent_change_1h: 0.5,
          percent_change_6h: 1.1,
          percent_change_12h: 1.8,
          percent_change_24h: 1.23,
          percent_change_7d: 5.67,
          percent_change_30d: 12.34,
          percent_change_1y: 156.78,
          ath_price: 69000,
          ath_date: '2021-11-10T00:00:00Z',
          percent_from_price_ath: -37.3
        }
      }
    },
    'eth-ethereum': {
      id: 'eth-ethereum',
      name: 'Ethereum',
      symbol: 'ETH',
      rank: 2,
      quotes: {
        USD: {
          price: 2547.32,
          volume_24h: 15234567890,
          volume_24h_change_24h: -2.1,
          market_cap: 306789012345,
          market_cap_change_24h: -0.87,
          percent_change_15m: -0.1,
          percent_change_30m: -0.3,
          percent_change_1h: -0.2,
          percent_change_6h: -0.5,
          percent_change_12h: -0.8,
          percent_change_24h: -0.87,
          percent_change_7d: 3.45,
          percent_change_30d: 8.92,
          percent_change_1y: 89.12,
          ath_price: 4878.26,
          ath_date: '2021-11-10T00:00:00Z',
          percent_from_price_ath: -47.8
        }
      }
    },
    'usdt-tether': {
      id: 'usdt-tether',
      name: 'Tether',
      symbol: 'USDT',
      rank: 3,
      quotes: {
        USD: {
          price: 1.00,
          volume_24h: 45678901234,
          volume_24h_change_24h: 0.1,
          market_cap: 91234567890,
          market_cap_change_24h: 0.01,
          percent_change_15m: 0.0,
          percent_change_30m: 0.0,
          percent_change_1h: 0.0,
          percent_change_6h: 0.0,
          percent_change_12h: 0.0,
          percent_change_24h: 0.00,
          percent_change_7d: 0.02,
          percent_change_30d: 0.05,
          percent_change_1y: 0.12,
          ath_price: 1.32,
          ath_date: '2018-07-24T00:00:00Z',
          percent_from_price_ath: -24.2
        }
      }
    }
  }

  const data = fallbackData[coinId]
  if (!data) return null

  return {
    ...data,
    total_supply: 0,
    max_supply: 0,
    beta_value: 1,
    first_data_at: '2013-04-28T00:00:00Z',
    last_updated: new Date().toISOString()
  } as CoinData
}

// Get trending coins (using top coins by market cap as trending)
export async function getTrendingCoins(): Promise<CoinData[]> {
  try {
    const response = await fetch(`${BASE_URL}/tickers?limit=20`)
    if (!response.ok) {
      throw new Error(`Failed to fetch trending coins: ${response.status} ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching trending coins:', error)
    console.error('URL:', `${BASE_URL}/tickers?limit=20`)
    return []
  }
}

// Get top coins by market cap
export async function getTopCoins(limit: number = 100): Promise<CoinData[]> {
  try {
    const response = await fetch(`${BASE_URL}/tickers?limit=${limit}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch top coins: ${response.status} ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching top coins:', error)
    console.error('URL:', `${BASE_URL}/tickers?limit=${limit}`)
    return []
  }
}

// Get global market statistics
export async function getGlobalStats(): Promise<GlobalStats | null> {
  try {
    const response = await fetch(`${BASE_URL}/global`)
    if (!response.ok) {
      throw new Error(`Failed to fetch global stats: ${response.status} ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching global stats:', error)
    console.error('URL:', `${BASE_URL}/global`)
    return null
  }
}

// Search coins by name or symbol
export async function searchCoins(query: string, allCoins: SimpleCoin[]): Promise<SimpleCoin[]> {
  if (!query.trim()) return []
  
  const searchTerm = query.toLowerCase().trim()
  return allCoins.filter(coin => 
    coin.name.toLowerCase().includes(searchTerm) ||
    coin.symbol.toLowerCase().includes(searchTerm)
  ).slice(0, 10) // Limit to 10 results
}

// Format large numbers for display
export function formatNumber(num: number): string {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T'
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B'
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M'
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K'
  return num.toFixed(2)
}

// Format price with appropriate decimal places
export function formatPrice(price: number): string {
  if (price >= 1) return price.toFixed(2)
  if (price >= 0.01) return price.toFixed(4)
  if (price >= 0.0001) return price.toFixed(6)
  return price.toFixed(8)
}

// Get coin icon URL using CoinCap assets format
export function getCoinIcon(symbol: string): string {
  // CoinCap uses lowercase symbols for their asset icons
  return `https://assets.coincap.io/assets/icons/${symbol.toLowerCase()}@2x.png`
}

// Fallback icon generator using data URI
export function getFallbackIcon(symbol: string): string {
  const letter = symbol.charAt(0).toUpperCase()
  // Create a simple SVG data URI as fallback
  const svg = `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#6366f1"/>
    <text x="16" y="22" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14" font-weight="bold">${letter}</text>
  </svg>`
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

// Generate realistic price chart data for a coin
export function generatePriceChartData(
  currentPrice: number, 
  timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d' = '1h',
  points: number = 50
): ChartDataPoint[] {
  const data: ChartDataPoint[] = []
  const now = Date.now()
  
  // Define time intervals in milliseconds
  const intervals = {
    '1m': 60 * 1000,
    '5m': 5 * 60 * 1000,
    '15m': 15 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '4h': 4 * 60 * 60 * 1000,
    '1d': 24 * 60 * 60 * 1000
  }
  
  const interval = intervals[timeframe]
  let price = currentPrice * 0.95 // Start slightly lower
  
  for (let i = points; i >= 0; i--) {
    const timestamp = now - (i * interval)
    const date = new Date(timestamp)
    
    // Add some realistic price movement
    const volatility = currentPrice * 0.02 // 2% volatility
    const trend = (points - i) / points * 0.05 // Slight upward trend
    const randomChange = (Math.random() - 0.5) * volatility
    
    price = price * (1 + trend / points) + randomChange
    
    // Format time based on timeframe
    let timeLabel: string
    if (timeframe === '1d') {
      timeLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } else if (timeframe === '4h' || timeframe === '1h') {
      timeLabel = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    } else {
      timeLabel = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    }
    
    data.push({
      time: timeLabel,
      value: Math.max(price, currentPrice * 0.8), // Don't go below 80% of current price
      timestamp
    })
  }
  
  // Ensure the last point is close to current price
  data[data.length - 1].value = currentPrice
  
  return data
}

// Generate portfolio performance data
export function generatePortfolioChartData(
  btcAmount: number,
  ethAmount: number, 
  usdtAmount: number,
  btcPrice: number,
  ethPrice: number,
  timeframe: '7D' | '1M' | '3M' | '1Y' = '1M'
): PortfolioChartData[] {
  const data: PortfolioChartData[] = []
  const now = Date.now()
  
  // Define periods
  const periods = {
    '7D': { days: 7, points: 7 },
    '1M': { days: 30, points: 30 },
    '3M': { days: 90, points: 30 },
    '1Y': { days: 365, points: 52 }
  }
  
  const { days, points } = periods[timeframe]
  const interval = (days * 24 * 60 * 60 * 1000) / points
  
  for (let i = points; i >= 0; i--) {
    const timestamp = now - (i * interval)
    const date = new Date(timestamp)
    const daysAgo = i * (days / points)
    
    // Simulate historical prices with some realistic movement
    const btcHistoricalPrice = btcPrice * (1 - daysAgo * 0.001 + Math.sin(daysAgo * 0.1) * 0.05)
    const ethHistoricalPrice = ethPrice * (1 - daysAgo * 0.0015 + Math.cos(daysAgo * 0.08) * 0.06)
    
    const btcValue = btcAmount * btcHistoricalPrice
    const ethValue = ethAmount * ethHistoricalPrice
    const totalValue = btcValue + ethValue + usdtAmount
    
    let timeLabel: string
    if (timeframe === '1Y') {
      timeLabel = date.toLocaleDateString('en-US', { month: 'short' })
    } else if (timeframe === '3M') {
      timeLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } else {
      timeLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
    
    data.push({
      time: timeLabel,
      value: totalValue,
      btc: btcValue,
      eth: ethValue,
      usdt: usdtAmount
    })
  }
  
  return data
}

// Generate asset allocation data for pie chart
export function generateAssetAllocationData(
  btcAmount: number,
  ethAmount: number,
  usdtAmount: number,
  bnbAmount: number,
  btcPrice: number,
  ethPrice: number,
  usdtPrice: number = 1,
  bnbPrice: number
) {
  const btcValue = btcAmount * btcPrice
  const ethValue = ethAmount * ethPrice
  const usdtValue = usdtAmount * usdtPrice
  const bnbValue = bnbAmount * bnbPrice
  const totalValue = btcValue + ethValue + usdtValue + bnbValue
  
  return [
    {
      name: 'Bitcoin',
      symbol: 'BTC',
      value: btcValue,
      percentage: (btcValue / totalValue) * 100,
      amount: btcAmount,
      price: btcPrice,
      color: '#f7931a'
    },
    {
      name: 'Ethereum',
      symbol: 'ETH', 
      value: ethValue,
      percentage: (ethValue / totalValue) * 100,
      amount: ethAmount,
      price: ethPrice,
      color: '#627eea'
    },
    {
      name: 'Tether',
      symbol: 'USDT',
      value: usdtValue,
      percentage: (usdtValue / totalValue) * 100,
      amount: usdtAmount,
      price: usdtPrice,
      color: '#26a17b'
    },
    {
      name: 'Binance Coin',
      symbol: 'BNB',
      value: bnbValue,
      percentage: (bnbValue / totalValue) * 100,
      amount: bnbAmount,
      price: bnbPrice,
      color: '#f3ba2f'
    }
  ].sort((a, b) => b.value - a.value) // Sort by value descending
}
