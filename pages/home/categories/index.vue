<script setup>
definePageMeta({
    layout: "home",
});

// const products = ref([
//     {
//         id: 1,
//         name: "Fruits",
//         description: "Papapa",
//         status: "Inactive",
//         created_at: "2025-06-20T01",
//         updated_at: "2025-06-20T01"
//     },
//     {
//         id: 2,
//         name: "Vegetables",
//         description: "Yayaya",
//         status: "Active",
//         created_at: "2025-06-20T01",
//         updated_at: "2025-06-20T01"
//     }
// ])
const api = "http://192.168.63.238:8000"; // API HERE
const { data: categories, pending } = await useFetch(`${api}/categories/`);


const isCategoryVisible = ref(false);
const selectedCategory = ref(null);

function showCategoryModal(product) {
    selectedCategory.value = product;
    isCategoryVisible.value = true;
}
const isUpdateVisible = ref(false);
const productToUpdate = ref(null);

function openUpdateModal(product) {
    productToUpdate.value = product;
    isUpdateVisible.value = true;
}
const isDeleteVisible = ref(false);
const productToDelete = ref(null);

function openDeleteModal(product) {
    productToDelete.value = product;
    isDeleteVisible.value = true;
}

function closeDeleteModal() {
    isDeleteVisible.value = false;
    productToDelete.value = null;
}

