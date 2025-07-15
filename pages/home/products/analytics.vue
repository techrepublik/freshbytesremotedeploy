<script setup>
import ProductHeader from '~/components/products/ProductHeader.vue'

definePageMeta({
  layout: "home",
})

const config = useRuntimeConfig()
const api = config.public.API_LINK

const loading = ref(false)
const products = ref([])
const analytics = ref({
  fastMoving: [],
  slowMoving: [],
  topCategories: [],
  salesTrends: []
})

// Get auth headers
const getAuthHeaders = () => {
  const accessTokenCookie = useCookie('auth-access-token')
  const token = accessTokenCookie.value
  
  return token ? {
    Authorization: `Bearer ${token}`
  } : {}
}

// Fetch products and calculate analytics
const fetchAnalytics = async () => {
  loading.value = true
  try {
    const response = await $fetch(`${api}/api/products/`, {
      headers: getAuthHeaders()
    })
    
    products.value = response
    calculateAnalytics()
  } catch (error) {
    console.error('Failed to fetch analytics:', error)
  } finally {
    loading.value = false
  }
}

// Calculate analytics data
const calculateAnalytics = () => {
  if (!products.value.length) return

  // Fast moving products (high sales per day ratio)
  analytics.value.fastMoving = products.value
    .filter(p => p.sell_count > 0 && p.created_at)
    .map(product => {
      const createdDate = new Date(product.created_at)
      const daysSinceCreated = Math.max(Math.floor((new Date() - createdDate) / (1000 * 60 * 60 * 24)), 1)
      const salesPerDay = product.sell_count / daysSinceCreated
      
      return {
        ...product,
        salesPerDay,
        velocity: salesPerDay * 7 // Weekly velocity
      }
    })
    .sort((a, b) => b.velocity - a.velocity)
    .slice(0, 10)

  // Slow moving products
  analytics.value.slowMoving = products.value
    .filter(p => p.created_at)
    .map(product => {
      const createdDate = new Date(product.created_at)
      const daysSinceCreated = Math.floor((new Date() - createdDate) / (1000 * 60 * 60 * 24))
      const salesPerDay = (product.sell_count || 0) / Math.max(daysSinceCreated, 1)
      
      return {
        ...product,
        salesPerDay,
        daysSinceCreated
      }
    })
    .filter(p => p.daysSinceCreated > 30) // Only products older than 30 days
    .sort((a, b) => a.salesPerDay - b.salesPerDay)
    .slice(0, 10)

  // Top categories by sales
  const categoryStats = {}
  products.value.forEach(product => {
    const categoryId = product.category_id
    if (!categoryStats[categoryId]) {
      categoryStats[categoryId] = {
        category_id: categoryId,
        category_name: product.category_name || 'Unknown',
        totalSales: 0,
        productCount: 0,
        totalRevenue: 0
      }
    }
    categoryStats[categoryId].totalSales += product.sell_count || 0
    categoryStats[categoryId].productCount += 1
    categoryStats[categoryId].totalRevenue += (product.sell_count || 0) * (product.product_price || 0)
  })

  analytics.value.topCategories = Object.values(categoryStats)
    .sort((a, b) => b.totalSales - a.totalSales)
    .slice(0, 5)
}

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP'
  }).format(amount)
}

// Format number
const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num)
}

onMounted(() => {
  fetchAnalytics()
})
</script>

