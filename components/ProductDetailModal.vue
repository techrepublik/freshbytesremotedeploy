<script setup>
    defineProps({
        selectedProduct: {
            type: Object,
            required: true
        },
        categories: {
            type: Array,
            required: true
        },
        subcategories: {
            type: Array,
            required: true
        },
        showProductModal: {
            type: Boolean,
            required: true
        },
    })

    const emit = defineEmits(['closeProductModal', 'update-product', 'delete-product']); // List of component actions

    function closeModal() {
        emit('closeProductModal');
    }

    function formatDate(dateStr) {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        if (isNaN(date)) return dateStr; // fallback if invalid
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
</script>

<template>
    <div v-if="showProductModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-opacity-30 bg-gray-800/30">
        <div class="bg-white rounded-xl shadow-lg w-full max-w-2xl p-8 relative h-screen overflow-y-auto">
            <!-- Close button -->
            <button class="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl" @click="closeModal"
                aria-label="Close">&times;</button>
            <!-- Product Title and Price -->
            <div class="flex flex-col gap-1 mb-4">
                <h2 class="text-2xl font-bold text-gray-900">{{ selectedProduct.product_name }}</h2>
                <span class="text-xl font-semibold text-gray-700">₱{{ selectedProduct.product_price
                }}</span>
            </div>
            <!-- Images (placeholder) -->
            <div class="flex gap-4 mb-4">
                <div class="w-28 h-24 bg-gray-100 rounded flex items-center justify-center">
                    <img src="\assets\images\logos-12-12.png" alt="Product" class="object-contain h-20" />
                </div>
                <div class="w-28 h-24 bg-gray-100 rounded flex items-center justify-center">
                    <img src="\assets\images\logos-12-12.png" alt="Product" class="object-contain h-20" />
                </div>
                <div class="w-28 h-24 bg-gray-100 rounded flex items-center justify-center">
                    <img src="\assets\images\logos-12-12.png" alt="Product" class="object-contain h-20" />
                </div>
                <div class="w-28 h-24 bg-gray-100 rounded flex items-center justify-center">
                    <img src="\assets\images\logos-12-12.png" alt="Product" class="object-contain h-20" />
                </div>
            </div>
            <!-- Brief Description -->
            <div class="mb-2">
                <div class="font-semibold text-gray-900 mb-1">Brief Description</div>
                <div class="text-gray-700 text-sm">
                    {{ selectedProduct.product_brief_description || 'No brief description available.' }}
                </div>
            </div>
            <!-- Detailed Description -->
            <div class="mb-2">
                <div class="font-semibold text-gray-900 mb-1">Detailed Description</div>
                <div class="text-gray-700 text-sm">
                    {{ selectedProduct.product_full_description || 'No detailed description available.' }}
                </div>
            </div>
            <!-- Info Grid -->
            <div class="grid grid-cols-2 gap-4 mb-4">
                <div class="bg-gray-50 border-1 border-gray-400 rounded-lg p-3">
                    <div class="text-xs text-gray-500">Category</div>
                    <div class="font-medium text-gray-900"> {{categories.find(cat =>
                        cat.category_id === selectedProduct.category_id)?.category_name || 'N/A'}}
                    </div>
                </div>
                <div class="bg-gray-50 border-1 border-gray-400 rounded-lg p-3">
                    <div class="text-xs text-gray-500">Sub-category</div>
                    <div class="font-medium text-gray-900"> {{subcategories.find(subcat => subcat.sub_category_id ===
                        selectedProduct.sub_category_id)?.sub_category_name || 'N/A' }} </div>
                </div>
                <div class="bg-gray-50 border-1 border-gray-400 rounded-lg p-3">
                    <div class="text-xs text-gray-500">Product Status</div>
                    <span
                        class="inline-flex items-center px-2 py-0.5 text-base font-medium rounded"
                        :class="{
                            'bg-green-100 text-green-600': selectedProduct.product_status === 'FRESH',
                            'bg-yellow-100 text-yellow-600': selectedProduct.product_status === 'SLIGHTLY_WITHERED',
                            'bg-red-100 text-red-400': selectedProduct.product_status === 'ROTTEN'
                        }"
                    >
                        <svg class="w-3 h-3 mr-1"
                            :class="{
                                'text-green-600': selectedProduct.product_status === 'FRESH',
                                'text-yellow-600': selectedProduct.product_status === 'SLIGHTLY_WITHERED',
                                'text-red-400': selectedProduct.product_status === 'ROTTEN'
                            }"
                            fill="currentColor" viewBox="0 0 20 20">
                            <circle cx="10" cy="10" r="10" />
                        </svg>
                        {{
                            selectedProduct.product_status === 'FRESH'
                                ? 'Fresh'
                                : selectedProduct.product_status === 'SLIGHTLY_WITHERED'
                                ? 'Slightly Withered'
                                : selectedProduct.product_status === 'ROTTEN'
                                ? 'Rotten'
                                : selectedProduct.product_status
                        }}
                    </span>
                </div>
                <div class="bg-gray-50 border-1 border-gray-400 rounded-lg p-3">
                    <div class="text-xs text-gray-500">On SRP?</div>
                    <div class="font-medium text-gray-900">{{ selectedProduct.is_srp }}</div>
                </div>
                <div class="bg-gray-50 border-1 border-gray-400 rounded-lg p-3">
                    <div class="text-xs text-gray-500">Current Price</div>
                    <div class="font-medium text-gray-900">₱{{ selectedProduct.product_price }}
                    </div>
                </div>
                <div class="bg-gray-50 border-1 border-gray-400 rounded-lg p-3">
                    <div class="text-xs text-gray-500">Discounted Price</div>
                    <div class="font-medium text-gray-900">
                        ₱{{ selectedProduct.product_discountedPrice ? selectedProduct.product_discountedPrice : '0.00' }}
                    </div>
                </div>
                <div class="bg-gray-50 border-1 border-gray-400 rounded-lg p-3">
                    <div class="text-xs text-gray-500">Product Location</div>
                    <div class="font-medium text-gray-900">{{ selectedProduct.product_location }}
                    </div>
                </div>
                <div class="bg-gray-50 border-1 border-gray-400 rounded-lg p-3">
                    <div class="text-xs text-gray-500">Quantity</div>
                    <div class="font-medium text-gray-900">{{ selectedProduct.quantity }}</div>
                </div>
                <div class="bg-gray-50 border-1 border-gray-400 rounded-lg p-3">
                    <div class="text-xs text-gray-500">Product SKU</div>
                    <div class="font-medium text-gray-900">{{ selectedProduct.product_sku }}</div>
                </div>
                <div class="bg-gray-50 border-1 border-gray-400 rounded-lg p-3">
                    <div class="text-xs text-gray-500">Posted Date</div>
                    <div class="font-medium text-gray-900">{{ formatDate(selectedProduct.post_date)
                    }}</div>
                </div>
                <div class="bg-gray-50 border-1 border-gray-400 rounded-lg p-3">
                    <div class="text-xs text-gray-500">Harvest Date</div>
                    <div class="font-medium text-gray-900">{{
                        formatDate(selectedProduct.harvest_date) }}</div>
                </div>
                <div class="bg-gray-50 border-1 border-gray-400 rounded-lg p-3">
                    <div class="text-xs text-gray-500">On Discount?</div>
                    <div class="font-medium text-gray-900">{{ selectedProduct.is_discounted }}</div>
                </div>
                <div class="bg-gray-50 border-1 border-gray-400 rounded-lg p-3">
                    <div class="text-xs text-gray-500">Discounted Amount</div>
                    <div class="font-medium text-gray-900">₱{{ selectedProduct.discounted_amount }}
                    </div>
                </div>
                <div class="bg-gray-50 border-1 border-gray-400 rounded-lg p-3">
                    <div class="text-xs text-gray-500">Offer Start Date</div>
                    <div class="font-medium text-gray-900">{{
                        formatDate(selectedProduct.offer_start_date) }}</div>
                </div>
                <div class="bg-gray-50 border-1 border-gray-400 rounded-lg p-3">
                    <div class="text-xs text-gray-500">Offer End Date</div>
                    <div class="font-medium text-gray-900">{{
                        formatDate(selectedProduct.offer_end_date) }}</div>
                </div>
                <div class="bg-gray-50 border-1 border-gray-400 rounded-lg p-3">
                    <div class="text-xs text-gray-500">Sell Count</div>
                    <div class="font-medium text-gray-900">{{ selectedProduct.sell_count }}</div>
                </div>
                <div class="bg-gray-50 border-1 border-gray-400 rounded-lg p-3">
                    <div class="text-xs text-gray-500">Review Count</div>
                    <div class="font-medium text-gray-900">{{ selectedProduct.review_count }}</div>
                </div>
                <div class="bg-gray-50 border-1 border-gray-400 rounded-lg p-3">
                    <div class="text-xs text-gray-500">Created Date</div>
                    <div class="font-medium text-gray-900">{{ formatDate(selectedProduct.created_at)
                    }}</div>
                </div>
                <div class="bg-gray-50 border-1 border-gray-400 rounded-lg p-3">
                    <div class="text-xs text-gray-500">Updated Date</div>
                    <div class="font-medium text-gray-900">{{ formatDate(selectedProduct.updated_at)
                    }}</div>
                </div>
                <div class="bg-gray-50 border-1 border-gray-400 rounded-lg p-3">
                    <div class="text-xs text-gray-500">Has Promo?</div>
                    <div class="font-medium text-gray-900">{{ selectedProduct.has_promo }}</div>
                </div>
            </div>
            <!-- Action Buttons -->
            <div class="flex justify-end space-x-2 mt-6">
                <button class="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm" @click="$emit('update-product', selectedProduct)">
                    <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z">
                        </path>
                        <path fill-rule="evenodd"
                            d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                            clip-rule="evenodd"></path>
                    </svg>
                    Update
                </button>
                <button class="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm" @click="$emit('delete-product', selectedProduct)">
                    <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clip-rule="evenodd" />
                    </svg>
                    Delete
                </button>
            </div>
        </div>
    </div>
</template>