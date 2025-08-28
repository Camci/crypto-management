"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function LoadingSkeleton() {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 md:h-8 bg-muted rounded-md w-32 md:w-48 animate-pulse" />
          <div className="h-3 md:h-4 bg-muted rounded-md w-48 md:w-64 animate-pulse" />
        </div>
      </div>

      {/* Cards Skeleton */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-3 md:h-4 bg-muted rounded w-16 md:w-20 animate-pulse" />
              <div className="h-3 md:h-4 w-3 md:w-4 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-6 md:h-8 bg-muted rounded w-20 md:w-24 mb-2 animate-pulse" />
              <div className="h-2 md:h-3 bg-muted rounded w-12 md:w-16 animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-2 transition-all duration-200">
          <CardHeader>
            <div className="h-5 md:h-6 bg-muted rounded w-24 md:w-32 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-48 md:h-64 bg-muted rounded animate-pulse" />
          </CardContent>
        </Card>
        
        <Card className="transition-all duration-200">
          <CardHeader>
            <div className="h-5 md:h-6 bg-muted rounded w-20 md:w-28 animate-pulse" />
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-muted rounded-full animate-pulse" />
                  <div className="space-y-1">
                    <div className="h-3 md:h-4 bg-muted rounded w-10 md:w-12 animate-pulse" />
                    <div className="h-2 md:h-3 bg-muted rounded w-12 md:w-16 animate-pulse" />
                  </div>
                </div>
                <div className="space-y-1 text-right">
                  <div className="h-3 md:h-4 bg-muted rounded w-12 md:w-16 animate-pulse" />
                  <div className="h-2 md:h-3 bg-muted rounded w-8 md:w-12 animate-pulse" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function PageLoadingSkeleton({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Fixed Header - No Animation to Prevent Flicker */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm md:text-base text-muted-foreground">{description}</p>
        </div>
      </div>

      {/* Loading Content */}
      <div className="flex items-center justify-center min-h-[300px] md:min-h-[400px]">
        <div className="text-center space-y-3 md:space-y-4">
          <div className="animate-spin h-6 w-6 md:h-8 md:w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-sm md:text-base text-muted-foreground">Loading data...</p>
        </div>
      </div>
    </div>
  )
}
