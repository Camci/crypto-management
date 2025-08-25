"use client"

import { useState, useEffect } from "react"
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area, Tooltip } from "recharts"
import { TradingCalculator } from "@/components/trading-calculator"
import { PageLoadingSkeleton } from "@/components/loading-skeleton"
import { getCoinsData, formatPrice, getCoinIcon, getFallbackIcon, type CoinData } from "@/lib/api"

const portfolioData = [
  { time: "00:00", value: 42800 },
  { time: "04:00", value: 42900 },
  { time: "08:00", value: 43200 },
  { time: "12:00", value: 43300 },
  { time: "16:00", value: 43247 },
  { time: "20:00", value: 43400 },
  { time: "24:00", value: 43247 },
]

const cryptoAssets = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    price: 43247.89,
    change: 1.23,
    value: 55482.31,
    amount: "1.2847 BTC",
    icon: "₿",
    color: "text-orange-500"
  },
  {
    symbol: "ETH", 
    name: "Ethereum",
    price: 2547.32,
    change: -0.87,
    value: 21527.43,
    amount: "8.4521 ETH",
    icon: "Ξ",
    color: "text-blue-500"
  },
  {
    symbol: "USDT",
    name: "Tether",
    price: 1.00,
    change: 0.00,
    value: 12449.67,
    amount: "12,449.67 USDT",
    icon: "₮",
    color: "text-green-500"
  }
]

const recentOrders = [
  { type: "BUY", asset: "BTC", amount: "0.0249", price: "$43,120", time: "2m ago", status: "completed" },
  { type: "SELL", asset: "ETH", amount: "1.5", price: "$2,551", time: "5m ago", status: "completed" },
  { type: "BUY", asset: "BNB", amount: "12", price: "$311.45", time: "1h ago", status: "completed" },
]

