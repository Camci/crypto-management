"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowUpRight, ArrowDownRight, Volume2, TrendingUp, Activity } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"
import { TradingCalculator } from "@/components/trading-calculator"
import { PageLoadingSkeleton } from "@/components/loading-skeleton"
import { getCoinById, formatPrice, formatNumber, getCoinIcon, getFallbackIcon, generatePriceChartData, type CoinData, type ChartDataPoint } from "@/lib/api"

const orderBookData = {
  asks: [
    { price: 43252.89, amount: 0.1245, total: 0.1245 },
    { price: 43251.45, amount: 0.0876, total: 0.2121 },
    { price: 43250.12, amount: 0.2341, total: 0.4462 },
    { price: 43249.78, amount: 0.1567, total: 0.6029 },
    { price: 43248.34, amount: 0.0923, total: 0.6952 },
  ],
  bids: [
    { price: 43247.89, amount: 0.1876, total: 0.1876 },
    { price: 43246.23, amount: 0.2134, total: 0.4010 },
    { price: 43245.67, amount: 0.0987, total: 0.4997 },
    { price: 43244.12, amount: 0.1654, total: 0.6651 },
    { price: 43243.45, amount: 0.2387, total: 0.9038 },
  ]
}

const recentTrades = [
  { price: 43247.89, amount: 0.0234, time: "14:32:45", type: "buy" },
  { price: 43246.12, amount: 0.1876, time: "14:32:44", type: "sell" },
  { price: 43248.34, amount: 0.0567, time: "14:32:43", type: "buy" },
  { price: 43245.78, amount: 0.2341, time: "14:32:42", type: "sell" },
  { price: 43249.12, amount: 0.0987, time: "14:32:41", type: "buy" },
]

const openOrders = [
  { type: "LIMIT", side: "BUY", amount: "0.1", price: "43,000.00", filled: "0%", status: "OPEN" },
  { type: "STOP", side: "SELL", amount: "0.05", price: "44,000.00", filled: "0%", status: "OPEN" },
  { type: "LIMIT", side: "BUY", amount: "0.2", price: "42,500.00", filled: "25%", status: "PARTIAL" },
]

