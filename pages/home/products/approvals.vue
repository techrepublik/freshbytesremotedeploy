<script setup>
import ProductHeader from '~/components/products/ProductHeader.vue'

definePageMeta({
  layout: "home",
})

const config = useRuntimeConfig()
const api = config.public.API_LINK

// Data
const loading = ref(false)
const products = ref([])
const selectedTab = ref('pending') // 'pending' or 'approved'
const selectedProduct = ref(null)
const showApprovalModal = ref(false)

// Filters
const searchTerm = ref('')
const selectedCategory = ref('')
const categories = ref([])

// Get auth headers
const getAuthHeaders = () => {
  const accessTokenCookie = useCookie('auth-access-token')
  const token = accessTokenCookie.value
  
  return token ? {
    Authorization: `Bearer ${token}`
  } : {}
}

// Fetch products for approval
const fetchProducts = async () => {
  loading.value = true
  try {
    const response = await $fetch(`${api}/api/products/`, {
      headers: getAuthHeaders()
    })
    
    products.value = response.map(p => ({
      ...p,
      selected: false
    }))
  } catch (error) {
    console.error('Failed to fetch products:', error)
  } finally {
    loading.value = false
  }
}

// Fetch categories
const fetchCategories = async () => {
  try {
    const response = await $fetch(`${api}/api/categories/`, {
      headers: getAuthHeaders()
    })
    categories.value = response
  } catch (error) {
    console.error('Failed to fetch categories:', error)
  }
}

// Filtered products based on approval status and filters
const filteredProducts = computed(() => {
  let filtered = products.value.filter(product => {
    if (selectedTab.value === 'pending') {
      return product.approval_status === 'pending' || !product.approval_status
    } else {
      return product.approval_status === 'approved'
    }
  })

  // Apply search filter
  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter(product =>
      product.product_name?.toLowerCase().includes(search) ||
      product.product_brief_description?.toLowerCase().includes(search)
    )
  }

  // Apply category filter
  if (selectedCategory.value) {
    filtered = filtered.filter(product => product.category_id === selectedCategory.value)
  }

  return filtered
})

// Count products by status
const pendingCount = computed(() => products.value.filter(p => p.approval_status === 'pending' || !p.approval_status).length)
const approvedCount = computed(() => products.value.filter(p => p.approval_status === 'approved').length)

// Approve product
const approveProduct = async (productId) => {
  try {
    await $fetch(`${api}/api/products/${productId}/`, {
      method: 'PATCH',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: {
        approval_status: 'approved',
        approved_at: new Date().toISOString()
      }
    })

    // Update local data
    const product = products.value.find(p => p.product_id === productId)
    if (product) {
      product.approval_status = 'approved'
      product.approved_at = new Date().toISOString()
    }

    alert('Product approved successfully!')
  } catch (error) {
    console.error('Failed to approve product:', error)
    alert('Failed to approve product. Please try again.')
  }
}

// Reject product
const rejectProduct = async (productId, reason = '') => {
  try {
    await $fetch(`${api}/api/products/${productId}/`, {
      method: 'PATCH',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: {
        approval_status: 'rejected',
        rejection_reason: reason,
        rejected_at: new Date().toISOString()
      }
    })

    // Update local data
    const product = products.value.find(p => p.product_id === productId)
    if (product) {
      product.approval_status = 'rejected'
      product.rejection_reason = reason
      product.rejected_at = new Date().toISOString()
    }

    alert('Product rejected successfully!')
  } catch (error) {
    console.error('Failed to reject product:', error)
    alert('Failed to reject product. Please try again.')
  }
}

// Open approval modal
const openApprovalModal = (product) => {
  selectedProduct.value = product
  showApprovalModal.value = true
}

// Close approval modal
const closeApprovalModal = () => {
  selectedProduct.value = null
  showApprovalModal.value = false
}

// Format date
const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Get status badge class
const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'rejected':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    case 'pending':
    default:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
  }
}

// Initialize data
onMounted(() => {
  fetchProducts()
  fetchCategories()
})
</script>

