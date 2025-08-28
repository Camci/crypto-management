"use client"

import { useState, useEffect } from "react"
import { ArrowUpRight, ArrowDownRight, TrendingUp, Download, Upload } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, Tooltip, Legend } from "recharts"
import { getCoinIcon, getFallbackIcon, generateAssetAllocationData, generatePortfolioChartData, formatPrice, type PortfolioChartData } from "@/lib/api"

const portfolioValue = [
  { date: "Jan", value: 35000 },
  { date: "Feb", value: 38000 },
  { date: "Mar", value: 42000 },
  { date: "Apr", value: 45000 },
  { date: "May", value: 47892 },
]

const holdings = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    amount: 1.2847,
    value: 55482.31,
    price: 43247.89,
    change24h: 1.23,
    allocation: 58.1,
    color: "#f7931a",
    icon: "₿"
  },
  {
    symbol: "ETH",
    name: "Ethereum", 
    amount: 8.4521,
    value: 21527.43,
    price: 2547.32,
    change24h: -0.87,
    allocation: 22.5,
    color: "#627eea",
    icon: "Ξ"
  },
  {
    symbol: "USDT",
    name: "Tether",
    amount: 12449.67,
    value: 12449.67,
    price: 1.00,
    change24h: 0.00,
    allocation: 13.0,
    color: "#26a17b",
    icon: "₮"
  },
  {
    symbol: "BNB",
    name: "Binance Coin",
    amount: 19.8765,
    value: 6213.45,
    price: 312.45,
    change24h: 2.14,
    allocation: 6.5,
    color: "#f3ba2f",
    icon: "⬡"
  }
]

const transactions = [
  { type: "BUY", asset: "BTC", amount: 0.0249, price: 43120, value: 1073.69, date: "2024-01-15", time: "14:32", status: "Completed" },
  { type: "SELL", asset: "ETH", amount: 1.5, price: 2551, value: 3826.50, date: "2024-01-15", time: "12:45", status: "Completed" },
  { type: "BUY", asset: "BNB", amount: 12, price: 311.45, value: 3737.40, date: "2024-01-14", time: "16:20", status: "Completed" },
  { type: "DEPOSIT", asset: "USDT", amount: 5000, price: 1.00, value: 5000.00, date: "2024-01-14", time: "09:15", status: "Completed" },
  { type: "SELL", asset: "SOL", amount: 25, price: 98.76, value: 2469.00, date: "2024-01-13", time: "11:30", status: "Completed" },
]



