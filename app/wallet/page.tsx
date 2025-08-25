"use client"

import { useState } from "react"
import { Copy, QrCode, Send, Download, Plus, ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

const wallets = [
  {
    name: "Main Wallet",
    address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    balance: 1.2847,
    value: 55482.31,
    currency: "BTC",
    type: "Hot Wallet",
    status: "Active"
  },
  {
    name: "Ethereum Wallet",
    address: "0x742d35Cc6634C0532925a3b8D3Ac92f0B3c0e3d",
    balance: 8.4521,
    value: 21527.43,
    currency: "ETH", 
    type: "Hot Wallet",
    status: "Active"
  },
  {
    name: "Cold Storage",
    address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    balance: 0.5234,
    value: 22634.12,
    currency: "BTC",
    type: "Cold Wallet",
    status: "Offline"
  }
]

const transactions = [
  {
    type: "Received",
    amount: 0.0249,
    currency: "BTC",
    from: "1BvBM...3xK8",
    to: "1A1zP1...DivfNa",
    value: 1073.69,
    fee: 0.00001,
    confirmations: 6,
    hash: "a1b2c3d4e5f6...",
    timestamp: "2024-01-15 14:32:45",
    status: "Confirmed"
  },
  {
    type: "Sent",
    amount: 1.5,
    currency: "ETH",
    from: "0x742d...0e3d",
    to: "0x8ba1...9f2e",
    value: 3826.50,
    fee: 0.0021,
    confirmations: 12,
    hash: "f6e5d4c3b2a1...",
    timestamp: "2024-01-15 12:45:30",
    status: "Confirmed"
  },
  {
    type: "Received",
    amount: 5000,
    currency: "USDT",
    from: "TQn9Y...8xZ2",
    to: "TR7NH...4xR5",
    value: 5000.00,
    fee: 1.0,
    confirmations: 3,
    hash: "9z8y7x6w5v...",
    timestamp: "2024-01-14 09:15:22",
    status: "Confirmed"
  },
  {
    type: "Sent",
    amount: 0.1234,
    currency: "BTC",
    from: "1A1zP1...DivfNa",
    to: "3J98t1...Hs4D",
    value: 5336.71,
    fee: 0.00005,
    confirmations: 1,
    hash: "m9n8b7v6c5...",
    timestamp: "2024-01-14 16:20:18",
    status: "Pending"
  }
]

export default function WalletPage() {
  const [selectedWallet, setSelectedWallet] = useState(0)
  const [sendAmount, setSendAmount] = useState("")
  const [sendAddress, setSendAddress] = useState("")

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Address copied to clipboard")
  }

  const currentWallet = wallets[selectedWallet]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in-up delay-100">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
          <p className="text-muted-foreground">Manage your cryptocurrency wallets and transactions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="cursor-pointer">
            <Plus className="h-4 w-4 mr-2" />
            Add Wallet
          </Button>
          <Button className="cursor-pointer">
            <QrCode className="h-4 w-4 mr-2" />
            Receive
          </Button>
        </div>
      </div>

      {/* Wallet Selection */}
      <div className="grid gap-4 md:grid-cols-3 animate-fade-in-up delay-200">
        {wallets.map((wallet, index) => (
          <Card 
            key={index} 
            className={`cursor-pointer transition-colors ${
              selectedWallet === index ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedWallet(index)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{wallet.name}</CardTitle>
                <Badge variant={wallet.status === 'Active' ? 'default' : 'secondary'}>
                  {wallet.status}
                </Badge>
              </div>
              <CardDescription>{wallet.type}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {wallet.balance} {wallet.currency}
                </div>
                <div className="text-sm text-muted-foreground">
                  ≈ ${wallet.value.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  {wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3 animate-fade-in-up delay-300">
        {/* Send/Receive */}
        <Card className="lg:col-span-1 transition-all duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="send" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="send">Send</TabsTrigger>
                <TabsTrigger value="receive">Receive</TabsTrigger>
              </TabsList>
              
              <TabsContent value="send" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">To Address</label>
                  <Input
                    placeholder="Enter recipient address"
                    value={sendAddress}
                    onChange={(e) => setSendAddress(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount</label>
                  <div className="flex">
                    <Input
                      placeholder="0.00"
                      value={sendAmount}
                      onChange={(e) => setSendAmount(e.target.value)}
                      className="rounded-r-none"
                    />
                    <div className="px-3 py-2 border border-l-0 rounded-r-md bg-muted text-sm">
                      {currentWallet.currency}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Available: {currentWallet.balance} {currentWallet.currency}
                </div>
                <Button className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Send {currentWallet.currency}
                </Button>
              </TabsContent>
              
              <TabsContent value="receive" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your {currentWallet.currency} Address</label>
                  <div className="flex">
                    <Input
                      value={currentWallet.address}
                      readOnly
                      className="rounded-r-none font-mono text-xs"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-l-none"
                      onClick={() => copyToClipboard(currentWallet.address)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-center p-8 bg-muted rounded-lg">
                  <div className="text-center">
                    <QrCode className="h-24 w-24 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">QR Code</p>
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Save QR Code
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Wallet Details */}
        <Card className="lg:col-span-2 transition-all duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle>{currentWallet.name} Details</CardTitle>
            <CardDescription>Wallet information and statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Balance</label>
                  <div className="text-2xl font-bold">
                    {currentWallet.balance} {currentWallet.currency}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ≈ ${currentWallet.value.toLocaleString()}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Wallet Type</label>
                  <div className="text-lg">{currentWallet.type}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      currentWallet.status === 'Active' ? 'bg-green-500' : 'bg-gray-500'
                    }`} />
                    <span>{currentWallet.status}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Address</label>
                  <div className="flex items-center gap-2">
                    <code className="text-sm bg-muted p-2 rounded flex-1 font-mono">
                      {currentWallet.address}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(currentWallet.address)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Network</label>
                  <div className="text-lg">
                    {currentWallet.currency === 'BTC' ? 'Bitcoin' : 
                     currentWallet.currency === 'ETH' ? 'Ethereum' : 'Unknown'}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="animate-fade-in-up delay-500 transition-all duration-200 hover:shadow-md">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Recent wallet transactions</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-sm text-muted-foreground">
                  <th className="text-left p-4">Type</th>
                  <th className="text-left p-4">Asset</th>
                  <th className="text-right p-4">Amount</th>
                  <th className="text-left p-4">From/To</th>
                  <th className="text-right p-4">Fee</th>
                  <th className="text-center p-4">Confirmations</th>
                  <th className="text-left p-4">Time</th>
                  <th className="text-center p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {tx.type === 'Received' ? (
                          <ArrowDownRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 text-red-600" />
                        )}
                        <span className={tx.type === 'Received' ? 'text-green-600' : 'text-red-600'}>
                          {tx.type}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-medium">{tx.currency}</td>
                    <td className="p-4 text-right font-mono">
                      {tx.type === 'Received' ? '+' : '-'}{tx.amount} {tx.currency}
                    </td>
                    <td className="p-4">
                      <div className="text-xs font-mono">
                        <div>From: {tx.from}</div>
                        <div>To: {tx.to}</div>
                      </div>
                    </td>
                    <td className="p-4 text-right text-sm">
                      {tx.fee} {tx.currency}
                    </td>
                    <td className="p-4 text-center">
                      <Badge variant={tx.confirmations >= 6 ? 'default' : 'secondary'}>
                        {tx.confirmations}/6
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {tx.timestamp}
                    </td>
                    <td className="p-4 text-center">
                      <Badge variant={tx.status === 'Confirmed' ? 'default' : 'secondary'}>
                        {tx.status}
                      </Badge>
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
