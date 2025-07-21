<script setup>
import { ref, computed } from 'vue'
definePageMeta({
    layout: "home",
})

const config = useRuntimeConfig()
const api = config.public.API_LINK
const isPromoVisible = ref(false);
const selectedPromo = ref(null);
const isDeleteVisible = ref(false);
const promoToDelete = ref(null);
const promoToUpdate = ref(null);
const isUpdateVisible = ref(false);
const selectedPromoIds = ref([]);
const searchQuery = ref('');
const statusFilter = ref('');
const discountTypeFilter = ref('');

const getAuthHeaders = () => {
    const accessTokenCookie = useCookie('auth-access-token')
    const token = accessTokenCookie.value

    return token ? {
        Authorization: `Bearer ${token}`
    } : {}
}

const { data: promos, pending: pendingPromos, refresh: refreshPromos } = await useFetch(
    `${api}/api/promos/`,
    {
        server: false,
        headers: computed(() => getAuthHeaders()),
        onResponseError({ response }) {
            console.error('Products API Error:', response.status, response._data);
            if (response.status === 401) {
                navigateTo('/login');
            }
        }
    }
);

const { data: sellers, pending: pendingSellers, refresh: refreshSellers } = await useFetch(
    `${api}/api/sellers/`,
    {
        server: false,
        headers: computed(() => getAuthHeaders()),
        onResponseError({ response }) {
            console.error('Sellers API Error:', response.status, response._data);
            if (response.status === 401) {
                navigateTo('/login');
            }
        }
    }
);

const { data: products, pending: pendingProducts, refresh: refreshProducts } = await useFetch(
    `${api}/api/products/`,
    {
        server: false,
        headers: computed(() => getAuthHeaders()),
        onResponseError({ response }) {
            console.error('Products API Error:', response.status, response._data);
            if (response.status === 401) {
                navigateTo('/login');
            }
        }
    }
);

// If sellers is a single object, convert to array
const sellersArray = computed(() => {
    if (!sellers.value) return [];
    if (Array.isArray(sellers.value)) return sellers.value;
    return [sellers.value];
});
const loading = computed(() => pendingPromos.value || pendingSellers.value || pendingProducts.value);


const newPromo = ref({
    promo_name: "",
    promo_description: "",
    discount_type: "",
    discount_amount: "",
    discount_percentage: "",
    promo_start_date: null,
    promo_end_date: null,
    is_active: "",
    seller_id: "",
    product_id: [],
    created_at: null,
    updated_at: null,
});

