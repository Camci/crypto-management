"use client"

import { useState } from "react"
import { CreditCard, Plus, Eye, EyeOff, Lock, Unlock, MoreHorizontal, ShoppingCart } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const cryptoCards = [
  {
    id: 1,
    name: "CRYPTO Platinum",
    type: "Virtual",
    number: "•••• •••• •••• 1234",
    balance: 12449.67,
    currency: "USDT",
    status: "Active",
    limit: 50000,
    spent: 8234.56,
    color: "bg-gradient-to-r from-gray-900 to-gray-600",
    textColor: "text-white"
  },
  {
    id: 2,
    name: "CRYPTO Gold",
    type: "Physical",
    number: "•••• •••• •••• 5678",
    balance: 5678.90,
    currency: "USDT",
    status: "Active",
    limit: 25000,
    spent: 3456.78,
    color: "bg-gradient-to-r from-yellow-600 to-yellow-400",
    textColor: "text-white"
  },
  {
    id: 3,
    name: "CRYPTO Silver",
    type: "Virtual",
    number: "•••• •••• •••• 9012",
    balance: 1234.56,
    currency: "USDT",
    status: "Frozen",
    limit: 10000,
    spent: 567.89,
    color: "bg-gradient-to-r from-gray-400 to-gray-300",
    textColor: "text-gray-800"
  }
]

const transactions = [
  {
    merchant: "Amazon",
    amount: 89.99,
    currency: "USD",
    category: "Shopping",
    date: "2024-01-15",
    time: "14:32",
    cardId: 1,
    status: "Completed"
  },
  {
    merchant: "Starbucks",
    amount: 12.50,
    currency: "USD",
    category: "Food & Drink",
    date: "2024-01-15",
    time: "09:15",
    cardId: 1,
    status: "Completed"
  },
  {
    merchant: "Uber",
    amount: 25.75,
    currency: "USD",
    category: "Transport",
    date: "2024-01-14",
    time: "18:45",
    cardId: 2,
    status: "Completed"
  },
  {
    merchant: "Netflix",
    amount: 15.99,
    currency: "USD",
    category: "Entertainment",
    date: "2024-01-14",
    time: "12:00",
    cardId: 2,
    status: "Completed"
  }
]

const cardBenefits = [
  "No foreign transaction fees",
  "Real-time spending notifications",
  "Instant crypto-to-fiat conversion",
  "Cashback rewards in crypto",
  "24/7 customer support",
  "Advanced security features"
]

export default function CardsPage() {
  const [selectedCard, setSelectedCard] = useState(0)
  const [showCardNumber, setShowCardNumber] = useState(false)

  const currentCard = cryptoCards[selectedCard]
  const cardTransactions = transactions.filter(tx => tx.cardId === currentCard.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in-up delay-100">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Crypto Cards</h1>
          <p className="text-muted-foreground">Spend your crypto anywhere with CRYPTO cards</p>
        </div>
        <Button className="cursor-pointer">
          <Plus className="h-4 w-4 mr-2" />
          Order New Card
        </Button>
      </div>

      {/* Card Overview */}
      <div className="grid gap-6 md:grid-cols-3 animate-fade-in-up delay-200">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${cryptoCards.reduce((sum, card) => sum + card.balance, 0).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Across all cards</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Spend</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${cryptoCards.reduce((sum, card) => sum + card.spent, 0).toLocaleString()}
            </div>
            <div className="text-xs text-green-600">+12.3% from last month</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cryptoCards.filter(card => card.status === 'Active').length}
            </div>
            <div className="text-xs text-muted-foreground">
              Out of {cryptoCards.length} total cards
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 animate-fade-in-up delay-300">
        {/* Card Selection */}
        <Card className="lg:col-span-2 transition-all duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle>Your Cards</CardTitle>
            <CardDescription>Manage your CRYPTO crypto cards</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {cryptoCards.map((card, index) => (
              <div
                key={card.id}
                className={`p-6 rounded-xl cursor-pointer transition-all ${card.color} ${
                  selectedCard === index ? 'ring-2 ring-primary ring-offset-2' : ''
                }`}
                onClick={() => setSelectedCard(index)}
              >
                <div className={`${card.textColor}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{card.name}</h3>
                      <p className="text-sm opacity-80">{card.type} Card</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={card.status === 'Active' ? 'default' : 'destructive'}
                        className="bg-white/20 text-white border-white/20"
                      >
                        {card.status}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            {card.status === 'Active' ? (
                              <>
                                <Lock className="h-4 w-4 mr-2" />
                                Freeze Card
                              </>
                            ) : (
                              <>
                                <Unlock className="h-4 w-4 mr-2" />
                                Unfreeze Card
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Transaction History</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">Cancel Card</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl font-mono">
                        {showCardNumber ? '4532 1234 5678 9012' : card.number}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20 h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowCardNumber(!showCardNumber)
                        }}
                      >
                        {showCardNumber ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between text-sm opacity-80">
                      <span>VALID THRU 12/27</span>
                      <span>CVV •••</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-80">Balance</p>
                      <p className="text-xl font-bold">
                        ${card.balance.toLocaleString()} {card.currency}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm opacity-80">Limit</p>
                      <p className="font-medium">${card.limit.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between text-sm opacity-80 mb-1">
                      <span>Spent this month</span>
                      <span>${card.spent.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div
                        className="bg-white rounded-full h-2 transition-all"
                        style={{ width: `${(card.spent / card.limit) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Card Benefits */}
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle>Card Benefits</CardTitle>
            <CardDescription>Exclusive features for CRYPTO cardholders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {cardBenefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="animate-fade-in-up delay-400 transition-all duration-200 hover:shadow-md">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest spending activity on {currentCard.name}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-sm text-muted-foreground">
                  <th className="text-left p-4">Merchant</th>
                  <th className="text-left p-4">Category</th>
                  <th className="text-right p-4">Amount</th>
                  <th className="text-left p-4">Date</th>
                  <th className="text-center p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {cardTransactions.map((transaction, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{transaction.merchant}</div>
                        <div className="text-sm text-muted-foreground">Card payment</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="secondary">{transaction.category}</Badge>
                    </td>
                    <td className="p-4 text-right font-medium">
                      -${transaction.amount} {transaction.currency}
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="text-sm">{transaction.date}</div>
                        <div className="text-xs text-muted-foreground">{transaction.time}</div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <Badge variant="default">{transaction.status}</Badge>
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
