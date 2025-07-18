<script setup>
import ProductHeader from '~/components/products/ProductHeader.vue';
import ProductCards from '~/components/products/ProductCards.vue';

definePageMeta({
    layout: "home",
});

const config = useRuntimeConfig();
const api = config.public.API_LINK;

const accessToken = ref('');
const queryString = ref('');

// Function to get auth headers
const getAuthHeaders = () => {
    const accessTokenCookie = useCookie('auth-access-token');
    const token = accessTokenCookie.value || accessToken.value;
    
    return token ? {
        Authorization: `Bearer ${token}`
    } : {};
};

// Fetch deleted products
const { data: deletedProducts, pending: pendingProducts, error, refresh: refreshProducts } = await useFetch(
    () => `${api}/api/products/deleted/`,
    { 
        server: false,
        headers: computed(() => getAuthHeaders()),
        onResponseError({ response }) {
            console.error('Deleted Products API Error:', response.status, response._data);
            if (response.status === 401) {
                navigateTo('/login');
            }
        }
    }
);

// Categories fetch with auth headers
const { data: categories, pending: pendingCategories, refresh: refreshCategories } = await useFetch(
    `${api}/api/categories/`, 
    { 
        server: false,
        headers: computed(() => getAuthHeaders()),
        onResponseError({ response }) {
            console.error('Categories API Error:', response.status, response._data);
        }
    }
);

const loading = computed(() => pendingProducts.value || pendingCategories.value);

// Dropdown state management
const openDropdownId = ref(null);

function toggleDropdown(productId) {
    openDropdownId.value = openDropdownId.value === productId ? null : productId;
}

function closeDropdown() {
    openDropdownId.value = null;
}

// Restore product function
async function restoreProduct(product) {
    try {
        await $fetch(`${api}/api/products/${product.product_id}/restore/`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: { is_deleted: false }
        });
        await refreshProducts();
        alert('Product restored successfully!');
    } catch (error) {
        alert('Failed to restore product.');
        console.error(error);
    }
}

// Permanently delete product function
async function permanentlyDeleteProduct(product) {
    if (!confirm(`Are you sure you want to permanently delete "${product.product_name}"? This action cannot be undone.`)) {
        return;
    }
    
    try {
        await $fetch(`${api}/api/products/${product.product_id}/permanent-delete/`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        await refreshProducts();
        alert('Product permanently deleted!');
    } catch (error) {
        alert('Failed to permanently delete product.');
        console.error(error);
    }
}

// Search and filter functionality
const searchQuery = ref('');
const selectedCategory = ref('');

const filteredProducts = computed(() => {
    let list = deletedProducts.value || [];
    
    if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        list = list.filter(p =>
            (p.product_name && p.product_name.toLowerCase().includes(q)) ||
            (p.product_brief_description && p.product_brief_description.toLowerCase().includes(q)) ||
            (p.product_sku && p.product_sku.toLowerCase().includes(q))
        );
    }
    
    if (selectedCategory.value) {
        list = list.filter(p => p.category_id === selectedCategory.value);
    }
    
    return list;
});

// Pagination
const currentPage = ref(1);
const pageSize = 20;

const paginatedProducts = computed(() => {
    const start = (currentPage.value - 1) * pageSize;
    return filteredProducts.value.slice(start, start + pageSize);
});

const total = computed(() => filteredProducts.value.length);
const totalPages = computed(() => Math.ceil(total.value / pageSize));

