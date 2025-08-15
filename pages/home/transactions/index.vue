<script setup>
import { ref, computed } from 'vue'

definePageMeta({
    layout: "home",
})

const config = useRuntimeConfig()
const api = config.public.API_LINK

// Auth token
const accessToken = useCookie('auth-access-token')

const getAuthHeaders = () => {
    return accessToken.value
        ? { Authorization: `Bearer ${accessToken.value}` }
        : {}
}

const { data: transactions, pending: pendingTransactions, refresh: refreshTransactions } = await useFetch(
    `${api}/api/order-items/`,
    {
        server: false,
        headers: computed(() => getAuthHeaders()),
        onResponseError({ response }) {
            console.error('Categories API Error:', response.status, response._data);
        }
    }
);
// This is pseudo-code depending on your actual setup
async function showOrderDetails(orderId) {
    try {
        const { data, error } = await useFetch(`${api}/api/order-items/?order_id=${orderId}`, {
            server: false,
            headers: computed(() => getAuthHeaders())
        });

        if (error.value) {
            console.error("Fetch error", error.value);
            return;
        }

        if (data.value && data.value.length > 0) {
            selectedTransaction.value = {
                ...data.value[0], // base info
                items: data.value
            };
            isTransactionVisible.value = true;
        } else {
            console.warn("No items found for order:", orderId);
        }
    } catch (err) {
        console.error("Error fetching order details:", err);
    }
}

// State
const searchQuery = ref('')
const statusFilter = ref('')
const dateFilter = ref('')
const selectedDate = ref('')
const selectedTransactionIds = ref([])
const isTransactionVisible = ref(false)
const selectedTransaction = ref(null)
const isDeleteVisible = ref(false)
const isUpdateVisible = ref(false)
const transactionToUpdate = ref({})
const isReportVisible = ref(false)
const activeDropdown = ref(null)

function toggleDropdown(id) {
    activeDropdown.value = activeDropdown.value === id ? null : id
}

function closeDropdown() {
    activeDropdown.value = null
}

// const transactions = ref([
//     {
//         order_item_id: "oitid00225",
//         product_name: "Banana",
//         price: "25.00",
//         order_id: "91f8d9a8-64c3-49c0-bbb0-6b969bbb411b",
//         product_id: "b219fa58-ad28-4e54-9844-2e8041e5da03",
//         product_id2: "b219fa58-ad28-4e54-9844-2e8041e5da03",
//         quantity: 2,
//         quanitity2: 5,
//         itemprice1: "25.00",
//         itemprice2: "62.00",
//         total_item_price: "360.00",
//         customer: "Ej FreshBytes",
//         email: "ejfresh@gmail.com",
//         due_date: "23 Jul 2025",
//         status: "Completed",
//         created_at: "2025-07-23T15:47:17.816883+08:00",
//         updated_at: "2025-07-23T15:47:17.816926+08:00"
//     }
// ]);