async function addPromo() {
    try {
        const formData = new FormData()

        formData.append('promo_name', newPromo.value.promo_name || '')
        formData.append('promo_description', newPromo.value.promo_description || '')
        formData.append('discount_type', newPromo.value.discount_type || '')
        formData.append('discount_amount', newPromo.value.discount_amount || '')
        formData.append('discount_percentage', newPromo.value.discount_percentage || '')
        formData.append(
            'promo_start_date',
            new Date(newPromo.value.promo_start_date).toISOString()
        )

        formData.append(
            'promo_end_date',
            new Date(newPromo.value.promo_end_date).toISOString()
        )


        formData.append('is_active', newPromo.value.is_active || '')
        // Append seller_id (UUID string)
        formData.append('seller_id', newPromo.value.seller_id || '')

        // Append product_id(s) (UUID strings)
        const productIds = Array.isArray(newPromo.value.product_id)
            ? newPromo.value.product_id
            : [newPromo.value.product_id]

        productIds.forEach(id => {
            if (id) formData.append('product_id', id)
        })


        // Debug output
        console.log("Submitting promo:")
        for (const [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`)
        }

        await $fetch(`${api}/api/promos/`, {
            method: 'POST',
            body: formData,
            headers: getAuthHeaders(),
        })

        alert("Promo added successfully")
        closeAddPromoModal()
        await refreshPromos()

        // Reset form
        Object.keys(newPromo.value).forEach(key => newPromo.value[key] = null)
    } catch (error) {
        alert('Failed to add promo.')
        console.error('API error:', error)
        if (error?.data) console.error('Error data:', error.data)
    }
}


async function deletePromo() {
    if (!promoToDelete.value || !promoToDelete.value.promo_id) {
        alert('No promo selected for deletion.');
        return;
    }
    try {
        await $fetch(`${api}/api/promos/${promoToDelete.value.promo_id}/`, {
            method: 'DELETE',
            headers: getAuthHeaders(), // Add Authorization header
        });
        alert('Promo deleted successfully.');
        isDeleteVisible.value = false;
        promoToDelete.value = null;
        await refreshNuxtData();
    } catch (error) {
        alert('Failed to delete promo.');
        console.error('API error:', error.data || error);
    }
}
//working 
async function updatePromo() {
    if (!promoToUpdate.value || !promoToUpdate.value.promo_id) {
        alert('No promo selected for update.');
        return;
    }
    try {
        const formData = new FormData();
        formData.append('promo_name', promoToUpdate.value.promo_name);
        formData.append('promo_description', promoToUpdate.value.promo_description);
    
        formData.append('promo_description', promoToUpdate.value.promo_description)
        formData.append('discount_type', promoToUpdate.value.discount_type)
        formData.append('discount_amount', promoToUpdate.value.discount_amount)
        formData.append('discount_percentage', promoToUpdate.value.discount_percentage)
        formData.append(
            'promo_start_date',
            new Date(promoToUpdate.value.promo_start_date).toISOString()
        )

        formData.append(
            'promo_end_date',
            new Date(promoToUpdate.value.promo_end_date).toISOString()
        )


        formData.append('is_active', promoToUpdate.value.is_active ? 'true' : 'false')

        // Append seller_id (UUID string)
        formData.append('seller_id', promoToUpdate.value.seller_id || '')

        // Append product_id(s) (UUID strings)
        const productIds = Array.isArray(promoToUpdate.value.product_id)
            ? promoToUpdate.value.product_id
            : [promoToUpdate.value.product_id]

        productIds.forEach(id => {
            if (id) formData.append('product_id', id)
        })

        await $fetch(`${api}/api/promos/${promoToUpdate.value.promo_id}/`, {
            method: 'PATCH',
            body: formData,
            headers: getAuthHeaders(), // Only Authorization, NOT Content-Type
        });
        alert('Promo updated successfully.');
        isUpdateVisible.value = false;
        promoToUpdate.value = null;
        await refreshNuxtData();
    } catch (error) {
        alert('Failed to update promo.');
        console.error('API error:', error.data || error);
    }
}
function closeAddPromoModal() {
    resetNewPromo();
    document.getElementById('addPromo')?.classList.add('hidden');
}
function resetNewPromo() {
    newPromo.value = {
        promo_name: "",
        promo_description: "",
        discount_type: "",
        discount_amount: "",
        discount_percentage: "",
        promo_start_date: null,
        promo_end_date: null,
        is_active: "",
        seller_id: "",
        product_id: [],
        created_at: null,
        updated_at: null,
    };
}
//Date
function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    if (isNaN(date)) return dateStr;
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

const filteredPromos = computed(() => {
    let list = promos.value || [];
    if (searchQuery.value) {
        list = list.filter(p =>
            p.promo_name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            p.promo_description?.toLowerCase().includes(searchQuery.value.toLowerCase())
        );
    }
    if (statusFilter.value) {
        list = list.filter(p =>
            statusFilter.value === 'Active' ? p.is_active : !p.is_active
        );
    }
    if (discountTypeFilter.value) {
        list = list.filter(p =>
            p.discount_type === discountTypeFilter.value
        );
    }
    return list;
});

function toggleSelectAll(event) {
    if (event.target.checked) {
        selectedPromoIds.value = promos.value.map(p => p.promo_id);
    } else {
        selectedPromoIds.value = [];
    }
}
async function deleteSelectedPromos() {
    if (selectedPromoIds.value.length === 0) {
        alert('No promos selected.');
        return;
    }
    if (!confirm(`Are you sure you want to delete ${selectedPromoIds.value.length} categor${selectedPromoIds.value.length === 1 ? 'y' : 'ies'}? This action cannot be undone.`)) {
        return;
    }
    try {
        for (const id of selectedPromoIds.value) {
            await $fetch(`${api}api/promos/${id}/`, {
                method: 'DELETE',
            });
        }
        alert('Selected promos deleted successfully.');
        selectedPromoIds.value = [];
        await refreshNuxtData();
    } catch (error) {
        alert('Failed to delete selected promos.');
        console.error('API error:', error.data || error);
    }
}


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
                <button type="button" onclick="document.getElementById('addPromo').classList.remove('hidden')"
                    class="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">
                    <span class="mr-2">+</span> Add Promo
                </button>
            </div>
        </div>

        <div id="addPromo" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/30 hidden">
            <div
                class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
                <h2 class="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Add Promo</h2>
                <form class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block mb-1 font-medium">Promo Name</label>
                            <input type="text" v-model="newPromo.promo_name"
                                class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none"
                                placeholder="Type promo name" />
                        </div>
                        <div>
                            <label class="block mb-1 font-medium">Seller</label>
                            <select v-model="newPromo.seller_id"
                                class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none">
                                <option disabled value="">Select Seller</option>
                                <option v-for="seller in sellersArray" :key="seller.seller_id"
                                    :value="seller.seller_id">
                                    {{ seller.business_name }}
                                </option>
                            </select>
                        </div>
                        <div>
                            <label class="block mb-1 font-medium">Product(s)</label>
                            <select v-model="newPromo.product_id" multiple
                                class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none">
                                <option v-for="product in products" :key="product.product_id"
                                    :value="product.product_id">
                                    {{ product.product_name }}
                                </option>
                            </select>
                        </div>
                        <div>
                            <label class="block mb-1 font-medium">Promo Description</label>
                            <textarea v-model="newPromo.promo_description"
                                class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none"
                                rows="3" placeholder="Write promo description here"></textarea>
                        </div>
                        <div>
                            <label class="block mb-1 font-medium">Promo Status</label>
                            <select v-model="newPromo.is_active"
                                class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none">
                                <option disabled value="">Select Category Status</option>
                                <option :value="false">Inactive</option>
                                <option :value="true">Active</option>
                            </select>
                        </div>
                        <div>
                            <label class="block mb-1 font-medium">Discount Type</label>
                            <select v-model="newPromo.discount_type"
                                class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none">
                                <option disabled value="">Select Discount Type</option>
                                <option value="PERCENTAGE">Percentage</option>
                            </select>
                        </div>
                        <div>
                            <label class="block mb-1 font-medium">Discount Value</label>
                            <input type="number" v-model="newPromo.discount_amount"
                                class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none"
                                placeholder="Type discount value" />
                        </div>
                        <div>
                            <label class="block mb-1 font-medium">Discount Percentage</label>
                            <input type="number" v-model="newPromo.discount_percentage"
                                class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none"
                                placeholder="Type discount percentage" />
                        </div>
                        <div>
                            <label class="block mb-1 font-medium">Start Date</label>
                            <div class="relative max-w-sm">
                                <div class="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                                    <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
                                    </svg>
                                </div>
                                <input type="date" v-model="newPromo.promo_start_date"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    placeholder="Select date" />
                            </div>
                        </div>
                        <div>
                            <label class="block mb-1 font-medium">End Date</label>
                            <div class="relative max-w-sm">
                                <div class="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                                    <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
                                    </svg>
                                </div>
                                <input type="date" v-model="newPromo.promo_end_date"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    placeholder="Select date" />
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-end space-x-2 mt-6">
                        <button type="button" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                            @click="addPromo">Add
                            Promo</button>
                        <button type="button" onclick="document.getElementById('addPromo').classList.add('hidden')"
                            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
        <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div class="flex gap-2 flex-wrap">
                <input type="text" v-model="searchQuery" placeholder="Search"
                    class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <select v-model="statusFilter"
                    class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>
                <select
                    class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Discount Type</option>
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="FIXED-AMOUNT">Fixed(Not yet implemented)</option>
                </select>
            </div>
        </div>
        <div class="flex justify-end mb-4">
            <button class="px-4 py-2 rounded 
      transition 
      font-medium
      mb-4
      bg-red-600 text-white hover:bg-red-700
      disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                :disabled="selectedPromoIds.length === 0" @click="deleteSelectedPromos">
                Delete {{ selectedPromoIds.length }} item<span v-if="selectedPromoIds.length !== 1">s</span>
            </button>
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
                                            <input id="checkbox-all" type="checkbox" @click.stop
                                                :checked="selectedPromoIds.length === promos.length && promos.length > 0"
                                                @change="toggleSelectAll"
                                                class="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600" />
                                            <label for="checkbox-all" class="sr-only">checkbox</label>
                                        </div>
                                    </th>
                                    <th
                                        class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                        Promo ID</th>
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
                                        Created At</th>
                                    <th
                                        class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                        Updated At</th>
                                    <th
                                        class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                        Status</th>
                                    <th
                                        class="p-4 text-xs font-medium text-center text-gray-500 uppercase dark:text-gray-400">
                                        Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="promo in filteredPromos" :key="promo.promo_id"
                                    @click="selectedPromo = promo; isPromoVisible = true"
                                    class="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">

                                    <td class="w-4 p-4">
                                        <div class="flex items-center">
                                            <input :id="`checkbox-${promo.promo_id}`" type="checkbox"
                                                :value="promo.promo_id" v-model="selectedPromoIds" @click.stop
                                                class="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600" />
                                            <label :for="`checkbox-${promo.promo_id}`" class="sr-only">checkbox</label>
                                        </div>
                                    </td>

                                    <td
                                        class="p-4 text-sm font-semibold text-gray-900 whitespace-nowrap dark:text-white">
                                        {{ promo.promo_id }}</td>
                                    <td
                                        class="p-4 text-sm font-semibold text-gray-900 whitespace-nowrap dark:text-white">
                                        {{ promo.promo_name }}</td>
                                    <td
                                        class="p-4 text-sm font-semibold text-gray-900 whitespace-nowrap dark:text-white">
                                        {{ promo.promo_description }}</td>
                                    <td
                                        class="p-4 text-sm font-semibold text-gray-900 whitespace-nowrap dark:text-white">
                                        {{ promo.discount_type }}</td>
                                    <td
                                        class="p-4 text-sm font-semibold text-gray-900 whitespace-nowrap dark:text-white">
                                        {{ promo.promo_start_date }}</td>
                                    <td
                                        class="p-4 text-sm font-semibold text-gray-900 whitespace-nowrap dark:text-white">
                                        {{ promo.promo_end_date }}</td>
                                    <td
                                        class="p-4 text-sm font-semibold text-gray-900 whitespace-nowrap dark:text-white">
                                        {{ promo.created_at }}</td>
                                    <td
                                        class="p-4 text-sm font-semibold text-gray-900 whitespace-nowrap dark:text-white">
                                        {{ promo.updated_at }}</td>
                                    <td :class="[
                                        'p-4 text-sm font-semibold whitespace-nowrap',
                                        promo.is_active
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-red-600 dark:text-red-400'
                                    ]">
                                        {{ promo.is_active ? 'Active' : 'Inactive' }}
                                    </td>
                                    <td class="p-4 space-x-2 whitespace-nowrap">
                                        <div class="flex justify-center space-x-2">
                                            <button type="button"
                                                @click.stop="isUpdateVisible = true; promoToUpdate = promo"
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
                                                @click.stop="isDeleteVisible = true; promoToDelete = promo"
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
                            <div id="showPromo" v-if="isPromoVisible"
                                class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/30">
                                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto"
                                    @click.stop>
                                    <div class="flex flex-col gap-1 mb-4">
                                        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                                            {{ selectedPromo?.promo_name }}
                                        </h2>
                                        <h1 class="text-base font-medium text-gray-900 dark:text-white">
                                            {{ selectedPromo?.promo_id }}
                                        </h1>
                                    </div>
                                    <form class="space-y-4">
                                        <div class="grid grid-cols-2 gap-4">
                                            <div>
                                                <label class="block mb-1 font-medium">Seller</label>
                                                <textarea rows="3" disabled
                                                    class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300 resize-none">{{ selectedPromo?.seller_id }}</textarea>
                                            </div>
                                            <div>
                                                <label class="block mb-1 font-medium">Product</label>
                                                <textarea rows="3" disabled
                                                    class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300 resize-none">{{ selectedPromo?.product_id }}</textarea>
                                            </div>
                                            <div>
                                                <label class="block mb-1 font-medium">Promo Description</label>
                                                <textarea rows="3" disabled
                                                    class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300 resize-none">{{ selectedPromo?.promo_description }}</textarea>
                                            </div>
                                            <div>
                                                <label class="block mb-1 font-medium">Promo Discount Type</label>
                                                <textarea rows="3" disabled
                                                    class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300 resize-none">{{ selectedPromo?.discount_type }}</textarea>
                                            </div>
                                            <div>
                                                <label class="block mb-1 font-medium">Discount Amount</label>
                                                <textarea rows="3" disabled
                                                    class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300 resize-none">{{ selectedPromo?.discount_amount }}</textarea>
                                            </div>
                                            <div>
                                                <label class="block mb-1 font-medium">Discount Percentage</label>
                                                <textarea rows="3" disabled
                                                    class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300 resize-none">{{ selectedPromo?.discount_percentage }}</textarea>
                                            </div>
                                            <div>
                                                <label class="block mb-1 font-medium">Promo Status</label>
                                                <div :class="[
                                                    'w-full px-3 py-2 rounded bg-gray-100 border border-gray-300',
                                                    selectedPromo?.is_active
                                                        ? 'text-green-600 dark:text-green-400 font-semibold'
                                                        : 'text-red-600 dark:text-red-400 font-semibold'
                                                ]">
                                                    {{ selectedPromo?.is_active ? 'Active' : 'Inactive' }}
                                                </div>
                                            </div>
                                            <!-- Dates Section -->
                                            <div class="col-span-2">
                                                <h2 class="text-base font-semibold mb-2 text-gray-900 dark:text-white">
                                                    Dates</h2>
                                                <div class="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label class="block mb-1 font-medium">Promo Start Date</label>
                                                        <textarea rows="2" disabled
                                                            class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300 resize-none">{{ selectedPromo?.promo_start_date }}</textarea>
                                                    </div>
                                                    <div>
                                                        <label class="block mb-1 font-medium">Promo End Date</label>
                                                        <textarea rows="2" disabled
                                                            class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300 resize-none">{{ selectedPromo?.promo_end_date }}</textarea>
                                                    </div>
                                                    <div>
                                                        <label class="block mb-1 font-medium">Created at</label>
                                                        <textarea rows="2" disabled
                                                            class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300 resize-none">{{ formatDate(selectedPromo?.created_at) }}</textarea>
                                                    </div>
                                                    <div>
                                                        <label class="block mb-1 font-medium">Updated at</label>
                                                        <textarea rows="2" disabled
                                                            class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300 resize-none">{{ formatDate(selectedPromo?.updated_at) }}</textarea>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="flex justify-end space-x-2 mt-6">
                                            <button type="button" @click="isPromoVisible = false; selectedPromo = null"
                                                class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </table>
                        <div v-if="isDeleteVisible" id="deleteModal"
                            class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/30">
                            <div @click.stop class="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md shadow-lg">
                                <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                                    Confirm Deletion</h2>
                                <p class="text-gray-600 dark:text-gray-300 mb-6">Are you sure you
                                    want to delete this promo?<br>
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
                        <div id="updateModal" v-if="isUpdateVisible"
                            class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/30">
                            <div @click.stop class="bg-white dark:bg-gray-800 p-6 rounded shadow-lg max-w-xl w-full">
                                <h2 class="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                                    Update Promo
                                </h2>
                                <form class="space-y-4" @submit.prevent="updatePromo">
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <label class="block mb-1 font-medium">Promo Name</label>
                                            <input type="text" v-model="promoToUpdate.promo_name"
                                                class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300 resize-none"
                                                :placeholder="promoToUpdate?.promo_name || 'Promo Name'">
                                        </div>
                                        <div>
                                            <label class="block mb-1 font-medium">Seller</label>
                                            <select v-model="newPromo.seller_id"
                                                class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none">
                                                <option disabled value="">Select Seller</option>
                                                <option v-for="seller in sellersArray" :key="seller.seller_id"
                                                    :value="seller.seller_id">
                                                    {{ seller.business_name }}
                                                </option>
                                            </select>
                                        </div>
                                        <div>
                                            <label class="block mb-1 font-medium">Product(s)</label>
                                            <select v-model="newPromo.product_id" multiple
                                                class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none">
                                                <option v-for="product in products" :key="product.product_id"
                                                    :value="product.product_id">
                                                    {{ product.product_name }}
                                                </option>
                                            </select>
                                        </div>
                                        <div>
                                            <label class="block mb-1 font-medium">Promo Status</label>
                                            <select v-model="promoToUpdate.is_active"
                                                class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300"
                                                :class="promoToUpdate.is_active
                                                    ? 'text-green-600 dark:text-green-400 font-semibold'
                                                    : 'text-red-600 dark:text-red-400 font-semibold'">
                                                <option :value="true">Active</option>
                                                <option :value="false">Inactive</option>
                                            </select>
                                        </div>
                                        <div class="col-span-2">
                                            <label class="block mb-1 font-medium">Promo Description</label>
                                            <textarea v-model="promoToUpdate.promo_description" rows="3"
                                                class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300 resize-none"
                                                :placeholder="promoToUpdate?.promo_description || 'Promo Description'"></textarea>
                                        </div>
                                        <div>
                                            <label class="block mb-1 font-medium">Promo Discount Type</label>
                                            <input type="text" v-model="promoToUpdate.discount_type"
                                                class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300"
                                                :placeholder="promoToUpdate?.discount_type || 'Discount Type'">
                                        </div>
                                        <div>
                                            <label class="block mb-1 font-medium">Discount Amount</label>
                                            <input type="number" v-model="promoToUpdate.discount_amount"
                                                class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300"
                                                :placeholder="promoToUpdate?.discount_amount || 'Discount Amount'">
                                        </div>
                                        <div>
                                            <label class="block mb-1 font-medium">Discount Percentage</label>
                                            <input type="number" v-model="promoToUpdate.discount_percentage"
                                                class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300"
                                                :placeholder="promoToUpdate?.discount_percentage || 'Discount Percentage'">
                                        </div>
                                        <div>
                                            <label class="block mb-1 font-medium">Promo Start Date</label>
                                            <input type="date" v-model="promoToUpdate.promo_start_date"
                                                class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300">
                                        </div>
                                        <div>
                                            <label class="block mb-1 font-medium">Promo End Date</label>
                                            <input type="date" v-model="promoToUpdate.promo_end_date"
                                                class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300">
                                        </div>
                                    </div>
                                    <div class="flex justify-between mt-6">
                                        <button type="submit"
                                            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Update
                                            Promo</button>
                                        <button @click="isUpdateVisible = false"
                                            class="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Close</button>
                                    </div>
                                </form>
                            </div>
                        </div>
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