<script setup>
// filepath: c:\Users\ejfay\FreshBytes\freshbytes-admin\pages\home\index.vue
definePageMeta({
    layout: "home",
});

const config = useRuntimeConfig();
const api = config.public.API_LINK;

// Date range options for transactions
const dateRangeOptions = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'this_week', label: 'This Week' },
  { value: 'last_week', label: 'Last Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'this_year', label: 'This Year' },
  { value: 'last_year', label: 'Last Year' },
  { value: 'custom', label: 'Custom Date Range' }
]

// Reactive variables
const selectedDateRange = ref('this_month')
const customStartDate = ref('')
const customEndDate = ref('')
const loading = ref(false)
const activityLoading = ref(false)

// Dashboard data
const dashboardData = ref({
  newUsers: {
    count: 0,
    percentage: 0,
    trend: 'up'
  },
  totalUsers: {
    total: 0,
    sellers: 0,
    customers: 0,
    percentage: 0
  },
  transactions: {
    count: 0,
    amount: 0,
    percentage: 0,
    trend: 'up'
  },
  totalSales: {
    amount: 0,
    percentage: 0,
    trend: 'up'
  },
  products: {
    total: 0,
    percentage: 0,
    trend: 'up'
  },
  sellers: {
    pending: 0,
    approved: 0,
    totalApproved: 0
  }
})

// Recent activity data - simulated or derived
const recentActivities = ref([])

// Generate simulated recent activity based on dashboard data
const generateRecentActivity = () => {
  const activities = []
  const now = new Date()
  
  // Generate activities based on dashboard stats
  if (dashboardData.value.sellers.pending > 0) {
    activities.push({
      id: 'seller_pending_1',
      type: 'seller_application',
      title: 'New seller application',
      description: `${dashboardData.value.sellers.pending} seller applications awaiting approval`,
      timestamp: new Date(now.getTime() - Math.random() * 2 * 60 * 60 * 1000).toISOString(),
      actionRequired: true,
      link: '/home/sellers?status=pending'
    })
  }
  
  if (dashboardData.value.newUsers.count > 0) {
    activities.push({
      id: 'new_users_1',
      type: 'user_registration',
      title: 'New user registrations',
      description: `${dashboardData.value.newUsers.count} new users registered recently`,
      timestamp: new Date(now.getTime() - Math.random() * 4 * 60 * 60 * 1000).toISOString(),
      actionRequired: false
    })
  }
  
  if (dashboardData.value.transactions.count > 0) {
    activities.push({
      id: 'transactions_1',
      type: 'transaction_completed',
      title: 'Recent transactions',
      description: `${dashboardData.value.transactions.count} transactions completed for ${formatCurrency(dashboardData.value.transactions.amount)}`,
      timestamp: new Date(now.getTime() - Math.random() * 6 * 60 * 60 * 1000).toISOString(),
      actionRequired: false
    })
  }
  
  if (dashboardData.value.products.total > 0) {
    activities.push({
      id: 'products_1',
      type: 'product_activity',
      title: 'Product catalog update',
      description: `${dashboardData.value.products.total} products currently in catalog`,
      timestamp: new Date(now.getTime() - Math.random() * 8 * 60 * 60 * 1000).toISOString(),
      actionRequired: false
    })
  }
  
  if (dashboardData.value.sellers.approved > 0) {
    activities.push({
      id: 'sellers_approved_1',
      type: 'seller_approved',
      title: 'Sellers approved',
      description: `${dashboardData.value.sellers.approved} sellers approved recently`,
      timestamp: new Date(now.getTime() - Math.random() * 12 * 60 * 60 * 1000).toISOString(),
      actionRequired: false
    })
  }
  
  // Add some generic system activities
  activities.push({
    id: 'system_1',
    type: 'system_maintenance',
    title: 'System status',
    description: 'All systems operational - Platform running smoothly',
    timestamp: new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
    actionRequired: false
  })
  
  // Sort by timestamp (most recent first)
  activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  
  return activities.slice(0, 5) // Show only top 5 activities
}

// Computed properties for date range
const dateRangeParams = computed(() => {
  if (selectedDateRange.value === 'custom') {
    return {
      start_date: customStartDate.value,
      end_date: customEndDate.value
    }
  }
  return {
    date_range: selectedDateRange.value
  }
})

