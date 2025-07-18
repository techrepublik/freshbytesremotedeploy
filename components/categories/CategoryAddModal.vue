
<script setup>
import { ref, computed, defineProps, defineEmits, watch } from 'vue';

definePageMeta({
    layout: "home",
});

const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    }
});

const emit = defineEmits(['submit', 'close']);

const config = useRuntimeConfig();
const api = config.public.API_LINK;

const accessToken = ref('');
const getAuthHeaders = () => {
    const accessTokenCookie = useCookie('auth-access-token')
    const token = accessTokenCookie.value

    return token ? {
        Authorization: `Bearer ${token}`
    } : {}
}

const newCategory = ref({
    category_name: "",
    category_description: "",
    category_isActive: true,
    category_image: null,
    created_at: null,
    updated_at: null
});

watch(() => props.visible, (newVal) => {
    if (newVal) {
        resetNewCategory();
    }
});

async function addCategory() {
  try {
    const formData = new FormData();
    formData.append('category_name', newCategory.value.category_name);
    formData.append('category_description', newCategory.value.category_description);
    formData.append('category_isActive', String(newCategory.value.category_isActive));
    if (newCategory.value.category_image) {
      formData.append('category_image', newCategory.value.category_image);
    }

    await $fetch(`${api}/api/categories/`, {
      method: 'POST',
      body: formData,
      headers: getAuthHeaders(), // Only Authorization, NOT Content-Type
    });
    alert("Data added successfully");
    emit('close');
    resetNewCategory();
    await refreshNuxtData();
  } catch (error) {
    alert('Failed to add category.');
    console.error('API error:', error.data || error);}
}

function resetNewCategory() {
    newCategory.value = {
        category_name: "",
        category_description: "",
        category_isActive: true,
        category_image: null,
        created_at: null,
        updated_at: null
    };
}
</script>
<template>
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/30">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto">

            <h2 class="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Add Category</h2>
            <form class="space-y-4" @submit.prevent="addCategory">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block mb-1 font-medium">Category Name</label>
                        <input v-model="newCategory.category_name" type="text"
                            class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none"
                            placeholder="Type product name" />
                    </div>
                    <div>
                        <label class="block mb-1 font-medium">Category Status</label>
                        <select v-model="newCategory.category_isActive"
                            class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none">
                            <option disabled value="">Select Category Status</option>
                            <option :value="false">Inactive</option>
                            <option :value="true">Active</option>
                        </select>
                    </div>
                    <div>
                        <label class="block mb-1 font-medium">Category Description</label>
                        <textarea v-model="newCategory.category_description"
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
                    <input type="file" accept="image/*" @change="e => newCategory.category_image = e.target.files[0]"
                        class="mt-2" />
                </div>
                <div class="flex justify-end space-x-2 mt-6">
                    <button type="submit" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
                        Add category
                    </button>
                    <button type="button" @click="$emit('close')"
                        class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>
