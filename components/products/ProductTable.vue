<script setup>

// Define props
const props = defineProps({
    products: {
        type: Array,
        default: () => []
    },
    categories: {
        type: Array,
        default: () => []
    },
    sellers: {
        type: Array,
        default: () => []
    },
    users: {
        type: Array,
        default: () => []
    },
    allSelected: {
        type: Boolean,
        default: false
    }
});

// Define emits
const emit = defineEmits([
    'view-product',
    'update-product', 
    'delete-product',
    'toggle-product-active',
    'toggle-selection',
    'toggle-all-selection'
]);

// Dropdown state
const openDropdownId = ref(null);
const dropdownStyle = ref({});

// Helper functions
function getCategoryName(categoryId) {
    if (!props.categories || !categoryId) return 'N/A';
    const category = props.categories.find(cat => cat.category_id === categoryId);
    return category ? category.category_name : 'N/A';
}

function getSellerName(sellerId) {
    if (!props.sellers || !props.users || !sellerId) return 'N/A';
    
    // First, find the seller by seller_id
    const seller = props.sellers.find(sel => sel.seller_id === sellerId);
    if (!seller || !seller.user_id) return 'N/A';
    
    // Then, find the user by user_id to get the user_name
    const user = props.users.find(u => u.user_id === seller.user_id);
    return user ? user.user_name : 'N/A';
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    if (isNaN(date)) return dateStr;
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function toggleDropdown(productId) {
    if (openDropdownId.value === productId) {
        openDropdownId.value = null;
        return;
    }
    
    openDropdownId.value = productId;
    
    // Calculate dropdown position
    nextTick(() => {
        const button = document.getElementById(`dropdown-button-${productId}`);
        if (button) {
            const rect = button.getBoundingClientRect();
            dropdownStyle.value = {
                top: `${rect.bottom + window.scrollY + 8}px`,
                left: `${rect.right + window.scrollX - 176}px` // 176px = w-44 (11rem = 176px)
            };
        }
    });
}

function closeDropdown() {
    openDropdownId.value = null;
}

// Action handlers
function handleUpdate(product) {
    closeDropdown();
    emit('update-product', product);
}

function handleDelete(product) {
    closeDropdown();
    emit('delete-product', product);
}

// Lifecycle hooks
onMounted(() => {
    document.addEventListener('click', closeDropdown);
    window.addEventListener('scroll', closeDropdown);
    window.addEventListener('resize', closeDropdown);
});

onUnmounted(() => {
    document.removeEventListener('click', closeDropdown);
    window.removeEventListener('scroll', closeDropdown);
    window.removeEventListener('resize', closeDropdown);
});
</script>

<template>
    <div class="flex flex-col">
        <div class="overflow-x-auto">
            <div class="inline-block min-w-full align-middle">
                <!-- Remove overflow-hidden to allow dropdown to show -->
                <div class="shadow">
                    <table v-if="products.length > 0" class="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-600">
                        <thead class="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <!-- Checkbox Column -->
                                <th scope="col" class="p-4">
                                    <div class="flex items-center">
                                        <input 
                                            :id="`checkbox-all`" 
                                            type="checkbox"
                                            :checked="allSelected"
                                            @change="$emit('toggle-all-selection')"
                                            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                                        <label :for="`checkbox-all`" class="sr-only">Select all</label>
                                    </div>
                                </th>
                                <th scope="col" class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                    Product Image
                                </th>
                                <th scope="col" class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                    Product Name
                                </th>
                                <th scope="col" class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                    Seller Name
                                </th>
                                <th scope="col" class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                    Category
                                </th>
                                <th scope="col" class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                    Price
                                </th>
                                <th scope="col" class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                    Stock
                                </th>
                                <th scope="col" class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                    Status
                                </th>
                                <th scope="col" class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                    Display Status
                                </th>
                                <th scope="col" class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                    Created Date
                                </th>
                                <th scope="col" class="p-4 text-xs font-medium text-center text-gray-500 uppercase dark:text-gray-400">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                            <tr v-for="product in products" :key="product.product_id" 
                                class="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" 
                                @click="$emit('view-product', product)">
                                
                                <!-- Checkbox Column -->
                                <td class="p-4" @click.stop>
                                    <div class="flex items-center">
                                        <input 
                                            :id="`checkbox-table-${product.product_id}`" 
                                            type="checkbox"
                                            :checked="product.selected"
                                            @change="$emit('toggle-selection', product)"
                                            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                                        <label :for="`checkbox-table-${product.product_id}`" class="sr-only">Select product</label>
                                    </div>
                                </td>
                                
                                <!-- Product Image -->
                                <td class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    <img v-if="product.product_image_url" 
                                         :src="product.product_image_url" 
                                         :alt="product.product_name"
                                         class="w-12 h-12 rounded-lg object-cover" />
                                    <div v-else 
                                         class="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                        <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                        </svg>
                                    </div>
                                </td>
                                
                                <!-- Product Name -->
                                <td class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    <div class="max-w-xs">
                                        <div class="font-semibold">{{ product.product_name }}</div>
                                        <div v-if="product.product_brief_description" class="text-sm text-gray-500 truncate">
                                            {{ product.product_brief_description }}
                                        </div>
                                    </div>
                                </td>
                                
                                <!-- Seller Name -->
                                <td class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    <span class="bg-purple-100 text-purple-800 text-sm font-medium px-2.5 py-0.5 rounded dark:bg-purple-900 dark:text-purple-300">
                                        {{ getSellerName(product.seller_id) }}
                                    </span>
                                </td>
                                
                                <!-- Category -->
                                <td class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    <span>{{ getCategoryName(product.category_id) }}</span>
                                </td>
                                
                                <!-- Price -->
                                <td class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    <span class="font-bold text-green-600">₱{{ Number(product.product_price).toFixed(2) }}</span>
                                </td>
                                
                                <!-- Stock -->
                                <td class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    <span :class="[
                                        'px-2.5 py-0.5 text-xs font-medium rounded',
                                        (product.quantity || product.product_stock) > 10 
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                            : (product.quantity || product.product_stock) > 0
                                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                    ]">
                                        {{ product.quantity || product.product_stock || 0 }} units
                                    </span>
                                </td>
                                
                                <!-- Status (Fresh/Slightly Withered/Rotten) -->
                                <td class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    <span :class="[
                                        'px-2.5 py-0.5 text-xs font-medium rounded',
                                        product.product_status === 'FRESH' 
                                            ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
                                            : product.product_status === 'SLIGHTLY_WITHERED'
                                            ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300'
                                            : product.product_status === 'ROTTEN'
                                            ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'
                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                                    ]">
                                        {{ product.product_status || 'N/A' }}
                                    </span>
                                </td>
                                
                                <!-- Display Status Toggle -->
                                <td class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white" @click.stop>
                                    <label class="inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            :checked="product.is_active"
                                            @change="$emit('toggle-product-active', product)"
                                            class="sr-only peer">
                                        <div :class="[
                                            'relative w-11 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800',
                                            'peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white',
                                            'after:content-[\'\'] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600',
                                            product.is_active 
                                                ? 'bg-green-600' 
                                                : 'bg-gray-300 dark:bg-gray-600'
                                        ]"></div>
                                        <span :class="[
                                            'ms-3 text-sm font-medium',
                                            product.is_active 
                                                ? 'text-green-600 dark:text-green-400' 
                                                : 'text-red-600 dark:text-red-400'
                                        ]">
                                            {{ product.is_active ? 'Active' : 'Inactive' }}
                                        </span>
                                    </label>
                                </td>
                                
                                <!-- Created Date -->
                                <td class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    {{ formatDate(product.created_at) }}
                                </td>
                                
                                <!-- Actions Column with Ellipsis Dropdown -->
                                <td class="p-4 space-x-2 whitespace-nowrap" @click.stop>
                                    <div class="flex justify-center items-center">
                                        <!-- Add position static to container and relative to dropdown parent -->
                                        <div class="relative">
                                            <!-- Ellipsis button -->
                                            <button 
                                                type="button" 
                                                @click.stop="toggleDropdown(product.product_id)"
                                                class="inline-flex items-center justify-center w-8 h-8 text-gray-400 bg-transparent border-0 rounded-lg hover:text-gray-900 hover:bg-gray-100 focus:ring-4 focus:ring-gray-300 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600"
                                                :id="`dropdown-button-${product.product_id}`"
                                                aria-expanded="false"
                                                aria-haspopup="true">
                                                <span class="sr-only">Open dropdown</span>
                                                <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 3">
                                                    <path d="M2 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm6.041 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM14 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z"/>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <!-- Dropdown menu positioned with Teleport to body to avoid z-index issues -->
                                    <Teleport to="body">
                                        <div 
                                            v-show="openDropdownId === product.product_id"
                                            :id="`dropdown-${product.product_id}`"
                                            :style="dropdownStyle"
                                            class="fixed w-44 bg-white divide-y divide-gray-100 rounded-lg shadow-lg border border-gray-200 dark:bg-gray-700 dark:border-gray-600"
                                            style="z-index: 99999;"
                                            role="menu"
                                            :aria-labelledby="`dropdown-button-${product.product_id}`">
                                            <ul class="py-2 text-sm text-gray-700 dark:text-gray-200" role="none">
                                                <!-- Update option -->
                                                <li role="none">
                                                    <button 
                                                        type="button"
                                                        @click.stop="handleUpdate(product)"
                                                        class="flex items-center w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 dark:hover:bg-gray-600 dark:focus:bg-gray-600"
                                                        role="menuitem">
                                                        <svg class="w-4 h-4 mr-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path>
                                                            <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd"></path>
                                                        </svg>
                                                        Update
                                                    </button>
                                                </li>
                                                
                                                <!-- Delete option -->
                                                <li role="none">
                                                    <button 
                                                        type="button"
                                                        @click.stop="handleDelete(product)"
                                                        class="flex items-center w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 focus:bg-red-50 dark:hover:bg-gray-600"
                                                        role="menuitem">
                                                        <svg class="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                                                        </svg>
                                                        Delete
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                    </Teleport>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- Empty State - No Products Found -->
                    <div v-else class="flex flex-col items-center justify-center py-16 px-6">
                        <div class="flex items-center justify-center w-16 h-16 mb-6 bg-gray-100 rounded-full dark:bg-gray-700">
                            <svg class="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No products found</h3>
                        <p class="text-gray-500 dark:text-gray-400 text-center mb-6 max-w-sm">
                            No products match your current search and filter criteria.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>