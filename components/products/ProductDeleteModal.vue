<script setup>
// Define props
const props = defineProps({
    showSingleDelete: {
        type: Boolean,
        default: false
    },
    showMultipleDelete: {
        type: Boolean,
        default: false
    },
    singleProduct: {
        type: Object,
        default: null
    },
    selectedProducts: {
        type: Array,
        default: () => []
    },
    deleting: {
        type: Boolean,
        default: false
    }
});

// Define emits
const emit = defineEmits([
    'close',
    'confirm-single',
    'confirm-multiple',
    'clear-selections'
]);

// Close modal and clear selections
function handleClose() {
    emit('close');
    emit('clear-selections');
}

// Close modal when clicking outside
function handleBackdropClick(event) {
    if (event.target.id === 'delete-modal' || event.target.id === 'delete-selected-modal') {
        handleClose();
    }
}

// Add event listener for backdrop clicks
onMounted(() => {
    document.addEventListener('click', handleBackdropClick);
});

onUnmounted(() => {
    document.removeEventListener('click', handleBackdropClick);
});
</script>

<template>
    <!-- Single Product Delete Modal -->
    <div v-if="showSingleDelete && singleProduct" class="fixed inset-0 bg-gray-800/30 overflow-y-auto h-full w-full z-50" id="delete-modal">
        <div class="relative top-80 mx-auto p-5 w-96 shadow-lg rounded-md bg-white">
            <div class="mt-3 text-center">
                <!-- Close button -->
                <button @click="handleClose" class="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>

                <!-- Warning icon -->
                <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>

                <!-- Modal content -->
                <h3 class="text-lg leading-6 font-medium text-gray-900 mt-4">Delete Product</h3>
                <div class="mt-2 px-7 py-3">
                    <p class="text-sm text-gray-500">
                        Are you sure you want to delete "{{ singleProduct.product_name }}"? This action cannot be undone.
                    </p>
                </div>

                <!-- Action buttons -->
                <div class="items-center px-4 py-3">
                    <div class="flex justify-center space-x-4">
                        <button
                            type="button"
                            @click="handleClose"
                            class="px-4 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            @click="$emit('confirm-single')"
                            :disabled="deleting"
                            class="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50"
                        >
                            <span v-if="deleting">Deleting...</span>
                            <span v-else>Delete</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Multiple Products Delete Modal -->
    <div v-if="showMultipleDelete && selectedProducts.length > 0" class="fixed inset-0 bg-gray-800/30 overflow-y-auto h-full w-full z-50" id="delete-selected-modal">
        <div class="relative top-80 mx-auto p-5 w-96 shadow-lg rounded-md bg-white">
            <div class="mt-3 text-center">
                <!-- Close button -->
                <button @click="handleClose" class="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>

                <!-- Warning icon -->
                <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>

                <!-- Modal content -->
                <h3 class="text-lg leading-6 font-medium text-gray-900 mt-4">Delete Selected Products</h3>
                <div class="mt-2 px-7 py-3">
                    <p class="text-sm text-gray-500">
                        Are you sure you want to delete {{ selectedProducts.length }} selected product{{ selectedProducts.length !== 1 ? 's' : '' }}? This action cannot be undone.
                    </p>
                    <div v-if="selectedProducts.length <= 5" class="mt-3 text-left">
                        <p class="text-xs text-gray-400 mb-2">Products to be deleted:</p>
                        <ul class="text-xs text-gray-600 space-y-1">
                            <li v-for="product in selectedProducts" :key="product.product_id" class="truncate">
                                • {{ product.product_name }}
                            </li>
                        </ul>
                    </div>
                    <div v-else class="mt-3 text-left">
                        <p class="text-xs text-gray-400 mb-2">First 5 products to be deleted:</p>
                        <ul class="text-xs text-gray-600 space-y-1">
                            <li v-for="product in selectedProducts.slice(0, 5)" :key="product.product_id" class="truncate">
                                • {{ product.product_name }}
                            </li>
                        </ul>
                        <p class="text-xs text-gray-400 mt-2">...and {{ selectedProducts.length - 5 }} more</p>
                    </div>
                </div>

                <!-- Action buttons -->
                <div class="items-center px-4 py-3">
                    <div class="flex justify-center space-x-4">
                        <button
                            type="button"
                            @click="handleClose"
                            class="px-4 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            @click="$emit('confirm-multiple')"
                            :disabled="deleting"
                            class="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50"
                        >
                            <span v-if="deleting">Deleting...</span>
                            <span v-else>Delete {{ selectedProducts.length }} Product{{ selectedProducts.length !== 1 ? 's' : '' }}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>