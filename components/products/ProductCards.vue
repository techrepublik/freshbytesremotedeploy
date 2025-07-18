<script setup>
const props = defineProps({
  products: {
    type: Array,
    default: () => []
  }
})

// Calculate statistics from products data
const totalProducts = computed(() => {
  return props.products?.length || 0
})

const pendingApproval = computed(() => {
  if (!props.products?.length) return 0
  return props.products.filter(product => {
    return product.approval_status === 'pending' || product.status === 'pending'
  }).length
})

const approvedProducts = computed(() => {
  if (!props.products?.length) return 0
  return props.products.filter(product => {
    return product.approval_status === 'approved' || product.status === 'approved'
  }).length
})

const fastMovingProducts = computed(() => {
  if (!props.products?.length) return 0
  
  // Calculate fast moving based on sell_count and days since created
  return props.products.filter(product => {
    if (!product.sell_count || !product.created_at) return false
    
    const createdDate = new Date(product.created_at)
    const daysSinceCreated = Math.floor((new Date() - createdDate) / (1000 * 60 * 60 * 24))
    
    // Fast moving = more than 5 sales per week on average
    const salesPerDay = product.sell_count / Math.max(daysSinceCreated, 1)
    return salesPerDay >= 0.7 // ~5 sales per week
  }).length
})

// Calculate percentage changes (mock data - implement with historical data)
const totalProductsChange = computed(() => {
  return Math.floor(Math.random() * 20) - 10 // Random for demo
})

const pendingApprovalChange = computed(() => {
  return Math.floor(Math.random() * 30) - 15
})

const approvedProductsChange = computed(() => {
  return Math.floor(Math.random() * 25) - 5
})

const fastMovingChange = computed(() => {
  return Math.floor(Math.random() * 15) - 5
})

// Helper function to format change percentage
const formatChange = (change) => {
  if (change === 0) return '0%'
  const sign = change >= 0 ? '↗' : '↘'
  return `${sign} ${Math.abs(change)}%`
}

// Helper function to get change color class
const getChangeColorClass = (change) => {
  if (change > 0) {
    return 'text-green-800 bg-green-100 dark:bg-green-900 dark:text-green-200'
  } else if (change < 0) {
    return 'text-red-800 bg-red-100 dark:bg-red-900 dark:text-red-200'
  } else {
    return 'text-gray-800 bg-gray-100 dark:bg-gray-900 dark:text-gray-200'
  }
}
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
    <!-- Total Products Card -->
    <div class="p-5 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div class="flex justify-between items-start">
        <div>
          <span
            class="inline-flex items-center px-2 py-0.5 mb-2 text-xs font-medium rounded"
            :class="getChangeColorClass(totalProductsChange)">
            {{ formatChange(totalProductsChange) }}
          </span>
          <h5 class="text-3xl font-bold text-gray-900">{{ totalProducts }}</h5>
          <p class="mt-2 text-gray-600">Total Products</p>
        </div>
        <div class="p-2 bg-blue-100 rounded-lg">
          <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- Pending Approval Card -->
    <div class="p-5 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div class="flex justify-between items-start">
        <div>
          <span
            class="inline-flex items-center px-2 py-0.5 mb-2 text-xs font-medium rounded"
            :class="getChangeColorClass(pendingApprovalChange)">
            {{ formatChange(pendingApprovalChange) }}
          </span>
          <h5 class="text-3xl font-bold text-orange-600">{{ pendingApproval }}</h5>
          <p class="mt-2 text-gray-600">Pending Approval</p>
        </div>
        <div class="p-2 bg-orange-100 rounded-lg">
          <svg class="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- Approved Products Card -->
    <div class="p-5 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div class="flex justify-between items-start">
        <div>
          <span
            class="inline-flex items-center px-2 py-0.5 mb-2 text-xs font-medium rounded"
            :class="getChangeColorClass(approvedProductsChange)">
            {{ formatChange(approvedProductsChange) }}
          </span>
          <h5 class="text-3xl font-bold text-green-600">{{ approvedProducts }}</h5>
          <p class="mt-2 text-gray-600">Approved Products</p>
        </div>
        <div class="p-2 bg-green-100 rounded-lg">
          <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- Fast Moving Products Card -->
    <div class="p-5 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div class="flex justify-between items-start">
        <div>
          <span
            class="inline-flex items-center px-2 py-0.5 mb-2 text-xs font-medium rounded"
            :class="getChangeColorClass(fastMovingChange)">
            {{ formatChange(fastMovingChange) }}
          </span>
          <h5 class="text-3xl font-bold text-purple-600">{{ fastMovingProducts }}</h5>
          <p class="mt-2 text-gray-600">Fast Moving</p>
        </div>
        <div class="p-2 bg-purple-100 rounded-lg">
          <svg class="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd"/>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>