export default function PortfolioPage() {
  const [timeframe, setTimeframe] = useState<'7D' | '1M' | '3M' | '1Y'>("1M")
  const [portfolioChartData, setPortfolioChartData] = useState<PortfolioChartData[]>([])
  
  const totalValue = holdings.reduce((sum, holding) => sum + holding.value, 0)
  const totalChange24h = holdings.reduce((sum, holding) => sum + (holding.value * holding.change24h / 100), 0)
  const totalChangePercent = (totalChange24h / totalValue) * 100

  // Portfolio holdings amounts
  const portfolioHoldings = {
    btc: holdings[0].amount,
    eth: holdings[1].amount,
    usdt: holdings[2].amount
  }

  // Generate portfolio performance data when timeframe changes
  useEffect(() => {
    const newChartData = generatePortfolioChartData(
      portfolioHoldings.btc,
      portfolioHoldings.eth,
      portfolioHoldings.usdt,
      holdings[0].price, // BTC price
      holdings[1].price, // ETH price
      timeframe
    )
    setPortfolioChartData(newChartData)
  }, [timeframe])

  // Generate dynamic allocation data
  const allocationData = generateAssetAllocationData(
    holdings[0].amount, // BTC
    holdings[1].amount, // ETH  
    holdings[2].amount, // USDT
    holdings[3].amount, // BNB
    holdings[0].price,  // BTC price
    holdings[1].price,  // ETH price
    holdings[2].price,  // USDT price
    holdings[3].price   // BNB price
  )



  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up delay-100">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Portfolio</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage and track your cryptocurrency investments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="cursor-pointer text-xs md:text-sm">
            <Download className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
            Export
          </Button>
          <Button className="cursor-pointer text-xs md:text-sm">
            <Upload className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
            Deposit
          </Button>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 animate-fade-in-up delay-200">
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Total Balance</CardTitle>
            <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">${totalValue.toLocaleString()}</div>
            <div className={`flex items-center text-xs ${totalChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalChangePercent >= 0 ? (
                <ArrowUpRight className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 mr-1" />
              )}
              {totalChangePercent >= 0 ? '+' : ''}{totalChangePercent.toFixed(2)}% (24h)
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">24h Change</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-xl md:text-2xl font-bold ${totalChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalChange24h >= 0 ? '+' : ''}${Math.abs(totalChange24h).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              {totalChangePercent >= 0 ? '+' : ''}{totalChangePercent.toFixed(2)}%
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{holdings.length}</div>
            <div className="text-xs text-muted-foreground">Different cryptocurrencies</div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-md sm:col-span-2 md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Best Performer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">BNB</div>
            <div className="text-xs text-green-600">+2.14% (24h)</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-3 animate-fade-in-up delay-300">
        {/* Portfolio Chart */}
        <Card className="lg:col-span-2 transition-all duration-200 hover:shadow-md">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-lg md:text-xl">Portfolio Performance</CardTitle>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                  <span className="text-xl md:text-2xl font-bold">
                    ${totalValue.toLocaleString()}
                  </span>
                  <span className={`text-xs md:text-sm ${totalChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {totalChangePercent >= 0 ? '+' : ''}{totalChangePercent.toFixed(2)}% (24h)
                  </span>
                </div>
              </div>
              <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as any)}>
                <TabsList className="grid grid-cols-4 w-full sm:w-auto">
                  <TabsTrigger value="7D" className="cursor-pointer text-xs md:text-sm">7D</TabsTrigger>
                  <TabsTrigger value="1M" className="cursor-pointer text-xs md:text-sm">1M</TabsTrigger>
                  <TabsTrigger value="3M" className="cursor-pointer text-xs md:text-sm">3M</TabsTrigger>
                  <TabsTrigger value="1Y" className="cursor-pointer text-xs md:text-sm">1Y</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <AreaChart data={portfolioChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="time" className="text-xs" tick={{ fontSize: 10 }} />
                <YAxis 
                  className="text-xs" 
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => `$${formatPrice(value)}`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const totalValue = payload[0].value as number
                      const btcValue = payload.find(p => p.dataKey === 'btc')?.value as number || 0
                      const ethValue = payload.find(p => p.dataKey === 'eth')?.value as number || 0
                      const usdtValue = portfolioHoldings.usdt
                      
                      return (
                        <div className="bg-background border rounded-lg p-2 md:p-3 shadow-lg">
                          <p className="text-xs md:text-sm font-medium mb-2">{label}</p>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-2 md:gap-4">
                              <span className="text-xs md:text-sm">Total Portfolio:</span>
                              <span className="font-bold text-xs md:text-sm">${totalValue.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between gap-2 md:gap-4">
                              <div className="flex items-center gap-1 md:gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#f7931a]" />
                                <span className="text-xs">BTC:</span>
                              </div>
                              <span className="text-xs">${btcValue.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between gap-2 md:gap-4">
                              <div className="flex items-center gap-1 md:gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#627eea]" />
                                <span className="text-xs">ETH:</span>
                              </div>
                              <span className="text-xs">${ethValue.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between gap-2 md:gap-4">
                              <div className="flex items-center gap-1 md:gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#26a17b]" />
                                <span className="text-xs">USDT:</span>
                              </div>
                              <span className="text-xs">${usdtValue.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary))" 
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="btc" 
                  stackId="1"
                  stroke="#f7931a" 
                  fill="#f7931a" 
                  fillOpacity={0.3}
                  strokeWidth={1}
                />
                <Area 
                  type="monotone" 
                  dataKey="eth" 
                  stackId="1"
                  stroke="#627eea" 
                  fill="#627eea" 
                  fillOpacity={0.3}
                  strokeWidth={1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Asset Allocation */}
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-background border rounded-lg p-2 shadow-lg">
                            <p className="text-xs font-medium">{data.name}</p>
                            <p className="text-xs text-muted-foreground">
                              ${data.value.toLocaleString()} ({data.percentage.toFixed(1)}%)
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-2">
              {allocationData.map((asset, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: asset.color }}
                    />
                    <span className="text-xs md:text-sm font-medium">{asset.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs md:text-sm font-medium">${asset.value.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">{asset.percentage.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2 animate-fade-in-up delay-400">
        {/* Holdings */}
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Holdings</CardTitle>
            <CardDescription className="text-sm">Your cryptocurrency assets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 md:space-y-4">
              {holdings.map((holding, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 md:gap-3 min-w-0">
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-muted flex items-center justify-center text-xs md:text-sm font-bold">
                      {holding.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-sm md:text-base truncate">{holding.name}</div>
                      <div className="text-xs md:text-sm text-muted-foreground">
                        {holding.amount.toLocaleString()} {holding.symbol}
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-2">
                    <div className="font-medium text-sm md:text-base">
                      ${holding.value.toLocaleString()}
                    </div>
                    <div className={`text-xs md:text-sm flex items-center ${
                      holding.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {holding.change24h >= 0 ? (
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 mr-1" />
                      )}
                      {holding.change24h >= 0 ? '+' : ''}{holding.change24h.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Recent Transactions</CardTitle>
            <CardDescription className="text-sm">Your latest trading activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 md:space-y-4">
              {transactions.slice(0, 5).map((transaction, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 md:gap-3 min-w-0">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      transaction.type === 'BUY' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                      transaction.type === 'SELL' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                    }`}>
                      {transaction.type}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-sm md:text-base truncate">{transaction.amount} {transaction.asset}</div>
                      <div className="text-xs md:text-sm text-muted-foreground">at ${transaction.price.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="text-right ml-2">
                    <div className="font-medium text-sm md:text-base">
                      ${transaction.value.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {transaction.date} {transaction.time}
                    </div>
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
