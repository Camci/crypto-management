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
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between animate-fade-in-up delay-75">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Market Overview</h1>
          <p className="text-sm md:text-base text-muted-foreground">Track cryptocurrency prices and market data</p>
        </div>
      </div>

      {/* Market Stats */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        <Card className="transition-all duration-200 hover:shadow-md animate-fade-in-up delay-150">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Market Cap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
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
            <CardTitle className="text-xs md:text-sm font-medium">24h Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
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
            <CardTitle className="text-xs md:text-sm font-medium">BTC Dominance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
              {globalStats ? globalStats.bitcoin_dominance_percentage.toFixed(1) : '50.7'}%
            </div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +0.3% (24h)
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-md animate-fade-in-up delay-400 sm:col-span-2 md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Active Cryptos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
              {globalStats ? formatNumber(globalStats.cryptocurrencies_number) : '2.3M+'}
            </div>
            <div className="text-xs text-muted-foreground">Tracked coins</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Trending */}
        <Card className="transition-all duration-200 hover:shadow-md animate-fade-in-up delay-500">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">🔥 Trending</CardTitle>
            <CardDescription className="text-sm">Top trending cryptocurrencies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {trendingCoins.map((coin, index) => (
              <div key={coin.symbol} className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs md:text-sm text-muted-foreground">{index + 1}</span>
                  <img
                    src={getCoinIcon(coin.symbol)}
                    alt={coin.name}
                    className="w-5 h-5 md:w-6 md:h-6 rounded-full flex-shrink-0"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = getFallbackIcon(coin.symbol)
                    }}
                  />
                  <div className="min-w-0">
                    <div className="font-medium text-xs md:text-sm truncate">{coin.symbol}</div>
                    <div className="text-xs text-muted-foreground truncate">{coin.name}</div>
                  </div>
                </div>
                <div className="text-right ml-2">
                  <div className="font-medium text-xs md:text-sm">${formatPrice(coin.quotes.USD.price)}</div>
                  <div className={`text-xs flex items-center ${
                    coin.quotes.USD.percent_change_24h >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {coin.quotes.USD.percent_change_24h >= 0 ? (
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                    )}
                    {coin.quotes.USD.percent_change_24h >= 0 ? '+' : ''}{coin.quotes.USD.percent_change_24h.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Gainers */}
        <Card className="transition-all duration-200 hover:shadow-md animate-fade-in-up delay-600">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">📈 Top Gainers</CardTitle>
            <CardDescription className="text-sm">Best performing cryptocurrencies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {gainers.map((coin, index) => (
              <div key={coin.symbol} className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs md:text-sm text-muted-foreground">{index + 1}</span>
                  <img
                    src={getCoinIcon(coin.symbol)}
                    alt={coin.name}
                    className="w-5 h-5 md:w-6 md:h-6 rounded-full flex-shrink-0"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = getFallbackIcon(coin.symbol)
                    }}
                  />
                  <div className="min-w-0">
                    <div className="font-medium text-xs md:text-sm truncate">{coin.symbol}</div>
                    <div className="text-xs text-muted-foreground truncate">{coin.name}</div>
                  </div>
                </div>
                <div className="text-right ml-2">
                  <div className="font-medium text-xs md:text-sm">${formatPrice(coin.quotes.USD.price)}</div>
                  <div className="text-xs text-green-600 flex items-center">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    +{coin.quotes.USD.percent_change_24h.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Losers */}
        <Card className="transition-all duration-200 hover:shadow-md animate-fade-in-up delay-700">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">📉 Top Losers</CardTitle>
            <CardDescription className="text-sm">Worst performing cryptocurrencies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {losers.map((coin, index) => (
              <div key={coin.symbol} className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs md:text-sm text-muted-foreground">{index + 1}</span>
                  <img
                    src={getCoinIcon(coin.symbol)}
                    alt={coin.name}
                    className="w-5 h-5 md:w-6 md:h-6 rounded-full flex-shrink-0"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = getFallbackIcon(coin.symbol)
                    }}
                  />
                  <div className="min-w-0">
                    <div className="font-medium text-xs md:text-sm truncate">{coin.symbol}</div>
                    <div className="text-xs text-muted-foreground truncate">{coin.name}</div>
                  </div>
                </div>
                <div className="text-right ml-2">
                  <div className="font-medium text-xs md:text-sm">${formatPrice(coin.quotes.USD.price)}</div>
                  <div className="text-xs text-red-600 flex items-center">
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                    {coin.quotes.USD.percent_change_24h.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search cryptocurrencies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <Button variant="outline" className="w-full sm:w-auto">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Market Table */}
      <Card className="transition-all duration-200 hover:shadow-md animate-fade-in-up delay-900">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Market Data</CardTitle>
          <CardDescription className="text-sm">Live cryptocurrency prices and market data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredData.map((coin) => (
              <div key={coin.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleWatchlist(coin.symbol)}
                    className="p-1 h-auto"
                  >
                    <Star className={`h-4 w-4 ${watchlist.has(coin.symbol) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                  </Button>
                  <img
                    src={getCoinIcon(coin.symbol)}
                    alt={coin.name}
                    className="w-6 h-6 md:w-8 md:h-8 rounded-full flex-shrink-0"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = getFallbackIcon(coin.symbol)
                    }}
                  />
                  <div className="min-w-0">
                    <div className="font-medium text-sm md:text-base truncate">{coin.symbol}</div>
                    <div className="text-xs md:text-sm text-muted-foreground truncate">{coin.name}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 md:gap-8 text-right">
                  <div className="min-w-0">
                    <div className="font-medium text-sm md:text-base">${formatPrice(coin.quotes.USD.price)}</div>
                    <div className="text-xs text-muted-foreground">
                      Vol: ${formatNumber(coin.quotes.USD.volume_24h)}
                    </div>
                  </div>
                  
                  <div className="min-w-0">
                    <div className="font-medium text-sm md:text-base">
                      ${formatNumber(coin.quotes.USD.market_cap)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      #{coin.cmc_rank}
                    </div>
                  </div>
                  
                  <div className={`min-w-0 ${
                    coin.quotes.USD.percent_change_24h >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <div className="font-medium text-sm md:text-base flex items-center">
                      {coin.quotes.USD.percent_change_24h >= 0 ? (
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 mr-1" />
                      )}
                      {coin.quotes.USD.percent_change_24h >= 0 ? '+' : ''}{coin.quotes.USD.percent_change_24h.toFixed(2)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {coin.quotes.USD.percent_change_1h >= 0 ? '+' : ''}{coin.quotes.USD.percent_change_1h.toFixed(2)}% (1h)
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