function handleDelete() {
    // Do your deletion logic here using `productToDelete.value`
    console.log("Deleting:", productToDelete.value);
    closeDeleteModal();
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
                            class="ms-1 text-sm font-medium text-gray-800 hover:text-green-800 md:ms-2 dark:text-gray-400 dark:hover:text-white">Categories</a>
                    </div>
                </li>
                <div class="flex items-center">
                    <svg class="rtl:rotate-180 w-3 h-3 text-gray-600 mx-1" aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="m1 9 4-4-4-4" />
                    </svg>
                    <a href="#"
                        class="ms-1 text-sm font-medium text-gray-800 hover:text-green-800 md:ms-2 dark:text-gray-400 dark:hover:text-white">Manage
                        Categories</a>
                </div>
            </ol>
        </nav>
        <div class="flex justify-between items-center mt-3">
            <h1 class="text-2xl font-semibold text-black-900 dark:text-white-900">
                Categories
            </h1>
            <div class="flex items-center space-x-2">
                <button type="button" onclick="document.getElementById('addCategory').classList.remove('hidden')"
                    class="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">
                    <span class="mr-2">+</span> Add new category
                </button>
            </div>

            <div id="addCategory" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/30 hidden">
                <div
                    class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto">

                    <h2 class="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Add Category</h2>
                    <form class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block mb-1 font-medium">Category Name</label>
                                <input type="text"
                                    class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none"
                                    placeholder="Type product name" />
                            </div>
                            <div>
                                <label class="block mb-1 font-medium">Category Status</label>
                                <select
                                    class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none">
                                    <option>Select Category Status</option>
                                    <option>Inactive</option>
                                    <option>Active</option>

                                </select>
                            </div>

                            <div>
                                <label class="block mb-1 font-medium">Category Description</label>
                                <textarea
                                    class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none"
                                    rows="3" placeholder="Write product description here"></textarea>
                            </div>



                        </div>

                        <div>
                            <label class="block mb-1 font-medium">Category Image</label>
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
                            <button type="button"
                                class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Add
                                product</button>
                            <button type="button"
                                onclick="document.getElementById('addCategory').classList.add('hidden')"
                                class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>

        </div>

        <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div class="flex gap-2 flex-wrap">
                <input type="text" placeholder="Search"
                    class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <select
                    class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Select Category</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Vegetables">Vegetables</option>
                </select>

                <select
                    class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Filter</option>
                    <option>By upload date</option>
                    <option>By Alphabetical</option>

                </select>
                <select
                    class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Status</option>
                    <option>Inactive</option>
                    <option>Active</option>

                </select>
            </div>
        </div>
        <div class="flex flex-col">
            <div class="overflow-x-auto">
                <div class="inline-block min-w-full align-middle">
                    <div class="overflow-hidden shadow">
                        <div v-if="pending">Loading</div>
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
                                        Category Name
                                    </th>
                                    <th scope="col"
                                        class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                        Category ID
                                    </th>

                                    <th scope="col"
                                        class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                        Category Description
                                    </th>
                                    <th scope="col"
                                        class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                        Status
                                    </th>
                                    <th scope="col"
                                        class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                        Created At
                                    </th>
                                    <th scope="col"
                                        class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                        Updated At
                                    </th>
                                    <th scope="col"
                                        class="p-4 text-xs font-medium text-center text-gray-500 uppercase dark:text-gray-400">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                <tr v-for="category in categories" :key="category.category_id"
                                    class="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                    @click="showCategoryModal(category)">

                                    <td class="w-4 p-4">
                                        <div class="flex items-center">
                                            <input :id="`checkbox-${category.category_id}`" type="checkbox"
                                                class="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600" />
                                            <label :for="`checkbox-${category.category_id}`"
                                                class="sr-only">checkbox</label>
                                        </div>

                                    </td>
                                    <td
                                        class="p-4 text-sm font-semibold text-gray-900 whitespace-nowrap dark:text-white">
                                        {{ category.category_name }}
                                    </td>
                                    <td
                                        class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {{ category.category_id }}
                                    </td>
                                    <td
                                        class="p-4 text-base font-normal text-gray-900 whitespace-nowrap dark:text-gray-400">
                                        {{ category.category_name }}
                                    </td>

                                    <td class="p-4 text-base font-medium whitespace-nowrap">
                                        <span :class="category.category_isActive
                                            ? 'text-red-600 font-semibold'
                                            : 'text-green-600 font-semibold'">
                                            {{ category.category_isActive ? 'Inactive' : 'Active' }}
                                        </span>
                                    </td>
                                    <td
                                        class="p-4 text-base font-normal text-gray-900 whitespace-nowrap dark:text-gray-400">
                                        {{ formatDate(category.created_at) }}
                                    </td>
                                    <td
                                        class="p-4 text-base font-normal text-gray-900 whitespace-nowrap dark:text-gray-400">
                                        {{ formatDate(category.updated_at) }}
                                    </td>
                                    <td class="p-4 space-x-2 whitespace-nowrap">
                                        <div class="flex justify-center space-x-2">
                                            <button type="button" @click.stop="openUpdateModal(category)"
                                                class="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-[#29000] rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
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


                                            <div id="showCategory" v-if="isCategoryVisible"
                                                class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/30">

                                                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto"
                                                    @click.stop>
                                                    <div class="flex flex-col gap-1 mb-4">


                                                        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{
                                                            selectedCategory?.category_name }}</h2>
                                                    </div>


                                                    <div class="flex gap-4 mb-4">
                                                        <div
                                                            class="w-28 h-24 bg-gray-100 rounded flex items-center justify-center">
                                                            <img src="\assets\images\logos-12-12.png" alt="Product"
                                                                class="object-contain h-20" />
                                                        </div>
                                                    </div>

                                                    <form class="space-y-4">
                                                        <div class="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label class="block mb-1 font-medium">Category
                                                                    Name</label>
                                                                <div
                                                                    class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300">
                                                                    {{ selectedCategory?.category_name }}
                                                                </div>

                                                            </div>
                                                            <div>
                                                                <label class="block mb-1 font-medium">Category
                                                                    Status</label>
                                                                <div
                                                                    class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300">
                                                                    {{ selectedCategory?.category_isActive ? 'Inactive'
                                                                    : 'Active' }}
                                                                </div>
                                                            </div>


                                                            <div>
                                                                <label class="block mb-1 font-medium">Category
                                                                    Description</label>
                                                                <textarea rows="3" disabled
                                                                    class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300 resize-none">{{ selectedCategory?.description }}</textarea>
                                                            </div>
                                                            <div>
                                                                <label class="block mb-1 font-medium">Created at</label>
                                                                <textarea rows="3" disabled
                                                                    class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300 resize-none">{{ formatDate(selectedCategory?.created_at) }}</textarea>
                                                            </div>
                                                            <div>
                                                                <label class="block mb-1 font-medium">Updated
                                                                    at</label>
                                                                <textarea rows="3" disabled
                                                                    class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300 resize-none">{{ formatDate(selectedCategory?.updated_at) }}</textarea>
                                                            </div>
                                                        </div>



                                                        <div class="flex justify-end space-x-2 mt-6">
                                                            <button type="button"
                                                                class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Add
                                                                product</button>
                                                            <button type="button"
                                                                @click="isCategoryVisible = false; selectedCategory = null"
                                                                class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                                                                Cancel
                                                            </button>


                                                        </div>

                                                    </form>
                                                </div>
                                            </div>

                                            <div id="updateModal" v-if="isUpdateVisible"
                                                class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/30 ">
                                                <div class="bg-white p-6 rounded shadow-lg max-w-xl w-full h-screen overflow-y-auto"
                                                @click.stop>
                                                    <h2
                                                        class="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                                                        Update Category</h2>

                                                    <form class="space-y-4">
                                                        <div class="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label
                                                                    class="block text-gray-700 dark:text-gray-300">Category
                                                                    Name</label>
                                                                <input type="text"
                                                                    class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                                                                    placeholder="Fruits">
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label class="block mb-1 font-medium">Category
                                                                Status</label>
                                                            <select
                                                                class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none">
                                                                <option>Select Category Status</option>
                                                                <option>Inactive</option>
                                                                <option>Active</option>

                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label
                                                                class="block text-gray-700 dark:text-gray-300">Created
                                                                At
                                                            </label>
                                                            <input type="text"
                                                                class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                                                                placeholder="Created Date">
                                                        </div>
                                                        <div>
                                                            <label
                                                                class="block text-gray-700 dark:text-gray-300">Updated
                                                                At
                                                            </label>
                                                            <input type="text"
                                                                class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                                                                placeholder="Updated date">
                                                        </div>



                                                        <div>
                                                            <label
                                                                class="block text-gray-700 dark:text-gray-300">Categpry
                                                                Description</label>
                                                            <textarea
                                                                class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                                                                rows="4">Wow category description</textarea>
                                                        </div>

                                                        <div>
                                                            <label class="block mb-1 font-medium">Category Image</label>
                                                            <div
                                                                class="w-full h-40 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                                                                <svg class="w-12 h-12 mb-2" fill="none"
                                                                    stroke="currentColor" stroke-width="2"
                                                                    viewBox="0 0 24 24">
                                                                    <path d="M12 4v16m8-8H4" />
                                                                </svg>
                                                                <span class="font-semibold">Click to upload</span> or
                                                                drag and drop
                                                                <div class="text-xs mt-1">SVG, PNG, JPG or GIF (MAX.
                                                                    800×400px)</div>
                                                            </div>
                                                        </div>

                                                        <div class="flex justify-between mt-6">
                                                            <button type="submit"
                                                                class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Update
                                                                Category</button>
                                                            <button @click="isUpdateVisible = false"
                                                                class="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Close</button>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>



                                            <button type="button" @click.stop="openDeleteModal(product)"
                                                class="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:ring-red-300 dark:focus:ring-red-900">
                                                <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fill-rule="evenodd"
                                                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                                        clip-rule="evenodd" />
                                                </svg>
                                                Delete category
                                            </button>
                                            <div v-if="isDeleteVisible" id="deleteModal"
                                                class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/30">

                                                <div @click.stop
                                                    class="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md shadow-lg">
                                                    <h2
                                                        class="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                                                        Confirm Deletion</h2>
                                                    <p class="text-gray-600 dark:text-gray-300 mb-6">Are you sure you
                                                        want to delete this category?<br>
                                                        This action cannot be undone.</p>

                                                    <div class="flex justify-end gap-2">
                                                        <button @click="isDeleteVisible = false; productToDelete = null"
                                                            class="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                                                            Cancel
                                                        </button>
                                                        <button @click="isDeleteVisible = false; productToDelete = null"
                                                            class="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700">
                                                            Yes, delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                </tr>

                            </tbody>
                        </table>
                        <hr class="my-4 border-gray-200 dark:border-gray-700">
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