<template>
  <div>
    <!-- ProductHeader with Breadcrumb -->
    <ProductHeader 
      title="Product Analytics"
      subtitle="Analyze product performance and sales trends"
      :show-add-button="false" 
      :show-tabs="true" />
    
    <!-- Loading component -->
    <Loading :loading="loading" />

    <!-- Product Statistics Cards -->
    <ProductCards :products="products" />

    <!-- Analytics Tables Section -->
    <div class="flex flex-col">
      <div class="overflow-x-auto">
        <div class="inline-block min-w-full align-middle">
          <div class="overflow-hidden shadow">
            
            <!-- Fast Moving Products Section -->
            <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Fast Moving Products</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">Products with highest sales velocity</p>
              </div>
              
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead class="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                        Product
                      </th>
                      <th scope="col" class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                        Price
                      </th>
                      <th scope="col" class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                        Total Sales
                      </th>
                      <th scope="col" class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                        Sales/Day
                      </th>
                      <th scope="col" class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                        Weekly Velocity
                      </th>
                      <th scope="col" class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    <tr v-for="product in analytics.fastMoving" :key="product.product_id" class="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150">
                      <td class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        <div class="flex items-center">
                          <img 
                            :src="product.product_image || '/assets/images/logos-12-12.png'" 
                            :alt="product.product_name"
                            class="w-10 h-10 rounded-lg object-cover mr-4">
                          <div>
                            <div class="text-sm font-semibold text-gray-900 dark:text-white">
                              {{ product.product_name }}
                            </div>
                            <div class="text-sm text-gray-500 dark:text-gray-400">
                              {{ product.category_name }}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {{ formatCurrency(product.product_price) }}
                      </td>
                      <td class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {{ formatNumber(product.sell_count) }}
                      </td>
                      <td class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {{ product.salesPerDay.toFixed(2) }}
                      </td>
                      <td class="p-4 whitespace-nowrap">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          {{ product.velocity.toFixed(1) }}
                        </span>
                      </td>
                      <td class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {{ formatCurrency(product.sell_count * product.product_price) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
                
                <!-- Empty state for fast moving -->
                <div v-if="analytics.fastMoving.length === 0" class="text-center py-8">
                  <p class="text-gray-500 dark:text-gray-400">No fast moving products data available</p>
                </div>
              </div>
            </div>

            <!-- Top Categories Section -->
            <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Top Performing Categories</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">Categories with highest sales performance</p>
              </div>
              
              <div class="p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div v-for="category in analytics.topCategories" :key="category.category_id"
                       class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow duration-200">
                    <h3 class="font-semibold text-gray-900 dark:text-white mb-3">{{ category.category_name }}</h3>
                    <div class="space-y-2 text-sm">
                      <div class="flex justify-between">
                        <span class="text-gray-500 dark:text-gray-400">Products:</span>
                        <span class="font-medium text-gray-900 dark:text-white">{{ formatNumber(category.productCount) }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-500 dark:text-gray-400">Total Sales:</span>
                        <span class="font-medium text-gray-900 dark:text-white">{{ formatNumber(category.totalSales) }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-500 dark:text-gray-400">Revenue:</span>
                        <span class="font-medium text-green-600 dark:text-green-400">{{ formatCurrency(category.totalRevenue) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Empty state for categories -->
                <div v-if="analytics.topCategories.length === 0" class="text-center py-8">
                  <p class="text-gray-500 dark:text-gray-400">No category performance data available</p>
                </div>
              </div>
            </div>

            <!-- Slow Moving Products Section -->
            <div class="bg-white dark:bg-gray-800">
              <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Slow Moving Products</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">Products that need attention or promotion</p>
              </div>
              
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead class="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                        Product
                      </th>
                      <th scope="col" class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                        Days Listed
                      </th>
                      <th scope="col" class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                        Total Sales
                      </th>
                      <th scope="col" class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                        Sales/Day
                      </th>
                      <th scope="col" class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    <tr v-for="product in analytics.slowMoving" :key="product.product_id" class="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150">
                      <td class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        <div class="flex items-center">
                          <img 
                            :src="product.product_image || '/assets/images/logos-12-12.png'" 
                            :alt="product.product_name"
                            class="w-10 h-10 rounded-lg object-cover mr-4">
                          <div>
                            <div class="text-sm font-semibold text-gray-900 dark:text-white">
                              {{ product.product_name }}
                            </div>
                            <div class="text-sm text-gray-500 dark:text-gray-400">
                              {{ formatCurrency(product.product_price) }}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {{ product.daysSinceCreated }}
                      </td>
                      <td class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {{ product.sell_count || 0 }}
                      </td>
                      <td class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {{ product.salesPerDay.toFixed(3) }}
                      </td>
                      <td class="p-4 whitespace-nowrap">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                          Slow Moving
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
                
                <!-- Empty state for slow moving -->
                <div v-if="analytics.slowMoving.length === 0" class="text-center py-8">
                  <p class="text-gray-500 dark:text-gray-400">No slow moving products data available</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>