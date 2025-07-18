<script setup>

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  product: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'approve', 'reject'])

const config = useRuntimeConfig()
const api = config.public.API_LINK

const rejectionReason = ref('')
const showRejectForm = ref(false)
const loading = ref(false)

// Data for lookups
const categories = ref([])
const sellers = ref([])
const users = ref([])

// Get auth headers
const getAuthHeaders = () => {
  const accessTokenCookie = useCookie('auth-access-token')
  const token = accessTokenCookie.value
  
  return token ? {
    Authorization: `Bearer ${token}`
  } : {}
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

// Fetch sellers
const fetchSellers = async () => {
  try {
    const response = await $fetch(`${api}/api/sellers/`, {
      headers: getAuthHeaders()
    })
    sellers.value = response
  } catch (error) {
    console.error('Failed to fetch sellers:', error)
  }
}

// Fetch users
const fetchUsers = async () => {
  try {
    const response = await $fetch(`${api}/api/users/`, {
      headers: getAuthHeaders()
    })
    users.value = response
  } catch (error) {
    console.error('Failed to fetch users:', error)
  }
}

// Helper function to get category name
const getCategoryName = computed(() => {
  if (!props.product?.category_id || !categories.value.length) return 'N/A'
  const category = categories.value.find(cat => cat.category_id === props.product.category_id)
  return category ? category.category_name : 'N/A'
})

// Helper function to get seller name from users API
const getSellerName = computed(() => {
  if (!props.product?.seller_id || !sellers.value.length || !users.value.length) return 'Unknown'
  
  // First, find the seller by seller_id
  const seller = sellers.value.find(sel => sel.seller_id === props.product.seller_id)
  if (!seller || !seller.user_id) return 'Unknown'
  
  // Then, find the user by user_id to get the user_name
  const user = users.value.find(u => u.user_id === seller.user_id)
  return user ? user.user_name : 'Unknown'
})

// Load data when modal opens
const loadData = async () => {
  if (!props.show || !props.product) return
  
  loading.value = true
  try {
    await Promise.all([
      fetchCategories(),
      fetchSellers(),
      fetchUsers()
    ])
  } catch (error) {
    console.error('Failed to load modal data:', error)
  } finally {
    loading.value = false
  }
}

// Watch for modal open/close
watch(() => props.show, (newVal) => {
  if (newVal && props.product) {
    loadData()
  }
})

const closeModal = () => {
  rejectionReason.value = ''
  showRejectForm.value = false
  emit('close')
}

const handleApprove = () => {
  emit('approve', props.product.product_id)
  closeModal()
}

const handleReject = () => {
  if (!rejectionReason.value.trim()) {
    alert('Please provide a rejection reason')
    return
  }
  emit('reject', props.product.product_id, rejectionReason.value)
  closeModal()
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP'
  }).format(amount)
}
</script>

