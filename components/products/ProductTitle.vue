<script setup>
import { ref, computed } from 'vue'

// Props
const props = defineProps({
    products: {
        type: Array,
        default: () => []
    },
    title: {
        type: String,
        default: 'FreshBytes Products'
    },
    showAddButton: {
        type: Boolean,
        default: true
    }
})

// Emits
const emit = defineEmits(['add-product'])

// Reactive data
const showTooltip = ref(false)

// Computed properties
const productCount = computed(() => props.products ? props.products.length : 0)
const resultText = computed(() => {
    const count = productCount.value
    if (count === 0) {
        return 'Showing 0-0 of 0 results'
    }
    return `Showing 1-${count} of ${count} results`
})

// Methods
function openAddProductModal() {
    emit('add-product')
}
</script>

<template>
    <div class="flex items-center justify-between mt-4 mb-4">
        <div class="relative inline-block">
            <span
                class="inline-flex items-center font-semibold text-2xl cursor-pointer"
                @mouseenter="showTooltip = true"
                @mouseleave="showTooltip = false"
            >
                {{ title }}
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
                {{ resultText }}
            </div>
        </div>
        <div v-if="showAddButton" class="flex items-center space-x-2">
            <button
                class="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
                @click="openAddProductModal"
            >
                <span class="mr-2">+</span> Add new product
            </button>
        </div>
    </div>
</template>