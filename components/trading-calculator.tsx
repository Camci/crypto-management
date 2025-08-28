"use client"

import { useState, useEffect } from "react"
import { Calculator, ArrowUpDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/api"

interface TradingCalculatorProps {
  currentPrice: number
  baseCurrency: string
  quoteCurrency: string
  side: "buy" | "sell"
  orderType: "market" | "limit" | "stop"
  onCalculationChange?: (calculation: {
    amount: number
    price: number
    total: number
    fee: number
    finalTotal: number
  }) => void
}

export function TradingCalculator({
  currentPrice,
  baseCurrency,
  quoteCurrency,
  side,
  orderType,
  onCalculationChange
}: TradingCalculatorProps) {
  const [amount, setAmount] = useState("")
  const [price, setPrice] = useState(orderType === "market" ? currentPrice.toString() : "")
  const [total, setTotal] = useState("")
  const [calculationMode, setCalculationMode] = useState<"amount" | "total">("amount")
  
  const feeRate = 0.001 // 0.1% fee
  
  // Calculate values based on input
  useEffect(() => {
    const numAmount = parseFloat(amount) || 0
    const numPrice = parseFloat(price) || currentPrice
    const numTotal = parseFloat(total) || 0

    let calculatedAmount = numAmount
    let calculatedPrice = numPrice
    let calculatedTotal = numTotal

    if (calculationMode === "amount" && numAmount > 0) {
      calculatedTotal = numAmount * numPrice
    } else if (calculationMode === "total" && numTotal > 0) {
      calculatedAmount = numTotal / numPrice
    }

    const fee = calculatedTotal * feeRate
    const finalTotal = side === "buy" ? calculatedTotal + fee : calculatedTotal - fee

    // Update the parent component with calculation
    if (onCalculationChange) {
      onCalculationChange({
        amount: calculatedAmount,
        price: calculatedPrice,
        total: calculatedTotal,
        fee,
        finalTotal
      })
    }
  }, [amount, price, total, calculationMode, currentPrice, side, onCalculationChange])

  // Update price when order type changes
  useEffect(() => {
    if (orderType === "market") {
      setPrice(currentPrice.toString())
    }
  }, [orderType, currentPrice])

  const handleAmountChange = (value: string) => {
    setAmount(value)
    setCalculationMode("amount")
    if (value && price) {
      const calculatedTotal = (parseFloat(value) || 0) * (parseFloat(price) || currentPrice)
      setTotal(calculatedTotal.toString())
    }
  }

  const handlePriceChange = (value: string) => {
    setPrice(value)
    if (amount) {
      const calculatedTotal = (parseFloat(amount) || 0) * (parseFloat(value) || 0)
      setTotal(calculatedTotal.toString())
    }
  }

  const handleTotalChange = (value: string) => {
    setTotal(value)
    setCalculationMode("total")
    if (value && price) {
      const calculatedAmount = (parseFloat(value) || 0) / (parseFloat(price) || currentPrice)
      setAmount(calculatedAmount.toString())
    }
  }

  const handlePercentageClick = (percentage: number) => {
    // This would typically use the user's available balance
    const mockBalance = side === "buy" ? 10000 : 1.5 // Mock USDT balance for buy, BTC balance for sell
    
    if (side === "buy") {
      const totalAmount = mockBalance * (percentage / 100)
      const calculatedAmount = totalAmount / (parseFloat(price) || currentPrice)
      setAmount(calculatedAmount.toString())
      setTotal(totalAmount.toString())
    } else {
      const amountToSell = mockBalance * (percentage / 100)
      const calculatedTotal = amountToSell * (parseFloat(price) || currentPrice)
      setAmount(amountToSell.toString())
      setTotal(calculatedTotal.toString())
    }
    setCalculationMode("amount")
  }

  const numAmount = parseFloat(amount) || 0
  const numPrice = parseFloat(price) || currentPrice
  const numTotal = parseFloat(total) || 0
  const fee = (calculationMode === "amount" ? numAmount * numPrice : numTotal) * feeRate
  const finalTotal = side === "buy" ? 
    (calculationMode === "amount" ? numAmount * numPrice : numTotal) + fee :
    (calculationMode === "amount" ? numAmount * numPrice : numTotal) - fee

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Order Type and Price */}
      {orderType !== "market" && (
        <div className="space-y-2">
          <label className="text-xs md:text-sm font-medium">Price</label>
          <div className="relative">
            <Input
              type="number"
              placeholder={formatPrice(currentPrice)}
              value={price}
              onChange={(e) => handlePriceChange(e.target.value)}
              className="pr-16 text-sm md:text-base"
              step="0.01"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs md:text-sm text-muted-foreground">
              {quoteCurrency}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            Market Price: ${formatPrice(currentPrice)}
          </div>
        </div>
      )}

      {/* Amount */}
      <div className="space-y-2">
        <label className="text-xs md:text-sm font-medium flex items-center gap-2">
          Amount
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 md:h-6 md:w-6 p-0"
            onClick={() => setCalculationMode(calculationMode === "amount" ? "total" : "amount")}
          >
            <ArrowUpDown className="h-3 w-3" />
          </Button>
        </label>
        <div className="relative">
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            className="pr-16 text-sm md:text-base"
            step="0.00000001"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs md:text-sm text-muted-foreground">
            {baseCurrency}
          </span>
        </div>
      </div>

      {/* Percentage Buttons */}
      <div className="grid grid-cols-4 gap-1 md:gap-2">
        {[25, 50, 75, 100].map((percentage) => (
          <Button
            key={percentage}
            variant="outline"
            size="sm"
            onClick={() => handlePercentageClick(percentage)}
            className="transition-all duration-200 hover:scale-105 text-xs md:text-sm h-8 md:h-9"
          >
            {percentage}%
          </Button>
        ))}
      </div>

      {/* Total */}
      <div className="space-y-2">
        <label className="text-xs md:text-sm font-medium">Total</label>
        <div className="relative">
          <Input
            type="number"
            placeholder="0.00"
            value={total}
            onChange={(e) => handleTotalChange(e.target.value)}
            className="pr-16 text-sm md:text-base"
            step="0.01"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs md:text-sm text-muted-foreground">
            {quoteCurrency}
          </span>
        </div>
      </div>

      {/* Calculation Summary */}
      <Card className="bg-muted/30 transition-all duration-200 hover:bg-muted/50">
        <CardContent className="p-3 md:p-4 space-y-2">
          <div className="flex justify-between text-xs md:text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">
              {formatPrice(calculationMode === "amount" ? numAmount * numPrice : numTotal)} {quoteCurrency}
            </span>
          </div>
          <div className="flex justify-between text-xs md:text-sm">
            <span className="text-muted-foreground">Fee (0.1%)</span>
            <span className="font-medium text-orange-600">
              {formatPrice(fee)} {quoteCurrency}
            </span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between font-medium text-xs md:text-sm">
              <span>Total {side === "buy" ? "Cost" : "Receive"}</span>
              <span className={side === "buy" ? "text-red-600" : "text-green-600"}>
                {formatPrice(finalTotal)} {quoteCurrency}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Info */}
      <div className="text-xs text-muted-foreground space-y-1">
        <div>Available: 10,000 USDT</div>
        <div>Est. {side === "buy" ? "Purchase" : "Sale"}: {formatPrice(numAmount)} {baseCurrency}</div>
      </div>
    </div>
  )
}
