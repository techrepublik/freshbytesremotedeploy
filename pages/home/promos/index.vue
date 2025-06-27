<script setup>
import { ref, computed } from 'vue'
definePageMeta({
    layout: "home",
})

const promos = ref([]);

promos.value = [
    {
        promo_id: 1,
        promo_code: 'WELCOME10',
        promo_name: 'Welcome Discount',
        promo_description: '10% off for new users',
        discount_type: 'Percentage',
        start_date: '2024-07-01',
        end_date: '2024-07-31',
        status: 'Active'
    }
    // ...more promos
];

</script>
<template>
    <div class="relative min-h-screen">
        <nav class="flex" aria-label="Breadcrumb">
            <ol class="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
                <li class="inline-flex items-center">
                    <a href="#"
                        class="inline-flex items-center text-sm font-medium text-gray-800 hover:text-green-800 dark:text-gray-400 dark:hover:text-white">
                        <svg class="w-3 h-3 me-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor" viewBox="0 0 20 20">
                            <path
                                d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
                        </svg>
                        Home
                    </a>
                </li>
                <li>
                    <div class="flex items-center">
                        <svg class="rtl:rotate-180 w-3 h-3 text-gray-600 mx-1" aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="m1 9 4-4-4-4" />
                        </svg>
                        <a href="#"
                            class="ms-1 text-sm font-medium text-gray-800 hover:text-green-800 md:ms-2 dark:text-gray-400 dark:hover:text-white">Promos</a>
                    </div>
                </li>
                <div class="flex items-center">
                    <svg class="rtl:rotate-180 w-3 h-3 text-gray-600 mx-1" aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="m1 9 4-4-4-4" />
                    </svg>
                    <a href="#"
                        class="ms-1 text-sm font-medium text-gray-800 hover:text-green-800 md:ms-2 dark:text-gray-400 dark:hover:text-white">Manage
                        Promos</a>
                </div>
            </ol>
        </nav>
        <div class="flex justify-between items-center mt-3">
            <h1 class="text-2xl font-semibold text-black-900 dark:text-white-900">
                Promos
            </h1>
            <div class="flex items-center space-x-2">
                <button type="button" onclick="document.getElementById('addSubCategory').classList.remove('hidden')"
                    class="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">
                    <span class="mr-2">+</span> Add Promo
                </button>
            </div>
        </div>
    <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div class="flex gap-2 flex-wrap">
                <input type="text" placeholder="Search"
                    class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <select 
                    class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Status</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Active">Active</option>
                </select>
            </div>
        </div>
    <div class="flex flex-col">
        <div class="overflow-x-auto">
            <div class="inline-block min-w-full align-middle">
                <div class="overflow-hidden shadow">
                    <div v-if="pending">Loading</div>
                    <table class="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-600">
                        <thead class="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th scope="col" class="p-4">
                                    <div class="flex items-center">
                                        <input id="checkbox-all" type="checkbox"
                                            class="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600" />
                                        <label for="checkbox-all" class="sr-only">checkbox</label>
                                    </div>
                                </th>
                                <th
                                    class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                    Promo ID</th>
                                <th
                                    class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                    Promo Code</th>
                                <th
                                    class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                    Promo Name</th>
                                <th
                                    class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                    Promo Description</th>
                                <th
                                    class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                    Discount Type</th>
                                <th
                                    class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                    Start Date</th>
                                <th
                                    class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                    End Date</th>
                                <th
                                    class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                    Status</th>
                                <th
                                    class="p-4 text-xs font-medium text-center text-gray-500 uppercase dark:text-gray-400">
                                    Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="promo in promos" :key="promo.promo_id">
                                <td class="p-4">
                                    <input type="checkbox"
                                        class="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600" />
                                </td>
                                <td class="p-4">{{ promo.promo_id }}</td>
                                <td class="p-4">{{ promo.promo_code }}</td>
                                <td class="p-4">{{ promo.promo_name }}</td>
                                <td class="p-4">{{ promo.promo_description }}</td>
                                <td class="p-4">{{ promo.discount_type }}</td>
                                <td class="p-4">{{ promo.start_date }}</td>
                                <td class="p-4">{{ promo.end_date }}</td>
                                <td class="p-4">{{ promo.status }}</td>
                                <td class="p-4 space-x-2 whitespace-nowrap">
                                    <div class="flex justify-center space-x-2">
                                        <button type="button"
                                            class="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-[#29000] rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                                            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z">
                                                </path>
                                                <path fill-rule="evenodd"
                                                    d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                                                    clip-rule="evenodd"></path>
                                            </svg>
                                            Update
                                        </button>
                                        <button type="button"
                                            class="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:ring-red-300 dark:focus:ring-red-900">
                                            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fill-rule="evenodd"
                                                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                                    clip-rule="evenodd" />
                                            </svg>
                                            Delete promo
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    <hr class="my-4 border-gray-200 dark:border-gray-700">
    <div class="flex justify-end items-center space-x-4 mb-4">
        <button class="text-sm text-gray-600 hover:underline">Print barcodes</button>
        <button class="text-sm text-gray-600 hover:underline">Duplicate</button>
        <button class="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded">
            Export CSV
        </button>
    </div>
    <!-- Footer -->
    <footer
        class="absolute bottom-0 left-0 w-full border-t border-gray-200 dark:border-gray-700 py-4 flex flex-col md:flex-row items-center justify-between px-4 text-sm text-gray-500 dark:text-gray-400">
        <div class="flex items-center space-x-4">
            <span>© 2025 FreshBytes. All rights reserved.</span>
            <a href="#" class="hover:underline">Privacy Policy</a>
            <a href="#" class="hover:underline">API</a>
            <a href="#" class="hover:underline">Contact</a>
        </div>

        <div class="flex items-center space-x-2 mt-2 md:mt-0">
            <select class="text-sm bg-transparent focus:outline-none dark:text-white">
                <option selected>English (US)</option>
                <!-- Add more language options -->
            </select>
            <button class="text-gray-500 dark:text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
            </button>
        </div>
    </footer>
  </div>
</template>