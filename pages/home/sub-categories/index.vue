<script setup>
import { ref, computed } from 'vue'
definePageMeta({
    layout: "home",
})

const config = useRuntimeConfig()
const api = config.public.API_LINK



const { data: categories, pending: pendingCategories } = useFetch(`${api}api/categories/`, { server: false });
const { data: subcategories, pending: pendingSubcategories } = useFetch(`${api}api/subcategories/`, { server: false });

const loading = computed(() => pendingProducts.value || pendingCategories.value || pendingSubcategories.value);

const newSubCategory = ref({
    sub_category_name: "",
    sub_category_description: "",
    category_image: null,
    created_at: null,
    updated_at: null,
    category_id: ""
});

// Reactive variables
const selectedSubCategory = ref('')
const searchQuery = ref('');
const filteredSubcategories = computed(() => {
    let list = subcategories.value || [];
    if (searchQuery.value) {
        list = list.filter(sub =>
            sub.sub_category_name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            sub.sub_category_description?.toLowerCase().includes(searchQuery.value.toLowerCase())
        );
    }
    if (selectedCategory.value) {
        list = list.filter(sub => sub.category_id == selectedCategory.value);
    }
    return list;
});
const selectedCategory = ref('');
// Sub-category map
const subCategories = {
    Fruits: ['Citrus', 'Berries', 'Tropical', 'Stone Fruits', 'Melons'],
}

const isSubCategoryVisible = ref(false);
const isUpdateVisible = ref(false);
const subcategoryToUpdate = ref(null);

const isDeleteVisible = ref(false);
const subcategoryToDelete = ref(null);
const selectedSubCategoryIds = ref([]);

async function addSubCategory() {
    console.log(newSubCategory.value)
    // if (
    //     !newCategory.value.category_name ||
    //     !newCategory.value.category_description
    // ) {
    //     alert('Please fill all required fields.');
    //     return;
    // }

    try {
        await $fetch(`${api}api/subcategories/`, {
            method: 'POST',
            body: newSubCategory.value,
        });
        alert("Data added successfully")
        closeAddSubCategoryModal();
        resetNewSubCategory();
        Object.keys(newSubCategory.value).forEach(key => newSubCategory.value[key] = null);
        await refreshNuxtData();
    } catch (error) {
        alert('Failed to add category.');
        console.error('API error:', error.data || error);
    }
}

async function deleteSubCategory() {
    console.log('Deleting:', subcategoryToDelete.value);
    if (!subcategoryToDelete.value || !subcategoryToDelete.value.sub_category_id) {
        alert('No category selected for deletion.');
        return;
    }
    try {
        await $fetch(`${api}api/subcategories/${subcategoryToDelete.value.sub_category_id}/`, {
            method: 'DELETE',
        });
        alert('Category deleted successfully.');
        isDeleteVisible.value = false;
        subcategoryToDelete.value = null;
        await refreshNuxtData();
    } catch (error) {
        alert('Failed to delete category.');
        console.error('API error:', error.data || error);
    }
}
async function updateSubCategory() {
    if (!subcategoryToUpdate.value || !subcategoryToUpdate.value.sub_category_id) {
        alert('No category selected for update.');
        return;
    }
    try {
        await $fetch(`${api}api/subcategories/${subcategoryToUpdate.value.sub_category_id}/`, {
            method: 'PATCH', // or 'PATCH' if your API supports partial updates
            body: subcategoryToUpdate.value,
        });
        alert('Category updated successfully.');
        isUpdateVisible.value = false;
        subcategoryToUpdate.value = null;
        await refreshNuxtData();
    } catch (error) {
        alert('Failed to update category.');
        console.error('API error:', error.data || error);
    }
}
function resetNewSubCategory() {
    newSubCategory.value = {
        sub_category_name: "",
        sub_category_description: "",
        category_image: null,
        created_at: null,
        updated_at: null
    };
}

