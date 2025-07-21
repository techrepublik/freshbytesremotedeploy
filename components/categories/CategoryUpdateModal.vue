<script setup>
import { defineProps, defineEmits } from 'vue';

definePageMeta({
    layout: "home",
});
const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    category: {
        type: Object,
        default: () => null
    }
});
const emit = defineEmits(['submit', 'close']);

const config = useRuntimeConfig();
const api = config.public.API_LINK;

const getAuthHeaders = () => {
    const accessTokenCookie = useCookie('auth-access-token')
    const token = accessTokenCookie.value

    return token ? {
        Authorization: `Bearer ${token}`
    } : {}
}

async function updateCategory() {
    if (!props.category || !props.category.category_id) {
        alert('No category selected for update.');
        return;
    }
    try {
        const formData = new FormData();
        formData.append('category_name', props.category.category_name);
        formData.append('category_description', props.category.category_description);
        formData.append('category_isActive', String(props.category.category_isActive));
        if (props.category.category_image) {
            formData.append('category_image', props.category.category_image);
        }

        await $fetch(`${api}/api/categories/${props.category.category_id}/`, {
            method: 'PATCH',
            body: formData,
            headers: getAuthHeaders(), // Only Authorization, NOT Content-Type
        });
        alert('Category updated successfully.');
        emit('close');
        emit('submit');
    } catch (error) {
        alert('Failed to update category.');
        console.error('API error:', error.data || error);
    }
}

function closeModal() {
    emit('close');
}
</script>
<template>
    <div id="updateModal" v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/30 ">
        <div class="bg-white p-6 rounded shadow-lg max-w-xl w-full h-screen overflow-y-auto" @click.stop>
            <h2 class="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                Update Category</h2>

            <form class="space-y-4" @submit.prevent="updateCategory">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300">Category
                            Name</label>
                        <input type="text" v-model="category.category_name"
                            class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300 resize-none"
                            :placeholder="category?.category_name || 'Category Name'">
                    </div>
                </div>
                <div>
                    <label class="block mb-1 font-medium">Category
                        Status</label>
                    <select v-model="category.category_isActive"
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
                        :placeholder="formatDate(category?.created_at) || 'Created Date'" disabled>
                </div>
                <div>
                    <label class="block text-gray-700 dark:text-gray-300">Category
                        Description</label>
                    <textarea
                        class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300 resize-none"
                        rows="4" v-model="category.category_description"
                        :placeholder="category?.category_description || 'Category Description'"></textarea>
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

                <div class="flex justify-between mt-6">
                    <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Update
                        Category</button>
                    <button @click="closeModal"
                        class="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Close</button>
                </div>
            </form>
        </div>
    </div>
</template>
