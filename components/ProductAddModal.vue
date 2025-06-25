<script setup>
    defineProps({
        showAddProductModal: {
            type: Boolean,
            required: true
        },
        newProduct: {
            type: Object,
            required: true
        },
        sellers: {
            type: Array,
            required: true
        },
        subcategories: {
            type: Array,
            required: true
        },
        users: {
            type: Array,
            required: true
        },
        categories: {
            type: Array,
            required: true
        }
    })

    // grab the emit helper
    const emit = defineEmits(['closeAddProductModal','addProduct'])

    // wrap the emit so the template can call it
    function onAdd() {
        emit('addProduct')
    }

    function closeAddProductModal() {
        emit('closeAddProductModal')
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
    <div v-if="showAddProductModal" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/30">
        <div class="bg-white text-gray-900 rounded-lg shadow-lg w-full max-w-2xl p-8 relative h-screen overflow-y-auto">
            <button class="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
                @click="closeAddProductModal">&times;</button>
            <h2 class="text-2xl font-semibold mb-6">Add Product</h2>
            <form class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block mb-1 font-medium">Seller Name</label>
                        <select class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none"
                            v-model="newProduct.seller_id" required>
                            <option disabled value="">Select seller</option>
                            <option v-for="seller in sellers" :key="seller.seller_id" :value="seller.seller_id">
                                {{users.find(u => u.user_id === seller.user_id)?.user_name || 'Unknown'}}
                            </option>
                        </select>
                    </div>
                    <div>
                        <label class="block mb-1 font-medium">Product Name</label>
                        <input type="text"
                            class="w-full px-3 py-2 rounded   focus:outline-none"
                            placeholder="Type product name" v-model="newProduct.product_name" />
                    </div>
                    <div>
                        <label class="block mb-1 font-medium">Category</label>
                        <select class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none"
                            v-model="newProduct.category_id">
                            <option disabled value="">Select category</option>
                            <option v-for="cat in categories" :key="cat.category_id" :value="cat.category_id">
                                {{ cat.category_name }}
                            </option>
                        </select>
                    </div>
                    <div>
                        <label class="block mb-1 font-medium">Sub-Category</label>
                        <select class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none"
                            v-model="newProduct.sub_category_id">
                            <option disabled value="">Select sub-category</option>
                            <option v-for="sub in subcategories" :key="sub.sub_category_id"
                                :value="sub.sub_category_id">
                                {{ sub.sub_category_name }}
                            </option>
                        </select>
                    </div>
                    <div>
                        <label class="block mb-1 font-medium">Price</label>
                        <input type="number"
                            class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none"
                            placeholder="₱0.00" v-model="newProduct.product_price" />
                    </div>
                    <div>
                        <label class="block mb-1 font-medium">Discounted Price</label>
                        <input type="number"
                            class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none"
                            placeholder="₱0.00" v-model="newProduct.product_discountedPrice" />
                    </div>
                    <div>
                        <label class="block mb-1 font-medium">Product Status</label>
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
                        <input type="text"
                            class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none"
                            placeholder="Type your Product Location" v-model="newProduct.product_location" />
                    </div>
                    <div>
                        <label class="block mb-1 font-medium">Quantity</label>
                        <input type="number"
                            class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none"
                            placeholder="0" v-model="newProduct.quantity" />
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
                    <button type="button" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                        @click="addProduct">Add
                        product</button>
                    <button type="button" class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
                        @click="closeAddProductModal">Cancel</button>
                </div>
            </form>
        </div>
    </div>
</template>