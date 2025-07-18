<script setup>
import { ref, computed } from 'vue';

definePageMeta({
    layout: "home",
});


const config = useRuntimeConfig();
const api = config.public.API_LINK;

const accessToken = ref('');

import CategoryAddModal from '@/components/categories/CategoryAddModal.vue'
import CategoryShowModal from '@/components/categories/CategoryShowModal.vue'
import CategoryDeleteModal from '@/components/categories/CategoryDeleteModal.vue'

const getAuthHeaders = () => {
    const accessTokenCookie = useCookie('auth-access-token')
    const token = accessTokenCookie.value

    return token ? {
        Authorization: `Bearer ${token}`
    } : {}
}

// Products fetch with auth headers
const { data: products, pending: pendingProducts, refresh: refreshProducts } = await useFetch(
    `${api}/api/products/`,
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

const loading = computed(() => pendingProducts.value || pendingCategories.value || pendingSubcategories.value);

const searchQuery = ref('');
const filteredCategories = computed(() => {
    let list = categories.value || [];
    if (searchQuery.value) {
        list = list.filter(sub =>
            sub.category_name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            sub.category_description?.toLowerCase().includes(searchQuery.value.toLowerCase())
        );
    }
    if (statusFilter.value) {
        list = list.filter(sub =>
            statusFilter.value === 'Active'
                ? sub.category_isActive === true
                : sub.category_isActive === false
        );
    }
    return list;
});

// Modal state
const isCategoryVisible = ref(false);
const selectedCategory = ref(null);
const statusFilter = ref('');
const isUpdateVisible = ref(false);
const categoryToUpdate = ref(null);

const isDeleteVisible = ref(false);
const categoryToDelete = ref(null);

function openDeleteModal(category) {
    categoryToDelete.value = category;
    isDeleteVisible.value = true;
}
function handleModalClose() {
  isDeleteVisible.value = false
  selectedCategory.value = null
}

const selectedCategoryIds = ref([]);
const isAddVisible = ref(false);

async function updateCategory() {
    if (!categoryToUpdate.value || !categoryToUpdate.value.category_id) {
        alert('No category selected for update.');
        return;
    }
    try {
        const formData = new FormData();
        formData.append('category_name', categoryToUpdate.value.category_name);
        formData.append('category_description', categoryToUpdate.value.category_description);
        formData.append('category_isActive', String(categoryToUpdate.value.category_isActive));
        if (categoryToUpdate.value.category_image) {
            formData.append('category_image', categoryToUpdate.value.category_image);
        }

        await $fetch(`${api}/api/categories/${categoryToUpdate.value.category_id}/`, {
            method: 'PATCH',
            body: formData,
            headers: getAuthHeaders(), // Only Authorization, NOT Content-Type
        });
        alert('Category updated successfully.');
        isUpdateVisible.value = false;
        categoryToUpdate.value = null;
        await refreshNuxtData();
    } catch (error) {
        alert('Failed to update category.');
        console.error('API error:', error.data || error);
    }
}


function showCategoryModal(category) {
    selectedCategory.value = category;
    isCategoryVisible.value = true;
}

function openUpdateModal(category) {
    console.log('Selected for update:', category);
    categoryToUpdate.value = category;
    isUpdateVisible.value = true;
}

function closeDeleteModal() {
    isDeleteVisible.value = false;
    categoryToDelete.value = null;
}

function toggleSelectAll(event) {
    if (event.target.checked) {
        selectedCategoryIds.value = categories.value.map(cat => cat.category_id);
    } else {
        selectedCategoryIds.value = [];
    }
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

// Sub-category logic (if needed)
const selectedMainCategory = ref('');
const selectedSubCategory = ref('');

const subCategories = {
    Fruits: ['Citrus', 'Berries', 'Tropical', 'Stone Fruits', 'Melons'],
    Vegetables: ['Root Vegetables', 'Leafy Greens', 'Cruciferous Vegetables', 'Nightshades'],
};

const availableSubCategories = computed(() => {
    return subCategories[selectedMainCategory.value] || [];
});

async function deleteSelectedCategories() {
    if (selectedCategoryIds.value.length === 0) {
        alert('No categories selected.');
        return;
    }
    if (!confirm(`Are you sure you want to delete ${selectedCategoryIds.value.length} categor${selectedCategoryIds.value.length === 1 ? 'y' : 'ies'}? This action cannot be undone.`)) {
        return;
    }
    try {
        for (const id of selectedCategoryIds.value) {
            await $fetch(`${api}/api/categories/${id}/`, {
                method: 'DELETE',
                headers: getAuthHeaders(), // Add Authorization header
            });
        }
        alert('Selected categories deleted successfully.');
        selectedCategoryIds.value = [];
        await refreshNuxtData();
    } catch (error) {
        alert('Failed to delete selected categories.');
        console.error('API error:', error.data || error);
    }
}
</script>

<template>
    <div class="bg-white w-full h-full absolute top-0 left-0 z-10 flex items-center justify-center" v-if="pending">

        <div role="status">
            <svg aria-hidden="true" class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor" />
                <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill" />
            </svg>
            <span class="sr-only">Loading...</span>
        </div>
    </div>
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
                <button @click="isAddVisible = true"
                    class="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">
                    <span class="mr-2">+</span> Add new category
                </button>
            </div>
            <CategoryAddModal :visible="isAddVisible" :category="newCategory" @submit="addCategory"
                @close="() => isAddVisible = false" />
        </div>
            <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div class="flex gap-2 flex-wrap">
                    <input type="text" v-model="searchQuery" placeholder="Search"
                        class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <select v-model="statusFilter"
                        class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Status</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Active">Active</option>
                    </select>

                </div>
            </div>
            <CategoryShowModal :visible="isCategoryVisible" :category="selectedCategory" @close="() => { isCategoryVisible = false; selectedCategory = null; }" />
        <div class="flex justify-end mb-4">
            <button class="px-4 py-2 rounded 
      transition 
      font-medium
      mb-4
      bg-red-600 text-white hover:bg-red-700
      disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                :disabled="selectedCategoryIds.length === 0" @click="deleteSelectedCategories">
                Delete {{ selectedCategoryIds.length }} item<span v-if="selectedCategoryIds.length !== 1">s</span>
            </button>
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
                                            <input id="checkbox-all" type="checkbox"
                                                :checked="selectedCategoryIds.length === categories.length && categories.length > 0"
                                                @change="toggleSelectAll"
                                                class="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600" />
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
                                <tr v-for="category in filteredCategories" :key="category.category_id"
                                    class="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                    @click.stop="showCategoryModal(category)">

                                    <td class="w-4 p-4">
                                        <div class="flex items-center">
                                            <input :id="`checkbox-${category.category_id}`" type="checkbox"
                                                :value="category.category_id" v-model="selectedCategoryIds" @click.stop
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
                                        {{ category.category_description }}
                                    </td>

                                    <td class="p-4 text-base font-medium whitespace-nowrap">
                                        <span :class="category.category_isActive
                                            ? 'text-green-600 font-semibold'
                                            : 'text-red-600 font-semibold'">
                                            {{ category.category_isActive ? 'Active' : 'Inactive' }}
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
                                            <button type="button" @click.stop="openDeleteModal(category)"
                                                class="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:ring-red-300 dark:focus:ring-red-900">
                                                <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fill-rule="evenodd"
                                                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                                        clip-rule="evenodd" />
                                                </svg>
                                                Delete category
                                            </button>
                                        </div>
                                    </td>

                                </tr>

                            </tbody>
                        </table>
                        <div id="updateModal" v-if="isUpdateVisible"
                            class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/30 ">
                            <div class="bg-white p-6 rounded shadow-lg max-w-xl w-full h-screen overflow-y-auto"
                                @click.stop>
                                <h2 class="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                                    Update Category</h2>

                                <form class="space-y-4" @submit.prevent="updateCategory">
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-gray-700 dark:text-gray-300">Category
                                                Name</label>
                                            <input type="text" v-model="categoryToUpdate.category_name"
                                                class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300 resize-none"
                                                :placeholder="categoryToUpdate?.category_name || 'Category Name'">
                                        </div>
                                    </div>
                                    <div>
                                        <label class="block mb-1 font-medium">Category
                                            Status</label>
                                        <select v-model="categoryToUpdate.category_isActive"
                                            class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none">
                                            <option disabled value="">Select Category Status
                                            </option>
                                            <option :value="false">Inactive</option>
                                            <option :value="true">Active</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-gray-700 dark:text-gray-300">Created
                                            At</label>
                                        <input type="text"
                                            class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300 resize-none"
                                            :placeholder="formatDate(categoryToUpdate?.created_at) || 'Created Date'"
                                            disabled>
                                    </div>
                                    <div>
                                        <label class="block text-gray-700 dark:text-gray-300">Category
                                            Description</label>
                                        <textarea
                                            class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300 resize-none"
                                            rows="4" v-model="categoryToUpdate.category_description"
                                            :placeholder="categoryToUpdate?.category_description || 'Category Description'"></textarea>
                                    </div>

                                    <div>
                                        <label class="block mb-1 font-medium">Category Image</label>
                                        <div
                                            class="w-full h-40 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                                            <svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor"
                                                stroke-width="2" viewBox="0 0 24 24">
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
                        <Footer />
                    </div>
                </div>
            </div>
        </div>
    </div>
    <CategoryDeleteModal
      :visible="isDeleteVisible"
      :category="categoryToDelete"
      @close="closeDeleteModal"
      @submit="refreshCategories"
    />
</template>
