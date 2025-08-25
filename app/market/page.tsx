"use client"

import { useState, useEffect } from "react"
import { ArrowUpRight, ArrowDownRight, Star, Search, Filter } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { PageLoadingSkeleton } from "@/components/loading-skeleton"
import { getTopCoins, getTrendingCoins, getGlobalStats, getAllCoins, searchCoins, formatPrice, formatNumber, getCoinIcon, getFallbackIcon, type CoinData, type GlobalStats, type SimpleCoin } from "@/lib/api"

export default function MarketPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [watchlist, setWatchlist] = useState(new Set(["BTC", "ETH"]))
  const [marketData, setMarketData] = useState<CoinData[]>([])
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null)
  const [allCoins, setAllCoins] = useState<SimpleCoin[]>([])
  const [loading, setLoading] = useState(true)
  const [searchResults, setSearchResults] = useState<SimpleCoin[]>([])

  // Load market data
  useEffect(() => {
    const loadMarketData = async () => {
      setLoading(true)
      const [trendingCoins, topCoins, stats, allCoinsData] = await Promise.all([
        getTrendingCoins(),
        getTopCoins(50),
        getGlobalStats(),
        getAllCoins()
      ])
      // Combine trending and top coins, prioritizing trending
      const combinedData = [...trendingCoins, ...topCoins.filter(coin => 
        !trendingCoins.some(trending => trending.id === coin.id)
      )]
      setMarketData(combinedData)
      setGlobalStats(stats)
      setAllCoins(allCoinsData)
      setLoading(false)
    }
    
    loadMarketData()
    const interval = setInterval(loadMarketData, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  // Handle search
  useEffect(() => {
    const performSearch = async () => {
      if (!searchTerm.trim()) {
        setSearchResults([])
        return
      }
      const results = await searchCoins(searchTerm, allCoins)
      setSearchResults(results)
    }
    
    const debounceTimer = setTimeout(performSearch, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchTerm, allCoins])

  const toggleWatchlist = (symbol: string) => {
    const newWatchlist = new Set(watchlist)
    if (newWatchlist.has(symbol)) {
      newWatchlist.delete(symbol)
    } else {
      newWatchlist.add(symbol)
    }
    setWatchlist(newWatchlist)
  }

  const filteredData = searchTerm ? 
    marketData.filter(coin => 
      searchResults.some(result => result.id === coin.id)
    ) : 
    marketData.slice(0, 20)

  if (loading) {
    return (
      <PageLoadingSkeleton 
        title="Market Overview" 
        description="Track cryptocurrency prices and market data" 
      />
    )
  }

  const trendingCoins = marketData
    .filter(coin => coin.quotes.USD.percent_change_24h > 5)
    .slice(0, 4)

  const gainers = marketData
    .filter(coin => coin.quotes.USD.percent_change_24h > 0)
    .sort((a, b) => b.quotes.USD.percent_change_24h - a.quotes.USD.percent_change_24h)
    .slice(0, 4)

  const losers = marketData
    .filter(coin => coin.quotes.USD.percent_change_24h < 0)
    .sort((a, b) => a.quotes.USD.percent_change_24h - b.quotes.USD.percent_change_24h)
    .slice(0, 4)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in-up delay-75">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Market Overview</h1>
          <p className="text-muted-foreground">Track cryptocurrency prices and market data</p>
        </div>
      </div>

      {/* Market Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="transition-all duration-200 hover:shadow-md animate-fade-in-up delay-150">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Cap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${globalStats ? formatNumber(globalStats.market_cap_usd) : '1.67T'}
            </div>
            <div className={`flex items-center text-xs ${
              (globalStats?.market_cap_change_24h || 2.4) >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {(globalStats?.market_cap_change_24h || 2.4) >= 0 ? (
                <ArrowUpRight className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 mr-1" />
              )}
              {(globalStats?.market_cap_change_24h || 2.4) >= 0 ? '+' : ''}
              {(globalStats?.market_cap_change_24h || 2.4).toFixed(1)}% (24h)
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-md animate-fade-in-up delay-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">24h Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${globalStats ? formatNumber(globalStats.volume_24h_usd) : '89.2B'}
            </div>
            <div className={`flex items-center text-xs ${
              (globalStats?.volume_24h_change_24h || -1.2) >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {(globalStats?.volume_24h_change_24h || -1.2) >= 0 ? (
                <ArrowUpRight className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 mr-1" />
              )}
              {(globalStats?.volume_24h_change_24h || -1.2) >= 0 ? '+' : ''}
              {(globalStats?.volume_24h_change_24h || -1.2).toFixed(1)}% (24h)
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-md animate-fade-in-up delay-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">BTC Dominance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {globalStats ? globalStats.bitcoin_dominance_percentage.toFixed(1) : '50.7'}%
            </div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +0.3% (24h)
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-md animate-fade-in-up delay-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cryptos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {globalStats ? formatNumber(globalStats.cryptocurrencies_number) : '2.3M+'}
            </div>
            <div className="text-xs text-muted-foreground">Tracked coins</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Trending */}
        <Card className="transition-all duration-200 hover:shadow-md animate-fade-in-up delay-500">
          <CardHeader>
            <CardTitle>🔥 Trending</CardTitle>
            <CardDescription>Top trending cryptocurrencies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {trendingCoins.map((coin, index) => (
              <div key={coin.symbol} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{index + 1}</span>
                  <img
                    src={getCoinIcon(coin.symbol)}
                    alt={coin.name}
                    className="w-6 h-6 rounded-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = getFallbackIcon(coin.symbol)
                    }}
                  />
                  <div>
                    <div className="font-medium">{coin.symbol}</div>
                    <div className="text-xs text-muted-foreground">{coin.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm">${formatPrice(coin.quotes.USD.price)}</div>
                  <div className="text-xs text-green-600">+{coin.quotes.USD.percent_change_24h.toFixed(2)}%</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Gainers */}
        <Card className="transition-all duration-200 hover:shadow-md animate-fade-in-up delay-500">
          <CardHeader>
            <CardTitle>📈 Top Gainers</CardTitle>
            <CardDescription>Best performing coins (24h)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {gainers.map((coin, index) => (
              <div key={coin.symbol} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{index + 1}</span>
                  <img
                    src={getCoinIcon(coin.symbol)}
                    alt={coin.name}
                    className="w-6 h-6 rounded-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = getFallbackIcon(coin.symbol)
                    }}
                  />
                  <div>
                    <div className="font-medium">{coin.symbol}</div>
                    <div className="text-xs text-muted-foreground">{coin.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm">${formatPrice(coin.quotes.USD.price)}</div>
                  <div className="text-xs text-green-600">+{coin.quotes.USD.percent_change_24h.toFixed(2)}%</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Losers */}
        <Card className="transition-all duration-200 hover:shadow-md animate-fade-in-up delay-500">
          <CardHeader>
            <CardTitle>📉 Top Losers</CardTitle>
            <CardDescription>Worst performing coins (24h)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {losers.map((coin, index) => (
              <div key={coin.symbol} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{index + 1}</span>
                  <img
                    src={getCoinIcon(coin.symbol)}
                    alt={coin.name}
                    className="w-6 h-6 rounded-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = getFallbackIcon(coin.symbol)
                    }}
                  />
                  <div>
                    <div className="font-medium">{coin.symbol}</div>
                    <div className="text-xs text-muted-foreground">{coin.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm">${formatPrice(coin.quotes.USD.price)}</div>
                  <div className="text-xs text-red-600">{coin.quotes.USD.percent_change_24h.toFixed(2)}%</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Market Table */}
      <Card className="animate-fade-in-up delay-800 transition-all duration-200 hover:shadow-md ">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Cryptocurrencies</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search coins..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pl-10"
                />
              </div>
              <Button variant="outline" size="icon" className="cursor-pointer">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border outline-ring/50">
                <tr className="text-sm text-muted-foreground">
                  <th className="text-left p-4">#</th>
                  <th className="text-left p-4">Name</th>
                  <th className="text-right p-4">Price</th>
                  <th className="text-right p-4">24h %</th>
                  <th className="text-right p-4">24h Volume</th>
                  <th className="text-right p-4">Market Cap</th>
                  <th className="text-right p-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((coin) => (
                  <tr key={coin.symbol} className="border-b hover:bg-muted/50 transition-colors border-border outline-ring/50">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 cursor-pointer"
                          onClick={() => toggleWatchlist(coin.symbol)}
                        >
                          <Star 
                            className={`h-3 w-3 transition-colors ${
                              watchlist.has(coin.symbol) 
                                ? 'fill-yellow-400 text-yellow-400' 
                                : 'text-muted-foreground hover:text-yellow-400'
                            }`} 
                          />
                        </Button>
                        <span className="text-sm">{coin.rank}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getCoinIcon(coin.symbol)}
                          alt={coin.name}
                          className="w-8 h-8 rounded-full"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = getFallbackIcon(coin.symbol)
                          }}
                        />
                        <div>
                          <div className="font-medium">{coin.name}</div>
                          <div className="text-sm text-muted-foreground">{coin.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right font-medium">
                      ${formatPrice(coin.quotes.USD.price)}
                    </td>
                    <td className="p-4 text-right">
                      <div className={`flex items-center justify-end ${
                        coin.quotes.USD.percent_change_24h >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {coin.quotes.USD.percent_change_24h >= 0 ? (
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 mr-1" />
                        )}
                        {coin.quotes.USD.percent_change_24h >= 0 ? '+' : ''}
                        {coin.quotes.USD.percent_change_24h.toFixed(2)}%
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      ${formatNumber(coin.quotes.USD.volume_24h)}
                    </td>
                    <td className="p-4 text-right">
                      ${formatNumber(coin.quotes.USD.market_cap)}
                    </td>
                    <td className="p-4 text-right">
                      <Button size="sm" variant="outline" className="transition-all duration-200 hover:scale-105 cursor-pointer">
                        Trade
                      </Button>
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