<template>
  <div>
    <!-- ProductHeader with Breadcrumb -->
    <ProductHeader 
      title="Product Approvals"
      subtitle="Review and approve products submitted by sellers"
      :show-add-button="false" 
      :show-tabs="true" />
    
    <!-- Loading component -->
    <Loading :loading="loading" />
    
    <!-- Product Statistics Cards -->
    <ProductCards :products="products" />

    <!-- Main Content Section -->
    <div class="flex flex-col">
      <div class="overflow-x-auto">
        <div class="inline-block min-w-full align-middle">
          <div class="overflow-hidden shadow">
            
            <!-- Status Tabs (specific to approvals) -->
            <div class="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              <nav class="flex px-6 pt-6 -mb-px space-x-8">
                <button
                  @click="selectedTab = 'pending'"
                  :class="[
                    selectedTab === 'pending'
                      ? 'border-green-500 text-green-600 dark:text-green-400 dark:border-green-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300',
                    'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200'
                  ]">
                  Pending Approval ({{ pendingCount }})
                </button>
                <button
                  @click="selectedTab = 'approved'"
                  :class="[
                    selectedTab === 'approved'
                      ? 'border-green-500 text-green-600 dark:text-green-400 dark:border-green-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300',
                    'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200'
                  ]">
                  Approved ({{ approvedCount }})
                </button>
              </nav>
            </div>

            <!-- Filters Section -->
            <div class="bg-white px-6 py-4 border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <!-- Search -->
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search Products</label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                      </svg>
                    </div>
                    <input
                      v-model="searchTerm"
                      type="text"
                      placeholder="Search by name or description..."
                      class="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-500 dark:focus:border-green-500">
                  </div>
                </div>

                <!-- Category Filter -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select
                    v-model="selectedCategory"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-500 dark:focus:border-green-500">
                    <option value="">All Categories</option>
                    <option v-for="category in categories" :key="category.category_id" :value="category.category_id">
                      {{ category.category_name }}
                    </option>
                  </select>
                </div>

                <!-- Clear Filters -->
                <div class="flex items-end">
                  <button
                    @click="searchTerm = ''; selectedCategory = ''"
                    class="w-full px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-green-700 focus:z-10 focus:ring-2 focus:ring-green-700 focus:text-green-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-green-500 dark:focus:text-white transition-colors duration-200">
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            <!-- Products Table -->
            <div class="bg-white dark:bg-gray-800">
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
                      Seller
                    </th>
                    <th scope="col" class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                      Status
                    </th>
                    <th scope="col" class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                      Posted Date
                    </th>
                    <th scope="col" class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  <tr v-for="product in filteredProducts" :key="product.product_id" class="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150">
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
                          <div class="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                            {{ product.product_brief_description || 'No description available' }}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      ₱{{ product.product_price }}
                    </td>
                    <td class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      {{ product.seller_name || 'Unknown' }}
                    </td>
                    <td class="p-4 whitespace-nowrap">
                      <span
                        :class="[
                          'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                          getStatusBadgeClass(product.approval_status || 'pending')
                        ]">
                        {{ (product.approval_status || 'pending').charAt(0).toUpperCase() + (product.approval_status || 'pending').slice(1) }}
                      </span>
                    </td>
                    <td class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      {{ formatDate(product.created_at) }}
                    </td>
                    <td class="p-4 space-x-2 whitespace-nowrap">
                      <button
                        @click="openApprovalModal(product)"
                        class="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 transition-colors duration-200">
                        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                          <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
                        </svg>
                        View
                      </button>
                      
                      <template v-if="selectedTab === 'pending'">
                        <button
                          @click="approveProduct(product.product_id)"
                          class="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-green-700 rounded-lg hover:bg-green-800 focus:ring-4 focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 transition-colors duration-200">
                          <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                          </svg>
                          Approve
                        </button>
                        <button
                          @click="rejectProduct(product.product_id, 'Rejected by admin')"
                          class="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-red-600 rounded-lg hover:bg-red-800 focus:ring-4 focus:ring-red-300 dark:focus:ring-red-900 transition-colors duration-200">
                          <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                          </svg>
                          Reject
                        </button>
                      </template>
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- Empty State -->
              <div v-if="!loading && filteredProducts.length === 0" class="flex flex-col items-center justify-center py-12">
                <svg class="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-4m-4 0H9m-4 0h4m0 0V9a2 2 0 012-2h2a2 2 0 012 2v4.01" />
                </svg>
                <h3 class="text-xl font-medium text-gray-900 dark:text-white mb-2">No products found</h3>
                <p class="text-gray-500 dark:text-gray-400 text-center">
                  {{ selectedTab === 'pending' ? 'No products pending approval.' : 'No approved products found.' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Product Approval Modal -->
    <ProductApprovalModal
      :show="showApprovalModal"
      :product="selectedProduct"
      @close="closeApprovalModal"
      @approve="approveProduct"
      @reject="rejectProduct"
    />
  </div>
</template>