// Fetch dashboard data
const fetchDashboardData = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams(dateRangeParams.value)
    const response = await $fetch(`${api}/api/dashboard/admin/?${params.toString()}`)
    
    if (response) {
      dashboardData.value = {
        newUsers: response.new_users || { count: 0, percentage: 0, trend: 'neutral' },
        totalUsers: response.total_users || { total: 0, sellers: 0, customers: 0, percentage: 0 },
        transactions: response.transactions || { count: 0, amount: 0, percentage: 0, trend: 'neutral' },
        totalSales: response.total_sales || { amount: 0, percentage: 0, trend: 'neutral' },
        products: response.products || { total: 0, percentage: 0, trend: 'neutral' },
        sellers: response.sellers || { pending: 0, approved: 0, totalApproved: 0 }
      }
      
      // Generate recent activity based on fetched data
      recentActivities.value = generateRecentActivity()
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    // Generate fallback activity even if API fails
    recentActivities.value = generateFallbackActivity()
  } finally {
    loading.value = false
  }
}

// Fallback activity when API fails
const generateFallbackActivity = () => {
  const now = new Date()
  return [
    {
      id: 'fallback_1',
      type: 'system_status',
      title: 'System online',
      description: 'Admin dashboard loaded successfully',
      timestamp: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
      actionRequired: false
    },
    {
      id: 'fallback_2',
      type: 'user_activity',
      title: 'Platform monitoring',
      description: 'Monitoring user activity and system performance',
      timestamp: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
      actionRequired: false
    },
    {
      id: 'fallback_3',
      type: 'maintenance',
      title: 'Routine maintenance',
      description: 'System maintenance completed successfully',
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      actionRequired: false
    }
  ]
}

// Refresh activity manually
const refreshActivity = () => {
  activityLoading.value = true
  setTimeout(() => {
    recentActivities.value = generateRecentActivity()
    activityLoading.value = false
  }, 1000)
}

// Watcher for date range changes
watch([selectedDateRange, customStartDate, customEndDate], () => {
  if (selectedDateRange.value !== 'custom' || (customStartDate.value && customEndDate.value)) {
    fetchDashboardData()
  }
})

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount || 0)
}

// Format number with commas
const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US').format(num || 0)
}

