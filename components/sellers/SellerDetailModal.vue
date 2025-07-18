<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
    show: {
        type: Boolean,
        required: true
    },
    seller: {
        type: Object,
        default: () => null
    }
})

const emit = defineEmits(['close'])

const loading = ref(false)
const activeTab = ref('products')
const products = ref([])
const reviews = ref([])
const transactions = ref([])
const analytics = ref({
    totalProducts: 0,
    bestSellingProducts: [],
    highRatedProducts: [],
    totalReviews: 0,
    averageRating: 0,
    completedTransactions: 0,
    cancelledTransactions: 0,
    ongoingTransactions: 0,
    totalRevenue: 0
})

const config = useRuntimeConfig()
const api = config.public.API_LINK

// Computed properties
const tabs = computed(() => [
    { id: 'products', name: 'Products', count: analytics.value.totalProducts },
    { id: 'reviews', name: 'Reviews', count: analytics.value.totalReviews },
    { id: 'transactions', name: 'Transactions', count: completedTransactions.value + ongoingTransactions.value + cancelledTransactions.value },
    { id: 'reports', name: 'Reports', count: null }
])

const bestSellingProducts = computed(() => {
    return products.value
        .filter(p => p.sell_count > 0)
        .sort((a, b) => (b.sell_count || 0) - (a.sell_count || 0))
        .slice(0, 5)
})

const highRatedProducts = computed(() => {
    return products.value
        .filter(p => p.average_rating >= 4.0)
        .sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0))
        .slice(0, 5)
})

const completedTransactions = computed(() => {
    return transactions.value.filter(t => t.status === 'Completed').length
})

const cancelledTransactions = computed(() => {
    return transactions.value.filter(t => t.status === 'Cancelled' || t.status === 'Failed').length
})

const ongoingTransactions = computed(() => {
    return transactions.value.filter(t => t.status === 'Pending' || t.status === 'Processing').length
})

const recentTransactions = computed(() => {
    return transactions.value
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10)
})

// Fetch seller data
const fetchSellerData = async () => {
    if (!props.seller?.seller_id) return
    
    loading.value = true
    try {
        // Fetch seller's products
        const productsResponse = await $fetch(`${api}/api/products/?seller_id=${props.seller.seller_id}`)
        products.value = Array.isArray(productsResponse) ? productsResponse : productsResponse.results || []
        
        // Fetch seller's reviews
        const reviewsResponse = await $fetch(`${api}/api/reviews/?seller_id=${props.seller.seller_id}`)
        reviews.value = Array.isArray(reviewsResponse) ? reviewsResponse : reviewsResponse.results || []
        
        // Fetch seller's transactions
        const transactionsResponse = await $fetch(`${api}/api/transactions/?seller_id=${props.seller.seller_id}`)
        transactions.value = Array.isArray(transactionsResponse) ? transactionsResponse : transactionsResponse.results || []
        
        // Calculate analytics
        calculateAnalytics()
        
    } catch (error) {
        console.error('Failed to fetch seller data:', error)
    } finally {
        loading.value = false
    }
}

const calculateAnalytics = () => {
    analytics.value = {
        totalProducts: products.value.length,
        bestSellingProducts: bestSellingProducts.value,
        highRatedProducts: highRatedProducts.value,
        totalReviews: reviews.value.length,
        averageRating: reviews.value.length > 0 
            ? reviews.value.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.value.length 
            : 0,
        completedTransactions: completedTransactions.value,
        cancelledTransactions: cancelledTransactions.value,
        ongoingTransactions: ongoingTransactions.value,
        totalRevenue: transactions.value
            .filter(t => t.status === 'Completed')
            .reduce((sum, t) => sum + (t.total || 0), 0)
    }
}

// Watch for seller changes
watch(() => props.seller, (newSeller) => {
    if (newSeller && props.show) {
        fetchSellerData()
    }
}, { immediate: true })

watch(() => props.show, (show) => {
    if (show && props.seller) {
        fetchSellerData()
        activeTab.value = 'products'
    }
})

// Helper functions
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP'
    }).format(amount || 0)
}

const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
        case 'completed': return 'bg-green-100 text-green-800'
        case 'pending': return 'bg-yellow-100 text-yellow-800'
        case 'processing': return 'bg-blue-100 text-blue-800'
        case 'cancelled': case 'failed': return 'bg-red-100 text-red-800'
        default: return 'bg-gray-100 text-gray-800'
    }
}

const getProductStatusColor = (status) => {
    switch (status?.toUpperCase()) {
        case 'FRESH': return 'bg-green-100 text-green-800'
        case 'SLIGHTLY_WITHERED': return 'bg-yellow-100 text-yellow-800'
        case 'ROTTEN': return 'bg-red-100 text-red-800'
        default: return 'bg-gray-100 text-gray-800'
    }
}