function closeAddSubCategoryModal() {
    resetNewSubCategory();
    document.getElementById('addSubCategory')?.classList.add('hidden');
}
// Computed options based on selected category
const availableSubCategories = computed(() => {
    return subCategories[selectedCategory.value] || []
})

function showCategoryModal(subcategory) {
    selectedSubCategory.value = subcategory
    isSubCategoryVisible.value = true
}

function openUpdateModal(subcategory) {
    subcategoryToUpdate.value = subcategory
    isUpdateVisible.value = true
}

function closeUpdateModal() {
    isUpdateVisible.value = false
    productToUpdate.value = null
}
function openDeleteModal(subcategory) {
    subcategoryToDelete.value = subcategory
    isDeleteVisible.value = true
}

function closeDeleteModal() {
    isDeleteVisible.value = false
    subcategoryToDelete.value = null
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
function toggleSelectAll(event) {
    if (event.target.checked) {
        selectedSubCategoryIds.value = subcategories.value.map(sub => sub.sub_category_id);
    } else {
        selectedSubCategoryIds.value = [];
    }
}
async function deleteSelectedCategories() {
    if (selectedSubCategoryIds.value.length === 0) {
        alert('No categories selected.');
        return;
    }
    if (!confirm(`Are you sure you want to delete ${selectedSubCategoryIds.value.length} categor${selectedSubCategoryIds.value.length === 1 ? 'y' : 'ies'}? This action cannot be undone.`)) {
        return;
    }
    try {
        for (const id of selectedSubCategoryIds.value) {
            await $fetch(`${api}api/subcategories/${id}/`, {
                method: 'DELETE',
            });
        }
        alert('Selected subcategories deleted successfully.');
        selectedSubCategoryIds.value = [];
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
                            class="ms-1 text-sm font-medium text-gray-800 hover:text-green-800 md:ms-2 dark:text-gray-400 dark:hover:text-white">Sub-Categories</a>
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
                        Sub-Categories</a>
                </div>
            </ol>
        </nav>
        <div class="flex justify-between items-center mt-3">
            <h1 class="text-2xl font-semibold text-black-900 dark:text-white-900">
                Sub-Categories
            </h1>
            <div class="flex items-center space-x-2">
                <button type="button" onclick="document.getElementById('addSubCategory').classList.remove('hidden')"
                    class="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">
                    <span class="mr-2">+</span> Add new sub-category
                </button>
            </div>
        </div>

        <div id="addSubCategory" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/30 hidden">
            <div
                class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto">

                <h2 class="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                    Add Sub-Category</h2>
                <form class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block mb-1 font-medium">Sub-Category
                                Name</label>
                            <input type="text" v-model="newSubCategory.sub_category_name"
                                class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none"
                                placeholder="Type sub-category name" />
                        </div>
                        <div>
                            <label class="block text-gray-700 dark:text-gray-300">Category</label>
                            <select v-model="newSubCategory.category_id"
                               class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300 resize-none">
                                <option disabled value="">Select Category</option>
                                <option v-for="cat in categories" :key="cat.category_id" :value="cat.category_id">
                                    {{ cat.category_name }}
                                </option>
                            </select>
                        </div>
                        <div>
                            <label class="block mb-1 font-medium">Sub-Category Description</label>
                            <textarea v-model="newSubCategory.sub_category_description"
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
                            <span class="font-semibold">Click to upload</span> or
                            drag and drop
                            <div class="text-xs mt-1">SVG, PNG, JPG or GIF (MAX.
                                800×400px)</div>
                        </div>
                    </div>
                    <div class="flex justify-end space-x-2 mt-6">
                        <button type="button" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                            @click="addSubCategory">Add
                            subcategory</button>
                        <button type="button"
                            onclick="document.getElementById('addSubCategory').classList.add('hidden')"
                            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
        <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div class="flex gap-2 flex-wrap">
                <input type="text" v-model="searchQuery" placeholder="Search"
                    class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />

                <select v-model="selectedCategory"
                    class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select Category</option>
                    <option v-for="cat in categories" :key="cat.category_id" :value="cat.category_id">
                        {{ cat.category_name }}
                    </option>
                </select>
            </div>
        </div>
        <div class="flex justify-end mb-4">
            <button class="px-4 py-2 rounded 
      transition 
      font-medium
      mb-4
      bg-red-600 text-white hover:bg-red-700
      disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                :disabled="selectedSubCategoryIds.length === 0" @click="deleteSelectedCategories">
                Delete {{ selectedSubCategoryIds.length }} item<span v-if="selectedSubCategoryIds.length !== 1">s</span>
            </button>
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
                                            <input id="checkbox-all" type="checkbox"
                                                :checked="selectedSubCategoryIds.length === subcategories.length && subcategories.length > 0"
                                                @change="toggleSelectAll"
                                                class="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600" />
                                            <label for="checkbox-all" class="sr-only">checkbox</label>
                                        </div>
                                    </th>
                                    <th scope="col"
                                        class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                        Category ID
                                    </th>
                                    <th scope="col"
                                        class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                        Sub-Category ID
                                    </th>
                                    <th scope="col"
                                        class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                        Sub-Category
                                    </th>
                                    <th scope="col"
                                        class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                        Description
                                    </th>
                                    <th scope="col"
                                        class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                        Created at
                                    </th>

                                    <th scope="col"
                                        class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                        Updated at
                                    </th>
                                    <th scope="col"
                                        class="p-4 text-xs font-medium text-center text-gray-500 uppercase dark:text-gray-400">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                <tr v-for="subcategory in filteredSubcategories" :key="subcategory.sub_category_id"
                                    class="hover:bg-gray-100 dark:hover:bg-gray-700"
                                    @click="showCategoryModal(subcategory)">

                                    <td class="w-4 p-4">
                                        <div class="flex items-center">
                                            <input :id="`checkbox-${subcategory.sub_category_id}`" type="checkbox"
                                                :value="subcategory.sub_category_id" v-model="selectedSubCategoryIds"
                                                @click.stop
                                                class="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600" />
                                            <label :for="`checkbox-${subcategory.sub_category_id}`"
                                                class="sr-only">checkbox</label>
                                        </div>
                                    </td>
                                    <td
                                        class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {{ subcategory.category_id }}
                                    </td>
                                    <td
                                        class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {{ subcategory.sub_category_id }}
                                    </td>
                                    <td
                                        class="p-4 text-sm font-semibold text-gray-900 whitespace-nowrap dark:text-white">
                                        {{ subcategory.sub_category_name }}
                                    </td>

                                    <td
                                        class="p-4 text-base font-normal text-gray-900 whitespace-nowrap dark:text-gray-400">
                                        {{ subcategory.sub_category_description }}
                                    </td>
                                    <td
                                        class="p-4 text-sm font-semibold text-gray-900 whitespace-nowrap dark:text-white">
                                        {{ formatDate(subcategory.created_at) }}
                                    </td>
                                    <td
                                        class="p-4 text-sm font-semibold text-gray-900 whitespace-nowrap dark:text-white">
                                        {{ formatDate(subcategory.updated_at) }}
                                    </td>


                                    <td class="p-4 space-x-2 whitespace-nowrap">
                                        <div class="flex justify-center space-x-2">
                                            <button type="button" @click.stop="openUpdateModal(subcategory)"
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
                                            <div id="showCategory" v-if="isSubCategoryVisible"
                                                class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/30">

                                                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto"
                                                    @click.stop>
                                                    <div class="flex flex-col gap-1 mb-4">
                                                        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{
                                                            selectedSubCategory?.sub_category_name }}</h2>
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
                                                                <label class="block mb-1 font-medium">Sub-Category
                                                                    Name</label>
                                                                <div
                                                                    class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300">
                                                                    {{ selectedSubCategory?.sub_category_name }}
                                                                </div>
                                                            </div>
                                                            <div class="col-span-2">
                                                                <label
                                                                    class="block mt-2 mb-1 font-medium">Description</label>
                                                                <textarea rows="3" disabled
                                                                    class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300 resize-none">{{ selectedSubCategory?.sub_category_description }}</textarea>
                                                            </div>
                                                            <div class="col-span-2">
                                                                <h2
                                                                    class="text-base font-semibold mb-2 text-gray-900 dark:text-white">
                                                                    Dates</h2>
                                                                <div class="grid grid-cols-2 gap-4">
                                                                    <div>
                                                                        <label class="block mb-1 font-medium">Created
                                                                            at</label>
                                                                        <textarea rows="3" disabled
                                                                            class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300 resize-none">{{ formatDate(selectedSubCategory?.created_at) }}</textarea>
                                                                    </div>
                                                                    <div>
                                                                        <label class="block mb-1 font-medium">Updated
                                                                            at</label>
                                                                        <textarea rows="3" disabled
                                                                            class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300 resize-none">{{ formatDate(selectedSubCategory?.updated_at) }}</textarea>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="flex justify-end space-x-2 mt-6">
                                                            <button type="button"
                                                                @click="isSubCategoryVisible = false; selectedSubCategory = null"
                                                                class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                                                                Cancel
                                                            </button>
                                                        </div>

                                                    </form>
                                                </div>
                                            </div>

                                            <button type="button" @click.stop="openDeleteModal(subcategory)"
                                                class="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:ring-red-300 dark:focus:ring-red-900">
                                                <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fill-rule="evenodd"
                                                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                                        clip-rule="evenodd" />
                                                </svg>
                                                Delete sub-category
                                            </button>
                                        </div>
                                    </td>

                                </tr>

                            </tbody>
                        </table>
                        <div v-if="isDeleteVisible" id="deleteModal"
                            class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/30">
                            <div @click.stop class="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md shadow-lg">
                                <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                                    Confirm Deletion</h2>
                                <p class="text-gray-600 dark:text-gray-300 mb-6">Are you sure you
                                    want to delete this category?<br>
                                    This action cannot be undone.</p>
                                <div class="flex justify-end gap-2">
                                    <button @click="isDeleteVisible = false; subcategoryToDelete = null"
                                        class="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                                        Cancel
                                    </button>
                                    <button @click="deleteSubCategory"
                                        class="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700">
                                        Yes, delete
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div id="updateModal" v-if="isUpdateVisible"
                            class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/30">
                            <div @click.stop class="bg-white p-6 rounded shadow-lg max-w-xl w-full">
                                <h2 class="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                                    Update Sub-Category</h2>

                                <form class="space-y-4" @submit.prevent="updateSubCategory">
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-gray-700 dark:text-gray-300">Sub-Category
                                                Name</label>
                                            <input type="text" v-model="subcategoryToUpdate.sub_category_name"
                                                class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300 resize-none"
                                                :placeholder="subcategoryToUpdate?.sub_category_name || 'Sub-Category Name'">
                                        </div>
                                    </div>

                                    <div>
                                        <label class="block text-gray-700 dark:text-gray-300">Created
                                            At</label>
                                        <input type="text"
                                            class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300 resize-none"
                                            :placeholder="formatDate(subcategoryToUpdate?.created_at) || 'Created Date'"
                                            disabled>
                                    </div>
                                    <div>
                                        <label class="block text-gray-700 dark:text-gray-300">Category
                                            Description</label>
                                        <textarea
                                            class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300 resize-none"
                                            rows="4" v-model="subcategoryToUpdate.sub_category_description"
                                            :placeholder="subcategoryToUpdate?.sub_category_description || 'Sub-Category Description'"></textarea>
                                    </div>

                                    <div>
                                        <label class="block mb-1 font-medium">Sub-Category Image</label>
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
                                            Sub-Category</button>
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