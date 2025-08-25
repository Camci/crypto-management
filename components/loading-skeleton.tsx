"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 bg-muted rounded-md w-48 animate-pulse" />
          <div className="h-4 bg-muted rounded-md w-64 animate-pulse" />
        </div>
      </div>

      {/* Cards Skeleton */}
      <div className="grid gap-6 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-20 animate-pulse" />
              <div className="h-4 w-4 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-24 mb-2 animate-pulse" />
              <div className="h-3 bg-muted rounded w-16 animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 transition-all duration-200">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-32 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded animate-pulse" />
          </CardContent>
        </Card>
        
        <Card className="transition-all duration-200">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-28 animate-pulse" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
                  <div className="space-y-1">
                    <div className="h-4 bg-muted rounded w-12 animate-pulse" />
                    <div className="h-3 bg-muted rounded w-16 animate-pulse" />
                  </div>
                </div>
                <div className="space-y-1 text-right">
                  <div className="h-4 bg-muted rounded w-16 animate-pulse" />
                  <div className="h-3 bg-muted rounded w-12 animate-pulse" />
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
    <div className="space-y-6">
      {/* Fixed Header - No Animation to Prevent Flicker */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>

      {/* Loading Content */}
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Loading data...</p>
        </div>
      </div>
    </div>
  )
}