// Format relative time
const formatRelativeTime = (timestamp) => {
  const now = new Date()
  const time = new Date(timestamp)
  const diffInSeconds = Math.floor((now - time) / 1000)
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days > 1 ? 's' : ''} ago`
  }
}

// Get activity icon and color based on type
const getActivityIcon = (type) => {
  const icons = {
    seller_application: {
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'bg-orange-100 text-orange-600'
    },
    user_registration: {
      icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
      color: 'bg-green-100 text-green-600'
    },
    transaction_completed: {
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      color: 'bg-purple-100 text-purple-600'
    },
    product_activity: {
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      color: 'bg-blue-100 text-blue-600'
    },
    seller_approved: {
      icon: 'M5 13l4 4L19 7',
      color: 'bg-green-100 text-green-600'
    },
    system_maintenance: {
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
      color: 'bg-gray-100 text-gray-600'
    },
    system_status: {
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'bg-green-100 text-green-600'
    },
    user_activity: {
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
      color: 'bg-blue-100 text-blue-600'
    },
    maintenance: {
      icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4',
      color: 'bg-indigo-100 text-indigo-600'
    },
    default: {
      icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'bg-gray-100 text-gray-600'
    }
  }
  
  return icons[type] || icons.default
}

// Get trend icon
const getTrendIcon = (trend) => {
  switch (trend) {
    case 'up':
      return '↗️'
    case 'down':
      return '↘️'
    default:
      return '➡️'
  }
}

// Get trend color
const getTrendColor = (trend) => {
  switch (trend) {
    case 'up':
      return 'text-green-600'
    case 'down':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

// Initial data fetch
await fetchDashboardData()
</script>

<template>
  <!-- Loading component -->
  <Loading :loading="loading" />

  <!-- Dashboard Header -->
  <div class="mb-8">
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p class="text-gray-600 mt-1">Monitor your platform's performance and analytics</p>
      </div>
      
      <!-- Date Range Selector -->
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="relative">
          <select 
            v-model="selectedDateRange"
            class="px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none bg-white min-w-[200px]"
          >
            <option v-for="option in dateRangeOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <svg class="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
        
        <!-- Custom Date Range Inputs -->
        <div v-if="selectedDateRange === 'custom'" class="flex gap-2">
          <input 
            v-model="customStartDate"
            type="date"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Start Date"
          />
          <input 
            v-model="customEndDate"
            type="date"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="End Date"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- Dashboard Cards Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
    
    <!-- New Users Card -->
    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600">New Users</p>
          <p class="text-3xl font-bold text-gray-900 mt-2">{{ formatNumber(dashboardData.newUsers.count) }}</p>
          <div class="flex items-center mt-2">
            <span :class="getTrendColor(dashboardData.newUsers.trend)" class="text-sm font-medium">
              {{ getTrendIcon(dashboardData.newUsers.trend) }} {{ dashboardData.newUsers.percentage }}%
            </span>
            <span class="text-gray-500 text-sm ml-2">vs previous period</span>
          </div>
        </div>
        <div class="p-3 bg-blue-100 rounded-lg">
          <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
          </svg>
        </div>
      </div>
    </div>

    <!-- Total Users Card -->
    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <p class="text-sm font-medium text-gray-600">Total Users</p>
          <p class="text-3xl font-bold text-gray-900 mt-2">{{ formatNumber(dashboardData.totalUsers.total) }}</p>
          <div class="mt-3 space-y-1">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Sellers:</span>
              <span class="font-medium text-green-600">{{ formatNumber(dashboardData.totalUsers.sellers) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Customers:</span>
              <span class="font-medium text-blue-600">{{ formatNumber(dashboardData.totalUsers.customers) }}</span>
            </div>
          </div>
        </div>
        <div class="p-3 bg-green-100 rounded-lg">
          <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
          </svg>
        </div>
      </div>
    </div>

    <!-- Transactions Card -->
    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600">Transactions</p>
          <p class="text-3xl font-bold text-gray-900 mt-2">{{ formatNumber(dashboardData.transactions.count) }}</p>
          <p class="text-lg font-semibold text-green-600 mt-1">{{ formatCurrency(dashboardData.transactions.amount) }}</p>
          <div class="flex items-center mt-2">
            <span :class="getTrendColor(dashboardData.transactions.trend)" class="text-sm font-medium">
              {{ getTrendIcon(dashboardData.transactions.trend) }} {{ dashboardData.transactions.percentage }}%
            </span>
            <span class="text-gray-500 text-sm ml-2">vs previous period</span>
          </div>
        </div>
        <div class="p-3 bg-purple-100 rounded-lg">
          <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
        </div>
      </div>
    </div>

    <!-- Total Sales Analytics Card -->
    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600">Total Sales</p>
          <p class="text-3xl font-bold text-gray-900 mt-2">{{ formatCurrency(dashboardData.totalSales.amount) }}</p>
          <div class="flex items-center mt-2">
            <span :class="getTrendColor(dashboardData.totalSales.trend)" class="text-sm font-medium">
              {{ getTrendIcon(dashboardData.totalSales.trend) }} {{ dashboardData.totalSales.percentage }}%
            </span>
            <span class="text-gray-500 text-sm ml-2">vs previous period</span>
          </div>
        </div>
        <div class="p-3 bg-yellow-100 rounded-lg">
          <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
      </div>
    </div>

    <!-- Products Card -->
    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600">Total Products</p>
          <p class="text-3xl font-bold text-gray-900 mt-2">{{ formatNumber(dashboardData.products.total) }}</p>
          <div class="flex items-center mt-2">
            <span :class="getTrendColor(dashboardData.products.trend)" class="text-sm font-medium">
              {{ getTrendIcon(dashboardData.products.trend) }} {{ dashboardData.products.percentage }}%
            </span>
            <span class="text-gray-500 text-sm ml-2">vs previous period</span>
          </div>
        </div>
        <div class="p-3 bg-indigo-100 rounded-lg">
          <svg class="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
          </svg>
        </div>
      </div>
    </div>

    <!-- Sellers for Approval Card -->
    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600">Sellers for Approval</p>
          <p class="text-3xl font-bold text-orange-600 mt-2">{{ formatNumber(dashboardData.sellers.pending) }}</p>
          <div class="mt-2">
            <NuxtLink 
              to="/home/sellers?status=pending" 
              class="text-sm text-orange-600 hover:text-orange-700 font-medium inline-flex items-center"
            >
              Review Applications
              <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </NuxtLink>
          </div>
        </div>
        <div class="p-3 bg-orange-100 rounded-lg">
          <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
      </div>
    </div>

    <!-- Sellers Approved Card -->
    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600">Sellers Approved</p>
          <p class="text-3xl font-bold text-green-600 mt-2">{{ formatNumber(dashboardData.sellers.approved) }}</p>
          <div class="mt-1">
            <p class="text-sm text-gray-500">Total: {{ formatNumber(dashboardData.sellers.totalApproved) }}</p>
          </div>
          <div class="mt-2">
            <NuxtLink 
              to="/home/sellers?status=approved" 
              class="text-sm text-green-600 hover:text-green-700 font-medium inline-flex items-center"
            >
              View All Sellers
              <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </NuxtLink>
          </div>
        </div>
        <div class="p-3 bg-green-100 rounded-lg">
          <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
      </div>
    </div>

    <!-- Quick Actions Card -->
    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <div>
        <p class="text-sm font-medium text-gray-600 mb-4">Quick Actions</p>
        <div class="space-y-3">
          <NuxtLink 
            to="/home/users" 
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span class="text-sm font-medium text-gray-700">Manage Users</span>
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </NuxtLink>
          
          <NuxtLink 
            to="/home/sellers" 
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span class="text-sm font-medium text-gray-700">Manage Sellers</span>
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </NuxtLink>
          
          <NuxtLink 
            to="/home/products" 
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span class="text-sm font-medium text-gray-700">Manage Products</span>
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </NuxtLink>
          
          <NuxtLink 
            to="/home/transactions" 
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span class="text-sm font-medium text-gray-700">View Transactions</span>
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>

  <!-- Charts and Analytics Section -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
    
    <!-- Sales Analytics Chart Placeholder -->
    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-gray-900">Sales Analytics</h3>
        <div class="flex items-center space-x-2">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {{ formatCurrency(dashboardData.totalSales.amount) }}
          </span>
        </div>
      </div>
      
      <!-- Chart placeholder - you can integrate Chart.js or similar here -->
      <div class="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
        <div class="text-center">
          <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
          <p class="text-gray-500">Sales chart will be displayed here</p>
          <p class="text-sm text-gray-400 mt-1">Integrate with Chart.js or similar library</p>
        </div>
      </div>
    </div>

    <!-- User Growth Chart Placeholder -->
    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-gray-900">User Growth</h3>
        <div class="flex items-center space-x-2">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {{ formatNumber(dashboardData.totalUsers.total) }} Total
          </span>
        </div>
      </div>
      
      <!-- Chart placeholder -->
      <div class="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
        <div class="text-center">
          <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
          </svg>
          <p class="text-gray-500">User growth chart will be displayed here</p>
          <p class="text-sm text-gray-400 mt-1">Shows new users vs existing users over time</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Recent Activity Section -->
  <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-semibold text-gray-900">Recent Activity</h3>
      <div class="flex items-center space-x-3">
        <button 
          @click="refreshActivity"
          :disabled="activityLoading"
          class="text-sm text-green-600 hover:text-green-700 font-medium inline-flex items-center disabled:opacity-50"
        >
          <svg class="w-4 h-4 mr-1" :class="{ 'animate-spin': activityLoading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          {{ activityLoading ? 'Refreshing...' : 'Refresh' }}
        </button>
      </div>
    </div>
    
    <!-- Activity list -->
    <div v-if="recentActivities.length > 0" class="space-y-4">
      <div 
        v-for="activity in recentActivities" 
        :key="activity.id"
        class="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        :class="{ 'border-l-4 border-orange-500': activity.actionRequired }"
      >
        <div :class="getActivityIcon(activity.type).color" class="p-2 rounded-lg mr-4">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getActivityIcon(activity.type).icon"></path>
          </svg>
        </div>
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <p class="text-sm font-medium text-gray-900">{{ activity.title }}</p>
            <span v-if="activity.actionRequired" class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              Action Required
            </span>
          </div>
          <p class="text-xs text-gray-500 mt-1">{{ activity.description }}</p>
          <NuxtLink 
            v-if="activity.link" 
            :to="activity.link"
            class="text-xs text-green-600 hover:text-green-700 mt-1 inline-flex items-center"
          >
            View Details
            <svg class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </NuxtLink>
        </div>
        <span class="text-xs text-gray-400">{{ formatRelativeTime(activity.timestamp) }}</span>
      </div>
    </div>
    
    <!-- Empty state -->
    <div v-else class="text-center py-8">
      <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
      </svg>
      <p class="text-gray-500">No recent activity found</p>
      <p class="text-sm text-gray-400 mt-1">Activity will appear here as your platform grows</p>
    </div>
  </div>
</template>