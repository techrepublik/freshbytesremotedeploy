<script setup>
    definePageMeta({
    layout: "home",
})
</script>

<template>
            <nav class="flex" aria-label="Breadcrumb">
            <ol class="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
                <li class="inline-flex items-center">
                <a href="#" class="inline-flex items-center text-sm font-medium text-gray-800 hover:text-green-800 dark:text-gray-400 dark:hover:text-white">
                    <svg class="w-3 h-3 me-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"/>
                    </svg>
                    Home
                </a>
                </li>
                <li>
                <div class="flex items-center">
                    <svg class="rtl:rotate-180 w-3 h-3 text-gray-600 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
                    </svg>
                    <a href="#" class="ms-1 text-sm font-medium text-gray-800 hover:text-green-800 md:ms-2 dark:text-gray-400 dark:hover:text-white">Products</a>
                </div>
                </li>
            </ol>
            </nav>
            <h1 class="text-2xl font-semibold text-black-900 dark:text-white-900 mt-3">All Products</h1>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                <a href="#" class="p-5 bg-gray-50 border border-gray-300 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                    <span class="inline-flex items-center px-2 py-0.5 mb-2 text-xs font-medium text-green-800 bg-green-100 rounded dark:bg-green-900 dark:text-green-200">↑ 8%</span>
                <h5 class="mt-0.8 text-3xl font-bold text-gray-900 dark:text-white">345,768</h5>
                <p class="mt-2 text-gray-500 dark:text-gray-400">Total stocks</p></a>

                <a href="#" class="p-5 bg-gray-50 border border-gray-300 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                    <span class="inline-flex items-center px-2 py-0.5 mb-2 text-xs font-medium text-green-800 bg-green-100 rounded dark:bg-green-900 dark:text-green-200">↑ 12,4</span>
                <h5 class="mt-0.8 text-3xl font-bold text-gray-900 dark:text-white">31,385</h5>
                <p class="mt-2 text-gray-500 dark:text-gray-400">New Products</p></a>

                <a href="#" class="p-5 bg-gray-50 border border-gray-300 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                    <span class="inline-flex items-center px-2 py-0.5 mb-2 text-xs font-medium text-red-800 bg-red-100 rounded dark:bg-red-900 dark:text-red-200">↑ 3,7</span>
                <h5 class="mt-0.8 text-3xl font-bold text-gray-900 dark:text-white">27,274</h5>
                <p class="mt-2 text-gray-500 dark:text-gray-400">Sold Products</p></a>

                <a href="#" class="p-5 bg-gray-50 border border-gray-300 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                    <span class="inline-flex items-center px-2 py-0.5 mb-2 text-xs font-medium text-red-800 bg-red-100 rounded dark:bg-red-900 dark:text-red-200">↑ 12,4</span>
                <h5 class="mt-0.8 text-3xl font-bold text-gray-900 dark:text-white">3,506</h5>
                <p class="mt-2 text-gray-500 dark:text-gray-400">Returned Products</p></a>
            </div>
            <div class="flex items-center justify-between mt-4 mb-4">
                <div class="flex items-center space-x-2">
                    <span class="font-semibold text-black text-xl">FreshBytes Products</span>
                    <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="2" fill="none"/>
                    <text x="10" y="15" text-anchor="middle" font-size="12" fill="currentColor">i</text>
                    </svg>
                </div>
                <div class="flex items-center space-x-2">
                    <button class="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">
                    <span class="mr-2">+</span> Add new product
                    </button>
                    <div class="relative">
                    <button class="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-100 transition flex items-center">
                        Table settings
                        <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path d="M19 9l-7 7-7-7"/>
                        </svg>
                    </button>
                    <!-- Dropdown can go here if needed -->
                    </div>
                </div>
                </div>

</template>