function goToPage(page) {
    if (page < 1 || page > totalPages.value) return;
    currentPage.value = page;
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    if (isNaN(date)) return dateStr;
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Click outside listener
onMounted(() => {
    document.addEventListener('click', closeDropdown);
});

onUnmounted(() => {
    document.removeEventListener('click', closeDropdown);
});
</script>

<template>
    <Loading :loading="loading" />

    <ProductHeader 
        title="Deleted Products"
        subtitle="Manage deleted products - restore or permanently delete"
        :show-add-button="false"
    />
    
    <!-- Stats for deleted products -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
                <div class="p-2 bg-red-100 rounded-lg">
                    <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600">Total Deleted</p>
                    <p class="text-2xl font-semibold text-gray-900">{{ deletedProducts?.length || 0 }}</p>
                </div>
            </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
                <div class="p-2 bg-yellow-100 rounded-lg">
                    <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600">Awaiting Action</p>
                    <p class="text-2xl font-semibold text-gray-900">{{ filteredProducts?.length || 0 }}</p>
                </div>
            </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
                <div class="p-2 bg-green-100 rounded-lg">
                    <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600">Can Restore</p>
                    <p class="text-2xl font-semibold text-gray-900">{{ deletedProducts?.length || 0 }}</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Filters Section -->
    <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div class="flex gap-2 flex-wrap">
            <input
                type="text"
                v-model="searchQuery"
                placeholder="Search deleted products"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <select
                v-model="selectedCategory"
                class="px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none"
            >
                <option value="">All Categories</option>
                <option v-for="cat in categories" :key="cat.category_id" :value="cat.category_id">
                    {{ cat.category_name }}
                </option>
            </select>
            <button
                class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                @click="searchQuery = ''; selectedCategory = ''"
            >
                Clear
            </button>
        </div>
    </div>

    <!-- Deleted Products Table -->
    <div class="flex flex-col">
        <div class="overflow-x-auto">
            <div class="inline-block min-w-full align-middle">
                <div class="overflow-hidden shadow">
                    <table v-if="paginatedProducts.length > 0" class="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-600">
                        <thead class="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th scope="col" class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                    Product ID
                                </th>
                                <th scope="col" class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                    Product Name
                                </th>
                                <th scope="col" class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                    Category
                                </th>
                                <th scope="col" class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                    Price
                                </th>
                                <th scope="col" class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                    Deleted Date
                                </th>
                                <th scope="col" class="p-4 text-xs font-medium text-center text-gray-500 uppercase dark:text-gray-400">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                            <tr v-for="product in paginatedProducts" :key="product.product_id" 
                                class="hover:bg-gray-100 dark:hover:bg-gray-700">
                                
                                <td class="p-4 text-sm font-semibold text-gray-900 whitespace-nowrap dark:text-white">
                                    {{ product.product_id }}
                                </td>
                                <td class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    {{ product.product_name }}
                                </td>
                                <td class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    {{ categories?.find(cat => cat.category_id === product.category_id)?.category_name || 'N/A' }}
                                </td>
                                <td class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    ₱{{ product.product_price }}
                                </td>
                                <td class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    {{ formatDate(product.updated_at) }}
                                </td>
                                
                                <!-- Actions Column with Ellipsis Dropdown -->
                                <td class="p-4 space-x-2 whitespace-nowrap" @click.stop>
                                    <div class="flex justify-center items-center">
                                        <div class="relative inline-block text-left">
                                            <!-- Ellipsis button -->
                                            <button 
                                                type="button" 
                                                @click.stop="toggleDropdown(product.product_id)"
                                                class="inline-flex items-center justify-center w-8 h-8 text-gray-400 bg-transparent border-0 rounded-lg hover:text-gray-900 hover:bg-gray-100 focus:ring-4 focus:ring-gray-300"
                                                :id="`dropdown-button-${product.product_id}`"
                                                aria-expanded="false"
                                                aria-haspopup="true">
                                                <span class="sr-only">Open dropdown</span>
                                                <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 3">
                                                    <path d="M2 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm6.041 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM14 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z"/>
                                                </svg>
                                            </button>
                                            
                                            <!-- Dropdown menu -->
                                            <div 
                                                v-show="openDropdownId === product.product_id"
                                                :id="`dropdown-${product.product_id}`"
                                                class="absolute right-0 z-10 mt-2 w-44 bg-white divide-y divide-gray-100 rounded-lg shadow-lg border border-gray-200 dark:bg-gray-700 dark:border-gray-600"
                                                role="menu"
                                                :aria-labelledby="`dropdown-button-${product.product_id}`">
                                                <ul class="py-2 text-sm text-gray-700 dark:text-gray-200" role="none">
                                                    <!-- Restore option -->
                                                    <li role="none">
                                                        <button 
                                                            type="button"
                                                            @click.stop="restoreProduct(product)"
                                                            class="flex items-center w-full px-4 py-2 text-left text-green-600 hover:bg-green-50 focus:bg-green-50 dark:hover:bg-gray-600"
                                                            role="menuitem">
                                                            <svg class="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
                                                            </svg>
                                                            Restore
                                                        </button>
                                                    </li>
                                                    
                                                    <!-- Permanently Delete option -->
                                                    <li role="none">
                                                        <button 
                                                            type="button"
                                                            @click.stop="permanentlyDeleteProduct(product)"
                                                            class="flex items-center w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 focus:bg-red-50 dark:hover:bg-gray-600"
                                                            role="menuitem">
                                                            <svg class="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                                                            </svg>
                                                            Permanently Delete
                                                        </button>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- Empty State for No Deleted Products -->
                    <div v-else class="flex flex-col items-center justify-center py-16 px-6">
                        <div class="flex items-center justify-center w-16 h-16 mb-6 bg-gray-100 rounded-full">
                            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-900 mb-2">No deleted products found</h3>
                        <p class="text-gray-500 text-center mb-6 max-w-sm">
                            <span v-if="searchQuery || selectedCategory">
                                No deleted products match your current search criteria.
                            </span>
                            <span v-else>
                                No products have been deleted yet.
                            </span>
                        </p>
                        <button
                            v-if="searchQuery || selectedCategory"
                            @click="searchQuery = ''; selectedCategory = ''"
                            class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 focus:z-10 focus:ring-2 focus:ring-gray-300 transition-colors duration-200">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                            Clear Filters
                        </button>
                    </div>

                    <!-- Pagination -->
                    <div v-if="paginatedProducts.length > 0" class="flex items-center justify-between p-4 border-t border-gray-200">
                        <div class="text-sm text-gray-600">
                            Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, total) }} of {{ total }} results
                        </div>
                        <div class="flex items-center space-x-2">
                            <button
                                @click="goToPage(currentPage - 1)"
                                :disabled="currentPage === 1"
                                class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                                Previous
                            </button>
                            <span class="px-3 py-2 text-sm font-medium text-gray-700">
                                Page {{ currentPage }} of {{ totalPages }}
                            </span>
                            <button
                                @click="goToPage(currentPage + 1)"
                                :disabled="currentPage === totalPages"
                                class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>