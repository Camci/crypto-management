// Mock Django REST API Service for LMS
export interface Transaction {
  id: string
  timestamp: string
  user: string
  user_id: string
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRADE'
  asset: string
  amount: number
  value: number
  from_address: string
  to_address: string
  status: 'COMPLETED' | 'PENDING' | 'FLAGGED' | 'REJECTED'
  risk_score: number
  location: string
  kyc_level: 'UNVERIFIED' | 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3'
  flags?: string[]
  created_at: string
  updated_at: string
}

export interface KYCApplication {
  id: string
  user: string
  email: string
  user_id: string
  current_level: 'UNVERIFIED' | 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3'
  requested_level: 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3'
  submitted_at: string
  status: 'UNDER_REVIEW' | 'REQUIRES_ACTION' | 'APPROVED' | 'REJECTED'
  documents: Array<{
    id: string
    filename: string
    file_type: string
    uploaded_at: string
    status: 'UPLOADED' | 'VERIFIED' | 'REJECTED'
  }>
  reviewer_id?: string
  score: number
  risk_factors: string[]
  notes?: string
  created_at: string
  updated_at: string
}

export interface RiskAlert {
  id: string
  type: 'HIGH_RISK_TRANSACTION' | 'PATTERN_MATCH' | 'KYC_VERIFICATION' | 'COMPLIANCE_VIOLATION'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  title: string
  description: string
  timestamp: string
  status: 'ACTIVE' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED'
  user_id?: string
  transaction_id?: string
  risk_score?: number
  assigned_to?: string
  resolution_notes?: string
  created_at: string
  updated_at: string
}

export interface LimitTemplate {
  id: string
  name: string
  description: string
  daily_withdrawal_limit: number
  monthly_withdrawal_limit: number
  single_transaction_limit: number
  daily_deposit_limit: number
  monthly_deposit_limit: number
  is_active: boolean
  user_level: string
  created_at: string
  updated_at: string
}

// Mock Django REST API Base URL
const API_BASE_URL = 'http://localhost:8000/api/v1'

// Simulate network delay
const simulateNetworkDelay = (ms: number = 500) => 
  new Promise(resolve => setTimeout(resolve, ms))

// Mock Django REST API Client
class LMSRestAPI {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const startTime = Date.now()
    const method = options.method || 'GET'
    
    // Simulate network delay
    const delay = 300 + Math.random() * 700
    console.log(`🌐 [Django REST] ${method} ${API_BASE_URL}${endpoint} (simulating ${Math.round(delay)}ms delay)`)
    
    await simulateNetworkDelay(delay)
    
    // Mock response based on endpoint
    const response = this.getMockResponse<T>(endpoint, options)
    const duration = Date.now() - startTime
    
    console.log(`✅ [Django REST] Response received in ${duration}ms`, {
      endpoint,
      method,
      dataSize: JSON.stringify(response).length
    })
    
