<script setup>
    definePageMeta({
        layout: "home",
    });

    const api = "http://192.168.63.238:8000"; // API HERE
    const { data: products } = await useFetch(`${api}/products/`);
    const { data: categories } = await useFetch(`${api}/categories/`);
    const { data: subcategories } = await useFetch(`${api}/subcategories/`);



    // const products = ref([
    //     {
    //         id: 1,
    //         name: "Papaya",
    //         category: "Fruits",
    //         price: "9",
    //         stock: "123",
    //         totalSales: "₱1299.99",
    //         status: "Inactive"
    //     },
    // ]);
    // products.value.push({
    //     id: 2,
    //     name: "Banana",
    //     category: "Fruits",
    //     price: "12",
    //     stock: "50",
    //     totalSales: "₱500.00",
    //     status: "Active"
    // });


    function handleDelete() {

        alert("Item deleted!");
        document.getElementById('deleteModal').classList.add('hidden');
    }
    import { ref, computed } from 'vue';

    // Reactive variables
    const selectedCategory = ref('');
    const selectedSubCategory = ref('');

    // Sub-category map
    const subCategories = {
        Fruits: ['Citrus', 'Berries', 'Tropical', 'Stone Fruits', 'Melons'],
        Vegetables: ['Root Vegetables', 'Leafy Greens', 'Cruciferous Vegetables', 'Nightshades'],
    };

    // Computed options based on selected category
    const availableSubCategories = computed(() => {
        return subCategories[selectedCategory.value] || [];
    });

    const showAddProductModal = ref(false);
    function openAddProductModal() {
        showAddProductModal.value = true;
    }
    function closeAddProductModal() {
        showAddProductModal.value = false;
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

    function openUpdateModal() {
        showUpdateModal.value = true;
    }
    function closeUpdateModal() {
        showUpdateModal.value = false;
    }

    const showDeleteModal = ref(false);
    const productToDelete = ref(null);

    function openDeleteModal(product) {
        productToDelete.value = product;
        showDeleteModal.value = true;
    }
    function closeDeleteModal() {
        showDeleteModal.value = false;
        productToDelete.value = null;
    }
</script>

<template>
    <div class="relative min-h-screen">
        <nav class="flex" aria-label="Breadcrumb">
            <ol class="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
                <li class="inline-flex items-center">
                    <a href="#"
                        class="inline-flex items-center text-sm font-medium text-gray-800 hover:text-green-800 dark:text-gray-400 dark:hover:text-white">
                        <svg class="w-3 h-3 me-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor" viewBox="0 0 20 20">
                            <path
                                d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
                        </svg>
                        Home
                    </a>
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
                <h5 class="mt-0.8 text-3xl font-bold text-gray-900 dark:text-white">{{ products.length }}</h5>
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
        <div class="flex items-center justify-between mt-4 mb-4">
            <div class="flex items-center space-x-2">
                <span class="font-semibold text-black text-xl">FreshBytes Products</span>
                <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="2" fill="none" />
                    <text x="10" y="15" text-anchor="middle" font-size="12" fill="currentColor">i</text>
                </svg>
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
        <div v-if="showAddProductModal" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/30">
            <div
                class="bg-white text-gray-900 rounded-lg shadow-lg w-full max-w-2xl p-8 relative h-screen overflow-y-auto">
                <button class="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
                    @click="closeAddProductModal">&times;</button>
                <h2 class="text-2xl font-semibold mb-6">Add Product</h2>
                <form class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block mb-1 font-medium">Product Name</label>
                            <input type="text"
                                class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none"
                                placeholder="Type product name" />
                        </div>
                        <div>
                            <label class="block mb-1 font-medium">Category</label>
                            <select
                                class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none">
                                <option>Select category</option>
                                <option>Fruits</option>
                                <option>Vegetables</option>
                            </select>
                        </div>
                        <div>
                            <label class="block mb-1 font-medium">Sub-Category</label>
                            <select
                                class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none">
                                <option>Select sub-category</option>
                                <option>Citrus</option>
                                <option>Berries</option>
                                <option>Tropical</option>
                                <option>Stone Fruits</option>
                                <option>Melons</option>
                                <option>Vegetables</option>
                                <option>Root Vegetable</option>
                                <option>Leafy Greens</option>
                                <option>Cruciferous Vegetables</option>
                                <option>Nightshades</option>
                            </select>
                        </div>
                        <div>
                            <label class="block mb-1 font-medium">Product Unit (kg)</label>
                            <input type="text"
                                class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none"
                                placeholder="0" />
                        </div>
                        <div>
                            <label class="block mb-1 font-medium">Price</label>
                            <input type="number"
                                class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none"
                                placeholder="0" />
                        </div>
                        <div>
                            <label class="block mb-1 font-medium">Product Status</label>
                            <select
                                class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none">
                                <option>Select Product Status</option>
                                <option>Fresh</option>
                                <option>Slightly Withered</option>
                                <option>Withered</option>
                            </select>
                        </div>
                        <div>
                            <label class="block mb-1 font-medium">Product Location</label>
                            <input type="number"
                                class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none"
                                placeholder="Location" />
                        </div>
                        <div>
                            <label class="block mb-1 font-medium">Quantity</label>
                            <input type="number"
                                class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none"
                                placeholder="0" />
                        </div>
                    </div>
                    <div>
                        <label class="block mb-1 font-medium">Brief Description</label>
                        <textarea class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none"
                            rows="3" placeholder="Write product description here"></textarea>
                    </div>
                    <div>
                        <label class="block mb-1 font-medium">Detailed Description</label>
                        <textarea class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none"
                            rows="3" placeholder="Write product description here"></textarea>
                    </div>
                    <div>
                        <label class="block mb-1 font-medium">Product Images</label>
                        <div
                            class="w-full h-40 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                            <svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" stroke-width="2"
                                viewBox="0 0 24 24">
                                <path d="M12 4v16m8-8H4" />
                            </svg>
                            <span class="font-semibold">Click to upload</span> or drag and drop
                            <div class="text-xs mt-1">SVG, PNG, JPG or GIF (MAX. 800×400px)</div>
                        </div>
                    </div>
                    <div class="flex justify-end space-x-2 mt-6">
                        <button type="button" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Add
                            product</button>
                        <button type="button" class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
                            @click="closeAddProductModal">Cancel</button>
                    </div>
                </form>
            </div>
        </div>

        <!--Filter Section-->
        <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div class="flex gap-2 flex-wrap">
                <input type="text" placeholder="Search"
                    class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <select v-model="selectedCategory"
                    class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select Category</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Vegetables">Vegetables</option>
                </select>

                <select v-model="selectedSubCategory"
                    class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    :disabled="!selectedCategory">
                    <option value="">Select Sub-Category</option>
                    <option v-for="(sub, index) in availableSubCategories" :key="index" :value="sub">
                        {{ sub }}
                    </option>
                </select>
                <select
                    class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Price</option>
                    <option>Low to High</option>
                    <option>High to Low</option>
                </select>
                <select
                    class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Status</option>
                    <option>Inactive</option>
                    <option>Active</option>
                    <option>Sale</option>
                    <option>Discounted</option>
                </select>
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
                                            <input id="checkbox-all" aria-describedby="checkbox-1" type="checkbox"
                                                class="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600">
                                            <label for="checkbox-all" class="sr-only">checkbox</label>
                                        </div>
                                    </th>
                                    <th scope="col"
                                        class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                        Product Name
                                    </th>
                                    <th scope="col"
                                        class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                        Product ID
                                    </th>

                                    <th scope="col"
                                        class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                        Category
                                    </th>
                                    <th scope="col"
                                        class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                        Price
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
                                        Status
                                    </th>
                                    <th scope="col"
                                        class="p-4 text-xs font-medium text-center text-gray-500 uppercase dark:text-gray-400">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                <tr v-for="product in products" :key="product.product_id"
                                    class="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                    @click="openProductModal(product)">
                                    <td class="w-4 p-4">
                                        <div class="flex items-center">
                                            <input :id="`checkbox-${product.product_id}`" type="checkbox"
                                                class="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600" />
                                            <label :for="`checkbox-${product.product_id}`" class="sr-only">checkbox</label>
                                        </div>
                                    </td>
                                    <td
                                        class="p-4 text-sm font-semibold text-gray-900 whitespace-nowrap dark:text-white">
                                        {{ product.product_name }}
                                    </td>
                                    <td
                                        class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {{ product.product_id }}
                                    </td>
                                    <td
                                        class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {{ categories.find(cat => cat.category_id === product.category_id)?.category_name || 'N/A' }}
                                    </td>
                                    <td
                                        class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {{ product.product_price }}
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
                                        <span :class="product.product_status === 'INACTIVE'
                                            ? 'text-red-600 font-semibold'
                                            : 'text-green-600 font-semibold'">
                                            {{ product.product_status }}
                                        </span>
                                    </td>
                                    <td class="p-4  space-x-2 whitespace-nowrap">
                                        <div class="flex justify-center items-center space-x-2">

                                            <button type="button" @click.stop="openUpdateModal"
                                                class="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-[#29000] hover:text-white rounded-lg bg-primary-700 hover:bg-green-600 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                                                <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path
                                                        d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z">
                                                    </path>
                                                    <path fill-rule="evenodd"
                                                        d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
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

                                        <!-- Update Modal-->
                                        <div v-if="showUpdateModal"
                                            class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/30">
                                            <div
                                                class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-3xl h-screen overflow-y-auto relative">
                                                <h2 class="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                                                    Update Product</h2>
                                                <!-- Close button below h2 -->
                                                <button
                                                    class="absolute top-6 right-6 text-gray-400 hover:text-gray-700 text-2xl"
                                                    @click.stop="closeUpdateModal" aria-label="Close">&times;</button>
                                                <form class="space-y-4">
                                                    <div class="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label
                                                                class="block text-gray-700 dark:text-gray-300">Product
                                                                Name</label>
                                                            <input type="text"
                                                                class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                                                                placeholder="Papaya">
                                                        </div>
                                                        <div>
                                                            <label
                                                                class="block text-gray-700 dark:text-gray-300">Category</label>
                                                            <select
                                                                class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white">
                                                                <option>Fruits</option>
                                                                <option>Vegetables</option>
                                                            </select>
                                                        </div>
                                                        <!-- Add more options -->
                                                        <div>
                                                            <label
                                                                class="block text-gray-700 dark:text-gray-300">Sub-Category</label>
                                                            <select
                                                                class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white">
                                                                <option>Citrus</option>
                                                                <option>Berries</option>
                                                                <option>Tropical</option>
                                                                <option>Stone Fruits</option>
                                                                <option>Melons</option>
                                                                <option>Vegetables</option>
                                                                <option>Root Vegetable</option>
                                                                <option>Leafy Greens</option>
                                                                <option>Cruciferous Vegetables</option>
                                                                <option>Nightshades</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label
                                                                class="block text-gray-700 dark:text-gray-300">Product
                                                                Unit(kg)</label>
                                                            <input type="number"
                                                                class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                                                                placeholder="3">
                                                        </div>
                                                        <div>
                                                            <label
                                                                class="block text-gray-700 dark:text-gray-300">Price</label>
                                                            <input type="number"
                                                                class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                                                                placeholder="259">
                                                        </div>
                                                        <div>
                                                            <label
                                                                class="block text-gray-700 dark:text-gray-300">Product
                                                                Status</label>
                                                            <select
                                                                class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                                                                placeholder="Fresh">
                                                                <option>Fresh</option>
                                                                <option>Slightly Withered</option>
                                                                <option>Withered</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label
                                                                class="block text-gray-700 dark:text-gray-300">Product
                                                                location</label>
                                                            <input type="text"
                                                                class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                                                                placeholder="Kabacan">
                                                        </div>
                                                        <div>
                                                            <label
                                                                class="block text-gray-700 dark:text-gray-300">Quantity</label>
                                                            <input type="number"
                                                                class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                                                                placeholder="121">
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label class="block text-gray-700 dark:text-gray-300">Brief
                                                            Description</label>
                                                        <textarea
                                                            class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                                                            rows="4">Papaya</textarea>
                                                    </div>
                                                    <div>
                                                        <label class="block text-gray-700 dark:text-gray-300">Detailed
                                                            Description</label>
                                                        <textarea
                                                            class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                                                            rows="4">Papaya papaya</textarea>
                                                    </div>

                                                    <div>
                                                        <label
                                                            class="block text-gray-700 dark:text-gray-300 mb-2">Product
                                                            Images</label>
                                                        <div class="flex space-x-4">
                                                            <div class="relative">
                                                                <img src="\assets\images\logos-12-12.png"
                                                                    class="w-24 h-24 object-cover rounded border"
                                                                    alt="Product">
                                                                <button
                                                                    class="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1">🗑</button>
                                                            </div>
                                                            <div class="relative">
                                                                <img src="\assets\images\logos-12-12.png"
                                                                    class="w-24 h-24 object-cover rounded border"
                                                                    alt="Product">
                                                                <button
                                                                    class="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1">🗑</button>
                                                            </div>
                                                            <div class="relative">
                                                                <div
                                                                    class="w-24 h-24 border border-dashed flex items-center justify-center text-gray-500 dark:text-gray-400 rounded">
                                                                    + Upload
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div class="flex justify-end space-x-2 mt-6">
                                                        <button type="submit"
                                                            class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Update
                                                            Product</button>
                                                        <button type="button" @click.stop="closeUpdateModal"
                                                            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>



                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <!-- Product Details Modal -->
                        <div v-if="showProductModal && !showUpdateModal"
                            class="fixed inset-0 z-50 flex items-center justify-center bg-opacity-30 bg-gray-800/30">
                            <div class="bg-white rounded-xl shadow-lg w-full max-w-2xl p-8 relative">
                                <!-- Close button -->
                                <button class="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
                                    @click="closeProductModal" aria-label="Close">&times;</button>
                                <!-- Product Title and Price -->
                                <div class="flex flex-col gap-1 mb-4">
                                    <h2 class="text-2xl font-bold text-gray-900">{{ selectedProduct.product_name }}</h2>
                                    <span class="text-xl font-semibold text-gray-700">₱{{ selectedProduct.product_price
                                        }}</span>
                                </div>
                                <!-- Images (placeholder) -->
                                <div class="flex gap-4 mb-4">
                                    <div class="w-28 h-24 bg-gray-100 rounded flex items-center justify-center">
                                        <img src="\assets\images\logos-12-12.png" alt="Product"
                                            class="object-contain h-20" />
                                    </div>
                                    <div class="w-28 h-24 bg-gray-100 rounded flex items-center justify-center">
                                        <img src="\assets\images\logos-12-12.png" alt="Product"
                                            class="object-contain h-20" />
                                    </div>
                                    <div class="w-28 h-24 bg-gray-100 rounded flex items-center justify-center">
                                        <img src="\assets\images\logos-12-12.png" alt="Product"
                                            class="object-contain h-20" />
                                    </div>
                                    <div class="w-28 h-24 bg-gray-100 rounded flex items-center justify-center">
                                        <img src="\assets\images\logos-12-12.png" alt="Product"
                                            class="object-contain h-20" />
                                    </div>
                                </div>
                                <!-- Brief Description -->
                                <div class="mb-2">
                                    <div class="font-semibold text-gray-900 mb-1">Details</div>
                                    <div class="text-gray-700 text-sm">
                                        {{ selectedProduct.product_brief_description || 'No brief description available.' }}
                                    </div>
                                </div>
                                <!-- Detailed Description -->
                                <div class="mb-2">
                                    <div class="font-semibold text-gray-900 mb-1">Details</div>
                                    <div class="text-gray-700 text-sm">
                                        {{ selectedProduct.product_full_description || 'No detailed description available.' }}
                                    </div>
                                </div>
                                <!-- Info Grid -->
                                <div class="grid grid-cols-2 gap-4 mb-4">
                                    <div class="bg-gray-50 rounded-lg p-3">
                                        <div class="text-xs text-gray-500">Category</div>
                                        <div class="font-medium text-gray-900"> {{ categories.find(cat => cat.category_id === selectedProduct.category_id)?.category_name || 'N/A' }} </div>
                                    </div>
                                    <div class="bg-gray-50 rounded-lg p-3">
                                        <div class="text-xs text-gray-500">Sub-category</div>
                                        <div class="font-medium text-gray-900"> {{ subcategories.find(subcat => subcat.sub_category_id === selectedProduct.sub_category_id)?.sub_category_name || 'N/A' }} </div>
                                    </div>
                                    <div class="bg-gray-50 rounded-lg p-3">
                                        <div class="text-xs text-gray-500">Product Status</div>
                                        <span
                                            class="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-green-100 text-green-600 rounded">
                                            <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <circle cx="10" cy="10" r="10" />
                                            </svg>
                                            Fresh
                                        </span>
                                    </div>
                                    <div class="bg-gray-50 rounded-lg p-3">
                                        <div class="text-xs text-gray-500">Product Unit (kg)</div>
                                        <div class="font-medium text-gray-900">3</div>
                                    </div>
                                    <div class="bg-gray-50 rounded-lg p-3">
                                        <div class="text-xs text-gray-500">Price</div>
                                        <div class="font-medium text-gray-900">{{ selectedProduct.product_price }}</div>
                                    </div>
                                    <div class="bg-gray-50 rounded-lg p-3">
                                        <div class="text-xs text-gray-500">Product Location</div>
                                        <div class="font-medium text-gray-900">{{ selectedProduct.product_location }}</div>
                                    </div>
                                    <div class="bg-gray-50 rounded-lg p-3">
                                        <div class="text-xs text-gray-500">Quantity</div>
                                        <div class="font-medium text-gray-900">{{ selectedProduct.quantity }}</div>
                                    </div>
                                    <div class="bg-gray-50 rounded-lg p-3">
                                        <div class="text-xs text-gray-500">Product SKU</div>
                                        <div class="font-medium text-gray-900">{{ selectedProduct.product_sku }}</div>
                                    </div>
                                </div>
                                <!-- Action Buttons -->
                                <div class="flex justify-end space-x-2 mt-6">
                                    <button
                                        class="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
                                        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z">
                                            </path>
                                            <path fill-rule="evenodd"
                                                d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                                                clip-rule="evenodd"></path>
                                        </svg>
                                        Update
                                    </button>
                                    <button
                                        class="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm">
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
                        <div v-if="showDeleteModal"
                            class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/30">
                            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md shadow-lg">
                                <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4">Confirm Deletion
                                </h2>
                                <p class="text-gray-600 dark:text-gray-300 mb-6">Are you sure you want to delete this
                                    item?<br>
                                    This action cannot be undone.</p>

                                <div class="flex justify-end gap-2">
                                    <button @click="closeDeleteModal"
                                        class="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                                        Cancel
                                    </button>
                                    <button @click="handleDelete"
                                        class="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700">
                                        Yes, delete
                                    </button>
                                </div>
                            </div>
                        </div>
                        <!-- Divider -->
                        <hr class="my-4 border-gray-200 dark:border-gray-700">

                        <!-- Action buttons section (above footer) -->
                        <div class="flex justify-end items-center space-x-4 mb-4">
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