const generateReport = () => {
    const reportData = {
        seller: props.seller,
        analytics: analytics.value,
        dateGenerated: new Date().toISOString(),
        products: products.value,
        reviews: reviews.value,
        transactions: recentTransactions.value
    }
    
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,"
    csvContent += "Seller Report\n"
    csvContent += `Seller Name,${props.seller.seller_name}\n`
    csvContent += `Email,${props.seller.seller_email}\n`
    csvContent += `Total Products,${analytics.value.totalProducts}\n`
    csvContent += `Total Reviews,${analytics.value.totalReviews}\n`
    csvContent += `Average Rating,${analytics.value.averageRating.toFixed(2)}\n`
    csvContent += `Total Revenue,${formatCurrency(analytics.value.totalRevenue)}\n`
    csvContent += `Completed Transactions,${analytics.value.completedTransactions}\n`
    csvContent += `Cancelled Transactions,${analytics.value.cancelledTransactions}\n`
    csvContent += `Ongoing Transactions,${analytics.value.ongoingTransactions}\n\n`
    
    csvContent += "Best Selling Products\n"
    csvContent += "Product Name,Sales Count,Price\n"
    bestSellingProducts.value.forEach(product => {
        csvContent += `"${product.product_name}",${product.sell_count || 0},${product.product_price || 0}\n`
    })
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `seller_report_${props.seller.seller_id}_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}
</script>

<template>
    <!-- Seller Detail Modal -->
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/50">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
            <!-- Modal Header -->
            <div class="flex items-center justify-between p-6 border-b border-gray-200">
                <div class="flex items-center space-x-4">
                    <img 
                        :src="seller?.avatar || '/assets/images/default-avatar.png'" 
                        :alt="seller?.seller_name"
                        class="w-16 h-16 rounded-full object-cover" 
                    />
                    <div>
                        <h2 class="text-2xl font-bold text-gray-900">{{ seller?.seller_name || 'Unknown Seller' }}</h2>
                        <p class="text-gray-600">{{ seller?.seller_email }}</p>
                        <div class="flex items-center mt-1">
                            <span :class="[
                                'px-2 py-1 text-xs font-medium rounded',
                                seller?.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            ]">
                                {{ seller?.status }}
                            </span>
                            <span class="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                                {{ seller?.role }}
                            </span>
                        </div>
                    </div>
                </div>
                <button
                    @click="$emit('close')"
                    class="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                    &times;
                </button>
            </div>

            <!-- Analytics Summary -->
            <div class="p-6 border-b border-gray-200 bg-gray-50">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="bg-white p-4 rounded-lg shadow-sm">
                        <div class="text-2xl font-bold text-blue-600">{{ analytics.totalProducts }}</div>
                        <div class="text-sm text-gray-600">Total Products</div>
                    </div>
                    <div class="bg-white p-4 rounded-lg shadow-sm">
                        <div class="text-2xl font-bold text-green-600">{{ formatCurrency(analytics.totalRevenue) }}</div>
                        <div class="text-sm text-gray-600">Total Revenue</div>
                    </div>
                    <div class="bg-white p-4 rounded-lg shadow-sm">
                        <div class="text-2xl font-bold text-yellow-600">{{ analytics.averageRating.toFixed(1) }}</div>
                        <div class="text-sm text-gray-600">Avg Rating</div>
                    </div>
                    <div class="bg-white p-4 rounded-lg shadow-sm">
                        <div class="text-2xl font-bold text-purple-600">{{ analytics.totalReviews }}</div>
                        <div class="text-sm text-gray-600">Total Reviews</div>
                    </div>
                </div>
            </div>

            <!-- Tabs Navigation -->
            <div class="border-b border-gray-200">
                <nav class="flex space-x-8 px-6">
                    <button
                        v-for="tab in tabs"
                        :key="tab.id"
                        @click="activeTab = tab.id"
                        :class="[
                            'py-4 px-1 border-b-2 font-medium text-sm',
                            activeTab === tab.id
                                ? 'border-green-500 text-green-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        ]"
                    >
                        {{ tab.name }}
                        <span v-if="tab.count !== null" class="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                            {{ tab.count }}
                        </span>
                    </button>
                </nav>
            </div>

            <!-- Tab Content -->
            <div class="flex-1 overflow-y-auto p-6">
                <!-- Products Tab -->
                <div v-if="activeTab === 'products'" class="space-y-6">
                    <!-- Best Selling Products -->
                    <div class="bg-white border border-gray-200 rounded-lg">
                        <div class="px-6 py-4 border-b border-gray-200">
                            <h3 class="text-lg font-semibold text-gray-900">Best Selling Products</h3>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    <tr v-for="product in bestSellingProducts" :key="product.product_id">
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="flex items-center">
                                                <img 
                                                    :src="product.product_image || '/assets/images/logos-12-12.png'" 
                                                    :alt="product.product_name"
                                                    class="w-10 h-10 rounded-lg object-cover mr-3"
                                                />
                                                <div>
                                                    <div class="text-sm font-medium text-gray-900">{{ product.product_name }}</div>
                                                    <div class="text-sm text-gray-500">{{ product.product_brief_description }}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {{ product.sell_count || 0 }} sold
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                            {{ formatCurrency(product.product_price) }}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span :class="[
                                                'px-2 py-1 text-xs font-medium rounded',
                                                getProductStatusColor(product.product_status)
                                            ]">
                                                {{ product.product_status || 'N/A' }}
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- High Rated Products -->
                    <div class="bg-white border border-gray-200 rounded-lg">
                        <div class="px-6 py-4 border-b border-gray-200">
                            <h3 class="text-lg font-semibold text-gray-900">High Rated Products</h3>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reviews</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    <tr v-for="product in highRatedProducts" :key="product.product_id">
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="flex items-center">
                                                <img 
                                                    :src="product.product_image || '/assets/images/logos-12-12.png'" 
                                                    :alt="product.product_name"
                                                    class="w-10 h-10 rounded-lg object-cover mr-3"
                                                />
                                                <div>
                                                    <div class="text-sm font-medium text-gray-900">{{ product.product_name }}</div>
                                                    <div class="text-sm text-gray-500">{{ product.product_brief_description }}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="flex items-center">
                                                <span class="text-yellow-400 mr-1">★</span>
                                                <span class="text-sm font-medium text-gray-900">{{ (product.average_rating || 0).toFixed(1) }}</span>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {{ product.review_count || 0 }} reviews
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                            {{ formatCurrency(product.product_price) }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Reviews Tab -->
                <div v-if="activeTab === 'reviews'" class="space-y-4">
                    <div class="bg-white border border-gray-200 rounded-lg">
                        <div class="px-6 py-4 border-b border-gray-200">
                            <h3 class="text-lg font-semibold text-gray-900">Customer Reviews</h3>
                        </div>
                        <div class="p-6">
                            <div v-if="reviews.length === 0" class="text-center py-8">
                                <p class="text-gray-500">No reviews available for this seller.</p>
                            </div>
                            <div v-else class="space-y-4">
                                <div v-for="review in reviews.slice(0, 10)" :key="review.review_id" 
                                     class="border-b border-gray-200 pb-4 last:border-b-0">
                                    <div class="flex items-start justify-between">
                                        <div class="flex-1">
                                            <div class="flex items-center mb-2">
                                                <div class="flex items-center">
                                                    <span v-for="star in 5" :key="star" 
                                                          :class="star <= (review.rating || 0) ? 'text-yellow-400' : 'text-gray-300'">
                                                        ★
                                                    </span>
                                                </div>
                                                <span class="ml-2 text-sm text-gray-600">{{ review.customer_name || 'Anonymous' }}</span>
                                            </div>
                                            <p class="text-gray-900">{{ review.comment || review.review_text }}</p>
                                        </div>
                                        <span class="text-sm text-gray-500">{{ formatDate(review.created_at) }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Transactions Tab -->
                <div v-if="activeTab === 'transactions'" class="space-y-6">
                    <!-- Transaction Summary -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                            <div class="text-2xl font-bold text-green-600">{{ analytics.completedTransactions }}</div>
                            <div class="text-sm text-green-700">Completed</div>
                        </div>
                        <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                            <div class="text-2xl font-bold text-yellow-600">{{ analytics.ongoingTransactions }}</div>
                            <div class="text-sm text-yellow-700">On-going</div>
                        </div>
                        <div class="bg-red-50 p-4 rounded-lg border border-red-200">
                            <div class="text-2xl font-bold text-red-600">{{ analytics.cancelledTransactions }}</div>
                            <div class="text-sm text-red-700">Cancelled</div>
                        </div>
                    </div>

                    <!-- Recent Transactions -->
                    <div class="bg-white border border-gray-200 rounded-lg">
                        <div class="px-6 py-4 border-b border-gray-200">
                            <h3 class="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    <tr v-for="transaction in recentTransactions" :key="transaction.transaction_id || transaction.id">
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {{ transaction.transaction_id || transaction.id }}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {{ transaction.customer_name || transaction.customer }}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                            {{ formatCurrency(transaction.total || transaction.amount) }}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span :class="[
                                                'px-2 py-1 text-xs font-medium rounded',
                                                getStatusColor(transaction.status)
                                            ]">
                                                {{ transaction.status }}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {{ formatDate(transaction.created_at || transaction.due_date) }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Reports Tab -->
                <div v-if="activeTab === 'reports'" class="space-y-6">
                    <div class="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Generate Reports</h3>
                        <div class="space-y-4">
                            <button 
                                @click="generateReport"
                                class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Download Seller Report (CSV)
                            </button>
                            <div class="text-sm text-gray-600">
                                <p>Report includes:</p>
                                <ul class="list-disc list-inside mt-2 space-y-1">
                                    <li>Seller information and analytics</li>
                                    <li>Best selling products</li>
                                    <li>Review summary</li>
                                    <li>Transaction statistics</li>
                                    <li>Revenue breakdown</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Loading Overlay -->
            <div v-if="loading" class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        </div>
    </div>
</template>