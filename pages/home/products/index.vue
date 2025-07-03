<script setup>
    definePageMeta({
        layout: "home",
    });

    const config = useRuntimeConfig();
    const api = config.public.API_LINK; // API HERE
    const { data: products, pending: pendingProducts } = useFetch(`${api}api/products/`, { server: false });
    const { data: categories, pending: pendingCategories } = useFetch(`${api}api/categories/`, { server: false });
    const { data: subcategories, pending: pendingSubcategories } = useFetch(`${api}api/subcategories/`, { server: false });

    const loading = computed(() => pendingProducts.value || pendingCategories.value || pendingSubcategories.value);



    const newProduct = ref({
        seller_id: null,
        product_name: "",
        product_price: null,
        product_brief_description: "",
        product_full_description: "",
        product_discountedPrice: null,
        product_sku: "",
        product_status: null,
        product_location: "",
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

    async function toggleProductActive(product) {
    product.is_active = !product.is_active;
    try {
        await $fetch(`${api}api/products/${product.product_id}/`, {
        method: 'PATCH',
        body: { is_active: product.is_active }
        });
        // Optionally, show a success message here
    } catch (error) {
        // If the API fails, revert the change
        product.is_active = !product.is_active;
        alert('Failed to update product display status.');
        console.error(error);
    }
    }

    const { data: users } = useFetch(`${api}api/users/`, { server: false });
    const { data: sellers } = useFetch(`${api}api/sellers/`, { server: false });


    async function addProduct() {
    // Validate required fields
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

    // Ensure required backend fields are set and valid
    if (!newProduct.value.product_sku || newProduct.value.product_sku === '') {
        newProduct.value.product_sku = `SKU-${Date.now()}`;
    }
    if (!newProduct.value.product_status || newProduct.value.product_status === '') {
        newProduct.value.product_status = 'FRESH'; // or your default status
    }
    if (typeof newProduct.value.review_count !== 'number' || isNaN(newProduct.value.review_count)) {
        newProduct.value.review_count = 0;
    }
    if (typeof newProduct.value.sell_count !== 'number' || isNaN(newProduct.value.sell_count)) {
        newProduct.value.sell_count = 0;
    }

          // Build FormData
    const formData = new FormData();
    for (const key in newProduct.value) {
        formData.append(key, newProduct.value[key]);
    }
    // Add images
    productImages.value.forEach(file => {
        formData.append('images', file);
    });

    try {
        await $fetch(`${api}api/products/`, {
        method: 'POST',
        body: formData,
        });
        await refreshNuxtData();
        closeAddProductModal();
    } catch (error) {
        alert('Failed to add product.');
        console.error('API error:', error.data || error);
    }
    }

    console.log(newProduct.value);

    async function deleteSingleProduct() {
    if (!productToDelete.value) return;
    try {
        await $fetch(`${api}api/products/${productToDelete.value.product_id}/`, {
        method: 'DELETE'
        });
        // Remove from local list
        if (products.value) {
        products.value = products.value.filter(p => p.product_id !== productToDelete.value.product_id);
        }
        closeDeleteModal();
        alert('Item deleted successfully!');
    } catch (error) {
        alert('Failed to delete product.');
        console.error(error);
    }
    }

    async function deleteSelectedProducts() {
    const selected = products.value.filter(p => p.selected);
    if (!selected.length) return;
    try {
        // Delete each selected product in the backend
        await Promise.all(
          selected.map(product =>
            $fetch(`${api}api/products/${product.product_id}/`, { method: 'DELETE' })
          )
        );
        // Remove from local list
        products.value = products.value.filter(p => !p.selected);
        allSelected.value = false;
        showDeleteSelectedModal.value = false;
        alert('Selected items deleted successfully!');
    } catch (error) {
        alert('Failed to delete selected products.');
        console.error(error);
    }
    }

    function handleDelete() {

        alert("Item deleted!");
        document.getElementById('deleteModal').classList.add('hidden');
    }

    function closeDeleteSelectedModal() {
        showDeleteSelectedModal.value = false;
        // Deselect all products
        if (products.value) {
            products.value.forEach(p => p.selected = false);
        }
        allSelected.value = false;
    }

    import { ref, computed, watch } from 'vue';

    // Reactive variables
    const searchQuery = ref('');
    const selectedCategory = ref('');
    const selectedSubCategory = ref('');
    const selectedPrice = ref('');
    const selectedStatus = ref('');

    const filteredSubcategories = computed(() => {
    if (!selectedCategory.value) return [];
    return (subcategories.value || []).filter(
        sub => sub.category_id === selectedCategory.value
    );
    });

    /// Filter subcategories based on selected category
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

    // Reset subcategory when category changes
    watch(selectedCategory, () => {
    selectedSubCategory.value = '';
    });

    const showAddProductModal = ref(false);
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
            product_discountedPrice: null,
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
        // Clear product images and previews
        productImages.value = [];
        // If you have a preview ref in the modal, emit an event to clear it as well
    }

    const showProductModal = ref(false);
    const selectedProduct = ref(null);

    function openProductModal(product) {
        selectedProduct.value = product;
        showProductModal.value = true;
    }
    function closeProductModal() {
        showProductModal.value = false;
        selectedProduct.value = null;
    }

    const showUpdateModal = ref(false);

    console.log("showUpdateModal", showUpdateModal.value);
    function openUpdateModal(product) {
        selectedProduct.value = product;
        showUpdateModal.value = true;
    }
    
    async function refreshProducts() {
    // If you use useFetch, you can use refreshNuxtData to re-fetch products
    await refreshNuxtData();
    }

    function closeUpdateModal() {
        showUpdateModal.value = false;
        showProductModal.value = false;
        selectedProduct.value = null;
    }

    const showDeleteModal = ref(false);
    const showDeleteSelectedModal = ref(false);
    const productToDelete = ref(null);

    function openDeleteModal(product) {
        productToDelete.value = product;
        showDeleteModal.value = true;
    }
    function closeDeleteModal() {
        showDeleteModal.value = false;
        showProductModal.value = false;
        productToDelete.value = null;
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
    function toggleProductStatus(product) {
        product.product_status = product.product_status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    }

    const allSelected = ref(false)
    watch(products, (newProducts) => {
    if (newProducts) {
        newProducts.forEach(product => {
        if (product.selected === undefined) product.selected = false
        })
    }
    }, { immediate: true })

    watch(
    () => products.value && products.value.map(p => p.selected),
    (selections) => {
        if (products.value && products.value.length) {
        allSelected.value = products.value.every(p => p.selected)
        }
    }
    )

    function toggleAllSelection() {
    if (products.value) {
        products.value.forEach(product => {
        product.selected = allSelected.value
        })
    }
    }

    const showTooltip = ref(false);
    
    const currentPage = ref(1);
    const pageSize = 20; // or whatever your page size is

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

    const productImages = ref([]) // Array of File objects
    async function handleAddProduct() {
    const formData = new FormData();
    // Add product fields
    for (const key in newProduct.value) {
        formData.append(key, newProduct.value[key]);
    }
    // Add images
    productImages.value.forEach(file => {
        formData.append('images', file);
    });
    await $fetch(`${api}api/products/`, {
        method: 'POST',
        body: formData,
    });
    }

</script>

<template>
    <div class="bg-white w-full h-full absolute top-0 left-0 z-10 flex items-center justify-center" v-if="loading">
        
        <div role="status">
            <svg aria-hidden="true" class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-green-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
            <span class="sr-only">Loading...</span>
        </div>

    </div>
    <div class="relative min-h-screen">
        <nav class="flex" aria-label="Breadcrumb">
            <ol class="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
                <li class="inline-flex items-center">
                    <NuxtLink
                        to="/home"
                        class="inline-flex items-center text-sm font-medium text-gray-800 hover:text-green-800 dark:text-gray-400 dark:hover:text-white"
                    >
                        <svg class="w-3 h-3 me-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor" viewBox="0 0 20 20">
                            <path
                                d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
                        </svg>
                        Home
                    </NuxtLink>
                </li>
                <li>
                    <div class="flex items-center">
                        <svg class="rtl:rotate-180 w-3 h-3 text-gray-600 mx-1" aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="m1 9 4-4-4-4" />
                        </svg>
                        <a href="#"
                            class="ms-1 text-sm font-medium text-gray-800 hover:text-green-800 md:ms-2 dark:text-gray-400 dark:hover:text-white">Products</a>
                    </div>
                </li>
            </ol>
        </nav>
        <h1 class="text-2xl font-semibold text-black-900 dark:text-white-900 mt-3">All Products</h1>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <a href="#"
                class="p-5 bg-gray-50 border border-gray-300 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                <span
                    class="inline-flex items-center px-2 py-0.5 mb-2 text-xs font-medium text-green-800 bg-green-100 rounded dark:bg-green-900 dark:text-green-200">↑
                    0%</span>
                <h5 class="mt-0.8 text-3xl font-bold text-gray-900 dark:text-white">{{ products?.length }}</h5>
                <p class="mt-2 text-gray-500 dark:text-gray-400">Total Products</p>
            </a>

            <a href="#"
                class="p-5 bg-gray-50 border border-gray-300 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                <span
                    class="inline-flex items-center px-2 py-0.5 mb-2 text-xs font-medium text-green-800 bg-green-100 rounded dark:bg-green-900 dark:text-green-200">↑
                    0%</span>
                <h5 class="mt-0.8 text-3xl font-bold text-gray-900 dark:text-white">0</h5>
                <p class="mt-2 text-gray-500 dark:text-gray-400">New Products</p>
            </a>

            <a href="#"
                class="p-5 bg-gray-50 border border-gray-300 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                <span
                    class="inline-flex items-center px-2 py-0.5 mb-2 text-xs font-medium text-red-800 bg-red-100 rounded dark:bg-red-900 dark:text-red-200">↑
                    0%</span>
                <h5 class="mt-0.8 text-3xl font-bold text-gray-900 dark:text-white">0</h5>
                <p class="mt-2 text-gray-500 dark:text-gray-400">Sold Products</p>
            </a>

            <a href="#"
                class="p-5 bg-gray-50 border border-gray-300 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                <span
                    class="inline-flex items-center px-2 py-0.5 mb-2 text-xs font-medium text-red-800 bg-red-100 rounded dark:bg-red-900 dark:text-red-200">↑
                    0%</span>
                <h5 class="mt-0.8 text-3xl font-bold text-gray-900 dark:text-white">0</h5>
                <p class="mt-2 text-gray-500 dark:text-gray-400">Returned Products</p>
            </a>
        </div>
        <h1 v-if="loading">Loading...</h1>
        <div class="flex items-center justify-between mt-4 mb-4">
            <div class="relative inline-block">
                <span
                    class="inline-flex items-center font-semibold text-2xl cursor-pointer"
                    @mouseenter="showTooltip = true"
                    @mouseleave="showTooltip = false"
                >
                    FreshBytes Products
                    <svg
                    class="w-5 h-5 ml-2 transition-colors duration-200"
                    :class="showTooltip ? 'text-black' : 'text-gray-400'"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    >
                    <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="2" fill="none" />
                    <text x="10" y="15" text-anchor="middle" font-size="13" fill="currentColor">i</text>
                    </svg>
                </span>
                <div
                    v-if="showTooltip"
                    class="absolute left-1/2 -translate-x-1/2 mt-2 px-4 py-2 rounded bg-gray-900 text-white text-sm shadow-lg z-50 whitespace-nowrap"
                >
                    Showing {{ products && products.length ? 1 : 0 }}-{{ products && products.length ? products.length : 0 }}
                    of {{ products && products.length ? products.length : 0 }} results
                </div>
            </div>
            <div class="flex items-center space-x-2">
                <button
                    class="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
                    @click="openAddProductModal">
                    <span class="mr-2">+</span> Add new product
                </button>
            </div>
        </div>
        <!-- Add Product Modal -->
        <ProductAddModal :show-add-product-modal="showAddProductModal" :new-product="newProduct" :sellers="sellers" :users="users" :categories="categories" :subcategories="subcategories" @close-add-product-modal="closeAddProductModal" @add-product="addProduct" @update:productImages="val => productImages.value = val"/>

        <!--Filter Section-->
        <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div class="flex gap-2 flex-wrap">
                <input
                type="text"
                v-model="searchQuery"
                placeholder="Search products"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <select
                v-model="selectedCategory"
                class="px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
                >
                <option value="">Select Category</option>
                <option v-for="cat in categories" :key="cat.category_id" :value="cat.category_id">
                    {{ cat.category_name }}
                </option>
                </select>
                <select
                    v-model="selectedSubCategory"
                    class="px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
                    :disabled="!selectedCategory"
                    >
                    <option value="">Select Sub-Category</option>
                    <option
                        v-for="sub in filteredSubcategories"
                        :key="sub.sub_category_id"
                        :value="sub.sub_category_id"
                    >
                        {{ sub.sub_category_name }}
                    </option>
                    </select>
                <select
                v-model="selectedPrice"
                class="px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
                >
                <option value="">Price</option>
                <option>Low to High</option>
                <option>High to Low</option>
                </select>
                <select
                v-model="selectedStatus"
                class="px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
                >
                <option value="">Status</option>
                <option>Inactive</option>
                <option>Active</option>
                <option>Sale</option>
                <option>Discounted</option>
                </select>
                <!-- Clear Button -->
                <button
                    class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                    @click="
                        searchQuery = '';
                        selectedCategory = '';
                        selectedSubCategory = '';
                        selectedPrice = '';
                        selectedStatus = '';
                    "
                >
                    Clear
                </button>
            </div>
            <div class="flex items-center space-x-2 mt-2">
                <button
                    class="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50"
                    :disabled="!products?.some(p => p.selected)" @click="showDeleteSelectedModal = true">
                    <svg class="w-1 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    </svg>
                    <span v-if="products && products.length && products.every(p => p.selected)">
                        Delete all items
                    </span>
                    <span v-else>
                        Delete {{products?.filter(p => p.selected).length}} item<span
                            v-if="products?.filter(p => p.selected).length > 1">s</span>
                    </span>
                </button>
            </div>
        </div>
        <div class="flex flex-col">
            <div class="overflow-x-auto">
                <div class="inline-block min-w-full align-middle">
                    <div class="overflow-hidden shadow">
                        <table class="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-600">
                            <thead class="bg-gray-100 dark:bg-gray-700">
                                <tr>
                                    <th scope="col" class="p-4">
                                        <div class="flex items-center">
                                            <input id="checkbox-all" type="checkbox" v-model="allSelected" @change="toggleAllSelection"
                                                class="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600">
                                            <label for="checkbox-all" class="sr-only">checkbox</label>
                                        </div>
                                    </th>
                                    <th scope="col"
                                        class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                        Product ID
                                    </th>
                                    <th scope="col"
                                        class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                        Seller ID
                                    </th>
                                    <th scope="col"
                                        class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                        Product Name
                                    </th>
                                    <th scope="col"
                                        class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                        Category
                                    </th>
                                    <th scope="col"
                                        class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                        Current Price
                                    </th>
                                    <th scope="col"
                                        class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                        Stock
                                    </th>
                                    <th scope="col"
                                        class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                        Total Sales
                                    </th>
                                    <th scope="col"
                                        class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                        Display Status
                                    </th>
                                    <th scope="col"
                                        class="p-4 text-xs font-medium text-center text-gray-500 uppercase dark:text-gray-400">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                <tr v-for="product in paginatedProducts" :key="product.product_id" 
                                    class="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" @click="openProductModal(product)">
                                    <!-- Removed row click to avoid masking button clicks -->
                                    <td class="w-4 p-4">
                                        <div class="flex items-center" @click.stop>
                                            <input
                                            :id="`checkbox-${product.product_id}`"
                                            type="checkbox"
                                            class="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                                            v-model="product.selected"
                                            />
                                            <label :for="`checkbox-${product.product_id}`"
                                                class="sr-only">checkbox</label>
                                        </div>
                                    </td>
                                    <td
                                        class="p-4 text-sm font-semibold text-gray-900 whitespace-nowrap dark:text-white">
                                        {{ product.product_id }}
                                    </td>
                                    <td
                                        class="p-4 text-sm font-semibold text-gray-900 whitespace-nowrap dark:text-white">
                                        {{ product.seller_id }}
                                    </td>
                                    <td
                                        class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {{ product.product_name }}
                                    </td>
                                    <td
                                        class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {{categories?.find(cat => cat.category_id ===
                                            product.category_id)?.category_name || 'N/A'}}
                                    </td>
                                    <td
                                        class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        ₱{{ product.product_price }}
                                    </td>
                                    <td
                                        class="p-4 text-base font-normal text-gray-900 whitespace-nowrap dark:text-gray-400">
                                        {{ product.quantity }}
                                    </td>
                                    <td
                                        class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {{ product.sell_count }}
                                    </td>
                                    <td class="p-4 text-base font-medium whitespace-nowrap">
                                        <div class="flex items-center">
                                            <label class="inline-flex items-center cursor-pointer" @click.stop>
                                                <input type="checkbox" class="sr-only peer"
                                                    :checked="product.is_active"
                                                    @change.stop="toggleProductActive(product)" />
                                                <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600 dark:peer-checked:bg-green-600">
                                                </div>
                                                <span
                                                    class="ml-3 text-sm font-medium"
                                                    :class="product.is_active ? 'text-green-600' : 'text-red-600'"
                                                >
                                                    {{ product.is_active ? 'Active' : 'Inactive' }}
                                                </span>
                                            </label>
                                        </div>
                                    </td>
                                    <td class="p-4  space-x-2 whitespace-nowrap">
                                        <div class="flex justify-center items-center space-x-2">
                                            
                                            <button type="button" @click.stop="openUpdateModal(product)"
                                                class="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-[#29000] hover:text-white rounded-lg bg-primary-700 hover:bg-green-600 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                                                <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path
                                                        d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z">
                                                    </path>
                                                    <path fill-rule="evenodd"
                                                        d="M2 6a2 2 0 002-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                                                        clip-rule="evenodd"></path>
                                                </svg>
                                                Update
                                            </button>
                                            <button type="button" @click.stop="openDeleteModal(product)"
                                                class="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:ring-red-300 dark:focus:ring-red-900">
                                                <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fill-rule="evenodd"
                                                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                                        clip-rule="evenodd" />
                                                </svg>
                                                Delete item

                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <!-- Update Modal-->
                        <ProductUpdateModal
                            :show-update-modal="showUpdateModal"
                            :product-to-update="selectedProduct"
                            :categories="categories"
                            :subcategories="subcategories"
                            @close-update-modal="closeUpdateModal"
                            @updated="refreshProducts"
                        />
                        <div v-if="showDeleteModal"
                            class="fixed inset-0 z-60 flex items-center justify-center bg-gray-800/30">
                            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md shadow-lg">
                                <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4">Confirm Deletion
                                </h2>
                                <p class="text-gray-600 dark:text-gray-300 mb-6">
                                    Are you sure you want to delete
                                    <span class="font-bold text-red-600">{{ productToDelete?.product_name }}</span>?
                                    <br>This action cannot be undone.
                                </p>
                                <div class="flex justify-end gap-2">
                                    <button @click="closeDeleteModal"
                                        class="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                                        Cancel
                                    </button>
                                    <button @click="deleteSingleProduct"
                                        class="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700">
                                        Yes, delete
                                    </button>
                                </div>
                            </div>
                        </div>
                        <!-- Product Details Modal -->
                        <ProductDetailModal :selected-product="selectedProduct" :show-product-modal="showProductModal" :categories="categories" :subcategories="subcategories" @close-product-modal="closeProductModal" @update-product="openUpdateModal" @delete-product="openDeleteModal"></ProductDetailModal>
                        
                        <!-- Delete Selected Modal -->
                        <div v-if="showDeleteSelectedModal"
                            class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/30">
                            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md shadow-lg">
                                <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4">Confirm Deletion
                                </h2>
                                <p class="text-gray-600 dark:text-gray-300 mb-6">
                                    <span v-if="products && products.length && products.every(p => p.selected)">
                                        Are you sure you want to delete <span class="font-bold text-red-600">all
                                            items</span>?
                                    </span>
                                    <span v-else>
                                        Are you sure you want to delete
                                        <span class="font-bold text-red-600">{{products?.filter(p => p.selected).length
                                            }}</span>
                                        item<span v-if="products?.filter(p => p.selected).length > 1">s</span>?
                                    </span>
                                    <br>This action cannot be undone.
                                </p>
                                <div class="flex justify-end gap-2">
                                    <button @click="closeDeleteSelectedModal"
                                        class="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                                        Cancel
                                    </button>
                                    <button @click="deleteSelectedProducts"
                                        class="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700">
                                        Yes, delete
                                    </button>
                                </div>
                            </div>
                        </div>
                        <!-- Divider -->
                        <hr class="my-4 border-gray-200 dark:border-gray-700">

                        <!-- Pagination -->
                        <div class="flex items-center justify-between mb-4">
                        <!-- Pagination Controls (left, arrows and page numbers) -->
                        <div>
                            <ul class="inline-flex items-center -space-x-px">
                            <li>
                                <button
                                class="flex items-center justify-center h-10 w-10 ms-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:border-gray-500 hover:text-neutral-950 disabled:opacity-50"
                                :disabled="currentPage === 1"
                                @click="goToPage(currentPage - 1)"
                                >
                                <span class="sr-only">Previous</span>
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="4" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                                </svg>
                                </button>
                            </li>
                            <li v-for="page in Math.min(totalPages, 5)" :key="page">
                                <button
                                class="flex items-center justify-center h-10 w-10 leading-tight border border-gray-300
                                    hover:bg-gray-100 hover:text-green-700
                                    focus:z-20 focus:ring-2 focus:ring-green-500
                                    transition"
                                :class="{
                                    'bg-green-50 text-green-600 border-green-400': currentPage === page,
                                    'bg-white text-gray-500': currentPage !== page
                                }"
                                @click="goToPage(page)"
                                >
                                {{ page }}
                                </button>
                            </li>
                            <li>
                                <button
                                class="flex items-center justify-center h-10 w-10 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:border-gray-500 hover:text-neutral-950 disabled:opacity-50"
                                :disabled="currentPage === totalPages"
                                @click="goToPage(currentPage + 1)"
                                >
                                <span class="sr-only">Next</span>
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="4" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                                </button>
                            </li>
                            <!-- Showing Info -->
                            <li class="text-sm text-gray-600 ml-4">
                                Showing <span class="font-semibold">{{ (currentPage - 1) * pageSize + 1 }}</span>
                                -
                                <span class="font-semibold">{{ Math.min(currentPage * pageSize, total) }}</span>
                                of <span class="font-semibold">{{ total }}</span>
                            </li>
                            </ul>
                        </div>
                        <!-- Green Buttons (right) -->
                        <div class="flex items-center space-x-6">
                            <div class="flex items-center space-x-2">
                            <button
                                class="flex items-center px-6 py-2 bg-green-700 text-white rounded-xl font-semibold text-base shadow hover:bg-green-800 transition disabled:opacity-50"
                                :disabled="currentPage === 1"
                                @click="goToPage(currentPage - 1)"
                            >
                                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" stroke-width="4" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                                </svg>
                                Previous
                            </button>
                            <button
                                class="flex items-center px-6 py-2 bg-green-700 text-white rounded-xl font-semibold text-base shadow hover:bg-green-800 transition disabled:opacity-50"
                                :disabled="currentPage === totalPages"
                                @click="goToPage(currentPage + 1)"
                            >
                                Next
                                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" stroke-width="4" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                            </div>
                        </div>
                        </div>

                        <!-- Action buttons section (above footer) -->
                        <div class="flex justify-end items-center space-x-4 mb-22">
                            <button class="text-sm text-gray-600 hover:underline">Print barcodes</button>
                            <button class="text-sm text-gray-600 hover:underline">Duplicate</button>
                            <button
                                class="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded">
                                Export CSV
                            </button>
                        </div>

                        <!-- Footer -->
                        <footer
                            class="absolute bottom-0 left-0 w-full border-t border-gray-200 dark:border-gray-700 py-4 flex flex-col md:flex-row items-center justify-between px-4 text-sm text-gray-500 dark:text-gray-400">
                            <div class="flex items-center space-x-4">
                                <span>© 2025 FreshBytes. All rights reserved.</span>
                                <a href="#" class="hover:underline">Privacy Policy</a>
                                <a href="#" class="hover:underline">API</a>
                                <a href="#" class="hover:underline">Contact</a>
                            </div>

                            <div class="flex items-center space-x-2 mt-2 md:mt-0">
                                <select class="text-sm bg-transparent focus:outline-none dark:text-white">
                                    <option selected>English (US)</option>
                                    <!-- Add more language options -->
                                </select>
                                <button class="text-gray-500 dark:text-gray-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M12 4v16m8-8H4" />
                                    </svg>
                                </button>
                            </div>
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
