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
        default: () => ({
            category_name: "",
            category_description: "",
            category_isActive: true,
            category_image: null,
            created_at: null,
            updated_at: null
        })
    }
});

const emit = defineEmits(['close']);

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
</script>

<template>
    <div id="showCategory" v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/30">

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto"
            @click.stop>
            <div class="flex flex-col gap-1 mb-4">

                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                    {{ category?.category_name }}
                </h2>
            </div>

            <div class="flex gap-4 mb-4">
                <div class="w-28 h-24 bg-gray-100 rounded flex items-center justify-center">
                    <img src="\assets\images\logos-12-12.png" alt="Product" class="object-contain h-20" />
                </div>
            </div>

            <form class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block mb-1 font-medium">Category Name</label>
                        <div
                            class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300">
                            {{ category?.category_name }}
                        </div>
                    </div>
                    <div>
                        <label class="block mb-1 font-medium">Category Status</label>
                        <div
                            class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300">
                            {{ category?.category_isActive ? 'Active' : 'Inactive' }}
                        </div>
                    </div>
                    <div>
                        <label class="block mb-1 font-medium">Category Description</label>
                        <textarea rows="3" disabled
                            class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300 resize-none">{{ category?.category_description }}</textarea>
                    </div>
                    <div class="col-span-2">
                        <h2 class="text-base font-semibold mb-2 text-gray-900 dark:text-white">Dates</h2>
                        <div class="grid grid-cols-2 gap-4"></div>
                        <div>
                            <label class="block mb-1 font-medium">Created at</label>
                            <textarea rows="3" disabled
                                class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300 resize-none">{{ formatDate(category?.created_at) }}</textarea>
                        </div>
                        <div>
                            <label class="block mb-1 font-medium">Updated at</label>
                            <textarea rows="3" disabled
                                class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300 resize-none">{{ formatDate(category?.updated_at) }}</textarea>
                        </div>
                    </div>
                </div>
                <div class="flex justify-end space-x-2 mt-6">
                    <button type="button" @click="$emit('close')"
                        class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>
