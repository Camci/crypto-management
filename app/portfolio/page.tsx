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
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in-up delay-100">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
          <p className="text-muted-foreground">Manage and track your cryptocurrency investments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="cursor-pointer">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button className="cursor-pointer">
            <Upload className="h-4 w-4 mr-2" />
            Deposit
          </Button>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="grid gap-6 md:grid-cols-4 animate-fade-in-up delay-200">
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
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
            <CardTitle className="text-sm font-medium">24h Change</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalChange24h >= 0 ? '+' : ''}${Math.abs(totalChange24h).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              {totalChangePercent >= 0 ? '+' : ''}{totalChangePercent.toFixed(2)}%
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{holdings.length}</div>
            <div className="text-xs text-muted-foreground">Different cryptocurrencies</div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Performer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">BNB</div>
            <div className="text-xs text-green-600">+2.14% (24h)</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 animate-fade-in-up delay-300">
        {/* Portfolio Chart */}
        <Card className="lg:col-span-2 transition-all duration-200 hover:shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Portfolio Performance</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-bold">
                    ${totalValue.toLocaleString()}
                  </span>
                  <span className={`text-sm ${totalChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {totalChangePercent >= 0 ? '+' : ''}{totalChangePercent.toFixed(2)}% (24h)
                  </span>
                </div>
              </div>
              <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as any)}>
                <TabsList>
                  <TabsTrigger value="7D" className="cursor-pointer">7D</TabsTrigger>
                  <TabsTrigger value="1M" className="cursor-pointer">1M</TabsTrigger>
                  <TabsTrigger value="3M" className="cursor-pointer">3M</TabsTrigger>
                  <TabsTrigger value="1Y" className="cursor-pointer">1Y</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={portfolioChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="time" className="text-xs" tick={{ fontSize: 12 }} />
                <YAxis 
                  className="text-xs" 
                  tick={{ fontSize: 12 }}
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
                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                          <p className="text-sm font-medium mb-2">{label}</p>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-sm">Total Portfolio:</span>
                              <span className="font-bold">${totalValue.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#f7931a]" />
                                <span className="text-xs">BTC:</span>
                              </div>
                              <span className="text-xs">${btcValue.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#627eea]" />
                                <span className="text-xs">ETH:</span>
                              </div>
                              <span className="text-xs">${ethValue.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-2">
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

        {/* Allocation Pie Chart */}
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
            <CardDescription>Portfolio distribution by value</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
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
                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: data.color }}
                            />
                            <span className="font-medium">{data.name}</span>
                          </div>
                          <p className="text-sm">Amount: {data.amount.toLocaleString()} {data.symbol}</p>
                          <p className="text-sm">Value: ${data.value.toLocaleString()}</p>
                          <p className="text-sm font-medium">{data.percentage.toFixed(1)}% of portfolio</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {allocationData.map((item) => (
                <div key={item.symbol} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.symbol}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>${item.value.toLocaleString()}</span>
                    <span className="text-muted-foreground">({item.percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Holdings Table */}
      <Card className="animate-fade-in-up delay-500 transition-all duration-200 hover:shadow-md">
        <CardHeader>
          <CardTitle>Your Holdings</CardTitle>
          <CardDescription>Detailed breakdown of your cryptocurrency portfolio</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border outline-ring/50">
                <tr className="text-sm text-muted-foreground border-border outline-ring/50">
                  <th className="text-left p-4">Asset</th>
                  <th className="text-right p-4">Price</th>
                  <th className="text-right p-4">24h Change</th>
                  <th className="text-right p-4">Holdings</th>
                  <th className="text-right p-4">Value</th>
                  <th className="text-right p-4">Allocation</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((holding) => (
                  <tr key={holding.symbol} className="border-b hover:bg-muted/50 transition-colors border-border outline-ring/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getCoinIcon(holding.symbol)}
                          alt={holding.name}
                          className="w-8 h-8 rounded-full"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = getFallbackIcon(holding.symbol)
                          }}
                        />
                        <div>
                          <div className="font-medium">{holding.name}</div>
                          <div className="text-sm text-muted-foreground">{holding.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      ${holding.price.toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className={`flex items-center justify-end ${
                        holding.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {holding.change24h >= 0 ? (
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 mr-1" />
                        )}
                        {holding.change24h >= 0 ? '+' : ''}{holding.change24h}%
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      {holding.amount.toLocaleString()} {holding.symbol}
                    </td>
                    <td className="p-4 text-right font-medium">
                      ${holding.value.toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-muted rounded-full h-2">
                          <div 
                            className="h-2 rounded-full" 
                            style={{ 
                              width: `${holding.allocation}%`,
                              backgroundColor: holding.color
                            }}
                          />
                        </div>
                        <span className="text-sm">{holding.allocation}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="animate-fade-in-up delay-600 transition-all duration-200 hover:shadow-md">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest trading and deposit activity</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border outline-ring/50">
                <tr className="text-sm text-muted-foreground">
                  <th className="text-left p-4">Type</th>
                  <th className="text-left p-4">Asset</th>
                  <th className="text-right p-4">Amount</th>
                  <th className="text-right p-4">Price</th>
                  <th className="text-right p-4">Value</th>
                  <th className="text-left p-4">Date</th>
                  <th className="text-left p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50 border-border outline-ring/50">
                    <td className="p-4">
                      <div className={`px-2 py-1 rounded text-xs font-medium inline-block ${
                        tx.type === 'BUY' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        tx.type === 'SELL' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                      }`}>
                        {tx.type}
                      </div>
                    </td>
                    <td className="p-4 font-medium">{tx.asset}</td>
                    <td className="p-4 text-right">{tx.amount.toLocaleString()}</td>
                    <td className="p-4 text-right">${tx.price.toLocaleString()}</td>
                    <td className="p-4 text-right font-medium">${tx.value.toLocaleString()}</td>
                    <td className="p-4">
                      <div>
                        <div className="text-sm">{tx.date}</div>
                        <div className="text-xs text-muted-foreground">{tx.time}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="px-2 py-1 rounded text-xs font-medium inline-block bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        {tx.status}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