    return response
  }

  private getMockResponse<T>(endpoint: string, options: RequestInit): T {
    // Mock different responses based on endpoint
    if (endpoint.includes('/transactions/')) {
      return this.mockTransactions() as T
    }
    if (endpoint.includes('/kyc-applications/')) {
      return this.mockKYCApplications() as T
    }
    if (endpoint.includes('/risk-alerts/')) {
      return this.mockRiskAlerts() as T
    }
    if (endpoint.includes('/limit-templates/')) {
      return this.mockLimitTemplates() as T
    }
    if (endpoint.includes('/dashboard-stats/')) {
      return this.mockDashboardStats() as T
    }
    
    return {} as T
  }

  private mockTransactions() {
    return {
      count: 156,
      next: null,
      previous: null,
      results: [
        {
          id: "txn_001",
          timestamp: new Date().toISOString(),
          user: "John Doe",
          user_id: "user_123",
          type: "DEPOSIT",
          asset: "BTC",
          amount: 2.5,
          value: 107619.75,
          from_address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
          to_address: "bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4",
          status: "COMPLETED",
          risk_score: 15,
          location: "New York, US",
          kyc_level: "LEVEL_3",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: "txn_002",
          timestamp: new Date(Date.now() - 35 * 360000).toISOString(),
          user: "Sarah Chen",
          user_id: "user_456",
          type: "WITHDRAWAL",
          asset: "ETH",
          amount: 10.0,
          value: 25473.20,
          from_address: "0x742d35Cc6647C8532B50aA7B2B9827Ec5b1B6123",
          to_address: "0x8ba1f109551bd432803012645hac136c6d7d8a9f",
          status: "PENDING",
          risk_score: 85,
          location: "Singapore",
          kyc_level: "LEVEL_2",
          flags: ["HIGH_AMOUNT", "UNUSUAL_PATTERN"],
          created_at: new Date(Date.now() - 35 * 60000).toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: "txn_003",
          timestamp: new Date(Date.now() - 35 * 60000).toISOString(),
          user: "Michael Johnson",
          user_id: "user_789",
          type: "TRADE",
          asset: "USDT",
          amount: 50000,
          value: 50000,
          from_address: "TRzuMBEeJsHwNdCzGpVEX5sLsLwFZtj5a3",
          to_address: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
          status: "FLAGGED",
          risk_score: 95,
          location: "Unknown",
          kyc_level: "LEVEL_1",
          flags: ["SUSPICIOUS_LOCATION", "LARGE_AMOUNT", "PATTERN_MATCH"],
          created_at: new Date(Date.now() - 35 * 60000).toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    }
  }

  private mockKYCApplications() {
    return {
      count: 45,
      next: null,
      previous: null,
      results: [
        {
          id: "kyc_001",
          user: "Emma Wilson",
          email: "emma.wilson@email.com",
          user_id: "user_101",
          current_level: "UNVERIFIED",
          requested_level: "LEVEL_2",
          submitted_at: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
          status: "UNDER_REVIEW",
          documents: [
            {
              id: "doc_001",
              filename: "passport.jpg",
              file_type: "image/jpeg",
              uploaded_at: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
              status: "VERIFIED"
            },
            {
              id: "doc_002", 
              filename: "utility_bill.pdf",
              file_type: "application/pdf",
              uploaded_at: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
              status: "VERIFIED"
            },
            {
              id: "doc_003",
              filename: "selfie.jpg", 
              file_type: "image/jpeg",
              uploaded_at: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
              status: "UPLOADED"
            }
          ],
          score: 78,
          risk_factors: ["NEW_USER"],
          created_at: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    }
  }

  private mockRiskAlerts() {
    return {
      count: 12,
      next: null,
      previous: null,
      results: [
        {
          id: "alert_001",
          type: "HIGH_RISK_TRANSACTION",
          severity: "HIGH",
          title: "Suspicious Large Withdrawal Detected",
          description: "User attempting to withdraw $25,473 to unknown address",
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
          status: "ACTIVE",
          user_id: "user_456",
          transaction_id: "txn_002",
          risk_score: 85,
          created_at: new Date(Date.now() - 5 * 60000).toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    }
  }

  private mockLimitTemplates() {
    return {
      count: 3,
      next: null,
      previous: null,
      results: [
        {
          id: "template_001",
          name: "Standard User",
          description: "Default limits for verified users",
          daily_withdrawal_limit: 10000,
          monthly_withdrawal_limit: 100000,
          single_transaction_limit: 5000,
          daily_deposit_limit: 50000,
          monthly_deposit_limit: 500000,
          is_active: true,
          user_level: "LEVEL_2",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    }
  }

  private mockDashboardStats() {
    return {
      active_alerts: 3,
      pending_kyc: 8,
      daily_volume: 2400000,
      average_risk_score: 34,
      high_risk_transactions: 5,
      medium_risk_transactions: 12,
      low_risk_transactions: 23,
      minimal_risk_transactions: 89
    }
  }

  // Public API methods
  async getTransactions(filters?: {
    status?: string
    risk_level?: string
    timeframe?: string
    limit?: number
    offset?: number
  }) {
    const queryParams = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString())
      })
    }
    
    return this.request<{
      count: number
      next: string | null
      previous: string | null
      results: Transaction[]
    }>(`/transactions/?${queryParams}`)
  }

  async getKYCApplications(filters?: {
    status?: string
    level?: string
    limit?: number
    offset?: number
  }) {
    const queryParams = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString())
      })
    }
    
    return this.request<{
      count: number
      next: string | null
      previous: string | null
      results: KYCApplication[]
    }>(`/kyc-applications/?${queryParams}`)
  }

  async getRiskAlerts(filters?: {
    severity?: string
    status?: string
    limit?: number
    offset?: number
  }) {
    const queryParams = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString())
      })
    }
    
    return this.request<{
      count: number
      next: string | null
      previous: string | null
      results: RiskAlert[]
    }>(`/risk-alerts/?${queryParams}`)
  }

  async getLimitTemplates() {
    return this.request<{
      count: number
      next: string | null
      previous: string | null
      results: LimitTemplate[]
    }>('/limit-templates/')
  }

  async getDashboardStats() {
    return this.request<{
      active_alerts: number
      pending_kyc: number
      daily_volume: number
      average_risk_score: number
      high_risk_transactions: number
      medium_risk_transactions: number
      low_risk_transactions: number
      minimal_risk_transactions: number
    }>('/dashboard-stats/')
  }

  async updateTransactionStatus(transactionId: string, status: string) {
    return this.request<Transaction>(`/transactions/${transactionId}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status })
    })
  }

  async approveKYC(applicationId: string, notes?: string) {
    return this.request<KYCApplication>(`/kyc-applications/${applicationId}/approve/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notes })
    })
  }

  async resolveAlert(alertId: string, resolution: string) {
    return this.request<RiskAlert>(`/risk-alerts/${alertId}/resolve/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resolution })
    })
  }
}

// Export singleton instance
export const lmsRestAPI = new LMSRestAPI()
