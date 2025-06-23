<script setup>
    defineProps({
        showUpdateModal: {
            type: Boolean,
            required: true
        },
    });

    const emit = defineEmits(['closeUpdateModal']);

    function closeModal() {
        emit('closeUpdateModal');
    }
</script>

<template>
    <div v-if="showUpdateModal" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/30">
        <div
            class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-3xl h-screen overflow-y-auto relative">
            <h2 class="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                Update Product</h2>
            <!-- Close button below h2 -->
            <button class="absolute top-6 right-6 text-gray-400 hover:text-gray-700 text-2xl"
                @click.stop="closeModal" aria-label="Close">&times;</button>
            <form class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300">Product
                            Name</label>
                        <input type="text" class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                            placeholder="Papaya">
                    </div>
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300">Category</label>
                        <select class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white">
                            <option>Fruits</option>
                            <option>Vegetables</option>
                        </select>
                    </div>
                    <!-- Add more options -->
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300">Sub-Category</label>
                        <select class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white">
                            <option>Citrus</option>
                            <option>Berries</option>
                            <option>Tropical</option>
                            <option>Stone Fruits</option>
                            <option>Melons</option>
                            <option>Vegetables</option>
                            <option>Root Vegetable</option>
                            <option>Leafy Greens</option>
                            <option>Cruciferous Vegetables</option>
                            <option>Nightshades</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300">Current
                            Price</label>
                        <input type="number" class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                            placeholder="₱259.00">
                    </div>
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300">Discounted
                            Price</label>
                        <input type="number" class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                            placeholder="₱240.00">
                    </div>
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300">Product
                            Status</label>
                        <select class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                            placeholder="Select Product Status">
                            <option>Fresh</option>
                            <option>Slightly Withered</option>
                            <option>Withered</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300">Product
                            Location</label>
                        <input type="text" class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                            placeholder="Kabacan">
                    </div>
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300">Quantity</label>
                        <input type="number" class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                            placeholder="121">
                    </div>
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300">Posted
                            Date</label>
                        <input class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                            placeholder="06/20/2025">
                    </div>
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300">Harvest
                            Date</label>
                        <input class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                            placeholder="06/18/2025">
                    </div>
                </div>

                <div>
                    <label class="block text-gray-700 dark:text-gray-300">Brief
                        Description</label>
                    <textarea class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                        rows="4">Papaya</textarea>
                </div>
                <div>
                    <label class="block text-gray-700 dark:text-gray-300">Detailed
                        Description</label>
                    <textarea class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                        rows="4">Papaya papaya</textarea>
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
                    <button type="button" @click.stop="closeUpdateModal"
                        class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>