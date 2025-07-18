<script setup>
import ProductAddModal from '~/components/products/ProductAddModal.vue';
import ProductDetailModal from '~/components/products/ProductDetailModal.vue';
import ProductUpdateModal from '~/components/products/ProductUpdateModal.vue';
import ProductHeader from '~/components/products/ProductHeader.vue';
import ProductCards from '~/components/products/ProductCards.vue';
import ProductTitle from '~/components/products/ProductTitle.vue';
import ProductFilter from '~/components/products/ProductFilter.vue';
import ProductTable from '~/components/products/ProductTable.vue';
import ProductDeleteModal from '~/components/products/ProductDeleteModal.vue';

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

// Products fetch with proper error handling and refresh capability
const { data: products, pending: pendingProducts, error, refresh: refreshProducts } = await useFetch(
    () => `${api}/api/products/${queryString.value}`,
    { 
        server: false,
        headers: computed(() => getAuthHeaders()),
        onResponseError({ response }) {
            console.error('Products API Error:', response.status, response._data);
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

// Subcategories fetch with auth headers
const { data: subcategories, pending: pendingSubcategories, refresh: refreshSubcategories } = await useFetch(
    `${api}/api/subcategories/`, 
    { 
        server: false,
        headers: computed(() => getAuthHeaders()),
        onResponseError({ response }) {
            console.error('Subcategories API Error:', response.status, response._data);
        }
    }
);

// Users fetch with auth headers
const { data: users, refresh: refreshUsers } = await useFetch(
    `${api}/api/users/`, 
    { 
        server: false,
        headers: computed(() => getAuthHeaders()),
        onResponseError({ response }) {
            console.error('Users API Error:', response.status, response._data);
        }
    }
);

// Sellers fetch with auth headers
const { data: sellers, refresh: refreshSellers } = await useFetch(
    `${api}/api/sellers/`, 
    { 
        server: false,
        headers: computed(() => getAuthHeaders()),
        onResponseError({ response }) {
            console.error('Sellers API Error:', response.status, response._data);
        }
    }
);

const loading = computed(() => pendingProducts.value || pendingCategories.value || pendingSubcategories.value);

const newProduct = ref({
    seller_id: null,
    product_name: "",
    product_price: null,
    product_brief_description: "",
    product_full_description: "",
    product_sku: "",
    product_status: null,
    product_location: "",
    category_id: null,
    sub_category_id: null,
    quantity: null,
    post_date: null,
    harvest_date: null,
    is_active: true, 
    review_count: null,
    top_rated: false,
    is_discounted: false,
    is_srp: false,
    is_deleted: false,
    sell_count: null,
    offer_start_date: null,
    offer_end_date: null,
    has_promo: false
});

// Reactive variables for filtering
const searchQuery = ref('');
const selectedCategory = ref('');
const selectedSubCategory = ref('');
const selectedPrice = ref('');
const selectedStatus = ref('');

// Modal states
const showAddProductModal = ref(false);
const showProductModal = ref(false);
const showUpdateModal = ref(false);
const showDeleteModal = ref(false);
const showDeleteSelectedModal = ref(false);

// Selected data for modals
const selectedProduct = ref(null);
const selectedProductForDelete = ref(null);
const deleting = ref(false);

// Selection logic
const allSelected = ref(false);

// Pagination
const currentPage = ref(1);
const pageSize = 20;

// Product images
const productImages = ref([]);

// Dropdown state
const openDropdownId = ref(null);

// Selected products
const selectedProducts = computed(() => {
    return products.value?.filter(p => p.selected) || [];
});

// Computed properties
const filteredSubcategories = computed(() => {
    if (!selectedCategory.value) return [];
    return (subcategories.value || []).filter(
        sub => sub.category_id === selectedCategory.value
    );
});

const filteredProducts = computed(() => {
    let list = products.value || [];
    
    if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        list = list.filter(
            p =>
                (p.product_name && p.product_name.toLowerCase().includes(q)) ||
                (p.product_brief_description && p.product_brief_description.toLowerCase().includes(q)) ||
                (p.product_location && p.product_location.toLowerCase().includes(q)) ||
                (p.product_sku && p.product_sku.toLowerCase().includes(q)) ||
                (p.product_status && p.product_status.toLowerCase().includes(q)) ||
                // Date and time search
                (p.post_date && (
                    new Date(p.post_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).toLowerCase().includes(q) ||
                    new Date(p.post_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).toLowerCase().includes(q)
                )) ||
                (p.harvest_date && (
                    new Date(p.harvest_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).toLowerCase().includes(q) ||
                    new Date(p.harvest_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).toLowerCase().includes(q)
                )) ||
                (p.created_at && (
                    new Date(p.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).toLowerCase().includes(q) ||
                    new Date(p.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).toLowerCase().includes(q)
                )) ||
                (p.updated_at && (
                    new Date(p.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).toLowerCase().includes(q) ||
                    new Date(p.updated_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).toLowerCase().includes(q)
                ))
        );
    }
    
    if (selectedCategory.value) {
        list = list.filter(p => p.category_id === selectedCategory.value);
    }
    
    if (selectedSubCategory.value) {
        list = list.filter(p => p.sub_category_id === selectedSubCategory.value);
    }
    
    if (selectedStatus.value && selectedStatus.value !== 'Status') {
        if (selectedStatus.value === 'Active') list = list.filter(p => p.is_active);
        else if (selectedStatus.value === 'Inactive') list = list.filter(p => !p.is_active);
        else if (selectedStatus.value === 'Sale') list = list.filter(p => p.product_status === 'SALE');
        else if (selectedStatus.value === 'Discounted') list = list.filter(p => p.is_discounted);
    }
    
    // Price sorting
    if (selectedPrice.value === 'Low to High') {
        list = [...list].sort((a, b) => a.product_price - b.product_price);
    } else if (selectedPrice.value === 'High to Low') {
        list = [...list].sort((a, b) => b.product_price - a.product_price);
    }
    
    return list;
});

const paginatedProducts = computed(() => {
    const start = (currentPage.value - 1) * pageSize;
    return filteredProducts.value.slice(start, start + pageSize);
});

const total = computed(() => filteredProducts.value.length);
const totalPages = computed(() => Math.ceil(total.value / pageSize));

// Functions
async function toggleProductActive(product) {
    product.is_active = !product.is_active;
    try {
        await $fetch(`${api}/api/products/${product.product_id}/`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: { is_active: product.is_active }
        });
    } catch (error) {
        product.is_active = !product.is_active;
        alert('Failed to update product display status.');
        console.error(error);
    }
}

async function addProduct(imageFiles = []) {
    // Validation logic
    if (
        !newProduct.value.product_name ||
        !newProduct.value.sub_category_id ||
        !newProduct.value.product_price ||
        !newProduct.value.product_status ||
        !newProduct.value.quantity ||
        !newProduct.value.seller_id
    ) {
        alert('Please fill all required fields.');
        return;
    }

    // Set default values
    if (!newProduct.value.product_sku || newProduct.value.product_sku === '') {
        newProduct.value.product_sku = `SKU-${Date.now()}`;
    }
    if (!newProduct.value.product_status || newProduct.value.product_status === '') {
        newProduct.value.product_status = 'FRESH';
    }
    if (typeof newProduct.value.review_count !== 'number' || isNaN(newProduct.value.review_count)) {
        newProduct.value.review_count = 0;
    }
    if (typeof newProduct.value.sell_count !== 'number' || isNaN(newProduct.value.sell_count)) {
        newProduct.value.sell_count = 0;
    }

    // Convert numeric values
    newProduct.value.product_price = parseFloat(newProduct.value.product_price);
    newProduct.value.quantity = parseInt(newProduct.value.quantity);

    try {
        // If we have image files, use FormData
        if (imageFiles && imageFiles.length > 0) {
            const formData = new FormData();
            
            // Add all product data
            for (const key in newProduct.value) {
                if (newProduct.value[key] !== null && newProduct.value[key] !== '') {
                    formData.append(key, newProduct.value[key]);
                }
            }
            
            // Add image files
            imageFiles.forEach(file => {
                formData.append('images', file);
            });

            await $fetch(`${api}/api/products/`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: formData,
            });
        } else {
            // No images, send JSON
            await $fetch(`${api}/api/products/`, {
                method: 'POST',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newProduct.value),
            });
        }

        await refreshAllData();
        closeAddProductModal();
        alert('Product added successfully!');
    } catch (error) {
        alert('Failed to add product.');
        console.error('API error:', error.data || error);
    }
}

