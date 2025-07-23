<script setup>
definePageMeta({
    layout: "home",
})

const pending = ref(false) 

const invoice = ref({
    id: 10234,
    dueDate: "2025-08-15",
    subtotal: 200,
    tax: 20,
    shipping: 10,
    total: 230,
    customer: {
        name: "Jane Doe",
        email: "jane@example.com",
        phone: "+1 555-123-4567",
        country: "USA",
        address: "123 Main St, Springfield, IL"
    },
    items: [
        {
            id: 1,
            name: "Fresh Apple",
            description: "Organic Fuji apple, 1 lb",
            qty: 2,
            price: 3.5,
            discount: 0,
            total: 7.0
        },
        {
            id: 2,
            name: "Avocado Pack",
            description: "5-pack premium avocados",
            qty: 1,
            price: 10.0,
            discount: 10,
            total: 9.0
        },
        {
            id: 3,
            name: "Almond Milk",
            description: "Unsweetened 1L carton",
            qty: 3,
            price: 4.5,
            discount: 0,
            total: 13.5
        }
    ],
    history: [
        {
            action: "Order placed",
            timestamp: "2025-07-18 10:34 AM",
            details: "Customer completed checkout."
        },
        {
            action: "Payment confirmed",
            timestamp: "2025-07-18 10:36 AM",
            details: "Paid via Stripe."
        },
        {
            action: "Shipped",
            timestamp: "2025-07-19 02:14 PM",
            details: "Tracking #1234567890"
        },
        {
            action: "Delivered",
            timestamp: "2025-07-21 09:45 AM"
        }
    ]
})
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
                        class="ms-1 text-sm font-medium text-gray-800 hover:text-green-800 md:ms-2 dark:text-gray-400 dark:hover:text-white">Single
                        Transactions</a>
                </div>
            </ol>
        </nav>
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mt-6 mb-4">
            <div>
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-1">Invoice</h1>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                    Order <span class="font-medium">#{{ invoice.id }}</span> -
                    <span
                        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                        Completed
                    </span>
                </p>
                <p class="text-sm text-gray-500 mt-1">Due: <strong>{{ invoice.dueDate }}</strong></p>
            </div>
            <div class="flex gap-2 mt-4 md:mt-0">
                <button class="px-4 py-2 border rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700">View
                    receipt</button>
                <button
                    class="px-4 py-2 border rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Refund</button>
            </div>
        </div>


        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Order Details -->
            <div class="md:col-span-2 bg-white p-6 rounded-lg shadow">
                <h2 class="text-lg font-semibold mb-4">Order details</h2>
                <table class="w-full text-sm border rounded-lg overflow-hidden">
                    <thead class="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        <tr>
                            <th class="px-4 py-3 text-left">Product</th>
                            <th class="px-4 py-3 text-center">Qty</th>
                            <th class="px-4 py-3 text-right">Price</th>
                            <th class="px-4 py-3 text-right">Discount</th>
                            <th class="px-4 py-3 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                        <tr v-for="item in invoice.items" :key="item.id"
                            class="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td class="px-4 py-3">
                                <div class="font-medium text-gray-900 dark:text-white">{{ item.name }}</div>
                                <div class="text-xs text-gray-500">{{ item.description }}</div>
                            </td>
                            <td class="px-4 py-3 text-center">{{ item.qty }}</td>
                            <td class="px-4 py-3 text-right">${{ item.price.toFixed(2) }}</td>
                            <td class="px-4 py-3 text-right">{{ item.discount }}%</td>
                            <td class="px-4 py-3 text-right font-semibold">${{ item.total.toFixed(2) }}</td>
                        </tr>
                    </tbody>
                </table>

                <div class="mt-6 text-right space-y-1 text-sm text-gray-700 dark:text-gray-200">
                    <p>Subtotal: <span class="float-right font-medium">${{ invoice.subtotal.toFixed(2) }}</span></p>
                    <p>Tax: <span class="float-right">${{ invoice.tax.toFixed(2) }}</span></p>
                    <p>Shipping: <span class="float-right">${{ invoice.shipping.toFixed(2) }}</span></p>
                    <hr class="my-2 border-gray-200 dark:border-gray-600" />
                    <p class="text-lg font-bold">Total: <span class="float-right">${{ invoice.total.toFixed(2) }}</span>
                    </p>
                </div>

            </div>

         
            <div class="space-y-6">
               
                <div class="bg-white p-6 rounded-lg shadow">
                    <h2 class="text-lg font-semibold mb-4">Customer details</h2>
                    <ul class="text-sm text-gray-700 space-y-1">
                        <li><strong>Name:</strong> {{ invoice.customer.name }}</li>
                        <li><strong>Email:</strong> {{ invoice.customer.email }}</li>
                        <li><strong>Phone:</strong> {{ invoice.customer.phone }}</li>
                        <li><strong>Country:</strong> {{ invoice.customer.country }}</li>
                        <li><strong>Address:</strong> {{ invoice.customer.address }}</li>
                    </ul>
                </div>

              
                <div class="bg-white p-6 rounded-lg shadow">
                    <h2 class="text-lg font-semibold mb-4">Order history</h2>
                    <ul class="space-y-4">
                        <li v-for="(event, index) in invoice.history" :key="index" class="relative pl-6">
                            <span class="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-blue-500"></span>
                            <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ event.action }}</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400">{{ event.timestamp }}</p>
                            <p v-if="event.details" class="text-xs italic text-gray-400">{{ event.details }}</p>
                        </li>
                    </ul>

                </div>
            </div>
        </div>
    </div>
</template>
