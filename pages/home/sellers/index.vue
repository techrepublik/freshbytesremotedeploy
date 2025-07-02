<script setup>
    definePageMeta({
        layout: "home",
    });

    const config = useRuntimeConfig();
    const api = config.public.API_LINK; // API HERE

  // Filters
  const search = ref('')
  const selectedRole = ref('')
  const selectedStatus = ref('')

  // Compose query string for API
  const queryString = computed(() => {
    const params = new URLSearchParams()
    if (search.value) params.append('search', search.value)
    if (selectedRole.value) params.append('role', selectedRole.value)
    if (selectedStatus.value) params.append('status', selectedStatus.value)
    return params.toString() ? `?${params.toString()}` : ''
  })

  // Fetch sellers from your API with filters
  const { data, pending, error, refresh } = await useFetch(
    () => `${api}/sellers/${queryString.value}`,
    { server: false }
  )

  const loading = computed(() => pending.value);

  const sellers = ref([])

  watch(data, (val) => {
    if (val) {
      sellers.value = (Array.isArray(val) ? val : val.sellers || []).map(u => ({
        seller_id: s.seller_id,
        seller_name: s.seller_name,
        avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.seller_name)}`,
        seller_email: u.seller_email,
        role: s.is_admin ? 'Admin' : (s.is_seller ? 'Seller' : 'User'),
        status: s.is_active ? 'Active' : 'Inactive',
        selected: false
      }))
    }
  }, { immediate: true })

  // Refetch sellers when filters change
  watch([search, selectedRole, selectedStatus], () => {
    refresh()
  })

  const allSelected = computed({
    get: () => sellers.value.length > 0 && sellers.value.every(s => s.selected),
    set: (val) => {
      sellers.value.forEach(s => s.selected = val)
    }
  })

  const anySelected = computed(() => sellers.value.some(s => s.selected))
  const selectedCount = computed(() => sellers.value.filter(s => s.selected).length)

  function editSeller(seller) {
    alert('Edit seller: ' + seller.seller_id)
  }
  function deleteSeller(seller) {
    if (confirm(`Are you sure you want to delete seller "${seller.seller_name}"?`)) {
      // Your delete logic here
      alert('Deleted seller: ' + seller.seller_id)
    }
  }
  function deleteSelectedSellers() {
    if (confirm(`Are you sure you want to delete ${selectedCount.value} selected seller(s)?`)) {
      // Your bulk delete logic here
      alert('Deleted sellers: ' + sellers.value.filter(s => s.selected).map(s => s.seller_id).join(', '))
      // Optionally remove them from the list:
      sellers.value = sellers.value.filter(s => !s.selected)
    }
  }

  async function toggleSellerActive(seller) {
    const newStatus = seller.status === 'Active' ? 'Inactive' : 'Active'
    try {
      // Call your API to update the seller's status
      await $fetch(`${api}/sellers/${seller.seller_id}/status/`, {
        method: 'PATCH',
        body: { is_active: newStatus === 'Active' }
      })
      // Update local status
      seller.status = newStatus
    } catch (err) {
      alert('Failed to update status')
    }
  }

  const showSellerAddModal = ref(false)
  const sellerAddLoading = ref(false)
  const sellerAddForm = ref({
      seller_name: '',
      first_name: '',
      last_name: '',
      seller_email: '',
      seller_password: '',
      seller_phone: '',
      seller_address: '',
      avatar: null, // File object
  })
  const sellerAddAvatarPreview = ref(null)

  function openSellerAddModal() {
      showSellerAddModal.value = true
      Object.assign(sellerAddForm.value, {
      seller_name: '',
      first_name: '',
      last_name: '',
      seller_email: '',
      seller_password: '',
      seller_phone: '',
      seller_address: '',
      avatar: null,
      })
      sellerAddAvatarPreview.value = null
  }

  function closeSellerAddModal() {
      showSellerAddModal.value = false
  }

  async function submitSellerAdd() {
      sellerAddLoading.value = true
      try {
      const formData = new FormData()
      for (const key in sellerAddForm.value) {
          if (sellerAddForm.value[key]) {
          formData.append(key, sellerAddForm.value[key])
          }
      }
      // API endpoint for adding seller, adjust as needed
      await $fetch(`${api}/sellers/`, {
          method: 'POST',
          body: formData,
      })
      closeSellerAddModal()
      refresh() // Refresh seller list
      } catch (err) {
      alert('Failed to add seller')
      } finally {
      sellerAddLoading.value = false
      }
  }

  function handleAvatarChange(e) {
    const file = e.target.files[0]
    sellerAddForm.value.avatar = file
    if (file) {
    const reader = new FileReader()
    reader.onload = (ev) => {
        sellerAddAvatarPreview.value = ev.target.result
    }
    reader.readAsDataURL(file)
    } else {
    sellerAddAvatarPreview.value = null
    }
  }

  import SellerAddModal from '~/components/SellerAddModal.vue'

  function handleSellerAddSuccess() { refresh() }

  const showTooltip = ref(false);
    
  const currentPage = ref(1);
  const pageSize = 20; // or whatever your page size is

  const paginatedSellers = computed(() => {
    const start = (currentPage.value - 1) * pageSize;
    return sellers.value.slice(start, start + pageSize);
  });
  const total = computed(() => sellers.value.length);
  const totalPages = computed(() => Math.ceil(total.value / pageSize));

  function goToPage(page) {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  }

</script>

<template>
  <div class="bg-white w-full h-full absolute top-0 left-0 z-10 flex items-center justify-center" v-if="loading">

    <div role="status">
      <svg aria-hidden="true" class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-green-600"
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
  <nav class="flex mb-2" aria-label="Breadcrumb">
    <ol class="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
      <li class="inline-flex items-center">
        <NuxtLink to="/home"
          class="inline-flex items-center text-sm font-medium text-gray-800 hover:text-green-800 dark:text-gray-400 dark:hover:text-white">
          <svg class="w-3 h-3 me-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor"
            viewBox="0 0 20 20">
            <path
              d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
          </svg>
          Home
        </NuxtLink>
      </li>
      <li>
        <div class="flex items-center">
          <svg class="rtl:rotate-180 w-3 h-3 text-gray-600 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
            fill="none" viewBox="0 0 6 10">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="m1 9 4-4-4-4" />
          </svg>
          <a href="#"
            class="ms-1 text-sm font-medium text-gray-800 hover:text-green-800 md:ms-2 dark:text-gray-400 dark:hover:text-white">Sellers</a>
        </div>
      </li>
    </ol>
  </nav>
  <!-- Header -->
  <div class="flex justify-between items-center mt-3 mb-3">
    <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
      All Sellers
    </h1>
    <button
      class="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
      @click="openSellerAddModal"
    >
      <span class="mr-2">+</span> Add new seller
    </button>
  </div>
  <!-- Add Product Modal -->
  <SellerAddModal
    :show="showSellerAddModal"
    @close="closeSellerAddModal"
    @success="handleSellerAddSuccess"
  />
  <!-- Filters -->
  <div class="flex items-center justify-between mb-3">
    <!-- Filters (left side) -->
    <div class="flex flex-wrap gap-2">
      <input v-model="search" type="text" placeholder="Search for sellers"
        class="px-4 py-2 h-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
      <select v-model="selectedRole"
        class="px-4 py-2 pr-8 h-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none">
        <option value="">Role</option>
        <option>Admin</option>
        <option>Seller</option>
        <option>User</option>
      </select>
      <select v-model="selectedStatus"
        class="px-4 py-2 h-10 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none">
        <option value="">Status</option>
        <option>Active</option>
        <option>Inactive</option>
      </select>
      <!-- Clear Button -->
      <button class="px-4 py-2 h-10 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition" @click="
        search = '';
      selectedRole = '';
      selectedStatus = '';
      ">
        Clear
      </button>
    </div>
    <!-- Delete Button (right side) -->
    <button
      class="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition disabled:opacity-50 mt-2"
      :disabled="!sellers?.some(p => p.selected)" @click="showDeleteSelectedModal = true">
      Delete {{sellers?.filter(p => p.selected).length}} item<span
        v-if="sellers?.filter(p => p.selected).length > 1">s</span>
    </button>
  </div>

  <!-- Seller Table -->
  <div class="overflow-x-auto bg-white rounded-lg">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-4 py-3 w-12 text-center align-middle">
            <input
              class="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
              type="checkbox" v-model="allSelected" />
          </th>
          <th class="p-4 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
          <th class="p-4 text-left text-xs font-medium text-gray-500 uppercase">Avatar & Name</th>
          <th class="p-4 text-left text-xs font-medium text-gray-500 uppercase">User Email</th>
          <th class="p-4 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
          <th class="p-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
          <th class="p-4 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="seller in sellers" :key="seller.seller_id">
          <td class="px-4 py-3">
            <input
              class="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
              type="checkbox" v-model="seller.selected" />
          </td>
          <td class="px-4 py-3 font-semibold">{{ seller.seller_id }}</td>
          <td class="px-4 py-3">
            <div class="flex items-center">
              <img :src="seller.avatar" class="w-8 h-8 rounded-full mr-3" />
              <span class="font-semibold">{{ seller.seller_name }}</span>
            </div>
          </td>
          <td class="px-4 py-3 font-semibold">{{ seller.seller_email }}</td>
          <td class="px-4 py-3">
            <span v-if="seller.role === 'Admin'"
              class="px-4 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">Admin</span>
            <span v-else-if="seller.role === 'Seller'"
              class="px-4 py-1 text-xs font-medium bg-purple-100 text-green-800 rounded">Seller</span>
            <span v-else class="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">User</span>
          </td>
          <td class="p-4 text-base font-medium whitespace-nowrap">
            <div class="flex items-center">
              <label class="inline-flex items-center cursor-pointer" @click.stop>
                <input
                  type="checkbox"
                  class="sr-only peer"
                  :checked="seller.status === 'Active'"
                  @change.stop="toggleSellerActive(seller)"
                />
                <div
                  class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600 dark:peer-checked:bg-green-600">
                </div>
                <span class="ml-3 text-sm font-medium" :class="seller.status === 'Active' ? 'text-green-600' : 'text-red-600'">
                  {{ seller.status }}
                </span>
              </label>
            </div>
          </td>
          <td class="p-4  space-x-2 whitespace-nowrap">
              <div class="flex justify-center items-center space-x-2">
                  
                  <button type="button" @click.stop="openUpdateModal(product)"
                      class="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-[#29000] hover:text-white rounded-lg bg-primary-700 hover:bg-green-600 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                      <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path
                              d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z">
                          </path>
                          <path fill-rule="evenodd"
                              d="M2 6a2 2 0 002-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                              clip-rule="evenodd"></path>
                      </svg>
                      Update
                  </button>
                  <button type="button" @click.stop="openDeleteModal(product)"
                      class="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:ring-red-300 dark:focus:ring-red-900">
                      <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clip-rule="evenodd" />
                      </svg>
                      Delete item

                  </button>
              </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <!-- Divider -->
  <hr class="my-4 border-gray-200 dark:border-gray-700">

  <!-- Pagination -->
  <div class="flex items-center justify-between mb-4">
  <!-- Pagination Controls (left, arrows and page numbers) -->
  <div>
      <ul class="inline-flex items-center -space-x-px">
      <li>
          <button
          class="flex items-center justify-center h-10 w-10 ms-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:border-gray-500 hover:text-neutral-950 disabled:opacity-50"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
          >
          <span class="sr-only">Previous</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="4" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          </button>
      </li>
      <li v-for="page in Math.min(totalPages, 5)" :key="page">
          <button
          class="flex items-center justify-center h-10 w-10 leading-tight border border-gray-300
              hover:bg-gray-100 hover:text-green-700
              focus:z-20 focus:ring-2 focus:ring-green-500
              transition"
          :class="{
              'bg-green-50 text-green-600 border-green-400': currentPage === page,
              'bg-white text-gray-500': currentPage !== page
          }"
          @click="goToPage(page)"
          >
          {{ page }}
          </button>
      </li>
      <li>
          <button
          class="flex items-center justify-center h-10 w-10 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:border-gray-500 hover:text-neutral-950 disabled:opacity-50"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
          >
          <span class="sr-only">Next</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="4" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          </button>
      </li>
      <!-- Showing Info -->
      <li class="text-sm text-gray-600 ml-4">
          Showing <span class="font-semibold">{{ (currentPage - 1) * pageSize + 1 }}</span>
          -
          <span class="font-semibold">{{ Math.min(currentPage * pageSize, total) }}</span>
          of <span class="font-semibold">{{ total }}</span>
      </li>
      </ul>
  </div>
  <!-- Green Buttons (right) -->
  <div class="flex items-center space-x-6">
      <div class="flex items-center space-x-2">
      <button
          class="flex items-center px-6 py-2 bg-green-700 text-white rounded-xl font-semibold text-base shadow hover:bg-green-800 transition disabled:opacity-50"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
      >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" stroke-width="4" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Previous
      </button>
      <button
          class="flex items-center px-6 py-2 bg-green-700 text-white rounded-xl font-semibold text-base shadow hover:bg-green-800 transition disabled:opacity-50"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
      >
          Next
          <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" stroke-width="4" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
      </button>
      </div>
  </div>
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
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 4v16m8-8H4" />
              </svg>
          </button>
      </div>
  </footer>
</template>