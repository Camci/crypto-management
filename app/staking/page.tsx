"use client"

import { useState } from "react"
import { ArrowUpRight, Clock, Coins, TrendingUp, Lock, Unlock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

const stakingPools = [
  {
    asset: "ETH",
    name: "Ethereum 2.0",
    apy: 5.2,
    minStake: 0.01,
    lockPeriod: "Flexible",
    totalStaked: 123456.78,
    myStaked: 8.4521,
    rewards: 0.1234,
    status: "Active",
    icon: "Ξ",
    color: "text-blue-500"
  },
  {
    asset: "ADA",
    name: "Cardano",
    apy: 4.8,
    minStake: 10,
    lockPeriod: "5 days",
    totalStaked: 987654.32,
    myStaked: 250.0,
    rewards: 2.45,
    status: "Active",
    icon: "◈",
    color: "text-blue-600"
  },
  {
    asset: "DOT",
    name: "Polkadot",
    apy: 12.3,
    minStake: 1,
    lockPeriod: "28 days",
    totalStaked: 45678.90,
    myStaked: 15.5,
    rewards: 0.89,
    status: "Active",
    icon: "●",
    color: "text-pink-500"
  },
  {
    asset: "SOL",
    name: "Solana",
    apy: 7.1,
    minStake: 0.1,
    lockPeriod: "Flexible",
    totalStaked: 234567.89,
    myStaked: 0,
    rewards: 0,
    status: "Available",
    icon: "◉",
    color: "text-purple-500"
  }
]

const stakingHistory = [
  {
    action: "Stake",
    asset: "ETH",
    amount: 2.0,
    apy: 5.2,
    date: "2024-01-10",
    status: "Active",
    rewards: 0.0234
  },
  {
    action: "Unstake",
    asset: "ADA",
    amount: 50.0,
    apy: 4.8,
    date: "2024-01-08",
    status: "Completed",
    rewards: 1.23
  },
  {
    action: "Claim",
    asset: "DOT",
    amount: 0.0,
    apy: 12.3,
    date: "2024-01-05",
    status: "Completed",
    rewards: 0.45
  }
]

export default function StakingPage() {
  const [selectedPool, setSelectedPool] = useState(0)
  const [stakeAmount, setStakeAmount] = useState("")
  const [unstakeAmount, setUnstakeAmount] = useState("")

  const currentPool = stakingPools[selectedPool]
  const totalStaked = stakingPools.reduce((sum, pool) => sum + pool.myStaked, 0)
  const totalRewards = stakingPools.reduce((sum, pool) => sum + pool.rewards, 0)
  const avgApy = stakingPools.filter(p => p.myStaked > 0).reduce((sum, pool, _, arr) => 
    sum + pool.apy / arr.length, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in-up delay-100">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staking</h1>
          <p className="text-muted-foreground">Earn rewards by staking your cryptocurrencies</p>
        </div>
        <Button className="cursor-pointer">
          <Coins className="h-4 w-4 mr-2" />
          Claim All Rewards
        </Button>
      </div>

      {/* Staking Overview */}
      <div className="grid gap-6 md:grid-cols-4 animate-fade-in-up delay-200">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staked</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalStaked * 2500).toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Across {stakingPools.filter(p => p.myStaked > 0).length} pools</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${(totalRewards * 2500).toLocaleString()}</div>
            <div className="text-xs text-green-600">+12.3% this month</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average APY</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgApy.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">Annual percentage yield</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Pools</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stakingPools.filter(p => p.myStaked > 0).length}</div>
            <div className="text-xs text-muted-foreground">Out of {stakingPools.length} available</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 animate-fade-in-up delay-300 border-border outline-ring/50">
        {/* Staking Pools */}
        <Card className="lg:col-span-2 transition-all duration-200 hover:shadow-md border-border outline-ring/50">
          <CardHeader>
            <CardTitle>Available Staking Pools</CardTitle>
            <CardDescription>Choose a pool to start earning rewards</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {stakingPools.map((pool, index) => (
                <div 
                  key={pool.asset}
                  className={`p-4 cursor-pointer hover:bg-muted/50 ${
                    selectedPool === index ? 'bg-muted' : ''
                  }`}
                  onClick={() => setSelectedPool(index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg font-bold ${pool.color}`}>
                        {pool.icon}
                      </div>
                      <div>
                        <div className="font-medium">{pool.name}</div>
                        <div className="text-sm text-muted-foreground">{pool.asset}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">{pool.apy}% APY</div>
                      <div className="text-sm text-muted-foreground">
                        Min: {pool.minStake} {pool.asset}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={pool.status === 'Active' && pool.myStaked > 0 ? 'default' : 'secondary'}>
                        {pool.myStaked > 0 ? 'Staked' : pool.status}
                      </Badge>
                      <div className="text-sm text-muted-foreground mt-1">
                        {pool.lockPeriod}
                      </div>
                    </div>
                  </div>
                  {pool.myStaked > 0 && (
                    <div className="mt-3 pt-3 border-t border-border outline-ring/50">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">My Stake:</span>
                          <div className="font-medium">{pool.myStaked} {pool.asset}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Rewards:</span>
                          <div className="font-medium text-green-600">{pool.rewards} {pool.asset}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <div className="font-medium">{pool.status}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stake/Unstake Panel */}
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle>{currentPool.name}</CardTitle>
            <CardDescription>Manage your stake in this pool</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="stake" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="stake" className="cursor-pointer">Stake</TabsTrigger>
                <TabsTrigger value="unstake" className="cursor-pointer">Unstake</TabsTrigger>
              </TabsList>
              
              <TabsContent value="stake" className="space-y-4">
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">APY:</span>
                        <div className="text-lg font-bold text-green-600">{currentPool.apy}%</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Lock Period:</span>
                        <div className="font-medium">{currentPool.lockPeriod}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Min Stake:</span>
                        <div className="font-medium">{currentPool.minStake} {currentPool.asset}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">My Balance:</span>
                        <div className="font-medium">25.0 {currentPool.asset}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Amount to Stake</label>
                    <div className="flex">
                      <Input
                        placeholder="0.00"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                        className="rounded-r-none"
                      />
                      <div className="px-3 py-2 border border-l-0 rounded-r-md bg-muted text-sm border-border outline-ring/50">
                        {currentPool.asset}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2">
                    <Button variant="outline" className="cursor-pointer" size="sm">25%</Button>
                    <Button variant="outline" className="cursor-pointer" size="sm">50%</Button>
                    <Button variant="outline" className="cursor-pointer" size="sm">75%</Button>
                    <Button variant="outline" className="cursor-pointer" size="sm">Max</Button>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Estimated rewards: ~0.05 {currentPool.asset}/month
                  </div>
                  
                  <Button className="w-full cursor-pointer">
                    <Lock className="h-4 w-4 mr-2" />
                    Stake {currentPool.asset}
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="unstake" className="space-y-4">
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Staked:</span>
                        <div className="font-medium">{currentPool.myStaked} {currentPool.asset}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Rewards:</span>
                        <div className="font-medium text-green-600">{currentPool.rewards} {currentPool.asset}</div>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Unstaking Period:</span>
                        <div className="font-medium">{currentPool.lockPeriod}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Amount to Unstake</label>
                    <div className="flex">
                      <Input
                        placeholder="0.00"
                        value={unstakeAmount}
                        onChange={(e) => setUnstakeAmount(e.target.value)}
                        className="rounded-r-none"
                      />
                      <div className="px-3 py-2 border border-l-0 rounded-r-md bg-muted text-sm">
                        {currentPool.asset}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2">
                    <Button variant="outline" className="cursor-pointer" size="sm">25%</Button>
                    <Button variant="outline" className="cursor-pointer" size="sm">50%</Button>
                    <Button variant="outline" className="cursor-pointer" size="sm">75%</Button>
                    <Button variant="outline" className="cursor-pointer" size="sm">All</Button>
                  </div>
                  
                  {currentPool.rewards > 0 && (
                    <Button variant="outline" className="w-full cursor-pointer">
                      <Coins className="h-4 w-4 mr-2" />
                      Claim {currentPool.rewards} {currentPool.asset} Rewards
                    </Button>
                  )}
                  
                  <Button variant="destructive" className="w-full cursor-pointer">
                    <Unlock className="h-4 w-4 mr-2" />
                    Unstake {currentPool.asset}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Staking History */}
      <Card className="animate-fade-in-up delay-500 transition-all duration-200 hover:shadow-md">
        <CardHeader>
          <CardTitle>Staking History</CardTitle>
          <CardDescription>Your staking and reward history</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border outline-ring/50">
                <tr className="text-sm text-muted-foreground">
                  <th className="text-left p-4">Action</th>
                  <th className="text-left p-4">Asset</th>
                  <th className="text-right p-4">Amount</th>
                  <th className="text-right p-4">APY</th>
                  <th className="text-right p-4">Rewards</th>
                  <th className="text-left p-4">Date</th>
                  <th className="text-center p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {stakingHistory.map((record, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50 border-border outline-ring/50">
                    <td className="p-4">
                      <div className={`px-2 py-1 rounded text-xs font-medium inline-block ${
                        record.action === 'Stake' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        record.action === 'Unstake' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                      }`}>
                        {record.action}
                      </div>
                    </td>
                    <td className="p-4 font-medium">{record.asset}</td>
                    <td className="p-4 text-right">
                      {record.amount > 0 ? `${record.amount} ${record.asset}` : '-'}
                    </td>
                    <td className="p-4 text-right">{record.apy}%</td>
                    <td className="p-4 text-right text-green-600">
                      +{record.rewards} {record.asset}
                    </td>
                    <td className="p-4">{record.date}</td>
                    <td className="p-4 text-center">
                      <Badge variant={record.status === 'Active' ? 'default' : 'secondary'}>
                        {record.status}
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