export default function TradingPage() {
  const searchParams = useSearchParams()
  const [orderType, setOrderType] = useState("limit")
  const [side, setSide] = useState("buy")
  const [coinData, setCoinData] = useState<CoinData | null>(null)
  const [loading, setLoading] = useState(true)
  const [chartTimeframe, setChartTimeframe] = useState<'1m' | '5m' | '15m' | '1h' | '4h' | '1d'>('1h')
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])

  // Get coin ID and symbol from URL params or default to Bitcoin
  const coinId = searchParams.get('coinId') || 'btc-bitcoin'
  const coinSymbol = searchParams.get('symbol') || 'BTC'

  // Load coin data based on URL params
  useEffect(() => {
    const loadCoinData = async () => {
      setLoading(true)
      const data = await getCoinById(coinId)
      setCoinData(data)
      setLoading(false)
    }
    
    loadCoinData()
    const interval = setInterval(loadCoinData, 10000) // Update every 10 seconds
    return () => clearInterval(interval)
  }, [coinId])

  // Generate chart data when coin data or timeframe changes
  useEffect(() => {
    if (coinData) {
      const newChartData = generatePriceChartData(
        coinData.quotes.USD.price,
        chartTimeframe,
        chartTimeframe === '1m' ? 60 : chartTimeframe === '5m' ? 50 : 48
      )
      setChartData(newChartData)
    }
  }, [coinData, chartTimeframe])

  if (loading) {
    return (
      <PageLoadingSkeleton 
        title="Trading" 
        description="Advanced cryptocurrency trading interface" 
      />
    )
  }

  const currentPrice = coinData?.quotes.USD.price || 43247.89
  const priceChange = coinData?.quotes.USD.percent_change_24h || 1.23
  const volume24h = coinData?.quotes.USD.volume_24h || 28456789123
  const high24h = currentPrice * 1.02
  const low24h = currentPrice * 0.98
  const coinName = coinData?.name || 'Bitcoin'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in-up delay-100">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trading</h1>
          <p className="text-muted-foreground">Advanced cryptocurrency trading interface</p>
        </div>
        <div className="flex items-center gap-2">
          <img
            src={getCoinIcon(coinSymbol)}
            alt={coinName}
            className="w-8 h-8 rounded-full"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = getFallbackIcon(coinSymbol)
            }}
          />
          <span className="text-lg font-medium">{coinSymbol}/USDT</span>
        </div>
      </div>

      {/* Trading Pair Info */}
      <Card className="transition-all duration-200 hover:shadow-md animate-fade-in-up delay-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <img
                  src={getCoinIcon(coinSymbol)}
                  alt={coinName}
                  className="w-10 h-10 rounded-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = getFallbackIcon(coinSymbol)
                  }}
                />
                <div>
                  <h2 className="text-2xl font-bold">{coinSymbol}/USDT</h2>
                  <p className="text-sm text-muted-foreground">{coinName} / Tether</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold">
                  ${formatPrice(currentPrice)}
                </span>
                <div className={`flex items-center ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {priceChange >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  <span>{priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%</span>
                </div>
              </div>
            </div>
            <div className="flex gap-8 text-sm">
              <div>
                <p className="text-muted-foreground">24h High</p>
                <p className="font-medium">${formatPrice(high24h)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">24h Low</p>
                <p className="font-medium">${formatPrice(low24h)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">24h Volume</p>
                <p className="font-medium">{formatNumber(volume24h / currentPrice)} {coinSymbol}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-4 animate-fade-in-up delay-300">
        {/* Chart */}
        <Card className="lg:col-span-2 transition-all duration-200 hover:shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Price Chart</CardTitle>
              <Tabs value={chartTimeframe} onValueChange={(value) => setChartTimeframe(value as any)} className="w-auto">
                <TabsList>
                  <TabsTrigger value="1m" className="cursor-pointer">1m</TabsTrigger>
                  <TabsTrigger value="5m" className="cursor-pointer">5m</TabsTrigger>
                  <TabsTrigger value="15m" className="cursor-pointer">15m</TabsTrigger>
                  <TabsTrigger value="1h" className="cursor-pointer">1h</TabsTrigger>
                  <TabsTrigger value="4h" className="cursor-pointer">4h</TabsTrigger>
                  <TabsTrigger value="1d" className="cursor-pointer">1d</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={384}>
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} />
                <XAxis 
                  dataKey="time" 
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                  domain={['dataMin - 100', 'dataMax + 100']}
                  tickFormatter={(value) => `$${formatPrice(value)}`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const value = payload[0].value as number
                      const changeFromStart = chartData.length > 0 ? 
                        ((value - chartData[0].value) / chartData[0].value) * 100 : 0
                      return (
                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                          <p className="text-sm font-medium">{label}</p>
                          <p className="text-lg font-bold">
                            ${formatPrice(value)}
                          </p>
                          <p className={`text-sm ${changeFromStart >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {changeFromStart >= 0 ? '+' : ''}{changeFromStart.toFixed(2)}%
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ 
                    r: 6, 
                    stroke: '#10b981', 
                    strokeWidth: 3, 
                    fill: '#ffffff'
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Book */}
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle>Order Book</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {/* Asks */}
              <div className="px-6 pb-2">
                <div className="grid grid-cols-3 text-xs text-muted-foreground mb-2">
                  <span>Price (USDT)</span>
                  <span className="text-right">Amount (BTC)</span>
                  <span className="text-right">Total</span>
                </div>
                {orderBookData.asks.reverse().map((ask, index) => (
                  <div key={index} className="grid grid-cols-3 text-xs py-0.5 hover:bg-muted/50 transition-colors cursor-pointer">
                    <span className="text-red-600">{ask.price.toLocaleString()}</span>
                    <span className="text-right">{ask.amount.toFixed(4)}</span>
                    <span className="text-right text-muted-foreground">{ask.total.toFixed(4)}</span>
                  </div>
                ))}
              </div>
              
              {/* Spread */}
              <div className="px-6 py-2 bg-muted/30 border-y">
                <div className="text-center">
                  <span className="text-sm font-medium">$43,247.89</span>
                  <span className="text-xs text-muted-foreground ml-2">Spread: $5.00</span>
                </div>
              </div>

              {/* Bids */}
              <div className="px-6 pt-2">
                {orderBookData.bids.map((bid, index) => (
                  <div key={index} className="grid grid-cols-3 text-xs py-0.5 hover:bg-muted/50 transition-colors cursor-pointer">
                    <span className="text-green-600">{bid.price.toLocaleString()}</span>
                    <span className="text-right">{bid.amount.toFixed(4)}</span>
                    <span className="text-right text-muted-foreground">{bid.total.toFixed(4)}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trading Panel */}
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle>Place Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={side} onValueChange={setSide} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="buy" className="text-green-600 cursor-pointer">Buy</TabsTrigger>
                <TabsTrigger value="sell" className="text-red-600 cursor-pointer">Sell</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-2">
              <label className="text-sm font-medium">Order Type</label>
              <Select value={orderType} onValueChange={setOrderType}>
                <SelectTrigger className="cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="market" className="cursor-pointer">Market</SelectItem>
                  <SelectItem value="limit" className="cursor-pointer">Limit</SelectItem>
                  <SelectItem value="stop" className="cursor-pointer">Stop Loss</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <TradingCalculator
              currentPrice={currentPrice}
              baseCurrency={coinSymbol}
              quoteCurrency="USDT"
              side={side as "buy" | "sell"}
              orderType={orderType as "market" | "limit" | "stop"}
            />

            <Button 
              className={`w-full transition-all duration-200 hover:scale-105 cursor-pointer ${
                side === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {side === 'buy' ? `Buy ${coinSymbol}` : `Sell ${coinSymbol}`}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 animate-fade-in-up delay-500">
        {/* Recent Trades */}
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle>Recent Trades</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              <div className="grid grid-cols-3 text-xs text-muted-foreground px-6 pb-2">
                <span>Price (USDT)</span>
                <span className="text-right">Amount (BTC)</span>
                <span className="text-right">Time</span>
              </div>
              {recentTrades.map((trade, index) => (
                <div key={index} className="grid grid-cols-3 text-xs py-1 px-6 hover:bg-muted/50 transition-colors">
                  <span className={trade.type === 'buy' ? 'text-green-600' : 'text-red-600'}>
                    {trade.price.toLocaleString()}
                  </span>
                  <span className="text-right">{trade.amount.toFixed(4)}</span>
                  <span className="text-right text-muted-foreground">{trade.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Open Orders */}
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle>Open Orders</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              <div className="grid grid-cols-6 text-xs text-muted-foreground px-6 pb-2">
                <span>Type</span>
                <span>Side</span>
                <span>Amount</span>
                <span>Price</span>
                <span>Filled</span>
                <span>Action</span>
              </div>
              {openOrders.map((order, index) => (
                <div key={index} className="grid grid-cols-6 text-xs py-2 px-6 hover:bg-muted/50 items-center transition-colors">
                  <span>{order.type}</span>
                  <span className={order.side === 'BUY' ? 'text-green-600' : 'text-red-600'}>
                    {order.side}
                  </span>
                  <span>{order.amount} BTC</span>
                  <span>${order.price}</span>
                  <span>{order.filled}</span>
                  <Button variant="ghost" size="sm" className="text-red-600 h-6 px-2 cursor-pointer">
                    Cancel
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
