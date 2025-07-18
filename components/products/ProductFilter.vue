<script setup>
// filepath: c:\Users\ejfay\FreshBytes\freshbytes-admin\components\products\ProductFilter.vue
// Define props
const props = defineProps({
    categories: {
        type: Array,
        default: () => []
    },
    subcategories: {
        type: Array,
        default: () => []
    },
    products: {
        type: Array,
        default: () => []
    }
});

// Define emits
const emit = defineEmits(['filter', 'delete-selected']);

// Reactive filter data
const searchQuery = ref('');
const selectedCategory = ref('');
const selectedSubCategory = ref('');
const selectedPrice = ref('');
const selectedStatus = ref('');

// Computed properties
const filteredSubcategories = computed(() => {
    if (!selectedCategory.value || !props.subcategories) return [];
    return props.subcategories.filter(sub => sub.category_id === selectedCategory.value);
});

const hasSelectedProducts = computed(() => {
    return props.products?.some(p => p.selected) || false;
});

const selectedProductsCount = computed(() => {
    return props.products?.filter(p => p.selected).length || 0;
});

const allProductsSelected = computed(() => {
    return props.products && props.products.length > 0 && props.products.every(p => p.selected);
});

// Methods
function clearFilters() {
    searchQuery.value = '';
    selectedCategory.value = '';
    selectedSubCategory.value = '';
    selectedPrice.value = '';
    selectedStatus.value = '';
    
    // Emit filter event with empty values
    emitFilterEvent();
}

function emitFilterEvent() {
    emit('filter', {
        search: searchQuery.value,
        category: selectedCategory.value,
        subcategory: selectedSubCategory.value,
        price: selectedPrice.value,
        status: selectedStatus.value
    });
}

function handleDeleteSelected() {
    emit('delete-selected');
}

// Watch for changes and emit filter events
watch([searchQuery, selectedCategory, selectedSubCategory, selectedPrice, selectedStatus], () => {
    emitFilterEvent();
});

// Reset subcategory when category changes
watch(selectedCategory, () => {
    selectedSubCategory.value = '';
});
</script>

<template>
    <!-- Filter Section -->
    <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div class="flex gap-2 flex-wrap">
            <!-- Search Input -->
            <input
                type="text"
                v-model="searchQuery"
                placeholder="Search products..."
                class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            
            <!-- Category Select -->
            <select
                v-model="selectedCategory"
                class="px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
            >
                <option value="">All Categories</option>
                <option v-for="cat in categories" :key="cat.category_id" :value="cat.category_id">
                    {{ cat.category_name }}
                </option>
            </select>
            
            <!-- Subcategory Select -->
            <select
                v-model="selectedSubCategory"
                class="px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
                :disabled="!selectedCategory"
            >
                <option value="">All Sub-Categories</option>
                <option
                    v-for="sub in filteredSubcategories"
                    :key="sub.sub_category_id"
                    :value="sub.sub_category_id"
                >
                    {{ sub.sub_category_name }}
                </option>
            </select>
            
            <!-- Price Sort Select -->
            <select
                v-model="selectedPrice"
                class="px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
            >
                <option value="">Sort by Price</option>
                <option value="Low to High">Low to High</option>
                <option value="High to Low">High to Low</option>
            </select>
            
            <!-- Status Select -->
            <select
                v-model="selectedStatus"
                class="px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
            >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Sale">Sale</option>
                <option value="Discounted">Discounted</option>
            </select>
            
            <!-- Clear Button -->
            <button
                type="button"
                class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                @click="clearFilters"
            >
                Clear Filters
            </button>
        </div>
        
        <!-- Delete Selected Button -->
        <div class="flex items-center space-x-2 mt-2">
            <button
                type="button"
                class="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="!hasSelectedProducts"
                @click="handleDeleteSelected"
            >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                <span v-if="allProductsSelected">
                    Delete All Items
                </span>
                <span v-else>
                    Delete {{ selectedProductsCount }} Item{{ selectedProductsCount !== 1 ? 's' : '' }}
                </span>
            </button>
        </div>
    </div>
</template>