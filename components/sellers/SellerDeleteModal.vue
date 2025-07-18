<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
    show: {
        type: Boolean,
        required: true
    },
    seller: {
        type: Object,
        default: () => null
    },
    selectedSellers: {
        type: Array,
        default: () => []
    },
    deleteType: {
        type: String, // 'single' or 'multiple'
        default: 'single'
    }
})

const emit = defineEmits(['close', 'confirm', 'cancel'])

const loading = ref(false)

// Computed properties for display
const isSingleDelete = computed(() => props.deleteType === 'single')
const isMultipleDelete = computed(() => props.deleteType === 'multiple')

const sellerName = computed(() => {
    return props.seller?.seller_name || 'Unknown Seller'
})

const selectedCount = computed(() => {
    return props.selectedSellers?.length || 0
})

const modalTitle = computed(() => {
    return isSingleDelete.value ? 'Delete Seller' : `Delete ${selectedCount.value} Sellers`
})

const modalMessage = computed(() => {
    if (isSingleDelete.value) {
        return `Are you sure you want to delete the seller "${sellerName.value}"? This action cannot be undone.`
    } else {
        return `Are you sure you want to delete ${selectedCount.value} selected seller(s)? This action cannot be undone.`
    }
})

// Handle confirm delete
async function confirmDelete() {
    loading.value = true
    try {
        const config = useRuntimeConfig()
        const api = config.public.API_LINK
        
        if (isSingleDelete.value && props.seller) {
            // Single seller delete
            await $fetch(`${api}/api/sellers/${props.seller.seller_id}/`, {
                method: 'DELETE'
            })
        } else if (isMultipleDelete.value && props.selectedSellers.length > 0) {
            // Multiple sellers delete
            const deletePromises = props.selectedSellers.map(seller => 
                $fetch(`${api}/api/sellers/${seller.seller_id}/`, {
                    method: 'DELETE'
                })
            )
            await Promise.all(deletePromises)
        }
        
        emit('confirm')
        handleClose()
    } catch (err) {
        console.error('Delete error:', err)
        alert('Failed to delete seller(s)')
    } finally {
        loading.value = false
    }
}

// Handle cancel/close
function handleClose() {
    emit('close')
    emit('cancel') // This will clear the checkboxes
}

// Handle cancel button click
function handleCancel() {
    emit('cancel') // This will clear the checkboxes
    emit('close')
}
</script>

<template>
    <!-- Delete Seller Modal -->
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/50">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
            <!-- Close button -->
            <button
                @click="handleClose"
                type="button"
                class="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl font-bold focus:outline-none"
                aria-label="Close"
            >
                &times;
            </button>
            
            <!-- Modal Header -->
            <div class="flex items-center mb-4">
                <div class="flex-shrink-0 w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>
            </div>
            
            <!-- Modal Title -->
            <h3 class="text-lg font-medium text-gray-900 text-center mb-2">
                {{ modalTitle }}
            </h3>
            
            <!-- Modal Message -->
            <p class="text-sm text-gray-500 text-center mb-6">
                {{ modalMessage }}
            </p>
            
            <!-- Seller Details for Single Delete -->
            <div v-if="isSingleDelete && seller" class="bg-gray-50 rounded-lg p-4 mb-6">
                <div class="flex items-center">
                    <img 
                        :src="seller.avatar || '/assets/images/default-avatar.png'" 
                        :alt="seller.seller_name"
                        class="w-10 h-10 rounded-full mr-3" 
                    />
                    <div>
                        <p class="font-medium text-gray-900">{{ seller.seller_name }}</p>
                        <p class="text-sm text-gray-500">{{ seller.seller_email }}</p>
                    </div>
                </div>
            </div>
            
            <!-- Selected Sellers Preview for Multiple Delete -->
            <div v-if="isMultipleDelete && selectedSellers.length > 0" class="bg-gray-50 rounded-lg p-4 mb-6 max-h-32 overflow-y-auto">
                <div class="space-y-2">
                    <div v-for="seller in selectedSellers.slice(0, 3)" :key="seller.seller_id" class="flex items-center">
                        <img 
                            :src="seller.avatar || '/assets/images/default-avatar.png'" 
                            :alt="seller.seller_name"
                            class="w-8 h-8 rounded-full mr-3" 
                        />
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-gray-900 truncate">{{ seller.seller_name }}</p>
                            <p class="text-xs text-gray-500 truncate">{{ seller.seller_email }}</p>
                        </div>
                    </div>
                    <div v-if="selectedSellers.length > 3" class="text-xs text-gray-500 text-center pt-2">
                        And {{ selectedSellers.length - 3 }} more seller(s)...
                    </div>
                </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="flex justify-end gap-3">
                <button
                    @click="handleCancel"
                    type="button"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    :disabled="loading"
                >
                    Cancel
                </button>
                <button
                    @click="confirmDelete"
                    type="button"
                    class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    :disabled="loading"
                >
                    <span v-if="loading">Deleting...</span>
                    <span v-else>{{ isSingleDelete ? 'Delete Seller' : `Delete ${selectedCount} Seller(s)` }}</span>
                </button>
            </div>
        </div>
    </div>
</template>