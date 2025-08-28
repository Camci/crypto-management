"use client"

import { useState, useEffect, useRef } from "react"
import { Search, TrendingUp, TrendingDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getAllCoins, searchCoins, getCoinById, formatPrice, getCoinIcon, getFallbackIcon, type SimpleCoin, type CoinData } from "@/lib/api"
import { useRouter } from "next/navigation"

interface SearchResult extends SimpleCoin {
  price?: number
  change24h?: number
}

export function SearchCrypto() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [allCoins, setAllCoins] = useState<SimpleCoin[]>([])
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Load all coins on component mount
  useEffect(() => {
    const loadCoins = async () => {
      const coins = await getAllCoins()
      setAllCoins(coins)
    }
    loadCoins()
  }, [])

  // Handle search
  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim() || allCoins.length === 0) {
        setResults([])
        setIsOpen(false)
        return
      }

      setIsLoading(true)
      const searchResults = await searchCoins(query, allCoins)
      
      // Get price data for search results
      const resultsWithPrices = await Promise.all(
        searchResults.slice(0, 5).map(async (coin) => {
          const coinData = await getCoinById(coin.id)
          return {
            ...coin,
            price: coinData?.quotes.USD.price,
            change24h: coinData?.quotes.USD.percent_change_24h
          }
        })
      )

      setResults(resultsWithPrices)
      setIsOpen(true)
      setIsLoading(false)
    }

    const debounceTimer = setTimeout(performSearch, 300)
    return () => clearTimeout(debounceTimer)
  }, [query, allCoins])

  // Close search on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleResultClick = (coin: SearchResult) => {
    setQuery("")
    setIsOpen(false)
    // Navigate to trading page with the selected coin ID and symbol
    router.push(`/trading?coinId=${coin.id}&symbol=${coin.symbol}`)
  }

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search cryptocurrencies..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setIsOpen(true)}
          className="w-48 md:w-80 pl-10 transition-all duration-200 md:focus:w-96"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <Card className="absolute top-full mt-2 w-full z-50 p-2 animate-in fade-in-0 zoom-in-95 duration-200">
          <div className="space-y-1">
            {results.map((coin) => (
              <Button
                key={coin.id}
                variant="ghost"
                className="w-full justify-start h-auto p-2 md:p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => handleResultClick(coin)}
              >
                <div className="flex items-center gap-2 md:gap-3 w-full">
                  <img
                    src={getCoinIcon(coin.symbol)}
                    alt={coin.name}
                    className="w-5 h-5 md:w-6 md:h-6 rounded-full flex-shrink-0"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = getFallbackIcon(coin.symbol)
                    }}
                  />
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <div className="font-medium text-sm md:text-base truncate">{coin.name}</div>
                        <div className="text-xs md:text-sm text-muted-foreground">{coin.symbol}</div>
                      </div>
                      {coin.price && (
                        <div className="text-right ml-2">
                          <div className="font-medium text-sm md:text-base">${formatPrice(coin.price)}</div>
                          {coin.change24h !== undefined && (
                            <div className={`text-xs md:text-sm flex items-center ${
                              coin.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {coin.change24h >= 0 ? (
                                <TrendingUp className="h-3 w-3 mr-1" />
                              ) : (
                                <TrendingDown className="h-3 w-3 mr-1" />
                              )}
                              {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
