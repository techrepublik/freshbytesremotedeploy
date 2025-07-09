<script setup>
    import { ref, watch } from 'vue'

    const props = defineProps({
        showUpdateModal: { type: Boolean, required: true },
        productToUpdate: { type: Object, default: () => null },
        categories: { type: Array, default: () => [] },
        subcategories: { type: Array, default: () => [] }
    });
    const { showUpdateModal, productToUpdate, categories, subcategories } = toRefs(props);

    const emit = defineEmits(['close-update-modal','updated']);
    
    const config = useRuntimeConfig();
    const api = config.public.API_LINK; // API HERE

    // Make a local editable copy of the product
    const editedProduct = ref(productToUpdate.value ? { ...productToUpdate.value } : {});
    // Computed subcategories based on selected category
    const filteredSubcategories = computed(() => {
        return subcategories.value.filter(sub => sub.category_id === editedProduct.value.category_id);
    });
    watch(productToUpdate, (newVal) => {
        editedProduct.value = newVal ? { ...newVal } : {};
        // Format dates for datetime-local input
        if (editedProduct.value.post_date) {
            // remove seconds and timezone
            editedProduct.value.post_date = editedProduct.value.post_date.slice(0,16);
        }
        if (editedProduct.value.harvest_date) {
            editedProduct.value.harvest_date = editedProduct.value.harvest_date.slice(0,16);
        }
    });

    function closeModal() {
        emit('close-update-modal');
    }

    async function updateProduct() {
        console.log('Updating product:', editedProduct.value);
        try {
            await $fetch(`${api}/products/${editedProduct.value.product_id}/`, {
            method: 'PATCH',
            body: editedProduct.value
            });
            emit('updated');
            closeModal();
        } catch (error) {
            alert('Failed to update product.');
            console.error(error);
        }
    }

    const locationQuery = ref(editedProduct.value.product_location || '')
    const locationSuggestions = ref([])
    let debounceTimeout = null

    // Keep input in sync with editedProduct
    watch(() => editedProduct.value.product_location, (val) => {
        if (val !== locationQuery.value) locationQuery.value = val || ''
    })

    // Debounced search for location suggestions
    watch(locationQuery, (query) => {
        clearTimeout(debounceTimeout)
        if (!query) {
            locationSuggestions.value = []
            return
        }
        debounceTimeout = setTimeout(async () => {
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
            const res = await fetch(url, { headers: { 'Accept-Language': 'en' } })
            locationSuggestions.value = await res.json()
        }, 400)
    })

    // When a suggestion is clicked
    function selectLocation(suggestion) {
        editedProduct.value.product_location = suggestion.display_name
        locationQuery.value = suggestion.display_name
        locationSuggestions.value = []
    }
</script>

