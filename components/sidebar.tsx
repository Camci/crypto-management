"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import {
  BarChart3,
  Book,
  Briefcase,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Home,
  Monitor,
  PieChart,
  Settings,
  TrendingUp,
  Wallet,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const cmsNavigation = [
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

const otherNavigation = [
  {
    name: "LMS",
    href: "/lms",
    icon: Book,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isCmsOpen, setIsCmsOpen] = useState(true)

  // Check if any CMS route is active
  const isCmsRouteActive = cmsNavigation.some(item => pathname === item.href)
  const isLmsRoute = pathname === "/lms"

  // Set initial state based on current route, but allow manual control
  useEffect(() => {
    if (isLmsRoute && isCmsOpen) {
      // Only close CMS if it's currently open and we're on LMS route
      // This prevents forcing it closed when user manually opened it
      setIsCmsOpen(false)
    } else if (isCmsRouteActive && !isCmsOpen) {
      // Open CMS when navigating to CMS routes
      setIsCmsOpen(true)
    }
  }, [pathname]) // Only depend on pathname changes, not isCmsOpen

  return (
    <div className="h-full w-64 flex-col bg-card border-r border-border outline-ring/50">
      <div className="flex h-16 items-center border-b px-6 border-border outline-ring/50">
        <div className="flex items-center gap-2 font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            C
          </div>
          <span className="text-lg">CRYPTO</span>
        </div>
      </div>
      
      <nav className="flex-1 space-y-1 px-3 py-4 border-border outline-ring/50">
        {/* CMS Collapsible Section */}
        <Collapsible open={isCmsOpen} onOpenChange={setIsCmsOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant={isCmsRouteActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 cursor-pointer",
                isCmsRouteActive && "bg-secondary"
              )}
            >
              <Monitor className="h-4 w-4" />
              <span className="flex-1 text-left">CMS</span>
              {isCmsOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-1 transition-all duration-200 ease-in-out">
            {cmsNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-4/5 mt-2 justify-start gap-3 cursor-pointer ml-4",
                      isActive && "bg-secondary"
                    )}
                    size="sm"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              )
            })}
          </CollapsibleContent>
        </Collapsible>

        {/* Other Navigation Items */}
        {otherNavigation.map((item) => {
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