<script setup>
import { ref, watch, computed, toRefs } from 'vue'

const props = defineProps({
    showAddProductModal: { type: Boolean, required: true },
    newProduct: { type: Object, required: true },
    sellers: { type: Array, default: () => [] },
    users: { type: Array, default: () => [] },
    categories: { type: Array, default: () => [] },
    subcategories: { type: Array, default: () => [] }
});

const emit = defineEmits(['close-add-product-modal', 'add-product', 'update:productImages']);

// Local reactive data
const productImages = ref([]);
const productImagesPreview = ref([]);
const locationQuery = ref('');
const locationSuggestions = ref([]);
let debounceTimeout = null;

// Computed subcategories based on selected category
const filteredSubcategories = computed(() => {
    if (!props.newProduct.category_id) return [];
    return props.subcategories.filter(sub => sub.category_id === props.newProduct.category_id);
});

// Watch for category changes to reset subcategory
watch(() => props.newProduct.category_id, () => {
    props.newProduct.sub_category_id = null;
});

// Location search functionality
watch(locationQuery, (query) => {
    clearTimeout(debounceTimeout);
    if (!query) {
        locationSuggestions.value = [];
        return;
    }
    debounceTimeout = setTimeout(async () => {
        try {
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`;
            const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
            locationSuggestions.value = await res.json();
        } catch (error) {
            console.error('Location search error:', error);
            locationSuggestions.value = [];
        }
    }, 400);
});

// Location selection
function selectLocation(suggestion) {
    props.newProduct.product_location = suggestion.display_name;
    locationQuery.value = suggestion.display_name;
    locationSuggestions.value = [];
}

// Image handling functions
function onProductImagesChange(event) {
    const files = Array.from(event.target.files || []);
    handleProductImages(files);
}

function onProductImagesDrop(event) {
    const files = Array.from(event.dataTransfer.files || []);
    handleProductImages(files);
}

function handleProductImages(files) {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    // Add new files to existing ones
    productImages.value = [...productImages.value, ...imageFiles];
    
    // Create previews for new files
    imageFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            productImagesPreview.value.push(e.target.result);
        };
        reader.readAsDataURL(file);
    });
    
    // Emit updated files to parent
    emit('update:productImages', productImages.value);
}

function removeImage(index) {
    productImages.value.splice(index, 1);
    productImagesPreview.value.splice(index, 1);
    emit('update:productImages', productImages.value);
}

// Form submission
function onAdd() {
    // Validation
    if (!props.newProduct.product_name || !props.newProduct.sub_category_id || 
        !props.newProduct.product_price || !props.newProduct.quantity || 
        !props.newProduct.seller_id) {
        alert('Please fill all required fields.');
        return;
    }

    // Emit the add product event with files
    emit('add-product', productImages.value);
}

function closeAddProductModal() {
    // Reset form data
    productImages.value = [];
    productImagesPreview.value = [];
    locationQuery.value = '';
    locationSuggestions.value = [];
    
    emit('close-add-product-modal');
}

// Watch for modal close to reset data
watch(() => props.showAddProductModal, (newVal) => {
    if (!newVal) {
        productImages.value = [];
        productImagesPreview.value = [];
        locationQuery.value = '';
        locationSuggestions.value = [];
    }
});
</script>

<template>
    <div v-if="showAddProductModal" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/30">
        <div class="bg-white text-gray-900 rounded-lg shadow-lg w-full max-w-2xl p-8 relative h-screen overflow-y-auto">
            <button class="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
                @click="closeAddProductModal">&times;</button>
            <h2 class="text-2xl font-semibold mb-6">Add Product</h2>
            <form class="space-y-4" @submit.prevent="onAdd">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block mb-1 font-medium">Seller Name *</label>
                        <select class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none"
                            v-model="newProduct.seller_id" required>
                            <option disabled value="">Select seller</option>
                            <option v-for="seller in sellers" :key="seller.seller_id" :value="seller.seller_id">
                                {{users.find(u => u.user_id === seller.user_id)?.user_name || 'Unknown'}}
                            </option>
                        </select>
                    </div>
                    <div>
                        <label class="block mb-1 font-medium">Product Name *</label>
                        <input type="text"
                            class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none"
                            placeholder="Type product name" v-model="newProduct.product_name" required />
                    </div>
                    <div>
                        <label class="block mb-1 font-medium">Category *</label>
                        <select class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none"
                            v-model="newProduct.category_id" required>
                            <option disabled value="">Select category</option>
                            <option v-for="category in categories" :key="category.category_id" :value="category.category_id">
                                {{ category.category_name }}
                            </option>
                        </select>
                    </div>
                    <div>
                        <label class="block mb-1 font-medium">Sub-Category *</label>
                        <select class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none"
                            v-model="newProduct.sub_category_id" :disabled="!newProduct.category_id" required>
                            <option disabled value="">Select sub-category</option>
                            <option v-for="sub in filteredSubcategories" :key="sub.sub_category_id"
                                :value="sub.sub_category_id">
                                {{ sub.sub_category_name }}
                            </option>
                        </select>
                    </div>
                    <div>
                        <label class="block mb-1 font-medium">Price *</label>
                        <div class="relative">
                            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
                            <input type="number"
                                class="w-full pl-8 px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none"
                                placeholder="0.00" v-model="newProduct.product_price" min="0.01" step="0.01" required />
                        </div>
                    </div>
                    <div>
                        <label class="block mb-1 font-medium">Product Status *</label>
                        <select class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none"
                            v-model="newProduct.product_status" required>
                            <option disabled value="">Select status</option>
                            <option value="FRESH">Fresh</option>
                            <option value="SLIGHTLY_WITHERED">Slightly Withered</option>
                            <option value="ROTTEN">Rotten</option>
                        </select>
                    </div>
                    <div>
                        <label class="block mb-1 font-medium">Product Location</label>
                        <div class="relative">
                            <input
                                type="text"
                                class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none"
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
                        <label class="block mb-1 font-medium">Quantity *</label>
                        <input type="number"
                            class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none"
                            placeholder="0" v-model="newProduct.quantity" min="0" required />
                    </div>
                    <div>
                        <label class="block mb-1 font-medium">Posted Date & Time</label>
                        <input type="datetime-local"
                            class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none"
                            v-model="newProduct.post_date" />
                    </div>
                    <div>
                        <label class="block mb-1 font-medium">Harvest Date & Time</label>
                        <input type="datetime-local"
                            class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none"
                            v-model="newProduct.harvest_date" />
                    </div>
                </div>
                <div>
                    <label class="block mb-1 font-medium">Brief Description</label>
                    <textarea class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none"
                        rows="3" placeholder="Write product description here"
                        v-model="newProduct.product_brief_description"></textarea>
                </div>
                <div>
                    <label class="block mb-1 font-medium">Detailed Description</label>
                    <textarea class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none"
                        rows="3" placeholder="Write product description here"
                        v-model="newProduct.product_full_description"></textarea>
                </div>
                <div>
                    <label class="block mb-1 font-medium">Product Images</label>
                    <div
                        :class="[
                        'w-full h-40 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center bg-gray-50 cursor-pointer transition relative',
                        productImagesPreview.length ? 'overflow-x-auto' : 'text-gray-400'
                        ]"
                        @click="$refs.productImagesInput.click()"
                        @dragover.prevent
                        @drop.prevent="onProductImagesDrop"
                    >
                        <template v-if="!productImagesPreview.length">
                        <svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path d="M12 4v16m8-8H4" />
                        </svg>
                        <span class="font-semibold">Click to upload</span> or drag and drop
                        <div class="text-xs mt-1">SVG, PNG, JPG or GIF (MAX. 800×400px)</div>
                        </template>
                        <template v-else>
                        <div class="flex flex-wrap gap-2 justify-center items-center w-full h-full">
                            <div
                            v-for="(img, idx) in productImagesPreview"
                            :key="idx"
                            class="relative w-20 h-20 rounded overflow-hidden border bg-white flex items-center justify-center"
                            >
                            <img :src="img" class="object-cover w-full h-full" />
                            <button
                                type="button"
                                class="absolute top-0 right-0 bg-white bg-opacity-80 hover:bg-red-500 hover:text-white text-gray-700 rounded-full w-6 h-6 flex items-center justify-center text-xs"
                                @click.stop="removeImage(idx)"
                                title="Remove image"
                            >
                                &times;
                            </button>
                            </div>
                        </div>
                        <span class="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-gray-500">
                            Images uploaded ({{ productImagesPreview.length }})
                        </span>
                        </template>
                        <input
                        ref="productImagesInput"
                        type="file"
                        accept="image/*"
                        multiple
                        class="hidden"
                        @change="onProductImagesChange"
                        />
                    </div>
                </div>
                <div class="flex justify-end space-x-2 mt-6">
                    <button type="submit" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                        :disabled="!newProduct.product_name || !newProduct.sub_category_id || !newProduct.product_price || !newProduct.quantity || !newProduct.seller_id">
                        Add Product
                    </button>
                    <button type="button" class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
                        @click="closeAddProductModal">Cancel</button>
                </div>
            </form>
        </div>
    </div>
</template>