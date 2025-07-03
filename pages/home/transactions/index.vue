<script setup>
import { ref, computed } from 'vue'
definePageMeta({
    layout: "home",
})


const searchQuery = ref('');
const statusFilter = ref('');
const selectedTransactionIds = ref([]);
const pending = ref(false);
const dateFilter = ref('');
const selectedDate = ref('');
const isTransactionVisible = ref(false);
const selectedTransaction = ref(null);
const isDeleteVisible = ref(false);
const isUpdateVisible = ref(false);
const transactionToUpdate = ref({});
const isReportVisible = ref(false);

const transactions = ref([
    {
        id: '1846325',
        customer: 'Freshbytes sdfs',
        email: 'ffsfe@exasfe.com',
        total: 466,
        due_date: '09 June 2025',
        status: 'Completed',
        quantity: '2',
        price: '34',
        product_name: 'Eggplant'
    },
    {
        id: '1846326',
        customer: 'Jesere',
        email: 'nsdf@exdfse.com',
        total: 2000,
        due_date: '07 June 2025',
        status: 'Failed',
        quantity: '2',
        price: '23',
        product_name: 'Orange'
    },
    {
        id: '1834326',
        customer: 'Wowowow',
        email: 'thisfsf@esfe.com',
        total: 2000,
        due_date: '09 June 2025',
        status: 'Pending',
        quantity: '2',
        price: '24',
        product_name: 'Melon'
    },
    {
        id: '1833236',
        customer: 'Wowowow',
        email: 'thidff@exsdf.com',
        total: 2000,
        due_date: '09 June 2025',
        status: 'Refunded',
        price: '23',
        quantity: '3',
        product_name: 'Mango'
    },

]);

const filteredTransactions = computed(() => {
    let list = transactions.value;

    if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        list = list.filter(
            t =>
                t.id.includes(q) ||
                t.customer.toLowerCase().includes(q) ||
                t.email.toLowerCase().includes(q)
        );
    }

    if (statusFilter.value) {
        list = list.filter(t => t.status === statusFilter.value);
    }

    if (dateFilter.value === 'last7') {
        const now = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);

        list = list.filter(t => {
            const [day, monthStr, year] = t.due_date.split(' ');
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const month = months.indexOf(monthStr);
            const dateObj = new Date(year, month, day);
            return dateObj >= sevenDaysAgo && dateObj <= now;
        });
    } else if (dateFilter.value === 'selectDate' && selectedDate.value) {
        list = list.filter(t => {
            const [day, monthStr, year] = t.due_date.split(' ');
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const month = months.indexOf(monthStr);
            const dateObj = new Date(year, month, day);

            const selected = new Date(selectedDate.value);
            return (
                dateObj.getFullYear() === selected.getFullYear() &&
                dateObj.getMonth() === selected.getMonth() &&
                dateObj.getDate() === selected.getDate()
            );
        });
    }

    return list;
});
function updateTransaction() {
    isUpdateVisible.value = false;
}

