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

const rejectionReason = ref('')
const showRejectForm = ref(false)

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
</script>

<template>
  <div v-if="show && product" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white rounded-xl shadow-lg w-full max-w-3xl p-6 relative max-h-screen overflow-y-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-gray-900">Product Approval</h2>
        <button 
          @click="closeModal" 
          class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Product Details -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Product Image -->
        <div>
          <div class="h-64 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
            <img
              :src="product.product_image || '/assets/images/logos-12-12.png'"
              :alt="product.product_name"
              class="object-contain h-48">
          </div>
          
          <!-- Status -->
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-500">Status:</span>
            <span
              :class="[
                'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                product.approval_status === 'approved' ? 'bg-green-100 text-green-800' :
                product.approval_status === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              ]">
              {{ (product.approval_status || 'pending').charAt(0).toUpperCase() + (product.approval_status || 'pending').slice(1) }}
            </span>
          </div>
        </div>

        <!-- Product Information -->
        <div class="space-y-4">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ product.product_name }}</h3>
            <p class="text-gray-600">{{ product.product_brief_description || 'No description available' }}</p>
          </div>

          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-500">Price:</span>
              <span class="font-medium text-gray-900 ml-2">₱{{ product.product_price }}</span>
            </div>
            <div>
              <span class="text-gray-500">Quantity:</span>
              <span class="font-medium text-gray-900 ml-2">{{ product.quantity || 0 }}</span>
            </div>
            <div>
              <span class="text-gray-500">Category:</span>
              <span class="font-medium text-gray-900 ml-2">{{ product.category_name || 'N/A' }}</span>
            </div>
            <div>
              <span class="text-gray-500">Status:</span>
              <span class="font-medium text-gray-900 ml-2">{{ product.product_status || 'N/A' }}</span>
            </div>
            <div>
              <span class="text-gray-500">Seller:</span>
              <span class="font-medium text-gray-900 ml-2">{{ product.seller_name || 'Unknown' }}</span>
            </div>
            <div>
              <span class="text-gray-500">Posted:</span>
              <span class="font-medium text-gray-900 ml-2">{{ formatDate(product.created_at) }}</span>
            </div>
          </div>

          <!-- Full Description -->
          <div v-if="product.product_full_description">
            <h4 class="font-medium text-gray-900 mb-2">Full Description</h4>
            <p class="text-gray-600 text-sm">{{ product.product_full_description }}</p>
          </div>

          <!-- Rejection Reason (if rejected) -->
          <div v-if="product.approval_status === 'rejected' && product.rejection_reason" class="p-3 bg-red-50 rounded-lg">
            <h4 class="font-medium text-red-900 mb-1">Rejection Reason</h4>
            <p class="text-red-700 text-sm">{{ product.rejection_reason }}</p>
          </div>
        </div>
      </div>

      <!-- Rejection Form -->
      <div v-if="showRejectForm" class="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 class="font-medium text-gray-900 mb-2">Rejection Reason</h4>
        <textarea
          v-model="rejectionReason"
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Please provide a reason for rejecting this product..."></textarea>
      </div>

      <!-- Actions -->
      <div class="flex justify-end space-x-3 mt-6 pt-4 border-t">
        <button
          @click="closeModal"
          class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
          Close
        </button>
        
        <template v-if="product.approval_status !== 'approved'">
          <button
            v-if="!showRejectForm"
            @click="showRejectForm = true"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
            Reject
          </button>
          
          <button
            v-if="showRejectForm"
            @click="handleReject"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
            Confirm Rejection
          </button>
          
          <button
            @click="handleApprove"
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            Approve Product
          </button>
        </template>
      </div>
    </div>
  </div>
</template>