export default function Dashboard() {
  const [cryptoData, setCryptoData] = useState<CoinData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCoin, setSelectedCoin] = useState("btc-bitcoin")

  // Load real cryptocurrency data
  useEffect(() => {
    const loadCryptoData = async () => {
      setLoading(true)
      const coins = await getCoinsData(['btc-bitcoin', 'eth-ethereum', 'usdt-tether'])
      setCryptoData(coins)
      setLoading(false)
    }
    
    loadCryptoData()
    // Refresh data every 30 seconds
    const interval = setInterval(loadCryptoData, 30000)
    return () => clearInterval(interval)
  }, [])

  const btcData = cryptoData.find(coin => coin.id === 'btc-bitcoin')
  const ethData = cryptoData.find(coin => coin.id === 'eth-ethereum')
  const usdtData = cryptoData.find(coin => coin.id === 'usdt-tether')

  // Portfolio holdings
  const portfolioHoldings = {
    btc: 1.2847,
    eth: 8.4521,
    usdt: 12449.67
  }

  if (loading) {
    return (
      <PageLoadingSkeleton 
        title="Dashboard" 
        description="Welcome to your crypto dashboard" 
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in-up delay-100">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your crypto dashboard</p>
        </div>
      </div>

      {/* Portfolio Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="transition-all duration-200 hover:shadow-md animate-fade-in-up delay-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${((btcData?.quotes.USD.price || 0) * 1.2847 + (ethData?.quotes.USD.price || 0) * 8.4521 + 12449.67).toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +2.4% (24h)
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-md animate-fade-in-up delay-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">24h Change</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +$1,147.82
            </div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +2.45%
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-md animate-fade-in-up delay-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $12,449.67
            </div>
            <div className="text-xs text-muted-foreground">For trading</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Trading Tips & Wallet Decisions */}
        <Card className="lg:col-span-2 transition-all duration-200 hover:shadow-md animate-fade-in-up delay-300">
          <CardHeader>
            <CardTitle>💡 Trading Tips & Wallet Decisions</CardTitle>
            <CardDescription>Smart insights for your crypto portfolio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Market Analysis */}
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">Market Analysis</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    BTC is showing strong support at $43,000. Consider accumulating on dips below this level.
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                      Confidence: High
                    </span>
                    <span className="text-xs text-blue-600 dark:text-blue-400">
                      Based on technical analysis
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Portfolio Recommendation */}
            <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <ArrowUpRight className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-green-900 dark:text-green-100">Portfolio Rebalancing</h4>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    Your BTC allocation is 58%. Consider taking some profits and diversifying into ETH or stablecoins.
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      Rebalance Now
                    </Button>
                    <span className="text-xs text-green-600 dark:text-green-400">
                      Recommended: 50% BTC, 30% ETH, 20% USDT
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Management */}
            <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                  <TrendingDown className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-amber-900 dark:text-amber-100">Risk Management</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    Set stop-losses at 5% below current prices. Your portfolio shows high volatility exposure.
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      Set Stop Loss
                    </Button>
                    <span className="text-xs text-amber-600 dark:text-amber-400">
                      Protect your gains
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* DCA Strategy */}
            <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <ArrowDownRight className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-purple-900 dark:text-purple-100">DCA Strategy</h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                    Consider setting up weekly $500 DCA orders. Market conditions favor regular accumulation.
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      Setup DCA
                    </Button>
                    <span className="text-xs text-purple-600 dark:text-purple-400">
                      Automate your strategy
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Quick Actions</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-8 text-xs">
                    📊 View Full Analysis
                  </Button>
                  <Button size="sm" className="h-8 text-xs">
                    🎯 Execute Strategy
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Trade */}
        <Card className="transition-all duration-200 hover:shadow-md animate-fade-in-up delay-500">
          <CardHeader>
            <CardTitle>Quick Trade</CardTitle>
            <CardDescription>Buy or sell cryptocurrencies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="buy" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="buy" className="cursor-pointer">Buy</TabsTrigger>
                <TabsTrigger value="sell" className="cursor-pointer">Sell</TabsTrigger>
              </TabsList>
              <TabsContent value="buy" className="space-y-4">
                <TradingCalculator
                  currentPrice={btcData?.quotes.USD.price || 43247.89}
                  baseCurrency="BTC"
                  quoteCurrency="USDT"
                  side="buy"
                  orderType="market"
                />
                <Button className="w-full bg-green-600 hover:bg-green-700 transition-all duration-200 hover:scale-105 cursor-pointer">
                  Buy BTC
                </Button>
              </TabsContent>
              <TabsContent value="sell" className="space-y-4">
                <TradingCalculator
                  currentPrice={btcData?.quotes.USD.price || 43247.89}
                  baseCurrency="BTC"
                  quoteCurrency="USDT"
                  side="sell"
                  orderType="market"
                />
                <Button className="w-full bg-red-600 hover:bg-red-700 transition-all duration-200 hover:scale-105 cursor-pointer">
                  Sell BTC
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Portfolio Holdings */}
        <Card className="transition-all duration-200 hover:shadow-md animate-fade-in-up delay-600">
          <CardHeader>
            <CardTitle>Portfolio</CardTitle>
            <CardDescription>Your cryptocurrency holdings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { data: btcData, amount: 1.2847, name: "Bitcoin" },
                { data: ethData, amount: 8.4521, name: "Ethereum" },
                { data: usdtData, amount: 12449.67, name: "Tether" }
              ].map((asset, index) => asset.data && (
                <div key={asset.data.symbol} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={getCoinIcon(asset.data.symbol)}
                      alt={asset.name}
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = getFallbackIcon(asset?.data?.symbol || '')
                      }}
                    />
                    <div>
                      <div className="font-medium">{asset.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {asset.amount.toLocaleString()} {asset.data.symbol}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      ${(asset.data.quotes.USD.price * asset.amount).toLocaleString()}
                    </div>
                    <div className={`text-sm flex items-center ${
                      asset.data.quotes.USD.percent_change_24h >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {asset.data.quotes.USD.percent_change_24h >= 0 ? (
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 mr-1" />
                      )}
                      {asset.data.quotes.USD.percent_change_24h >= 0 ? '+' : ''}
                      {asset.data.quotes.USD.percent_change_24h.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="transition-all duration-200 hover:shadow-md animate-fade-in-up delay-600">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your latest trading activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      order.type === 'BUY' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {order.type}
                    </div>
                    <div>
                      <div className="font-medium">{order.amount} {order.asset}</div>
                      <div className="text-sm text-muted-foreground">at {order.price}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">{order.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