function toggleSelectAll(event) {
    if (event.target.checked) {
        selectedTransactionIds.value = filteredTransactions.value.map(t => t.id);
    } else {
        selectedTransactionIds.value = [];
    }
}
</script>
<template>
    <div class="bg-white w-full h-full absolute top-0 left-0 z-10 flex items-center justify-center" v-if="pending">
        <div role="status">
            <svg aria-hidden="true" class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor" />
                <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill" />
            </svg>
            <span class="sr-only">Loading...</span>
        </div>
    </div>
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
                            class="ms-1 text-sm font-medium text-gray-800 hover:text-green-800 md:ms-2 dark:text-gray-400 dark:hover:text-white">Transactions</a>
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
                        Transactions</a>
                </div>
            </ol>
        </nav>
        <div class="flex justify-between items-center mt-3">
            <h1 class="text-2xl font-semibold text-black-900 dark:text-white-900">
                Transactions
            </h1>
            <div class="flex items-center space-x-2">
                <button type="button" @click="isReportVisible = true"
                    class="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">
                    <span class="mr-2">+</span> Generate Report
                </button>
            </div>
        </div>
        <div class="flex gap-2 flex-wrap">
            <input type="text" v-model="searchQuery" placeholder="Search by Order ID or Customer"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <select v-model="statusFilter"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Refunded">Refunded</option>
                <option value="Failed">Failed</option>
            </select>
            <select v-model="dateFilter"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All Dates</option>
                <option value="last7">Last 7 Days</option>
                <option value="selectDate">Select Date</option>
            </select>
            <input v-if="dateFilter === 'selectDate'" type="date" v-model="selectedDate"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button class="bg-green-600  hover:bg-green-700 transition text-white px-4 py-2 rounded font-medium">
                Export CSV
            </button>
        </div>
        <div class="flex justify-end mb-4">
            <button
                class="px-4 py-2 rounded transition font-medium mb-4 bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                :disabled="selectedTransactionIds.length === 0" @click="deleteSelectedTransactions">
                Delete {{ selectedTransactionIds.length }} item<span v-if="selectedTransactionIds.length !== 1">s</span>
            </button>
        </div>
        <div class="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th class="p-4">
                            <input id="checkbox-all" type="checkbox" @click.stop
                                :checked="selectedTransactionIds.length === filteredTransactions.length && filteredTransactions.length > 0"
                                @change="toggleSelectAll"
                                class="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600" />
                        </th>
                        <th class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">Order
                            ID</th>
                        <th class="p-4 text-xs font-medium text-center text-gray-500 uppercase dark:text-gray-400">
                            Customer</th>
                        <th class="p-4 text-xs font-medium text-center text-gray-500 uppercase dark:text-gray-400">Email
                        </th>
                        <th class="p-4 text-xs font-medium text-center text-gray-500 uppercase dark:text-gray-400">Total
                        </th>
                        <th class="p-4 text-xs font-medium text-center text-gray-500 uppercase dark:text-gray-400">Due
                            Date</th>
                        <th class="p-4 text-xs font-medium text-status text-gray-500 uppercase dark:text-gray-400">
                            Status
                        </th>
                        <th class="p-4 text-xs font-medium text-center text-gray-500 uppercase dark:text-gray-400">
                            Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="t in filteredTransactions" :key="t.id"
                        class="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        @click="selectedTransaction = t; isTransactionVisible = true">
                        <td class="p-4">
                            <input :id="`checkbox-${t.id}`" type="checkbox" :value="t.id"
                                v-model="selectedTransactionIds" @click.stop
                                class="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600" />
                        </td>
                        <td class="p-4 text-sm text-gray-900 dark:text-white font-semibold">#{{ t.id }}</td>
                        <td class="p-4 text-sm text-gray-900 dark:text-white">{{ t.customer }}</td>
                        <td class="p-4 text-sm text-gray-900 dark:text-white">{{ t.email }}</td>
                        <td class="p-4 text-sm text-gray-900 dark:text-white">${{ t.total }}</td>
                        <td class="p-4 text-sm text-gray-900 dark:text-white">{{ t.due_date }}</td>
                        <td class="p-4 text-center">
                            <span :class="{
                                'bg-green-100 text-green-800': t.status === 'Completed',
                                'bg-yellow-100 text-yellow-800': t.status === 'Pending',
                                'bg-red-100 text-red-800': t.status === 'Failed',
                                'bg-blue-100 text-blue-800': t.status === 'Refunded'
                            }" class="px-2 py-1 rounded text-xs font-semibold">
                                {{ t.status }}
                            </span>
                        </td>
                        <td class="p-4 space-x-2 whitespace-nowrap">
                            <div class="flex justify-center space-x-2">
                                <button type="button" @click.stop="isUpdateVisible = true; promoToUpdate = promo"
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
                                    @click.stop="isDeleteVisible = true; transactionToDelete = transaction"
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
                <div id="showTransaction" v-if="isTransactionVisible"
                    class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/30">
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
                        @click.stop>
                        <div class="flex flex-col gap-1 mb-4">
                            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                                Transaction #{{ selectedTransaction?.id }}
                            </h2>
                            <h1 class="text-base font-medium text-gray-900 dark:text-white">
                                {{ selectedTransaction?.customer }}
                            </h1>
                        </div>
                        <div class="space-y-6">
                            <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Order Details</h2>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block mb-1 font-medium">Product Name</label>
                                    <input type="text" disabled
                                        class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300"
                                        :value="selectedTransaction?.product_name" />
                                </div>
                                <div>
                                    <label class="block mb-1 font-medium">Quantity</label>
                                    <input type="text" disabled
                                        class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300"
                                        :value="selectedTransaction?.quantity" />
                                </div>
                                <div>
                                    <label class="block mb-1 font-medium">Price</label>
                                    <input type="text" disabled
                                        class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300"
                                        :value="selectedTransaction?.price" />
                                </div>
                                <div>
                                    <label class="block mb-1 font-medium">Total</label>
                                    <input type="text" disabled
                                        class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300"
                                        :value="selectedTransaction ? ('$' + selectedTransaction.total) : ''" />
                                </div>
                                <div>
                                    <label class="block mb-1 font-medium">Due Date</label>
                                    <input type="text" disabled
                                        class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300"
                                        :value="selectedTransaction?.due_date" />
                                </div>
                                <div>
                                    <label class="block mb-1 font-medium">Status</label>
                                    <input type="text" disabled
                                        class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300"
                                        :value="selectedTransaction?.status" />
                                </div>
                            </div>
                            <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Customer Details
                            </h2>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block mb-1 font-medium">Customer Name</label>
                                    <input type="text" disabled
                                        class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300"
                                        :value="selectedTransaction?.customer" />
                                </div>
                                <div>
                                    <label class="block mb-1 font-medium">Email</label>
                                    <input type="text" disabled
                                        class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300"
                                        :value="selectedTransaction?.email" />
                                </div>
                            </div>
                        </div>
                        <div class="flex justify-end space-x-2 mt-6">
                            <button type="button" @click="isTransactionVisible = false; selectedTransaction = null"
                                class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </table>
            <div v-if="isDeleteVisible" id="deleteModal"
                class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/30">
                <div @click.stop class="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md shadow-lg">
                    <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                        Confirm Deletion</h2>
                    <p class="text-gray-600 dark:text-gray-300 mb-6">Are you sure you
                        want to delete this transaction?<br>
                        This action cannot be undone.</p>

                    <div class="flex justify-end gap-2">
                        <button @click="isDeleteVisible = false; subcategoryToDelete = null"
                            class="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                            Cancel
                        </button>
                        <button @click="deletePromo"
                            class="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700">
                            Yes, delete
                        </button>
                    </div>
                </div>
            </div>
            <div v-if="isUpdateVisible" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/30">
                <div @click.stop class="bg-white dark:bg-gray-800 p-6 rounded shadow-lg max-w-xl w-full">
                    <h2 class="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                        Update Transaction
                    </h2>
                    <form class="space-y-6" @submit.prevent="updateTransaction">
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Order Details</h3>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block mb-1 font-medium">Product Name</label>
                                <input type="text" v-model="transactionToUpdate.product_name"
                                    class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300" />
                            </div>
                            <div>
                                <label class="block mb-1 font-medium">Quantity</label>
                                <input type="number" v-model="transactionToUpdate.quantity"
                                    class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300" />
                            </div>
                            <div>
                                <label class="block mb-1 font-medium">Price</label>
                                <input type="number" v-model="transactionToUpdate.price"
                                    class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300" />
                            </div>
                            <div>
                                <label class="block mb-1 font-medium">Total</label>
                                <input type="number" v-model="transactionToUpdate.total"
                                    class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300" />
                            </div>
                            <div>
                                <label class="block mb-1 font-medium">Due Date</label>
                                <input type="date" v-model="transactionToUpdate.due_date"
                                    class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300" />
                            </div>
                            <div>
                                <label class="block mb-1 font-medium">Status</label>
                                <select v-model="transactionToUpdate.status"
                                    class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300">
                                    <option value="Completed">Completed</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Refunded">Refunded</option>
                                    <option value="Failed">Failed</option>
                                </select>
                            </div>
                        </div>
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Customer Details</h3>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block mb-1 font-medium">Customer Name</label>
                                <input type="text" v-model="transactionToUpdate.customer"
                                    class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300" />
                            </div>
                            <div>
                                <label class="block mb-1 font-medium">Email</label>
                                <input type="email" v-model="transactionToUpdate.email"
                                    class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300" />
                            </div>
                        </div>
                        <div class="flex justify-between mt-6">
                            <button type="submit"
                                class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Update
                                Transaction</button>
                            <button type="button" @click="isUpdateVisible = false"
                                class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Close</button>
                        </div>
                    </form>
                </div>
            </div>
            <div v-if="isReportVisible" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/30">
                <div @click.stop class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-lg w-full">
                    <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">
                        Transactions Report
                    </h2>
                    <div class="grid grid-cols-1 gap-4">
                        <div class="bg-green-50 dark:bg-green-900 rounded-lg p-4 flex items-center shadow">
                            <div class="flex-1">
                                <div class="text-lg font-semibold text-green-800 dark:text-green-200">Total Transactions
                                </div>
                                <div class="text-2xl font-bold text-green-900 dark:text-green-100">{{
                                    filteredTransactions.length }}</div>
                            </div>
                            <svg class="w-8 h-8 text-green-400 dark:text-green-200" fill="none" stroke="currentColor"
                                stroke-width="2" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M9 16h6"></path>
                            </svg>
                        </div>
                        <div class="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 flex items-center shadow">
                            <div class="flex-1">
                                <div class="text-lg font-semibold text-blue-800 dark:text-blue-200">Total Sales</div>
                                <div class="text-2xl font-bold text-blue-900 dark:text-blue-100">${{
                                    filteredTransactions.reduce((sum, t) => sum + Number(t.total), 0) }}</div>
                            </div>
                            <svg class="w-8 h-8 text-blue-400 dark:text-blue-200" fill="none" stroke="currentColor"
                                stroke-width="2" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v8m-4-4h8"></path>
                            </svg>
                        </div>
                        <div class="bg-yellow-50 dark:bg-yellow-900 rounded-lg p-4 shadow">
                            <div class="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Status
                                Breakdown</div>
                            <div class="grid grid-cols-2 gap-2">
                                <div class="flex items-center justify-between">
                                    <span>Completed</span>
                                    <span class="font-bold">{{filteredTransactions.filter(t => t.status ===
                                        'Completed').length }}</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span>Pending</span>
                                    <span class="font-bold">{{filteredTransactions.filter(t => t.status ===
                                        'Pending').length }}</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span>Refunded</span>
                                    <span class="font-bold">{{filteredTransactions.filter(t => t.status ===
                                        'Refunded').length }}</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span>Failed</span>
                                    <span class="font-bold">{{filteredTransactions.filter(t => t.status ===
                                        'Failed').length }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow flex items-center">
                            <div class="flex-1">
                                <div class="text-lg font-semibold text-gray-700 dark:text-gray-200">Date Range</div>
                                <div class="text-base text-gray-600 dark:text-gray-300">
                                    {{ dateFilter === 'last7' ? 'Last 7 Days' : dateFilter === 'selectDate' ?
                                    selectedDate : 'All Dates' }}
                                </div>
                            </div>
                            <svg class="w-8 h-8 text-gray-400 dark:text-gray-200" fill="none" stroke="currentColor"
                                stroke-width="2" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z">
                                </path>
                            </svg>
                        </div>
                    </div>
                    <div class="flex justify-between mt-8">
                        <button @click="exportCSV"
                            class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium">Export
                            CSV</button>
                        <button @click="isReportVisible = false"
                            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium">Close</button>
                    </div>
                </div>
            </div>
        </div>
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
