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
    subcategory: {
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

async function deleteSubCategory() {
    if (!props.subcategory || !props.subcategory.category_id) {
        alert('No category selected for deletion.');
        return;
    }
    try {
        await $fetch(`${api}/api/subcategories/${props.subcategory.sub_category_id}/`, {
            method: 'DELETE',
            headers: getAuthHeaders(), // Add Authorization header
        });
        alert('SubCategory deleted successfully.');
        emit('close');
        emit('submit');
        await refreshNuxtData();
    } catch (error) {
        alert('Failed to delete category.');
        console.error('API error:', error.data || error);
    }
}
</script>
<template>
    <div v-if="visible" id="deleteModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/30">
        <div @click.stop class="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md shadow-lg">
            <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Confirm Deletion
            </h2>
            <p class="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to delete this category?<br>
                This action cannot be undone.
            </p>
            <div class="flex justify-end gap-2">
                <button @click="$emit('close')"
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
</template>