<template>
  <div v-if="show && product" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/30">
    <div class="bg-white rounded-xl shadow-lg w-full max-w-5xl p-6 relative max-h-screen overflow-y-auto">
      <!-- Loading Overlay -->
      <div v-if="loading" class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-xl">
        <div class="flex items-center space-x-2">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <span class="text-gray-600">Loading...</span>
        </div>
      </div>

      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">Product Approval</h2>
        <button 
          @click="closeModal" 
          class="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Product Details -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Product Image -->
        <div>
          <div class="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
            <img
              :src="product.product_image || product.product_image_url || '/assets/images/logos-12-12.png'"
              :alt="product.product_name"
              class="object-contain h-48 rounded-lg"
              @error="$event.target.src = '/assets/images/logos-12-12.png'">
          </div>
          
          <!-- Status -->
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-500 dark:text-gray-400">Current Status:</span>
            <span
              :class="[
                'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
                product.approval_status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                product.approval_status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
              ]">
              {{ (product.approval_status || 'pending').charAt(0).toUpperCase() + (product.approval_status || 'pending').slice(1) }}
            </span>
          </div>
        </div>

        <!-- Product Information -->
        <div class="space-y-4">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ product.product_name }}</h3>
            <p class="text-gray-600 dark:text-gray-300">{{ product.product_brief_description || 'No description available' }}</p>
          </div>

          <div class="grid grid-cols-2 gap-4 text-sm">
            <div class="flex flex-col">
              <span class="text-gray-500 dark:text-gray-400">Price:</span>
              <span class="font-semibold text-green-600 dark:text-green-400 text-lg">
                {{ formatCurrency(product.product_price) }}
              </span>
            </div>
            <div class="flex flex-col">
              <span class="text-gray-500 dark:text-gray-400">Quantity:</span>
              <span class="font-medium text-gray-900 dark:text-white">{{ product.quantity || 0 }} units</span>
            </div>
            <div class="flex flex-col">
              <span class="text-gray-500 dark:text-gray-400">Category:</span>
              <span class="font-medium text-gray-900 dark:text-white">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  {{ getCategoryName }}
                </span>
              </span>
            </div>
            <div class="flex flex-col">
              <span class="text-gray-500 dark:text-gray-400">Product Status:</span>
              <span class="font-medium text-gray-900 dark:text-white">
                <span :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  product.product_status === 'FRESH' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                  product.product_status === 'SLIGHTLY_WITHERED' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                  product.product_status === 'ROTTEN' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                ]">
                  {{ product.product_status || 'N/A' }}
                </span>
              </span>
            </div>
            <div class="flex flex-col">
              <span class="text-gray-500 dark:text-gray-400">Seller:</span>
              <span class="font-medium text-gray-900 dark:text-white">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                  {{ getSellerName }}
                </span>
              </span>
            </div>
            <div class="flex flex-col">
              <span class="text-gray-500 dark:text-gray-400">Posted Date:</span>
              <span class="font-medium text-gray-900 dark:text-white">{{ formatDate(product.created_at) }}</span>
            </div>
          </div>

          <!-- Location -->
          <div v-if="product.product_location" class="flex flex-col">
            <span class="text-gray-500 dark:text-gray-400 text-sm">Location:</span>
            <span class="font-medium text-gray-900 dark:text-white">{{ product.product_location }}</span>
          </div>

          <!-- Harvest Date -->
          <div v-if="product.harvest_date" class="flex flex-col">
            <span class="text-gray-500 dark:text-gray-400 text-sm">Harvest Date:</span>
            <span class="font-medium text-gray-900 dark:text-white">{{ formatDate(product.harvest_date) }}</span>
          </div>

          <!-- Full Description -->
          <div v-if="product.product_full_description" class="border-t pt-4">
            <h4 class="font-medium text-gray-900 dark:text-white mb-2">Full Description</h4>
            <p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{{ product.product_full_description }}</p>
          </div>

          <!-- Rejection Reason (if rejected) -->
          <div v-if="product.approval_status === 'rejected' && product.rejection_reason" class="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <h4 class="font-medium text-red-900 dark:text-red-300 mb-2 flex items-center">
              <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              Rejection Reason
            </h4>
            <p class="text-red-700 dark:text-red-300 text-sm">{{ product.rejection_reason }}</p>
            <p v-if="product.rejected_at" class="text-red-600 dark:text-red-400 text-xs mt-1">
              Rejected on: {{ formatDate(product.rejected_at) }}
            </p>
          </div>

          <!-- Approval Date (if approved) -->
          <div v-if="product.approval_status === 'approved' && product.approved_at" class="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <h4 class="font-medium text-green-900 dark:text-green-300 mb-1 flex items-center">
              <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              Product Approved
            </h4>
            <p class="text-green-700 dark:text-green-300 text-sm">
              Approved on: {{ formatDate(product.approved_at) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Rejection Form -->
      <div v-if="showRejectForm" class="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
        <h4 class="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
          <svg class="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          Rejection Reason
        </h4>
        <textarea
          v-model="rejectionReason"
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-600 dark:text-white"
          placeholder="Please provide a detailed reason for rejecting this product..."></textarea>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">This reason will be sent to the seller for review.</p>
      </div>

      <!-- Actions -->
      <div class="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
        <button
          @click="closeModal"
          class="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200">
          Close
        </button>
        
        <template v-if="product.approval_status !== 'approved'">
          <button
            v-if="!showRejectForm"
            @click="showRejectForm = true"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 flex items-center">
            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
            Reject Product
          </button>
          
          <button
            v-if="showRejectForm"
            @click="showRejectForm = false"
            class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200">
            Cancel
          </button>
          
          <button
            v-if="showRejectForm"
            @click="handleReject"
            :disabled="!rejectionReason.trim()"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
            Confirm Rejection
          </button>
          
          <button
            v-if="!showRejectForm"
            @click="handleApprove"
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center">
            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            Approve Product
          </button>
        </template>
      </div>
    </div>
  </div>
</template>