<template>
    <div v-if="showUpdateModal && editedProduct"
     class="fixed inset-0 z-60 flex items-center justify-center bg-gray-800/30"
     @click.self="closeModal">
        <div
        class="bg-white text-gray-900 rounded-lg shadow-lg w-full max-w-2xl p-8 relative h-screen overflow-y-auto"
        @click.stop
    >
            <button class="absolute top-6 right-6 text-gray-400 hover:text-gray-700 text-2xl"
                @click.stop="closeModal" aria-label="Close">&times;</button>
            <h2 class="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Update Product</h2>
            <form class="space-y-4" @submit.prevent="updateProduct">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block mb-1 font-medium dark:text-gray-300">Product
                            Name</label>
                        <input type="text" class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 dark:bg-gray-700 dark:text-white" v-model="editedProduct.product_name">
                    </div>
                    <div>
                        <label class="block mb-1 font-medium dark:text-gray-300">Category</label>
                        <select v-model="editedProduct.category_id" class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 dark:bg-gray-700 dark:text-white">
                            <option disabled value="">Select category</option>
                            <option v-for="cat in categories" :key="cat.category_id" :value="cat.category_id">
                                {{ cat.category_name }}
                            </option>
                        </select>
                    </div>
                    <!-- Sub-Category -->
                    <div>
                        <label class="block mb-1 font-medium dark:text-gray-300">Sub-Category</label>
                        <select v-model="editedProduct.sub_category_id" :disabled="!editedProduct.category_id" class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 dark:bg-gray-700 dark:text-white">
                            <option disabled value="">Select sub-category</option>
                            <option v-for="sub in subcategories" :key="sub.sub_category_id" :value="sub.sub_category_id">
                                {{ sub.sub_category_name }}
                            </option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300">Current Price</label>
                        <div class="relative">
                            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
                            <input
                                type="number"
                                class="w-full pl-8 px-3 py-2 rounded bg-gray-100 border border-gray-300 dark:bg-gray-700 dark:text-white"
                                v-model="editedProduct.product_price"
                                min="0"
                                step="0.01"
                            >
                        </div>
                    </div>
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300">Discounted Price</label>
                        <div class="relative">
                            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
                            <input
                                type="number"
                                class="w-full pl-8 px-3 py-2 rounded bg-gray-100 border border-gray-300 dark:bg-gray-700 dark:text-white"
                                v-model="editedProduct.product_discountedPrice"
                                min="0"
                                step="0.01"
                            >
                        </div>
                    </div>
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300">Product
                            Status</label>
                        <select class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 dark:bg-gray-700 dark:text-white"
                            placeholder="Select Product Status" v-model="editedProduct.product_status">
                            <option value="FRESH">Fresh</option>
                            <option value="SLIGHTLY_WITHERED">Slightly Withered</option>
                            <option value="ROTTEN">Rotten</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300">Product Location</label>
                        <div class="relative">
                            <input
                                type="text"
                                class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 dark:bg-gray-700 dark:text-white"
                                placeholder="Type your Product Location"
                                v-model="locationQuery"
                                autocomplete="off"
                            />
                            <ul v-if="locationSuggestions.length"
                                class="absolute bg-white border border-gray-300 rounded shadow mt-1 z-50 w-full max-h-48 overflow-auto">
                                <li v-for="suggestion in locationSuggestions"
                                    :key="suggestion.place_id || suggestion.osm_id"
                                    @click="selectLocation(suggestion)"
                                    class="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                >
                                    {{ suggestion.display_name }}
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300">Quantity</label>
                        <input type="number" class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 dark:bg-gray-700 dark:text-white" v-model="editedProduct.quantity">
                    </div>
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300">Posted
                            Date</label>
                        <input type="datetime-local" class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 dark:bg-gray-700 dark:text-white" v-model="editedProduct.post_date">
                    </div>
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300">Harvest
                            Date</label>
                        <input type="datetime-local" class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 dark:bg-gray-700 dark:text-white" v-model="editedProduct.harvest_date">
                    </div>
                </div>

                <div>
                    <label class="block text-gray-700 dark:text-gray-300">Brief
                        Description</label>
                    <textarea class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 dark:bg-gray-700 dark:text-white" v-model="editedProduct.product_brief_description"
                        rows="4"></textarea>
                </div>
                <div>
                    <label class="block text-gray-700 dark:text-gray-300">Detailed
                        Description</label>
                    <textarea class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 dark:bg-gray-700 dark:text-white" v-model="editedProduct.product_full_description"
                        rows="4"></textarea>
                </div>

                <div>
                    <label class="block text-gray-700 dark:text-gray-300 mb-2">Product
                        Images</label>
                    <div class="flex space-x-4">
                        <div class="relative">
                            <img src="\assets\images\logos-12-12.png" class="w-24 h-24 object-cover rounded border"
                                alt="Product">
                            <button class="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1">🗑</button>
                        </div>
                        <div class="relative">
                            <img src="\assets\images\logos-12-12.png" class="w-24 h-24 object-cover rounded border"
                                alt="Product">
                            <button class="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1">🗑</button>
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
                    <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Update
                        Product</button>
                    <button type="button" @click.stop="closeModal"
                        class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>