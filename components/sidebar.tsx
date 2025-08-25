"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  Briefcase,
  CreditCard,
  Home,
  PieChart,
  Settings,
  TrendingUp,
  Wallet,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    name: "Portfolio",
    href: "/portfolio",
    icon: Briefcase,
  },
  {
    name: "Trading",
    href: "/trading",
    icon: TrendingUp,
  },
  {
    name: "Market",
    href: "/market",
    icon: BarChart3,
  },
  {
    name: "Wallet",
    href: "/wallet",
    icon: Wallet,
  },
  {
    name: "Staking",
    href: "/staking",
    icon: PieChart,
  },
  {
    name: "Cards",
    href: "/cards",
    icon: CreditCard,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-card border-r  border-border outline-ring/50">
      <div className="flex h-16 items-center border-b px-6 border-border outline-ring/50">
        <div className="flex items-center gap-2 font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            C
          </div>
          <span className="text-lg">CRYPTO</span>
        </div>
      </div>
      
      <nav className="flex-1 space-y-1 px-3 py-4  border-border outline-ring/50">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 cursor-pointer",
                  isActive && "bg-secondary"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          )
        })}
      </nav>
      
      <div className="border-t p-3 border-border outline-ring/50">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" className="cursor-pointer">
            <Settings className="h-4 w-4" />
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}