const filteredTransactions = computed(() => {
    let list = transactions.value;

    if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        list = list.filter(
            t =>
                t.order_id.includes(q) ||
                t.first_name.toLowerCase().includes(q) ||
                t.last_name.toLowerCase().includes(q) ||
                t.business_name.toLowerCase().includes(q) ||
                t.product_name.toLowerCase().includes(q)
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
const groupedTransactions = computed(() => {
    const groups = {};
    filteredTransactions.value.forEach(t => {
        if (!groups[t.order_id]) {
            groups[t.order_id] = {
                order_id: t.order_id,
                customer: `${t.last_name}, ${t.first_name}`,
                items: [],
                order_status: t.order_status,
                created_at: t.created_at,
                total_price: 0,
            };
        }
        groups[t.order_id].items.push(t);
        groups[t.order_id].total_price += Number(t.total_item_price);
    });
    return Object.values(groups);
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
            <select v-model="dateFilter"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">User</option>
                <option value="last7">Ej FreshBytes</option>
            </select>
            <select v-model="dateFilter"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Products</option>
                <option value="last7">Banana</option>
            </select>

            <input v-if="dateFilter === 'selectDate'" type="date" v-model="selectedDate"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button class="bg-green-600  hover:bg-green-700 transition text-white px-4 py-2 rounded font-medium">
                Export CSV
            </button>
        </div>
        <div class="flex justify-end mb-4">
            <!-- <button
                class="px-4 py-2 rounded transition font-medium mb-4 bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                :disabled="selectedTransactionIds.length === 0" @click="deleteSelectedTransactions">
                Delete {{ selectedTransactionIds.length }} item<span v-if="selectedTransactionIds.length !== 1">s</span> -->
            <!-- </button> -->
        </div>
        <div class="relative overflow-visible bg-white dark:bg-gray-800 rounded-lg shadow">
            <div class="overflow-x-auto">

                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead class="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th class="p-4">
                                <input id="checkbox-all" type="checkbox" @click.stop
                                    :checked="selectedTransactionIds.length === filteredTransactions.length && filteredTransactions.length > 0"
                                    @change="toggleSelectAll"
                                    class="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600" />
                            </th>
                            <th class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                Order
                                ID</th>
                            <!-- <th class="p-4 text-xs font-medium text-center text-gray-500 uppercase dark:text-gray-400">
                                Customer</th>
                            <th class="p-4 text-xs font-medium text-center text-gray-500 uppercase dark:text-gray-400">
                                Product Name</th>
                            <th class="p-4 text-xs font-medium text-center text-gray-500 uppercase dark:text-gray-400">
                                Seller</th>
                            <th class="p-4 text-xs font-medium text-center text-gray-500 uppercase dark:text-gray-400">
                                Quantity</th>
                            <th class="p-4 text-xs font-medium text-center text-gray-500 uppercase dark:text-gray-400">
                                Total
                            </th> -->
                            <th class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                Customer Name
                                </th>
                            <th class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                Total price
                                </th>
                            <th class="p-4 text-xs font-medium text-center text-gray-500 uppercase dark:text-gray-400">
                                Created At</th>
                            <th class="p-4 text-xs font-medium text-status text-gray-500 uppercase dark:text-gray-400">
                                Status</th>
                            
                        </tr>
                    </thead>
                    <tbody>
                        <template v-for="order in groupedTransactions" :key="order.order_id">
                            <tr class="bg-gray-200 dark:bg-gray-700 font-semibold cursor-pointer"
                                @click="showOrderDetails(order.order_id)">
                                <td class="p-4" colspan="1">
                                    <input :id="`checkbox-${order.order_id}`" type="checkbox" :value="order.order_id"
                                        v-model="selectedTransactionIds" @click.stop
                                        class="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600" />
                                </td>
                                <td class="p-4 text-sm text-gray-900 dark:text-white font-semibold">#{{ order.order_id
                                    }}</td>
                               <td class="p-4 text-sm text-gray-900 dark:text-white font-semibold">{{ order.customer }}</td>
                                <td class="p-4 text-sm text-gray-900 dark:text-white">${{ order.total_price }}</td>
                                <td class="p-4 text-sm text-gray-900 dark:text-white">{{ order.created_at }}</td>
                                <td class="p-4 text-center">
                                    <span :class="{
                                        'bg-green-100 text-green-800': order.order_status === 'CONFIRMED',
                                        'bg-yellow-100 text-yellow-800': order.order_status === 'PENDING',
                                        'bg-red-100 text-red-800': order.order_status === 'SHIPPED',
                                        'bg-blue-100 text-blue-800': order.order_status === 'CANCELLED'
                                    }" class="px-2 py-1 rounded text-xs font-semibold">
                                        {{ order.order_status }}
                                    </span>
                                </td>
                            </tr>
                          
                        </template>
                    </tbody>

                    <div id="showTransaction" v-if="isTransactionVisible"
                        class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/30">
                        <div class="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto font-mono text-base"
                            @click.stop>

                            <!-- Header -->
                            <div class="text-center border-b pb-4 mb-6">
                                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                                    Transaction #{{ selectedTransaction?.order_id }}
                                </h2>
                                <p class="text-gray-700 dark:text-gray-300 text-lg">
                                    {{ selectedTransaction?.customer }}
                                </p>
                            </div>

                            <!-- Order Details Table -->
                            <!-- Order Details -->
                            <div class="mb-8">
                                <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Order Details</h3>
                                <div class="overflow-x-auto rounded-lg">
                                    <table
                                        class="w-full table-auto text-left bg-gray-100 dark:bg-gray-800 text-base font-mono rounded-lg">
                                        <thead>
                                            <tr
                                                class="text-gray-700 dark:text-gray-300 font-semibold border-b border-gray-300 dark:border-gray-700">
                                                <th class="px-4 py-2">QTY</th>
                                                <th class="px-4 py-2">PRODUCT NAME</th>
                                                <th class="px-4 py-2">SHOP</th>
                                                <th class="px-4 py-2">PRICE</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <!-- Main Transaction Row -->

                                            <tr v-for="item in selectedTransaction?.items" :key="item.id"
                                                class="text-gray-900 dark:text-gray-100">
                                                <td class="px-4 py-2">{{ item.quantity }}</td>
                                                <td class="px-4 py-2">{{ item.product_name }}</td>
                                                <td class="px-4 py-2">{{ item.business_name }}</td>
                                                <td class="px-4 py-2">${{ item.product_price }}</td>
                                            </tr>

                                        </tbody>

                                        <!-- Total Row Outside the Table -->
                                        <tfoot>
                                            <tr>
                                                <td colspan="4"
                                                    class="pt-4 pr-4 text-right text-lg font-semibold text-gray-800 dark:text-gray-200">
                                                    Total: $
                                                    {{
                                                        selectedTransaction?.items?.reduce(
                                                            (sum, item) => sum + (item.quantity * item.product_price),
                                                    0
                                                    ).toFixed(2)
                                                    }}
                                                </td>
                                            </tr>
                                        </tfoot>

                                    </table>
                                </div>
                            </div>

                            <!-- Customer Info -->
                            <div class="mb-8">
                                <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Customer Details
                                </h3>
                                <div class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                                    <div class="flex justify-between text-base text-gray-700 dark:text-gray-300">
                                        <span class="font-medium">Name:</span>
                                        <span>{{ selectedTransaction?.last_name }}, {{ selectedTransaction?.first_name
                                            }}</span>
                                    </div>
                                </div>
                            </div>


                            <!-- Footer -->
                            <div class="mt-6 text-center">
                                <button type="button" @click="isTransactionVisible = false; selectedTransaction = null"
                                    class="px-6 py-3 bg-red-600 text-white rounded-lg text-lg hover:bg-red-700">
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
                <!-- <div v-if="isUpdateVisible" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/30">
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
                            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Customer Details
                            </h3>
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
                </div> -->
                <div v-if="isReportVisible" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/30">
                    <div @click.stop class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-lg w-full">
                        <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">
                            Transactions Report
                        </h2>
                        <div class="grid grid-cols-1 gap-4">
                            <div class="bg-green-50 dark:bg-green-900 rounded-lg p-4 flex items-center shadow">
                                <div class="flex-1">
                                    <div class="text-lg font-semibold text-green-800 dark:text-green-200">Total
                                        Transactions
                                    </div>
                                    <div class="text-2xl font-bold text-green-900 dark:text-green-100">{{
                                        filteredTransactions.length }}</div>
                                </div>
                                <svg class="w-8 h-8 text-green-400 dark:text-green-200" fill="none"
                                    stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M9 16h6"></path>
                                </svg>
                            </div>
                            <div class="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 flex items-center shadow">
                                <div class="flex-1">
                                    <div class="text-lg font-semibold text-blue-800 dark:text-blue-200">
                                        Total Sales
                                    </div>
                                    <div class="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                        ${{filteredTransactions.reduce((sum, t) => sum + Number(t.total_item_price),
                                            0).toFixed(2)}}
                                    </div>
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
                                            'Completed').length}}</span>
                                    </div>
                                    <div class="flex items-center justify-between">
                                        <span>Pending</span>
                                        <span class="font-bold">{{filteredTransactions.filter(t => t.status ===
                                            'Pending').length}}</span>
                                    </div>
                                    <div class="flex items-center justify-between">
                                        <span>Refunded</span>
                                        <span class="font-bold">{{filteredTransactions.filter(t => t.status ===
                                            'Refunded').length}}</span>
                                    </div>
                                    <div class="flex items-center justify-between">
                                        <span>Failed</span>
                                        <span class="font-bold">{{filteredTransactions.filter(t => t.status ===
                                            'Failed').length}}</span>
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
