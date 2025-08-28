"use client"

import React, { useState, useEffect } from 'react'
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  FileCheck, 
  Settings,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  BarChart3,
  Flag,
  UserCheck,
  FileImage,
  Upload,
  Download,
  Filter,
  Search,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  AlertCircle,
  DollarSign,
  Wallet,
  Target,
  Bell,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

// Import API services
import { lmsRestAPI, type Transaction, type KYCApplication, type RiskAlert, type LimitTemplate } from "@/lib/lms-api"
import { lmsGraphQL, type GraphQLTransaction, type GraphQLKYCApplication, type GraphQLRiskAlert, type GraphQLDashboardData } from "@/lib/lms-graphql"
import LiveBadge from "@/components/LiveBadge"

// Loading and error types
interface LoadingState {
  dashboard: boolean
  transactions: boolean
  kyc: boolean
  alerts: boolean
}

interface ErrorState {
  dashboard: string | null
  transactions: string | null
  kyc: string | null
  alerts: string | null
}

function LMS() {
  const [selectedTab, setSelectedTab] = useState("dashboard")
  
  // Data states using both REST and GraphQL
  const [dashboardData, setDashboardData] = useState<GraphQLDashboardData | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [kycApplications, setKYCApplications] = useState<KYCApplication[]>([])
  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>([])
  const [limitTemplates, setLimitTemplates] = useState<LimitTemplate[]>([])
  const [lastSavedData, setLastSavedData] = useState<Date | null>(null)
  
  // Officer examination states
  const [isExaminingKYC, setIsExaminingKYC] = useState(false)
  const [isExaminingTransaction, setIsExaminingTransaction] = useState(false)
  const [selectedKYCApplication, setSelectedKYCApplication] = useState<KYCApplication | null>(null)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  
  // New data indicators
  const [hasNewKYCData, setHasNewKYCData] = useState(false)
  const [hasNewTransactionData, setHasNewTransactionData] = useState(false)
  const [flaggedTransactions, setFlaggedTransactions] = useState<Set<string>>(new Set()) // for tracking flagged transactions
  const [flaggingInProgress, setFlaggingInProgress] = useState<Set<string>>(new Set()) // for tracking flagging operations
  
  // Create Template modal state
  const [isCreateTemplateModalOpen, setIsCreateTemplateModalOpen] = useState(false)
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    userLevel: 'LEVEL_1',
    dailyWithdrawalLimit: '',
    monthlyWithdrawalLimit: '',
    singleTransactionLimit: '',
    dailyDepositLimit: '',
    monthlyDepositLimit: ''
  })
  
  // Loading states
  const [loading, setLoading] = useState<LoadingState>({
    dashboard: true,
    transactions: true,
    kyc: true,
    alerts: true
  })
  
  // Error states
  const [errors, setErrors] = useState<ErrorState>({
    dashboard: null,
    transactions: null,
    kyc: null,
    alerts: null
  })
  
  const [filters, setFilters] = useState({
    status: 'ALL',
    riskLevel: 'ALL',
    timeframe: '24h'
  })
  
  // Cache management system
  const [dataCache, setDataCache] = useState<{
    dashboard: { data: GraphQLDashboardData | null; lastFetch: Date | null; ttl: number },
    transactions: { data: Transaction[]; lastFetch: Date | null; ttl: number },
    kyc: { data: KYCApplication[]; lastFetch: Date | null; ttl: number },
    alerts: { data: RiskAlert[]; lastFetch: Date | null; ttl: number },
    templates: { data: LimitTemplate[]; lastFetch: Date | null; ttl: number }
  }>({
    dashboard: { data: null, lastFetch: null, ttl: 30000 }, // 30 seconds
    transactions: { data: [], lastFetch: null, ttl: 15000 }, // 15 seconds
    kyc: { data: [], lastFetch: null, ttl: 60000 }, // 60 seconds
    alerts: { data: [], lastFetch: null, ttl: 20000 }, // 20 seconds
    templates: { data: [], lastFetch: null, ttl: 120000 } // 2 minutes
  })
  
  // Webhook event simulation
  const [webhookEvents, setWebhookEvents] = useState<Array<{
    id: string;
    type: 'transaction' | 'kyc' | 'alert' | 'limit';
    action: 'created' | 'updated' | 'deleted';
    timestamp: Date;
    data: any;
  }>>([])
  
  // Real-time event intervals
  const [eventIntervals, setEventIntervals] = useState<{
    webhooks: NodeJS.Timeout | null;
    smartRefresh: NodeJS.Timeout | null;
  }>({
    webhooks: null,
    smartRefresh: null
  })

  // Load initial data using different APIs
  useEffect(() => {
    console.log('🚀 [INITIAL LOAD] Loading all LMS data on component mount...')
    loadDashboardData()
    loadTransactions()
    loadKYCApplications()
    loadRiskAlerts()
    loadLimitTemplates()
  }, [])

  // Check if data needs refresh based on cache TTL
  const needsRefresh = (cacheKey: keyof typeof dataCache): boolean => {
    const cache = dataCache[cacheKey]
    if (!cache.lastFetch) return true
    return Date.now() - cache.lastFetch.getTime() > cache.ttl
  }

  // GraphQL: Load dashboard data with caching
  const loadDashboardData = async (force: boolean = false) => {
    if (!force && !needsRefresh('dashboard')) {
      console.log('🎯 [CACHE] Dashboard data still fresh, using cache')
      return
    }
    
    try {
      console.log('🔄 [GraphQL] Loading dashboard data...', new Date().toLocaleTimeString())
      setLoading(prev => ({ ...prev, dashboard: true }))
      setErrors(prev => ({ ...prev, dashboard: null }))
      
      const data = await lmsGraphQL.getDashboardData()
      console.log('✅ [GraphQL] Dashboard data loaded:', {
        activeAlerts: data?.systemStatus?.activeAlerts,
        pendingKyc: data?.systemStatus?.pendingKyc,
        dailyVolume: data?.systemStatus?.dailyVolume,
        riskDistribution: data?.riskDistribution
      })
      
      setDashboardData(data || null)
      setDataCache(prev => ({
        ...prev,
        dashboard: { ...prev.dashboard, data: data || null, lastFetch: new Date() }
      }))
    } catch (error) {
      console.error('❌ [GraphQL] Dashboard data error:', error)
      setErrors(prev => ({ ...prev, dashboard: 'Failed to load dashboard data' }))
    } finally {
      setLoading(prev => ({ ...prev, dashboard: false }))
    }
  }

  // REST API: Load transactions with caching
  const loadTransactions = async (force: boolean = false) => {
    if (!force && !needsRefresh('transactions')) {
      console.log('🎯 [CACHE] Transactions data still fresh, using cache')
      return
    }
    
    try {
      console.log('🔄 [REST API] Loading transactions...', new Date().toLocaleTimeString())
      setLoading(prev => ({ ...prev, transactions: true }))
      setErrors(prev => ({ ...prev, transactions: null }))
      
      const response = await lmsRestAPI.getTransactions({
        limit: 50
      })
      console.log('✅ [REST API] Transactions loaded:', response.results.length, 'transactions')
      
      // Apply client-side filtering for all filters (mock API doesn't handle server-side filtering)
      let filteredTransactions = response.results

      // Filter by status (client-side)
      if (filters.status !== 'ALL') {
        filteredTransactions = filteredTransactions.filter(tx => {
          return tx.status === filters.status
        })
      }

      // Filter by risk level (client-side)
      if (filters.riskLevel !== 'ALL') {
        filteredTransactions = filteredTransactions.filter(tx => {
          const riskScore = tx.risk_score
          switch (filters.riskLevel) {
            case 'HIGH':
              return riskScore >= 80
            case 'MEDIUM':
              return riskScore >= 40 && riskScore < 80
            case 'MINIMAL':
              return riskScore < 40
            default:
              return true
          }
        })
      }

      // Filter by timeframe (client-side)
      if (filters.timeframe !== '24h') { // Changed from 'all' to '24h' as default
        const now = Date.now()
        const timeframeLimits = {
          '24h': 24 * 60 * 60 * 1000,
          '7d': 7 * 24 * 60 * 60 * 1000,
          '30d': 30 * 24 * 60 * 60 * 1000,
          'all': Infinity
        }
        
        const timeLimit = timeframeLimits[filters.timeframe as keyof typeof timeframeLimits]
        if (timeLimit && timeLimit !== Infinity) {
          filteredTransactions = filteredTransactions.filter(tx => {
            return now - new Date(tx.timestamp).getTime() <= timeLimit
          })
        }
      }
      
      console.log(`🔍 [FILTER] Applied filters - Status: ${filters.status}, Risk: ${filters.riskLevel}, Time: ${filters.timeframe}`)
      console.log(`📊 [FILTER] Results: ${response.results.length} → ${filteredTransactions.length} transactions`)
      
      setTransactions(filteredTransactions)
      setDataCache(prev => ({
        ...prev,
        transactions: { ...prev.transactions, data: response.results, lastFetch: new Date() }
      }))
      
      // Note: New data indicator is managed by webhook/cache refresh logic
    } catch (error) {
      console.error('❌ [REST API] Transactions error:', error)
      setErrors(prev => ({ ...prev, transactions: 'Failed to load transactions' }))
    } finally {
      setLoading(prev => ({ ...prev, transactions: false }))
    }
  }

  // REST API: Load KYC applications with caching
  const loadKYCApplications = async (force: boolean = false) => {
    if (!force && !needsRefresh('kyc')) {
      console.log('🎯 [CACHE] KYC applications data still fresh, using cache')
      return
    }
    
    try {
      console.log('🔄 [REST API] Loading KYC applications...', new Date().toLocaleTimeString())
      setLoading(prev => ({ ...prev, kyc: true }))
      setErrors(prev => ({ ...prev, kyc: null }))
      
      const response = await lmsRestAPI.getKYCApplications({
        status: 'UNDER_REVIEW,REQUIRES_ACTION',
        limit: 20
      })
      console.log('✅ [REST API] KYC applications loaded:', response.results.length, 'applications')
      
      setKYCApplications(response.results)
      setDataCache(prev => ({
        ...prev,
        kyc: { ...prev.kyc, data: response.results, lastFetch: new Date() }
      }))
      
      // Note: New data indicator is managed by webhook/cache refresh logic
    } catch (error) {
      console.error('❌ [REST API] KYC applications error:', error)
      setErrors(prev => ({ ...prev, kyc: 'Failed to load KYC applications' }))
    } finally {
      setLoading(prev => ({ ...prev, kyc: false }))
    }
  }

  // GraphQL: Load risk alerts with caching
  const loadRiskAlerts = async (force: boolean = false) => {
    if (!force && !needsRefresh('alerts')) {
      console.log('🎯 [CACHE] Risk alerts data still fresh, using cache')
      return
    }
    
    try {
      console.log('🔄 [GraphQL] Loading risk alerts...', new Date().toLocaleTimeString())
      setLoading(prev => ({ ...prev, alerts: true }))
      setErrors(prev => ({ ...prev, alerts: null }))
      
      const alerts = await lmsGraphQL.getRiskAlerts({
        status: 'ACTIVE,INVESTIGATING',
        limit: 10
      })
      console.log('✅ [GraphQL] Risk alerts loaded:', alerts.length, 'alerts')
      
      const processedAlerts = alerts.map(alert => ({
        id: alert.id,
        type: alert.type as "HIGH_RISK_TRANSACTION" | "PATTERN_MATCH" | "KYC_VERIFICATION" | "COMPLIANCE_VIOLATION",
        severity: alert.severity as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
        title: alert.title,
        description: alert.description,
        timestamp: alert.timestamp,
        status: alert.status as "ACTIVE" | "INVESTIGATING" | "RESOLVED" | "DISMISSED",
        user_id: alert.relatedEntities.user?.id,
        transaction_id: alert.relatedEntities.transaction?.id,
        risk_score: alert.riskScore || 0,
        created_at: alert.timestamp,
        updated_at: alert.timestamp
      }))
      
      setRiskAlerts(processedAlerts)
      setDataCache(prev => ({
        ...prev,
        alerts: { ...prev.alerts, data: processedAlerts, lastFetch: new Date() }
      }))
    } catch (error) {
      console.error('❌ [GraphQL] Risk alerts error:', error)
      setErrors(prev => ({ ...prev, alerts: 'Failed to load risk alerts' }))
    } finally {
      setLoading(prev => ({ ...prev, alerts: false }))
    }
  }

  // REST API: Load limit templates with caching
  const loadLimitTemplates = async (force: boolean = false) => {
    if (!force && !needsRefresh('templates')) {
      console.log('🎯 [CACHE] Limit templates data still fresh, using cache')
      return
    }
    
    try {
      console.log('🔄 [REST API] Loading limit templates...', new Date().toLocaleTimeString())
      const response = await lmsRestAPI.getLimitTemplates()
      console.log('✅ [REST API] Limit templates loaded:', response.results.length, 'templates')
      
      setLimitTemplates(response.results)
      setDataCache(prev => ({
        ...prev,
        templates: { ...prev.templates, data: response.results, lastFetch: new Date() }
      }))
    } catch (error) {
      console.error('❌ [REST API] Limit templates error:', error)
    }
  }

    // Webhook event simulator
  const simulateWebhookEvent = () => {
    const eventTypes = [
      { type: 'transaction' as const, action: 'created' as const, message: 'New high-risk transaction detected' },
      { type: 'alert' as const, action: 'created' as const, message: 'Risk alert triggered' },
      { type: 'kyc' as const, action: 'updated' as const, message: 'KYC status updated' },
      { type: 'transaction' as const, action: 'updated' as const, message: 'Transaction flagged' }
    ]
    
    const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)]
    const event = {
      id: `evt_${Date.now()}`,
      ...randomEvent,
      timestamp: new Date(),
      data: { id: `${randomEvent.type}_${Math.floor(Math.random() * 1000)}` }
    }
    
    console.log('🔔 [WEBHOOK] Event received:', event.type, event.action, '-', event.message)
    
    setWebhookEvents(prev => [event, ...prev.slice(0, 9)]) // Keep last 10 events
    
    // Trigger selective data refresh based on webhook event
    switch (event.type) {
      case 'transaction':
        console.log('🎯 [WEBHOOK] → Transaction webhook received')
        console.log(`🔍 [WEBHOOK DEBUG] selectedTab: ${selectedTab}, isExaminingTransaction: ${isExaminingTransaction}`)
        
        // Smart refresh logic: only show indicator if on transactions tab, otherwise auto refresh
        if (selectedTab === 'transactions') {
          console.log('🔍 [WEBHOOK] On transactions tab - showing new data indicator instead of auto-refresh')
          setHasNewTransactionData(true)
        } else {
          console.log('🔄 [WEBHOOK] Not on transactions tab - auto refreshing')
          loadTransactions(true)
        }
        loadDashboardData(true) // Dashboard needs update for counters
        break
      case 'alert':
        console.log('🎯 [WEBHOOK] → Refreshing Risk Alerts due to webhook')
        loadRiskAlerts(true)
        loadDashboardData(true)
        break
      case 'kyc':
        console.log('🎯 [WEBHOOK] → KYC webhook received')
        console.log(`🔍 [WEBHOOK DEBUG] selectedTab: ${selectedTab}, isExaminingKYC: ${isExaminingKYC}`)
        
        // Smart refresh logic: only show indicator if on KYC tab, otherwise auto refresh
        if (selectedTab === 'kyc') {
          console.log('🔍 [WEBHOOK] On KYC tab - showing new data indicator instead of auto-refresh')
          setHasNewKYCData(true)
        } else {
          console.log('🔄 [WEBHOOK] Not on KYC tab - auto refreshing')
          loadKYCApplications(true)
        }
        loadDashboardData(true)
        break
    }
    
    setLastSavedData(new Date())
  }

  // Smart cache-based refresh system
  useEffect(() => {
    console.log('🚀 [SMART REFRESH] Starting intelligent refresh system...')
    console.log('📋 [CACHE SETTINGS] Dashboard: 30s, Transactions: 15s, KYC: 60s, Alerts: 20s, Templates: 2min')
    
    // Webhook simulation every 8-12 seconds
    const webhookInterval = setInterval(() => {
      if (Math.random() > 0.4) { // 70% chance
        simulateWebhookEvent()
      }
    }, 8000 + Math.random() * 4000)
    
    // Smart refresh check every 5 seconds
    const smartRefreshInterval = setInterval(() => {
      const timestamp = new Date().toLocaleTimeString()
      console.log(`🔍 [SMART REFRESH] Checking cache freshness at ${timestamp}`)
      
      // Check each data type's cache
      const refreshNeeded = []
      if (needsRefresh('dashboard')) refreshNeeded.push('dashboard')
      if (needsRefresh('transactions')) refreshNeeded.push('transactions') 
      if (needsRefresh('alerts')) refreshNeeded.push('alerts')
      if (needsRefresh('kyc')) refreshNeeded.push('kyc')
      if (needsRefresh('templates')) refreshNeeded.push('templates')
      
      if (refreshNeeded.length > 0) {
        console.log(`🔄 [SMART REFRESH] Cache expired for: ${refreshNeeded.join(', ')}`)
        
        // Selective refresh based on what's expired
        refreshNeeded.forEach(dataType => {
          switch (dataType) {
            case 'dashboard':
              console.log('📈 [CACHE REFRESH] → Dashboard (GraphQL)')
              loadDashboardData()
              break
            case 'transactions':
              console.log('📊 [CACHE REFRESH] → Transactions (REST API)')
              console.log(`🔍 [CACHE DEBUG] selectedTab: ${selectedTab}, isExaminingTransaction: ${isExaminingTransaction}`)
              
              // Smart refresh logic: only show indicator if on transactions tab, otherwise auto refresh
              if (selectedTab === 'transactions') {
                console.log('🔍 [CACHE] On transactions tab - showing new data indicator instead of auto-refresh')
                setHasNewTransactionData(true)
              } else {
                console.log('🔄 [CACHE] Not on transactions tab - auto refreshing')
                loadTransactions()
              }
              break
            case 'alerts':
              console.log('🚨 [CACHE REFRESH] → Risk Alerts (GraphQL)')
              loadRiskAlerts()
              break
            case 'kyc':
              console.log('👤 [CACHE REFRESH] → KYC Applications (REST API)')
              console.log(`🔍 [CACHE DEBUG] selectedTab: ${selectedTab}, isExaminingKYC: ${isExaminingKYC}`)
              
              // Smart refresh logic: only show indicator if on KYC tab, otherwise auto refresh
              if (selectedTab === 'kyc') {
                console.log('🔍 [CACHE] On KYC tab - showing new data indicator instead of auto-refresh')
                setHasNewKYCData(true)
              } else {
                console.log('🔄 [CACHE] Not on KYC tab - auto refreshing')
                loadKYCApplications()
              }
              break
            case 'templates':
              console.log('📝 [CACHE REFRESH] → Limit Templates (REST API)')
              loadLimitTemplates()
              break
          }
        })
        
        setLastSavedData(new Date())
      } else {
        console.log('✅ [SMART REFRESH] All cache data is still fresh')
      }
    }, 60000)
    
    setEventIntervals({
      webhooks: webhookInterval,
      smartRefresh: smartRefreshInterval
    })

    return () => {
      console.log('🛑 [SMART REFRESH] Stopping intelligent refresh system')
      if (webhookInterval) clearInterval(webhookInterval)
      if (smartRefreshInterval) clearInterval(smartRefreshInterval)
    }
  }, [filters, selectedTab, isExaminingKYC, isExaminingTransaction])

  // Effect to handle filter changes and reload transactions
  useEffect(() => {
    console.log('🔄 [FILTERS] Transaction filters changed, reloading data...', filters)
    loadTransactions(true)
  }, [filters.status, filters.riskLevel, filters.timeframe])

  // Handle actions with API calls
  const handleApproveKYC = async (applicationId: string) => {
    try {
      console.log('🔄 [GraphQL MUTATION] Approving KYC application:', applicationId)
      // Use GraphQL mutation
      const result = await lmsGraphQL.approveKyc(applicationId, "Approved via LMS")
      if (result?.success) {
        console.log('✅ [GraphQL MUTATION] KYC approved, refreshing data...')
        // Refresh data
        loadKYCApplications()
        loadDashboardData()
      }
    } catch (error) {
      console.error('❌ [GraphQL MUTATION] KYC approval error:', error)
    }
  }

  const handleResolveAlert = async (alertId: string) => {
    try {
      console.log('🔄 [GraphQL MUTATION] Resolving alert:', alertId)
      // Use GraphQL mutation
      const result = await lmsGraphQL.resolveAlert(alertId, "Resolved via LMS investigation")
      if (result?.success) {
        console.log('✅ [GraphQL MUTATION] Alert resolved, refreshing data...')
        // Refresh data
        loadRiskAlerts()
        loadDashboardData()
      }
    } catch (error) {
      console.error('❌ [GraphQL MUTATION] Alert resolution error:', error)
    }
  }

  const handleFlagTransaction = async (transactionId: string, reason: string) => {
    try {
      console.log('🔄 [GraphQL MUTATION] Flagging transaction:', transactionId, 'Reason:', reason)
      
      // Set flagging in progress
      setFlaggingInProgress(prev => new Set([...prev, transactionId]))
      
      // Use GraphQL mutation
      const result = await lmsGraphQL.flagTransaction(transactionId, reason)
      if (result?.success) {
        console.log('✅ [GraphQL MUTATION] Transaction flagged successfully!')
        
        // Immediately update UI state
        setFlaggedTransactions(prev => new Set([...prev, transactionId]))
        
        // Update the transaction in the current list to show flagged status
        setTransactions(prev => prev.map(tx => 
          tx.id === transactionId 
            ? { ...tx, status: 'FLAGGED' as const, flags: [...(tx.flags || []), 'MANUALLY_FLAGGED'] }
            : tx
        ))
        
        // Refresh data in background
        setTimeout(() => {
          loadTransactions()
          loadRiskAlerts()
          loadDashboardData()
        }, 1000)
      }
    } catch (error) {
      console.error('❌ [GraphQL MUTATION] Transaction flagging error:', error)
      // Show error state if needed
    } finally {
      // Remove from flagging in progress
      setFlaggingInProgress(prev => {
        const updated = new Set(prev)
        updated.delete(transactionId)
        return updated
      })
    }
  }

  // Force refresh all data (bypass cache)
  const refreshAllData = () => {
    console.log('🔄 [MANUAL REFRESH] Force refreshing all data sources (bypass cache)...', new Date().toLocaleTimeString())
    console.log('   → Dashboard (GraphQL) - FORCED')
    console.log('   → Transactions (REST API) - FORCED')
    console.log('   → KYC Applications (REST API) - FORCED')  
    console.log('   → Risk Alerts (GraphQL) - FORCED')
    console.log('   → Limit Templates (REST API) - FORCED')
    
    loadDashboardData(true)
    loadTransactions(true)
    loadKYCApplications(true)
    loadRiskAlerts(true)
    loadLimitTemplates(true)
  }

  // Manual refresh functions for specific tabs
  const refreshKYCData = () => {
    console.log('🔄 [MANUAL KYC REFRESH] Refreshing KYC data...', new Date().toLocaleTimeString())
    loadKYCApplications(true)
    setHasNewKYCData(false)
  }

  const refreshTransactionData = () => {
    console.log('🔄 [MANUAL TRANSACTION REFRESH] Refreshing transaction data...', new Date().toLocaleTimeString())
    loadTransactions(true)
    setHasNewTransactionData(false)
  }

  // Functions to handle examination modes
  const openKYCExamination = (application: KYCApplication) => {
    setSelectedKYCApplication(application)
    setIsExaminingKYC(true)
    setHasNewKYCData(false) // Clear indicator when opening examination
  }

  const closeKYCExamination = () => {
    setSelectedKYCApplication(null)
    setIsExaminingKYC(false)
    setHasNewKYCData(false)
  }

  const openTransactionExamination = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsExaminingTransaction(true)
    setHasNewTransactionData(false) // Clear indicator when opening examination
  }

  const closeTransactionExamination = () => {
    setSelectedTransaction(null)
    setIsExaminingTransaction(false)
    setHasNewTransactionData(false)
  }

  // Handle Create Template functionality
  const handleCreateTemplate = async () => {
    try {
      console.log('🔄 [REST API] Creating new limit template:', newTemplate)
      
      // Create template using REST API
      const templateData = {
        name: newTemplate.name,
        description: newTemplate.description,
        user_level: newTemplate.userLevel,
        daily_withdrawal_limit: parseFloat(newTemplate.dailyWithdrawalLimit) || 0,
        monthly_withdrawal_limit: parseFloat(newTemplate.monthlyWithdrawalLimit) || 0,
        single_transaction_limit: parseFloat(newTemplate.singleTransactionLimit) || 0,
        daily_deposit_limit: parseFloat(newTemplate.dailyDepositLimit) || 0,
        monthly_deposit_limit: parseFloat(newTemplate.monthlyDepositLimit) || 0,
        is_active: true
      }

      // Note: In a real app, you would call the API here
      // const result = await lmsRestAPI.createLimitTemplate(templateData)
      
      console.log('✅ [REST API] Template created successfully!')
      
      // Update the limit templates list
      const newLimitTemplate = {
        id: `template_${Date.now()}`,
        name: templateData.name,
        description: templateData.description,
        daily_withdrawal_limit: templateData.daily_withdrawal_limit,
        monthly_withdrawal_limit: templateData.monthly_withdrawal_limit,
        single_transaction_limit: templateData.single_transaction_limit,
        daily_deposit_limit: templateData.daily_deposit_limit,
        monthly_deposit_limit: templateData.monthly_deposit_limit,
        is_active: templateData.is_active,
        user_level: templateData.user_level,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      setLimitTemplates(prev => [...prev, newLimitTemplate])
      
      // Reset form and close modal
      setNewTemplate({
        name: '',
        description: '',
        userLevel: 'LEVEL_1',
        dailyWithdrawalLimit: '',
        monthlyWithdrawalLimit: '',
        singleTransactionLimit: '',
        dailyDepositLimit: '',
        monthlyDepositLimit: ''
      })
      
      setIsCreateTemplateModalOpen(false)
      
      // Refresh templates data
      setTimeout(() => {
        loadLimitTemplates(true)
      }, 1000)
      
    } catch (error) {
      console.error('❌ [REST API] Template creation error:', error)
    }
  }

  const getRiskBadgeColor = (score: number) => {
    if (score >= 80) return "destructive"
    if (score >= 60) return "outline"
    if (score >= 40) return "secondary"
    return "default"
  }

  const getRiskLabel = (score: number) => {
    if (score >= 80) return "HIGH"
    if (score >= 60) return "MEDIUM"
    if (score >= 40) return "LOW"
    return "MINIMAL"
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'default'
      case 'pending': return 'secondary'
      case 'flagged': return 'destructive'
      case 'approved': return 'default'
      case 'under_review': return 'secondary'
      case 'requires_action': return 'outline'
      case 'active': return 'destructive'
      case 'investigating': return 'outline'
      case 'resolved': return 'default'
      default: return 'secondary'
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up delay-100">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Limit Management System</h1>
          <p className="text-muted-foreground">
            Real-time transaction monitoring, KYC management, and risk assessment
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LiveBadge lastSavedData={lastSavedData} />
          <Badge variant="outline" className="text-xs">
            Django REST + GraphQL
          </Badge>
          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
            🎯 Smart Cache
          </Badge>
          {webhookEvents.length > 0 && (
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
              🔔 {webhookEvents.length} Events
            </Badge>
          )}
          <Button size="sm" variant="outline" onClick={refreshAllData}>
            <RefreshCw className={`h-4 w-4 mr-2 cursor-pointer ${Object.values(loading).some(Boolean) ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" className="transition-all duration-200 hover:scale-105">
            <Settings className="h-4 w-4 mr-2 cursor-pointer" />
            Configure
          </Button>
        </div>
      </div>

      {/* System Status Cards - GraphQL Data */}
      <div className="grid gap-4 md:grid-cols-4 animate-fade-in-up delay-200">
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            {loading.dashboard ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertTriangle className="h-4 w-4 text-red-500" />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {loading.dashboard ? '...' : dashboardData?.systemStatus?.activeAlerts || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {errors.dashboard ? 'Error loading' : 'GraphQL data'}
            </p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending KYC</CardTitle>
            {loading.dashboard ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCheck className="h-4 w-4 text-blue-500" />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {loading.dashboard ? '...' : dashboardData?.systemStatus?.pendingKyc || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {errors.dashboard ? 'Error loading' : 'GraphQL data'}
            </p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Volume</CardTitle>
            {loading.dashboard ? <Loader2 className="h-4 w-4 animate-spin" /> : <DollarSign className="h-4 w-4 text-green-500" />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading.dashboard ? '...' : `$${(dashboardData?.systemStatus?.dailyVolume || 0).toLocaleString()}`}
            </div>
            <p className="text-xs text-muted-foreground">
              {errors.dashboard ? 'Error loading' : 'GraphQL data'}
            </p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Score Avg</CardTitle>
            {loading.dashboard ? <Loader2 className="h-4 w-4 animate-spin" /> : <BarChart3 className="h-4 w-4 text-orange-500" />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading.dashboard ? '...' : dashboardData?.systemStatus?.averageRiskScore || 0}
            </div>
            <Progress value={loading.dashboard ? 0 : dashboardData?.systemStatus?.averageRiskScore || 0} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4 animate-fade-in-up delay-300">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard" className="cursor-pointer">Dashboard</TabsTrigger>
          <TabsTrigger value="transactions" className="cursor-pointer">Transactions</TabsTrigger>
          <TabsTrigger value="kyc" className="cursor-pointer">KYC Management</TabsTrigger>
          <TabsTrigger value="risk" className="cursor-pointer">Risk Alerts</TabsTrigger>
          <TabsTrigger value="limits" className="cursor-pointer">Limit Config</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4 animate-fade-in-up delay-100">
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Live Transaction Feed */}
            <Card className="lg:col-span-2 transition-all duration-200 hover:shadow-md animate-fade-in-up delay-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {loading.transactions ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4 text-green-500" />}
                  Live Transaction Feed
                  <Badge variant="outline" className="text-xs">Django REST</Badge>
                </CardTitle>
                <CardDescription>Real-time monitoring of all transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  <div className="space-y-3">
                    {loading.transactions ? (
                      <div className="flex items-center justify-center h-60">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        <span>Loading transactions from Django REST API...</span>
                      </div>
                    ) : errors.transactions ? (
                      <div className="flex items-center justify-center h-60 text-red-500">
                        <AlertCircle className="h-6 w-6 mr-2" />
                        <span>{errors.transactions}</span>
                      </div>
                    ) : (
                      transactions.slice(0, 8).map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between p-3 border rounded-xl border-gray-200 hover:scale-1.05 transition-all duration-300 hover:shadow-lg cursor-pointer hover:border-gray-400">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{tx.user.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{tx.user}</p>
                              <p className="text-xs text-muted-foreground">
                                {tx.type} {tx.amount} {tx.asset}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <Badge variant={getStatusColor(tx.status)} className={`text-xs ${getStatusColor(tx.status) === 'destructive' ? 'text-white' : ''}`}>
                                {tx.status}
                              </Badge>
                              <Badge variant={getRiskBadgeColor(tx.risk_score)} className={`text-xs ${getRiskBadgeColor(tx.risk_score) === 'destructive' ? 'text-white' : ''}`}>
                                {getRiskLabel(tx.risk_score)}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              ${tx.value.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Risk Score Distribution */}
            <Card className="transition-all duration-200 hover:shadow-md animate-fade-in-up delay-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Risk Distribution
                  <Badge variant="outline" className="text-xs">GraphQL</Badge>
                </CardTitle>
                <CardDescription>Current risk levels from GraphQL</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading.dashboard ? (
                  <div className="flex items-center justify-center h-60">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading...</span>
                  </div>
                ) : dashboardData?.riskDistribution ? (
                  <>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">High Risk (80+)</span>
                        <span className="text-sm font-medium text-red-600">
                          {dashboardData.riskDistribution.high}
                        </span>
                      </div>
                      <Progress 
                        value={(dashboardData.riskDistribution.high / (dashboardData.riskDistribution.high + dashboardData.riskDistribution.medium + dashboardData.riskDistribution.low + dashboardData.riskDistribution.minimal)) * 100} 
                        className="h-2"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Medium Risk (60-79)</span>
                        <span className="text-sm font-medium text-orange-600">
                          {dashboardData.riskDistribution.medium}
                        </span>
                      </div>
                      <Progress 
                        value={(dashboardData.riskDistribution.medium / (dashboardData.riskDistribution.high + dashboardData.riskDistribution.medium + dashboardData.riskDistribution.low + dashboardData.riskDistribution.minimal)) * 100} 
                        className="h-2"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Low Risk (40-59)</span>
                        <span className="text-sm font-medium text-yellow-600">
                          {dashboardData.riskDistribution.low}
                        </span>
                      </div>
                      <Progress 
                        value={(dashboardData.riskDistribution.low / (dashboardData.riskDistribution.high + dashboardData.riskDistribution.medium + dashboardData.riskDistribution.low + dashboardData.riskDistribution.minimal)) * 100} 
                        className="h-2"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Minimal Risk (&lt;40)</span>
                        <span className="text-sm font-medium text-green-600">
                          {dashboardData.riskDistribution.minimal}
                        </span>
                      </div>
                      <Progress 
                        value={(dashboardData.riskDistribution.minimal / (dashboardData.riskDistribution.high + dashboardData.riskDistribution.medium + dashboardData.riskDistribution.low + dashboardData.riskDistribution.minimal)) * 100} 
                        className="h-2"
                      />
                    </div>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground">No data available</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Alerts */}
          <Card className="transition-all duration-200 hover:shadow-md animate-fade-in-up delay-400">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {loading.alerts ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
                Recent Risk Alerts
                <Badge variant="outline" className="text-xs">GraphQL</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loading.alerts ? (
                  <div className="flex items-center justify-center h-60">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading alerts from GraphQL...</span>
                  </div>
                ) : errors.alerts ? (
                  <div className="flex items-center justify-center h-60 text-red-500">
                    <AlertCircle className="h-6 w-6 mr-2" />
                    <span>{errors.alerts}</span>
                  </div>
                ) : (
                  riskAlerts.slice(0, 5).map((alert) => (
                    <Alert key={alert.id} className={alert.severity === 'CRITICAL' ? 'border-red-400' : alert.severity === 'HIGH' ? 'border-orange-400' : 'border-yellow-400'}>
                      <AlertCircle className="h-4 w-4" />
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <AlertTitle className="flex items-center gap-2">
                            {alert.title}
                            <Badge variant={alert.severity === 'CRITICAL' ? 'destructive' : alert.severity === 'HIGH' ? 'outline' : 'secondary'} className={`text-xs ${alert.severity === 'CRITICAL' ? 'text-white' : ''}`}>
                              {alert.severity}
                            </Badge>
                          </AlertTitle>
                          <AlertDescription className="mt-1">
                            {alert.description}
                          </AlertDescription>
                        </div>
                        <div className="text-right">
                          <Badge variant={getStatusColor(alert.status)} className={`text-xs ${getStatusColor(alert.status) === 'destructive' ? 'text-white' : ''}`}>{alert.status}</Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </Alert>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Continue with remaining tabs... */}
        <TabsContent value="transactions" className="space-y-4 animate-fade-in-up delay-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Transaction Monitoring</h2>
              <Badge variant="outline" className="text-xs">Django REST API</Badge>
              {loading.transactions && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
            <div className="flex items-center gap-2 cursor-pointer" >
              <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                <SelectTrigger className="w-32 cursor-pointer">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL" className="cursor-pointer">All Status</SelectItem>
                  <SelectItem value="COMPLETED" className="cursor-pointer">Completed</SelectItem>
                  <SelectItem value="PENDING" className="cursor-pointer">Pending</SelectItem>
                  <SelectItem value="FLAGGED" className="cursor-pointer">Flagged</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filters.riskLevel} onValueChange={(value) => setFilters({...filters, riskLevel: value})}>
                <SelectTrigger className="w-32 cursor-pointer">
                  <SelectValue placeholder="Risk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL" className="cursor-pointer">All Risks</SelectItem>
                  <SelectItem value="HIGH" className="cursor-pointer">High Risk</SelectItem>
                  <SelectItem value="MEDIUM" className="cursor-pointer">Medium Risk</SelectItem>
                  <SelectItem value="MINIMAL" className="cursor-pointer">Low Risk</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.timeframe} onValueChange={(value) => setFilters({...filters, timeframe: value})}>
                <SelectTrigger className="w-32 cursor-pointer">
                  <SelectValue placeholder="Timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h" className="cursor-pointer">Last 24h</SelectItem>
                  <SelectItem value="7d" className="cursor-pointer">Last 7 days</SelectItem>
                  <SelectItem value="30d" className="cursor-pointer">Last 30 days</SelectItem>
                  <SelectItem value="all" className="cursor-pointer">All time</SelectItem>
                </SelectContent>
              </Select>

              <Button size="sm" onClick={refreshTransactionData} className="cursor-pointer">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading.transactions ? 'animate-spin' : ''}`} />
                Refresh
                {hasNewTransactionData && (
                  <Badge variant="destructive" className="ml-2 text-xs animate-pulse text-white">
                    New data!
                  </Badge>
                )}
              </Button>
              <Button size="sm" className="cursor-pointer">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>

          <Card className="transition-all duration-200 hover:shadow-md animate-fade-in-up delay-200">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading.transactions ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-32">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                        <div>Loading transactions from Django REST API...</div>
                      </TableCell>
                    </TableRow>
                  ) : errors.transactions ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-32 text-red-500">
                        <AlertCircle className="h-6 w-6 mx-auto mb-2" />
                        <div>{errors.transactions}</div>
                      </TableCell>
                    </TableRow>
                  ) : transactions.map((tx) => (
                    <TableRow key={tx.id} className='border border-gray-300 hover:bg-muted/50 transition-colors'>
                      <TableCell>
                        <div>
                          <p className="font-medium">{tx.id}</p>
                          <p className="text-xs text-muted-foreground">{new Date(tx.timestamp).toLocaleString()}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">{tx.user.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{tx.user}</p>
                            <p className="text-xs text-muted-foreground">{tx.kyc_level}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{tx.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{tx.amount} {tx.asset}</p>
                          <p className="text-xs text-muted-foreground">${tx.value.toLocaleString()}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={getRiskBadgeColor(tx.risk_score)} className={`${tx.risk_score > 70 ? 'text-white' : ''}`}>
                            {tx.risk_score}
                          </Badge>
                          <span className="text-xs">{getRiskLabel(tx.risk_score)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(tx.status)} className={`${tx.status === 'FLAGGED' ? 'text-white' : ''}`}>{tx.status}</Badge>
                        {tx.flags && (
                          <div className="flex gap-1 mt-1">
                            {tx.flags.map((flag, idx) => (
                              <Badge key={idx} variant="destructive" className="text-xs text-white">
                                {flag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" onClick={() => openTransactionExamination(tx)} className="cursor-pointer">
                            <Eye className="h-3 w-3" />
                          </Button>
                                                      <Button 
                              size="sm" 
                              variant={flaggedTransactions.has(tx.id) || tx.status === 'FLAGGED' ? 'destructive' : 'ghost'}
                              className={`${flaggingInProgress.has(tx.id) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${flaggedTransactions.has(tx.id) || tx.status === 'FLAGGED' ? 'text-white' : ''}`}
                              onClick={() => handleFlagTransaction(tx.id, "Flagged via LMS interface")}
                              disabled={flaggingInProgress.has(tx.id) || flaggedTransactions.has(tx.id) || tx.status === 'FLAGGED'}
                            >
                              {flaggingInProgress.has(tx.id) ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Flag className={`h-3 w-3 ${flaggedTransactions.has(tx.id) || tx.status === 'FLAGGED' ? 'text-white' : ''}`} />
                              )}
                            </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                                      )) || []}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* KYC Management Tab */}
        <TabsContent value="kyc" className="space-y-4 animate-fade-in-up delay-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">KYC Verification Management</h2>
              <Badge variant="outline" className="text-xs">Django REST API</Badge>
              {loading.kyc && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={refreshKYCData} className="cursor-pointer">
                <RefreshCw className={`h-4 w-4 mr-2    ${loading.kyc ? 'animate-spin' : ''}`} />
                Refresh
                {hasNewKYCData && (
                  <Badge variant="destructive" className="ml-2 text-xs animate-pulse text-white">
                    New data!
                  </Badge>
                )}
              </Button>
              <Button className="cursor-pointer">
                <UserCheck className="h-4 w-4 mr-2  " />
                Bulk Review
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {loading.kyc ? (
              <div className="col-span-3 flex items-center justify-center h-60">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading KYC applications from Django REST API...</span>
              </div>
            ) : errors.kyc ? (
              <div className="col-span-3 flex items-center justify-center h-60 text-red-500">
                <AlertCircle className="h-6 w-6 mr-2" />
                <span>{errors.kyc}</span>
              </div>
            ) : kycApplications.map((application) => (
              <Card key={application.id} className="relative">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-base">{application.user}</span>
                    <Badge variant={getStatusColor(application.status)}>
                      {application.status.replace('_', ' ')}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{application.email}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Current Level:</span>
                      <Badge variant="outline">{application.current_level}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Requested Level:</span>
                      <Badge>{application.requested_level}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Verification Score:</span>
                      <span className="font-medium">{application.score}/100</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Documents ({application.documents.length})</p>
                    <div className="grid grid-cols-2 gap-1">
                      {application.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center gap-1 text-xs bg-gray-50 dark:bg-gray-800 rounded p-2">
                          <FileImage className="h-3 w-3" />
                          <span className="truncate">{doc.filename}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {application.risk_factors.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2 text-orange-600">Risk Factors</p>
                      <div className="space-y-1">
                        {application.risk_factors.map((factor, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {factor.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      className="flex-1 cursor-pointer" 
                      variant="default"
                      onClick={() => handleApproveKYC(application.id)}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Approve
                    </Button>
                    <Button size="sm" className="flex-1 cursor-pointer" variant="outline">
                      <XCircle className="h-3 w-3 mr-1" />
                      Reject  
                    </Button>
                    <Button size="sm" variant="ghost" className="cursor-pointer" onClick={() => openKYCExamination(application)}>
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
                
                <div className="absolute top-0 right-2">
                  <Badge variant="default" className="text-xs bg-gray-400 text-white hover:bg-gray-500">
                    {Math.floor((Date.now() - new Date(application.submitted_at).getTime()) / (1000 * 60 * 60))}h ago
                  </Badge>
                </div>
              </Card>
            )) || []}
          </div>
        </TabsContent>

        {/* Risk Alerts Tab */}
        <TabsContent value="risk" className="space-y-4 animate-fade-in-up delay-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Risk Management & Alerts</h2>
              <Badge variant="outline" className="text-xs">GraphQL</Badge>
              {loading.alerts && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => loadRiskAlerts(true)} className="cursor-pointer">
                <RefreshCw className={`h-4 w-4 mr-2  ${loading.alerts ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button size="sm" variant="outline" className="cursor-pointer">
                <Settings className="h-4 w-4 mr-2" />
                Alert Rules
              </Button>
              <Button size="sm" className="cursor-pointer">
                <Target className="h-4 w-4 mr-2" />
                Create Rule
              </Button>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-4">
            {/* Alert Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Alert Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Critical</span>
                  <Badge variant="destructive" className="text-white">
                    {riskAlerts.filter(a => a.severity === 'CRITICAL').length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">High</span>
                  <Badge variant="outline">
                    {riskAlerts.filter(a => a.severity === 'HIGH').length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Medium</span>
                  <Badge variant="secondary">
                    {riskAlerts.filter(a => a.severity === 'MEDIUM').length}
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm font-medium">
                  <span>Total Active</span>
                  <span>{riskAlerts.filter(a => a.status === 'ACTIVE').length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Alert Details */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Active Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {loading.alerts ? (
                    <div className="flex items-center justify-center h-60">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Loading alerts from GraphQL...</span>
                    </div>
                  ) : errors.alerts ? (
                    <div className="flex items-center justify-center h-60 text-red-500">
                      <AlertCircle className="h-6 w-6 mr-2" />
                      <span>{errors.alerts}</span>
                    </div>
                  ) : riskAlerts.map((alert) => (
                    <div key={alert.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={
                              alert.severity === 'CRITICAL' ? 'destructive' : 
                              alert.severity === 'HIGH' ? 'outline' : 'secondary'
                            } className={`${alert.severity === 'CRITICAL' ? 'text-white' : alert.severity === 'HIGH' ? 'text-white' : 'text-white'}`}>
                              {alert.severity}
                            </Badge>
                            <Badge variant={getStatusColor(alert.status)} className={`${alert.status === 'ACTIVE' ? 'text-white' : ''}`}>
                              {alert.status}
                            </Badge>
                            {alert.risk_score && (
                              <Badge variant={getRiskBadgeColor(alert.risk_score)} className={`${alert.risk_score > 70 ? 'text-white' : ''}`}>
                                Risk: {alert.risk_score}
                              </Badge>
                            )}
                          </div>
                          
                          <h4 className="font-medium">{alert.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {alert.description}
                          </p>
                          
                                                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                            <span>Alert ID: {alert.id}</span>
                            {alert.user_id && <span>User ID: {alert.user_id}</span>}
                            {alert.transaction_id && <span>Transaction: {alert.transaction_id}</span>}
                            <span>{new Date(alert.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <Button size="sm" variant="outline" className="cursor-pointer">
                            <Eye className="h-3 w-3 mr-1" />
                            Investigate
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() => handleResolveAlert(alert.id)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Resolve
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Limit Configuration Tab */}
        <TabsContent value="limits" className="space-y-4 animate-fade-in-up delay-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Limit Configuration & Templates</h2>
            <Button className="cursor-pointer transition-all duration-200 hover:scale-105" onClick={() => setIsCreateTemplateModalOpen(true)}>
              <Settings className="h-4 w-4 mr-2 " />
              Create Template
            </Button>
          </div>

          <div className="grid gap-4 lg:grid-cols-2 animate-fade-in-up delay-400">
            {/* Limit Templates */}
            <Card className="transition-all duration-200 hover:shadow-md">
              <CardHeader>
                <CardTitle>Limit Templates</CardTitle>
                <CardDescription>Pre-configured limit profiles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="border border-gray-300 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Standard User</h4>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Daily Withdrawal:</span>
                        <span className="font-medium">$10,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Monthly Withdrawal:</span>
                        <span className="font-medium">$100,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Single Transaction:</span>
                        <span className="font-medium">$5,000</span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-300 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Premium User</h4>
                      <Badge variant="secondary">Template</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Daily Withdrawal:</span>
                        <span className="font-medium">$50,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Monthly Withdrawal:</span>
                        <span className="font-medium">$500,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Single Transaction:</span>
                        <span className="font-medium">$25,000</span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-300 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">VIP User</h4>
                      <Badge variant="outline">Template</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Daily Withdrawal:</span>
                        <span className="font-medium">$1,000,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Monthly Withdrawal:</span>
                        <span className="font-medium">No Limit</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Single Transaction:</span>
                        <span className="font-medium">$100,000</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compliance Rules */}
            <Card className="transition-all duration-200 hover:shadow-md">
              <CardHeader>
                <CardTitle>Compliance Rules</CardTitle>
                <CardDescription>Automated compliance configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border border-gray-300 rounded-lg">
                    <div>
                      <p className="font-medium">AML Screening</p>
                      <p className="text-sm text-muted-foreground">Screen all transactions against sanctions lists</p>
                    </div>
                    <Switch className="cursor-pointer" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 border border-gray-300 rounded-lg">
                    <div>
                      <p className="font-medium">Large Transaction Alert</p>
                      <p className="text-sm text-muted-foreground">Alert for transactions over $10,000</p>
                    </div>
                    <Switch className="cursor-pointer" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 border border-gray-300 rounded-lg">
                    <div>
                      <p className="font-medium">Velocity Checks</p>
                      <p className="text-sm text-muted-foreground">Monitor transaction frequency patterns</p>
                    </div>
                    <Switch className="cursor-pointer" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 border border-gray-300 rounded-lg">
                    <div>
                      <p className="font-medium">Geo-blocking</p>
                      <p className="text-sm text-muted-foreground">Block transactions from high-risk countries</p>
                    </div>
                    <Switch className="cursor-pointer" />
                  </div>

                  <div className="flex items-center justify-between p-3 border border-gray-300 rounded-lg">
                    <div>
                      <p className="font-medium">Enhanced Due Diligence</p>
                      <p className="text-sm text-muted-foreground">Require additional verification for high-risk users</p>
                    </div>
                    <Switch className="cursor-pointer" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 border border-gray-300 rounded-lg">
                    <div>
                      <p className="font-medium">Suspicious Activity Reports</p>
                      <p className="text-sm text-muted-foreground">Auto-generate SAR for flagged activities</p>
                    </div>
                    <Switch className="cursor-pointer" defaultChecked />
                  </div>
                </div>

                <div className="pt-4">
                  <Button className="w-full cursor-pointer transition-all duration-200 hover:scale-105">
                    Save Compliance Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* KYC Examination Modal */}
      <Dialog open={isExaminingKYC} onOpenChange={closeKYCExamination}>
        <DialogContent className="!max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>KYC Application Details</DialogTitle>
                <DialogDescription>
                  Examining KYC application for {selectedKYCApplication?.user}
                </DialogDescription>
              </div>
              {selectedKYCApplication && (
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusColor(selectedKYCApplication.status)} className="text-xs">
                    {selectedKYCApplication.status.replace('_', ' ')}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Score: {selectedKYCApplication.score}/100
                  </Badge>
                </div>
              )}
            </div>
          </DialogHeader>
          
          {selectedKYCApplication && (
            <div className="flex-1 overflow-y-auto">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-5 mb-4">
                  <TabsTrigger value="overview" className="text-xs cursor-pointer">Overview</TabsTrigger>
                  <TabsTrigger value="documents" className="text-xs cursor-pointer">Documents</TabsTrigger>
                  <TabsTrigger value="history" className="text-xs cursor-pointer">History</TabsTrigger>
                  <TabsTrigger value="activity" className="text-xs cursor-pointer">Activity</TabsTrigger>
                  <TabsTrigger value="notes" className="text-xs cursor-pointer">Notes</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4 animate-fade-in-up delay-100">
                  {/* Compact Overview */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2 p-4 border rounded-lg border-gray-300 animate-fade-in-up delay-200">
                      <h4 className="text-sm font-semibold">User Information</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Name:</span>
                          <span className="font-medium">{selectedKYCApplication.user}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span className="font-medium truncate">{selectedKYCApplication.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Registered:</span>
                          <span className="text-xs">Jan 15, 2024</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Location:</span>
                          <span className="text-xs">New York, US</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 p-4 border rounded-lg border-gray-300 animate-fade-in-up delay-300">
                      <h4 className="text-sm font-semibold">Verification</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Current:</span>
                          <Badge variant="outline" className="text-xs">{selectedKYCApplication.current_level}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Requested:</span>
                          <Badge className="text-xs">{selectedKYCApplication.requested_level}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Score:</span>
                          <span className="font-medium">{selectedKYCApplication.score}/100</span>
                        </div>
                        <Progress value={selectedKYCApplication.score} className="h-1 mt-1" />
                      </div>
                    </div>

                    <div className="space-y-2 p-4 border rounded-lg border-gray-300 animate-fade-in-up delay-400">
                      <h4 className="text-sm font-semibold">Account Stats</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Volume:</span>
                          <span className="font-medium">$847,230</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Transactions:</span>
                          <span className="font-medium">1,247</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Last Login:</span>
                          <span className="text-xs">2 hours ago</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Risk Level:</span>
                          <Badge variant="secondary" className="text-xs">Medium</Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Risk Factors */}
                  {selectedKYCApplication.risk_factors.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-3 text-orange-600">Risk Factors</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedKYCApplication.risk_factors.map((factor, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs text-orange-600">
                            {factor.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="documents" className="space-y-4 animate-fade-in-up delay-100">
                  <div>
                    <h4 className="text-sm font-semibold mb-3">Submitted Documents ({selectedKYCApplication.documents.length})</h4>
                    <div className="grid gap-2 md:grid-cols-2">
                      {selectedKYCApplication.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center gap-2 p-3 border border-gray-300 rounded text-sm">
                          <FileImage className="h-5 w-5 text-blue-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{doc.filename}</p>
                            <p className="text-xs text-muted-foreground">{doc.file_type}</p>
                            <p className="text-xs text-muted-foreground">Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge variant={doc.status === 'VERIFIED' ? 'default' : doc.status === 'REJECTED' ? 'destructive' : 'secondary'} className={`text-xs ${doc.status === 'VERIFIED' ? 'text-white' : doc.status === 'REJECTED' ? 'text-white' : ''}`}>
                              {doc.status}
                            </Badge>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="space-y-4 animate-fade-in-up delay-100">
                  <div className="space-y-4 p-4 border rounded-lg border-gray-400">
                    <h4 className="text-sm font-semibold">KYC Application History</h4>
                    <div className="space-y-3 ">
                      <div className="flex items-start gap-3 p-3 border rounded border-gray-300">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Current Application - {selectedKYCApplication.requested_level}</span>
                            <Badge variant="outline" className="text-xs">{selectedKYCApplication.status.replace('_', ' ')}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Submitted {new Date(selectedKYCApplication.submitted_at).toLocaleDateString()} • Score: {selectedKYCApplication.score}/100
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 border rounded border-gray-300">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">LEVEL_1 Application</span>
                            <Badge variant="default" className="text-xs">APPROVED</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Approved Dec 20, 2023 • Score: 89/100 • Officer: John Smith
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 border rounded border-gray-300">
                        <div className="w-2 h-2 rounded-full bg-gray-400 mt-2"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Account Registration</span>
                            <Badge variant="secondary" className="text-xs">COMPLETED</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Registered Jan 15, 2024 • Email verified • Phone verified
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
 
                  <div className="space-y-4 p-4 border rounded-lg border-gray-400">
                    <h4 className="text-sm font-semibold">Recent Transactions</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 border rounded border-gray-300 text-sm">
                        <div className="flex items-center gap-2">
                          <ArrowUpRight className="h-4 w-4 text-green-500" />
                          <div>
                            <span className="font-medium">WITHDRAWAL</span>
                            <p className="text-xs text-muted-foreground">5.2 ETH → $12,847</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="default" className="text-xs">COMPLETED</Badge>
                          <p className="text-xs text-muted-foreground">2 days ago</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-2 border rounded border-gray-300 text-sm">
                        <div className="flex items-center gap-2">
                          <ArrowDownRight className="h-4 w-4 text-blue-500" />
                          <div>
                            <span className="font-medium">DEPOSIT</span>
                            <p className="text-xs text-muted-foreground">1.8 BTC → $74,520</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="default" className="text-xs">COMPLETED</Badge>
                          <p className="text-xs text-muted-foreground">5 days ago</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-2 border rounded border-gray-300 text-sm">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-purple-500" />
                          <div>
                            <span className="font-medium">TRADE</span>
                            <p className="text-xs text-muted-foreground">BTC/ETH → $8,430</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="default" className="text-xs">COMPLETED</Badge>
                          <p className="text-xs text-muted-foreground">1 week ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="activity" className="space-y-4 animate-fade-in-up delay-100">
                  <div className="space-y-4 p-4 border rounded-lg border-gray-400">
                    <h4 className="text-sm font-semibold">Login & Device History</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 border rounded border-gray-300 text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <div>
                            <span className="font-medium">MacOS • Chrome</span>
                            <p className="text-xs text-muted-foreground">New York, US • 192.168.1.100</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="default" className="text-xs">ACTIVE</Badge>
                          <p className="text-xs text-muted-foreground">2 hours ago</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded border-gray-300 text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                          <div>
                            <span className="font-medium">iOS • Safari</span>
                            <p className="text-xs text-muted-foreground">New York, US • 10.0.1.50</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="text-xs">ENDED</Badge>
                          <p className="text-xs text-muted-foreground">1 day ago</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded border-gray-300 text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                          <div>
                            <span className="font-medium">Windows • Edge</span>
                            <p className="text-xs text-muted-foreground">New York, US • 192.168.1.101</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="text-xs">ENDED</Badge>
                          <p className="text-xs text-muted-foreground">3 days ago</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 p-4 border rounded-lg border-gray-400">
                    <h4 className="text-sm font-semibold">Security Events</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-3 border rounded border-gray-300 text-sm">
                        <Shield className="h-4 w-4 text-green-500" />
                        <div className="flex-1">
                          <span className="font-medium">2FA Enabled</span>
                          <p className="text-xs text-muted-foreground">Two-factor authentication activated • 2 months ago</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 border rounded border-gray-300 text-sm">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <div className="flex-1">
                          <span className="font-medium">Password Changed</span>
                          <p className="text-xs text-muted-foreground">Password updated from New York, US • 1 month ago</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 border rounded border-gray-300 text-sm">
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                        <div className="flex-1">
                          <span className="font-medium">Email Verified</span>
                          <p className="text-xs text-muted-foreground">Email address confirmed • 4 months ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="notes" className="space-y-4 animate-fade-in-up delay-100">
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold">Officer Notes</h4>
                    <Textarea 
                      placeholder="Add your notes about this application..."
                      className="min-h-24 text-sm"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold">Previous Notes</h4>
                    <div className="space-y-3">
                      <div className="p-3 border rounded border-gray-300 text-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-blue-600">Officer Smith</span>
                          <span className="text-xs text-muted-foreground">2 weeks ago</span>
                        </div>
                        <p className="text-sm">User provided clear documentation for Level 1 verification. All documents appear authentic. Recommended for approval.</p>
                      </div>

                      <div className="p-3 border rounded border-gray-300 text-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-blue-600">Officer Johnson</span>
                          <span className="text-xs text-muted-foreground">1 month ago</span>
                        </div>
                        <p className="text-sm">Initial account review completed. User has consistent transaction patterns and no red flags identified.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold">Compliance Flags</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">Clean Record</Badge>
                      <Badge variant="outline" className="text-xs">Verified Identity</Badge>
                      <Badge variant="outline" className="text-xs">No AML Concerns</Badge>
                      <Badge variant="secondary" className="text-xs">Regular User</Badge>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          <DialogFooter className="flex-shrink-0 pt-4">
            <Button variant="outline" className="cursor-pointer" onClick={closeKYCExamination}>
              Close
            </Button>
            {selectedKYCApplication && (
              <>
                <Button 
                  variant="outline" 
                  className="cursor-pointer"
                  onClick={() => handleApproveKYC(selectedKYCApplication.id)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button variant="destructive" className="text-white cursor-pointer">
                  <XCircle className="h-4 w-4 mr-2 text-white" />
                  Reject
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transaction Examination Modal */}
      <Dialog open={isExaminingTransaction} onOpenChange={closeTransactionExamination}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Examining transaction {selectedTransaction?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-6">
              {/* Transaction Overview */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Transaction Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">ID:</span>
                      <span className="font-medium">{selectedTransaction.id}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Type:</span>
                      <Badge variant="outline">{selectedTransaction.type}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Amount:</span>
                      <span className="font-medium">{selectedTransaction.amount} {selectedTransaction.asset}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">USD Value:</span>
                      <span className="font-medium">${selectedTransaction.value.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge variant={getStatusColor(selectedTransaction.status)}>
                        {selectedTransaction.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Risk Assessment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Risk Score:</span>
                      <Badge variant={getRiskBadgeColor(selectedTransaction.risk_score)}>
                        {selectedTransaction.risk_score}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Risk Level:</span>
                      <span className="font-medium">{getRiskLabel(selectedTransaction.risk_score)}</span>
                    </div>
                    <Progress value={selectedTransaction.risk_score} className="h-2" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Timestamp:</span>
                      <span className="text-sm">{new Date(selectedTransaction.timestamp).toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* User Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">User Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">User:</span>
                      <span className="font-medium">{selectedTransaction.user}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">KYC Level:</span>
                      <Badge variant="outline">{selectedTransaction.kyc_level}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Location:</span>
                      <span className="font-medium">{selectedTransaction.location}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Flags */}
              {selectedTransaction.flags && selectedTransaction.flags.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm text-red-600">Active Flags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedTransaction.flags.map((flag, idx) => (
                        <Badge key={idx} variant="destructive" className="text-white">
                          {flag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Officer Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Officer Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea 
                    placeholder="Add your notes about this transaction..."
                    className="min-h-20"
                  />
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" className="cursor-pointer" onClick={closeTransactionExamination}>
              Close
            </Button>
            {selectedTransaction && (
              <>
                <Button 
                  variant={flaggedTransactions.has(selectedTransaction.id) || selectedTransaction.status === 'FLAGGED' ? 'destructive' : 'outline'}
                  className={flaggedTransactions.has(selectedTransaction.id) || selectedTransaction.status === 'FLAGGED' ? 'text-white' : ''}
                  onClick={() => handleFlagTransaction(selectedTransaction.id, "Flagged via detailed examination")}
                  disabled={flaggingInProgress.has(selectedTransaction.id) || flaggedTransactions.has(selectedTransaction.id) || selectedTransaction.status === 'FLAGGED'}
                >
                  {flaggingInProgress.has(selectedTransaction.id) ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Flag className={`h-4 w-4 mr-2 ${flaggedTransactions.has(selectedTransaction.id) || selectedTransaction.status === 'FLAGGED' ? 'text-white' : ''}`} />
                  )}
                  {flaggedTransactions.has(selectedTransaction.id) || selectedTransaction.status === 'FLAGGED' ? 'Flagged' : flaggingInProgress.has(selectedTransaction.id) ? 'Flagging...' : 'Flag Transaction'}
                </Button>
                <Button variant="default" className="cursor-pointer">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Template Modal */}
      <Dialog open={isCreateTemplateModalOpen} onOpenChange={setIsCreateTemplateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Limit Template</DialogTitle>
            <DialogDescription>
              Create a new limit template for user verification levels
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Basic Information</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Template Name</label>
                  <Input 
                    placeholder="e.g., Enterprise User"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">User Level</label>
                  <Select value={newTemplate.userLevel} onValueChange={(value) => setNewTemplate({...newTemplate, userLevel: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UNVERIFIED">Unverified</SelectItem>
                      <SelectItem value="LEVEL_1">Level 1</SelectItem>
                      <SelectItem value="LEVEL_2">Level 2</SelectItem>
                      <SelectItem value="LEVEL_3">Level 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea 
                  placeholder="Brief description of this template..."
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                  rows={3}
                />
              </div>
            </div>

            {/* Withdrawal Limits */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Withdrawal Limits</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Daily Withdrawal Limit ($)</label>
                  <Input 
                    type="number"
                    placeholder="10000"
                    value={newTemplate.dailyWithdrawalLimit}
                    onChange={(e) => setNewTemplate({...newTemplate, dailyWithdrawalLimit: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Monthly Withdrawal Limit ($)</label>
                  <Input 
                    type="number"
                    placeholder="100000"
                    value={newTemplate.monthlyWithdrawalLimit}
                    onChange={(e) => setNewTemplate({...newTemplate, monthlyWithdrawalLimit: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Deposit Limits */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Deposit Limits</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Daily Deposit Limit ($)</label>
                  <Input 
                    type="number"
                    placeholder="50000"
                    value={newTemplate.dailyDepositLimit}
                    onChange={(e) => setNewTemplate({...newTemplate, dailyDepositLimit: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Monthly Deposit Limit ($)</label>
                  <Input 
                    type="number"
                    placeholder="500000"
                    value={newTemplate.monthlyDepositLimit}
                    onChange={(e) => setNewTemplate({...newTemplate, monthlyDepositLimit: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Transaction Limits */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Transaction Limits</h4>
              <div>
                <label className="text-sm font-medium">Single Transaction Limit ($)</label>
                <Input 
                  type="number"
                  placeholder="25000"
                  value={newTemplate.singleTransactionLimit}
                  onChange={(e) => setNewTemplate({...newTemplate, singleTransactionLimit: e.target.value})}
                />
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Preview</h4>
              <div className="p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">{newTemplate.name || 'New Template'}</span>
                  <Badge variant="outline">{newTemplate.userLevel}</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Daily Withdrawal:</span>
                    <span className="font-medium">${newTemplate.dailyWithdrawalLimit ? parseFloat(newTemplate.dailyWithdrawalLimit).toLocaleString() : '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Withdrawal:</span>
                    <span className="font-medium">${newTemplate.monthlyWithdrawalLimit ? parseFloat(newTemplate.monthlyWithdrawalLimit).toLocaleString() : '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Single Transaction:</span>
                    <span className="font-medium">${newTemplate.singleTransactionLimit ? parseFloat(newTemplate.singleTransactionLimit).toLocaleString() : '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Daily Deposit:</span>
                    <span className="font-medium">${newTemplate.dailyDepositLimit ? parseFloat(newTemplate.dailyDepositLimit).toLocaleString() : '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Deposit:</span>
                    <span className="font-medium">${newTemplate.monthlyDepositLimit ? parseFloat(newTemplate.monthlyDepositLimit).toLocaleString() : '0'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateTemplateModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateTemplate}
              disabled={!newTemplate.name || !newTemplate.description}
            >
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default LMS