// Function name to match modal emit
async function confirmDelete() {
    if (!selectedProductForDelete.value) return;
    
    try {
        deleting.value = true;
        await $fetch(`${api}/api/products/${selectedProductForDelete.value.product_id}/`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        await refreshProducts();
        closeDeleteModals();
        alert('Item deleted successfully!');
    } catch (error) {
        alert('Failed to delete product.');
        console.error(error);
    } finally {
        deleting.value = false;
    }
}

// Function name to match modal emit
async function confirmDeleteSelected() {
    const selected = selectedProducts.value;
    if (!selected.length) return;
    
    try {
        deleting.value = true;
        await Promise.all(
            selected.map(product =>
                $fetch(`${api}/api/products/${product.product_id}/`, { 
                    method: 'DELETE',
                    headers: getAuthHeaders()
                })
            )
        );
        await refreshProducts();
        allSelected.value = false;
        closeDeleteModals();
        alert('Selected items deleted successfully!');
    } catch (error) {
        alert('Failed to delete selected products.');
        console.error(error);
    } finally {
        deleting.value = false;
    }
}

async function refreshAllData() {
    try {
        await Promise.all([
            refreshProducts(),
            refreshCategories(),
            refreshSubcategories(),
            refreshUsers(),
            refreshSellers()
        ]);
    } catch (error) {
        console.error('Error refreshing data:', error);
    }
}

// Modal functions
function openAddProductModal() {
    showAddProductModal.value = true;
}

function closeAddProductModal() {
    showAddProductModal.value = false;
    // Reset newProduct to original defaults
    newProduct.value = {
        seller_id: null,
        product_name: "",
        product_price: null,
        product_brief_description: "",
        product_full_description: "",
        product_sku: "",
        product_status: null,
        product_location: "",
        category_id: null,
        sub_category_id: null,
        quantity: null,
        post_date: null,
        harvest_date: null,
        is_active: true,
        review_count: 0,
        top_rated: false,
        is_discounted: false,
        is_srp: false,
        is_deleted: false,
        sell_count: 0,
        offer_start_date: null,
        offer_end_date: null,
        has_promo: false
    };
    productImages.value = [];
}

function openProductModal(product) {
    selectedProduct.value = product;
    showProductModal.value = true;
}

function closeProductModal() {
    showProductModal.value = false;
    selectedProduct.value = null;
}

function openUpdateModal(product) {
    selectedProduct.value = product;
    showUpdateModal.value = true;
}

function closeUpdateModal() {
    showUpdateModal.value = false;
    showProductModal.value = false;
    selectedProduct.value = null;
}

function openDeleteModal(product) {
    selectedProductForDelete.value = product;
    showDeleteModal.value = true;
}

function closeDeleteModals() {
    showDeleteModal.value = false;
    showDeleteSelectedModal.value = false;
    selectedProductForDelete.value = null;
    clearAllSelections();
}

function closeDeleteSelectedModal() {
    showDeleteSelectedModal.value = false;
    if (products.value) {
        products.value.forEach(p => p.selected = false);
    }
    allSelected.value = false;
}

// Product table event handlers
function handleViewProduct(product) {
    openProductModal(product);
}

function handleUpdateProduct(product) {
    openUpdateModal(product);
}

function handleDeleteProduct(product) {
    openDeleteModal(product);
}

// Function for filter component
function handleDeleteSelectedFromFilter() {
    showDeleteSelectedModal.value = true;
}

// Selection functions
function toggleAllSelection() {
    if (paginatedProducts.value) {
        const shouldSelect = !allSelected.value;
        paginatedProducts.value.forEach(product => {
            product.selected = shouldSelect;
        });
        allSelected.value = shouldSelect;
    }
}

// Handle page changes
function handlePageChange(page) {
    goToPage(page);
}

// Pagination
function goToPage(page) {
    if (page < 1 || page > totalPages.value) return;
    currentPage.value = page;
}

// Filter handler
function applyFilter(filterData) {
    searchQuery.value = filterData.search || '';
    selectedCategory.value = filterData.category || '';
    selectedSubCategory.value = filterData.subcategory || '';
    selectedPrice.value = filterData.price || '';
    selectedStatus.value = filterData.status || '';
    currentPage.value = 1; // Reset to first page when filtering
}

// Dropdown functions
function toggleDropdown(productId) {
    openDropdownId.value = openDropdownId.value === productId ? null : productId;
}

function closeDropdown() {
    openDropdownId.value = null;
}

function clearAllSelections() {
    if (products.value) {
        products.value.forEach(product => {
            product.selected = false;
        });
    }
    allSelected.value = false;
}

// Utility functions
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

function toggleProductStatus(product) {
    product.product_status = product.product_status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
}

// Watchers
watch(products, (newProducts) => {
    if (newProducts) {
        newProducts.forEach(product => {
            if (product.selected === undefined) product.selected = false;
        });
    }
}, { immediate: true });

// AllSelected based on current page selections
watch(
    () => paginatedProducts.value && paginatedProducts.value.map(p => p.selected),
    (selections) => {
        if (paginatedProducts.value && paginatedProducts.value.length) {
            allSelected.value = paginatedProducts.value.every(p => p.selected);
        }
    },
    { deep: true }
);

watch(selectedCategory, () => {
    selectedSubCategory.value = '';
});

watch(() => useCookie('auth-access-token').value, async (newToken) => {
    if (newToken) {
        await refreshAllData();
    }
});

// Lifecycle hooks
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
        title="All Products"
        subtitle="Manage your product inventory and listings"
        :show-add-button="true"
        @add-product="openAddProductModal"
    />
    
    <ProductCards :products="products" />

    <ProductTitle 
        :products="filteredProducts"
        title="All Products"
        :show-add-button="true"
        @add-product="openAddProductModal"
    />

    <!-- Add Product Modal -->
    <ProductAddModal 
        :show-add-product-modal="showAddProductModal" 
        :new-product="newProduct" 
        :sellers="sellers" 
        :users="users" 
        :categories="categories" 
        :subcategories="subcategories" 
        @close-add-product-modal="closeAddProductModal" 
        @add-product="addProduct" 
        @update:productImages="val => productImages = val"
    />
    
    <!-- Product Filter -->
    <ProductFilter 
        :categories="categories"
        :subcategories="subcategories"
        :products="products"
        @filter="applyFilter"
        @delete-selected="handleDeleteSelectedFromFilter"
    />

    <!-- Product Table Component -->
    <ProductTable
        :products="paginatedProducts"
        :categories="categories"
        :sellers="sellers"
        :all-selected="allSelected"
        @view-product="handleViewProduct"
        @update-product="handleUpdateProduct"
        @delete-product="handleDeleteProduct"
        @toggle-product-active="toggleProductActive"
        @toggle-selection="(product) => product.selected = !product.selected"
        @toggle-all-selection="toggleAllSelection"
    />
                        
    <!-- Update Modal-->
    <ProductUpdateModal
        :show-update-modal="showUpdateModal"
        :product-to-update="selectedProduct"
        :categories="categories"
        :subcategories="subcategories"
        @close-update-modal="closeUpdateModal"
        @updated="refreshProducts"
    />
    
    <!-- Product Detail Modal -->
    <ProductDetailModal
        :selectedProduct="selectedProduct"
        :categories="categories"
        :subcategories="subcategories"
        :sellers="sellers"
        :showProductModal="showProductModal"
        @closeProductModal="closeProductModal"
        @update-product="handleUpdateProduct"
        @delete-product="handleDeleteProduct"
    />
    
    <!-- Product Delete Modal -->
    <ProductDeleteModal
        :show-single-delete="showDeleteModal"
        :show-multiple-delete="showDeleteSelectedModal"
        :single-product="selectedProductForDelete"
        :selected-products="selectedProducts"
        :deleting="deleting"
        @close="closeDeleteModals"
        @confirm-single="confirmDelete"
        @confirm-multiple="confirmDeleteSelected"
        @clear-selections="clearAllSelections"
    />

    <!-- Pagination component -->
    <Pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :total="total"
        :page-size="pageSize"
        @page-changed="handlePageChange"
    />
</template>